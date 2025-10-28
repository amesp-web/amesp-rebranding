-- Create news table
CREATE TABLE IF NOT EXISTS public.news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  category TEXT NOT NULL,
  read_time INTEGER DEFAULT 5,
  views INTEGER DEFAULT 0,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create producers table
CREATE TABLE IF NOT EXISTS public.producers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  location TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  contact_email TEXT,
  contact_phone TEXT,
  website TEXT,
  image_url TEXT,
  specialties TEXT[],
  certification_level TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create gallery table
CREATE TABLE IF NOT EXISTS public.gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  category TEXT,
  featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admin users table for authentication
CREATE TABLE IF NOT EXISTS public.admin_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.producers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for news table
CREATE POLICY "Anyone can view published news" ON public.news
  FOR SELECT USING (published = true);

CREATE POLICY "Admins can manage all news" ON public.news
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_profiles 
      WHERE id = auth.uid()
    )
  );

-- Create policies for producers table
CREATE POLICY "Anyone can view active producers" ON public.producers
  FOR SELECT USING (active = true);

CREATE POLICY "Admins can manage all producers" ON public.producers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_profiles 
      WHERE id = auth.uid()
    )
  );

-- Create policies for gallery table
CREATE POLICY "Anyone can view gallery" ON public.gallery
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage gallery" ON public.gallery
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_profiles 
      WHERE id = auth.uid()
    )
  );

-- Create policies for admin_profiles table
CREATE POLICY "Admins can view their own profile" ON public.admin_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can update their own profile" ON public.admin_profiles
  FOR UPDATE USING (auth.uid() = id);
