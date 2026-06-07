import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ConfigService } from './config.service';

// GET /config — home bootstrap: swipe streak + the user's matches (+ count).
@Controller('config')
@UseGuards(JwtAuthGuard)
export class ConfigController {
  constructor(private readonly config: ConfigService) {}

  @Get()
  get(@Req() req: { user: { sub: string } }) {
    return this.config.getConfig(req.user.sub);
  }
}
