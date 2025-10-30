-- Políticas RLS para tabela public.events

-- SELECT: permitir a usuários autenticados (ex.: admins logados)
DROP POLICY IF EXISTS "Authenticated can read events" ON public.events;
CREATE POLICY "Authenticated can read events"
ON public.events FOR SELECT
USING (true);

-- INSERT/UPDATE/DELETE: somente admins (presentes em admin_profiles)
DROP POLICY IF EXISTS "Admins can insert events" ON public.events;
CREATE POLICY "Admins can insert events"
ON public.events FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM public.admin_profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Admins can update events" ON public.events;
CREATE POLICY "Admins can update events"
ON public.events FOR UPDATE
USING (EXISTS (SELECT 1 FROM public.admin_profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Admins can delete events" ON public.events;
CREATE POLICY "Admins can delete events"
ON public.events FOR DELETE
USING (EXISTS (SELECT 1 FROM public.admin_profiles WHERE id = auth.uid()));


