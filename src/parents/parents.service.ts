import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateParentDto } from './dto/create-parent.dto';
import { UpdateParentDto } from './dto/update-parent.dto';

@Injectable()
export class ParentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateParentDto) {
    return this.prisma.parent.create({
      data: {
        name: dto.name,
        phone: dto.phone,
        type: dto.type,
        studentId: dto.studentId,
        companyId: dto.companyId ?? null,
      },
    });
  }

  async findAll() {
    return this.prisma.parent.findMany({
      orderBy: { id: 'asc' },
    });
  }

  async findOne(id: number) {
    const parent = await this.prisma.parent.findUnique({
      where: { id },
    });

    if (!parent) {
      throw new NotFoundException('Parent not found');
    }

    return parent;
  }

  async update(id: number, dto: UpdateParentDto) {
    await this.findOne(id);

    return this.prisma.parent.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.parent.delete({
      where: { id },
    });
  }
}
