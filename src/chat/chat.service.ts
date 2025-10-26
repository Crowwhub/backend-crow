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

    



    
}
