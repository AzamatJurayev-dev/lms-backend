import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  Req,
  Sse,
  UseGuards,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Sse('stream')
  @UseGuards(JwtAuthGuard)
  stream(@Req() req:any): Observable<{ data: any }> {
    const userId = req.user.id;

    return this.notificationsService.getStream(userId).pipe(
      map((notification) => ({
        data: notification,
      })),
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  getMyNotifications(
    @CurrentUser() user: any,
    @Query('isRead') isRead?: string,
  ) {
    const parsed =
      typeof isRead === 'string'
        ? isRead === 'true'
          ? true
          : isRead === 'false'
            ? false
            : undefined
        : undefined;

    return this.notificationsService.getUserNotifications(user.id, {
      isRead: parsed,
    });
  }

  @Patch(':id/read')
  @UseGuards(JwtAuthGuard)
  markAsRead(@CurrentUser() user: any, @Param('id', ParseIntPipe) id: number) {
    return this.notificationsService.markAsRead(user.id, id);
  }
}
