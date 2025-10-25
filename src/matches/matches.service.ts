import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma /prisma.service';


@Injectable()
export class MatchesService {
    constructor(private readonly prisma: PrismaService) {}
  
  
    async getUserMatches(userId: string){
        const matches = await this.prisma.match.findMany({
            where :{
                OR :[
                    {user1ID : userId},
                    {user2ID : userId},
                ],
            },
            include :{
                user1 : true,
                user2 : true,
            }, 
            orderBy : {
                createdAt : 'desc',
            },

        });
       return matches.map(match => ({
        matchId : match.id,
        matchedwith : userId === match.user1ID ? match.user2 : match.user1,
        createdAt : match.createdAt,
    })
    )
    }


    async deleteMatch(matchId: string){
        await this.prisma.match.delete ({
            where : {
                id : matchId ,
            }
        });
        return {match : 'deleted successfully'};
    }


}
