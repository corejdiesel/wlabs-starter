import type { MetadataRoute } from 'next'
import { getPayloadClient } from '@/lib/payload'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3000'
  const payload = await getPayloadClient()
  const { docs } = await payload.find({ collection: 'pages', limit: 500, where: { _status: { equals: 'published' } } })

  return docs.map((doc) => ({
    url: doc.slug === 'home' ? base : `${base}/${doc.slug}`,
    lastModified: doc.updatedAt as string,
  }))
}
