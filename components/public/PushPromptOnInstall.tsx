"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Bell } from "lucide-react"
import { toast } from "sonner"
import { isPushSupported, hasVapidKey, subscribeToPush, isSubscribed } from "@/lib/push-client"

const STORAGE_KEY_DISMISSED = "amesp_push_prompt_dismissed_until"
const STORAGE_KEY_ACCEPTED = "amesp_push_prompt_accepted"
const DISMISS_DAYS = 7

function isStandalone(): boolean {
  if (typeof window === "undefined") return false
  const nav = navigator as { standalone?: boolean }
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    nav.standalone === true
  )
}

function isMobile(): boolean {
  if (typeof navigator === "undefined") return false
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
}

/** No browser (não standalone): só mostra se permissão ainda não foi dada e não está no período de "Agora não". */
function shouldShowPromptInBrowser(): boolean {
  if (typeof window === "undefined") return false
  if (Notification.permission !== "default") return false
  if (localStorage.getItem(STORAGE_KEY_ACCEPTED) === "1") return false
  const dismissed = localStorage.getItem(STORAGE_KEY_DISMISSED)
  if (dismissed) {
    const until = parseInt(dismissed, 10)
    if (Date.now() < until) return false
  }
  return true
}

export function PushPromptOnInstall() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!hasVapidKey() || !isPushSupported()) return
    const standalone = isStandalone()
    const mobile = isMobile()
    if (!standalone && !mobile) return

    if (standalone) {
      // PWA aberto pelo ícone (Android ou iPhone): sempre mostrar o popup até o usuário estar inscrito
      const showIfNotSubscribed = async () => {
        await new Promise((r) => setTimeout(r, 1500)) // dá tempo do SW estar pronto
        const subscribed = await isSubscribed()
        if (!subscribed) setOpen(true)
      }
      showIfNotSubscribed()
      return
    }

    if (!shouldShowPromptInBrowser()) return
    const t = setTimeout(() => setOpen(true), 1200)
    return () => clearTimeout(t)
  }, [])

  const handleAllow = async () => {
    setLoading(true)
    try {
      const ok = await subscribeToPush()
      if (ok) {
        localStorage.setItem(STORAGE_KEY_ACCEPTED, "1")
        setOpen(false)
        toast.success("Notificações ativadas. Você receberá novidades, eventos e lembretes.")
      } else {
        const denied = typeof Notification !== "undefined" && Notification.permission === "denied"
        if (denied) {
          toast.error("Notificações estão bloqueadas. Toque no ícone de cadeado na barra de endereço → Permissões → Notificações → Permitir.")
        } else {
          toast.error("Não foi possível ativar. Verifique as permissões do navegador.")
        }
      }
    } catch (e) {
      console.error(e)
      toast.error("Erro ao ativar notificações. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  const handleLater = () => {
    const until = Date.now() + DISMISS_DAYS * 24 * 60 * 60 * 1000
    localStorage.setItem(STORAGE_KEY_DISMISSED, String(until))
    setOpen(false)
  }

  const canAsk =
    typeof window !== "undefined" &&
    isPushSupported() &&
    hasVapidKey() &&
    localStorage.getItem(STORAGE_KEY_ACCEPTED) !== "1" &&
    isMobile() &&
    (isStandalone() || Notification.permission === "default")

  return (
    <>
      {canAsk && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-center gap-2 py-2.5 px-4 bg-primary text-primary-foreground text-sm font-medium shadow-md safe-area-inset-top"
        >
          <Bell className="h-4 w-4 shrink-0" />
          Receba notificações — toque para ativar
        </button>
      )}
    <Dialog open={open} onOpenChange={(v) => !loading && setOpen(v)}>
      <DialogContent className="max-w-sm mx-4 text-center sm:rounded-2xl">
        <DialogHeader>
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 mb-2">
            <Bell className="h-7 w-7 text-primary" />
          </div>
          <DialogTitle className="text-xl">
            Receba notificações
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground leading-relaxed py-2">
          Ative para receber avisos de <strong>novas notícias</strong>, <strong>eventos</strong> e
          <strong> lembretes de mensalidade</strong>.
        </p>
        <DialogFooter className="flex flex-col gap-2 sm:flex-col sm:gap-2">
          <Button
            onClick={handleAllow}
            disabled={loading}
            className="w-full h-12 text-base font-semibold"
          >
            {loading ? "Ativando…" : "Permitir notificações"}
          </Button>
          <Button
            variant="ghost"
            onClick={handleLater}
            disabled={loading}
            className="w-full"
          >
            Agora não
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  )
}
