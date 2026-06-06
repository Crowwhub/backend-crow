import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma /prisma.service';


@Injectable()
export class ChatService {
    constructor(private prisma: PrismaService) {}

    async saveMessage(matchId: string, senderId: string, message : string) {
        return this.prisma.chat.create({
      data: { matchId, senderId, message },
    });
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


    async deleteMessage(matchId: string){
        await this .prisma.chat.deleteMany({
          where 
          : { matchId  },
        })
    }

   







    
}
