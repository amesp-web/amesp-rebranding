# 🧹 Guia de Limpeza de Dados de Teste

## ⚠️ IMPORTANTE - Leia Antes de Executar!

Este guia ajuda a **limpar dados de teste** do banco antes de entregar o sistema ao cliente.

---

## 📋 Checklist Pré-Limpeza

- [ ] Fazer **BACKUP** do banco de dados (Supabase Dashboard → Backups)
- [ ] Confirmar com o cliente quais dados devem ser mantidos
- [ ] Testar o script em ambiente de desenvolvimento primeiro
- [ ] Ter lista de emails/usuários que devem ser MANTIDOS

---

## 🎯 O Que Limpar

### **✅ Dados de TESTE (Devem ser Removidos):**
- Maricultores de teste (emails @teste.com, @test.com, etc)
- Notificações de teste
- Inscritos newsletter de teste
- Contatos de teste

### **⚠️ Dados REAIS (Devem ser MANTIDOS):**
- Admins reais
- Notícias publicadas
- Eventos reais
- Projetos socioambientais
- Galeria de fotos
- Configurações do sistema (about, home-info)

---

## 🛠️ Método 1: Limpeza Seletiva via SQL (Recomendado)

### **Passo 1: Listar Dados de Teste**

Execute no **SQL Editor** para VER antes de deletar:

```sql
-- Ver maricultores
SELECT id, full_name, email, created_at 
FROM maricultor_profiles
ORDER BY created_at DESC;

-- Ver inscritos newsletter
SELECT name, email, subscribed_at 
FROM newsletter_subscribers
ORDER BY subscribed_at DESC;

-- Ver notificações
SELECT title, created_at 
FROM notifications
ORDER BY created_at DESC;
```

### **Passo 2: Deletar Dados Específicos**

```sql
-- Deletar maricultor específico (por email)
DELETE FROM maricultor_profiles 
WHERE email = 'duetegrazi@gmail.com';

-- Ou deletar múltiplos
DELETE FROM maricultor_profiles 
WHERE email IN (
  'teste@teste.com',
  'test@test.com',
  'duetegrazi@gmail.com'
);

-- Deletar inscritos newsletter de teste
DELETE FROM newsletter_subscribers
WHERE email LIKE '%@teste.com' 
   OR email LIKE '%@test.com'
   OR email = 'graziduete@gmail.com';

-- Limpar TODAS as notificações
DELETE FROM notifications;
```

### **Passo 3: Deletar Usuários do Auth**

**Via Supabase Dashboard:**
1. Authentication → Users
2. Procure cada email de teste
3. Clique nos 3 pontinhos → **Delete user**

**ATENÇÃO:** NÃO delete admins reais!

---

## 🛠️ Método 2: Script Completo (Usar com Cuidado!)

Se quiser limpar **TUDO DE UMA VEZ**, use o script:

```sql
-- Ver arquivo: scripts/cleanup_test_data.sql
```

**Mas atenção:**
- Faz backup ANTES!
- Revise o script
- Execute linha por linha (não tudo de uma vez)

---

## ✅ Método 3: Via Interface Admin (Mais Seguro!)

### **Para Maricultores:**
1. Acesse: http://localhost:3001/admin/producers
2. Para cada maricultor de teste:
   - Clique em **"Inativar"** (ao invés de deletar)
3. Depois, se quiser remover do banco:
   - Use SQL para deletar apenas os inativos

### **Para Newsletter:**
1. Acesse: http://localhost:3001/admin/newsletter
2. Para cada inscrito de teste:
   - Clique no toggle para **desativar**
3. Depois, se quiser remover do banco:
   - Use SQL para deletar apenas os inativos

---

## 📊 Script de Limpeza Segura (Recomendado)

Execute **linha por linha** para ter controle:

```sql
-- 1. BACKUP VISUAL - Salvar dados importantes
\copy (SELECT * FROM maricultor_profiles WHERE email NOT LIKE '%@teste.com') TO '/tmp/maricultores_reais.csv' CSV HEADER;

-- 2. Deletar apenas dados de teste confirmados
BEGIN; -- Inicia transação

-- Ver o que será deletado
SELECT 'Será deletado:' as info, full_name, email 
FROM maricultor_profiles 
WHERE email LIKE '%@test%' OR email LIKE '%teste%' OR email = 'duetegrazi@gmail.com';

-- Se estiver OK, delete:
DELETE FROM maricultor_profiles 
WHERE email LIKE '%@test%' OR email LIKE '%teste%' OR email = 'duetegrazi@gmail.com';

-- Limpar notificações
DELETE FROM notifications;

-- Limpar newsletter de teste
DELETE FROM newsletter_subscribers
WHERE email LIKE '%@test%' OR email LIKE '%teste%' OR email = 'graziduete@gmail.com';

-- Ver resultado
SELECT 'Maricultores restantes:' as tabela, COUNT(*) as total FROM maricultor_profiles
UNION ALL
SELECT 'Newsletter restantes:', COUNT(*) FROM newsletter_subscribers
UNION ALL  
SELECT 'Notificações restantes:', COUNT(*) FROM notifications;

-- Se estiver OK:
COMMIT;

-- Se algo deu errado:
-- ROLLBACK;
```

---

## 🎯 Recomendação Final

### **Antes da Entrega:**

1. ✅ **Inative** maricultores de teste (via interface)
2. ✅ **Desative** inscritos newsletter de teste (via interface)
3. ✅ Execute SQL para **deletar apenas inativos**:

```sql
-- Deletar maricultores inativos
DELETE FROM maricultor_profiles WHERE is_active = false;

-- Deletar newsletter inativos  
DELETE FROM newsletter_subscribers WHERE is_active = false;

-- Limpar todas as notificações
DELETE FROM notifications;
```

4. ✅ **Delete usuários** do Auth manualmente (Dashboard)
5. ✅ **Verifique** que dados reais foram mantidos
6. ✅ **Teste** login com admin real
7. ✅ 🎉 **Entregue limpo!**

---

## ⚠️ Dados que NÃO Devem ser Deletados

- ❌ Tabela `users` (admins)
- ❌ Tabela `admin_profiles`
- ❌ Notícias reais (`news`)
- ❌ Eventos reais (`events`)
- ❌ Projetos (`projects`)
- ❌ Galeria (`gallery`)
- ❌ Downloads
- ❌ Configurações (`about`, `home_info`)

---

## 🚀 Processo Seguro em 3 Etapas

### **Etapa 1: Identificar** (VIA INTERFACE)
- Marque visualmente o que é teste
- Inative via interface admin

### **Etapa 2: Limpar** (VIA SQL)
- Delete apenas registros inativos
- Use transações (BEGIN/COMMIT/ROLLBACK)

### **Etapa 3: Verificar**
- Confira que dados reais foram mantidos
- Teste sistema completo
- Login funciona?

---

**Qual método prefere?**
1. Script SQL automático (mais rápido, mais risco)
2. Inativar via interface + SQL seletivo (mais seguro, recomendo!)
3. SQL linha por linha (máximo controle)

Posso criar scripts específicos para qualquer opção! 🎯

