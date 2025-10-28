"use client"

import { useState } from "react"
import { AdminSidebar } from "./admin-sidebar"
import { AdminHeader } from "./admin-header"

interface AdminLayoutProps {
  children: React.ReactNode
  user: any
  adminProfile: any
}

export function AdminLayout({ children, user, adminProfile }: AdminLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className={cn(
        "transition-all duration-300 ease-in-out",
        isCollapsed ? "lg:pl-16" : "lg:pl-64"
      )}>
        <AdminHeader user={user} adminProfile={adminProfile} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}

function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}
