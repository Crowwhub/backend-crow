import { Module } from '@nestjs/common';
import { ProfileLikesController } from './profile-likes.controller';
import { ProfileLikesService } from './profile-likes.service';
import { PrismaService } from '../prisma /prisma.service';
import { AuthModule } from '../auth/auth.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [AuthModule, NotificationsModule],
  controllers: [ProfileLikesController],
  providers: [ProfileLikesService, PrismaService],
})
export class ProfileLikesModule {}
