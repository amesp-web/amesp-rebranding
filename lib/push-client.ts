/**
 * Cliente para Web Push (uso no browser).
 * Usado pelo prompt pós-instalação e pelo botão no footer.
 */

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export function isPushSupported(): boolean {
  if (typeof window === "undefined") return false
  return (
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    typeof Notification !== "undefined"
  )
}

export function hasVapidKey(): boolean {
  return !!VAPID_PUBLIC_KEY
}

/** Inscreve o dispositivo para push (pede permissão + envia para o servidor). Retorna true se deu certo. */
export async function subscribeToPush(): Promise<boolean> {
  if (!VAPID_PUBLIC_KEY || typeof window === "undefined") return false
  const permission = await Notification.requestPermission()
  if (permission !== "granted") return false
  const reg = await navigator.serviceWorker.ready
  const subscription = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
  })
  const res = await fetch("/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      subscription,
      topics: ["news", "events", "payments"],
    }),
  })
  return res.ok
}

/** Remove a inscrição de push deste dispositivo. */
export async function unsubscribeFromPush(): Promise<void> {
  if (typeof window === "undefined") return
  const reg = await navigator.serviceWorker.ready
  const sub = await reg.pushManager.getSubscription()
  if (sub) {
    await fetch("/api/push/subscribe", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ endpoint: sub.endpoint }),
    })
    await sub.unsubscribe()
  }
}

/** Verifica se já está inscrito. */
export async function isSubscribed(): Promise<boolean> {
  if (typeof window === "undefined") return false
  const reg = await navigator.serviceWorker.ready
  const sub = await reg.pushManager.getSubscription()
  return !!sub
}
