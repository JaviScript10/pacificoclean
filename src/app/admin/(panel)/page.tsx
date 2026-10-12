import { requireAdmin } from '@/lib/auth'

export default async function AdminHome() {
  const { supabase } = await requireAdmin()

  const [total, offers, hidden] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_offer', true),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', false),
  ])

  const stats = [
    { label: 'Productos', value: total.count ?? 0 },
    { label: 'En oferta', value: offers.count ?? 0 },
    { label: 'Ocultos', value: hidden.count ?? 0 },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-slate-900">Resumen</h1>
      <div className="grid grid-cols-3 gap-3 sm:gap-6">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 text-center">
            <p className="text-2xl sm:text-4xl font-black text-[#0A4D94]">{s.value}</p>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>
      <p className="text-sm text-slate-500">La gestión de productos llega en el siguiente paso.</p>
    </div>
  )
}
