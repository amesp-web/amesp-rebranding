# 🔧 Migration: Adicionar CPF à Tabela maricultor_profiles

## ⚠️ IMPORTANTE - Execute AGORA!

A funcionalidade de cadastro de maricultores pelo admin **requer** a coluna `cpf` na tabela `maricultor_profiles`.

---

## 📋 Como Executar:

### **1. Acesse Supabase Dashboard**
```
https://supabase.com/dashboard
→ Seu Projeto
→ SQL Editor
```

### **2. Copie o SQL**
```
Abra: migrations/add_cpf_to_maricultor_profiles.sql
Copie TODO o conteúdo
```

### **3. Cole e Execute**
```
Cole no SQL Editor
Clique em "Run" (ou Ctrl/Cmd + Enter)
```

### **4. Verifique**
Você deve ver a mensagem:
```
✅ Coluna CPF adicionada com sucesso à tabela maricultor_profiles
```

---

## ✅ O que a Migration Faz:

1. **Adiciona coluna `cpf`** (tipo TEXT)
2. **Cria índice único** para evitar CPFs duplicados
3. **Segura:** Só adiciona se não existir

---

## 🧪 Depois de Executar:

**Teste o cadastro de maricultor:**
```
http://localhost:3000/admin/producers
→ Clique "Novo Maricultor"
→ Preencha o formulário
→ Deve cadastrar SEM ERRO!
```

---

## ⚠️ Se der erro de duplicação:

```sql
-- Remover índice (se necessário):
DROP INDEX IF EXISTS maricultor_profiles_cpf_unique;

-- Recriar índice:
CREATE UNIQUE INDEX maricultor_profiles_cpf_unique 
ON public.maricultor_profiles(cpf) 
WHERE cpf IS NOT NULL;
```

---

## 📊 Estrutura Final da Tabela:

```
maricultor_profiles:
- id (UUID)
- full_name (TEXT)
- cpf (TEXT) ⭐ NOVO!
- phone (TEXT)
- logradouro (TEXT)
- cidade (TEXT)
- estado (TEXT)
- cep (TEXT)
- company (TEXT)
- specialties (TEXT)
- latitude (DECIMAL)
- longitude (DECIMAL)
- is_active (BOOLEAN)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

---

**Execute a migration AGORA e depois teste o cadastro!** 🚀

