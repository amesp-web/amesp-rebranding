import type React from "react"
import { DevAdminSidebar } from "@/components/admin/dev-admin-sidebar"
import { AdminHeader } from "@/components/admin/admin-header"

// Mock data para desenvolvimento
const mockUser = {
  id: "dev-user-123",
  email: "admin@amesp.com",
  user_metadata: {
    full_name: "Administrador Teste"
  }
}

const mockAdminProfile = {
  id: "dev-user-123",
  full_name: "Administrador Teste",
  role: "admin"
}

export default function DevAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <DevAdminSidebar />
      <div className="lg:pl-64">
        <AdminHeader user={mockUser} adminProfile={mockAdminProfile} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
