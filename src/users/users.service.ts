import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma /prisma.service";
import { UpdateDomainDto } from "./dto/update-domian.dto";
import { UpdateSkillsDto } from "./dto/update-skills.dto";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { UpdatePurposeDto } from "./dto/update-purpose.dto";
import { UpdateNameGenderDto } from "./dto/update-name-gender.dto";
import { UpdateExploringDto } from "./dto/update-exploring.dto";

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
        gender: true,
        personType: true,
        role: true,
        experienceLevel: true,
        domain: true,
        skills: true,
        interests: true,
        exploringInterests: true,
        favouriteTools: true,
        promptTagline: true,
        madeTillFar: true,
        purpose: true,
        onboardingComplete: true,
        createdAt: true,
      },
    });
  }

  async updateNameGender(userId: string, dto: UpdateNameGenderDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { name: dto.name, gender: dto.gender },
    });
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        personType: dto.personType,
        domain: dto.domain,
        role: dto.role,
        experienceLevel: dto.experienceLevel,
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

  async updateExploring(userId: string, dto: UpdateExploringDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { exploringInterests: dto.exploringInterests },
    });
  }

  async completeOnboarding(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { onboardingComplete: true },
    });
  }
}