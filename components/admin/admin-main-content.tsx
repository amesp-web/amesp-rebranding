"use client"

import { useSidebar } from "@/contexts/sidebar-context"
import { AdminHeader } from "@/components/admin/admin-header"

interface AdminMainContentProps {
  children: React.ReactNode
  user: any
  adminProfile: any
}

export function AdminMainContent({ children, user, adminProfile }: AdminMainContentProps) {
  const { isCollapsed } = useSidebar()
  
  return (
    <div className={cn(
      "transition-all duration-300 ease-in-out",
      isCollapsed ? "lg:pl-16" : "lg:pl-64"
    )}>
      <AdminHeader user={user} adminProfile={adminProfile} />
      <main className="p-6">{children}</main>
    </div>
  )
}

function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}
