import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  /* ===============================
     GET MY ROOMS
  =============================== */
  async getMyRooms(userId: number) {
    const participants = await this.prisma.chatParticipant.findMany({
      where: { userId },
      include: {
        room: {
          include: {
            participants: {
              include: {
                user: {
                  select: { id: true, firstName: true, lastName: true },
                },
              },
            },
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        },
      },
      orderBy: {
        room: { updatedAt: 'desc' },
      },
    });

    return participants.map((p) => p.room);
  }

  /* ===============================
     CREATE ROOM
  =============================== */
  async createRoom(
    userId: number,
    dto: {
      type: 'PRIVATE' | 'GROUP';
      name?: string;
      memberIds?: number[];
    },
  ) {
    if (dto.type === 'GROUP' && !dto.name) {
      throw new BadRequestException('Group name is required');
    }

    /* ===============================
       PRIVATE VALIDATION
    =============================== */
    if (dto.type === 'PRIVATE') {
      if (!dto.memberIds || dto.memberIds.length !== 1) {
        throw new BadRequestException(
          'PRIVATE chat must have exactly 1 target user',
        );
      }

      const targetUserId = dto.memberIds[0];

      if (targetUserId === userId) {
        throw new BadRequestException('You cannot chat with yourself');
      }

      const existing = await this.prisma.chatRoom.findFirst({
        where: {
          type: 'PRIVATE',
          AND: [
            { participants: { some: { userId } } },
            { participants: { some: { userId: targetUserId } } },
          ],
        },
        include: { participants: true },
      });

      if (existing && existing.participants.length === 2) {
        return existing;
      }
    }

    const memberIds = Array.from(new Set([userId, ...(dto.memberIds ?? [])]));

    return this.prisma.chatRoom.create({
      data: {
        type: dto.type,
        name: dto.type === 'GROUP' ? dto.name : null,
        createdById: userId,
        participants: {
          create: memberIds.map((id) => ({
            userId: id,
          })),
        },
      },
    });
  }

  /* ===============================
     GET ROOM MESSAGES
  =============================== */
  async getRoomMessages(
    roomId: number,
    userId: number,
    query: { page?: number; pageSize?: number },
  ) {
    const participant = await this.prisma.chatParticipant.findFirst({
      where: { roomId, userId },
    });

    if (!participant) {
      throw new ForbiddenException();
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
      this.prisma.chatMessage.count({ where: { roomId } }),
    ]);

    return {
      results: items.reverse(),
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  /* ===============================
     CREATE MESSAGE
  =============================== */
  async createMessage(userId: number, roomId: number, text: string) {
    const participant = await this.prisma.chatParticipant.findFirst({
      where: { roomId, userId },
    });

    if (!participant) throw new ForbiddenException();

    const message = await this.prisma.chatMessage.create({
      data: {
        text,
        roomId,
        senderId: userId,
      },
    });

    await this.prisma.chatRoom.update({
      where: { id: roomId },
      data: { updatedAt: new Date() },
    });

    return message;
  }
}
