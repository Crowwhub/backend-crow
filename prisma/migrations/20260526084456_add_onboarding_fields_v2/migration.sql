-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "avatar" TEXT,
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "birthday" TIMESTAMP(3),
ADD COLUMN     "currentlyWorkingOn" TEXT,
ADD COLUMN     "experience" INTEGER,
ADD COLUMN     "experienceLevel" TEXT,
ADD COLUMN     "exploringInterests" TEXT[],
ADD COLUMN     "findMeFor" TEXT[],
ADD COLUMN     "goals" TEXT[],
ADD COLUMN     "location" TEXT,
ADD COLUMN     "personType" TEXT,
ADD COLUMN     "practiceYears" INTEGER,
ADD COLUMN     "role" TEXT;
