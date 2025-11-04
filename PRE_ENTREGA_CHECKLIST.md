# ✅ Checklist Pré-Entrega ao Cliente - AMESP

## 🎯 Objetivo
Entregar o sistema **limpo**, sem dados de teste, mas com todas as funcionalidades prontas.

---

## 📋 Checklist Completo

### **1. BACKUP** ⚠️ OBRIGATÓRIO!
- [ ] Fazer backup do banco (Supabase → Backups → Create Backup)
- [ ] Salvar backup localmente (se possível)
- [ ] Confirmar que backup foi criado

---

### **2. Limpar Dados de Teste**

#### **A. Maricultores de Teste:**

**Via Interface (Recomendado):**
- [ ] Acessar: http://localhost:3001/admin/producers
- [ ] Para cada maricultor de teste, clicar em **"Inativar"**
- [ ] Conferir quais ficaram inativos

**Via SQL:**
```sql
-- Ver maricultores
SELECT full_name, email, is_active FROM maricultor_profiles;

-- Deletar inativos (após conferir)
DELETE FROM maricultor_profiles WHERE is_active = false;

-- OU deletar por email específico
DELETE FROM maricultor_profiles WHERE email = 'duetegrazi@gmail.com';
```

- [ ] Executado SQL de limpeza

**Via Supabase Dashboard (Auth):**
- [ ] Authentication → Users
- [ ] Deletar usuários de teste manualmente:
  - `duetegrazi@gmail.com`
  - `graziduete@gmail.com`
  - Outros emails de teste
- [ ] ⚠️ **NÃO deletar:** `graziely@gobi.consulting` (admin real!)

---

#### **B. Newsletter de Teste:**

- [ ] Acessar: http://localhost:3001/admin/newsletter
- [ ] Desativar inscritos de teste
- [ ] Ou deletar via SQL:

```sql
DELETE FROM newsletter_subscribers 
WHERE email IN ('graziduete@gmail.com', 'outros@teste.com');
```

---

#### **C. Notificações de Teste:**

- [ ] Deletar TODAS (vão acumular de novo):

```sql
DELETE FROM notifications;
```

---

### **3. Testar Funcionalidades**

Após limpar, testar se tudo funciona:

#### **Login Admin:**
- [ ] Acessar: http://localhost:3001/login
- [ ] Fazer login com admin real
- [ ] Dashboard carrega corretamente
- [ ] Sidebar funcionando
- [ ] Sininho sem notificações

#### **Funcionalidades Admin:**
- [ ] Criar/editar notícia
- [ ] Criar/editar evento
- [ ] Upload na galeria
- [ ] Ver produtores (vazio ou só dados reais)
- [ ] Newsletter (vazio ou só dados reais)
- [ ] Notificações (vazio inicialmente)

#### **Página Pública:**
- [ ] Home carrega corretamente
- [ ] Notícias aparecem
- [ ] Galeria funciona
- [ ] Mapa de produtores
- [ ] Formulário de contato envia

#### **Cadastro de Maricultor:**
- [ ] Cadastrar novo maricultor de teste
- [ ] Login com maricultor funciona
- [ ] Dashboard maricultor funciona
- [ ] 🔔 Notificação aparece no admin

---

### **4. Configurações de Produção (Vercel)**

- [ ] Todas as 11 variáveis configuradas
- [ ] `NEXT_PUBLIC_SITE_URL` correto (vercel ou domínio oficial)
- [ ] `CONTACT_EMAIL_RECIPIENT` = `comunicacao.amesp@gmail.com`
- [ ] Deploy mais recente funcionando

---

### **5. Documentação para o Cliente**

#### **Deixar Pronta:**
- [ ] `GUIA_SEO.md` - Para quando migrar domínio
- [ ] `FORMULARIO_CONTATO.md` - Como funciona contato
- [ ] `NEWSLETTER_IMPLEMENTACAO.md` - Gerenciar inscritos
- [ ] `NOTIFICACOES_SISTEMA.md` - Sistema de notificações
- [ ] `GUIA_RESET_SENHA_CUSTOMIZADO.md` - Reset de senha

#### **Remover/Ocultar:**
- [ ] `TESTE_RAPIDO_RESET_SENHA.md` (deletar)
- [ ] Scripts de teste (deixar em `scripts/` mas avisar)
- [ ] Arquivos `.md` de desenvolvimento

---

### **6. Dados Reais para Deixar (Exemplos)**

Se o cliente quiser dados iniciais:

#### **Opção A: Deixar Vazio**
- Sistema 100% limpo
- Cliente adiciona tudo

#### **Opção B: Dados Iniciais**
- [ ] 1-2 notícias reais da AMESP
- [ ] 1-2 projetos socioambientais
- [ ] Fotos na galeria
- [ ] Informações "Quem Somos"
- [ ] Eventos futuros

---

### **7. Verificação Final**

Execute no Supabase SQL Editor:

```sql
-- Contagem final
SELECT 'DADOS FINAIS:' as categoria;

SELECT 'Admins:' as tipo, COUNT(*) as total FROM admin_profiles
UNION ALL
SELECT 'Maricultores:', COUNT(*) FROM maricultor_profiles
UNION ALL
SELECT 'Newsletter:', COUNT(*) FROM newsletter_subscribers
UNION ALL
SELECT 'Notificações:', COUNT(*) FROM notifications
UNION ALL
SELECT 'Notícias:', COUNT(*) FROM news
UNION ALL
SELECT 'Eventos:', COUNT(*) FROM events
UNION ALL
SELECT 'Projetos:', COUNT(*) FROM projects
UNION ALL
SELECT 'Galeria:', COUNT(*) FROM gallery;
```

**Resultado Esperado:**
- Admins: 1-3 (reais)
- Maricultores: 0 (ou dados reais se houver)
- Newsletter: 0 (ou dados reais)
- Notificações: 0
- Notícias: X (decisão do cliente)
- Eventos: X (decisão do cliente)
- Projetos: X (decisão do cliente)
- Galeria: X (decisão do cliente)

---

## 🎁 Entregar ao Cliente

### **Arquivos:**
- [ ] Código no GitHub (último commit)
- [ ] URL Vercel: https://amesp-rebranding.vercel.app
- [ ] Credenciais de admin
- [ ] Documentação (guias .md)
- [ ] Variáveis de ambiente (lista)

### **Credenciais:**
```
URL Admin: https://amesp-rebranding.vercel.app/login
Email: graziely@gobi.consulting (ou outro admin)
Senha: [senha definida]

Supabase Dashboard: [URL do projeto]
Email de Sistema: noreplyamesp@gmail.com
```

---

## ✅ Sistema Pronto Para Cliente

Após seguir esta checklist:
- ✅ Banco limpo (sem dados de teste)
- ✅ Funcionalidades testadas
- ✅ Documentação completa
- ✅ Configurações de produção OK
- ✅ Pronto para uso real!

---

**Use este checklist antes de entregar!** 📦

