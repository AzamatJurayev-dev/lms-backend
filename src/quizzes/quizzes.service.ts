import { Injectable } from '@nestjs/common';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { PrismaService } from '../prisma/prisma.service';
import { AttemptTarget } from '@prisma/client';

@Injectable()
export class QuizzesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateQuizDto, user: { id: number }) {
    return this.prisma.quiz.create({
      data: {
        name: dto.name,
        groupId: dto.groupId,
        duration: dto.duration,
        count: dto.count,
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
      throw new Error('Quiz not found');
    }

    const attempts = await this.prisma.attempt.findMany({
      where: {
        target: AttemptTarget.QUIZ,
        quizId: id,
      },
    });

    const totalAttempts = attempts.length;
    const scores = attempts.map((a) => a.score);
    const sum = scores.reduce((acc, v) => acc + v, 0);

    const questionIds = quiz.items.map((i) => i.questionId);

    if (!questionIds.length) {
      return {
        totalAttempts,
        averageScore: totalAttempts ? sum / totalAttempts : 0,
        maxScore: scores.length ? Math.max(...scores) : 0,
        minScore: scores.length ? Math.min(...scores) : 0,
        questions: [],
      };
    }

    const answers = await this.prisma.attemptAnswer.findMany({
      where: {
        questionId: {
          in: questionIds,
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
      const stat = statsByQuestion.get(qid) ?? { attempts: 0, correct: 0 };
      const accuracy = stat.attempts === 0 ? 0 : stat.correct / stat.attempts;

      return {
        questionId: qid,
        attempts: stat.attempts,
        correct: stat.correct,
        accuracy,
      };
    });

    return {
      totalAttempts,
      averageScore: totalAttempts ? sum / totalAttempts : 0,
      maxScore: scores.length ? Math.max(...scores) : 0,
      minScore: scores.length ? Math.min(...scores) : 0,
      questions: questionStats,
    };
  }
}
