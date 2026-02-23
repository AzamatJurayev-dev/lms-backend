import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { PrismaService } from '../prisma/prisma.service';
import { buildQuery } from '../common/query/query.helper';
import { paginate } from '../common/pagination/pagination.helper';

@Injectable()
export class QuestionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateQuestionDto, user: { id: number }) {
    if (!user) {
      throw new BadRequestException('user not found');
    }
    const subject = this.prisma.subject.findUnique({
      where: {
        id: dto.subjectId,
      },
    });

    if (!subject) {
      throw new BadRequestException('Subject not found');
    }

    return this.prisma.question.create({
      data: {
        text: dto.text,
        difficulty: dto.difficulty,
        source: 'MANUAL',
        subjectId: dto.subjectId,
        createdById: user.id,
        options: {
          create: dto.options.map((o) => ({
            text: o.text,
            isCorrect: o.isCorrect,
          })),
        },
      },
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
        allowedOrderFields: ['name', 'code', 'createdAt', 'isActive'],
        allowedFilterFields: ['isActive'],
        searchableFields: ['name', 'code', 'email', 'phone'],
        defaultOrderBy: { createdAt: 'desc' },
        dateField: 'createdAt',
      },
    );
    const [items, total] = await this.prisma.$transaction([
      this.prisma.question.findMany({
        skip: q.skip,
        take: q.take,
        where: q.where,
        orderBy: q.orderBy,
        include: {
          options: true,
        },
      }),
      this.prisma.question.count({
        where: q.where,
      }),
    ]);

    return paginate(items, total, q.page, q.pageSize);
  }

  findOne(id: number) {
    try {
      return this.prisma.question.findUnique({
        where: { id },
        include: {
          options: true,
          subject: true,
        },
      });
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  async update(id: number, dto: UpdateQuestionDto) {
    try {
      const { options, subjectId, ...rest } = dto;

      await this.prisma.question.update({
        where: { id },
        data: {
          ...rest,
          subject: {
            connect: { id: subjectId },
          },
          options: {
            deleteMany: {},
            create: options,
          },
        },
      });
    } catch {
      throw new BadRequestException('Update question failed');
    }
  }

  remove(id: number) {
    return `This action removes a #${id} question`;
  }
}
