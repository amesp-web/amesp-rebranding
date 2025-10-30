"use client"

import { useEffect } from "react"

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Optional: log to monitoring service
    // console.error("App route error:", error)
  }, [error])

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 p-8 text-center">
      <h2 className="text-2xl font-semibold">Ocorreu um erro inesperado</h2>
      <p className="text-muted-foreground max-w-prose">
        {error?.message || "Tente novamente em instantes."}
      </p>
      <div className="flex gap-3">
        <button
          onClick={() => reset()}
          className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:opacity-90"
        >
          Tentar novamente
        </button>
        <button
          onClick={() => (window.location.href = "/")}
          className="px-4 py-2 rounded-md border"
        >
          Ir para a Home
        </button>
      </div>
    </div>
  )
}


