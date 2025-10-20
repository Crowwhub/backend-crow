import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma /prisma.module';
import { FeedModule } from './feed/feed.module';
import { SwipesModule } from './swipes/swipes.module';
import { SwipesModule } from './swipes/swipes.module';


@Module({
  imports: [AuthModule , PrismaModule, FeedModule, SwipesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
