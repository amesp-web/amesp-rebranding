-- Migration: Criar tabela de notificações administrativas
-- Data: 2025-11-04
-- Descrição: Sistema de notificações para eventos importantes do sistema

-- Criar tipo ENUM para tipos de notificação
CREATE TYPE notification_type AS ENUM (
  'contact',
  'newsletter',
  'maricultor',
  'news_like',
  'news_view',
  'system'
);

-- Criar tipo ENUM para prioridade
CREATE TYPE notification_priority AS ENUM (
  'low',
  'normal',
  'high',
  'urgent'
);

-- Criar tabela de notificações
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

-- Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON notifications(priority);

-- Comentários para documentação
COMMENT ON TABLE notifications IS 'Notificações administrativas do sistema';
COMMENT ON COLUMN notifications.type IS 'Tipo de notificação';
COMMENT ON COLUMN notifications.title IS 'Título da notificação';
COMMENT ON COLUMN notifications.message IS 'Mensagem detalhada';
COMMENT ON COLUMN notifications.link IS 'Link para ação relacionada';
COMMENT ON COLUMN notifications.icon IS 'Nome do ícone lucide';
COMMENT ON COLUMN notifications.is_read IS 'Se a notificação foi lida';
COMMENT ON COLUMN notifications.priority IS 'Prioridade da notificação';
COMMENT ON COLUMN notifications.metadata IS 'Dados adicionais em JSON';

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
DROP TRIGGER IF EXISTS trigger_update_notifications_updated_at ON notifications;
CREATE TRIGGER trigger_update_notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_notifications_updated_at();

-- Função para limpar notificações antigas (mais de 30 dias lidas)
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS void AS $$
BEGIN
  DELETE FROM notifications
  WHERE is_read = true
  AND read_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Comentário da função
COMMENT ON FUNCTION cleanup_old_notifications IS 'Remove notificações lidas há mais de 30 dias';

