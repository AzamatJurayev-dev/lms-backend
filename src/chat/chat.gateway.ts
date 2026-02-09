import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = await this.jwtService.verifyAsync(token);

      client.data.user = {
        id: payload.sub,
        role: payload.role,
        companyId: payload.companyId,
      };
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    // Hozircha maxsus logika yo'q
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: number },
  ) {
    const user = client.data.user;
    if (!user) {
      client.disconnect();
      return;
    }

    const participant = await this.prisma.chatParticipant.findFirst({
      where: {
        roomId: data.roomId,
        userId: user.id,
      },
    });

    if (!participant) {
      return;
    }

    client.join(`room:${data.roomId}`);
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      roomId: number;
      text: string;
    },
  ) {
    const user = client.data.user;
    if (!user) {
      client.disconnect();
      return;
    }

    const participant = await this.prisma.chatParticipant.findFirst({
      where: {
        roomId: data.roomId,
        userId: user.id,
      },
    });

    if (!participant) {
      return;
    }

    const message = await this.prisma.chatMessage.create({
      data: {
        roomId: data.roomId,
        senderId: user.id,
        text: data.text,
      },
    });

    this.server.to(`room:${data.roomId}`).emit('message', message);
  }
}

