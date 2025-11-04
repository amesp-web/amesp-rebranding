-- Script para adicionar campo de conteúdo (page builder) à tabela about_content
-- Execute este script no Supabase SQL Editor

-- Adicionar coluna content (JSONB) para armazenar blocos do page builder
ALTER TABLE public.about_content 
ADD COLUMN IF NOT EXISTS content JSONB DEFAULT '[]'::jsonb;

-- Comentário
COMMENT ON COLUMN public.about_content.content IS 'Blocos do page builder para modal "Quem Somos" (formato: array de objetos com type, data)';

-- Nota: Mantemos title, subtitle e about_features para a seção na Home
-- O campo content é usado apenas para o modal de leitura completa

