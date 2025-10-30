-- Adiciona a coluna likes à tabela news, se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'news' AND column_name = 'likes'
  ) THEN
    ALTER TABLE public.news ADD COLUMN likes INTEGER NOT NULL DEFAULT 0;
  END IF;
END $$;


