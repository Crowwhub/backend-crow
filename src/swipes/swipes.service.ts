import { Injectable } from '@nestjs/common';
import { PrismaService } from  '../prisma /prisma.service';
import { SwipeFeedDto } from './dto/swipe-feed.dto';
import { CreateSwipeDto, SwipeDirection } from './dto/create-swipe.dto';


@Injectable()
export class SwipesService {
    constructor(private readonly prisma : PrismaService) {}


    async swipefeed(userId: string, dto: SwipeFeedDto) {
        const swiperecord = await this.prisma.swipe.findmany({
            where : {swiperId : userId,},
            select : {swipedId : true ,}
        });
        const excludeIds =  swiperecord.map(s => s.swipedId).concat([userId]);

        const users = await this.prisma.user.findmany({
            where : {
                id : {notIn : excludeIds},
                ...dto.domain ? {interest : { has: dto.domain}} : {}, 
                ...dto.purpose ? {purpose : dto.purpose} : {}
            },
            take : 10 , 
            select: {
        id: true,
        name: true,
        username: true,
        photo: true,
        skills: true,
        interests: true,
        purpose: true,
        personType: true,
        favouriteTools: true,
      },

        });
        return users;
    }


    async createSwipe(userID:  string , dto: CreateSwipeDto) {
        const {swipedId , direction } = dto;

        const swipe = await this.prisma.swipr.create({
            data :{
                swiperId : userID ,
                swipedId  ,
                direction , 
            }, 
        });

        //check if the dorection is right 
        if (direction === SwipeDirection.RIGHT) {
            const existingSwipe = await this.prisma.swipe.findFirst({
                where :{
                    swiperid : swipedId ,
                    swipedId : userID ,
                    direction : SwipeDirection.RIGHT,

                },
            });
            if (existingSwipe){
                await this.prisma.match.create ({
                    data :{
                        user1ID : userID ,
                        user2ID : swipedId ,
                    },
                });
                return { swipe , ismatch : true }

            }
            return{ swipe , ismatch : false}
            

        }

    }


}
