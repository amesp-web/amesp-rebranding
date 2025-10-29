-- Script simples para verificar dados do usuário Grah Duetes
-- Execute este script no Supabase SQL Editor

SELECT 
  id,
  full_name,
  email,
  last_sign_in_at,
  updated_at,
  is_active,
  created_at
FROM admin_profiles 
WHERE email = 'graziely@gobi.consulting';
