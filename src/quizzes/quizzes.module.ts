import { Module } from '@nestjs/common';
import { QuizzesService } from './quizzes.service';
import { QuizzesController } from './quizzes.controller';
import { QuizAttemptsService } from './quiz-attempts.service';

@Module({
  controllers: [QuizzesController],
  providers: [QuizzesService, QuizAttemptsService],
})
export class QuizzesModule {}
