import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { CurrentUser } from '../auth/current-user';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

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

  @Get('rooms/:id/messages')
  getRoomMessages(
    @CurrentUser() user,
    @Param('id') id: string,
    @Query() query,
  ) {
    return this.chatService.getRoomMessages(Number(id), user.id, query);
  }
}
