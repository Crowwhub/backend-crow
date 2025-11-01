import { Body, Controller, Get, Put, UseGuards, Req } from "@nestjs/common";
import { UserService } from "./users.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

import { UpdateDomainDto } from "./dto/update-domian.dto";
import { UpdateSkillsDto } from "./dto/update-skills.dto";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { UpdatePurposeDto } from "./dto/update-purpose.dto";

@Controller("users")
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get("me")
  getMe(@Req() req) {
    return this.userService.getMe(req.user.sub);
  }

  @Put("onboarding/domain")
  updateDomain(@Req() req, @Body() dto: UpdateDomainDto) {
    return this.userService.updateDomain(req.user.sub, dto);
  }

  @Put("onboarding/skills")
  updateSkills(@Req() req, @Body() dto: UpdateSkillsDto) {
    return this.userService.updateSkills(req.user.sub, dto);
  }

  @Put("onboarding/profile")
  updateProfile(@Req() req, @Body() dto: UpdateProfileDto) {
    return this.userService.updateProfile(req.user.sub, dto);
  }

  @Put("onboarding/purpose")
  updatePurpose(@Req() req, @Body() dto: UpdatePurposeDto) {
    return this.userService.updatePurpose(req.user.sub, dto);
  }

  @Put("onboarding/complete")
  completeOnboarding(@Req() req) {
    return this.userService.completeOnboarding(req.user.sub);
  }
}
