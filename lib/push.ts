import webpush from "web-push"
import { createClient } from "@supabase/supabase-js"

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const publicKey = process.env.WEB_PUSH_PUBLIC_KEY
const privateKey = process.env.WEB_PUSH_PRIVATE_KEY
const contactEmail = process.env.WEB_PUSH_CONTACT_EMAIL || "contato@amespmaricultura.org.br"

if (publicKey && privateKey) {
  webpush.setVapidDetails(`mailto:${contactEmail}`, publicKey, privateKey)
}

export type PushTopic = "news" | "events" | "payments"

export async function sendPushToTopic(topic: PushTopic, payload: { title: string; body: string; url?: string }) {
  if (!publicKey || !privateKey) {
    console.warn("[push] WEB_PUSH_PUBLIC_KEY/WEB_PUSH_PRIVATE_KEY não configuradas. Ignorando envio.")
    return
  }

  const { data: subs, error } = await supabase
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth, topics")
    .contains("topics", [topic])

  if (error) {
    console.error("[push] erro ao buscar inscrições:", error)
    return
  }

  if (!subs || subs.length === 0) {
    return
  }

  const notificationPayload = JSON.stringify({
    title: payload.title,
    body: payload.body,
    url: payload.url || "/",
  })

  await Promise.all(
    subs.map(async (sub: any) => {
      const subscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth,
        },
      }

      try {
        await webpush.sendNotification(subscription as any, notificationPayload)
      } catch (err: any) {
        // Remover inscrições inválidas
        if (err?.statusCode === 404 || err?.statusCode === 410) {
          await supabase.from("push_subscriptions").delete().eq("id", sub.id)
        } else {
          console.error("[push] erro ao enviar notificação:", err?.message || err)
        }
      }
    }),
  )
}

