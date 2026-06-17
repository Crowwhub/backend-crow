import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NotificationType } from 'generated/prisma';
import { PrismaService } from '../prisma /prisma.service';
import { MailService } from '../mail/mail.service';
import { DigestLine, labelFor } from '../mail/templates/digest.template';

@Injectable()
export class DigestService {
  private readonly logger = new Logger(DigestService.name);
  private running = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
    private readonly config: ConfigService,
  ) {}

  private get enabled(): boolean {
    // Default ON; set DIGEST_ENABLED=false to disable (e.g. in dev).
    return String(this.config.get('DIGEST_ENABLED') ?? 'true') !== 'false';
  }

  private get activeWindowMs(): number {
    const minutes = Number(this.config.get('DIGEST_ACTIVE_WINDOW_MINUTES') ?? 30);
    return minutes * 60 * 1000;
  }

  private get maxRecentFailures(): number {
    return Number(this.config.get('DIGEST_MAX_RETRIES') ?? 5);
  }

  private get appUrl(): string {
    return this.config.get<string>('APP_WEB_URL') ?? 'https://app.crowhub.dating';
  }

  // Every 6 hours. Cadence is intentionally a single decorator so daily/weekly
  // digests later are a one-line change (and could be made per-user via prefs).
  @Cron(CronExpression.EVERY_6_HOURS, { name: 'activity-digest' })
  async handleCron() {
    await this.run();
  }

  /**
   * Collect → group per user → skip active users → send one email → mark emailed.
   * Safe to call manually (e.g. an admin endpoint or test). Self-guards against
   * overlapping runs.
   */
  async run(): Promise<{ processed: number; sent: number; skipped: number; failed: number }> {
    const stats = { processed: 0, sent: 0, skipped: 0, failed: 0 };

    if (!this.enabled) {
      this.logger.log('Digest disabled (DIGEST_ENABLED=false) — skipping run.');
      return stats;
    }
    if (this.running) {
      this.logger.warn('Digest run already in progress — skipping overlap.');
      return stats;
    }
    this.running = true;
    this.logger.log('Digest run started.');

    try {
      // Candidate recipients: anyone with at least one unread + un-emailed event.
      const candidates = await this.prisma.notification.groupBy({
        by: ['userId'],
        where: { read: false, emailedAt: null },
      });

      for (const { userId } of candidates) {
        stats.processed++;
        try {
          const outcome = await this.processUser(userId);
          stats[outcome]++;
        } catch (err) {
          stats.failed++;
          this.logger.error(
            `Digest for user ${userId} threw: ${(err as Error).message}`,
          );
        }
      }
    } finally {
      this.running = false;
    }

    this.logger.log(
      `Digest run finished — processed ${stats.processed}, sent ${stats.sent}, skipped ${stats.skipped}, failed ${stats.failed}.`,
    );
    return stats;
  }

  private async processUser(
    userId: string,
  ): Promise<'sent' | 'skipped' | 'failed'> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, lastActiveAt: true },
    });
    if (!user?.email) {
      this.logger.warn(`Skipping ${userId}: no email on record.`);
      return 'skipped';
    }

    // Skip users who are currently active — they'll see it in-app.
    if (
      user.lastActiveAt &&
      Date.now() - user.lastActiveAt.getTime() < this.activeWindowMs
    ) {
      return 'skipped';
    }

    // Back off if this address keeps failing (bad mailbox, hard bounce, …) so
    // we don't hammer it every cycle forever.
    const recentFailures = await this.prisma.emailDigestLog.count({
      where: {
        userId,
        status: 'FAILED',
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    });
    if (recentFailures >= this.maxRecentFailures) {
      this.logger.warn(
        `Skipping ${userId}: ${recentFailures} failed digests in last 24h.`,
      );
      return 'skipped';
    }

    // Snapshot cutoff: we email exactly what exists now and mark exactly those
    // ids. A notification created mid-send (createdAt > cutoff) is untouched and
    // simply waits for the next cycle — no row is marked without being included.
    const cutoff = new Date();
    const rows = await this.prisma.notification.findMany({
      where: {
        userId,
        read: false,
        emailedAt: null,
        createdAt: { lte: cutoff },
      },
      select: { id: true, type: true },
    });

    // No meaningful updates → no email (never send an empty digest).
    if (rows.length === 0) return 'skipped';

    const counts = new Map<NotificationType, number>();
    for (const r of rows) counts.set(r.type, (counts.get(r.type) ?? 0) + 1);
    const lines: DigestLine[] = [...counts.entries()].map(([type, count]) => ({
      type,
      count,
      label: labelFor(type, count),
    }));

    const ids = rows.map((r) => r.id);

    // Audit row up front so a crash mid-send still leaves a trace.
    const log = await this.prisma.emailDigestLog.create({
      data: { userId, status: 'PENDING', notificationCount: rows.length, attempts: 1 },
    });

    try {
      const result = await this.mail.sendDigest(user.email, {
        name: user.name,
        lines,
        total: rows.length,
        appUrl: this.appUrl,
      });

      // Mark emailed + finalize the log atomically. Once emailedAt is set these
      // rows can never be picked up again → no duplicate email, ever.
      await this.prisma.$transaction([
        this.prisma.notification.updateMany({
          where: { id: { in: ids }, emailedAt: null },
          data: { emailedAt: new Date() },
        }),
        this.prisma.emailDigestLog.update({
          where: { id: log.id },
          data: {
            status: 'SENT',
            sentAt: new Date(),
            providerMessageId: result.messageId ?? null,
          },
        }),
      ]);
      return 'sent';
    } catch (err) {
      const message = (err as Error).message ?? 'unknown error';
      this.logger.error(`Digest send failed for ${userId}: ${message}`);
      // Leave notifications un-emailed so the next cycle retries them.
      await this.prisma.emailDigestLog.update({
        where: { id: log.id },
        data: { status: 'FAILED', lastError: message.slice(0, 500) },
      });
      return 'failed';
    }
  }
}
