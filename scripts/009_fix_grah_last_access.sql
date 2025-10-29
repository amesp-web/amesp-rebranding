-- Script robusto para corrigir o último acesso do Grah Duetes
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se o usuário existe
SELECT 
  'VERIFICAÇÃO INICIAL' as etapa,
  id,
  full_name,
  email,
  last_sign_in_at,
  is_active
FROM admin_profiles 
WHERE email = 'graziely@gobi.consulting';

-- 2. Atualizar com timestamp específico
UPDATE admin_profiles 
SET 
  last_sign_in_at = NOW(),
  updated_at = NOW()
WHERE email = 'graziely@gobi.consulting';

-- 3. Verificar se foi atualizado
SELECT 
  'APÓS ATUALIZAÇÃO' as etapa,
  id,
  full_name,
  email,
  last_sign_in_at,
  is_active,
  updated_at
FROM admin_profiles 
WHERE email = 'graziely@gobi.consulting';

-- 4. Se ainda não funcionou, tentar com ID específico
-- (substitua pelo ID real do usuário se necessário)
UPDATE admin_profiles 
SET 
  last_sign_in_at = NOW(),
  updated_at = NOW()
WHERE id = '0a80c1ca-b8e2-4986-9f06-47186e79e741';

-- 5. Verificação final
SELECT 
  'VERIFICAÇÃO FINAL' as etapa,
  id,
  full_name,
  email,
  last_sign_in_at,
  is_active,
  updated_at
FROM admin_profiles 
WHERE email = 'graziely@gobi.consulting';
