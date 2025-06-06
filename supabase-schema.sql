-- StudySnap Backend Database Schema
-- This file contains the SQL statements to set up the required tables in Supabase

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  tokens_remaining INTEGER NOT NULL DEFAULT 50,
  subscription_tier TEXT NOT NULL DEFAULT 'free',
  subscription_ends_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Row Level Security for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Create a trigger to create profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, tokens_remaining, subscription_tier)
  VALUES (new.id, 50, 'free');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Transactions table for tracking token usage
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  tokens INTEGER NOT NULL,
  type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Row Level Security for transactions
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Policies for transactions
CREATE POLICY "Users can view their own transactions"
  ON transactions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create an index for better query performance
CREATE INDEX idx_transactions_user_id ON transactions(user_id);

-- Video usage table for tracking processed videos
CREATE TABLE video_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  video_id TEXT NOT NULL,
  title TEXT NOT NULL,
  output_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Row Level Security for video_usage
ALTER TABLE video_usage ENABLE ROW LEVEL SECURITY;

-- Policies for video_usage
CREATE POLICY "Users can view their own video usage"
  ON video_usage
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create an index for better query performance
CREATE INDEX idx_video_usage_user_id ON video_usage(user_id);

-- Create a function to reset free user tokens monthly
CREATE OR REPLACE FUNCTION reset_free_user_tokens()
RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET tokens_remaining = 50,
      updated_at = now()
  WHERE subscription_tier = 'free';
END;
$$ LANGUAGE plpgsql; 