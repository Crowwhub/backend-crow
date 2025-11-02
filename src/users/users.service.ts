import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma /prisma.service";
import { UpdateDomainDto } from "./dto/update-domian.dto";
import { UpdateSkillsDto } from "./dto/update-skills.dto";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { UpdatePurposeDto } from "./dto/update-purpose.dto";

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getMe(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        photo: true,

        // onboarding fields
        domain: true,
        skills: true,
        interests: true,
        favouriteTools: true,
       
        promptTagline: true,
        madeTillFar: true,
        purpose: true,
        onboardingComplete: true,

        createdAt: true,
      },
    });
  }

  async updateDomain(userId: string, dto: UpdateDomainDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { domain: dto.domain },
    });
  }

  async updateSkills(userId: string, dto: UpdateSkillsDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { skills: dto.skills },
    });
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        name: dto.name,
    
        interests: dto.interests,
        favouriteTools: dto.favouriteTools,
        promptTagline: dto.promptTagline,
        madeTillFar: dto.madeTillFar,
      },
    });
  }

  async updatePurpose(userId: string, dto: UpdatePurposeDto) {
    const purposeValue = Array.isArray(dto.purpose)
      ? dto.purpose
      : dto.purpose
      ? [dto.purpose]
      : [];

    return this.prisma.user.update({
      where: { id: userId },
      data: { purpose: purposeValue },
    });
  }

  async completeOnboarding(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { onboardingComplete: true },
    });
  }
}

