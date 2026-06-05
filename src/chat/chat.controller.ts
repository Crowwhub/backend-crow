import { Controller, Get, Delete, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

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
