import { Body, Controller, Get, Put, UseGuards, Req } from "@nestjs/common";
import { UserService } from "./users.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { UpdateDomainDto } from "./dto/update-domian.dto";
import { UpdateSkillsDto } from "./dto/update-skills.dto";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { UpdatePurposeDto } from "./dto/update-purpose.dto";
import { UpdateNameGenderDto } from "./dto/update-name-gender.dto";
import { UpdateExploringDto } from "./dto/update-exploring.dto";

@Controller("users")
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get("me")
  getMe(@Req() req) {
    return this.userService.getMe(req.user.sub);
  }

  // Page 1: name + gender
  @Put("onboarding/name-gender")
  updateNameGender(@Req() req, @Body() dto: UpdateNameGenderDto) {
    return this.userService.updateNameGender(req.user.sub, dto);
  }

  // Page 2: professional info
  @Put("onboarding/profile")
  updateProfile(@Req() req, @Body() dto: UpdateProfileDto) {
    return this.userService.updateProfile(req.user.sub, dto);
  }

  // Page 3: skills2
  @Put("onboarding/skills")
  updateSkills(@Req() req, @Body() dto: UpdateSkillsDto) {
    return this.userService.updateSkills(req.user.sub, dto);
  }

  // Page 4: purpose
  @Put("onboarding/purpose")
  updatePurpose(@Req() req, @Body() dto: UpdatePurposeDto) {
    return this.userService.updatePurpose(req.user.sub, dto);
  }

  // Page 5: exploring interests
  @Put("onboarding/exploring")
  updateExploring(@Req() req, @Body() dto: UpdateExploringDto) {
    return this.userService.updateExploring(req.user.sub, dto);
  }

  @Put("onboarding/complete")
  completeOnboarding(@Req() req) {
    return this.userService.completeOnboarding(req.user.sub);
  }
}
