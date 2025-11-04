-- ================================================
-- SCRIPT DE LIMPEZA PRÉ-ENTREGA AO CLIENTE
-- ================================================
-- Execute este script quando o sistema estiver pronto
-- para ser entregue ao cliente, removendo todos os
-- dados de teste.
-- ================================================

-- IMPORTANTE: FAÇA BACKUP ANTES!
-- Supabase Dashboard → Database → Backups → Create Backup

-- ================================================
-- CONFERIR ANTES DE DELETAR
-- ================================================

-- Ver todos os maricultores
SELECT 'MARICULTORES ATUAIS:' as info;
SELECT id, full_name, email, created_at, is_active
FROM maricultor_profiles
ORDER BY created_at DESC;

-- Ver todos os usuários no auth (apenas visualização)
SELECT 'USUÁRIOS NO AUTH (não podemos deletar via SQL, veja instruções abaixo):' as info;
SELECT email, created_at
FROM auth.users
ORDER BY created_at DESC;

-- Ver inscritos newsletter
SELECT 'INSCRITOS NEWSLETTER:' as info;
SELECT name, email, subscribed_at 
FROM newsletter_subscribers
ORDER BY subscribed_at DESC;

-- ================================================
-- EXECUTAR LIMPEZA
-- ================================================

-- Iniciar transação (segurança)
BEGIN;

-- 1. Deletar maricultores de teste
-- AJUSTE OS EMAILS CONFORME NECESSÁRIO!
DELETE FROM maricultor_profiles
WHERE email IN (
  'duetegrazi@gmail.com',
  'graziduete@gmail.com',
  'teste@teste.com',
  'test@test.com'
  -- Adicione outros emails de teste aqui
);

-- 2. Limpar inscritos newsletter de teste
DELETE FROM newsletter_subscribers
WHERE email IN (
  'graziduete@gmail.com',
  'duetegrazi@gmail.com',
  'teste@teste.com'
  -- Adicione outros emails de teste aqui
);

-- 3. Limpar TODAS as notificações (recomendado)
DELETE FROM notifications;

-- 4. Verificar resultado
SELECT 'PÓS-LIMPEZA - Contagem:' as info;
SELECT 'Maricultores:' as tabela, COUNT(*) as total FROM maricultor_profiles
UNION ALL
SELECT 'Newsletter:', COUNT(*) FROM newsletter_subscribers
UNION ALL
SELECT 'Notificações:', COUNT(*) FROM notifications;

-- Se estiver tudo OK, confirme:
COMMIT;

-- Se algo deu errado, cancele:
-- ROLLBACK;

-- ================================================
-- APÓS EXECUTAR O SQL ACIMA
-- ================================================

-- MANUALMENTE no Supabase Dashboard:
-- 
-- 1. Vá em: Authentication → Users
-- 
-- 2. Delete os seguintes usuários de teste:
--    - duetegrazi@gmail.com
--    - graziduete@gmail.com
--    - Qualquer outro email de teste
-- 
-- 3. Como deletar:
--    - Clique nos 3 pontinhos ao lado do email
--    - Clique em "Delete user"
--    - Confirme
--
-- ATENÇÃO: NÃO delete admins reais!
--    Exemplo de admin real: graziely@gobi.consulting
-- ================================================

-- ================================================
-- VERIFICAÇÃO FINAL
-- ================================================

-- Conferir que sobrou apenas dados reais
SELECT 'DADOS FINAIS - Devem ser apenas REAIS:' as info;

SELECT 'Maricultores:' as tipo, full_name, email, created_at 
FROM maricultor_profiles
ORDER BY created_at

UNION ALL

SELECT 'Newsletter:', name, email, subscribed_at::text
FROM newsletter_subscribers
ORDER BY subscribed_at;

-- ================================================
-- PRONTO!
-- Sistema limpo e pronto para o cliente! ✅
-- ================================================

