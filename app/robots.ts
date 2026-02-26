import type { MetadataRoute } from "next"

const siteUrl = "https://www.amespmaricultura.org.br"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/*",
          "/maricultor",
          "/maricultor/*",
          "/login",
          "/auth",
          "/auth/*",
          "/api",
          "/api/*",
          "/preview-layouts",
          "/preview-layouts/*",
          "/login/dev",
          "/login/test",
          "/maricultor/dashboard/test",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}

