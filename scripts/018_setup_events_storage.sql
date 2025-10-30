-- Script para configurar políticas RLS do Supabase Storage para o bucket 'events'
-- Execute este script no Supabase SQL Editor APÓS criar o bucket 'events' no Dashboard
-- Sugestão de configuração do bucket: público = true, limite 50MB, MIME types: image/jpeg, image/jpg, image/png, image/webp

-- Leitura pública de todos os arquivos do bucket 'events' (banners, fotos, logos de stands/participantes/patrocinadores)
DROP POLICY IF EXISTS "Public events assets are viewable by everyone" ON storage.objects;
CREATE POLICY "Public events assets are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'events');

-- Upload apenas por administradores autenticados
DROP POLICY IF EXISTS "Admins can upload events assets" ON storage.objects;
CREATE POLICY "Admins can upload events assets"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'events' AND
  EXISTS (
    SELECT 1 FROM public.admin_profiles
    WHERE id = auth.uid()
  )
);

-- Atualização apenas por administradores autenticados
DROP POLICY IF EXISTS "Admins can update events assets" ON storage.objects;
CREATE POLICY "Admins can update events assets"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'events' AND
  EXISTS (
    SELECT 1 FROM public.admin_profiles
    WHERE id = auth.uid()
  )
);

-- Exclusão apenas por administradores autenticados
DROP POLICY IF EXISTS "Admins can delete events assets" ON storage.objects;
CREATE POLICY "Admins can delete events assets"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'events' AND
  EXISTS (
    SELECT 1 FROM public.admin_profiles
    WHERE id = auth.uid()
  )
);


