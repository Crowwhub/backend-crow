import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../../prisma /prisma.service';

/**
 * Bumps `User.lastActiveAt` on authenticated requests so the digest can skip
 * users who are currently active. The digest reads this; the interceptor writes
 * it.
 *
 * Writes are throttled per-user via an in-memory map (default once / 5 min) so
 * we don't issue a DB write on every request. Best-effort and fire-and-forget:
 * it never blocks or fails the request. Runs after guards, so `req.user` (set by
 * JwtAuthGuard) is populated on protected routes; unauthenticated requests are
 * ignored.
 */
@Injectable()
export class LastActiveInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LastActiveInterceptor.name);
  private readonly lastWrite = new Map<string, number>();
  private readonly throttleMs = 5 * 60 * 1000;

  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<{ user?: { sub?: string } }>();
    const userId = req?.user?.sub;

    if (userId) {
      const now = Date.now();
      const last = this.lastWrite.get(userId) ?? 0;
      if (now - last >= this.throttleMs) {
        // Reserve the slot before the async write so concurrent requests in the
        // same window don't all fire updates.
        this.lastWrite.set(userId, now);
        this.prisma.user
          .update({ where: { id: userId }, data: { lastActiveAt: new Date() } })
          .catch((err: Error) =>
            this.logger.debug(`lastActiveAt bump failed for ${userId}: ${err.message}`),
          );
      }
    }

    return next.handle().pipe(tap(() => undefined));
  }
}
