// Injection token + contract for a pluggable email provider. Swapping Resend
// for SES/SMTP later means writing a new class that implements MailProvider and
// changing one binding in MailModule — nothing else in the app changes.
export const MAIL_PROVIDER = 'MAIL_PROVIDER';

export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export interface SendEmailResult {
  /** Provider-side message id, when available (e.g. Resend id). */
  messageId?: string;
}

export interface MailProvider {
  /**
   * Send a single email. Implementations should throw on failure so the caller
   * (MailService) can record the error and let the digest retry next cycle.
   */
  send(input: SendEmailInput): Promise<SendEmailResult>;
}
