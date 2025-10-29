-- Script para atualizar dados existentes na tabela admin_profiles
-- Execute este script no Supabase SQL Editor

-- ATUALIZAR dados existentes buscando do auth.users
UPDATE admin_profiles ap
SET 
  email = COALESCE(au.email, ''),
  phone = COALESCE((au.raw_user_meta_data->>'phone')::text, ''),
  email_confirmed_at = au.email_confirmed_at,
  last_sign_in_at = au.last_sign_in_at
FROM auth.users au
WHERE ap.id = au.id;

-- Verificar resultados
SELECT id, full_name, email, phone, role, email_confirmed_at, last_sign_in_at 
FROM admin_profiles 
ORDER BY created_at DESC;
