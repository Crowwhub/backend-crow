import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma /prisma.service';
import { UpdateMeDto } from './dto/update-me.dto';
import { isProfileComplete } from '../common/profile-completeness';

const PROFILE_SELECT = {
  id: true,
  name: true,
  email: true,
  username: true,
  avatar: true,
  birthday: true,
  gender: true,
  location: true,
  personType: true,
  role: true,
  company: true,
  college: true,
  course: true,
  aspirantOf: true,
  showcase: true,
  profileCompletedAt: true,
  experience: true,
  experienceLevel: true,
  practiceYears: true,
  domain: true,
  skills: true,
  interests: true,
  exploringInterests: true,
  findMeFor: true,
  goals: true,
  currentlyWorkingOn: true,
  promptTagline: true,
  madeTillFar: true,
  onboardingComplete: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getMe(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: PROFILE_SELECT,
    });
  }

  async updateMe(userId: string, dto: UpdateMeDto) {
    const { birthday, ...rest } = dto;
    const data: Record<string, unknown> = { ...rest };

    if (birthday !== undefined) {
      data.birthday = birthday ? new Date(birthday) : null;
    }

    // Mirror interests → exploringInterests for backward-compat with the older
    // swipes/feed code paths that still reference the legacy field name.
    if (dto.interests !== undefined) {
      data.exploringInterests = dto.interests;
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data,
      select: PROFILE_SELECT,
    });

    // Track who actually completes their profile: stamp the first time it
    // becomes complete (company + education + showcase). Kept once set.
    if (!updated.profileCompletedAt && isProfileComplete(updated)) {
      const now = new Date();
      await this.prisma.user.update({
        where: { id: userId },
        data: { profileCompletedAt: now },
      });
      updated.profileCompletedAt = now;
    }

    return updated;
  }

  async completeOnboarding(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: PROFILE_SELECT,
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const missing: string[] = [];
    if (!user.name?.trim()) missing.push('name');
    if (!user.avatar) missing.push('avatar');
    if (!user.birthday) missing.push('birthday');
    if (!user.gender) missing.push('gender');
    if (!user.location?.trim()) missing.push('location');
    if (!user.personType) missing.push('personType');
    if (!user.domain) missing.push('domain');
    if (user.experience === null || user.experience === undefined) {
      missing.push('experience');
    }
    if (user.practiceYears === null || user.practiceYears === undefined) {
      missing.push('practiceYears');
    }
    if (!user.skills?.length) missing.push('skills');

    if (missing.length > 0) {
      throw new BadRequestException({
        code: 'ONBOARDING_INCOMPLETE',
        message: `Required fields missing: ${missing.join(', ')}`,
        missing,
      });
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { onboardingComplete: true },
      select: PROFILE_SELECT,
    });
  }
}
