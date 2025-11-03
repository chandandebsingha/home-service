-- Drop legacy user_reviews table if you no longer need it
DO $$ BEGIN
  DROP TABLE IF EXISTS "user_reviews" CASCADE;
EXCEPTION WHEN undefined_table THEN NULL; END $$;