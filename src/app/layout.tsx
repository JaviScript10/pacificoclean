import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { BUSINESS } from '@/lib/business'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

// Valores base para todo el sitio. La página de inicio define los suyos (más completos).
export const metadata: Metadata = {
  metadataBase: new URL(BUSINESS.website),
  title: 'PacíficoClean | Artículos de aseo en Valparaíso',
  description: 'Artículos de aseo y limpieza para hogares, empresas e instituciones, con despacho en Valparaíso y alrededores.',
  applicationName: BUSINESS.brand,
  openGraph: {
    type: 'website',
    locale: 'es_CL',
    siteName: BUSINESS.brand,
  },
  twitter: { card: 'summary_large_image' },
}

export const viewport: Viewport = {
  themeColor: '#000000',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es-CL" className={`${inter.variable} font-sans`}>
      <body className="bg-gray-50 text-gray-900 antialiased min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  )
}
