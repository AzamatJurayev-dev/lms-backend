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
import { Prisma } from '@prisma/client';
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
        include: {
          createdBy: true,
        },
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
    try {
      return await this.prisma.test.update({
        where: { id: testId },
        data: {
          questions: {
            connect: dto.questionIds.map((id) => ({ id })),
          },
        },
        include: {
          questions: true,
        },
      });
    } catch (error) {
      throw new BadRequestException('Invalid testId or questionIds');
    }
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
      tests: {
        some: { id: testId },
      },
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.question.findMany({
        skip: q.skip,
        take: q.take,
        where,
        orderBy: q.orderBy,
        include: {
          options: true,
        },
      }),
      this.prisma.question.count({
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

    await this.prisma.test.update({
      where: { id: testId },
      data: {
        questions: {
          disconnect: dto.questionIds.map((id) => ({ id })),
        },
      },
    });

    return { message: 'Questions removed from test' };
  }

  async getStats(testId: number) {
    const test = await this.prisma.test.findUnique({
      where: { id: testId },
      include: {
        questions: true,
      },
    });

    if (!test) {
      throw new NotFoundException('Test not found');
    }

    // ==============================
    // 1️⃣ Attempt Aggregate
    // ==============================
    const aggregate = await this.prisma.testAttempt.aggregate({
      where: {
        testId,
        endedAt: { not: null },
      },
      _count: { id: true },
      _avg: { score: true },
      _max: { score: true },
      _min: { score: true },
    });

    const totalAttempts = aggregate._count.id ?? 0;

    // ==============================
    // 2️⃣ Pass Rate
    // ==============================
    const passedCount = await this.prisma.testAttempt.count({
      where: {
        testId,
        endedAt: { not: null },
        passed: true,
      },
    });

    const passRate =
      totalAttempts === 0
        ? 0
        : Number((passedCount / totalAttempts).toFixed(2));

    // ==============================
    // 3️⃣ Question-level stats
    // ==============================
    const questionIds = test.questions.map((q) => q.id);

    if (!questionIds.length) {
      return {
        totalAttempts,
        averageScore: aggregate._avg.score ?? 0,
        maxScore: aggregate._max.score ?? 0,
        minScore: aggregate._min.score ?? 0,
        passRate,
        questions: [],
      };
    }

    const answers = await this.prisma.testAttemptAnswer.findMany({
      where: {
        questionId: { in: questionIds },
        attempt: {
          testId,
          endedAt: { not: null },
        },
      },
      include: {
        option: true,
      },
    });

    const statsByQuestion = new Map<
      number,
      { attempts: number; correct: number }
    >();

    for (const ans of answers) {
      const stat = statsByQuestion.get(ans.questionId) ?? {
        attempts: 0,
        correct: 0,
      };

      stat.attempts += 1;

      if (ans.option.isCorrect) {
        stat.correct += 1;
      }

      statsByQuestion.set(ans.questionId, stat);
    }

    const questionStats = questionIds.map((qid) => {
      const stat = statsByQuestion.get(qid) ?? {
        attempts: 0,
        correct: 0,
      };

      return {
        questionId: qid,
        attempts: stat.attempts,
        correct: stat.correct,
        accuracy:
          stat.attempts === 0
            ? 0
            : Number((stat.correct / stat.attempts).toFixed(2)),
      };
    });

    return {
      totalAttempts,
      averageScore: aggregate._avg.score ?? 0,
      maxScore: aggregate._max.score ?? 0,
      minScore: aggregate._min.score ?? 0,
      passRate,
      questions: questionStats,
    };
  }
}
