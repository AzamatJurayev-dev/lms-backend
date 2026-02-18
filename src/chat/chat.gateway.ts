import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

@WebSocketGateway({
  cors: {
    origin: ['https://lms-nine-mu.vercel.app', 'http://localhost:3000'],
    credentials: true,
  },
})
export class ChatGateway {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  @WebSocketServer()
  server: Server;

  /* ================= CONNECTION ================= */
  handleConnection(client: Socket) {
    const token = client.handshake.auth.token;

    if (!token) {
      client.disconnect();
      return;
    }

    try {
      const user = this.jwtService.verify(token);
      client.data.user = user;
      console.log('USER CONNECTED:', user.sub);
    } catch {
      client.disconnect();
    }
  }

  @SubscribeMessage('joinRoom')
  async handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: number },
  ) {
    await client.join(`room:${data.roomId}`);
  }
}
