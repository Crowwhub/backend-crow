import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma /prisma.service';
import { NotificationsService } from '../notifications/notifications.service';


@Injectable()
export class ChatService {
    constructor(
        private prisma: PrismaService,
        private readonly notifications: NotificationsService,
    ) {}

    async saveMessage(matchId: string, senderId: string, message : string) {
        const saved = await this.prisma.chat.create({
            data: { matchId, senderId, message },
        });

        // Notify the OTHER participant. Best-effort — never block chat delivery.
        this.prisma.match
            .findUnique({
                where: { id: matchId },
                select: { user1Id: true, user2Id: true },
            })
            .then((match) => {
                if (!match) return;
                const recipientId =
                    match.user1Id === senderId ? match.user2Id : match.user1Id;
                return this.notifications.create({
                    userId: recipientId,
                    type: 'NEW_MESSAGE',
                    actorId: senderId,
                    metadata: {
                        matchId,
                        preview: message.slice(0, 140),
                    },
                });
            })
            .catch(() => undefined);

        return saved;
    }



    async getMessages(matchId: string){
        const messages =  await this.prisma.chat.findMany({
            where : { matchId  },
            orderBy :{
                createdAt : 'asc'
            }
         });

         return messages;
    }

    // Upsert the caller's read marker for a match to "now".
    async markRead(matchId: string, userId: string) {
        return this.prisma.chatRead.upsert({
            where: { matchId_userId: { matchId, userId } },
            update: { lastReadAt: new Date() },
            create: { matchId, userId },
            select: { matchId: true, lastReadAt: true },
        });
    }

    // All of a user's read markers, for computing unread on the client.
    async getReads(userId: string) {
        return this.prisma.chatRead.findMany({
            where: { userId },
            select: { matchId: true, lastReadAt: true },
        });
    }

    // Total unread across all of the user's matches: messages from the other
    // participant newer than the user's read marker (or all, if never read).
    async unreadCount(userId: string) {
        const rows = await this.prisma.$queryRaw<{ count: number }[]>`
            SELECT COUNT(*)::int AS count
            FROM "Chat" c
            JOIN "Match" m ON m.id = c."matchId"
            LEFT JOIN "ChatRead" r
              ON r."matchId" = c."matchId" AND r."userId" = ${userId}
            WHERE (m."user1Id" = ${userId} OR m."user2Id" = ${userId})
              AND c."senderId" <> ${userId}
              AND (r."lastReadAt" IS NULL OR c."createdAt" > r."lastReadAt")
        `;
        return { count: rows[0]?.count ?? 0 };
    }


    async deleteMessage(matchId: string){
        await this .prisma.chat.deleteMany({
          where 
          : { matchId  },
        })
    }

   







    
}
