-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "domain" TEXT,
ADD COLUMN     "onboardingComplete" BOOLEAN NOT NULL DEFAULT false;
