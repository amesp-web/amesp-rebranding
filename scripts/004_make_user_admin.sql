-- Script para tornar um usuário admin
-- IMPORTANTE: Criar o usuário primeiro no Authentication do Supabase
-- Depois modificar o email abaixo para o email do usuário que você criou

INSERT INTO public.admin_profiles (id, full_name, role) 
VALUES (
  (SELECT id FROM auth.users WHERE email = 'admin@amesp.com'),
  'Administrador',
  'admin'
);

-- Verificar se foi criado corretamente
SELECT * FROM public.admin_profiles WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@amesp.com');
