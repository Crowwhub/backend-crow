import { Controller, Get, Delete, Param  } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

async getChatHistory(@Param('matchId') matchId: string) {
    return this.chatService.getMessages(matchId);
  }

  // DELETE /chat/message/:messageId -> delete a specific message
  @Delete('message/:matchId')
  async deleteMessage(@Param('matchId') matchId: string) {
    return this.chatService.deleteMessage(matchId);
  }

}
