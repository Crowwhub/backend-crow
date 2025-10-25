import { Controller, Get, Delete, Param , UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { MatchesService } from './matches.service';

@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @UseGuards(JwtAuthGuard)
  @Get(':userId')
  async getusermatches(@Param('userId') userId : string){
    return this.matchesService.getUserMatches (userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':matchId')
  async deletematch (@Param('matchId') matchId : string){
    return this.matchesService.deleteMatch (matchId);
  }

}
