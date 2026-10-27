import type { MetadataRoute } from 'next'
import { BUSINESS } from '@/lib/business'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: BUSINESS.website,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${BUSINESS.website}/aviso-legal`,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BUSINESS.website}/privacidad`,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]
}
