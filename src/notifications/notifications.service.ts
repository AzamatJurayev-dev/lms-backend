import { Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';

@Injectable()
export class NotificationsService {
  private streams = new Map<number, Subject<any>>();

  getStream(userId: number): Subject<any> | undefined {
    if (!this.streams.has(userId)) {
      this.streams.set(userId, new Subject());
    }
    return this.streams.get(userId);
  }

  emit(userId: number, payload: any) {
    const stream = this.streams.get(userId);
    if (stream) {
      stream.next(payload);
    }
  }

  disconnect(userId: number) {
    const stream = this.streams.get(userId);
    if (stream) {
      stream.complete();
      this.streams.delete(userId);
    }
  }
}
