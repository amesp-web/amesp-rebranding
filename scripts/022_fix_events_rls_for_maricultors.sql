-- Script para ajustar RLS da tabela events para permitir acesso de maricultores autenticados

-- Remover política antiga que só permitia admins
DROP POLICY IF EXISTS "Authenticated users can view published events" ON public.events;

-- Nova política: QUALQUER usuário autenticado (admin ou maricultor) pode ver eventos publicados
CREATE POLICY "All authenticated users can view published events"
ON public.events FOR SELECT
TO authenticated
USING (published = TRUE);

-- Manter política de admins gerenciarem todos os eventos
-- (já existe no script 019, mas vamos garantir)
DROP POLICY IF EXISTS "Admins can manage all events" ON public.events;
CREATE POLICY "Admins can manage all events"
ON public.events FOR ALL
TO authenticated
USING (EXISTS (SELECT 1 FROM public.admin_profiles WHERE admin_profiles.id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.admin_profiles WHERE admin_profiles.id = auth.uid()));

-- IMPORTANTE: Esta política permite que maricultores autenticados vejam eventos publicados
-- mas apenas admins podem criar, editar ou deletar eventos

