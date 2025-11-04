# 📧 Sistema de Newsletter - AMESP

## ✅ O Que Foi Implementado

Sistema completo de gerenciamento de inscritos na newsletter com autonomia total para o cliente.

---

## 🎯 Como Funciona

### **Fluxo do Usuário:**
```
Visitante preenche formulário de contato
     ↓
Marca checkbox "Desejo receber newsletters"
     ↓
Clica em "Enviar Mensagem"
     ↓
Sistema salva automaticamente no banco de dados
     ↓
Email de notificação enviado
```

### **Fluxo do Admin:**
```
Admin acessa /admin/newsletter
     ↓
Visualiza lista de todos os inscritos
     ↓
Pode:
- Ver estatísticas (total, ativos, taxa)
- Buscar por nome/email
- Exportar lista em CSV
- Ativar/Desativar inscritos
```

---

## 🛠️ Passo 1: Criar Tabela no Banco (OBRIGATÓRIO)

Execute este SQL no **Supabase Dashboard** → **SQL Editor**:

```sql
-- Criar tabela newsletter_subscribers
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  phone TEXT,
  company TEXT,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  unsubscribed_at TIMESTAMPTZ,
  source TEXT DEFAULT 'contact_form',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_active ON newsletter_subscribers(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribed_at ON newsletter_subscribers(subscribed_at DESC);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_newsletter_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_newsletter_updated_at ON newsletter_subscribers;
CREATE TRIGGER trigger_update_newsletter_updated_at
  BEFORE UPDATE ON newsletter_subscribers
  FOR EACH ROW
  EXECUTE FUNCTION update_newsletter_updated_at();
```

**Ou execute o arquivo de migração:**
```bash
# Via psql
psql $DATABASE_URL < migrations/create_newsletter_subscribers.sql
```

---

## 📁 Arquivos Criados

| Arquivo | Descrição |
|---------|-----------|
| `migrations/create_newsletter_subscribers.sql` | SQL para criar tabela |
| `app/api/admin/newsletter/route.ts` | API GET (listar) e PATCH (ativar/desativar) |
| `app/admin/newsletter/page.tsx` | Página admin de gerenciamento |
| `components/admin/admin-sidebar.tsx` | Atualizado com item "Newsletter" |
| `app/api/contact/route.ts` | Atualizado para salvar inscritos |
| `components/public/ContactForm.tsx` | Atualizado com máscara de telefone |

---

## 🎨 Funcionalidades da Página Admin

### **Estatísticas (Cards no Topo):**
- 📊 **Total de Inscritos:** Número total de registros
- ✅ **Ativos:** Quantos estão recebendo newsletter
- 📈 **Taxa de Ativação:** Porcentagem de ativos

### **Lista de Inscritos:**
- 👤 Nome do inscrito
- ✉️ Email
- 📞 Telefone (se fornecido)
- 🏢 Empresa (se fornecida)
- 📅 Data de inscrição
- 🏷️ Badge: Ativo/Inativo
- 🔄 Toggle para ativar/desativar

### **Ações:**
- 🔍 **Buscar:** Por nome, email ou empresa
- 📥 **Exportar CSV:** Lista completa para usar em ferramentas de email marketing
- 🔄 **Ativar/Desativar:** Toggle individual

---

## 🧪 Como Testar

### **1. Executar Migration SQL:**
Copie o SQL acima e execute no Supabase SQL Editor

### **2. Testar Inscrição:**
1. Acesse: http://localhost:3001
2. Role até "Contato"
3. Preencha o formulário
4. ✅ **Marque:** "Desejo receber newsletters"
5. Clique em "Enviar Mensagem"

### **3. Verificar no Admin:**
1. Acesse: http://localhost:3001/admin
2. Clique em **"Newsletter"** no sidebar
3. Deve aparecer o inscrito que você acabou de cadastrar!

### **4. Testar Funcionalidades:**
- ✅ Buscar por nome/email
- ✅ Exportar CSV
- ✅ Desativar/Ativar inscrito

---

## 📧 Exportar Lista (CSV)

O botão "Exportar CSV" gera um arquivo com:
```csv
Nome,Email,Telefone,Empresa,Data Inscrição,Status,Origem
João Silva,joao@email.com,(12) 99999-9999,Empresa XYZ,04/11/2025,Ativo,contact_form
```

**Use este CSV para:**
- Importar em Mailchimp, Brevo, SendGrid
- Enviar emails em massa via Gmail
- Análise de dados

---

## 🔄 Ativar/Desativar Inscritos

### **Desativar:**
- Clique no toggle (muda de verde para cinza)
- Inscrito não aparece mais como "ativo"
- Salva data de cancelamento

### **Reativar:**
- Clique novamente no toggle
- Inscrito volta a ser ativo
- Remove data de cancelamento

**Por quê?**
- Se alguém pedir para cancelar, você desativa
- Mantém histórico (soft delete)
- Pode reativar se pessoa mudar de ideia

---

## 📊 Verificar no Banco de Dados

### **Ver todos os inscritos:**
```sql
SELECT * FROM newsletter_subscribers 
ORDER BY subscribed_at DESC;
```

### **Ver apenas ativos:**
```sql
SELECT email, name, phone, subscribed_at 
FROM newsletter_subscribers 
WHERE is_active = true
ORDER BY subscribed_at DESC;
```

### **Estatísticas:**
```sql
SELECT 
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE is_active = true) as ativos,
  COUNT(*) FILTER (WHERE is_active = false) as inativos
FROM newsletter_subscribers;
```

---

## 🎯 Fluxo Completo de Uso

### **1. Visitante se Inscreve**
- Marca checkbox no formulário
- Dados salvos automaticamente

### **2. Admin Visualiza**
- Acessa `/admin/newsletter`
- Vê novo inscrito na lista

### **3. Exporta Lista (Quando Precisar)**
- Clica em "Exportar CSV"
- Importa em ferramenta de email marketing
- Envia newsletter para todos

### **4. Gerencia Inscritos**
- Desativa quem pediu para sair
- Busca email específico
- Monitora crescimento

---

## 🚀 Próximos Passos (Opcional)

### **Futuro: Integração com Email Marketing**
Quando tiver volume, pode integrar com:
- **Brevo** (grátis até 300 emails/dia)
- **Mailchimp** (grátis até 500 contatos)
- **SendGrid** (API para envio automático)

### **Futuro: Página de Descadastro**
Criar `/newsletter/unsubscribe?email=xxx&token=yyy`
- Link automático nos emails
- Usuário pode se descadastrar sozinho

---

## ⚠️ Importante: LGPD

### **Conformidade:**
- ✅ Opt-in explícito (checkbox)
- ✅ Dados salvos com consentimento
- ✅ Pode desativar inscritos
- ✅ Não envia spam

### **Recomendações:**
- Sempre incluir link de descadastro nos emails
- Respeitar pedidos de remoção
- Não compartilhar emails com terceiros
- Usar apenas para newsletters AMESP

---

## 📋 Checklist de Implementação

- [ ] Executar migration SQL no Supabase
- [ ] Testar inscrição via formulário de contato
- [ ] Acessar `/admin/newsletter` e verificar inscrito
- [ ] Testar busca
- [ ] Testar exportar CSV
- [ ] Testar ativar/desativar
- [ ] Adicionar `CONTACT_EMAIL_RECIPIENT` na Vercel
- [ ] Testar em produção

---

✅ **Sistema completo de newsletter pronto para usar!**

Autonomia total para gerenciar inscritos sem depender de desenvolvedores! 🎉

