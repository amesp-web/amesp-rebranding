-- =============================================================================
-- Isento: coluna fee_exempt em maricultor_profiles + forma de pagamento "isento"
-- Rodar no Supabase se já tiver executado 041 antes de ter isento/fee_exempt.
-- =============================================================================

-- 1) Coluna fee_exempt em maricultor_profiles
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'maricultor_profiles' AND column_name = 'fee_exempt') THEN
    ALTER TABLE public.maricultor_profiles ADD COLUMN fee_exempt BOOLEAN DEFAULT false;
    RAISE NOTICE 'Coluna fee_exempt adicionada em maricultor_profiles.';
  END IF;
END $$;
COMMENT ON COLUMN public.maricultor_profiles.fee_exempt IS 'Se true, maricultor é isento de mensalidade.';

-- 2) Permitir payment_method 'isento' na tabela de pagamentos
DO $$
DECLARE
  conname text;
BEGIN
  SELECT c.conname INTO conname
  FROM pg_constraint c
  JOIN pg_class t ON c.conrelid = t.oid
  JOIN pg_namespace n ON t.relnamespace = n.oid
  WHERE n.nspname = 'public' AND t.relname = 'maricultor_monthly_payments'
    AND c.contype = 'c' AND pg_get_constraintdef(c.oid) LIKE '%payment_method%';
  IF conname IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.maricultor_monthly_payments DROP CONSTRAINT %I', conname);
    RAISE NOTICE 'Constraint % removida.', conname;
  END IF;
  ALTER TABLE public.maricultor_monthly_payments
    ADD CONSTRAINT maricultor_monthly_payments_payment_method_check
    CHECK (payment_method IN ('dinheiro', 'pix', 'peixe', 'materiais', 'outros', 'isento'));
EXCEPTION
  WHEN duplicate_object THEN
    RAISE NOTICE 'Constraint payment_method já permite isento.';
END $$;

-- =============================================================================
-- Fim.
-- =============================================================================
