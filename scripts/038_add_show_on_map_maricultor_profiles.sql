-- Adiciona coluna show_on_map à tabela maricultor_profiles.
-- Quando false, o maricultor não aparece no mapa público da home.
-- Default true para que os registros existentes continuem visíveis no mapa.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'maricultor_profiles' AND column_name = 'show_on_map'
  ) THEN
    ALTER TABLE public.maricultor_profiles
      ADD COLUMN show_on_map BOOLEAN DEFAULT true;
    RAISE NOTICE 'Coluna show_on_map adicionada à tabela maricultor_profiles.';
  ELSE
    RAISE NOTICE 'Coluna show_on_map já existe na tabela maricultor_profiles.';
  END IF;
END $$;

COMMENT ON COLUMN public.maricultor_profiles.show_on_map IS 'Se true, o maricultor aparece no mapa da home. Controlável em /admin/producers.';
