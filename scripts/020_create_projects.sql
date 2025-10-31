-- Script para criar tabela de projetos socioambientais
-- Permite criar páginas dinâmicas com blocos customizáveis

CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, -- Nome do projeto (ex: "Fase 1 Mar é Cultura")
  slug TEXT UNIQUE NOT NULL, -- Para URL (ex: "mar-e-cultura-fase-1")
  submenu_label TEXT NOT NULL, -- Texto exibido no dropdown do header
  content JSONB NOT NULL DEFAULT '{"blocks": []}'::jsonb, -- Estrutura dos blocos da página
  published BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Índice para buscar por slug (para página pública)
CREATE INDEX IF NOT EXISTS idx_projects_slug ON public.projects(slug);

-- Índice para buscar projetos publicados
CREATE INDEX IF NOT EXISTS idx_projects_published ON public.projects(published) WHERE published = TRUE;

-- Índice para ordenação
CREATE INDEX IF NOT EXISTS idx_projects_display_order ON public.projects(display_order, created_at DESC);

-- RLS Policies
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Política: usuários autenticados podem ver projetos publicados
DROP POLICY IF EXISTS "Public projects are viewable by everyone" ON public.projects;
CREATE POLICY "Public projects are viewable by everyone"
ON public.projects FOR SELECT
TO authenticated
USING (published = TRUE);

-- Política: admins podem gerenciar todos os projetos
DROP POLICY IF EXISTS "Admins can manage all projects" ON public.projects;
CREATE POLICY "Admins can manage all projects"
ON public.projects FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.admin_profiles
    WHERE admin_profiles.id = auth.uid()
    AND admin_profiles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admin_profiles
    WHERE admin_profiles.id = auth.uid()
    AND admin_profiles.role = 'admin'
  )
);

-- Comentários para documentação
COMMENT ON TABLE public.projects IS 'Projetos socioambientais com editor visual de blocos';
COMMENT ON COLUMN public.projects.content IS 'JSONB com estrutura de blocos: {blocks: [{type, data}, ...]}';
COMMENT ON COLUMN public.projects.submenu_label IS 'Texto exibido no dropdown do menu principal';

