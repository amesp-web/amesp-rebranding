import type React from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminHeader } from "@/components/admin/admin-header"

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
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      <div className="lg:pl-64">
        <AdminHeader user={data.user} adminProfile={adminProfile} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
