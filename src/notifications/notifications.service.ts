import { Injectable, Logger } from '@nestjs/common';
import { NotificationType, Prisma } from 'generated/prisma';
import { PrismaService } from '../prisma /prisma.service';

export interface CreateNotificationInput {
  /** Recipient user id. */
  userId: string;
  type: NotificationType;
  /** Who triggered the event (the other user), if any. */
  actorId?: string | null;
  /** Type-specific payload: { matchId, itemKey, messagePreview, ... }. */
  metadata?: Prisma.InputJsonValue;
}

/**
 * Single chokepoint for emitting activity events. Every emit point in the app
 * (likes, swipes/matches, chat, future project invites) calls `create`.
 *
 * This is intentionally the ONE place a notification is born, so future
 * realtime/push delivery and per-user preference checks can be added here
 * without touching any of the emit points.
 *
 * `create` is best-effort: emit points should not fail because a notification
 * could not be written. Callers wrap it in `.catch()`; we also swallow+log here
 * as a second line of defence.
 */
@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateNotificationInput) {
    // Never notify yourself.
    if (input.actorId && input.actorId === input.userId) return null;

    try {
      return await this.prisma.notification.create({
        data: {
          userId: input.userId,
          type: input.type,
          actorId: input.actorId ?? null,
          metadata: input.metadata,
        },
      });
    } catch (err) {
      this.logger.error(
        `Failed to create ${input.type} notification for ${input.userId}: ${
          (err as Error).message
        }`,
      );
      return null;
    }
  }

  /** Recent notifications for the in-app surface. */
  async list(userId: string, limit = 50) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async unreadCount(userId: string) {
    const count = await this.prisma.notification.count({
      where: { userId, read: false },
    });
    return { count };
  }

  /** Mark one notification read (scoped to the owner). */
  async markRead(id: string, userId: string) {
    const res = await this.prisma.notification.updateMany({
      where: { id, userId, read: false },
      data: { read: true, readAt: new Date() },
    });
    return { updated: res.count };
  }

  async markAllRead(userId: string) {
    const res = await this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true, readAt: new Date() },
    });
    return { updated: res.count };
  }
}
