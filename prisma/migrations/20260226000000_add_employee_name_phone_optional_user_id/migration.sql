-- Add name and phone to employees (for display and WhatsApp when no User)
ALTER TABLE "employees" ADD COLUMN IF NOT EXISTS "name" TEXT;
ALTER TABLE "employees" ADD COLUMN IF NOT EXISTS "phone" TEXT;

-- Backfill from users for existing employees
UPDATE "employees" e
SET "name" = u."name", "phone" = u."phone"
FROM "users" u
WHERE e."userId" = u."id";

-- Make userId optional so employees can exist without a login
ALTER TABLE "employees" ALTER COLUMN "userId" DROP NOT NULL;
