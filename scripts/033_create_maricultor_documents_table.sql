-- Tabela de documentos dos maricultores (múltiplos por maricultor)
-- Tipos: RG, CPF, comprovante_endereco, CNH, outros

CREATE TABLE IF NOT EXISTS public.maricultor_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  maricultor_id UUID NOT NULL REFERENCES public.maricultor_profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('rg', 'cpf', 'comprovante_endereco', 'cnh', 'outros')),
  label TEXT,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  content_type TEXT,
  file_size_bytes BIGINT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para listar documentos por maricultor
CREATE INDEX IF NOT EXISTS idx_maricultor_documents_maricultor_id
  ON public.maricultor_documents(maricultor_id);

-- RLS
ALTER TABLE public.maricultor_documents ENABLE ROW LEVEL SECURITY;

-- Admins podem ver todos os documentos
DROP POLICY IF EXISTS "Admins can view maricultor documents" ON public.maricultor_documents;
CREATE POLICY "Admins can view maricultor documents"
  ON public.maricultor_documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_profiles
      WHERE id = auth.uid()
    )
  );

-- Admins podem inserir
DROP POLICY IF EXISTS "Admins can insert maricultor documents" ON public.maricultor_documents;
CREATE POLICY "Admins can insert maricultor documents"
  ON public.maricultor_documents FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_profiles
      WHERE id = auth.uid()
    )
  );

-- Admins podem atualizar
DROP POLICY IF EXISTS "Admins can update maricultor documents" ON public.maricultor_documents;
CREATE POLICY "Admins can update maricultor documents"
  ON public.maricultor_documents FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_profiles
      WHERE id = auth.uid()
    )
  );

-- Admins podem deletar
DROP POLICY IF EXISTS "Admins can delete maricultor documents" ON public.maricultor_documents;
CREATE POLICY "Admins can delete maricultor documents"
  ON public.maricultor_documents FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_profiles
      WHERE id = auth.uid()
    )
  );

-- Comentário na tabela
COMMENT ON TABLE public.maricultor_documents IS 'Documentos anexados aos maricultores (RG, CPF, comprovante de endereço, CNH, outros). Múltiplos por maricultor.';
