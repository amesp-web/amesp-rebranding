"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Menu, LogOut, ChevronDown } from "lucide-react"
import { useState, useEffect } from "react"
import { NotificationBell } from "@/components/admin/NotificationBell"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"

interface AdminHeaderProps {
  user: any
  adminProfile: any
}

export function AdminHeader({ user, adminProfile }: AdminHeaderProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Simular loading inicial mais rápido
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 100) // Reduzido de 5s para 100ms
    
    return () => clearTimeout(timer)
  }, [])

  const handleLogout = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/login')
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  // Dados otimizados com fallbacks inteligentes
  const displayName = adminProfile?.full_name || user?.email?.split('@')[0] || "Administrador"
  const userRole = adminProfile?.role || "admin"
  const userInitial = displayName?.charAt(0)?.toUpperCase() || "A"

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md shadow-sm">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Left side - Mobile menu button */}
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            className="lg:hidden hover:bg-blue-50" 
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="h-5 w-5 text-gray-600" />
          </Button>
        </div>

        {/* Right side - Actions and user menu */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <NotificationBell />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="flex items-center space-x-3 hover:bg-blue-50 rounded-lg px-3 py-2"
              >
                <Avatar className="h-8 w-8 ring-2 ring-blue-100">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white font-semibold">
                    {userInitial}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden lg:block text-left">
                  {isLoading ? (
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  ) : (
                    <>
                      <p className="text-sm font-semibold text-gray-900">
                        {displayName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {userRole}
                      </p>
                    </>
                  )}
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="end" className="w-72 p-2">
              {/* Header do Usuário Modernizado */}
              <div className="px-3 py-4 mb-2 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center ring-2 ring-blue-200 ring-offset-2 shadow-md">
                    <span className="text-lg font-bold text-white">
                      {isLoading ? '...' : userInitial}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">
                      {isLoading ? <Skeleton className="h-4 w-32" /> : displayName}
                    </p>
                    <p className="text-xs text-slate-600 truncate mt-0.5">
                      {user?.email || ''}
                    </p>
                    <Badge variant="secondary" className="mt-1.5 text-xs bg-blue-100 text-blue-700 border-blue-200">
                      {userRole === 'admin' ? 'Administrador' : userRole}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <DropdownMenuSeparator className="my-2 bg-slate-200" />
              
              {/* Sair */}
              <DropdownMenuItem 
                className="cursor-pointer rounded-lg px-3 py-3 hover:bg-red-50 transition-all group" 
                onClick={handleLogout}
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-red-50 to-red-100/50 group-hover:from-red-100 group-hover:to-red-200 flex items-center justify-center transition-all shadow-sm">
                    <LogOut className="h-4 w-4 text-red-600 group-hover:text-red-700 transition-colors" />
                  </div>
                  <span className="text-sm font-semibold text-red-600 group-hover:text-red-700 transition-colors">Sair</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
