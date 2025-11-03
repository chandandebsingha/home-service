-- Create reviews table
CREATE TABLE IF NOT EXISTS "reviews" (
  "id" serial PRIMARY KEY,
  "booking_id" integer NOT NULL REFERENCES "bookings"("id"),
  "user_id" integer NOT NULL REFERENCES "users"("id"),
  "service_id" integer REFERENCES "services"("id"),
  "provider_id" integer REFERENCES "users"("id"),
  "rating" integer NOT NULL,
  "comment" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Ensure one review per booking
CREATE UNIQUE INDEX IF NOT EXISTS "reviews_booking_unique" ON "reviews" ("booking_id");
CREATE INDEX IF NOT EXISTS "reviews_user_idx" ON "reviews" ("user_id");
CREATE INDEX IF NOT EXISTS "reviews_service_idx" ON "reviews" ("service_id");
CREATE INDEX IF NOT EXISTS "reviews_provider_idx" ON "reviews" ("provider_id");
