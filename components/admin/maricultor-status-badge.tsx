"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"

export function MaricultorStatusBadge({ id, initialActive }: { id: string; initialActive: boolean }) {
  const [active, setActive] = useState<boolean>(initialActive)

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { id: string; is_active: boolean }
      if (detail?.id === id) setActive(!!detail.is_active)
    }
    window.addEventListener('maricultor-status-updated', handler as EventListener)
    return () => window.removeEventListener('maricultor-status-updated', handler as EventListener)
  }, [id])

  return (
    <Badge
      variant="secondary"
      className={active ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-red-100 text-red-700 border-red-200"}
    >
      {active ? "Ativo" : "Inativo"}
    </Badge>
  )
}


