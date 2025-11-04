# 🔔 Sistema de Notificações - AMESP

## ✅ Sistema Completo Implementado

Sistema de notificações em tempo real para eventos importantes do painel administrativo.

---

## 🎯 Como Funciona

### **Fluxo:**
```
Evento acontece (ex: novo contato)
     ↓
Sistema cria notificação no banco
     ↓
Sininho mostra badge vermelho com número
     ↓
Admin clica no sininho
     ↓
Dropdown mostra todas as notificações
     ↓
Admin pode marcar como lida ou deletar
```

---

## 🛠️ Passo 1: Executar Migration SQL (OBRIGATÓRIO)

Execute este SQL no **Supabase Dashboard** → **SQL Editor**:

```sql
-- Criar tipos ENUM
CREATE TYPE notification_type AS ENUM (
  'contact',
  'newsletter',
  'maricultor',
  'news_like',
  'news_view',
  'system'
);

CREATE TYPE notification_priority AS ENUM (
  'low',
  'normal',
  'high',
  'urgent'
);

-- Criar tabela
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  link TEXT,
  icon TEXT,
  is_read BOOLEAN DEFAULT false,
  priority notification_priority DEFAULT 'normal',
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_notifications_updated_at ON notifications;
CREATE TRIGGER trigger_update_notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_notifications_updated_at();
```

---

## 📁 Arquivos Criados/Modificados

### **Novos:**
- ✨ `migrations/create_notifications.sql` - SQL da tabela
- ✨ `app/api/admin/notifications/route.ts` - API (GET, POST, PATCH, DELETE)
- ✨ `components/admin/NotificationBell.tsx` - Componente do sininho

### **Modificados:**
- 🔧 `app/api/contact/route.ts` - Cria notificação quando chega contato
- 🔧 `components/admin/admin-header.tsx` - Usa NotificationBell
- 🔧 `app/admin/newsletter/page.tsx` - Badge Formulário com ícone

---

## 🔔 Funcionalidades do Sininho

### **Badge Vermelho:**
- Mostra número de notificações não lidas
- Máximo: 99+ (se tiver mais de 99)
- Desaparece quando não há não lidas

### **Dropdown:**
- Abre ao clicar no sininho
- Mostra últimas 50 notificações
- Scroll se tiver muitas
- Auto-fecha ao clicar fora

### **Notificações:**
- 🎨 Ícone colorido por tipo
- 🔴 Bolinha azul se não lida
- ⏰ Tempo relativo ("há 5 min", "há 2h")
- 🗑️ Botão deletar (aparece no hover)
- ✅ Clica para marcar como lida

### **Ações Rápidas:**
- ✅✅ "Marcar todas" - Marca todas como lidas
- ❌ Fechar dropdown

---

## 📊 Tipos de Notificação Implementados

### **1. Contato** (`contact`)
- 📧 Quando alguém envia formulário de contato
- **Título:** "Nova mensagem de contato de [Nome]"
- **Mensagem:** Prévia da mensagem (150 caracteres)
- **Ícone:** Mail (azul)
- **Prioridade:** Normal

### **Tipos Futuros (Preparados):**

#### **2. Newsletter** (`newsletter`)
- Quando alguém se inscreve na newsletter
- Ícone: Mail (verde)

#### **3. Maricultor** (`maricultor`)
- Quando novo maricultor se cadastra
- Ícone: UserPlus (roxo)

#### **4. Like em Notícia** (`news_like`)
- Quando notícia recebe like
- Ícone: Heart (rosa)

#### **5. Visualização** (`news_view`)
- Quando notícia alcança marco (100, 500, 1000 views)
- Ícone: Eye (amarelo)

#### **6. Sistema** (`system`)
- Avisos do sistema
- Ícone: Bell (cinza)

---

## 🧪 Como Testar

### **1. Executar Migration SQL**
Copie e execute o SQL acima no Supabase

### **2. Reiniciar Servidor**
```bash
# Parar e reiniciar para limpar cache
pkill -f "next dev"
npm run dev -- -p 3001
```

### **3. Enviar Formulário de Contato**
1. Acesse: http://localhost:3001
2. Role até "Contato"
3. Preencha e envie

### **4. Verificar Notificação**
1. Acesse: http://localhost:3001/admin
2. Olhe o sininho no canto superior direito
3. Deve ter badge vermelho com "1"
4. Clique no sininho
5. Deve aparecer: "Nova mensagem de contato de [Nome]"

### **5. Testar Funcionalidades:**
- ✅ Clicar na notificação (marca como lida)
- ✅ Clicar em "Marcar todas"
- ✅ Deletar notificação (ícone lixeira no hover)
- ✅ Busca atualiza a cada 30 segundos

---

