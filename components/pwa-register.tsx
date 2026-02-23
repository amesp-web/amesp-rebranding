"use client"

import { useEffect } from "react"

export function PWARegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        if (reg.installing) return
        reg.update()
      })
      .catch(() => {})
  }, [])
  return null
}
