import { Module } from '@nestjs/common';
import { SwipesService } from './swipes.service';
import { SwipesController } from './swipes.controller';
import {PrismaService} from '../prisma /prisma.service';

@Module({
  controllers: [SwipesController],
  providers: [SwipesService , PrismaService],
})
export class SwipesModule {}
