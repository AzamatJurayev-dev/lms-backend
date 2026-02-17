import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TestAttemptsService {
  constructor(private readonly prisma: PrismaService) {}

  // ==============================
  // START TEST ATTEMPT
  // ==============================
  async start(userId: number, testId: number) {
    const test = await this.prisma.test.findUnique({
      where: { id: testId },
    });

    if (!test) throw new NotFoundException('Test not found');

    if (test.status !== 'PUBLISHED') {
      throw new BadRequestException('Test not published');
    }

    return this.prisma.testAttempt.create({
      data: {
        userId,
        testId,
      },
    });
  }

  // ==============================
  // SAVE ANSWER
  // ==============================
  async saveAnswer(
    userId: number,
    attemptId: number,
    questionId: number,
    optionId: number,
  ) {
    const attempt = await this.prisma.testAttempt.findUnique({
      where: { id: attemptId },
    });

    if (!attempt) throw new NotFoundException('Attempt not found');
    if (attempt.userId !== userId)
      throw new BadRequestException('Not your attempt');
    if (attempt.endedAt)
      throw new BadRequestException('Attempt already finished');

    // Question testga tegishli ekanligini tekshirish
    const question = await this.prisma.question.findFirst({
      where: {
        id: questionId,
        tests: { some: { id: attempt.testId } },
      },
    });

    if (!question) throw new BadRequestException('Question not in this test');

    return this.prisma.testAttemptAnswer.upsert({
      where: {
        attemptId_questionId: {
          attemptId,
          questionId,
        },
      },
      update: { optionId },
      create: {
        attemptId,
        questionId,
        optionId,
      },
    });
  }

  // ==============================
  // FINISH TEST
  // ==============================
  async finish(userId: number, attemptId: number) {
    const attempt = await this.prisma.testAttempt.findUnique({
      where: { id: attemptId },
      include: {
        answers: { include: { option: true } },
        test: true,
      },
    });

    if (!attempt) throw new NotFoundException('Attempt not found');
    if (attempt.userId !== userId)
      throw new BadRequestException('Not your attempt');

    if (attempt.endedAt) return attempt;

    const score = attempt.answers.filter((a) => a.option.isCorrect).length;

    const passed = score >= 60;

    return this.prisma.testAttempt.update({
      where: { id: attemptId },
      data: {
        endedAt: new Date(),
        score,
        passed,
      },
    });
  }

  // ==============================
  // AUTO FINISH CHECK
  // ==============================
  async getActiveAttempt(userId: number, testId: number) {
    const attempt = await this.prisma.testAttempt.findFirst({
      where: {
        userId,
        testId,
        endedAt: null,
      },
    });

    if (!attempt) return null;

    const test = await this.prisma.test.findUnique({
      where: { id: testId },
    });

    const now = new Date();
    const endTime = new Date(
      attempt.startedAt.getTime() + Number(test?.duration) * 60000,
    );

    if (now > endTime) {
      return this.finish(userId, attempt.id);
    }

    return attempt;
  }
}
