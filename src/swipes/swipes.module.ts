import { Module } from '@nestjs/common';
import { SwipesService } from './swipes.service';
import { SwipesController } from './swipes.controller';
import {PrismaService} from '../prisma /prisma.service';
import { AuthModule } from '../auth/auth.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
   imports: [AuthModule, NotificationsModule],
  controllers: [SwipesController],
  providers: [SwipesService , PrismaService],
})
export class SwipesModule {}
