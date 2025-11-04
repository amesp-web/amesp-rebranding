-- ============================================
-- SCRIPT SIMPLES: DELETAR MARICULTOR
-- ============================================
-- Deleta o maricultor Lucas e seu usuário auth
-- Evita criar "fantasmas"
-- ============================================

BEGIN;

-- 🔍 VER DADOS DO MARICULTOR
SELECT '🔍 MARICULTOR:' as info;
SELECT * FROM maricultor_profiles
WHERE id = '8b3a4766-1670-4716-8923-7aa439a1f46c';

-- 🔍 VER USUÁRIO NO AUTH
SELECT '🔍 USUÁRIO AUTH:' as info;
SELECT id, email, role, created_at FROM auth.users
WHERE id = '8b3a4766-1670-4716-8923-7aa439a1f46c';

-- 🔍 VER NOTIFICAÇÕES
SELECT '🔍 NOTIFICAÇÕES:' as info;
SELECT id, type, title, created_at FROM notifications
WHERE metadata->>'maricultor_id' = '8b3a4766-1670-4716-8923-7aa439a1f46c';

-- ⏸️ REVISE OS DADOS ACIMA!
-- Tem certeza? Continue executando...

-- 🗑️ DELETAR NOTIFICAÇÕES
DELETE FROM notifications
WHERE metadata->>'maricultor_id' = '8b3a4766-1670-4716-8923-7aa439a1f46c';

-- 🗑️ DELETAR MARICULTOR
DELETE FROM maricultor_profiles
WHERE id = '8b3a4766-1670-4716-8923-7aa439a1f46c';

-- 🗑️ DELETAR USUÁRIO AUTH
DELETE FROM auth.users
WHERE id = '8b3a4766-1670-4716-8923-7aa439a1f46c';

-- ✅ VERIFICAR
SELECT '✅ VERIFICAÇÃO:' as info;
SELECT 
    CASE WHEN COUNT(*) = 0 THEN '✅ Deletado!' 
         ELSE '❌ Ainda existe!' 
    END as maricultor
FROM maricultor_profiles
WHERE id = '8b3a4766-1670-4716-8923-7aa439a1f46c';

SELECT 
    CASE WHEN COUNT(*) = 0 THEN '✅ Deletado!' 
         ELSE '❌ Ainda existe!' 
    END as auth
FROM auth.users
WHERE id = '8b3a4766-1670-4716-8923-7aa439a1f46c';

-- 👉 Agora execute:
-- COMMIT;   -- para CONFIRMAR
-- ROLLBACK; -- para CANCELAR
