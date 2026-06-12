-- Capa personalizada para manuais/downloads
-- Execute no Supabase SQL Editor

ALTER TABLE public.downloads
ADD COLUMN IF NOT EXISTS cover_url TEXT,
ADD COLUMN IF NOT EXISTS cover_file_name TEXT;

COMMENT ON COLUMN public.downloads.cover_url IS 'URL pública da capa personalizada exibida na página de downloads';
COMMENT ON COLUMN public.downloads.cover_file_name IS 'Nome original do arquivo de capa enviado pelo admin';
