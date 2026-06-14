-- AlterTable: education course/degree + profile-completion tracking
ALTER TABLE "User" ADD COLUMN "course" TEXT;
ALTER TABLE "User" ADD COLUMN "profileCompletedAt" TIMESTAMP(3);
