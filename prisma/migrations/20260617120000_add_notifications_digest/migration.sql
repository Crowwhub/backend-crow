-- Email digest notification system: activity events + per-user digest delivery log.

-- User activity timestamp (drives "skip currently-active users" in the digest).
ALTER TABLE "User" ADD COLUMN "lastActiveAt" TIMESTAMP(3);

-- Enums
CREATE TYPE "NotificationType" AS ENUM (
    'NEW_MESSAGE',
    'COLLAB_REQUEST',
    'PROJECT_INVITE',
    'NEW_MATCH',
    'PROFILE_INTERACTION'
);

CREATE TYPE "EmailDeliveryStatus" AS ENUM (
    'PENDING',
    'SENT',
    'FAILED'
);

-- Notification: one activity event for a recipient.
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "actorId" TEXT,
    "metadata" JSONB,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "emailedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- Drives the digest collection query (unread + un-emailed, grouped per user).
CREATE INDEX "Notification_userId_read_emailedAt_idx"
    ON "Notification"("userId", "read", "emailedAt");

CREATE INDEX "Notification_userId_createdAt_idx"
    ON "Notification"("userId", "createdAt");

ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- EmailDigestLog: one row per digest email attempt (audit + retry bookkeeping).
CREATE TABLE "EmailDigestLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "EmailDeliveryStatus" NOT NULL DEFAULT 'PENDING',
    "notificationCount" INTEGER NOT NULL DEFAULT 0,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "providerMessageId" TEXT,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EmailDigestLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "EmailDigestLog_userId_createdAt_idx"
    ON "EmailDigestLog"("userId", "createdAt");

CREATE INDEX "EmailDigestLog_status_idx" ON "EmailDigestLog"("status");

ALTER TABLE "EmailDigestLog" ADD CONSTRAINT "EmailDigestLog_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
