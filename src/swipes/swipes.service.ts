import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma';
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
        const excludeIds = swiperecord.map(s => s.swipedId).concat([userId]);

        const where: Prisma.UserWhereInput = {
            id: { notIn: excludeIds },
            onboardingComplete: true,
            domain: { in: domainVariants(dto.domain), mode: 'insensitive' },
            findMeFor: { hasSome: intentVariants(dto.intent) },
        };

        if (dto.personType) {
            where.personType = { equals: dto.personType, mode: 'insensitive' };
        }
        if (dto.location) {
            where.location = { contains: dto.location, mode: 'insensitive' };
        }
        if (dto.interest) {
            where.interests = { has: dto.interest };
        }
        if (dto.goal) {
            where.goals = { has: dto.goal };
        }
        if (dto.skill) {
            where.skills = { has: dto.skill };
        }

        const users = await this.prisma.user.findMany({
            where,
            take: dto.limit ?? 10,
            select: {
                id: true,
                name: true,
                username: true,
                avatar: true,
                role: true,
                location: true,
                domain: true,
                personType: true,
                experience: true,
                skills: true,
                interests: true,
                goals: true,
                findMeFor: true,
                currentlyWorkingOn: true,
            },
        });

        return users.map(u => ({ ...u, intent: dto.intent }));
    }


    async createSwipe(userID: string, dto: CreateSwipeDto) {
        const { swipedId, direction, intent, domain } = dto;

        const swipe = await this.prisma.swipe.create({
            data: {
                swiperId: userID,
                swipedId,
                direction,
                intent: intent ?? null,
                domain: domain ?? null,
            },
        });

        if (direction === SwipeDirection.RIGHT) {
            const existingSwipe = await this.prisma.swipe.findFirst({
                where: {
                    swiperId: swipedId,
                    swipedId: userID,
                    direction: SwipeDirection.RIGHT,
                },
            });
            if (existingSwipe) {
                await this.prisma.match.create({
                    data: {
                        user1Id: userID,
                        user2Id: swipedId,
                        intent: swipe.intent ?? existingSwipe.intent ?? null,
                    },
                });
                return { swipe, ismatch: true };
            }
            return { swipe, ismatch: false };
        }

        return { swipe, ismatch: false };
    }


    async getincomingSwipes(userId: string) {
        // Exclude swipers I've already responded to (either accepted or rejected).
        const myOutgoing = await this.prisma.swipe.findMany({
            where: { swiperId: userId },
            select: { swipedId: true },
        });
        const respondedToIds = myOutgoing.map(s => s.swipedId);

        const Incoming = await this.prisma.swipe.findMany({
            where: {
                swipedId: userId,
                direction: SwipeDirection.RIGHT,
                swiperId: { notIn: respondedToIds },
            },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                intent: true,
                domain: true,
                createdAt: true,
                swiper: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        avatar: true,
                        role: true,
                        location: true,
                        domain: true,
                        personType: true,
                        experience: true,
                        skills: true,
                        interests: true,
                        goals: true,
                        findMeFor: true,
                        currentlyWorkingOn: true,
                    },
                },
            },
        });
        return Incoming.map(s => ({
            swipeId: s.id,
            intent: s.intent,
            domain: s.domain,
            createdAt: s.createdAt,
            user: s.swiper,
        }));
    }
}

// findMeFor values stored at onboarding aren't strictly normalized
// (e.g. "Co-founder" vs "co-founder"). Match common case variants.
function intentVariants(intent: string): string[] {
    const trimmed = intent.trim();
    const lower = trimmed.toLowerCase();
    const upper = trimmed.toUpperCase();
    const capitalized = lower.charAt(0).toUpperCase() + lower.slice(1);
    return Array.from(new Set([trimmed, lower, upper, capitalized]));
}

// Domain may be stored as label ("Software Developer") or slug ("software-developer")
// depending on which onboarding path the user took. Match against both forms.
function domainVariants(domain: string): string[] {
    const trimmed = domain.trim();
    const lower = trimmed.toLowerCase();
    const slug = lower.replace(/\s+/g, '-');
    const label = lower.replace(/-+/g, ' ');
    return Array.from(new Set([trimmed, lower, slug, label]));
}
