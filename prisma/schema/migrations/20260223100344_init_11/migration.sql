/*
  Warnings:

  - You are about to drop the column `fileUrl` on the `Certificate` table. All the data in the column will be lost.
  - You are about to drop the column `html` on the `CertificateTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `CertificateTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `CertificateTemplate` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[certificateNo]` on the table `Certificate` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[type]` on the table `CertificateTemplate` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `certificateNo` to the `Certificate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `courseName` to the `Certificate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fullName` to the `Certificate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `height` to the `CertificateTemplate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `imageUrl` to the `CertificateTemplate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `CertificateTemplate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `width` to the `CertificateTemplate` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CertificateTemplateType" AS ENUM ('CLASSIC', 'MODERN');

-- DropForeignKey
ALTER TABLE "Certificate" DROP CONSTRAINT "Certificate_groupId_fkey";

-- DropForeignKey
ALTER TABLE "Certificate" DROP CONSTRAINT "Certificate_studentId_fkey";

-- AlterTable
ALTER TABLE "Certificate" DROP COLUMN "fileUrl",
ADD COLUMN     "certificateNo" TEXT NOT NULL,
ADD COLUMN     "courseName" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "fullName" TEXT NOT NULL,
ALTER COLUMN "studentId" DROP NOT NULL,
ALTER COLUMN "groupId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "CertificateTemplate" DROP COLUMN "html",
DROP COLUMN "isActive",
DROP COLUMN "updatedAt",
ADD COLUMN     "height" INTEGER NOT NULL,
ADD COLUMN     "imageUrl" TEXT NOT NULL,
ADD COLUMN     "type" "CertificateTemplateType" NOT NULL,
ADD COLUMN     "width" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Teacher" ADD COLUMN     "birthDate" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "Certificate_certificateNo_key" ON "Certificate"("certificateNo");

-- CreateIndex
CREATE UNIQUE INDEX "CertificateTemplate_type_key" ON "CertificateTemplate"("type");

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE SET NULL ON UPDATE CASCADE;
