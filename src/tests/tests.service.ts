import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTestDto } from './dto/create-test.dto';
import { UpdateTestDto } from './dto/update-test.dto';
import { PrismaService } from '../prisma/prisma.service';
import { buildQuery } from '../common/query/query.helper';
import { paginate } from '../common/pagination/pagination.helper';
import { AttemptTarget, Prisma } from '@prisma/client';
import { AddTestQuestionsDto } from './dto/add-test-questions.dto';

@Injectable()
export class TestsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTestDto, user: { id: number }) {
    return this.prisma.test.create({
      data: {
        ...dto,
        createdById: Number(user.id),
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
      this.prisma.test.findMany({
        skip: q.skip,
        take: q.take,
        where: q.where,
        orderBy: q.orderBy,
      }),
      this.prisma.test.count({
        where: q.where,
      }),
    ]);

    return paginate(items, total, q.page, q.pageSize);
  }

  async findOne(id: number) {
    try {
      return await this.prisma.test.findUniqueOrThrow({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new NotFoundException(`Test with id ${id} not found`);
      }
      throw error;
    }
  }

  async update(id: number, updateTestDto: UpdateTestDto) {
    return this.prisma.test.update({
      where: { id },
      data: {
        ...updateTestDto,
      },
    });
  }

  async remove(id: number) {
    try {
      return await this.prisma.test.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new NotFoundException(`Test with id ${id} not found`);
      }
    }
  }

  async addQuestions(testId: number, dto: AddTestQuestionsDto) {
    const test = await this.prisma.test.findUnique({
      where: { id: testId },
    });

    if (!test) {
      throw new NotFoundException('Test not found');
    }

    const questions = await this.prisma.question.findMany({
      where: {
        id: { in: dto.questionIds },
      },
      select: { id: true },
    });

    if (questions.length !== dto.questionIds.length) {
      throw new BadRequestException('Some questions not found');
    }
    return this.prisma.test.update({
      where: {
        id: testId,
      },
      data: {
        questions: {
          connect: dto.questionIds.map((id) => ({ id })),
        },
      },
    });
  }

  async getQuestions(testId: number, query: any) {
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

    const where: any = {
      ...q.where,
      test: {
        where: { id: testId },
      },
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.question.findMany({
        skip: q.skip,
        take: q.take,
        where,
        orderBy: q.orderBy,
      }),
      this.prisma.testQuestion.count({
        where,
      }),
    ]);

    return paginate(items, total, q.page, q.pageSize);
  }

  async removeQuestions(testId: number, dto: { questionIds: number[] }) {
    const test = await this.prisma.test.findUnique({
      where: { id: testId },
    });

    if (!test) {
      throw new NotFoundException('Test not found');
    }
    await this.prisma.testQuestion.deleteMany({
      where: {
        testId,
        questionId: {
          in: dto.questionIds,
        },
      },
    });

    return { message: 'Questions removed from test' };
  }

  async getStats(id: number) {
    const test = await this.prisma.test.findUnique({
      where: { id },
    });

    if (!test) {
      throw new NotFoundException(`Test with id ${id} not found`);
    }

    const attempts = await this.prisma.attempt.findMany({
      where: {
        target: AttemptTarget.TEST,
        targetId: id,
      },
    });

    if (!attempts.length) {
      return {
        totalAttempts: 0,
        averageScore: 0,
        maxScore: 0,
        minScore: 0,
      };
    }

    const scores = attempts.map((a) => a.score);
    const totalAttempts = attempts.length;
    const sum = scores.reduce((acc, v) => acc + v, 0);

    return {
      totalAttempts,
      averageScore: sum / totalAttempts,
      maxScore: Math.max(...scores),
      minScore: Math.min(...scores),
    };
  }
}
