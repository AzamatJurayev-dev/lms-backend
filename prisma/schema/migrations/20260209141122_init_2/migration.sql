/*
  Warnings:

  - You are about to drop the column `contentType` on the `File` table. All the data in the column will be lost.
  - You are about to drop the column `file` on the `File` table. All the data in the column will be lost.
  - You are about to drop the column `fileSize` on the `File` table. All the data in the column will be lost.
  - You are about to drop the column `fileType` on the `File` table. All the data in the column will be lost.
  - Added the required column `bucket` to the `File` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mimeType` to the `File` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `File` table without a default value. This is not possible if the table is not empty.
  - Added the required column `original` to the `File` table without a default value. This is not possible if the table is not empty.
  - Added the required column `path` to the `File` table without a default value. This is not possible if the table is not empty.
  - Added the required column `size` to the `File` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "File" DROP COLUMN "contentType",
DROP COLUMN "file",
DROP COLUMN "fileSize",
DROP COLUMN "fileType",
ADD COLUMN     "bucket" TEXT NOT NULL,
ADD COLUMN     "companyId" INTEGER,
ADD COLUMN     "mimeType" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "original" TEXT NOT NULL,
ADD COLUMN     "path" TEXT NOT NULL,
ADD COLUMN     "size" INTEGER NOT NULL,
ADD COLUMN     "uploadedBy" INTEGER;
