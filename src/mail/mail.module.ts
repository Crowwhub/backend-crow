import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { ResendMailProvider } from './resend.provider';
import { MAIL_PROVIDER } from './mail.types';

// To swap providers, change the `useClass` below to a different MailProvider
// implementation (e.g. SesMailProvider, SmtpMailProvider). Nothing else changes.
@Module({
  providers: [
    MailService,
    { provide: MAIL_PROVIDER, useClass: ResendMailProvider },
  ],
  exports: [MailService],
})
export class MailModule {}
