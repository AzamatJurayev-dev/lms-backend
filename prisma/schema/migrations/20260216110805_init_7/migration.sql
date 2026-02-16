/*
  Warnings:

  - You are about to drop the column `duration` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `points` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Quiz` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Quiz` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Test` table. All the data in the column will be lost.
  - You are about to drop the `QuizAnswer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `QuizAttempt` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TestAnswer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TestAttempt` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ExamToQuestion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_QuestionToQuiz` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_QuestionToTest` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `subjectId` on table `Question` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `count` to the `Quiz` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdById` to the `Quiz` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Quiz` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `Quiz` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Quiz` table without a default value. This is not possible if the table is not empty.
  - Made the column `groupId` on table `Quiz` required. This step will fail if there are existing NULL values in that column.
  - Made the column `duration` on table `Quiz` required. This step will fail if there are existing NULL values in that column.
  - Made the column `duration` on table `Test` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "QuestionSource" AS ENUM ('PDF', 'MANUAL');

-- CreateEnum
CREATE TYPE "QuizStatus" AS ENUM ('CREATED', 'READY', 'STARTED', 'FINISHED');

-- CreateEnum
CREATE TYPE "TestStatus" AS ENUM ('DRAFT', 'GENERATED', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "AttemptTarget" AS ENUM ('TEST', 'QUIZ');

-- DropForeignKey
ALTER TABLE "Option" DROP CONSTRAINT "Option_questionId_fkey";

-- DropForeignKey
ALTER TABLE "Question" DROP CONSTRAINT "Question_subjectId_fkey";

-- DropForeignKey
ALTER TABLE "Question" DROP CONSTRAINT "Question_userId_fkey";

-- DropForeignKey
ALTER TABLE "Quiz" DROP CONSTRAINT "Quiz_groupId_fkey";

-- DropForeignKey
ALTER TABLE "Quiz" DROP CONSTRAINT "Quiz_userId_fkey";

-- DropForeignKey
ALTER TABLE "QuizAnswer" DROP CONSTRAINT "QuizAnswer_attemptId_fkey";

-- DropForeignKey
ALTER TABLE "QuizAnswer" DROP CONSTRAINT "QuizAnswer_optionId_fkey";

-- DropForeignKey
ALTER TABLE "QuizAnswer" DROP CONSTRAINT "QuizAnswer_questionId_fkey";

-- DropForeignKey
ALTER TABLE "QuizAttempt" DROP CONSTRAINT "QuizAttempt_quizId_fkey";

-- DropForeignKey
ALTER TABLE "Test" DROP CONSTRAINT "Test_userId_fkey";

-- DropForeignKey
ALTER TABLE "TestAnswer" DROP CONSTRAINT "TestAnswer_attemptId_fkey";

-- DropForeignKey
ALTER TABLE "TestAnswer" DROP CONSTRAINT "TestAnswer_optionId_fkey";

-- DropForeignKey
ALTER TABLE "TestAnswer" DROP CONSTRAINT "TestAnswer_questionId_fkey";

-- DropForeignKey
ALTER TABLE "TestAttempt" DROP CONSTRAINT "TestAttempt_testId_fkey";

-- DropForeignKey
ALTER TABLE "_ExamToQuestion" DROP CONSTRAINT "_ExamToQuestion_A_fkey";

-- DropForeignKey
ALTER TABLE "_ExamToQuestion" DROP CONSTRAINT "_ExamToQuestion_B_fkey";

-- DropForeignKey
ALTER TABLE "_QuestionToQuiz" DROP CONSTRAINT "_QuestionToQuiz_A_fkey";

-- DropForeignKey
ALTER TABLE "_QuestionToQuiz" DROP CONSTRAINT "_QuestionToQuiz_B_fkey";

-- DropForeignKey
ALTER TABLE "_QuestionToTest" DROP CONSTRAINT "_QuestionToTest_A_fkey";

-- DropForeignKey
ALTER TABLE "_QuestionToTest" DROP CONSTRAINT "_QuestionToTest_B_fkey";

-- DropIndex
DROP INDEX "Question_difficulty_type_idx";

-- AlterTable
ALTER TABLE "Option" ALTER COLUMN "isCorrect" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Question" DROP COLUMN "duration",
DROP COLUMN "points",
DROP COLUMN "type",
DROP COLUMN "userId",
ADD COLUMN     "createdById" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "examId" INTEGER,
ADD COLUMN     "source" "QuestionSource" NOT NULL DEFAULT 'MANUAL',
ALTER COLUMN "subjectId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Quiz" DROP COLUMN "title",
DROP COLUMN "userId",
ADD COLUMN     "count" INTEGER NOT NULL,
ADD COLUMN     "createdById" INTEGER NOT NULL,
ADD COLUMN     "finishedAt" TIMESTAMP(3),
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "startedAt" TIMESTAMP(3),
ADD COLUMN     "status" "QuizStatus" NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "groupId" SET NOT NULL,
ALTER COLUMN "duration" SET NOT NULL;

-- AlterTable
ALTER TABLE "Test" DROP COLUMN "userId",
ADD COLUMN     "createdById" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "status" "TestStatus" NOT NULL DEFAULT 'DRAFT',
ALTER COLUMN "duration" SET NOT NULL;

-- DropTable
DROP TABLE "QuizAnswer";

-- DropTable
DROP TABLE "QuizAttempt";

-- DropTable
DROP TABLE "TestAnswer";

-- DropTable
DROP TABLE "TestAttempt";

-- DropTable
DROP TABLE "_ExamToQuestion";

-- DropTable
DROP TABLE "_QuestionToQuiz";

-- DropTable
DROP TABLE "_QuestionToTest";

-- DropEnum
DROP TYPE "QuestionType";

-- CreateTable
CREATE TABLE "QuizItem" (
    "id" SERIAL NOT NULL,
    "quizId" INTEGER NOT NULL,
    "questionId" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "QuizItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizLeaderboard" (
    "id" SERIAL NOT NULL,
    "quizId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "QuizLeaderboard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestQuestion" (
    "id" SERIAL NOT NULL,
    "testId" INTEGER NOT NULL,
    "questionId" INTEGER NOT NULL,

    CONSTRAINT "TestQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attempt" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "targetId" INTEGER NOT NULL,
    "target" "AttemptTarget" NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "quizId" INTEGER,

    CONSTRAINT "Attempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttemptAnswer" (
    "id" SERIAL NOT NULL,
    "attemptId" INTEGER NOT NULL,
    "questionId" INTEGER NOT NULL,
    "optionId" INTEGER NOT NULL,

    CONSTRAINT "AttemptAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "QuizItem_questionId_idx" ON "QuizItem"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "QuizItem_quizId_questionId_key" ON "QuizItem"("quizId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "QuizItem_quizId_order_key" ON "QuizItem"("quizId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "QuizLeaderboard_quizId_userId_key" ON "QuizLeaderboard"("quizId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "TestQuestion_testId_questionId_key" ON "TestQuestion"("testId", "questionId");

-- CreateIndex
CREATE INDEX "Question_subjectId_difficulty_idx" ON "Question"("subjectId", "difficulty");

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Option" ADD CONSTRAINT "Option_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizItem" ADD CONSTRAINT "QuizItem_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizItem" ADD CONSTRAINT "QuizItem_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizLeaderboard" ADD CONSTRAINT "QuizLeaderboard_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizLeaderboard" ADD CONSTRAINT "QuizLeaderboard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Test" ADD CONSTRAINT "Test_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestQuestion" ADD CONSTRAINT "TestQuestion_testId_fkey" FOREIGN KEY ("testId") REFERENCES "Test"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestQuestion" ADD CONSTRAINT "TestQuestion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attempt" ADD CONSTRAINT "Attempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attempt" ADD CONSTRAINT "Attempt_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttemptAnswer" ADD CONSTRAINT "AttemptAnswer_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "Attempt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttemptAnswer" ADD CONSTRAINT "AttemptAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttemptAnswer" ADD CONSTRAINT "AttemptAnswer_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "Option"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
