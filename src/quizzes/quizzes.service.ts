import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class QuizzesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateQuizDto, user: { id: number }) {
    return this.prisma.quiz.create({
      data: {
        name: dto.name,
        groupId: dto.groupId,
        duration: dto.duration,
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
      ...(query.search && {
        question: {
          is: {
            text: {
              contains: query.search,
              mode: 'insensitive',
            },
          },
        },
      }),
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

  async getStats(id: number) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    // ==============================
    // 1️⃣ Attempt statistikasi (aggregate)
    // ==============================
    const aggregate = await this.prisma.quizAttempt.aggregate({
      where: {
        quizId: id,
        endedAt: { not: null }, // faqat tugaganlar
      },
      _count: { id: true },
      _avg: { score: true },
      _max: { score: true },
      _min: { score: true },
    });

    const totalAttempts = aggregate._count.id ?? 0;

    // ==============================
    // 2️⃣ Agar savol yo‘q bo‘lsa
    // ==============================
    const questionIds = quiz.items.map((i) => i.questionId);

    if (!questionIds.length) {
      return {
        totalAttempts,
        averageScore: aggregate._avg.score ?? 0,
        maxScore: aggregate._max.score ?? 0,
        minScore: aggregate._min.score ?? 0,
        questions: [],
      };
    }

    // ==============================
    // 3️⃣ Savollar bo‘yicha javob statistikasi
    // ==============================
    const answers = await this.prisma.quizAttemptAnswer.findMany({
      where: {
        questionId: { in: questionIds },
        attempt: {
          quizId: id,
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
      questions: questionStats,
    };
  }
}
