-- Script para testar o sistema localmente
-- Execute este script no Supabase quando receber as credenciais

-- 1. Criar um usuário administrador de teste
-- (Execute no Supabase Auth > Users > Invite User)
-- Email: admin@amesp.com
-- Senha: admin123

-- 2. Após criar o usuário, execute este SQL para torná-lo admin:
INSERT INTO public.admin_profiles (id, full_name, role) 
VALUES (
  (SELECT id FROM auth.users WHERE email = 'admin@amesp.com'),
  'Administrador Teste',
  'admin'
);

-- 3. Criar um usuário maricultor de teste
-- (Execute no Supabase Auth > Users > Invite User)
-- Email: maricultor@teste.com
-- Senha: maricultor123

-- 4. Dados de exemplo para testar
INSERT INTO public.news (title, excerpt, content, image_url, category, read_time, views, published) VALUES
(
  'Teste - Nova Técnica de Cultivo',
  'Esta é uma notícia de teste para verificar o sistema.',
  'Conteúdo completo da notícia de teste. Esta notícia foi criada para testar o sistema de administração da AMESP.',
  '/sustainable-aquaculture-farm-with-workers-in-boats.jpg',
  'Teste',
  3,
  100,
  true
);

INSERT INTO public.producers (name, description, location, latitude, longitude, contact_email, contact_phone, specialties, certification_level, active) VALUES
(
  'Produtor Teste',
  'Produtor de teste para verificar o sistema',
  'Ubatuba - SP',
  -23.4336,
  -45.0838,
  'teste@produtor.com',
  '(12) 99999-9999',
  ARRAY['Teste', 'Sistema'],
  'Teste',
  true
);

INSERT INTO public.gallery (title, description, image_url, category, featured, display_order) VALUES
(
  'Imagem de Teste',
  'Imagem de teste para verificar o sistema',
  '/sustainable-aquaculture-farm-with-workers-in-boats.jpg',
  'Teste',
  true,
  1
);

