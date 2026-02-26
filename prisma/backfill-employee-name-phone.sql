-- Backfill employee name and phone from users (run once after schema change)
UPDATE "employees" e
SET "name" = u."name", "phone" = u."phone"
FROM "users" u
WHERE e."userId" = u."id";
