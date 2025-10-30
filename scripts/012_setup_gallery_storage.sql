-- Script para configurar políticas RLS do Supabase Storage para galeria
-- Execute este script no Supabase SQL Editor APÓS criar o bucket 'gallery' no Dashboard

-- NOTA: O bucket 'gallery' deve ser criado manualmente via Dashboard > Storage > New bucket
-- Com as configurações: público, limite 50MB, MIME types: image/jpeg, image/jpg, image/png, image/webp

-- Política para leitura pública de imagens da galeria
DROP POLICY IF EXISTS "Public gallery images are viewable by everyone" ON storage.objects;
CREATE POLICY "Public gallery images are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'gallery');

-- Política para admins fazerem upload na galeria
DROP POLICY IF EXISTS "Admins can upload gallery images" ON storage.objects;
CREATE POLICY "Admins can upload gallery images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'gallery' AND
  EXISTS (
    SELECT 1 FROM public.admin_profiles
    WHERE id = auth.uid()
  )
);

-- Política para admins atualizarem imagens da galeria
DROP POLICY IF EXISTS "Admins can update gallery images" ON storage.objects;
CREATE POLICY "Admins can update gallery images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'gallery' AND
  EXISTS (
    SELECT 1 FROM public.admin_profiles
    WHERE id = auth.uid()
  )
);

-- Política para admins deletarem imagens da galeria
DROP POLICY IF EXISTS "Admins can delete gallery images" ON storage.objects;
CREATE POLICY "Admins can delete gallery images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'gallery' AND
  EXISTS (
    SELECT 1 FROM public.admin_profiles
    WHERE id = auth.uid()
  )
);

