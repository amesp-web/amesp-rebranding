-- Script para configurar políticas RLS do Supabase Storage para downloads
-- Execute este script no Supabase SQL Editor APÓS criar o bucket 'downloads' no Dashboard

-- IMPORTANTE: Crie o bucket 'downloads' manualmente via Dashboard > Storage > New bucket
-- Configurações recomendadas:
--   - Nome: downloads
--   - Bucket type: Standard bucket
--   - Público: SIM (toggle ON)
--   - Restrict file size: SIM (toggle ON) - Limite: 50 MB
--   - Restrict MIME types: SIM (toggle ON)
--   - MIME types permitidos: application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/zip, image/jpeg, image/jpg, image/png

-- Política para leitura pública de arquivos de download
DROP POLICY IF EXISTS "Public download files are viewable by everyone" ON storage.objects;
CREATE POLICY "Public download files are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'downloads');

-- Política para admins fazerem upload de arquivos
DROP POLICY IF EXISTS "Admins can upload download files" ON storage.objects;
CREATE POLICY "Admins can upload download files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'downloads' AND
  EXISTS (
    SELECT 1 FROM public.admin_profiles
    WHERE id = auth.uid()
  )
);

-- Política para admins atualizarem arquivos
DROP POLICY IF EXISTS "Admins can update download files" ON storage.objects;
CREATE POLICY "Admins can update download files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'downloads' AND
  EXISTS (
    SELECT 1 FROM public.admin_profiles
    WHERE id = auth.uid()
  )
);

-- Política para admins deletarem arquivos
DROP POLICY IF EXISTS "Admins can delete download files" ON storage.objects;
CREATE POLICY "Admins can delete download files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'downloads' AND
  EXISTS (
    SELECT 1 FROM public.admin_profiles
    WHERE id = auth.uid()
  )
);

