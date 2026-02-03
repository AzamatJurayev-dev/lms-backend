-- AlterTable
ALTER TABLE "Lesson" ADD COLUMN     "scheduleId" INTEGER;

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "Schedule"("id") ON DELETE SET NULL ON UPDATE CASCADE;
