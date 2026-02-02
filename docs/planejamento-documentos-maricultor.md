# Planejamento: Seção de Documentos no Cadastro de Maricultor

Objetivo: definir **onde** adicionar e **o que** configurar para uma seção de documentos no fluxo "Cadastrar Novo Maricultor" (admin).

---

## 1. Onde adicionar

### Estrutura atual do modal "Cadastrar Novo Maricultor"

1. **Dados Pessoais** – Nome, E-mail, Telefone  
2. **Endereço** – CEP, Logradouro, Número, Cidade, Estado  
3. **Informações Profissionais** – Empresa/Fazenda, Especialidades  
4. Footer – Cancelar + Cadastrar Maricultor  

### Proposta de posição

- **Inserir um novo card "Documentos"** entre **Informações Profissionais** e o **Footer**.
- Mesmo modal, mesma tela; o conteúdo do modal já é rolável, então cabe mais um bloco.
- Documentos podem ser **opcionais** no cadastro (não bloquear o "Cadastrar" se não houver arquivos).

Alternativa: documentos em etapa posterior (ex.: após criar o maricultor, abrir tela "Anexar documentos"). Para o admin que já tem os arquivos em mãos, fazer tudo no mesmo modal costuma ser mais prático.

---

## 2. O que a seção "Documentos" pode ter

### Tipos de documento (a definir com o negócio)

Exemplos comuns:

- **Documento de identidade (RG)** – foto/scan  
- **CPF** – foto/scan (ou mesmo que RG se for frente e verso)  
- **Comprovante de endereço**  
- **Licença / alvará** (quando aplicável)  
- **Outros** – anexo genérico com nome/label  

Sugestão: começar com **2–3 tipos fixos** (ex.: RG, CPF, Comprovante de endereço) + um "Outro" com campo de descrição, para não complicar a UI.

### Regras de negócio (a definir)

- Quais documentos são **obrigatórios** (se houver)?  
- Tamanho máximo por arquivo (ex.: 10 MB)?  
- Formatos aceitos (ex.: PDF, JPG, PNG)?  
- Um arquivo por tipo ou vários por tipo?

---

## 3. O que é necessário configurar

### 3.1 Storage (Supabase)

- **Novo bucket** no Supabase Storage, por exemplo: `maricultor_documents`.
- **Privado** (apenas admin/backend acessa; não precisa ser público).
- Configuração sugerida:
  - Tamanho máximo por arquivo: ex. 10 MB.
  - Tipos MIME: `application/pdf`, `image/jpeg`, `image/png`, `image/webp` (e outros se precisar).
- **Políticas RLS** no Storage:
  - INSERT/UPDATE/DELETE: apenas usuários em `admin_profiles` (ou via Service Role na API).
  - SELECT: admin ou o próprio maricultor (se no futuro o maricultor puder ver seus documentos).

Será necessário um script SQL (como os que existem para `gallery`, `events`, etc.) para criar as políticas após criar o bucket no Dashboard.

### 3.2 Banco de dados

- **Nova tabela** para registrar os anexos (recomendado), por exemplo:  
  `maricultor_documents`  
  - `id` (uuid, PK)  
  - `maricultor_id` (uuid, FK → `maricultor_profiles.id`)  
  - `type` ou `label` (ex.: "rg", "cpf", "comprovante_endereco", "outro")  
  - `file_path` (caminho no bucket, ex.: `{maricultor_id}/rg.pdf`)  
  - `file_name` (nome original do arquivo)  
  - `content_type` (opcional)  
  - `created_at`  

Assim dá para listar, exibir e remover documentos por maricultor e por tipo.

### 3.3 API

- **Criar maricultor**  
  - Manter como está: POST `/api/admin/maricultors/create` com dados atuais (nome, email, CPF, etc.).  
  - Retorna `maricultor_id`.

- **Upload de documentos** (após o maricultor existir):  
  - POST `/api/admin/maricultors/[id]/documents`  
  - Receber `multipart/form-data`: arquivo(s) + tipo/label (e descrição se for "outro").  
  - Validar tipo de arquivo e tamanho.  
  - Salvar no bucket `maricultor_documents` em pasta por maricultor (ex.: `{maricultor_id}/`)  
  - Inserir registro(es) em `maricultor_documents`.

- Opcional: GET `/api/admin/maricultors/[id]/documents` para listar documentos do maricultor (e usar na tela de edição).

### 3.4 Fluxo no front (modal Cadastrar Novo Maricultor)

1. Usuário preenche Dados Pessoais, Endereço, Informações Profissionais.  
2. **Novo bloco "Documentos"**:  
   - Para cada tipo (ex.: RG, CPF, Comprovante de endereço, Outro):  
     - Input file + label (e, se "Outro", campo de descrição).  
   - Opcional: preview do nome do arquivo e botão "Remover" antes de enviar.  
3. Ao clicar em **Cadastrar Maricultor**:  
   - Enviar dados atuais para POST `/api/admin/maricultors/create`.  
   - Se retornar sucesso e houver arquivos selecionados:  
     - Chamar POST `/api/admin/maricultors/[id]/documents` com os arquivos (pode ser uma chamada por tipo ou um multipart com vários arquivos, conforme desenho da API).  
   - Em caso de sucesso em tudo: fechar modal, toast de sucesso, refresh da lista.

Assim o cadastro continua funcionando mesmo sem documentos; documentos são um passo extra opcional.

### 3.5 Edição de maricultor

- Na tela **Editar Maricultor**, pode haver uma seção "Documentos" que:  
  - Lista documentos já enviados (via GET `/api/admin/maricultors/[id]/documents`).  
  - Permite adicionar novos e, se a API permitir, remover existentes.  
Isso pode ser uma segunda fase após o cadastro com documentos funcionando.

---

## 4. Resumo do que configurar

| Item | O que fazer |
|------|-------------|
| **Bucket** | Criar `maricultor_documents` no Supabase Storage (privado, tamanho e MIME desejados). |
| **RLS Storage** | Script SQL para políticas de INSERT/SELECT (e UPDATE/DELETE se precisar) para admins (e depois maricultor, se for o caso). |
| **Tabela** | Criar `maricultor_documents` com colunas acima (e migrations/scripts SQL). |
| **API** | POST `/api/admin/maricultors/[id]/documents` (e opcional GET e DELETE). |
| **Modal** | Novo card "Documentos" no `AddMaricultorModal` + fluxo de upload após criar maricultor. |
| **Edição** | (Fase 2) Seção de documentos no `EditMaricultorModal` + listagem/adição/remoção. |

---

## 5. Próximos passos (decisões)

1. **Tipos de documento** – Quais serão obrigatórios/opcionais e os rótulos (RG, CPF, Comprovante, Outro, etc.).  
2. **Formatos e tamanho** – PDF e imagens (JPG/PNG), limite por arquivo (ex.: 10 MB).  
3. **Obrigatoriedade** – Documentos obrigatórios no cadastro ou tudo opcional no primeiro momento.  
4. **Ordem de implementação** – Bucket + tabela + API de upload; em seguida o card no modal de cadastro; por último a parte na edição.

Quando essas decisões estiverem fechadas, dá para detalhar o script SQL do bucket, o schema exato da tabela e o contrato da API (ex.: um exemplo de `multipart/form-data` para o upload).
