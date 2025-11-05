"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export function SearchFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(searchParams.get("search") || "")
  const debounceRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    // Limpar timeout anterior
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    // Criar novo timeout para debounce de 500ms
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      
      if (search) {
        params.set("search", search)
      } else {
        params.delete("search")
      }

      // Atualizar URL
      router.push(`/admin/producers?${params.toString()}`)
    }, 500)

    // Cleanup
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [search, router, searchParams])

  return (
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Buscar maricultor, cidade, estado ou empresa..."
        className="pl-10 rounded-xl border-2 border-blue-200/40 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </div>
  )
}

