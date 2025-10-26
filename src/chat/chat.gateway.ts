import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';


@WebSocketGateway({ cors: { origin: '*' } })

export class ChatGateway implements   OnGatewayConnection, OnGatewayDisconnect {
    
@WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

@SubscribeMessage('joinRoom')
handleJoinRoom(
    @MessageBody() data: { matchId: string },
    @ConnectedSocket() client: Socket,
){
 client.join(data.matchId);
 console.log(`Client ${client.id} joined room ${data.matchId}`);

}

@SubscribeMessage('sendMessage')
async handleMessage(
    @MessageBody() data : { matchId: string; senderId: string; content: string },
)
{
    const savedMessage = await this.chatService.saveMessage(
      data.matchId,
      data.senderId,
      data.message,
    );

   this.server.to(data.matchId).emit('newMessage', savedMessage); 
}


    

}
 