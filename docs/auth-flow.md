# 🔄 Fluxo Completo de Autenticação AMESP

## 📋 Resumo do Fluxo

### 1. **Cadastro de Usuário (Admin)**
```
Admin → Formulário → Supabase Auth → E-mail → Usuário
```

### 2. **Primeiro Login (Usuário)**
```
Usuário → Login Temporário → Troca Senha → Login Normal
```

### 3. **Login Futuro (2FA Opcional)**
```
Usuário → Login Normal → SMS (opcional) → Dashboard
```

---

## 🔧 Implementação Técnica

### **Banco de Dados:**
- `auth.users` (Supabase Auth)
- `admin_profiles` (perfis administrativos)
- `maricultor_profiles` (perfis de maricultores)

### **Serviços:**
- **E-mail**: Resend/SendGrid para senhas temporárias
- **SMS**: Twilio para 2FA (opcional)

---

## 📧 Template de E-mail

O e-mail enviado contém:
- ✅ Logo AMESP
- ✅ Senha temporária destacada
- ✅ Instruções claras
- ✅ Link direto para login
- ✅ Aviso de segurança

---

## 🔐 Segurança

### **Senhas Temporárias:**
- 8 caracteres alfanuméricos
- Maiúsculas para facilitar leitura
- Expiração automática

### **2FA (SMS):**
- Código de 6 dígitos
- Válido por 5 minutos
- Opcional por usuário

---

## 🚀 Próximos Passos

1. **Configurar Resend**: Para envio de e-mails em produção
2. **Configurar Twilio**: Para SMS (opcional)
3. **Implementar 2FA**: Tela de verificação por SMS
4. **Testes**: Fluxo completo de cadastro → login → troca senha
