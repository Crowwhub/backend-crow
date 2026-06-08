import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma /prisma.service';

const PUBLIC_USER_SELECT = {
    id: true,
    name: true,
    username: true,
    avatar: true,
    role: true,
    location: true,
    domain: true,
    personType: true,
    aspirantOf: true,
    experience: true,
    skills: true,
    interests: true,
    goals: true,
    findMeFor: true,
    currentlyWorkingOn: true,
} as const;

@Injectable()
export class MatchesService {
    constructor(private readonly prisma: PrismaService) {}

    async getUserMatches(userId: string) {
        const matches = await this.prisma.match.findMany({
            where: {
                OR: [
                    { user1Id: userId },
                    { user2Id: userId },
                ],
            },
            include: {
                user1: { select: PUBLIC_USER_SELECT },
                user2: { select: PUBLIC_USER_SELECT },
            },
            orderBy: { createdAt: 'desc' },
        });
        return matches.map(match => ({
            matchId: match.id,
            intent: match.intent,
            createdAt: match.createdAt,
            user: userId === match.user1Id ? match.user2 : match.user1,
        }));
    }

    async deleteMatch(matchId: string) {
        await this.prisma.match.delete({ where: { id: matchId } });
        return { match: 'deleted successfully' };
    }
}
