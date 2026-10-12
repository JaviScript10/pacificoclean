import type { Metadata } from 'next'

// Evita que Google indexe el panel
export const metadata: Metadata = {
  title: 'Panel Admin | PacíficoClean',
  robots: { index: false, follow: false },
}

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return children
}
