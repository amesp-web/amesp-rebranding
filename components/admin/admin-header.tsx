"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Bell, Menu } from "lucide-react"
import { useState } from "react"

interface AdminHeaderProps {
  user: any
  adminProfile: any
}

export function AdminHeader({ user, adminProfile }: AdminHeaderProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b bg-background px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
        <Menu className="h-5 w-5" />
      </Button>

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="flex flex-1"></div>
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <Button variant="ghost" size="sm">
            <Bell className="h-5 w-5" />
          </Button>

          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-border" aria-hidden="true" />

          <div className="flex items-center gap-x-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback>{adminProfile?.full_name?.charAt(0) || user.email?.charAt(0) || "A"}</AvatarFallback>
            </Avatar>
            <div className="hidden lg:block">
              <p className="text-sm font-medium">{adminProfile?.full_name || "Admin"}</p>
              <p className="text-xs text-muted-foreground">{adminProfile?.role || "Administrador"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
