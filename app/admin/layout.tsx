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

  const { data, error } = await supabase.auth.getUser()
  
  // Em desenvolvimento, se não há usuário, redireciona para login de desenvolvimento
  if (error || !data?.user) {
    redirect("/login/dev")
  }

  // Check if user is admin
  const { data: adminProfile } = await supabase.from("admin_profiles").select("*").eq("id", data.user.id).single()

  if (!adminProfile) {
    redirect("/login/dev")
  }

  return (
    <SidebarProvider>
      <AdminLayoutWrapper user={data.user} adminProfile={adminProfile}>
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

