import type React from "react"
import type { Metadata, Viewport } from "next"
import { Space_Grotesk, DM_Sans } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { PWARegister } from "@/components/pwa-register"
import { Toaster } from "sonner"
import "./globals.css"

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
})

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
})

export const metadata: Metadata = {
  title: "AMESP - Associação dos Maricultores do Estado de São Paulo",
  description:
    "Trabalhamos para o desenvolvimento e organização da maricultura sustentável no litoral norte do estado de São Paulo.",
  generator: "v0.app",
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "AMESP",
  },
}

export const viewport: Viewport = {
  themeColor: "#0d9488",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className={`font-mono ${spaceGrotesk.variable} ${dmSans.variable} antialiased`}>
        <PWARegister />
        <Suspense fallback={null}>{children}</Suspense>
        <Toaster richColors position="top-center" />
        <Analytics />
      </body>
    </html>
  )
}
