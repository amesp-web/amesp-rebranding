-- Configuração do bucket 'maricultor_logos' (logos dos maricultores – exibidas no mapa da home)
-- Execute este script no Supabase SQL Editor APÓS criar o bucket no Dashboard.
--
-- CRIAR O BUCKET NO DASHBOARD:
-- 1. Storage > New bucket
-- 2. Nome: maricultor_logos
-- 3. Public: ON (bucket público – mapa da home exibe a logo sem signed URL)
-- 4. File size limit: 2 MB
-- 5. Allowed MIME types: image/jpeg, image/jpg, image/png, image/webp

-- Upload: apenas admins (via API com service role ou auth de admin)
DROP POLICY IF EXISTS "Admins can upload maricultor logos" ON storage.objects;
CREATE POLICY "Admins can upload maricultor logos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'maricultor_logos' AND
  EXISTS (
    SELECT 1 FROM public.admin_profiles
    WHERE id = auth.uid()
  )
);

-- Atualização: apenas admins
DROP POLICY IF EXISTS "Admins can update maricultor logos" ON storage.objects;
CREATE POLICY "Admins can update maricultor logos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'maricultor_logos' AND
  EXISTS (
    SELECT 1 FROM public.admin_profiles
    WHERE id = auth.uid()
  )
);

-- Exclusão: apenas admins
DROP POLICY IF EXISTS "Admins can delete maricultor logos" ON storage.objects;
CREATE POLICY "Admins can delete maricultor logos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'maricultor_logos' AND
  EXISTS (
    SELECT 1 FROM public.admin_profiles
    WHERE id = auth.uid()
  )
);

-- Leitura: bucket público – não é necessário policy SELECT para anônimos quando o bucket é público.
-- Se o bucket for público no Dashboard, as URLs públicas funcionam. Opcionalmente, permitir SELECT para todos:
DROP POLICY IF EXISTS "Public read maricultor logos" ON storage.objects;
CREATE POLICY "Public read maricultor logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'maricultor_logos');
