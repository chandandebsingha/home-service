CREATE TABLE IF NOT EXISTS "email_verification_tokens" (
    "id" serial PRIMARY KEY,
    "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "email" text NOT NULL,
    "otp_hash" text NOT NULL,
    "expires_at" timestamp NOT NULL,
    "attempts" integer NOT NULL DEFAULT 0,
    "created_at" timestamp NOT NULL DEFAULT now(),
    "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "email_verification_tokens_user_id_idx" ON "email_verification_tokens" ("user_id");
CREATE INDEX IF NOT EXISTS "email_verification_tokens_email_idx" ON "email_verification_tokens" ("email");
