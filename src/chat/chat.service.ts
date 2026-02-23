import { BadRequestException, ForbiddenException, Injectable, } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageDto } from './dto/create-chat-message.dto';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  async getMyRooms() {
    return this.prisma.chatRoom.findMany({
      include: {
        participants: {
          include: {
            user: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });
  }

  async createRoom(
    userId: number,
    dto: {
      type: 'PRIVATE' | 'GROUP';
      memberIds?: number[];
      groupId?: number;
    },
  ) {
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

      const memberIds = [userId, targetUserId];

      return this.prisma.chatRoom.create({
        data: {
          type: 'PRIVATE',
          createdById: userId,
          participants: {
            create: memberIds.map((id) => ({
              userId: id,
            })),
          },
        },
      });
    }

    if (dto.type === 'GROUP') {
      if (!dto.groupId) {
        throw new BadRequestException('groupId is required');
      }

      const group = await this.prisma.group.findUniqueOrThrow({
        where: { id: dto.groupId },
        include: {
          students: true,
          teachers: true,
        },
      });

      const existingGroupRoom = await this.prisma.chatRoom.findFirst({
        where: {
          type: 'GROUP',
          groupId: group.id,
        },
      });

      if (existingGroupRoom) {
        return existingGroupRoom;
      }

      const userIds = [
        ...group.teachers.map((s) => s.id),
        ...group.students.map((s) => s.id),
      ];

      return this.prisma.chatRoom.create({
        data: {
          type: 'GROUP',
          groupId: group.id,
          name: group.name,
          createdById: userId,
          participants: {
            create: userIds.map((id) => ({
              userId: id,
            })),
          },
        },
      });
    }

    throw new BadRequestException('Invalid room type');
  }

  async deleteRoom(roomId: number) {
    try {
      await this.prisma.chatRoom.delete({
        where: { id: roomId },
      });
    } catch {
      throw new BadRequestException();
    }
  }

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
        include: {
          sender: true,
        },
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

  async createMessage(userId: number, dto: CreateMessageDto) {
    const { roomId, text } = dto;

    const participant = await this.prisma.chatParticipant.findFirst({
      where: { roomId, userId },
    });

    if (!participant) {
      throw new ForbiddenException();
    }

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

  async deleteMessage(id: number) {
    try {
      return this.prisma.chatMessage.delete({
        where: { id },
      });
    } catch {
      throw new ForbiddenException();
    }
  }
}
