"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Fish, Home, Newspaper, Users, Camera, MapPin, Settings, LogOut, ChevronLeft } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState } from "react"

const navigation = [
  { name: "Dashboard", href: "/admin", icon: Home },
  { name: "Notícias", href: "/admin/news", icon: Newspaper },
  { name: "Produtores", href: "/admin/producers", icon: MapPin },
  { name: "Galeria", href: "/admin/gallery", icon: Camera },
  { name: "Usuários", href: "/admin/users", icon: Users },
  { name: "Configurações", href: "/admin/settings", icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  return (
    <div className={cn("hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:flex-col transition-all duration-300", isCollapsed ? "lg:w-20" : "lg:w-72")}>
      <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gradient-to-b from-blue-50 via-cyan-50/30 to-teal-50 border-r border-blue-200/50 shadow-xl backdrop-blur-sm relative">
        {/* Header com gradiente oceânico */}
        <div className="flex h-20 shrink-0 items-center border-b border-blue-200/50 pb-4 relative">
          <div className={cn("flex items-center", isCollapsed ? "justify-center" : "space-x-3")}>
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-600 via-cyan-500 to-teal-500 flex items-center justify-center shadow-lg shrink-0">
              <Fish className="h-6 w-6 text-white" />
            </div>
            {!isCollapsed && (
              <div>
                <span className="font-sans font-bold text-xl text-slate-800 block">AMESP Admin</span>
                <span className="text-xs text-slate-600 font-medium block">Área Administrativa</span>
              </div>
            )}
          </div>
          
          {/* Botão de Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-3 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-white border-2 border-blue-300 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center hover:scale-110 z-50"
          >
            <ChevronLeft className={cn("h-4 w-4 text-blue-600 transition-transform duration-300", isCollapsed && "rotate-180")} />
          </button>
        </div>
        
        <nav className="flex flex-1 flex-col pt-4">
          <ul role="list" className="flex flex-1 flex-col gap-y-2">
            <li>
              {!isCollapsed && (
                <div className="px-3 py-2 mb-2">
                  <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Navegação</span>
                </div>
              )}
              <ul role="list" className="space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={cn(
                          "group relative flex gap-x-3 rounded-xl text-sm font-semibold transition-all duration-200",
                          isCollapsed ? "justify-center px-2 py-3" : "px-3 py-3",
                          isActive
                            ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/30"
                            : "text-slate-700 hover:text-blue-600 hover:bg-white/60"
                        )}
                        title={isCollapsed ? item.name : undefined}
                      >
                        {isActive && !isCollapsed && (
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl blur-lg"></div>
                        )}
                        <item.icon className={cn(
                          "h-5 w-5 shrink-0 relative z-10",
                          isActive ? "text-white" : "text-slate-500 group-hover:text-cyan-600"
                        )} aria-hidden="true" />
                        {!isCollapsed && <span className="relative z-10">{item.name}</span>}
                        {isActive && !isCollapsed && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-2 w-1 bg-white rounded-full"></div>
                        )}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </li>
            <li className="mt-auto pt-4 border-t border-blue-200/50">
              <Button
                variant="ghost"
                className={cn(
                  "w-full text-slate-700 hover:text-red-600 hover:bg-red-50/50 border border-blue-200/50 hover:border-red-200 rounded-xl transition-all duration-200",
                  isCollapsed ? "justify-center" : "justify-start"
                )}
                onClick={handleSignOut}
                title={isCollapsed ? "Sair" : undefined}
              >
                <LogOut className={cn("h-5 w-5 text-slate-500 group-hover:text-red-600", !isCollapsed && "mr-3")} />
                {!isCollapsed && <span className="font-semibold">Sair</span>}
              </Button>
            </li>
          </ul>
        </nav>
        
        {/* Footer com versão */}
        {!isCollapsed && (
          <div className="pt-4 border-t border-blue-200/50">
            <div className="px-3 py-2 text-xs text-slate-600 text-center">
              v1.0.0 • AMESP
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
