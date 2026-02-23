-- =============================================================================
-- Mensalidades: tabela de pagamentos + colunas em maricultor_profiles
-- Rodar no Supabase SQL Editor. Idempotente.
-- =============================================================================

-- 1) Colunas opcionais em maricultor_profiles
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'maricultor_profiles' AND column_name = 'monthly_fee_amount') THEN
    ALTER TABLE public.maricultor_profiles ADD COLUMN monthly_fee_amount DECIMAL(10,2);
    RAISE NOTICE 'Coluna monthly_fee_amount adicionada em maricultor_profiles.';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'maricultor_profiles' AND column_name = 'association_date') THEN
    ALTER TABLE public.maricultor_profiles ADD COLUMN association_date DATE;
    RAISE NOTICE 'Coluna association_date adicionada em maricultor_profiles.';
  END IF;
  -- Isento de mensalidade (não precisa pagar)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'maricultor_profiles' AND column_name = 'fee_exempt') THEN
    ALTER TABLE public.maricultor_profiles ADD COLUMN fee_exempt BOOLEAN DEFAULT false;
    RAISE NOTICE 'Coluna fee_exempt adicionada em maricultor_profiles.';
  END IF;
END $$;

COMMENT ON COLUMN public.maricultor_profiles.monthly_fee_amount IS 'Valor de referência da mensalidade (opcional; não há valor fixo obrigatório).';
COMMENT ON COLUMN public.maricultor_profiles.association_date IS 'Data em que o maricultor se associou à AMESP.';
COMMENT ON COLUMN public.maricultor_profiles.fee_exempt IS 'Se true, maricultor é isento de mensalidade.';

-- 2) Tabela de pagamentos mensais
CREATE TABLE IF NOT EXISTS public.maricultor_monthly_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  maricultor_id UUID NOT NULL REFERENCES public.maricultor_profiles(id) ON DELETE CASCADE,
  year INT NOT NULL,
  month INT NOT NULL CHECK (month >= 1 AND month <= 12),
  amount DECIMAL(10,2),
  payment_method TEXT CHECK (payment_method IN ('dinheiro', 'pix', 'peixe', 'materiais', 'outros', 'isento')),
  paid_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  marked_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(maricultor_id, year, month)
);

CREATE INDEX IF NOT EXISTS idx_maricultor_monthly_payments_maricultor_year
  ON public.maricultor_monthly_payments(maricultor_id, year);

ALTER TABLE public.maricultor_monthly_payments ENABLE ROW LEVEL SECURITY;

-- Acesso apenas via backend (service role bypassa RLS). Client não acessa direto.
DROP POLICY IF EXISTS "Block direct client access" ON public.maricultor_monthly_payments;
CREATE POLICY "Block direct client access" ON public.maricultor_monthly_payments
  FOR ALL USING (false) WITH CHECK (false);

COMMENT ON TABLE public.maricultor_monthly_payments IS 'Pagamentos de mensalidade por maricultor, ano e mês.';
COMMENT ON COLUMN public.maricultor_monthly_payments.amount IS 'Valor pago (opcional; não há valor fixo por maricultor).';
COMMENT ON COLUMN public.maricultor_monthly_payments.payment_method IS 'dinheiro, pix, peixe, materiais, outros, isento';

-- =============================================================================
-- Fim.
-- =============================================================================
