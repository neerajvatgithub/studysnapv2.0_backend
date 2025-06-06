-- Schema Update: Change subscription_tier to plan_type
-- Execute these SQL statements in your Supabase SQL editor

-- 1. Add new plan_type column
ALTER TABLE profiles ADD COLUMN plan_type TEXT NOT NULL DEFAULT 'free';

-- 2. Copy data from subscription_tier to plan_type
UPDATE profiles SET plan_type = subscription_tier;

-- 3. Drop old subscription_tier column
ALTER TABLE profiles DROP COLUMN subscription_tier;

-- 4. Update the handle_new_user function to use plan_type
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, tokens_remaining, plan_type)
  VALUES (new.id, 50, 'free');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Update the reset_free_user_tokens function
CREATE OR REPLACE FUNCTION reset_free_user_tokens()
RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET tokens_remaining = 50,
      updated_at = now()
  WHERE plan_type = 'free';
END;
$$ LANGUAGE plpgsql; 