import type { Metadata } from 'next'
import { cache } from 'react'
import { getCatalog } from '@/lib/catalog'
import { CatalogView } from '@/components/catalog-view'
import { BUSINESS } from '@/lib/business'

// Respaldo: la página se regenera como máximo cada hora (el panel la regenera al instante al guardar)
export const revalidate = 3600

// Metadata y página comparten la misma consulta a Supabase
const loadCatalog = cache(getCatalog)

const TITLE = 'PacíficoClean | Artículos de aseo en Valparaíso con despacho'

function joinEs(items: string[]) {
  if (items.length <= 1) return items[0] ?? ''
  return `${items.slice(0, -1).join(', ')} y ${items[items.length - 1]}`
}

function shippingSummary(shipping: Record<string, number>) {
  const entries = Object.entries(shipping).sort((a, b) => a[1] - b[1])
  return {
    all: entries.map(([city]) => city),
    free: entries.filter(([, cost]) => cost === 0).map(([city]) => city),
    paid: entries.filter(([, cost]) => cost > 0).map(([city]) => city),
  }
}

function buildDescription(shipping: Record<string, number>) {
  const { free, paid } = shippingSummary(shipping)
  const parts: string[] = []
  if (free.length) parts.push(`despacho gratis en ${joinEs(free)}`)
  if (paid.length) parts.push(`envíos a ${joinEs(paid)}`)
  return `Artículos de aseo y limpieza para hogares y empresas${parts.length ? `, con ${parts.join(' y ')}` : ''}. Pide por WhatsApp.`
}

export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await loadCatalog()
  const description = buildDescription(settings.shipping)

  return {
    title: TITLE,
    description,
    alternates: { canonical: '/' },
    openGraph: {
      type: 'website',
      locale: 'es_CL',
      siteName: BUSINESS.brand,
      url: '/',
      title: TITLE,
      description,
    },
    twitter: { card: 'summary_large_image', title: TITLE, description },
  }
}

export default async function Home() {
  const catalog = await loadCatalog()
  const { all } = shippingSummary(catalog.settings.shipping)

  // Datos estructurados: le explican a Google qué es el negocio y dónde despacha
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Store',
    '@id': `${BUSINESS.website}/#negocio`,
    name: BUSINESS.brand,
    legalName: BUSINESS.legalName,
    description: buildDescription(catalog.settings.shipping),
    url: BUSINESS.website,
    logo: `${BUSINESS.website}/logo.png`,
    image: `${BUSINESS.website}/logo.png`,
    telephone: `+${catalog.settings.whatsapp}`,
    email: BUSINESS.email,
    priceRange: '$',
    currenciesAccepted: 'CLP',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Valparaíso',
      addressRegion: 'Región de Valparaíso',
      addressCountry: 'CL',
    },
    areaServed: all.map((city) => ({ '@type': 'City', name: city })),
    sameAs: ['https://instagram.com/pacificoclean', 'https://www.tiktok.com/@pacifico.clean'],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <CatalogView {...catalog} />
    </>
  )
}
