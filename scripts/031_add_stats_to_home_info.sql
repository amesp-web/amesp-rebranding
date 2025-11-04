-- Script para adicionar campos de estatísticas à tabela home_info
-- Execute no Supabase SQL Editor

-- Adicionar colunas para as estatísticas
ALTER TABLE public.home_info 
ADD COLUMN IF NOT EXISTS years_experience INTEGER DEFAULT 25,
ADD COLUMN IF NOT EXISTS associated_producers INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS completed_projects INTEGER DEFAULT 50;

-- Atualizar valores padrão no registro existente
UPDATE public.home_info 
SET 
  years_experience = 25,
  associated_producers = 100,
  completed_projects = 50
WHERE id = 1;

-- Comentários
COMMENT ON COLUMN public.home_info.years_experience IS 'Anos de experiência da associação';
COMMENT ON COLUMN public.home_info.associated_producers IS 'Número de produtores associados';
COMMENT ON COLUMN public.home_info.completed_projects IS 'Número de projetos realizados';

