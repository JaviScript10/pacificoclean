import Link from 'next/link'
import { requireAdmin } from '@/lib/auth'
import { logout } from '../actions'

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireAdmin()

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-black text-white">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
          <Link href="/admin" className="font-black text-lg">
            Pacífico<span className="text-emerald-400">Clean</span>
            <span className="text-neutral-400 font-semibold text-xs ml-2">Admin</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-xs text-neutral-400">{user.email}</span>
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
      </header>
      <main className="max-w-6xl mx-auto p-4 sm:p-6">{children}</main>
    </div>
  )
}
