-- Cria tabela maricultor_profiles (se não existir) e adiciona colunas faltantes
DO $$
BEGIN
  -- Criação da tabela básica
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'maricultor_profiles'
  ) THEN
    CREATE TABLE public.maricultor_profiles (
      id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      full_name TEXT,
      phone TEXT,
      logradouro TEXT,
      cidade TEXT,
      estado TEXT,
      latitude DECIMAL(10,8),
      longitude DECIMAL(11,8),
      company TEXT,
      specialties TEXT,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  END IF;

  -- Adiciona colunas caso a tabela já exista
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'maricultor_profiles' AND column_name = 'logradouro'
  ) THEN
    ALTER TABLE public.maricultor_profiles ADD COLUMN logradouro TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'maricultor_profiles' AND column_name = 'cidade'
  ) THEN
    ALTER TABLE public.maricultor_profiles ADD COLUMN cidade TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'maricultor_profiles' AND column_name = 'estado'
  ) THEN
    ALTER TABLE public.maricultor_profiles ADD COLUMN estado TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'maricultor_profiles' AND column_name = 'latitude'
  ) THEN
    ALTER TABLE public.maricultor_profiles ADD COLUMN latitude DECIMAL(10,8);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'maricultor_profiles' AND column_name = 'longitude'
  ) THEN
    ALTER TABLE public.maricultor_profiles ADD COLUMN longitude DECIMAL(11,8);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'maricultor_profiles' AND column_name = 'company'
  ) THEN
    ALTER TABLE public.maricultor_profiles ADD COLUMN company TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'maricultor_profiles' AND column_name = 'specialties'
  ) THEN
    ALTER TABLE public.maricultor_profiles ADD COLUMN specialties TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'maricultor_profiles' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE public.maricultor_profiles ADD COLUMN is_active BOOLEAN DEFAULT true;
  END IF;

  -- Habilita RLS, políticas mínimas (somente leitura pública opcional) — ajustar conforme necessidade futura
  BEGIN
    EXECUTE 'ALTER TABLE public.maricultor_profiles ENABLE ROW LEVEL SECURITY';
  EXCEPTION WHEN others THEN
    -- ignora se já estiver habilitado
    NULL;
  END;

END $$;


