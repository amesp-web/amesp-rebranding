import type { MetadataRoute } from "next"

const siteUrl = "https://www.amespmaricultura.org.br"

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

  const toUrl = (path: string): string =>
    path.startsWith("http") ? path : `${siteUrl}${path}`

  return [
    {
      url: toUrl("/"),
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: toUrl("/news"),
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: toUrl("/galeria"),
      lastModified,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: toUrl("/downloads"),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: toUrl("/instalar-app"),
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: toUrl("/maricultor/cadastro"),
      lastModified,
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: toUrl("/login"),
      lastModified,
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ]
}

