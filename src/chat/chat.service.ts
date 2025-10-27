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


    async deleteMessage(matchId: string){
        await this .prisma.chat.deleteMany({
          where 
          : { matchId  },
        })
    }

   







    
}
