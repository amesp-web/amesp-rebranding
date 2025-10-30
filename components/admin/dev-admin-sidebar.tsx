"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Fish, Home, Newspaper, Users, Camera, MapPin, Settings, LogOut, Info, Leaf, Download } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useRouter } from "next/navigation"

const navigation = [
  { name: "Dashboard", href: "/admin/dev", icon: Home },
  { name: "Notícias", href: "/admin/news", icon: Newspaper },
  { name: "Produtores", href: "/admin/producers", icon: MapPin },
  { name: "Galeria", href: "/admin/gallery", icon: Camera },
  { name: "Usuários", href: "/admin/users", icon: Users },
  { name: "Quem Somos", href: "/admin/about", icon: Info },
  { name: "Projetos Socioambientais", href: "/admin/projects", icon: Leaf },
  { name: "Gerenciar Download", href: "/admin/downloads", icon: Download },
  { name: "Configurações", href: "/admin/settings", icon: Settings },
]

export function DevAdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = () => {
    // Simulação de logout para desenvolvimento
    router.push("/login/dev")
  }

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r bg-card px-6 pb-4">
        <div className="flex h-16 shrink-0 items-center">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
              <Fish className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-sans font-bold text-xl text-primary">AMESP Admin</span>
          </div>
        </div>
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {navigation.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        pathname === item.href
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted",
                        "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors",
                      )}
                    >
                      <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
            <li className="mt-auto">
              <Button
                variant="ghost"
                className="w-full justify-start text-muted-foreground hover:text-foreground"
                onClick={handleSignOut}
              >
                <LogOut className="mr-3 h-5 w-5" />
                Sair
              </Button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  )
}

