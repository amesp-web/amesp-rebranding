-- Adiciona tipo de documento "Cessão de Águas" (cessao_aguas)
-- Execute no Supabase SQL Editor

-- Remove o CHECK antigo (só existe um na tabela)
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT conname FROM pg_constraint
    WHERE conrelid = 'public.maricultor_documents'::regclass AND contype = 'c'
  ) LOOP
    EXECUTE format('ALTER TABLE public.maricultor_documents DROP CONSTRAINT %I', r.conname);
  END LOOP;
END $$;

ALTER TABLE public.maricultor_documents
  ADD CONSTRAINT maricultor_documents_type_check
  CHECK (type IN (
    'rg',
    'cpf',
    'comprovante_endereco',
    'cnh',
    'cessao_aguas',
    'outros'
  ));
