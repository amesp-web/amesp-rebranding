// Service Worker para PWA AMESP
// Instalação básica + suporte a notificações push

self.addEventListener("install", () => {
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  self.clients.claim()
})

self.addEventListener("push", (event) => {
  if (!event.data) return

  let data = {}
  try {
    data = event.data.json()
  } catch {
    data = { body: event.data.text() }
  }

  const title = data.title || "AMESP"
  const body = data.body || ""
  const url = data.url || "/"

  const options = {
    body,
    icon: "/favicon.png",
    badge: "/favicon.png",
    data: { url },
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener("notificationclick", (event) => {
  const notification = event.notification
  const url = (notification.data && notification.data.url) || "/"

  notification.close()

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) {
          client.focus()
          if ("navigate" in client) {
            client.navigate(url)
          }
          return
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(url)
      }
    }),
  )
})