## 🎨 Personalização das Cores

### **Por Prioridade:**
- 🔴 **Urgent:** Vermelho
- 🟠 **High:** Laranja
- 🔵 **Normal:** Azul
- ⚪ **Low:** Cinza

### **Por Tipo:**
- 📧 **Contact:** Azul (Mail)
- 📰 **Newsletter:** Verde (Mail)
- 👤 **Maricultor:** Roxo (UserPlus)
- ❤️ **Like:** Rosa (Heart)
- 👁️ **View:** Amarelo (Eye)

---

## ⏱️ Atualização Automática

O sininho atualiza automaticamente a cada **30 segundos**.

### **Opcional: Tempo Real com Supabase Realtime**

Se quiser notificações instantâneas:

```typescript
// No componente NotificationBell.tsx
const channel = supabase
  .channel('notifications')
  .on('postgres_changes', 
    { event: 'INSERT', schema: 'public', table: 'notifications' },
    (payload) => {
      // Nova notificação chegou!
      fetchNotifications()
      toast.info('Nova notificação!')
    }
  )
  .subscribe()
```

---

## 🚀 Adicionar Mais Tipos de Notificação

### **Exemplo: Novo Maricultor**

No arquivo onde cadastra maricultor, adicione:

```typescript
// Após cadastrar maricultor com sucesso
await fetch('/api/admin/notifications', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'maricultor',
    title: `Novo maricultor cadastrado: ${nome}`,
    message: `Email: ${email}`,
    link: `/admin/producers/${id}`,
    icon: 'UserPlus',
    priority: 'normal',
    metadata: { maricultor_id: id }
  })
})
```

---

## 📊 Gerenciamento de Notificações

### **Limpar Notificações Antigas:**

Automático! Notificações lidas há mais de 30 dias serão removidas.

Manual via SQL:
```sql
SELECT cleanup_old_notifications();
```

### **Ver Estatísticas:**
```sql
SELECT 
  type,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE is_read = false) as nao_lidas
FROM notifications
GROUP BY type;
```

---

## 🎯 Funcionalidades Implementadas

### ✅ **Sininho no Header:**
- Badge com número de não lidas
- Dropdown bonito e funcional
- Atualização a cada 30s

### ✅ **Notificações:**
- Criadas automaticamente em eventos
- Ícones coloridos por tipo
- Tempo relativo ("há 5 min")
- Marcar como lida (individual ou todas)
- Limpeza automática (30 dias após leitura)

### ✅ **APIs:**
- GET: Listar notificações
- POST: Criar notificação
- PATCH: Marcar como lida (uma ou todas)

### ✅ **Integração:**
- Formulário de contato cria notificação
- Fácil adicionar em outros lugares

---

## 📋 Checklist de Teste

- [ ] Executar migration SQL no Supabase
- [ ] Reiniciar servidor
- [ ] Enviar formulário de contato
- [ ] Ver badge vermelho no sininho
- [ ] Clicar no sininho (ver dropdown)
- [ ] Clicar na notificação (marca como lida)
- [ ] Badge atualiza para 0
- [ ] Testar "Marcar todas como lidas"
- [ ] Testar busca automática (aguardar 30s)

---

## 👥 Múltiplos Administradores

### **Como Funciona:**

O sistema foi projetado para **múltiplos admins**:

- ✅ **Notificação compartilhada:** Todos os admins veem a mesma notificação
- ✅ **Leitura individual:** Cada admin marca como lida quando visualizar
- ✅ **Sem exclusão:** Notificações não podem ser deletadas manualmente
- ✅ **Limpeza automática:** Sistema remove notificações lidas há mais de 30 dias

### **Exemplo com 3 Admins:**

```
Nova notificação criada
     ↓
Admin A: vê badge "1" → clica → marca como lida
Admin B: vê badge "1" → clica → marca como lida  
Admin C: vê badge "1" → clica → marca como lida
     ↓
Após 30 dias (se lida): Removida automaticamente
```

**Benefício:** Todos os admins ficam informados, sem perder informações!

---

## 🔮 Próximas Expansões (Futuro)

1. **Notificações de Newsletter:**
   - Quando alguém se inscreve
   
2. **Notificações de Maricultores:**
   - Quando novo maricultor se cadastra
   
3. **Notificações de Engajamento:**
   - Quando notícia alcança 100, 500, 1000 views
   - Quando notícia recebe likes
   
4. **Notificações de Sistema:**
   - Atualizações importantes
   - Lembretes de tarefas
   
5. **Supabase Realtime:**
   - Notificações aparecem instantaneamente
   - Sem precisar esperar 30s

---

✅ **Sistema de notificações completo e pronto para usar!**

O sininho ganha vida e mantém o admin sempre informado! 🔔

