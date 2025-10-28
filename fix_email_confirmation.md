# Como Confirmar Email no Supabase

## Opção 1: Atualizar usuário existente

No Supabase Dashboard:
1. Authentication → Users
2. Encontre `admin@amesp.com`
3. Clique no usuário
4. Na aba "Metadata" ou "User Settings"
5. Marque "Email Confirmed" ou clique em "Confirm Email"

## Opção 2: Recriar usuário já confirmado

1. Authentication → Users
2. Delete o usuário atual `admin@amesp.com`
3. Add user
4. Preencha:
   - Email: `admin@amesp.com`
   - Password: defina uma senha
   - Marque "Auto Confirm User" ✅
5. Create user
6. Execute o SQL para tornar admin novamente
