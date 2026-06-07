import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma /prisma.service';
import { MatchesService } from '../matches/matches.service';

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

  // Home bootstrap config: swipe streak + the user's real matches (with count).
  async getConfig(userId: string) {
    const [streak, allMatches] = await Promise.all([
      this.getStreak(userId),
      this.matches.getUserMatches(userId),
    ]);

    return {
      streak,
      matches: {
        count: allMatches.length,
        top: allMatches.slice(0, TOP_MATCHES_LIMIT),
      },
    };
  }

  // Effective streak for display: 0 if the chain is broken (last swipe older
  // than yesterday). `active` = already swiped today.
  private async getStreak(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { swipeStreak: true, lastSwipeAt: true },
    });
    if (!user || !user.lastSwipeAt) return { count: 0, active: false };

    const today = startOfUTCDay(new Date());
    const last = startOfUTCDay(user.lastSwipeAt);

    if (last === today) return { count: user.swipeStreak, active: true };
    if (last === today - DAY_MS) return { count: user.swipeStreak, active: false };
    return { count: 0, active: false };
  }
}
