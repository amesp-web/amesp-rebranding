"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Bell, BellOff } from "lucide-react"
import { toast } from "sonner"
import {
  isPushSupported,
  hasVapidKey,
  subscribeToPush,
  unsubscribeFromPush,
  isSubscribed,
} from "@/lib/push-client"

export function PushNotificationsToggle() {
  const [supported, setSupported] = useState(false)
  const [enabled, setEnabled] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isPushSupported()) return
    isSubscribed().then(setEnabled)
    setSupported(true)
  }, [])

  if (!supported || !hasVapidKey()) {
    return null
  }

  const handleToggle = async () => {
    try {
      setLoading(true)
      if (!enabled) {
        const ok = await subscribeToPush()
        if (ok) {
          setEnabled(true)
          toast.success("Notificações ativadas para notícias, eventos e mensalidades.")
        } else {
          toast.error("Você precisa permitir notificações no navegador.")
        }
      } else {
        await unsubscribeFromPush()
        setEnabled(false)
        toast.success("Notificações desativadas.")
      }
    } catch (e) {
      console.error(e)
      toast.error("Não foi possível atualizar as notificações. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="border-primary/40 bg-primary/5 hover:bg-primary/10 text-primary-foreground/90"
      onClick={handleToggle}
      disabled={loading}
    >
      {enabled ? <BellOff className="h-4 w-4 mr-2" /> : <Bell className="h-4 w-4 mr-2" />}
      {enabled ? "Desativar notificações" : "Ativar notificações"}
    </Button>
  )
}
