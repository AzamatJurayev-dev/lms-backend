/*
  Warnings:

  - You are about to drop the `Company` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Group` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Level` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Parent` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Permission` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PermissionTranslation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Role` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RoleTranslation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Room` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Schedule` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Student` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Subject` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Teacher` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_GroupToStudent` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_GroupToTeacher` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_RolePermissions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_SubjectToTeacher` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Group" DROP CONSTRAINT "Group_levelId_fkey";

-- DropForeignKey
ALTER TABLE "Group" DROP CONSTRAINT "Group_roomId_fkey";

-- DropForeignKey
ALTER TABLE "Group" DROP CONSTRAINT "Group_subjectId_fkey";

-- DropForeignKey
ALTER TABLE "Parent" DROP CONSTRAINT "Parent_studentId_fkey";

-- DropForeignKey
ALTER TABLE "Permission" DROP CONSTRAINT "Permission_parentId_fkey";

-- DropForeignKey
ALTER TABLE "PermissionTranslation" DROP CONSTRAINT "PermissionTranslation_permissionId_fkey";

-- DropForeignKey
ALTER TABLE "RoleTranslation" DROP CONSTRAINT "RoleTranslation_roleId_fkey";

-- DropForeignKey
ALTER TABLE "Schedule" DROP CONSTRAINT "Schedule_groupId_fkey";

-- DropForeignKey
ALTER TABLE "Student" DROP CONSTRAINT "Student_id_fkey";

-- DropForeignKey
ALTER TABLE "Teacher" DROP CONSTRAINT "Teacher_id_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_companyId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_roleId_fkey";

-- DropForeignKey
ALTER TABLE "_GroupToStudent" DROP CONSTRAINT "_GroupToStudent_A_fkey";

-- DropForeignKey
ALTER TABLE "_GroupToStudent" DROP CONSTRAINT "_GroupToStudent_B_fkey";

-- DropForeignKey
ALTER TABLE "_GroupToTeacher" DROP CONSTRAINT "_GroupToTeacher_A_fkey";

-- DropForeignKey
ALTER TABLE "_GroupToTeacher" DROP CONSTRAINT "_GroupToTeacher_B_fkey";

-- DropForeignKey
ALTER TABLE "_RolePermissions" DROP CONSTRAINT "_RolePermissions_A_fkey";

-- DropForeignKey
ALTER TABLE "_RolePermissions" DROP CONSTRAINT "_RolePermissions_B_fkey";

-- DropForeignKey
ALTER TABLE "_SubjectToTeacher" DROP CONSTRAINT "_SubjectToTeacher_A_fkey";

-- DropForeignKey
ALTER TABLE "_SubjectToTeacher" DROP CONSTRAINT "_SubjectToTeacher_B_fkey";

-- DropTable
DROP TABLE "Company";

-- DropTable
DROP TABLE "Group";

-- DropTable
DROP TABLE "Level";

-- DropTable
DROP TABLE "Parent";

-- DropTable
DROP TABLE "Permission";

-- DropTable
DROP TABLE "PermissionTranslation";

-- DropTable
DROP TABLE "Role";

-- DropTable
DROP TABLE "RoleTranslation";

-- DropTable
DROP TABLE "Room";

-- DropTable
DROP TABLE "Schedule";

-- DropTable
DROP TABLE "Student";

-- DropTable
DROP TABLE "Subject";

-- DropTable
DROP TABLE "Teacher";

-- DropTable
DROP TABLE "User";

-- DropTable
DROP TABLE "_GroupToStudent";

-- DropTable
DROP TABLE "_GroupToTeacher";

-- DropTable
DROP TABLE "_RolePermissions";

-- DropTable
DROP TABLE "_SubjectToTeacher";

-- DropEnum
DROP TYPE "ParentType";

-- DropEnum
DROP TYPE "WeekDays";
