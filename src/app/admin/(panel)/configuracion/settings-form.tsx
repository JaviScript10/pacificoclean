'use client'

import { useState, useTransition } from 'react'
import { Plus, Trash2, ExternalLink } from 'lucide-react'
import { saveSettings } from './actions'

type Row = { key: string; city: string; cost: string }

const newKey = () => Math.random().toString(36).slice(2)

const inputClass =
  'w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#0A4D94]'
const labelClass = 'block text-xs font-bold text-slate-600 mb-1'

function formatPhone(n: string) {
  return n.length >= 4 ? `+${n.slice(0, 2)} ${n.slice(2, 3)} ${n.slice(3)}` : n
}

export function SettingsForm({
  initialWhatsapp,
  initialShipping,
}: {
  initialWhatsapp: string
  initialShipping: { city: string; cost: number }[]
}) {
  const [isPending, startTransition] = useTransition()
  const [whatsapp, setWhatsapp] = useState(initialWhatsapp)
  const [rows, setRows] = useState<Row[]>(
    initialShipping.length
      ? initialShipping.map((r) => ({ key: newKey(), city: r.city, cost: String(r.cost) }))
      : [{ key: newKey(), city: '', cost: '0' }]
  )
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  const digits = whatsapp.replace(/\D/g, '')

  function updateRow(key: string, field: 'city' | 'cost', value: string) {
    setSaved(false)
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, [field]: value } : r)))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaved(false)

    if (digits.length < 10 || digits.length > 13) {
      return setError('El WhatsApp debe incluir el código de país, por ejemplo 56912345678')
    }

    const shipping = rows.map((r) => ({ city: r.city.trim(), cost: Number(r.cost) }))
    if (shipping.some((s) => s.city.length < 2)) return setError('Cada comuna necesita un nombre')
    if (shipping.some((s) => !Number.isInteger(s.cost) || s.cost < 0)) {
      return setError('Los costos deben ser números enteros, sin puntos ni signo $. Usa 0 para despacho gratis')
    }

    startTransition(async () => {
      const res = await saveSettings({ whatsapp: digits, shipping })
      if (res.error) return setError(res.error)
      setWhatsapp(digits)
      setSaved(true)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-28">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Configuración</h1>
        <p className="text-sm text-slate-500">Estos datos se usan en todo el sitio: botones de WhatsApp, carrito, despachos y preguntas frecuentes.</p>
      </div>

      {error && (
        <p role="alert" className="bg-red-50 border border-red-200 text-red-600 text-sm font-semibold p-3 rounded-xl">{error}</p>
      )}
      {saved && (
        <p role="status" className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold p-3 rounded-xl">
          ✓ Cambios guardados. El sitio se actualiza en unos segundos.
        </p>
      )}

      {/* WhatsApp */}
      <section className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 space-y-3">
        <h2 className="font-bold text-slate-900">WhatsApp de pedidos</h2>
        <div>
          <label htmlFor="whatsapp" className={labelClass}>Número con código de país, sin + ni espacios</label>
          <input
            id="whatsapp"
            inputMode="numeric"
            value={whatsapp}
            onChange={(e) => { setWhatsapp(e.target.value); setSaved(false) }}
            placeholder="56912345678"
            className={inputClass}
          />
        </div>
        {digits.length >= 10 && (
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="text-slate-600">Se mostrará como <strong>{formatPhone(digits)}</strong></span>
            <a
              href={`https://wa.me/${digits}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[#0A4D94] font-bold hover:underline"
            >
              Probar número <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}
      </section>

      {/* Despachos */}
      <section className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 space-y-4">
        <div>
          <h2 className="font-bold text-slate-900">Comunas y costos de despacho</h2>
          <p className="text-xs text-slate-500 mt-1">Escribe <strong>0</strong> para despacho gratis. En el sitio se ordenan del más barato al más caro.</p>
        </div>

        <div className="space-y-2">
          {rows.map((r, i) => (
            <div key={r.key} className="flex items-end gap-2">
              <div className="flex-1">
                {i === 0 && <label className={labelClass}>Comuna</label>}
                <input
                  value={r.city}
                  onChange={(e) => updateRow(r.key, 'city', e.target.value)}
                  placeholder="Ej: Viña del Mar"
                  aria-label={`Comuna ${i + 1}`}
                  className={inputClass}
                />
              </div>
              <div className="w-32">
                {i === 0 && <label className={labelClass}>Costo ($)</label>}
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  step={1}
                  value={r.cost}
                  onChange={(e) => updateRow(r.key, 'cost', e.target.value)}
                  aria-label={`Costo de despacho ${i + 1}`}
                  className={inputClass}
                />
              </div>
              <button
                type="button"
                onClick={() => { setSaved(false); setRows((prev) => (prev.length > 1 ? prev.filter((x) => x.key !== r.key) : prev)) }}
                disabled={rows.length === 1}
                aria-label={`Quitar comuna ${i + 1}`}
                className="p-2.5 text-red-400 hover:text-red-600 disabled:opacity-30 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => { setSaved(false); setRows((prev) => [...prev, { key: newKey(), city: '', cost: '' }]) }}
          className="flex items-center gap-1.5 text-sm font-bold text-[#0A4D94] hover:underline cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Agregar comuna
        </button>
      </section>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4">
        <div className="max-w-6xl mx-auto flex justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="py-3 px-6 rounded-xl font-bold text-sm text-white bg-[#0A4D94] hover:bg-[#083b73] disabled:opacity-60 cursor-pointer"
          >
            {isPending ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </form>
  )
}
