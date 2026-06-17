import { Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  // GET /notifications — recent notifications for the signed-in user.
  @UseGuards(JwtAuthGuard)
  @Get()
  list(@Req() req: { user: { sub: string } }) {
    return this.notifications.list(req.user.sub);
  }

  // GET /notifications/unread-count — for the sidebar badge.
  @UseGuards(JwtAuthGuard)
  @Get('unread-count')
  unreadCount(@Req() req: { user: { sub: string } }) {
    return this.notifications.unreadCount(req.user.sub);
  }

  // POST /notifications/:id/read
  @UseGuards(JwtAuthGuard)
  @Post(':id/read')
  markRead(
    @Req() req: { user: { sub: string } },
    @Param('id') id: string,
  ) {
    return this.notifications.markRead(id, req.user.sub);
  }

  // POST /notifications/read-all
  @UseGuards(JwtAuthGuard)
  @Post('read-all')
  markAllRead(@Req() req: { user: { sub: string } }) {
    return this.notifications.markAllRead(req.user.sub);
  }
}
