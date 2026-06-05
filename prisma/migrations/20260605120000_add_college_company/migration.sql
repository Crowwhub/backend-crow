-- Optional affiliation fields on User: college (for students/freelancers/all) and company (for professionals).
ALTER TABLE "User" ADD COLUMN "college" TEXT;
ALTER TABLE "User" ADD COLUMN "company" TEXT;
