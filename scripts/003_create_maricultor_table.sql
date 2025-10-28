-- Create maricultor profiles table
CREATE TABLE IF NOT EXISTS public.maricultor_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  registration_number TEXT UNIQUE,
  farm_name TEXT,
  contact_phone TEXT,
  farm_address TEXT,
  production_type TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.maricultor_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for maricultor_profiles table
CREATE POLICY "Users can view their own profile" ON public.maricultor_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.maricultor_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.maricultor_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
