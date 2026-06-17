import { Module } from '@nestjs/common';
import { DigestService } from './digest.service';
import { DigestController } from './digest.controller';
import { MailModule } from '../mail/mail.module';

// PrismaModule is @Global; ScheduleModule.forRoot() is registered in AppModule.
@Module({
  imports: [MailModule],
  controllers: [DigestController],
  providers: [DigestService],
  exports: [DigestService],
})
export class DigestModule {}
