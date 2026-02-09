import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  async getMyRooms(userId: number) {
    const participants = await this.prisma.chatParticipant.findMany({
      where: { userId },
      include: {
        room: true,
      },
      orderBy: {
        room: {
          updatedAt: 'desc',
        },
      },
    });

    return participants.map((p) => p.room);
  }

  async createRoom(
    userId: number,
    dto: {
      type: 'PRIVATE' | 'GROUP';
      name?: string;
      memberIds?: number[];
      groupId?: number;
    },
  ) {
    const memberIds = Array.from(
      new Set([userId, ...(dto.memberIds ?? [])]),
    ).filter((id) => id !== userId || (dto.memberIds ?? []).length === 0);

    const room = await this.prisma.chatRoom.create({
      data: {
        type: dto.type,
        name: dto.name,
        groupId: dto.groupId,
        createdById: userId,
      },
    });

    await this.prisma.chatParticipant.createMany({
      data: memberIds.map((id) => ({
        roomId: room.id,
        userId: id,
      })),
      skipDuplicates: true,
    });

    return room;
  }

  async getRoomMessages(
    roomId: number,
    userId: number,
    query: { page?: number; pageSize?: number },
  ) {
    const participant = await this.prisma.chatParticipant.findFirst({
      where: {
        roomId,
        userId,
      },
    });

    if (!participant) {
      throw new ForbiddenException('You are not a participant of this room');
    }

    const page = Number(query.page) || 1;
    const pageSize = Number(query.pageSize) || 20;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.chatMessage.findMany({
        where: { roomId },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.chatMessage.count({
        where: { roomId },
      }),
    ]);

    return {
      results: items,
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }
}

