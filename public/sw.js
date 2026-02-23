// Service Worker mínimo para PWA AMESP
// Permite "Adicionar à tela inicial" e futuramente push notifications
self.addEventListener("install", () => {
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  self.clients.claim()
})
