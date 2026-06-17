import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma /prisma.service';
import { ToggleLikeDto } from './dto/toggle-like.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ProfileLikesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  async toggle(likerId: string, dto: ToggleLikeDto) {
    if (dto.likedUserId === likerId) {
      throw new BadRequestException("You can't like your own profile.");
    }

    if (dto.liked) {
      const key = {
        likerId_likedUserId_itemKey: {
          likerId,
          likedUserId: dto.likedUserId,
          itemKey: dto.itemKey,
        },
      };
      // Was this already liked? Used to avoid re-notifying on a repeat like.
      const existing = await this.prisma.profileLike.findUnique({
        where: key,
        select: { id: true },
      });

      // Idempotent: ignore P2002 if the like already exists.
      await this.prisma.profileLike.upsert({
        where: key,
        create: {
          likerId,
          likedUserId: dto.likedUserId,
          itemKey: dto.itemKey,
        },
        update: {},
      });

      // Notify only on a genuinely new like, never block on it.
      if (!existing) {
        await this.notifications
          .create({
            userId: dto.likedUserId,
            type: 'PROFILE_INTERACTION',
            actorId: likerId,
            metadata: { itemKey: dto.itemKey },
          })
          .catch(() => undefined);
      }

      return { liked: true };
    }

    await this.prisma.profileLike
      .delete({
        where: {
          likerId_likedUserId_itemKey: {
            likerId,
            likedUserId: dto.likedUserId,
            itemKey: dto.itemKey,
          },
        },
      })
      .catch(() => null); // not found is fine — nothing to undo
    return { liked: false };
  }

  // All itemKeys the current user has liked on the target user's profile.
  async listFor(likerId: string, targetUserId: string) {
    const rows = await this.prisma.profileLike.findMany({
      where: { likerId, likedUserId: targetUserId },
      select: { itemKey: true, createdAt: true },
    });
    return rows.map(r => r.itemKey);
  }

  // Likes received by the current user, grouped for the notifications surface.
  async listReceived(userId: string) {
    const rows = await this.prisma.profileLike.findMany({
      where: { likedUserId: userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        itemKey: true,
        createdAt: true,
        liker: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
            domain: true,
            location: true,
          },
        },
      },
    });
    return rows.map(r => ({
      id: r.id,
      itemKey: r.itemKey,
      createdAt: r.createdAt,
      liker: r.liker,
    }));
  }
}
