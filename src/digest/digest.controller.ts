import {
  Controller,
  ForbiddenException,
  Headers,
  Post,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DigestService } from './digest.service';

/**
 * Manual trigger for the activity digest — for testing/ops without waiting for
 * the 6-hourly cron.
 *
 * Gated by a shared secret (header `x-digest-secret` must equal env
 * DIGEST_TRIGGER_SECRET) rather than the normal JWT guard, so a regular
 * logged-in user can't kick off an email blast. If the secret env is unset the
 * endpoint is disabled entirely.
 */
@Controller('digest')
export class DigestController {
  constructor(
    private readonly digest: DigestService,
    private readonly config: ConfigService,
  ) {}

  // POST /digest/run   (header: x-digest-secret: <DIGEST_TRIGGER_SECRET>)
  @Post('run')
  async run(@Headers('x-digest-secret') secret?: string) {
    const expected = this.config.get<string>('DIGEST_TRIGGER_SECRET');
    if (!expected) {
      throw new ForbiddenException('Manual digest trigger is disabled.');
    }
    if (secret !== expected) {
      throw new ForbiddenException('Invalid digest secret.');
    }
    const stats = await this.digest.run();
    return { ok: true, ...stats };
  }
}
