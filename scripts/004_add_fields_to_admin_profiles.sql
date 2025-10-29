-- Script para adicionar campos email e phone na tabela admin_profiles
-- Execute este script no Supabase SQL Editor

-- Adicionar coluna email
ALTER TABLE admin_profiles 
ADD COLUMN IF NOT EXISTS email TEXT;

-- Adicionar coluna phone
ALTER TABLE admin_profiles 
ADD COLUMN IF NOT EXISTS phone TEXT;

-- Adicionar coluna email_confirmed_at
ALTER TABLE admin_profiles 
ADD COLUMN IF NOT EXISTS email_confirmed_at TIMESTAMPTZ;

-- Adicionar coluna last_sign_in_at
ALTER TABLE admin_profiles 
ADD COLUMN IF NOT EXISTS last_sign_in_at TIMESTAMPTZ;

-- Comentário: Agora a tabela admin_profiles tem todos os campos necessários
-- e pode ser a fonte única da verdade para a listagem de usuários
