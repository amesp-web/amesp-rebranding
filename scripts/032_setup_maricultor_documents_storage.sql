-- Configuração do bucket 'maricultor_documents' (documentos dos maricultores)
-- Execute este script no Supabase SQL Editor APÓS criar o bucket no Dashboard.
--
-- CRIAR O BUCKET NO DASHBOARD:
-- 1. Storage > New bucket
-- 2. Nome: maricultor_documents
-- 3. Public: OFF (bucket privado – só admin/API acessa)
-- 4. File size limit: 10 MB (ou o valor desejado)
-- 5. Allowed MIME types: application/pdf, image/jpeg, image/jpg, image/png, image/webp
--
-- Tipos de documento: RG, CPF, Comprovante de endereço, CNH, Outros

-- Leitura: apenas admins (e no futuro o próprio maricultor, se necessário)
DROP POLICY IF EXISTS "Admins can view maricultor documents" ON storage.objects;
CREATE POLICY "Admins can view maricultor documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'maricultor_documents' AND
  EXISTS (
    SELECT 1 FROM public.admin_profiles
    WHERE id = auth.uid()
  )
);

-- Upload: apenas admins
DROP POLICY IF EXISTS "Admins can upload maricultor documents" ON storage.objects;
CREATE POLICY "Admins can upload maricultor documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'maricultor_documents' AND
  EXISTS (
    SELECT 1 FROM public.admin_profiles
    WHERE id = auth.uid()
  )
);

-- Atualização: apenas admins
DROP POLICY IF EXISTS "Admins can update maricultor documents" ON storage.objects;
CREATE POLICY "Admins can update maricultor documents"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'maricultor_documents' AND
  EXISTS (
    SELECT 1 FROM public.admin_profiles
    WHERE id = auth.uid()
  )
);

-- Exclusão: apenas admins
DROP POLICY IF EXISTS "Admins can delete maricultor documents" ON storage.objects;
CREATE POLICY "Admins can delete maricultor documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'maricultor_documents' AND
  EXISTS (
    SELECT 1 FROM public.admin_profiles
    WHERE id = auth.uid()
  )
);
