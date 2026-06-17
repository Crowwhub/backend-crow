import { Inject, Injectable, Logger } from '@nestjs/common';
import { MAIL_PROVIDER } from './mail.types';
import type { MailProvider, SendEmailResult } from './mail.types';
import { DigestSummary, renderDigestEmail } from './templates/digest.template';

/**
 * Application-facing mail API. Renders templates and delegates raw delivery to
 * the configured MailProvider. Keeping rendering here (not in the provider)
 * means every provider sends identical email content.
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(
    @Inject(MAIL_PROVIDER) private readonly provider: MailProvider,
  ) {}

  /** Render + send the activity digest. Throws on delivery failure. */
  async sendDigest(to: string, summary: DigestSummary): Promise<SendEmailResult> {
    const email = renderDigestEmail(summary);
    const result = await this.provider.send({ to, ...email });
    this.logger.log(
      `Digest sent to ${to} (${summary.total} items, msg=${result.messageId ?? 'n/a'})`,
    );
    return result;
  }
}
