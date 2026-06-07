-- AlterTable: add swipe-streak tracking to User
ALTER TABLE "User" ADD COLUMN "swipeStreak" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN "lastSwipeAt" TIMESTAMP(3);
