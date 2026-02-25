import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

type SubscriptionKeys = {
  p256dh: string
  auth: string
}

type PushSubscriptionPayload = {
  endpoint: string
  keys: SubscriptionKeys
}

type SubscribeBody = {
  subscription: PushSubscriptionPayload
  topics?: string[]
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
})

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as SubscribeBody
    const { subscription, topics } = body

    if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
      return NextResponse.json({ error: "Invalid subscription" }, { status: 400 })
    }

    const normalizedTopics =
      Array.isArray(topics) && topics.length > 0 ? topics : ["news", "events", "payments"]

    const { error } = await supabase
      .from("push_subscriptions")
      .upsert(
        {
          endpoint: subscription.endpoint,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
          topics: normalizedTopics,
        },
        { onConflict: "endpoint" },
      )

    if (error) {
      console.error("[push] subscribe error:", error)
      return NextResponse.json({ error: "Erro ao salvar inscrição" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (e: any) {
    console.error("[push] subscribe exception:", e)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const body = (await req.json()) as { endpoint?: string }
    if (!body.endpoint) {
      return NextResponse.json({ error: "Endpoint requerido" }, { status: 400 })
    }

    const { error } = await supabase.from("push_subscriptions").delete().eq("endpoint", body.endpoint)
    if (error) {
      console.error("[push] unsubscribe error:", error)
      return NextResponse.json({ error: "Erro ao remover inscrição" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (e: any) {
    console.error("[push] unsubscribe exception:", e)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

