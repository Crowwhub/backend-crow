import { Module } from '@nestjs/common';
import { ConfigController } from './config.controller';
import { ConfigService } from './config.service';
import { PrismaService } from '../prisma /prisma.service';
import { AuthModule } from '../auth/auth.module';
import { MatchesModule } from '../matches/matches.module';

// Named HomeConfigModule to avoid colliding with @nestjs/config's ConfigModule.
@Module({
  imports: [AuthModule, MatchesModule],
  controllers: [ConfigController],
  providers: [ConfigService, PrismaService],
})
export class HomeConfigModule {}
