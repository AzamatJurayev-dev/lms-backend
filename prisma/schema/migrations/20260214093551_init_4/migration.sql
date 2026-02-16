/*
  Warnings:

  - You are about to drop the column `photo` on the `Student` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Student" DROP CONSTRAINT "Student_id_fkey";

-- AlterTable
ALTER TABLE "Student" DROP COLUMN "photo",
ADD COLUMN     "address" TEXT,
ADD COLUMN     "birthDate" TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_id_fkey" FOREIGN KEY ("id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
