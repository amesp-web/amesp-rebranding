# 📧 Formulário de Contato - AMESP

## ✅ Implementação Completa

Sistema de envio de emails do formulário de contato usando `noreplyamesp@gmail.com` como remetente.

---

## 🎯 Como Funciona

### **Fluxo:**
```
Visitante preenche formulário na home
     ↓
Clica em "Enviar Mensagem"
     ↓
POST /api/contact
     ↓
Email enviado por: noreplyamesp@gmail.com
Email recebido em: graziduete@gmail.com (teste)
                   comunicacao.amesp@gmail.com (produção)
Reply-to: email do visitante
     ↓
Confirmação de sucesso na tela
```

---

## 📝 **Campos do Formulário:**

### **Obrigatórios:**
- ✅ Nome Completo
- ✅ E-mail
- ✅ Assunto
- ✅ Mensagem

### **Opcionais:**
- Telefone
- Empresa/Organização
- Newsletter (checkbox)

---

## 📧 **Template do Email:**

O email que chega contém:
- 🎨 Header com gradiente oceânico AMESP
- 👤 Todos os dados do contato
- 📋 Assunto selecionado
- 💬 Mensagem completa
- ℹ️ Indicador se deseja newsletter
- 📅 Data/hora do envio

**Destaque:** Quando você clicar em "Responder", responderá **direto para o email do visitante**!

---

## ⚙️ **Configuração:**

### **Variável de Ambiente:**

#### **Para Teste (Desenvolvimento):**
`.env.local`:
```env
CONTACT_EMAIL_RECIPIENT=graziduete@gmail.com
```

#### **Para Produção (Vercel):**
Quando estiver tudo OK, adicionar na Vercel:
```env
CONTACT_EMAIL_RECIPIENT=comunicacao.amesp@gmail.com
```

---

## 🧪 **Como Testar:**

### **1. Servidor Rodando**
Certifique-se que está rodando: `npm run dev -- -p 3001`

### **2. Acessar Formulário**
1. Acesse: http://localhost:3001
2. Role até o final da página (seção "Contato")

### **3. Preencher e Enviar**
1. Preencha:
   - **Nome:** Teste AMESP
   - **Email:** seu-email-teste@gmail.com
   - **Telefone:** (12) 99999-9999 (opcional)
   - **Empresa:** Teste Ltda (opcional)
   - **Assunto:** Informações sobre associação
   - **Mensagem:** Esta é uma mensagem de teste do formulário de contato.
2. Marque (opcional): ☑️ Desejo receber newsletters
3. Clique em **"Enviar Mensagem"**

### **4. Verificar:**

**No navegador:**
- ✅ Botão muda para "Enviando..." (loading)
- ✅ Toast de sucesso aparece
- ✅ Tela mostra mensagem de confirmação verde

**No terminal do servidor:**
- ✅ Log: `📧 E-mail enviado com sucesso: <message-id>`
- ✅ Log: `✅ Email de contato enviado para: graziduete@gmail.com`

**No email `graziduete@gmail.com`:**
- ✅ Email chegou de: `AMESP - Associação dos Maricultores <noreplyamesp@gmail.com>`
- ✅ Assunto: `Nova Mensagem de Contato - Informações sobre associação`
- ✅ Template bonito com gradiente oceânico
- ✅ Todos os dados do formulário

---

## 🔄 **Trocar Email de Destino (Produção):**

Quando estiver tudo testado e OK:

### **1. Atualizar na Vercel:**
1. Acesse: https://vercel.com/amesp-web/amesp-rebranding/settings/environment-variables
2. Adicione nova variável:
   - **Key:** `CONTACT_EMAIL_RECIPIENT`
   - **Value:** `comunicacao.amesp@gmail.com`
   - **Environment:** All Environments
3. Clique em **Save**
4. Faça **Redeploy**

### **2. Atualizar Localmente (Opcional):**
Edite `.env.local`:
```env
CONTACT_EMAIL_RECIPIENT=comunicacao.amesp@gmail.com
```

---

## 📊 **Arquivos Criados:**

| Arquivo | Descrição |
|---------|-----------|
| `app/api/contact/route.ts` | Rota API que processa o formulário |
| `components/public/ContactForm.tsx` | Componente do formulário (client-side) |
| `lib/email-sender.ts` | Atualizado para suportar `replyTo` |
| `app/page.tsx` | Atualizado para usar ContactForm |

---

## ✨ **Funcionalidades:**

### ✅ **Validações:**
- Campos obrigatórios
- Formato de email válido
- Feedback visual de erros

### ✅ **UX:**
- Loading state no botão
- Toast de sucesso/erro
- Mensagem de confirmação bonita
- Formulário limpa após envio

### ✅ **Email:**
- Template profissional AMESP
- Reply-to automático para o visitante
- Informação se deseja newsletter
- Data/hora do envio

---

## 🎯 **Próximos Passos:**

1. ✅ Testar com `graziduete@gmail.com`
2. ✅ Verificar se email chega corretamente
3. ✅ Testar "Responder" no email (deve ir para email do visitante)
4. ✅ Quando OK, trocar para `comunicacao.amesp@gmail.com` na Vercel

---

## ⚠️ **Importante:**

- 📧 Remetente: `noreplyamesp@gmail.com` (não mude!)
- 📥 Destinatário: `graziduete@gmail.com` (teste) → `comunicacao.amesp@gmail.com` (produção)
- ↩️ Reply-to: Email do visitante (automático!)

---

✅ **Sistema completo e pronto para testar!**

