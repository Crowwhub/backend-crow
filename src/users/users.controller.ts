import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateMeDto } from './dto/update-me.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  getMe(@Req() req) {
    return this.userService.getMe(req.user.sub);
  }

  /**
   * Partial profile update — used by all onboarding steps and the /profile page.
   * Send any subset of profile fields; the server merges into the existing user.
   */
  @Patch('me')
  updateMe(@Req() req, @Body() dto: UpdateMeDto) {
    return this.userService.updateMe(req.user.sub, dto);
  }

  /**
   * Final step in the onboarding funnel. Validates required fields are set,
   * then flips onboardingComplete to true.
   */
  @Post('onboarding/complete')
  completeOnboarding(@Req() req) {
    return this.userService.completeOnboarding(req.user.sub);
  }
}
