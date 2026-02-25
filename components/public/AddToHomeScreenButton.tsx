"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Download, Smartphone, Copy } from "lucide-react"
import { toast } from "sonner"

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<{ outcome: "accepted" | "dismissed" }>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

type AddToHomeScreenButtonProps = {
  variant?: "link" | "button"
  className?: string
  onAfterClick?: () => void
}

const LABEL = "Instalar o app"

export function AddToHomeScreenButton({
  variant = "link",
  className = "",
  onAfterClick,
}: AddToHomeScreenButtonProps) {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [canShare, setCanShare] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [chromeOnIos, setChromeOnIos] = useState(false)
  const [android, setAndroid] = useState(false)
  const [showIosDialog, setShowIosDialog] = useState(false)
  const [showAndroidDialog, setShowAndroidDialog] = useState(false)
  const [showManualDialog, setShowManualDialog] = useState(false)
  const [addressCopied, setAddressCopied] = useState(false)

  useEffect(() => {
    const standalone =
      typeof window !== "undefined" &&
      (window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as { standalone?: boolean }).standalone === true)
    if (standalone) {
      setIsInstalled(true)
      return
    }

    const ua = typeof navigator !== "undefined" ? navigator.userAgent : ""
    const ios = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
    setIsIOS(ios)
    setChromeOnIos(/CriOS/i.test(ua))
    setAndroid(/Android/i.test(ua))

    if (typeof navigator !== "undefined" && navigator.share) {
      setCanShare(true)
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener("beforeinstallprompt", handler)
    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  const openShareSheet = useCallback(async () => {
    setShowIosDialog(false)
    if (typeof navigator === "undefined" || !navigator.share) {
      setShowManualDialog(true)
      return
    }
    try {
      await navigator.share({
        title: "AMESP",
        text: "Associação dos Maricultores do Estado de São Paulo",
        url: window.location.href,
      })
      toast.success("Pronto! Veja se o ícone do AMESP apareceu na sua tela inicial.")
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setShowManualDialog(true)
      }
    }
  }, [])

  const copyUrl = useCallback(() => {
    const url = typeof window !== "undefined" ? window.location.href : ""
    if (!url) return

    const doCopy = () => {
      const textarea = document.createElement("textarea")
      textarea.value = url
      textarea.style.position = "fixed"
      textarea.style.opacity = "0"
      textarea.setAttribute("readonly", "")
      document.body.appendChild(textarea)
      textarea.select()
      try {
        document.execCommand("copy")
        setAddressCopied(true)
        toast.success("Endereço copiado. Abra o Safari, toque na barra de endereço em cima e segure até aparecer 'Colar', depois toque em Colar.")
      } catch {
        toast.error("Não foi possível copiar. Anote o endereço que aparece na barra do Chrome.")
      }
      document.body.removeChild(textarea)
    }

    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        setAddressCopied(true)
        toast.success("Endereço copiado. Abra o Safari, toque na barra de endereço em cima e segure até aparecer 'Colar', depois toque em Colar.")
      }).catch(() => doCopy())
    } else {
      doCopy()
    }
  }, [])

  const handleClick = useCallback(async () => {
    onAfterClick?.()

    if (installPrompt) {
      try {
        await installPrompt.prompt()
        const { outcome } = await installPrompt.userChoice
        if (outcome === "accepted") {
          toast.success("Pronto! O app AMESP está na sua tela inicial.")
        }
        setInstallPrompt(null)
      } catch {
        if (isIOS) setShowManualDialog(true)
        else if (android) setShowAndroidDialog(true)
        else toast.error("Não foi possível. Tente novamente.")
      }
      return
    }

    if (isIOS) {
      setShowIosDialog(true)
      return
    }

    if (android) {
      setShowAndroidDialog(true)
      return
    }

    if (canShare && typeof navigator !== "undefined") {
      try {
        await navigator.share({
          title: "AMESP",
          text: "Associação dos Maricultores do Estado de São Paulo",
          url: window.location.href,
        })
        toast.success("Pronto! Veja se o ícone do AMESP apareceu na sua tela inicial.")
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          toast.error("Não foi possível. Tente novamente.")
        }
      }
      return
    }

    if (isIOS) setShowManualDialog(true)
    else if (android) setShowAndroidDialog(true)
    else toast.error("Não foi possível. Tente novamente.")
  }, [installPrompt, canShare, isIOS, android, onAfterClick])

  if (isInstalled) return null

  return (
    <>
      {variant === "link" ? (
        <li>
          <button
            type="button"
            onClick={handleClick}
            className="hover:text-primary-foreground transition-colors text-sm text-primary-foreground/80 cursor-pointer bg-transparent border-none p-0 font-inherit"
          >
            {LABEL}
          </button>
        </li>
      ) : (
        <Button
          type="button"
          variant="outline"
          className={`w-full border-primary/30 bg-primary/5 hover:bg-primary/10 ${className}`}
          onClick={handleClick}
        >
          <Download className="h-4 w-4 mr-2" />
          <span>{LABEL}</span>
        </Button>
      )}

      <Dialog open={showAndroidDialog} onOpenChange={setShowAndroidDialog}>
        <DialogContent className="max-w-sm mx-4 text-center">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-center gap-2">
              <Smartphone className="h-6 w-6" />
              {LABEL} no Android
            </DialogTitle>
          </DialogHeader>
          <ol className="text-left text-sm text-muted-foreground leading-relaxed py-2 space-y-2 list-decimal list-inside">
            <li>Toque nos <strong>três pontinhos (⋮)</strong> no canto superior direito do Chrome.</li>
            <li><strong>Role o menu até o final</strong> — a opção <strong>Adicionar à tela inicial</strong> ou <strong>Instalar app</strong> costuma ficar embaixo de &quot;Compartilhar&quot;, &quot;Traduzir&quot;, etc. Não está dentro de Compartilhar.</li>
            <li>Se ainda não aparecer, em alguns aparelhos ela fica em <strong>Ferramentas</strong> ou <strong>Mais ferramentas</strong> (toque e procure dentro).</li>
            <li>O Chrome também pode mostrar um <strong>banner na parte de baixo da página</strong> ou um ícone de instalação na barra de endereço — use esse atalho se aparecer. Use o site em <strong>https</strong> (produção) para essa opção estar disponível.</li>
          </ol>
          <p className="text-xs text-muted-foreground text-left pt-1">
            Se ainda não aparecer: no computador abra o site, F12 → <strong>Application</strong> → <strong>Manifest</strong>. O Chrome mostra se o app está &quot;Installable&quot; ou o motivo de não estar.
          </p>
          <DialogFooter className="flex justify-center sm:justify-center">
            <Button onClick={() => setShowAndroidDialog(false)} size="lg" className="w-full min-h-[48px] touch-manipulation">
              Entendi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showIosDialog} onOpenChange={setShowIosDialog}>
        <DialogContent className="max-w-sm mx-4 text-center">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-center gap-2">
              <Smartphone className="h-6 w-6" />
              {LABEL} no iPhone
            </DialogTitle>
          </DialogHeader>
          <ol className="text-left text-sm text-muted-foreground leading-relaxed py-2 space-y-2 list-decimal list-inside">
            <li>Toque nos <strong>três pontinhos (⋯)</strong> na barra de baixo.</li>
            <li>Toque em <strong>Compartilhar</strong>.</li>
            <li>Role ou toque em <strong>Ver mais</strong> e procure <strong>Adicionar à Tela de Início</strong>.</li>
            <li>Toque em <strong>Adicionar à Tela de Início</strong>, depois em <strong>Adicionar</strong>.</li>
          </ol>
          <p className="text-xs text-muted-foreground text-left">
            No iPhone a Apple não permite que o site adicione o app sozinho; é preciso usar esse menu. No Android o Chrome pode mostrar &quot;Instalar app&quot; em um toque.
          </p>
          <DialogFooter className="flex justify-center sm:justify-center">
            <Button onClick={() => setShowIosDialog(false)} size="lg" className="w-full">
              Entendi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showManualDialog} onOpenChange={(open) => { setShowManualDialog(open); if (!open) setAddressCopied(false) }}>
        <DialogContent className="max-w-sm mx-4 text-center">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-center gap-2">
              <Smartphone className="h-6 w-6" />
              {LABEL} no iPhone
            </DialogTitle>
          </DialogHeader>
          {chromeOnIos ? (
            <>
              <p className="text-sm text-muted-foreground leading-relaxed py-2 text-left">
                No iPhone, só o <strong>Safari</strong> permite adicionar o app à tela inicial.
              </p>
              <ol className="text-left text-sm text-muted-foreground leading-relaxed py-2 space-y-2 list-decimal list-inside">
                <li>Toque no botão <strong>Copiar endereço</strong> abaixo.</li>
                <li>Saia do Chrome e abra o app <strong>Safari</strong>. Toque na barra de endereço em cima, segure até aparecer <strong>Colar</strong> e toque em Colar. Toque em Ir.</li>
                <li>No Safari, toque nos <strong>três pontinhos (⋯)</strong>, depois em <strong>Compartilhar</strong>.</li>
                <li>Role ou toque em <strong>Ver mais</strong> e procure <strong>Adicionar à Tela de Início</strong>. Toque nessa opção, depois em <strong>Adicionar</strong>.</li>
              </ol>
              {typeof window !== "undefined" && (
                <p className="text-xs text-muted-foreground break-all text-left bg-muted/50 p-2 rounded">
                  {window.location.href}
                </p>
              )}
              {addressCopied && (
                <p className="text-sm font-medium text-green-600 dark:text-green-400 text-left">
                  Copiado! Agora abra o Safari e cole o endereço na barra.
                </p>
              )}
              <DialogFooter className="flex flex-col gap-2 sm:flex-col">
                <Button onClick={copyUrl} variant="outline" size="lg" className="w-full">
                  <Copy className="h-4 w-4 mr-2" />
                  {addressCopied ? "Copiar de novo" : "Copiar endereço"}
                </Button>
                <Button onClick={() => { setShowManualDialog(false); setAddressCopied(false) }} variant="ghost" size="sm" className="w-full">
                  Fechar
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <ol className="text-left text-sm text-muted-foreground leading-relaxed py-2 space-y-2 list-decimal list-inside">
                <li>Toque nos <strong>três pontinhos (⋯)</strong> na barra.</li>
                <li>Toque em <strong>Compartilhar</strong>.</li>
                <li>Role ou toque em <strong>Ver mais</strong> e procure <strong>Adicionar à Tela de Início</strong>.</li>
                <li>Toque em <strong>Adicionar à Tela de Início</strong>, depois em <strong>Adicionar</strong>.</li>
              </ol>
              <DialogFooter className="flex flex-col gap-2 sm:flex-col">
                <Button onClick={() => setShowManualDialog(false)} size="lg" className="w-full">
                  Entendi
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
