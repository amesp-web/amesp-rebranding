# Documentos do Maricultor – Configuração

Tipos de documento: **RG**, **CPF**, **Comprovante de endereço**, **CNH**, **Outros**. Múltiplos documentos por maricultor; nenhum obrigatório no primeiro momento.

## 1. Criar o bucket no Supabase (Dashboard)

1. Acesse **Storage** no painel do Supabase.
2. Clique em **New bucket**.
3. Preencha:
   - **Name:** `maricultor_documents`
   - **Public bucket:** **OFF** (deixe privado).
   - **File size limit:** ex. `10` MB.
   - **Allowed MIME types:** `application/pdf`, `image/jpeg`, `image/jpg`, `image/png`, `image/webp`.
4. Salve.

## 2. Executar os scripts no SQL Editor

Na ordem:

1. **Políticas do Storage**  
   Abra e execute: `032_setup_maricultor_documents_storage.sql`.

2. **Tabela de documentos**  
   Abra e execute: `033_create_maricultor_documents_table.sql`.

Depois disso o Storage e a tabela ficam prontos para a API e a tela de cadastro/edição de maricultor.
