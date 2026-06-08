import { Controller, Get, Post, Delete, Param, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // GET /chat/reads -> the caller's read markers across all matches.
  // Declared before ':matchId' so it isn't captured as a matchId param.
  @UseGuards(JwtAuthGuard)
  @Get('reads')
  async getReads(@Req() req: { user: { sub: string } }) {
    return this.chatService.getReads(req.user.sub);
  }

  // GET /chat/unread-count -> total unread messages for the caller across all
  // matches (messages from others newer than the user's read marker).
  @UseGuards(JwtAuthGuard)
  @Get('unread-count')
  async unreadCount(@Req() req: { user: { sub: string } }) {
    return this.chatService.unreadCount(req.user.sub);
  }

  // POST /chat/:matchId/read -> mark the caller's read marker for a match to now.
  @UseGuards(JwtAuthGuard)
  @Post(':matchId/read')
  async markRead(
    @Param('matchId') matchId: string,
    @Req() req: { user: { sub: string } },
  ) {
    return this.chatService.markRead(matchId, req.user.sub);
  }

  // GET /chat/:matchId -> message history for a match, oldest first
  @UseGuards(JwtAuthGuard)
  @Get(':matchId')
  async getChatHistory(@Param('matchId') matchId: string) {
    return this.chatService.getMessages(matchId);
  }

  // DELETE /chat/message/:matchId -> clear all messages for a match
  @UseGuards(JwtAuthGuard)
  @Delete('message/:matchId')
  async deleteMessage(@Param('matchId') matchId: string) {
    return this.chatService.deleteMessage(matchId);
  }

}
