import Link from 'next/link'
import { Phone, ShieldCheck } from 'lucide-react'

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-xs">
      <div className="bg-[#0A74DA] text-white text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5" />
            <span>Atención Comercial y Distribuidores: +56 9 1234 5678</span>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" /> Despacho industrial y domiciliario</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold tracking-tight text-[#0A74DA]">
            Pacifico<span className="text-[#22C55E]">Clean</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 font-medium text-sm text-gray-700">
          <Link href="/" className="hover:text-[#0A74DA] transition-colors">Inicio</Link>
          <Link href="#categorias" className="hover:text-[#0A74DA] transition-colors">Categorías</Link>
          <Link href="#catalogo" className="hover:text-[#0A74DA] transition-colors">Catálogo</Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link 
            href="/admin/login" 
            className="text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-xl transition-all"
          >
            Panel Admin
          </Link>
        </div>
      </div>
    </header>
  )
}