"use client"

import { useEffect, useRef, useState } from "react"
import { FileText } from "lucide-react"

type Theme = {
  iconBg: string
  iconColor: string
}

function getOptimizedCoverSrc(coverUrl: string, updatedAt?: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const isSupabase = supabaseUrl && coverUrl.startsWith(supabaseUrl)
  const base = isSupabase
    ? `/api/image?url=${encodeURIComponent(coverUrl)}&w=800&q=80`
    : coverUrl
  if (!updatedAt) return base
  const sep = base.includes("?") ? "&" : "?"
  return `${base}${sep}v=${encodeURIComponent(updatedAt)}`
}

export function DownloadPreview({
  coverUrl,
  coverUpdatedAt,
  fileUrl,
  fileName,
  title,
  theme,
}: {
  coverUrl?: string | null
  coverUpdatedAt?: string | null
  fileUrl: string
  fileName: string
  title: string
  theme: Theme
}) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const el = wrapperRef.current
    if (!el) return

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true)
          io.disconnect()
        }
      },
      { rootMargin: "300px", threshold: 0.01 }
    )

    io.observe(el)
    return () => io.disconnect()
  }, [])

  const isPdf = fileName.toLowerCase().endsWith(".pdf")

  if (coverUrl) {
    return (
      <div
        ref={wrapperRef}
        className="mb-4 rounded-2xl overflow-hidden shadow-lg group-hover:shadow-2xl transition-all duration-300 bg-white relative flex items-center justify-center"
        style={{ height: "320px" }}
      >
        {!loaded && (
          <div className="absolute inset-0 bg-slate-200 animate-pulse" aria-hidden />
        )}
        {inView && (
          <img
            src={getOptimizedCoverSrc(coverUrl, coverUpdatedAt || undefined)}
            alt={title}
            className="w-full h-full object-contain object-center"
            style={{ opacity: loaded ? 1 : 0, transition: "opacity 0.25s ease-in" }}
            loading="lazy"
            decoding="async"
            onLoad={() => setLoaded(true)}
          />
        )}
      </div>
    )
  }

  if (isPdf) {
    return (
      <div
        ref={wrapperRef}
        className="mb-4 rounded-2xl overflow-hidden shadow-lg group-hover:shadow-2xl transition-all duration-300 bg-white relative"
        style={{ height: "320px" }}
      >
        {!loaded && (
          <div className="absolute inset-0 bg-slate-200 animate-pulse flex items-center justify-center">
            <FileText className="h-12 w-12 text-slate-400" />
          </div>
        )}
        {inView && (
          <iframe
            src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=0&page=1&view=FitH&zoom=105`}
            className="w-full border-0 absolute"
            title={title}
            loading="lazy"
            style={{
              pointerEvents: "none",
              height: "400px",
              top: "-20px",
              left: "0",
              opacity: loaded ? 1 : 0,
              transition: "opacity 0.25s ease-in",
            }}
            onLoad={() => setLoaded(true)}
          />
        )}
      </div>
    )
  }

  return (
    <div
      className={`h-20 w-20 rounded-2xl bg-gradient-to-br ${theme.iconBg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
    >
      <FileText className={`h-10 w-10 ${theme.iconColor}`} />
    </div>
  )
}
