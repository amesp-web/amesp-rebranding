-- Script para configurar políticas RLS do Supabase Storage para projetos
-- Execute este script no Supabase SQL Editor APÓS criar o bucket 'projects' no Dashboard

-- NOTA: O bucket 'projects' deve ser criado manualmente via Dashboard > Storage > New bucket
-- Com as configurações: público, limite 50MB, MIME types: image/jpeg, image/jpg, image/png, image/webp

-- Política para leitura pública de arquivos de projetos
DROP POLICY IF EXISTS "Public project files are viewable by everyone" ON storage.objects;
CREATE POLICY "Public project files are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'projects');

-- Política para admins fazerem upload de arquivos de projetos
DROP POLICY IF EXISTS "Admins can upload project files" ON storage.objects;
CREATE POLICY "Admins can upload project files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'projects' AND
  EXISTS (
    SELECT 1 FROM public.admin_profiles
    WHERE id = auth.uid()
  )
);

-- Política para admins atualizarem arquivos de projetos
DROP POLICY IF EXISTS "Admins can update project files" ON storage.objects;
CREATE POLICY "Admins can update project files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'projects' AND
  EXISTS (
    SELECT 1 FROM public.admin_profiles
    WHERE id = auth.uid()
  )
);

-- Política para admins deletarem arquivos de projetos
DROP POLICY IF EXISTS "Admins can delete project files" ON storage.objects;
CREATE POLICY "Admins can delete project files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'projects' AND
  EXISTS (
    SELECT 1 FROM public.admin_profiles
    WHERE id = auth.uid()
  )
);

