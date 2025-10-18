-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "username" TEXT NOT NULL,
    "age" INTEGER,
    "gender" TEXT,
    "email" TEXT NOT NULL,
    "photo" TEXT,
    "language" TEXT,
    "interests" TEXT[],
    "favouriteTools" TEXT[],
    "personType" TEXT NOT NULL,
    "skills" TEXT[],
    "madeTillFar" TEXT,
    "promptTagline" TEXT,
    "purpose" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "public"."User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");
