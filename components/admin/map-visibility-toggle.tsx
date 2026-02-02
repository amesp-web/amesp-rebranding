"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { MapPin } from "lucide-react"

export function MapVisibilityToggle({
  id,
  initialShowOnMap,
  onChanged,
}: {
  id: string
  initialShowOnMap: boolean
  onChanged?: (showOnMap: boolean) => void
}) {
  const [showOnMap, setShowOnMap] = useState<boolean>(initialShowOnMap)
  const [loading, setLoading] = useState(false)

  const toggle = async () => {
    try {
      setLoading(true)
      const next = !showOnMap
      setShowOnMap(next)

      const res = await fetch("/api/admin/maricultor/toggle-map-visibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, show_on_map: next }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || "Falha ao atualizar visibilidade no mapa")
      }
      onChanged?.(next)
      try {
        window.dispatchEvent(
          new CustomEvent("maricultor-map-visibility-updated", { detail: { id, show_on_map: next } })
        )
      } catch {}
    } catch (e) {
      setShowOnMap((v) => !v)
      console.error(e)
      alert("Erro ao atualizar visibilidade no mapa")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggle}
      disabled={loading}
      title={showOnMap ? "Ocultar no mapa" : "Mostrar no mapa"}
      className={`rounded-full px-4 shadow-sm flex items-center gap-1.5 ${
        showOnMap
          ? "bg-sky-100 text-sky-700 border-sky-200 hover:bg-sky-200/60"
          : "text-muted-foreground hover:bg-slate-100"
      }`}
    >
      <MapPin className="h-3.5 w-3.5" />
      {showOnMap ? "No mapa" : "Oculto"}
    </Button>
  )
}
