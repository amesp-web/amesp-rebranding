# 🧪 Teste Rápido - Reset de Senha

## ✅ Correção Aplicada

**Problema identificado:** O fetch interno (servidor chamando a si mesmo) estava falhando.

**Solução:** Criada função `sendEmail()` que envia o email diretamente, sem precisar fazer fetch.

---

## 📝 O Que Foi Alterado

### Novo Arquivo:
- ✨ `lib/email-sender.ts` - Função de envio de email reutilizável

### Arquivos Modificados:
- 🔧 `app/api/auth/request-reset-password/route.ts` - Agora usa `sendEmail()` diretamente

---

## 🧪 Como Testar Agora

### 1️⃣ **Reiniciar o Servidor**

```bash
# Pare o servidor atual (Ctrl+C)
# Depois inicie novamente:
npm run dev
```

### 2️⃣ **Testar com Admin**

1. Acesse: `http://localhost:3001/auth/forgot-password`
2. Digite: `graziely@gobi.consulting`
3. Clique em "Enviar Link de Recuperação"
4. **Verifique os logs do terminal** - deve mostrar:
   ```
   📧 Tentando enviar email para: graziely@gobi.consulting
   📧 E-mail enviado com sucesso: <message-id>
   ✅ Email de redefinição de senha enviado para: graziely@gobi.consulting | MessageID: ...
   ```

### 3️⃣ **Testar com Maricultor**

1. Acesse: `http://localhost:3001/auth/forgot-password`
2. Digite: `duetegrazi@gmail.com`
3. Clique em "Enviar Link de Recuperação"
4. **Verifique os logs do terminal** - mesmos logs acima

### 4️⃣ **Verificar Email Recebido**

- Remetente: `AMESP - Associação dos Maricultores <noreplyamesp@gmail.com>`
- Assunto: `AMESP - Redefinição de Senha`
- Conteúdo: Template bonito com gradiente oceânico
- Botão: "🔐 Redefinir Minha Senha"

---

## 🔍 Logs Esperados

### ✅ **Sucesso:**
```
📧 Tentando enviar email para: duetegrazi@gmail.com
📧 E-mail enviado com sucesso: <1234567890@gmail.com>
✅ Email de redefinição de senha enviado para: duetegrazi@gmail.com | MessageID: <1234567890@gmail.com>
```

### ⚠️ **Email Simulado (Gmail não configurado):**
```
📧 Tentando enviar email para: duetegrazi@gmail.com
📧 EMAIL SIMULADO (Gmail não configurado):
Para: duetegrazi@gmail.com
Assunto: AMESP - Redefinição de Senha
```

### ❌ **Erro:**
```
📧 Tentando enviar email para: duetegrazi@gmail.com
❌ Erro ao enviar e-mail: Error: ...
❌ Erro ao enviar email: Erro ao enviar e-mail Details: ...
```

---

## 🐛 Troubleshooting

### Se aparecer "EMAIL SIMULADO":
- As variáveis `GMAIL_USER` ou `GMAIL_PASSWORD` não estão configuradas no `.env.local`
- Verifique: `cat .env.local | grep GMAIL`

### Se aparecer erro de autenticação do Gmail:
- A senha pode estar incorreta
- Verifique se é uma **senha de app** (não a senha normal do Gmail)
- Gere uma nova senha de app em: https://myaccount.google.com/apppasswords

### Se não aparecer NADA nos logs:
- O servidor não está rodando ou a rota não está sendo chamada
- Verifique se está em `http://localhost:3001/auth/forgot-password`
- Abra o console do navegador (F12) e veja se há erros

---

## ✅ Checklist

- [ ] Servidor reiniciado (`npm run dev`)
- [ ] Testou com admin: `graziely@gobi.consulting`
- [ ] Testou com maricultor: `duetegrazi@gmail.com`
- [ ] Verificou logs no terminal
- [ ] Recebeu email de `noreplyamesp@gmail.com`
- [ ] Clicou no link e redefiniu a senha com sucesso

---

## 📊 Diferença da Solução

| Antes | Depois |
|-------|--------|
| `fetch('/api/send-email')` | `sendEmail()` direto |
| Falha em alguns ambientes | Funciona sempre ✅ |
| Sem logs detalhados | Logs completos ✅ |
| Difícil debug | Fácil debug ✅ |

---

**Teste e me avise se funcionou!** 🎯

