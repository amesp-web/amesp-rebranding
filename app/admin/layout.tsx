import type React from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminHeader } from "@/components/admin/admin-header"
import { SidebarProvider } from "@/contexts/sidebar-context"
import { AdminMainContent } from "@/components/admin/admin-main-content"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  // Carregar dados do usuário e perfil em paralelo para melhor performance
  const [userResult, adminProfileResult] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("admin_profiles").select("*").limit(1) // Cache query
  ])
  
  const { data: userData, error: userError } = userResult
  const { data: adminData, error: adminError } = adminProfileResult
  
  // Em desenvolvimento, se não há usuário, redireciona para login de desenvolvimento
  if (userError || !userData?.user) {
    redirect("/login/dev")
  }

  // Buscar perfil específico do usuário logado
  const { data: adminProfile } = await supabase
    .from("admin_profiles")
    .select("id, full_name, email, phone, role, is_active, email_confirmed_at, last_sign_in_at, created_at, updated_at")
    .eq("id", userData.user.id)
    .single()

  if (!adminProfile) {
    redirect("/login/dev")
  }

  // Debug: verificar o valor de is_active
  console.log('🔍 Debug adminProfile:', {
    id: adminProfile.id,
    email: adminProfile.email,
    is_active: adminProfile.is_active,
    type: typeof adminProfile.is_active
  })

  // Verificar se o usuário está ativo (apenas se explicitamente false)
  if (adminProfile.is_active === false) {
    console.log('🚫 Usuário inativo tentando acessar:', adminProfile.email)
    redirect("/login?error=account_inactive")
  }

  return (
    <SidebarProvider>
      <AdminLayoutWrapper user={userData.user} adminProfile={adminProfile}>
        {children}
      </AdminLayoutWrapper>
    </SidebarProvider>
  )
}

function AdminLayoutWrapper({ 
  children, 
  user, 
  adminProfile 
}: { 
  children: React.ReactNode
  user: any
  adminProfile: any
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />
      <AdminMainContent user={user} adminProfile={adminProfile}>
        {children}
      </AdminMainContent>
    </div>
  )
}

