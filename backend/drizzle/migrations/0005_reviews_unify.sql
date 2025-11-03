-- Unify customer->provider and provider->customer reviews in single table
-- 1) Add new columns
ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "reviewer_id" integer REFERENCES "users"("id");
ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "reviewee_id" integer REFERENCES "users"("id");
-- enum creation is manual in SQL; use a plain text with check for safety if enum doesn't exist
DO $$ BEGIN
  CREATE TYPE review_target AS ENUM ('provider','customer');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "target" review_target;

-- 2) Backfill existing rows as customer->provider
UPDATE "reviews" r
SET reviewer_id = COALESCE(r.reviewer_id, r.user_id),
    reviewee_id = COALESCE(r.reviewee_id, r.provider_id),
    target = COALESCE(r.target, 'provider')
WHERE r.target IS NULL;

-- 3) Replace unique index to allow two reviews per booking (one per target)
DO $$ BEGIN
  DROP INDEX IF EXISTS "reviews_booking_unique";
EXCEPTION WHEN undefined_object THEN NULL; END $$;
CREATE UNIQUE INDEX IF NOT EXISTS "reviews_booking_target_unique" ON "reviews" ("booking_id", "target");

-- 4) Ensure not-null after backfill
ALTER TABLE "reviews" ALTER COLUMN "reviewer_id" SET NOT NULL;
ALTER TABLE "reviews" ALTER COLUMN "reviewee_id" SET NOT NULL;
ALTER TABLE "reviews" ALTER COLUMN "target" SET NOT NULL;
