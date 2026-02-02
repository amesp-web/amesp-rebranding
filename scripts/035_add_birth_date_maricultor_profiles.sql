-- Adiciona coluna data de nascimento (DD/MM/AAAA na tela, DATE no banco)
-- Execute no Supabase SQL Editor

ALTER TABLE public.maricultor_profiles
  ADD COLUMN IF NOT EXISTS birth_date DATE;

COMMENT ON COLUMN public.maricultor_profiles.birth_date IS 'Data de nascimento do maricultor';
