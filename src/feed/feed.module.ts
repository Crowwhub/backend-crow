import { Module } from '@nestjs/common';
import { FeedService } from './feed.service';
import { FeedController } from './feed.controller';
import { PrismaService } from '../prisma /prisma.service';
import { AuthModule } from '../auth/auth.module'; // ✅ import AuthModule


@Module({
  imports: [AuthModule],
  controllers: [FeedController],
  providers: [FeedService , PrismaService],
})
export class FeedModule {}
