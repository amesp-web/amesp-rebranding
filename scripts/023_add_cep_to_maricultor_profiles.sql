-- Script para adicionar coluna CEP à tabela maricultor_profiles

-- Adicionar coluna cep se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'maricultor_profiles' 
    AND column_name = 'cep'
  ) THEN
    ALTER TABLE public.maricultor_profiles ADD COLUMN cep VARCHAR(8);
    
    RAISE NOTICE 'Coluna cep adicionada à tabela maricultor_profiles';
  ELSE
    RAISE NOTICE 'Coluna cep já existe na tabela maricultor_profiles';
  END IF;
END $$;

-- Comentário explicativo
COMMENT ON COLUMN public.maricultor_profiles.cep IS 'CEP do endereço do maricultor (8 dígitos sem hífen)';

