-- Script para criar tabela de informações da Home (Hero section)
-- Execute no Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.home_info (
  id INTEGER PRIMARY KEY DEFAULT 1,
  badge_text TEXT DEFAULT 'Desde 1998',
  title TEXT NOT NULL DEFAULT 'Associação dos Maricultores do Estado de São Paulo',
  description TEXT NOT NULL DEFAULT 'Trabalhamos para o desenvolvimento e organização da maricultura sustentável no litoral norte do estado de São Paulo.',
  hero_image_url TEXT,
  sustainability_tag TEXT DEFAULT '100% Sustentável',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT single_row CHECK (id = 1)
);

-- Inserir registro inicial
INSERT INTO public.home_info (id, badge_text, title, description, sustainability_tag)
VALUES (
  1, 
  'Desde 1998', 
  'Associação dos Maricultores do Estado de São Paulo',
  'Trabalhamos para o desenvolvimento e organização da maricultura sustentável no litoral norte do estado de São Paulo. Nossos objetivos são promover o desenvolvimento sustentável e a investigação científica.',
  '100% Sustentável'
)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies
ALTER TABLE public.home_info ENABLE ROW LEVEL SECURITY;

-- Leitura pública
DROP POLICY IF EXISTS "Public can view home info" ON public.home_info;
CREATE POLICY "Public can view home info"
ON public.home_info FOR SELECT
TO public
USING (true);

-- Admins podem atualizar
DROP POLICY IF EXISTS "Admins can update home info" ON public.home_info;
CREATE POLICY "Admins can update home info"
ON public.home_info FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.admin_profiles
    WHERE admin_profiles.id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admin_profiles
    WHERE admin_profiles.id = auth.uid()
  )
);

-- Comentários
COMMENT ON TABLE public.home_info IS 'Informações do Hero (banner inicial) da Home';
COMMENT ON COLUMN public.home_info.badge_text IS 'Texto da tag no topo (ex: Desde 1998)';
COMMENT ON COLUMN public.home_info.title IS 'Título principal do Hero';
COMMENT ON COLUMN public.home_info.description IS 'Texto descritivo';
COMMENT ON COLUMN public.home_info.hero_image_url IS 'URL da imagem principal do Hero';
COMMENT ON COLUMN public.home_info.sustainability_tag IS 'Texto da tag de sustentabilidade';

