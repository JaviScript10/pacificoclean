import Link from 'next/link'
import { requireAdmin } from '@/lib/auth'
import { logout } from '../actions'

const NAV = [
  { href: '/admin', label: 'Resumen' },
  { href: '/admin/productos', label: 'Productos' },
  { href: '/admin/configuracion', label: 'Configuración' },
  { href: '/admin/cuenta', label: 'Mi cuenta' },
]

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireAdmin()

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-black text-white">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          <Link href="/admin" className="font-black text-lg">
            Pacífico<span className="text-emerald-400">Clean</span>
            <span className="text-neutral-500 font-semibold text-xs ml-2">Admin</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden md:inline text-xs text-neutral-400">{user.email}</span>
            <Link href="/" target="_blank" className="text-xs text-neutral-300 hover:text-white">
              Ver sitio
            </Link>
            <form action={logout}>
              <button className="text-xs font-bold bg-neutral-800 hover:bg-neutral-700 px-3 py-2 rounded-lg cursor-pointer">
                Salir
              </button>
            </form>
          </div>
        </div>
        <nav className="border-t border-neutral-800">
          <div className="max-w-6xl mx-auto px-4 flex gap-1 overflow-x-auto">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-2.5 text-sm font-semibold text-neutral-300 hover:text-white whitespace-nowrap"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      </header>
      <main className="max-w-6xl mx-auto p-4 sm:p-6">{children}</main>
    </div>
  )
}
