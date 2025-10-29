-- Script para adicionar campo is_active na tabela admin_profiles
-- Execute este script no Supabase SQL Editor

-- Adicionar coluna is_active
ALTER TABLE admin_profiles 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Atualizar registros existentes baseado no email_confirmed_at
UPDATE admin_profiles 
SET is_active = CASE 
  WHEN email_confirmed_at IS NOT NULL THEN true
  ELSE false
END;

-- Verificar resultados
SELECT id, full_name, email, is_active, email_confirmed_at, last_sign_in_at 
FROM admin_profiles 
ORDER BY created_at DESC;
