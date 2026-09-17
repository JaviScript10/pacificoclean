import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css' // <-- Esta línea es vital para que cargue Tailwind

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'PacificoClean | Soluciones de Aseo Profesional',
  description: 'Venta de artículos de aseo industrial y domiciliario de máxima calidad al mejor precio.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={`${inter.variable} font-sans`}>
      <body className="bg-gray-50 text-gray-900 antialiased min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  )
}