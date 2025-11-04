-- Script para configurar políticas RLS do Supabase Storage para home
-- Execute este script no Supabase SQL Editor APÓS criar o bucket 'home' no Dashboard

-- IMPORTANTE: Crie o bucket 'home' manualmente via Dashboard > Storage > New bucket
-- Configurações recomendadas:
--   - Nome: home
--   - Bucket type: Standard bucket
--   - Público: SIM (toggle ON)
--   - Restrict file size: SIM (toggle ON) - Limite: 10 MB
--   - Restrict MIME types: SIM (toggle ON)
--   - MIME types permitidos: image/jpeg, image/jpg, image/png, image/webp, image/gif

-- Política para leitura pública de arquivos da home
DROP POLICY IF EXISTS "Public home files are viewable by everyone" ON storage.objects;
CREATE POLICY "Public home files are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'home');

-- Política para admins fazerem upload de arquivos
DROP POLICY IF EXISTS "Admins can upload home files" ON storage.objects;
CREATE POLICY "Admins can upload home files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'home' AND
  EXISTS (
    SELECT 1 FROM public.admin_profiles
    WHERE id = auth.uid()
  )
);

-- Política para admins atualizarem arquivos
DROP POLICY IF EXISTS "Admins can update home files" ON storage.objects;
CREATE POLICY "Admins can update home files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'home' AND
  EXISTS (
    SELECT 1 FROM public.admin_profiles
    WHERE id = auth.uid()
  )
);

-- Política para admins deletarem arquivos
DROP POLICY IF EXISTS "Admins can delete home files" ON storage.objects;
CREATE POLICY "Admins can delete home files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'home' AND
  EXISTS (
    SELECT 1 FROM public.admin_profiles
    WHERE id = auth.uid()
  )
);

