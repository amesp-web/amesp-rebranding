-- ================================================
-- SCRIPT DE LIMPEZA DE DADOS DE TESTE - AMESP
-- ================================================
-- ATENÇÃO: Este script remove TODOS os dados de teste
-- Execute APENAS antes de entregar o sistema ao cliente
-- ================================================

-- ================================================
-- BACKUP RECOMENDADO!
-- Faça backup do banco antes de executar:
-- No Supabase Dashboard → Database → Backups
-- ================================================

BEGIN;

-- ================================================
-- 1. REMOVER MARICULTORES DE TESTE
-- ================================================

-- Listar maricultores que serão removidos (para conferir)
SELECT 'Maricultores que serão removidos:' as info;
SELECT id, full_name, email, created_at 
FROM maricultor_profiles
ORDER BY created_at;

-- Deletar perfis de maricultores
-- NOTA: Ajuste a condição WHERE se quiser manter alguns
DELETE FROM maricultor_profiles
WHERE created_at >= '2024-01-01'; -- Remove todos criados após 01/01/2024

-- Deletar usuários do Supabase Auth que são maricultores
-- IMPORTANTE: Precisa ser feito via Dashboard ou API
SELECT 'ATENÇÃO: Usuários em auth.users devem ser removidos manualmente no Supabase Dashboard → Authentication → Users' as warning;
SELECT 'Procure por emails de teste e delete via interface' as instruction;

-- ================================================
-- 2. LIMPAR NOTIFICAÇÕES DE TESTE
-- ================================================

SELECT 'Notificações que serão removidas:' as info;
SELECT COUNT(*) as total FROM notifications;

DELETE FROM notifications;

-- ================================================
-- 3. LIMPAR INSCRITOS NA NEWSLETTER DE TESTE
-- ================================================

SELECT 'Inscritos newsletter que serão removidos:' as info;
SELECT COUNT(*) as total FROM newsletter_subscribers;

DELETE FROM newsletter_subscribers
WHERE created_at >= '2024-01-01'; -- Remove todos de teste

-- ================================================
-- 4. LIMPAR OUTRAS TABELAS (OPCIONAL)
-- ================================================

-- Comentado por segurança - descomente apenas se necessário

-- Remover notícias de teste
-- DELETE FROM news WHERE title LIKE '%Teste%' OR title LIKE '%teste%';

-- Remover eventos de teste
-- DELETE FROM events WHERE title LIKE '%Teste%' OR title LIKE '%teste%';

-- Remover projetos de teste
-- DELETE FROM projects WHERE name LIKE '%Teste%' OR name LIKE '%teste%';

-- Remover galeria de teste
-- DELETE FROM gallery WHERE title LIKE '%Teste%' OR title LIKE '%teste%';

-- ================================================
-- 5. RESETAR SEQUENCES/COUNTERS (se necessário)
-- ================================================

-- Não aplicável para UUID, apenas para SERIAL/INTEGER ids

-- ================================================
-- 6. VERIFICAR LIMPEZA
-- ================================================

SELECT 'Verificação Pós-Limpeza:' as info;

SELECT 'Maricultores restantes:' as tabela, COUNT(*) as total FROM maricultor_profiles
UNION ALL
SELECT 'Notificações restantes:', COUNT(*) FROM notifications
UNION ALL
SELECT 'Newsletter restantes:', COUNT(*) FROM newsletter_subscribers
UNION ALL
SELECT 'Notícias:', COUNT(*) FROM news
UNION ALL
SELECT 'Eventos:', COUNT(*) FROM events
UNION ALL
SELECT 'Projetos:', COUNT(*) FROM projects
UNION ALL
SELECT 'Galeria:', COUNT(*) FROM gallery;

-- ================================================
-- COMMIT OU ROLLBACK
-- ================================================

-- Se tudo estiver OK, execute:
COMMIT;

-- Se algo deu errado, execute:
-- ROLLBACK;

-- ================================================
-- PÓS-LIMPEZA: REMOVER USUÁRIOS DO AUTH
-- ================================================

SELECT '
IMPORTANTE: Após executar este script, vá em:
Supabase Dashboard → Authentication → Users

E delete MANUALMENTE os usuários de teste:
- Procure por emails que terminam em @teste.com, @test.com, etc
- Procure por nomes como "Teste", "Test", etc
- Delete cada um clicando nos 3 pontinhos → Delete user

ATENÇÃO: NÃO delete admins reais!
' as instrucoes_finais;

