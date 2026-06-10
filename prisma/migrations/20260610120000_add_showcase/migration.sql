-- AlterTable: showcase items (array of { title, type, description, link })
ALTER TABLE "User" ADD COLUMN "showcase" JSONB;
