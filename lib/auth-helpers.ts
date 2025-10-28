// lib/auth-helpers.ts
import { createClient } from "@/lib/supabase/client"

export async function checkTemporaryPassword(email: string, password: string): Promise<boolean> {
  const supabase = createClient()
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) return false
    
    // Verificar se é senha temporária (lógica simples: senhas temporárias são sempre 8 caracteres maiúsculos)
    const isTemporary = password.length === 8 && password === password.toUpperCase() && /^[A-Z0-9]+$/.test(password)
    
    return isTemporary
  } catch {
    return false
  }
}

export async function updateUserPassword(newPassword: string): Promise<boolean> {
  const supabase = createClient()
  
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })
    
    return !error
  } catch {
    return false
  }
}
