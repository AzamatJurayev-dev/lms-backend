import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';

@Injectable()
export class PlansService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePlanDto) {
    const exists = await this.prisma.plan.findUnique({
      where: { code: dto.code },
    });

    if (exists) {
      throw new ConflictException('Plan code already exists');
    }

    return this.prisma.plan.create({
      data: dto,
    });
  }

  async findAll() {
    return this.prisma.plan.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const plan = await this.prisma.plan.findUnique({
      where: { id },
    });

    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    return plan;
  }

  async update(id: number, dto: UpdatePlanDto) {
    await this.findOne(id);

    return this.prisma.plan.update({
      where: { id },
      data: dto,
    });
  }

  async disable(id: number) {
    await this.findOne(id);

    return this.prisma.plan.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async enable(id: number) {
    await this.findOne(id);

    return this.prisma.plan.update({
      where: { id },
      data: { isActive: true },
    });
  }
}
