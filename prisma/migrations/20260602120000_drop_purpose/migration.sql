-- Preserve existing purpose values by folding them into findMeFor before dropping.
UPDATE "User"
SET "findMeFor" = (
    SELECT ARRAY(SELECT DISTINCT unnest("findMeFor" || "purpose"))
)
WHERE array_length("purpose", 1) > 0;

-- Drop User.purpose column.
ALTER TABLE "User" DROP COLUMN "purpose";

-- Replace Swipe.purpose (enum) with intent (free-text), nullable.
ALTER TABLE "Swipe" ADD COLUMN "intent" TEXT;
ALTER TABLE "Swipe" DROP COLUMN "purpose";

-- Replace Match.purpose (enum) with intent (free-text), nullable.
ALTER TABLE "Match" ADD COLUMN "intent" TEXT;
ALTER TABLE "Match" DROP COLUMN "purpose";

-- Drop the now-unreferenced enum.
DROP TYPE "SwipePurpose";
