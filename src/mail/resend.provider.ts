import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import {
  MailProvider,
  SendEmailInput,
  SendEmailResult,
} from './mail.types';

/**
 * Resend-backed email provider with bounded in-call retry + exponential backoff.
 * This handles transient failures (network blips, 429/5xx) within a single send;
 * persistent failures bubble up so the digest can retry on its next 6-hourly run.
 */
@Injectable()
export class ResendMailProvider implements MailProvider {
  private readonly logger = new Logger(ResendMailProvider.name);
  private readonly resend: Resend | null;
  private readonly from: string;
  private readonly maxAttempts: number;

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string>('RESEND_API_KEY');
    this.from =
      this.config.get<string>('MAIL_FROM') ?? 'CrowHub <noreply@crowhub.dating>';
    this.maxAttempts = Number(this.config.get('MAIL_MAX_ATTEMPTS') ?? 3);

    if (!apiKey) {
      this.logger.warn(
        'RESEND_API_KEY not set — email sending is disabled (sends will throw).',
      );
      this.resend = null;
    } else {
      this.resend = new Resend(apiKey);
    }
  }

  async send(input: SendEmailInput): Promise<SendEmailResult> {
    if (!this.resend) {
      throw new Error('Resend is not configured (missing RESEND_API_KEY).');
    }

    let lastError: Error | undefined;
    for (let attempt = 1; attempt <= this.maxAttempts; attempt++) {
      try {
        const { data, error } = await this.resend.emails.send({
          from: this.from,
          to: input.to,
          subject: input.subject,
          html: input.html,
          text: input.text,
        });
        if (error) throw new Error(error.message);
        return { messageId: data?.id };
      } catch (err) {
        lastError = err as Error;
        this.logger.warn(
          `Resend send attempt ${attempt}/${this.maxAttempts} to ${input.to} failed: ${lastError.message}`,
        );
        if (attempt < this.maxAttempts) {
          // Exponential backoff: 500ms, 1s, 2s, …
          await sleep(500 * 2 ** (attempt - 1));
        }
      }
    }
    throw lastError ?? new Error('Email send failed');
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
