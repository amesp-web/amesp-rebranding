-- Adiciona coluna CPF na tabela maricultor_profiles
DO $$
BEGIN
  -- Adicionar coluna CPF se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'maricultor_profiles' 
      AND column_name = 'cpf'
  ) THEN
    ALTER TABLE public.maricultor_profiles 
    ADD COLUMN cpf TEXT;
    
    -- Criar índice único para CPF (evitar duplicados)
    CREATE UNIQUE INDEX IF NOT EXISTS maricultor_profiles_cpf_unique 
    ON public.maricultor_profiles(cpf) 
    WHERE cpf IS NOT NULL;
    
    RAISE NOTICE 'Coluna CPF adicionada com sucesso à tabela maricultor_profiles';
  ELSE
    RAISE NOTICE 'Coluna CPF já existe na tabela maricultor_profiles';
  END IF;
END $$;

