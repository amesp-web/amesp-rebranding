-- Script para verificar e corrigir o último acesso do usuário Grah Duetes
-- Execute este script completo no Supabase SQL Editor

-- 1. Verificar o estado atual ANTES da atualização
SELECT 
  'ANTES' as status,
  id, 
  full_name, 
  email, 
  last_sign_in_at, 
  updated_at,
  is_active
FROM admin_profiles 
WHERE email = 'graziely@gobi.consulting';

-- 2. Atualizar o último acesso manualmente
UPDATE admin_profiles 
SET 
  last_sign_in_at = NOW(),
  updated_at = NOW()
WHERE email = 'graziely@gobi.consulting';

-- 3. Verificar o estado APÓS a atualização
SELECT 
  'DEPOIS' as status,
  id, 
  full_name, 
  email, 
  last_sign_in_at, 
  updated_at,
  is_active
FROM admin_profiles 
WHERE email = 'graziely@gobi.consulting';

-- 4. Mostrar todos os usuários para comparação
SELECT 
  'TODOS' as status,
  id, 
  full_name, 
  email, 
  last_sign_in_at, 
  updated_at,
  is_active
FROM admin_profiles 
ORDER BY created_at DESC;
