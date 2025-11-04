# 🗑️ Como Deletar um Maricultor com Segurança

Este guia explica como deletar um maricultor específico **SEM criar fantasmas** no sistema.

---

## ⚠️ O Problema do "Fantasma"

Quando você deleta manualmente um maricultor:
- ❌ Registro some da tabela `maricultor_profiles`
- ❌ Usuário continua em `auth.users` (fantasma!)
- ❌ Notificações ficam órfãs
- ❌ Usuário fantasma pode tentar fazer login e causar erros

**Solução:** Use o script `deletar_maricultor_seguro.sql`

---

## 📋 Passo a Passo

### **1. Acesse o Supabase Dashboard**
```
https://supabase.com/dashboard
→ Seu Projeto
→ SQL Editor
```

### **2. Abra o Script**
```
Abra: scripts/deletar_maricultor_seguro.sql
Copie TODO o conteúdo
```

### **3. Cole no SQL Editor**
```
Cole o script no SQL Editor do Supabase
```

### **4. Execute em Partes** (IMPORTANTE!)

#### **Parte 1: Visualizar Dados**
Execute até a linha `-- ⏸️ PAUSE AQUI!`

Você verá:
- ✅ Dados do maricultor (nome, email, cpf, etc)
- ✅ Dados do auth.users
- ✅ Notificações relacionadas

**Revise tudo! Tem certeza que é o usuário certo?**

#### **Parte 2: Deletar**
Se estiver tudo OK, continue executando o resto do script.

Ele vai:
1. Deletar notificações relacionadas
2. Deletar da tabela `maricultor_profiles`
3. Deletar do `auth.users`
4. Verificar se foi deletado com sucesso

#### **Parte 3: Confirmar ou Cancelar**

**Se deu tudo certo:**
```sql
COMMIT;
```

**Se algo deu errado:**
```sql
ROLLBACK;
```

---

## 🎯 Para Deletar OUTRO Maricultor

Substitua o UUID no script:

```sql
-- Procure por todas as linhas com:
WHERE id = '8b3a4766-1670-4716-8923-7aa439a1f46c'

-- Substitua por:
WHERE id = 'SEU-UUID-AQUI'
```

**IMPORTANTE:** Substitua em **TODAS** as ocorrências (há várias no script!)

---

## ✅ Checklist de Segurança

Antes de executar:
- [ ] Fiz backup do banco (Supabase Dashboard → Database → Backups)
- [ ] Copiei o UUID correto do maricultor
- [ ] Substituí TODOS os UUIDs no script
- [ ] Li os dados antes de deletar
- [ ] Tenho certeza que é o usuário certo

Depois de executar:
- [ ] Executei COMMIT para confirmar
- [ ] Verifiquei que o maricultor sumiu da tabela
- [ ] Verifiquei que o usuário sumiu do auth
- [ ] Testei que não há erros no sistema

---

## 🆘 Se Algo Der Errado

### **Erro: "permission denied"**
- Execute no **SQL Editor do Supabase Dashboard**
- NÃO execute via código da aplicação

### **Erro: "relation does not exist"**
- Verifique o nome da tabela
- Use `maricultor_profiles` (nome correto da tabela)

### **Fantasma já criado?**
```sql
-- Para ver fantasmas:
SELECT u.id, u.email, u.role
FROM auth.users u
LEFT JOIN maricultor_profiles m ON u.id = m.id
WHERE u.role = 'authenticated' 
  AND m.id IS NULL
  AND u.email LIKE '%@%';

-- Para deletar um fantasma:
DELETE FROM auth.users WHERE id = 'UUID-DO-FANTASMA';
```

---

## 📚 Referências

- `scripts/deletar_maricultor_seguro.sql` - Script de deleção
- `scripts/limpar_para_cliente.sql` - Limpeza completa para entrega
- `scripts/LIMPEZA_PRE_ENTREGA.md` - Guia de limpeza geral

---

## 💡 Dica Pro

Para deletar **vários** maricultores de teste de uma vez, use:
```
scripts/limpar_para_cliente.sql
```

Ele limpa tudo e deixa o banco pronto para o cliente! 🎯

