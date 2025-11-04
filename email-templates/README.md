# 📧 Templates de Email AMESP

## Como configurar no Supabase

### 1️⃣ Acessar Email Templates

1. Vá para **Supabase Dashboard**
2. Clique em **Authentication** (menu lateral)
3. Clique na aba **Email Templates**

### 2️⃣ Configurar "Reset Password"

1. Encontre o template **"Reset Password"**
2. Clique em **Edit**
3. Cole o conteúdo de `forgot-password-template.html`
4. **IMPORTANTE:** Ajuste o link da logo:
   - Substitua `https://seu-dominio.com/amesp_logo_white.png`
   - Por uma URL pública da logo AMESP (pode usar o Supabase Storage)

### 3️⃣ Variáveis Disponíveis

O Supabase fornece estas variáveis automáticas:

- `{{ .ConfirmationURL }}` - Link mágico para redefinir senha (já incluído no template)
- `{{ .SiteURL }}` - URL do seu site
- `{{ .Email }}` - Email do destinatário

### 4️⃣ Testar

1. Acesse `http://localhost:3001/auth/forgot-password`
2. Digite um email cadastrado
3. Verifique a caixa de entrada
4. Email personalizado AMESP deve chegar!

## 🎨 Características do Template

✅ Gradiente oceânico (blue → cyan → teal)  
✅ Logo AMESP destacada  
✅ Botão de ação com efeito visual  
✅ Alertas de segurança  
✅ Link alternativo (fallback)  
✅ Footer profissional  
✅ Responsivo (mobile e desktop)  
✅ Identidade visual AMESP  

## 📝 Observações

- O link expira em **1 hora** (padrão Supabase)
- Por segurança, sempre mostramos "email enviado" mesmo que o email não exista
- Funciona para **admins** e **maricultores**
- Após redefinir senha, usuário é redirecionado para `/reset-password`

## 📮 Configurar Email Personalizado (SMTP Customizado)

### Por que usar email personalizado?

**Vantagens:**
- ✅ Maior profissionalismo (emails vêm de `noreplayamesp@gmail.com`)
- ✅ Consistência com outros emails do sistema (boas-vindas, notificações)
- ✅ Melhora a taxa de entrega (evita spam)
- ✅ Branding forte da marca AMESP

### Como Configurar no Supabase

#### 1️⃣ Preparar Credenciais SMTP do Gmail

Para usar `noreplayamesp@gmail.com`:

1. Acesse a conta Gmail `noreplayamesp@gmail.com`
2. Vá em **Configurações** → **Segurança**
3. Ative **Verificação em duas etapas**
4. Após ativar, acesse **Senhas de app**
5. Crie uma nova senha de app:
   - Nome: "Supabase Auth"
   - Copie a senha gerada (16 caracteres)

#### 2️⃣ Configurar no Supabase Dashboard

1. Acesse o **Supabase Dashboard**
2. Vá em **Project Settings** → **Auth**
3. Role até a seção **SMTP Settings**
4. Preencha os campos:

```
Sender name: AMESP
Sender email: noreplayamesp@gmail.com
Host: smtp.gmail.com
Port: 587
Username: noreplayamesp@gmail.com
Password: [senha de app gerada no passo anterior]
Enable TLS: ✅ (Ativado)
```

5. Clique em **Save**

#### 3️⃣ Testar a Configuração

1. Vá em **Authentication** → **Email Templates**
2. Clique em **"Send test email"** em qualquer template
3. Verifique se o email chegou vindo de `noreplayamesp@gmail.com`

### ⚠️ Importante

- Com SMTP customizado, TODOS os emails do Supabase Auth serão enviados por `noreplayamesp@gmail.com`
- Isso inclui:
  - Redefinição de senha
  - Confirmação de email
  - Convites de usuário
  - Mudança de email
- Mantenha as credenciais seguras (não commite no Git!)

### 🔄 Alternativa: SendGrid, AWS SES, Resend

Se preferir um serviço mais robusto que o Gmail:

- **SendGrid** (gratuito até 100 emails/dia)
- **AWS SES** (US$ 0.10 por 1000 emails)
- **Resend** (gratuito até 3000 emails/mês)

Todos permitem usar `noreplayamesp@gmail.com` como remetente após verificar o domínio.

