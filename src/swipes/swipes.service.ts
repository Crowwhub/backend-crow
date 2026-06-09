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

        const candidates = await this.prisma.user.findMany({
            where,
            take: 100,
            select: {
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
            },
        });

        // Match domain on a normalized key so label/slug variants all match
        // (e.g. "Full-Stack Developer" == "fullstack-developer" == "full-stack-developer").
        const targetDomain = normalizeDomain(dto.domain);
        const users = candidates
            .filter((u) => normalizeDomain(u.domain) === targetDomain)
            .slice(0, dto.limit ?? 10);

        return users.map(u => ({ ...u, intent: dto.intent }));
    }


    // Consecutive-day swipe streak. Any swipe (left or right) counts the day.
    // Same day → unchanged; yesterday → +1; older/never → reset to 1.
    private async bumpSwipeStreak(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { swipeStreak: true, lastSwipeAt: true },
        });
        if (!user) return;

        const now = new Date();
        const dayMs = 24 * 60 * 60 * 1000;
        const startOfUTCDay = (d: Date) =>
            Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
        const today = startOfUTCDay(now);
        const last = user.lastSwipeAt ? startOfUTCDay(user.lastSwipeAt) : null;

        let streak: number;
        if (last === today) {
            streak = user.swipeStreak; // already counted today
        } else if (last !== null && last === today - dayMs) {
            streak = user.swipeStreak + 1; // continued from yesterday
        } else {
            streak = 1; // first swipe ever, or streak broken
        }

        await this.prisma.user.update({
            where: { id: userId },
            data: { swipeStreak: streak, lastSwipeAt: now },
        });
    }

    async createSwipe(userID: string, dto: CreateSwipeDto) {
        const { swipedId, direction, intent, domain, filters } = dto;

        // Count this swipe toward the user's daily streak (best-effort).
        await this.bumpSwipeStreak(userID).catch(() => {});

        // Drop empty/undefined entries before persisting so the JSON column
        // doesn't carry useless keys.
        const trimmedFilters = filters
            ? Object.fromEntries(
                Object.entries(filters).filter(
                    ([, v]) => typeof v === 'string' && v.trim().length > 0,
                ),
            )
            : null;
        const filtersToStore =
            trimmedFilters && Object.keys(trimmedFilters).length > 0
                ? trimmedFilters
                : null;

        // Idempotent: a duplicate POST for the same (swiper, swiped) pair
        // updates rather than throwing P2002.
        const swipe = await this.prisma.swipe.upsert({
            where: {
                swiperId_swipedId: { swiperId: userID, swipedId },
            },
            create: {
                swiperId: userID,
                swipedId,
                direction,
                intent: intent ?? null,
                domain: domain ?? null,
                filters: filtersToStore ?? undefined,
            },
            update: {
                direction,
                intent: intent ?? null,
                domain: domain ?? null,
                filters: filtersToStore ?? undefined,
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
                // A match may already exist from a prior accept — check both
                // directions because (user1Id, user2Id) ordering depends on
                // who hit Accept first.
                const existingMatch = await this.prisma.match.findFirst({
                    where: {
                        OR: [
                            { user1Id: userID, user2Id: swipedId },
                            { user1Id: swipedId, user2Id: userID },
                        ],
                    },
                });
                if (!existingMatch) {
                    await this.prisma.match.create({
                        data: {
                            user1Id: userID,
                            user2Id: swipedId,
                            intent: swipe.intent ?? existingSwipe.intent ?? null,
                        },
                    });
                }
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
                filters: true,
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
            filters: s.filters,
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

// Domain may be stored as a label ("Full-Stack Developer") or a slug
// ("fullstack-developer" / "full-stack-developer") depending on the onboarding
// path. Normalize to a separator-free lowercase key so all forms compare equal.
function normalizeDomain(domain?: string | null): string {
    return (domain ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');
}
