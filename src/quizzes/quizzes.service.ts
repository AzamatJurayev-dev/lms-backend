import { Injectable } from '@nestjs/common';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class QuizzesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateQuizDto, user: { id: number }) {
    return this.prisma.quiz.create({
      data: {
        ...dto,
        createdById: user.id,
        status: 'CREATED',
      },
    });
  }

  async findAll(query: any) {
    const page = Number(query.page) || 1;
    const pageSize = Number(query.pageSize) || 10;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.quiz.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.quiz.count(),
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

  async findOne(id: number) {
    return this.prisma.quiz.findUniqueOrThrow({
      where: { id },
    });
  }

  async update(id: number, dto: UpdateQuizDto) {
    return this.prisma.quiz.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number) {
    return this.prisma.quiz.delete({
      where: { id },
    });
  }

  // ---------- QUESTIONS ----------

  async addQuestions(quizId: number, dto: { questionIds: number[] }) {
    await this.prisma.quizItem.createMany({
      data: dto.questionIds.map((questionId, index) => ({
        quizId,
        questionId,
        order: index + 1,
      })),
      skipDuplicates: true,
    });

    return { message: 'Questions added to quiz' };
  }

  async getQuestions(quizId: number, query: any) {
    const page = Number(query.page) || 1;
    const pageSize = Number(query.pageSize) || 10;

    const where = {
      quizId,
      question: query.search
        ? {
            text: {
              contains: query.search,
              mode: 'insensitive',
            },
          }
        : undefined,
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.quizItem.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { order: 'asc' },
        include: {
          question: {
            include: { options: true },
          },
        },
      }),
      this.prisma.quizItem.count({ where }),
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

  async removeQuestions(quizId: number, dto: { questionIds: number[] }) {
    await this.prisma.quizItem.deleteMany({
      where: {
        quizId,
        questionId: { in: dto.questionIds },
      },
    });

    return { message: 'Questions removed from quiz' };
  }
}
