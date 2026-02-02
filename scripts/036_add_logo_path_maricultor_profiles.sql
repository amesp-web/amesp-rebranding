-- Adiciona coluna logo_path à tabela maricultor_profiles (caminho no bucket maricultor_logos)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'maricultor_profiles' AND column_name = 'logo_path'
  ) THEN
    ALTER TABLE public.maricultor_profiles
    ADD COLUMN logo_path TEXT;
    RAISE NOTICE 'Coluna logo_path adicionada à tabela maricultor_profiles.';
  ELSE
    RAISE NOTICE 'Coluna logo_path já existe na tabela maricultor_profiles.';
  END IF;
END $$;

COMMENT ON COLUMN public.maricultor_profiles.logo_path IS 'Caminho da logo no bucket maricultor_logos (ex: {id}/logo.png). URL pública: {SUPABASE_URL}/storage/v1/object/public/maricultor_logos/{logo_path}';
