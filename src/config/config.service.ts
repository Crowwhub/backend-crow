import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma /prisma.service';
import { MatchesService } from '../matches/matches.service';
import { profileMissingFields } from '../common/profile-completeness';

const TOP_MATCHES_LIMIT = 12;
const DAY_MS = 24 * 60 * 60 * 1000;

const startOfUTCDay = (d: Date) =>
  Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());

@Injectable()
export class ConfigService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly matches: MatchesService,
  ) {}

  // Home bootstrap config: swipe streak, the user's real matches (with count),
  // and server-computed profile completeness (drives the "complete your
  // profile" nudge + tracks who finished via profileCompletedAt).
  async getConfig(userId: string) {
    const [user, allMatches] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          swipeStreak: true,
          lastSwipeAt: true,
          company: true,
          college: true,
          showcase: true,
          profileCompletedAt: true,
        },
      }),
      this.matches.getUserMatches(userId),
    ]);

    return {
      streak: this.computeStreak(user),
      matches: {
        count: allMatches.length,
        top: allMatches.slice(0, TOP_MATCHES_LIMIT),
      },
      profile: {
        missing: user ? profileMissingFields(user) : [],
        completedAt: user?.profileCompletedAt ?? null,
      },
    };
  }

  // Effective streak for display: 0 if the chain is broken (last swipe older
  // than yesterday). `active` = already swiped today.
  private computeStreak(
    user: { swipeStreak: number; lastSwipeAt: Date | null } | null,
  ) {
    if (!user || !user.lastSwipeAt) return { count: 0, active: false };

    const today = startOfUTCDay(new Date());
    const last = startOfUTCDay(user.lastSwipeAt);

    if (last === today) return { count: user.swipeStreak, active: true };
    if (last === today - DAY_MS) return { count: user.swipeStreak, active: false };
    return { count: 0, active: false };
  }
}
