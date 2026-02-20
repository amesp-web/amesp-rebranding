-- =============================================================================
-- SCRIPT COMPLETO: maricultor_profiles (rodar no Supabase SQL Editor)
-- Execute uma vez. Pode rodar de novo: só adiciona o que faltar.
-- =============================================================================

-- 1) Criar tabela se não existir (estrutura mínima inicial)
CREATE TABLE IF NOT EXISTS public.maricultor_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  contact_phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2) Habilitar RLS
ALTER TABLE public.maricultor_profiles ENABLE ROW LEVEL SECURITY;

-- 3) Políticas básicas (maricultor vê/atualiza o próprio perfil)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.maricultor_profiles;
CREATE POLICY "Users can view their own profile" ON public.maricultor_profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.maricultor_profiles;
CREATE POLICY "Users can update their own profile" ON public.maricultor_profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.maricultor_profiles;
CREATE POLICY "Users can insert their own profile" ON public.maricultor_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 4) Adicionar colunas que faltam (idempotente)
DO $$
BEGIN
  -- cpf
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'maricultor_profiles' AND column_name = 'cpf') THEN
    ALTER TABLE public.maricultor_profiles ADD COLUMN cpf TEXT;
    RAISE NOTICE 'Coluna cpf adicionada.';
  END IF;
  -- logradouro
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'maricultor_profiles' AND column_name = 'logradouro') THEN
    ALTER TABLE public.maricultor_profiles ADD COLUMN logradouro TEXT;
    RAISE NOTICE 'Coluna logradouro adicionada.';
  END IF;
  -- cidade
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'maricultor_profiles' AND column_name = 'cidade') THEN
    ALTER TABLE public.maricultor_profiles ADD COLUMN cidade TEXT;
    RAISE NOTICE 'Coluna cidade adicionada.';
  END IF;
  -- estado
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'maricultor_profiles' AND column_name = 'estado') THEN
    ALTER TABLE public.maricultor_profiles ADD COLUMN estado TEXT;
    RAISE NOTICE 'Coluna estado adicionada.';
  END IF;
  -- cep
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'maricultor_profiles' AND column_name = 'cep') THEN
    ALTER TABLE public.maricultor_profiles ADD COLUMN cep VARCHAR(8);
    RAISE NOTICE 'Coluna cep adicionada.';
  END IF;
  -- birth_date
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'maricultor_profiles' AND column_name = 'birth_date') THEN
    ALTER TABLE public.maricultor_profiles ADD COLUMN birth_date DATE;
    RAISE NOTICE 'Coluna birth_date adicionada.';
  END IF;
  -- company
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'maricultor_profiles' AND column_name = 'company') THEN
    ALTER TABLE public.maricultor_profiles ADD COLUMN company TEXT;
    RAISE NOTICE 'Coluna company adicionada.';
  END IF;
  -- specialties
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'maricultor_profiles' AND column_name = 'specialties') THEN
    ALTER TABLE public.maricultor_profiles ADD COLUMN specialties TEXT;
    RAISE NOTICE 'Coluna specialties adicionada.';
  END IF;
  -- latitude
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'maricultor_profiles' AND column_name = 'latitude') THEN
    ALTER TABLE public.maricultor_profiles ADD COLUMN latitude DECIMAL(10,8);
    RAISE NOTICE 'Coluna latitude adicionada.';
  END IF;
  -- longitude
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'maricultor_profiles' AND column_name = 'longitude') THEN
    ALTER TABLE public.maricultor_profiles ADD COLUMN longitude DECIMAL(11,8);
    RAISE NOTICE 'Coluna longitude adicionada.';
  END IF;
  -- is_active
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'maricultor_profiles' AND column_name = 'is_active') THEN
    ALTER TABLE public.maricultor_profiles ADD COLUMN is_active BOOLEAN DEFAULT true;
    RAISE NOTICE 'Coluna is_active adicionada.';
  END IF;
  -- show_on_map
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'maricultor_profiles' AND column_name = 'show_on_map') THEN
    ALTER TABLE public.maricultor_profiles ADD COLUMN show_on_map BOOLEAN DEFAULT true;
    RAISE NOTICE 'Coluna show_on_map adicionada.';
  END IF;
  -- logo_path
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'maricultor_profiles' AND column_name = 'logo_path') THEN
    ALTER TABLE public.maricultor_profiles ADD COLUMN logo_path TEXT;
    RAISE NOTICE 'Coluna logo_path adicionada.';
  END IF;
END $$;

-- 6) Índice único em CPF (evita duplicados; só onde cpf não é nulo)
CREATE UNIQUE INDEX IF NOT EXISTS maricultor_profiles_cpf_unique
  ON public.maricultor_profiles(cpf)
  WHERE cpf IS NOT NULL;

-- 7) Política de leitura pública (mapa/home lista maricultores ativos e visíveis)
DROP POLICY IF EXISTS "Public read active maricultors" ON public.maricultor_profiles;
CREATE POLICY "Public read active maricultors" ON public.maricultor_profiles
  FOR SELECT USING (is_active = true AND (show_on_map IS NULL OR show_on_map = true));

-- 8) Comentários (opcional)
COMMENT ON COLUMN public.maricultor_profiles.cpf IS 'CPF do maricultor (11 dígitos, único)';
COMMENT ON COLUMN public.maricultor_profiles.contact_phone IS 'Telefone com DDD; usado para login no painel';
COMMENT ON COLUMN public.maricultor_profiles.cep IS 'CEP (8 dígitos sem hífen)';
COMMENT ON COLUMN public.maricultor_profiles.birth_date IS 'Data de nascimento';
COMMENT ON COLUMN public.maricultor_profiles.show_on_map IS 'Se true, aparece no mapa da home';

-- =============================================================================
-- Fim. Tabela pronta para carga (script Node) e para o admin editar.
-- =============================================================================
