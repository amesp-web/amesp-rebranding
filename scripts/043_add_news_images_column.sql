-- Adiciona coluna de imagens extras na tabela news
-- images: lista de URLs de imagens (a primeira é a principal)

ALTER TABLE public.news
  ADD COLUMN IF NOT EXISTS images jsonb;

COMMENT ON COLUMN public.news.images IS 'Lista de URLs de imagens da notícia (principal + adicionais)';

