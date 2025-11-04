# 🔐 Guia de Implementação: Sistema de Redefinição de Senha Customizado

## 📋 Visão Geral

Este guia implementa um sistema completo de redefinição de senha usando o **email próprio do sistema** (`noreplayamesp@gmail.com`) ao invés do Supabase Auth, mantendo a consistência com os outros emails do sistema.

## ✅ Vantagens desta Implementação

- ✉️ **Email personalizado**: Todos os emails vêm de `noreplayamesp@gmail.com`
- 🎨 **Template consistente**: Usa o mesmo design dos outros emails AMESP
- 🔒 **Segurança**: Tokens com validade de 1 hora
- 📊 **Controle total**: Gerenciamento próprio dos tokens no banco de dados
- 🚀 **Independência**: Não depende do SMTP do Supabase Auth

## 📧 Passo 1: Configurar Variáveis de Ambiente

Certifique-se de que seu `.env.local` contém:

```env
# Email (Gmail)
GMAIL_USER=noreplayamesp@gmail.com
GMAIL_PASSWORD=sua-senha-de-app-do-gmail
GMAIL_FROM_NAME=AMESP
GMAIL_FROM_EMAIL=noreplayamesp@gmail.com

# URL do site
NEXT_PUBLIC_SITE_URL=http://localhost:3001
```

### Como obter GMAIL_PASSWORD (Senha de App):

1. Acesse a conta Gmail `noreplayamesp@gmail.com`
2. Vá em **Configurações** → **Segurança**
3. Ative **Verificação em duas etapas** (se ainda não estiver)
4. Após ativar, acesse **Senhas de app**
5. Crie uma nova senha de app:
   - Nome: "AMESP Sistema"
   - Copie a senha gerada (16 caracteres sem espaços)
6. Cole essa senha em `GMAIL_PASSWORD`

## 🔄 Passo 2: Como Funciona o Novo Fluxo

### 1️⃣ Usuário solicita redefinição

```
/auth/forgot-password
     ↓
POST /api/auth/request-reset-password
     ↓
1. Verifica se email existe (auth.users)
2. Gera token único (32 bytes)
3. Salva token no user_metadata (válido 1h)
4. Envia email via nodemailer
```

### 2️⃣ Usuário clica no link do email

```
Email recebido com link:
/reset-password?token=abc123...&email=usuario@email.com
     ↓
GET /api/auth/reset-password (valida token)
     ↓
Formulário de nova senha
```

### 3️⃣ Usuário define nova senha

```
POST /api/auth/reset-password
     ↓
1. Valida token (não expirado + correto)
2. Atualiza senha no Supabase Auth
3. Limpa token do user_metadata
4. Redireciona para /maricultor/login
```

## 📁 Arquivos Criados/Modificados

### ✨ Novos Arquivos:
- `app/api/auth/request-reset-password/route.ts` - Solicita redefinição
- `app/api/auth/reset-password/route.ts` - Valida token e redefine senha

### 📝 Arquivos Modificados:
- `app/api/send-email/route.ts` - Suporta email de reset de senha
- `app/auth/forgot-password/page.tsx` - Usa API própria ao invés do Supabase Auth
- `app/reset-password/page.tsx` - Valida token customizado

## 🧪 Como Testar

### 1. Testar solicitação de redefinição:

```bash
# Via terminal (para debug)
curl -X POST http://localhost:3001/api/auth/request-reset-password \
  -H "Content-Type: application/json" \
  -d '{"email":"maricultor@teste.com"}'
```

**Ou pela interface:**
1. Acesse `http://localhost:3001/auth/forgot-password`
2. Digite um email cadastrado
3. Clique em "Enviar Link de Recuperação"
4. Verifique o email recebido

### 2. Verificar email enviado:

O email deve vir de `noreplayamesp@gmail.com` com:
- ✅ Logo AMESP
- ✅ Gradiente oceânico
- ✅ Botão "Redefinir Minha Senha"
- ✅ Link alternativo para copiar
- ✅ Aviso de validade (1 hora)

### 3. Testar redefinição:

1. Clique no link do email
2. Deve abrir `/reset-password?token=...&email=...`
3. Digite nova senha (deve atender aos critérios)
4. Clique em "Redefinir Senha"
5. Deve redirecionar para `/maricultor/login`
6. Faça login com a nova senha

## 🔍 Verificar Tokens Ativos

Os tokens agora são armazenados no `user_metadata` do Supabase Auth, não em campos de tabela.

### Ver tokens ativos via Dashboard:
1. Acesse **Supabase Dashboard** → **Authentication** → **Users**
2. Clique em qualquer usuário
3. Veja a seção **User Metadata**
4. Procure por `reset_token_hash` e `reset_token_expires_at`

### Ver via API/SQL (se necessário para debug):
Os tokens ficam no campo `raw_user_meta_data` da tabela `auth.users`:

```sql
SELECT email, raw_user_meta_data->>'reset_token_hash' as token,
       raw_user_meta_data->>'reset_token_expires_at' as expiry
FROM auth.users 
WHERE raw_user_meta_data->>'reset_token_hash' IS NOT NULL;
```

## ⚠️ Troubleshooting

### Problema: "Email não está sendo enviado"
**Solução:**
1. Verifique se `GMAIL_USER` e `GMAIL_PASSWORD` estão corretos no `.env.local`
2. Certifique-se de usar uma senha de app, não a senha normal do Gmail
3. Verifique os logs do servidor: `console.log` mostrará se o email foi enviado

### Problema: "Token inválido"
**Solução:**
1. Token expira em 1 hora - solicite um novo link
2. Cada token só pode ser usado uma vez
3. Verifique se o link copiado está completo (com `?token=...&email=...`)

### Problema: "Email não está sendo encontrado" (Email enviado mas não recebido)
**Solução:**
1. Verifique se o usuário está cadastrado em `auth.users` (Supabase Dashboard → Authentication → Users)
2. O sistema busca usuários tanto na tabela `users` (admins) quanto em `maricultor_profiles` (maricultores)
3. Verifique os logs do servidor para ver se há erros
4. Teste com um email que você tem certeza que existe

### Problema: "Erro ao atualizar senha"
**Solução:**
Certifique-se de que o Service Role Key do Supabase está configurado corretamente para permitir `admin.updateUserById`

## 📊 Comparação: Antes vs Depois

| Aspecto | Antes (Supabase Auth) | Depois (Sistema Próprio) |
|---------|----------------------|-------------------------|
| Remetente | `noreply@mail.app.supabase.io` | `noreplayamesp@gmail.com` ✅ |
| Template | Genérico do Supabase | Personalizado AMESP ✅ |
| Controle | Limitado | Total ✅ |
| Consistência | Diferente dos outros emails | Igual aos outros emails ✅ |
| Tokens | Gerenciado pelo Supabase | Gerenciado pelo sistema ✅ |

## 🚀 Próximos Passos (Opcional)

1. **Adicionar limite de tentativas**: Prevenir spam de solicitações
2. **Log de auditoria**: Registrar quando senhas são alteradas
3. **Notificação por email**: Avisar quando senha foi alterada com sucesso
4. **2FA (autenticação de dois fatores)**: Adicionar camada extra de segurança

## 📞 Suporte

Se tiver dúvidas ou problemas:
1. Verifique os logs do servidor no terminal
2. Consulte este guia novamente
3. Verifique as configurações do `.env.local`
4. Execute os comandos SQL de verificação no banco

---

✅ **Implementação completa!** Agora o sistema de redefinição de senha usa o email `noreplayamesp@gmail.com` e mantém consistência com todos os outros emails do sistema AMESP.

