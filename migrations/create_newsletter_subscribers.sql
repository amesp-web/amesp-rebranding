-- Migration: Criar tabela de inscritos na newsletter
-- Data: 2025-11-04
-- Descrição: Gerenciar inscritos que desejam receber newsletter sobre maricultura

-- Criar tabela newsletter_subscribers
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  phone TEXT,
  company TEXT,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  unsubscribed_at TIMESTAMPTZ,
  source TEXT DEFAULT 'contact_form',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_active ON newsletter_subscribers(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribed_at ON newsletter_subscribers(subscribed_at DESC);

-- Comentários para documentação
COMMENT ON TABLE newsletter_subscribers IS 'Inscritos que desejam receber newsletter sobre maricultura';
COMMENT ON COLUMN newsletter_subscribers.email IS 'Email do inscrito (único)';
COMMENT ON COLUMN newsletter_subscribers.name IS 'Nome do inscrito';
COMMENT ON COLUMN newsletter_subscribers.phone IS 'Telefone do inscrito';
COMMENT ON COLUMN newsletter_subscribers.company IS 'Empresa/Organização do inscrito';
COMMENT ON COLUMN newsletter_subscribers.subscribed_at IS 'Data/hora da inscrição';
COMMENT ON COLUMN newsletter_subscribers.is_active IS 'Se a inscrição está ativa';
COMMENT ON COLUMN newsletter_subscribers.unsubscribed_at IS 'Data/hora que cancelou a inscrição';
COMMENT ON COLUMN newsletter_subscribers.source IS 'Origem da inscrição (contact_form, manual, import)';

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_newsletter_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
DROP TRIGGER IF EXISTS trigger_update_newsletter_updated_at ON newsletter_subscribers;
CREATE TRIGGER trigger_update_newsletter_updated_at
  BEFORE UPDATE ON newsletter_subscribers
  FOR EACH ROW
  EXECUTE FUNCTION update_newsletter_updated_at();

