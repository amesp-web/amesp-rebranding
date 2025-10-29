-- Script final para garantir que o banco está correto
-- Execute este script no Supabase SQL Editor

-- 1. Verificar todos os usuários
SELECT 
  'TODOS OS USUÁRIOS' as info,
  id,
  full_name,
  email,
  last_sign_in_at,
  is_active,
  updated_at
FROM admin_profiles 
ORDER BY created_at DESC;

-- 2. Atualizar especificamente o Grah Duetes com timestamp atual
UPDATE admin_profiles 
SET 
  last_sign_in_at = NOW(),
  updated_at = NOW()
WHERE email = 'graziely@gobi.consulting'
RETURNING id, full_name, email, last_sign_in_at, is_active, updated_at;

-- 3. Verificação final
SELECT 
  'VERIFICAÇÃO FINAL' as info,
  id,
  full_name,
  email,
  last_sign_in_at,
  is_active,
  updated_at
FROM admin_profiles 
WHERE email = 'graziely@gobi.consulting';
