import type React from "react"
import type { Metadata, Viewport } from "next"
import { Space_Grotesk, DM_Sans } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { PWARegister } from "@/components/pwa-register"
import { PushPromptOnInstall } from "@/components/public/PushPromptOnInstall"
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

const siteUrl = "https://www.amespmaricultura.org.br"

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "AMESP - Associação dos Maricultores do Estado de São Paulo",
    template: "%s | AMESP",
  },
  description:
    "Associação dos Maricultores do Estado de São Paulo. Trabalhamos pelo desenvolvimento da maricultura sustentável, apoiando produtores, pesquisas e projetos socioambientais no litoral paulista.",
  generator: "v0.app",
  icons: {
    icon: { url: "/favicon.png", sizes: "192x192", type: "image/png" },
    apple: "/favicon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "AMESP",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "AMESP - Associação dos Maricultores do Estado de São Paulo",
    title: "AMESP - Maricultura sustentável no litoral paulista",
    description:
      "Conheça a AMESP, a maricultura no litoral paulista e os projetos que fortalecem a produção sustentável e as comunidades caiçaras.",
    locale: "pt_BR",
    images: [
      {
        url: "/og-cover.png",
        width: 1200,
        height: 630,
        alt: "AMESP - Associação dos Maricultores do Estado de São Paulo",
      },
    ],
  },
  alternates: {
    canonical: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "AMESP - Maricultura sustentável no litoral paulista",
    description:
      "Associação dos Maricultores do Estado de São Paulo. Projetos, notícias e oportunidades na maricultura.",
    images: ["/og-cover.png"],
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
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "AMESP - Associação dos Maricultores do Estado de São Paulo",
              url: siteUrl,
              logo: `${siteUrl}/favicon.png`,
              description:
                "Associação que representa os maricultores do Estado de São Paulo, promovendo a maricultura sustentável, projetos socioambientais e ações em defesa do setor.",
              sameAs: [],
              contactPoint: [
                {
                  "@type": "ContactPoint",
                  contactType: "customer service",
                  email: "amesp@amespmaricultura.org.br",
                  availableLanguage: ["pt-BR"],
                },
              ],
              address: {
                "@type": "PostalAddress",
                addressCountry: "BR",
                addressRegion: "SP",
              },
            }),
          }}
        />
        <PWARegister />
        <PushPromptOnInstall />
        <Suspense fallback={null}>{children}</Suspense>
        <Toaster richColors position="top-center" />
        <Analytics />
      </body>
    </html>
  )
}
