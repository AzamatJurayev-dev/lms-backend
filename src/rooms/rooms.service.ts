import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { PrismaService } from '../prisma/prisma.service';
import { paginate } from '../common/pagination/pagination.helper';

@Injectable()
export class RoomsService {
  constructor(private prisma: PrismaService) {}

  create(createRoomDto: CreateRoomDto) {
    return this.prisma.room.create({
      data: { ...createRoomDto },
    });
  }

  async findAll(page: number, page_size: number) {
    const skip = (page - 1) * page_size;
    const [rooms, total] = await Promise.all([
      this.prisma.room.findMany({
        skip,
        take: page_size,
      }),
      this.prisma.room.count(),
    ]);

    return paginate(rooms, total, page, page_size);
  }

  findOne(id: number) {
    return this.prisma.room.findUnique({
      where: { id },
    });
  }

  async update(id: number, updateRoomDto: UpdateRoomDto) {
    try {
      await this.prisma.room.update({
        where: { id },
        data: { ...updateRoomDto },
      });
    } catch {
      throw new NotFoundException('Company not found');
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.room.delete({
        where: { id },
      });
    } catch (e) {
      if (e.code === 'P2025') {
        throw new NotFoundException('Company not found');
      }
      throw e;
    }
  }
}
