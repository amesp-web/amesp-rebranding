-- Script para criar tabela de downloads/manuais
-- Execute este script no Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT, -- tamanho em bytes
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Índice para ordenação
CREATE INDEX IF NOT EXISTS idx_downloads_display_order ON public.downloads(display_order);
CREATE INDEX IF NOT EXISTS idx_downloads_created_at ON public.downloads(created_at DESC);

-- RLS Policies
ALTER TABLE public.downloads ENABLE ROW LEVEL SECURITY;

-- Política para leitura pública (todos podem ver e baixar)
DROP POLICY IF EXISTS "Public can view all downloads" ON public.downloads;
CREATE POLICY "Public can view all downloads"
ON public.downloads FOR SELECT
TO public
USING (true);

-- Política para admins gerenciarem downloads
DROP POLICY IF EXISTS "Admins can manage downloads" ON public.downloads;
CREATE POLICY "Admins can manage downloads"
ON public.downloads FOR ALL
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
COMMENT ON TABLE public.downloads IS 'Tabela para armazenar manuais e arquivos para download';
COMMENT ON COLUMN public.downloads.title IS 'Título do manual/arquivo';
COMMENT ON COLUMN public.downloads.description IS 'Descrição opcional do manual';
COMMENT ON COLUMN public.downloads.file_url IS 'URL do arquivo no Supabase Storage';
COMMENT ON COLUMN public.downloads.file_name IS 'Nome original do arquivo';
COMMENT ON COLUMN public.downloads.file_size IS 'Tamanho do arquivo em bytes';
COMMENT ON COLUMN public.downloads.display_order IS 'Ordem de exibição dos manuais';

