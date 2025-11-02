import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma /prisma.service';
import { SwipeFeedDto } from './dto/swipe-feed.dto';
import { CreateSwipeDto, SwipeDirection } from './dto/create-swipe.dto';


@Injectable()
export class SwipesService {
    constructor(private readonly prisma : PrismaService) {}


    async swipefeed(userId: string, dto: SwipeFeedDto) {
        const swiperecord = await this.prisma.swipe.findMany({
            where : {swiperId : userId,},
            select : {swipedId : true ,}
        });
        const excludeIds =  swiperecord.map(s => s.swipedId).concat([userId]);

    const users = await this.prisma.user.findMany({
        where: {
            id: { notIn: excludeIds },
            ...(dto.domain ? { interests: { has: dto.domain } } : {}),
            ...(dto.purpose ? { purpose: { has: dto.purpose } } : {}),
        },
        take: 10,
        select: {
          id: true,
          name: true,
          username: true,
          photo: true,
          skills: true,
          interests: true,
          purpose: true,
      
          favouriteTools: true,
        },
    });
        return users;
    }


    async createSwipe(userID:  string , dto: CreateSwipeDto) {
        const {swipedId , direction } = dto;

        // ensure we provide the required 'purpose' field for the swipe
        const swiper = await this.prisma.user.findUnique({
            where: { id: userID },
            select: { purpose: true },
        });

        const swipe = await this.prisma.swipe.create({
            data :{
                swiperId : userID ,
                swipedId ,
                direction,
                purpose: swiper?.purpose ?? [0] as any,  // MUST BE ARRAY
}, 
        });

        //check if the dorection is right 
        if (direction === SwipeDirection.RIGHT) {
            const existingSwipe = await this.prisma.swipe.findFirst({
                where :{
                    swiperId : swipedId ,
                    swipedId : userID ,
                    direction : SwipeDirection.RIGHT,

                },
            });
            if (existingSwipe) {
  await this.prisma.match.create({
    data: {
      user1Id: userID,   // ✅ correct field name
      user2Id: swipedId, // ✅ correct field name
      purpose: swipe.purpose, // ← add required field
      

    },
    });

    return { swipe, ismatch: true };
}

return { swipe, ismatch: false };

        }

    }


    async getincomingSwipes(userId: string ) {
        const Incoming = await this.prisma.swipe.findMany({
            where : {
                swipedId : userId ,
                direction : SwipeDirection.RIGHT, 
            },
            select : {
                swiperId: true,
                swiper :{
                    select : {
                        id: true,
                        name: true,
                        username: true,
                        photo: true,
                        skills: true,
                        interests: true,
                        purpose: true,
                        
                        favouriteTools: true,
                    }
                }
            }

        });
        return Incoming.map(s => s.swiper)
    
    };




}
