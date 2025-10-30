"use client"

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8 text-center">
          <h2 className="text-2xl font-semibold">Falha crítica ao carregar a aplicação</h2>
          <p className="text-muted-foreground max-w-prose">
            {error?.message || "Algo deu errado ao iniciar. Tente novamente."}
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => reset()}
              className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:opacity-90"
            >
              Recarregar
            </button>
            <button
              onClick={() => (window.location.href = "/")}
              className="px-4 py-2 rounded-md border"
            >
              Ir para a Home
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}


