import { Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType } from '@prisma/client';

@Injectable()
export class NotificationsService {
  private streams = new Map<number, Subject<any>>();

  constructor(private readonly prisma: PrismaService) {}

  getStream(userId: number): Subject<any> {
    if (!this.streams.has(userId)) {
      this.streams.set(userId, new Subject());
    }
    return this.streams.get(userId)!;
  }

  async createAndEmit(
    userId: number,
    type: NotificationType,
    title: string,
    message: string,
  ) {
    const notification = await this.prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
      },
    });

    const stream = this.streams.get(userId);
    if (stream) {
      stream.next(notification);
    }
  }

  async getUserNotifications(userId: number, options?: { isRead?: boolean }) {
    return this.prisma.notification.findMany({
      where: {
        userId,
        isRead: options?.isRead,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async markAsRead(userId: number, notificationId: number) {
    return this.prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId,
      },
      data: {
        isRead: true,
      },
    });
  }

  disconnect(userId: number) {
    const stream = this.streams.get(userId);
    if (stream) {
      stream.complete();
      this.streams.delete(userId);
    }
  }
}
