"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export function MaricultorToggle({ id, initialActive, onChanged }: { id: string; initialActive: boolean; onChanged?: (active: boolean) => void }) {
  const [active, setActive] = useState<boolean>(initialActive)
  const [loading, setLoading] = useState(false)

  const toggle = async () => {
    try {
      setLoading(true)
      const next = !active
      setActive(next)

      const res = await fetch('/api/admin/maricultor/toggle-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_active: next }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Falha ao atualizar status')
      }
      onChanged?.(next)
    } catch (e) {
      // rollback on failure
      setActive((v) => !v)
      console.error(e)
      alert('Erro ao atualizar status do maricultor')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant={active ? 'destructive' : 'outline'}
      size="sm"
      onClick={toggle}
      disabled={loading}
      className={`rounded-full px-4 shadow-sm ${
        active
          ? ''
          : 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200/60'
      }`}
    >
      {active ? 'Inativar' : 'Ativar'}
    </Button>
  )
}


