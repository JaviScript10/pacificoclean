import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { BUSINESS } from '@/lib/business'

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="bg-black text-white">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="font-black text-lg">
            Pacífico<span className="text-emerald-400">Clean</span>
          </Link>
          <Link href="/" className="flex items-center gap-1.5 text-sm text-neutral-300 hover:text-white">
            <ArrowLeft className="w-4 h-4" /> Volver a la tienda
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10 sm:py-14">
        <article className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 space-y-6 text-sm sm:text-base leading-relaxed [&_h1]:text-2xl [&_h1]:sm:text-3xl [&_h1]:font-black [&_h1]:text-slate-900 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-slate-900 [&_h2]:pt-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_a]:text-[#0A4D94] [&_a]:font-semibold [&_a]:underline">
          {children}
        </article>
      </main>

      <footer className="text-center text-xs text-slate-500 pb-10 px-4">
        {BUSINESS.legalName} · RUT {BUSINESS.rut} · {BUSINESS.address}
      </footer>
    </div>
  )
}
