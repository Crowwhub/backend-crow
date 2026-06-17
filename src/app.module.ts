import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma /prisma.module';
import { FeedModule } from './feed/feed.module';
import { SwipesModule } from './swipes/swipes.module';
import { MatchesModule } from './matches/matches.module';
import { ChatModule } from './chat/chat.module';
import { UsersModule } from './users/users.module';
import { ProfileLikesModule } from './profile-likes/profile-likes.module';
import { HomeConfigModule } from './config/config.module';
import { ConfigModule } from '@nestjs/config';
import { NotificationsModule } from './notifications/notifications.module';
import { MailModule } from './mail/mail.module';
import { DigestModule } from './digest/digest.module';
import { LastActiveInterceptor } from './common/interceptors/last-active.interceptor';




@Module({
  imports: [AuthModule , PrismaModule, FeedModule, SwipesModule, MatchesModule, ChatModule, UsersModule, ProfileLikesModule, HomeConfigModule, ConfigModule.forRoot({
    isGlobal: true,
  }), ScheduleModule.forRoot(), NotificationsModule, MailModule, DigestModule],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_INTERCEPTOR, useClass: LastActiveInterceptor },
  ],
})
export class AppModule {}
