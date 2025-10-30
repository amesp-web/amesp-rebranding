"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { MaricultorToggle } from "@/components/admin/maricultor-toggle"

export function MaricultorStatusActions({ id, initialActive }: { id: string; initialActive: boolean }) {
  const [active, setActive] = useState<boolean>(initialActive)
  return (
    <div className="flex items-center gap-3">
      <Badge
        variant={active ? "secondary" : "secondary"}
        className={active ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-red-100 text-red-700 border-red-200"}
      >
        {active ? "Ativo" : "Inativo"}
      </Badge>
      <MaricultorToggle id={id} initialActive={active} onChanged={setActive} />
    </div>
  )
}


