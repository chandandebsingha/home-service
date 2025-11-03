-- Create user_reviews table for provider->customer reviews
CREATE TABLE IF NOT EXISTS "user_reviews" (
  "id" serial PRIMARY KEY,
  "booking_id" integer NOT NULL REFERENCES "bookings"("id"),
  "provider_id" integer NOT NULL REFERENCES "users"("id"),
  "customer_id" integer NOT NULL REFERENCES "users"("id"),
  "rating" integer NOT NULL,
  "comment" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "user_reviews_booking_unique" ON "user_reviews" ("booking_id");
CREATE INDEX IF NOT EXISTS "user_reviews_provider_idx" ON "user_reviews" ("provider_id");
CREATE INDEX IF NOT EXISTS "user_reviews_customer_idx" ON "user_reviews" ("customer_id");
