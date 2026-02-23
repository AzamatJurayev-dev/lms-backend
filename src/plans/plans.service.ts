import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { buildQuery } from '../common/query/query.helper';
import { paginate } from '../common/pagination/pagination.helper';

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

  async findAll(query: any) {
    const q = buildQuery(
      {
        page: query.page,
        pageSize: query.pageSize,
        ordering: query.ordering,
        search: query.search,
        date_from: query.date_from,
        date_to: query.date_to,
        filters: {
          isActive: query.isActive,
        },
      },
      {
        allowedOrderFields: ['isActive', 'name'],
        allowedFilterFields: ['isActive'],
        searchableFields: ['name'],
        defaultOrderBy: { createdAt: 'desc' },
        dateField: 'createdAt',
      },
    );

    const where: any = {
      ...q.where,
    };
    const [items, total] = await Promise.all([
      this.prisma.plan.findMany({
        where,
      }),
      this.prisma.plan.count(),
    ]);

    return paginate(items, total, q.page, q.pageSize);
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
