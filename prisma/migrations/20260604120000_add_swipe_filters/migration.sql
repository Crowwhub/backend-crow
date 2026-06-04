-- Add a JSON column to Swipe holding the advanced filters that were active
-- when the swipe was created (personType, location, interest, goal, skill).
ALTER TABLE "Swipe" ADD COLUMN "filters" JSONB;
