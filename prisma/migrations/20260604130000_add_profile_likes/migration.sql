-- ProfileLike: a like from one user to a specific item on another user's profile.
CREATE TABLE "ProfileLike" (
    "id" TEXT NOT NULL,
    "likerId" TEXT NOT NULL,
    "likedUserId" TEXT NOT NULL,
    "itemKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProfileLike_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ProfileLike_likerId_likedUserId_itemKey_key"
    ON "ProfileLike"("likerId", "likedUserId", "itemKey");

CREATE INDEX "ProfileLike_likedUserId_idx" ON "ProfileLike"("likedUserId");

ALTER TABLE "ProfileLike" ADD CONSTRAINT "ProfileLike_likerId_fkey"
    FOREIGN KEY ("likerId") REFERENCES "User"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ProfileLike" ADD CONSTRAINT "ProfileLike_likedUserId_fkey"
    FOREIGN KEY ("likedUserId") REFERENCES "User"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
