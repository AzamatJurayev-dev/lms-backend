import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Query, Req, UseGuards, } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CurrentUser } from '../auth/current-user';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { CurrentUserType } from '../common/types/current-user.type';
import { CreateMessageDto } from './dto/create-chat-message.dto';

@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('rooms')
  getMyRooms(@Req() req) {
    return this.chatService.getMyRooms(req.user.id);
  }

  @Post('rooms')
  createRoom(@Req() req, @Body() dto) {
    return this.chatService.createRoom(req.user.id, dto);
  }

  @Delete('rooms/:id')
  deleteRoom(@Param('id', ParseIntPipe) id: number) {
    return this.chatService.deleteRoom(id);
  }

  @Get('rooms/:id/messages')
  getRoomMessages(
    @CurrentUser() user,
    @Param('id') id: string,
    @Query() query,
  ) {
    return this.chatService.getRoomMessages(Number(id), user.id, query);
  }
  @Post('messages')
  createMessage(
    @CurrentUser() user: CurrentUserType,
    @Body() dto: CreateMessageDto,
  ) {
    return this.chatService.createMessage(user.id, dto);
  }
  @Delete('messages/:id')
  deleteMessage(@Param('id', ParseIntPipe) id: number) {
    return this.chatService.deleteMessage(id);
  }
}
