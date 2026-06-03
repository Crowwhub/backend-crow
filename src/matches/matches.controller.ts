import { Controller, Get, Delete, Param, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { MatchesService } from './matches.service';

@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getMyMatches(@Req() req: { user: { sub: string } }) {
    return this.matchesService.getUserMatches(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':matchId')
  async deleteMatch(@Param('matchId') matchId: string) {
    return this.matchesService.deleteMatch(matchId);
  }
}
