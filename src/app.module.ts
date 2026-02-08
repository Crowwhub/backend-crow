import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma /prisma.module';
import { FeedModule } from './feed/feed.module';
import { SwipesModule } from './swipes/swipes.module';
import { MatchesModule } from './matches/matches.module';
import { ChatModule } from './chat/chat.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';




@Module({
  imports: [AuthModule , PrismaModule, FeedModule, SwipesModule, MatchesModule, ChatModule, UsersModule, ConfigModule.forRoot({
    isGlobal: true,
  })],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
