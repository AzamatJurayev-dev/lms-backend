import { Controller, Req, Sse } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Sse('stream')
  stream(@Req() req): Observable<MessageEvent> {
    const userId = req.user.id; // JWT guard orqali

    // @ts-ignore
    return this.notificationsService.getStream(userId).pipe(
      map((data) => ({
        data,
      })),
    );
  }
}
