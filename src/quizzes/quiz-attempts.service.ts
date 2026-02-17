import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class QuizAttemptsService {
  constructor(private readonly prisma: PrismaService) {}

  // ==============================
  // START QUIZ
  // ==============================
  async start(userId: number, quizId: number) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
    });

    if (!quiz) throw new NotFoundException('Quiz not found');

    if (quiz.status !== 'STARTED') {
      throw new BadRequestException('Quiz not active');
    }

    return this.prisma.quizAttempt.create({
      data: {
        userId,
        quizId,
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
    const attempt = await this.prisma.quizAttempt.findUnique({
      where: { id: attemptId },
    });

    if (!attempt) throw new NotFoundException('Attempt not found');
    if (attempt.userId !== userId)
      throw new BadRequestException('Not your attempt');
    if (attempt.endedAt)
      throw new BadRequestException('Attempt already finished');

    return this.prisma.quizAttemptAnswer.upsert({
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
  // FINISH QUIZ
  // ==============================
  async finish(userId: number, attemptId: number) {
    const attempt = await this.prisma.quizAttempt.findUnique({
      where: { id: attemptId },
      include: {
        answers: { include: { option: true } },
        quiz: true,
      },
    });

    if (!attempt) throw new NotFoundException('Attempt not found');
    if (attempt.userId !== userId)
      throw new BadRequestException('Not your attempt');

    if (attempt.endedAt) return attempt;

    const score = attempt.answers.filter((a) => a.option.isCorrect).length;

    const updated = await this.prisma.quizAttempt.update({
      where: { id: attemptId },
      data: {
        endedAt: new Date(),
        score,
      },
    });

    // Leaderboard update
    await this.prisma.quizLeaderboard.upsert({
      where: {
        quizId_userId: {
          quizId: attempt.quizId,
          userId,
        },
      },
      update: { score },
      create: {
        quizId: attempt.quizId,
        userId,
        score,
        position: 0, // keyin recalculation qilinadi
      },
    });

    return updated;
  }
}
