'use client'

import { useMemo, useState, useTransition } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Search } from 'lucide-react'
import { setProductActive, setProductOffer } from './actions'

export type AdminProduct = {
  id: string
  name: string
  imageUrl: string | null
  category: string
  isActive: boolean
  isOffer: boolean
  minPrice: number | null
  variantCount: number
}

type Flag = 'isActive' | 'isOffer'

function normalize(s: string) {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

function withFlag(p: AdminProduct, field: Flag, value: boolean): AdminProduct {
  return field === 'isActive' ? { ...p, isActive: value } : { ...p, isOffer: value }
}

function Toggle({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean
  onChange: (value: boolean) => void
  label: string
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors cursor-pointer disabled:opacity-50 ${
        checked ? 'bg-emerald-500' : 'bg-slate-300'
      }`}
    >
      <span
        className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      />
    </button>
  )
}

export function ProductList({ products: initial }: { products: AdminProduct[] }) {
  const [products, setProducts] = useState(initial)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('Todas')
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [, startTransition] = useTransition()

  const categories = useMemo(
    () => ['Todas', ...Array.from(new Set(initial.map((p) => p.category)))],
    [initial]
  )

  const filtered = products.filter(
    (p) =>
      (category === 'Todas' || p.category === category) &&
      normalize(p.name).includes(normalize(query))
  )

  function toggle(id: string, field: Flag, value: boolean) {
    setError('')
    // Actualización optimista: se ve el cambio al instante
    setProducts((prev) => prev.map((p) => (p.id === id ? withFlag(p, field, value) : p)))
    setPendingId(id)

    startTransition(async () => {
      const action = field === 'isActive' ? setProductActive : setProductOffer
      const res = await action(id, value)
      if (res.error) {
        // Si falla, se revierte
        setProducts((prev) => prev.map((p) => (p.id === id ? withFlag(p, field, !value) : p)))
        setError(`No se pudo guardar: ${res.error}`)
      }
      setPendingId(null)
    })
  }

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Productos</h1>
          <p className="text-sm text-slate-500">
            {filtered.length} de {products.length}
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar producto…"
            aria-label="Buscar producto"
            className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-[#0A4D94]"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          aria-label="Filtrar por categoría"
          className="bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-semibold focus:outline-none focus:border-[#0A4D94]"
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <p role="alert" className="bg-red-50 border border-red-200 text-red-600 text-sm font-semibold p-3 rounded-xl">
          {error}
        </p>
      )}

      <ul className="space-y-2">
        {filtered.map((p) => (
          <li
            key={p.id}
            className={`bg-white rounded-2xl border border-slate-200 p-3 flex items-center gap-3 ${
              p.isActive ? '' : 'opacity-60'
            }`}
          >
            <div className="relative w-14 h-14 shrink-0 bg-slate-50 rounded-xl border border-slate-100">
              {p.imageUrl && (
                <Image src={p.imageUrl} alt="" fill sizes="56px" className="object-contain p-1" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-slate-900 line-clamp-2">{p.name}</p>
              <p className="text-xs text-slate-500 mt-0.5">
                {p.category}
                {p.minPrice !== null && (
                  <>
                    {' · '}
                    {p.variantCount > 1 ? 'desde ' : ''}${p.minPrice.toLocaleString('es-CL')}
                  </>
                )}
                {p.variantCount > 1 && ` · ${p.variantCount} opciones`}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-5 shrink-0">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                <span className="hidden sm:inline">Visible</span>
                <Toggle
                  checked={p.isActive}
                  onChange={(v) => toggle(p.id, 'isActive', v)}
                  label={`Visible: ${p.name}`}
                  disabled={pendingId === p.id}
                />
              </label>
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                <span className="hidden sm:inline">Oferta</span>
                <Toggle
                  checked={p.isOffer}
                  onChange={(v) => toggle(p.id, 'isOffer', v)}
                  label={`Oferta: ${p.name}`}
                  disabled={pendingId === p.id}
                />
              </label>
              <Link
                href={`/admin/productos/${p.id}`}
                className="text-xs font-bold text-[#0A4D94] hover:underline"
              >
                Editar
              </Link>
            </div>
          </li>
        ))}
      </ul>

      {filtered.length === 0 && (
        <p className="text-center text-sm text-slate-500 py-10">No hay productos que coincidan.</p>
      )}
    </div>
  )
}
