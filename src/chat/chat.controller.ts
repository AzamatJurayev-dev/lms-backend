import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user';

@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('rooms')
  getMyRooms(@CurrentUser() user: any) {
    return this.chatService.getMyRooms(user.id);
  }

  @Post('rooms')
  createRoom(
    @CurrentUser() user: any,
    @Body()
    dto: {
      type: 'PRIVATE' | 'GROUP';
      name?: string;
      memberIds?: number[];
      groupId?: number;
    },
  ) {
    return this.chatService.createRoom(user.id, dto);
  }

  @Get('rooms/:id/messages')
  getMessages(
    @CurrentUser() user: any,
    @Param('id', ParseIntPipe) id: number,
    @Query() query: { page?: number; pageSize?: number },
  ) {
    return this.chatService.getRoomMessages(id, user.id, query);
  }
}

