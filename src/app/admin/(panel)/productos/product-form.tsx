'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ImagePlus, Plus, Trash2, ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { compressImage, extensionFor } from '@/lib/image'
import { slugify } from '@/lib/slugify'
import { Toggle } from '@/components/admin/toggle'
import { saveProduct, deleteProduct } from './actions'

export type ProductFormInitial = {
  id: string
  name: string
  categoryId: string
  description: string
  badge: string
  originalPrice: number | null
  isOffer: boolean
  isActive: boolean
  imagePath: string | null
  imageUrl: string | null
  variants: { name: string; price: number }[]
}

type VariantRow = { key: string; name: string; price: string }

const newKey = () => Math.random().toString(36).slice(2)

const inputClass =
  'w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#0A4D94]'
const labelClass = 'block text-xs font-bold text-slate-600 mb-1'

export function ProductForm({
  categories,
  initial,
}: {
  categories: { id: string; name: string }[]
  initial?: ProductFormInitial
}) {
  const router = useRouter()
  const fileInput = useRef<HTMLInputElement>(null)
  const [isPending, startTransition] = useTransition()

  const [name, setName] = useState(initial?.name ?? '')
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [badge, setBadge] = useState(initial?.badge ?? '')
  const [originalPrice, setOriginalPrice] = useState(initial?.originalPrice?.toString() ?? '')
  const [isOffer, setIsOffer] = useState(initial?.isOffer ?? false)
  const [isActive, setIsActive] = useState(initial?.isActive ?? true)
  const [imagePath, setImagePath] = useState<string | null>(initial?.imagePath ?? null)
  const [preview, setPreview] = useState<string | null>(initial?.imageUrl ?? null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [variants, setVariants] = useState<VariantRow[]>(
    initial?.variants.length
      ? initial.variants.map((v) => ({ key: newKey(), name: v.name, price: String(v.price) }))
      : [{ key: newKey(), name: '', price: '' }]
  )

  const isEdit = Boolean(initial?.id)
  const busy = isPending || uploading

  function showError(message: string) {
    setError(message)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // ---------- Foto ----------

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    setUploading(true)
    setError('')
    try {
      const blob = await compressImage(file)
      const path = `${slugify(name) || 'producto'}-${Date.now()}.${extensionFor(blob)}`

      const supabase = createClient()
      const { error: upError } = await supabase.storage
        .from('productos')
        .upload(path, blob, { contentType: blob.type, cacheControl: '31536000' })
      if (upError) throw upError

      setImagePath(path)
      setPreview(URL.createObjectURL(blob))
    } catch (err) {
      showError(`No se pudo subir la foto: ${err instanceof Error ? err.message : 'error desconocido'}`)
    } finally {
      setUploading(false)
    }
  }

  // ---------- Variantes ----------

  function updateVariant(key: string, field: 'name' | 'price', value: string) {
    setVariants((prev) => prev.map((v) => (v.key === key ? { ...v, [field]: value } : v)))
  }

  function addVariant() {
    setVariants((prev) => [...prev, { key: newKey(), name: '', price: '' }])
  }

  function removeVariant(key: string) {
    setVariants((prev) => (prev.length > 1 ? prev.filter((v) => v.key !== key) : prev))
  }

  // ---------- Guardar ----------

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (name.trim().length < 2) return showError('Escribe el nombre del producto')
    if (!categoryId) return showError('Selecciona una categoría')

    const parsedVariants = variants.map((v) => ({ name: v.name.trim(), price: Number(v.price) }))
    if (parsedVariants.some((v) => !Number.isInteger(v.price) || v.price <= 0)) {
      return showError('Cada precio debe ser un número entero mayor a 0, sin puntos ni signo $')
    }
    if (parsedVariants.length > 1 && parsedVariants.some((v) => !v.name)) {
      return showError('Cuando hay varias opciones, cada una necesita un nombre (ej: 1 Litro, 5 Litros)')
    }

    const original = originalPrice.trim() === '' ? null : Number(originalPrice)
    if (original !== null && (!Number.isInteger(original) || original <= 0)) {
      return showError('El precio anterior debe ser un número entero mayor a 0, o déjalo vacío')
    }

    startTransition(async () => {
      const res = await saveProduct({
        id: initial?.id,
        name: name.trim(),
        categoryId,
        description: description.trim(),
        badge: badge.trim(),
        originalPrice: original,
        isOffer,
        isActive,
        imagePath,
        variants: parsedVariants,
      })

      if (res.error) return showError(res.error)
      router.push('/admin/productos')
      router.refresh()
    })
  }

  // ---------- Eliminar ----------

  function handleDelete() {
    if (!initial?.id) return
    if (!confirm(`¿Eliminar "${initial.name}"? Esta acción no se puede deshacer.`)) return

    startTransition(async () => {
      const res = await deleteProduct(initial.id)
      if (res.error) return showError(res.error)
      router.push('/admin/productos')
      router.refresh()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-28">
      <div className="flex items-center gap-3">
        <Link href="/admin/productos" className="text-slate-500 hover:text-slate-900" aria-label="Volver a productos">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-black text-slate-900">{isEdit ? 'Editar producto' : 'Nuevo producto'}</h1>
      </div>

      {error && (
        <p role="alert" className="bg-red-50 border border-red-200 text-red-600 text-sm font-semibold p-3 rounded-xl">
          {error}
        </p>
      )}

      {/* Foto */}
      <section className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6">
        <h2 className="font-bold text-slate-900 mb-3">Foto</h2>
        <div className="flex items-center gap-4">
          <div className="relative w-28 h-28 shrink-0 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-center overflow-hidden">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="Vista previa" className="w-full h-full object-contain p-1" />
            ) : (
              <ImagePlus className="w-8 h-8 text-slate-300" />
            )}
          </div>
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              disabled={busy}
              className="bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-800 font-bold text-sm py-2.5 px-4 rounded-xl border border-slate-300 cursor-pointer"
            >
              {uploading ? 'Subiendo…' : preview ? 'Cambiar foto' : 'Subir foto'}
            </button>
            <p className="text-xs text-slate-500">Desde el celular puedes usar la cámara. Se optimiza automáticamente.</p>
          </div>
          <input ref={fileInput} type="file" accept="image/*" onChange={handleFile} className="hidden" />
        </div>
      </section>

      {/* Datos básicos */}
      <section className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 space-y-4">
        <h2 className="font-bold text-slate-900">Datos</h2>
        <div>
          <label htmlFor="name" className={labelClass}>Nombre</label>
          <input id="name" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="Ej: Cloro Flash Concentrado (5 Litros)" />
        </div>
        <div>
          <label htmlFor="category" className={labelClass}>Categoría</label>
          <select id="category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={inputClass}>
            <option value="">Selecciona…</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="description" className={labelClass}>Descripción (opcional)</label>
          <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={inputClass} />
        </div>
      </section>

      {/* Precios */}
      <section className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 space-y-4">
        <div>
          <h2 className="font-bold text-slate-900">Precios</h2>
          <p className="text-xs text-slate-500 mt-1">
            Si tiene una sola presentación, deja una fila (el nombre es opcional). Si tiene varias (1 L, 5 L…), agrega una fila por cada una.
          </p>
        </div>

        <div className="space-y-2">
          {variants.map((v, i) => (
            <div key={v.key} className="flex items-end gap-2">
              <div className="flex-1">
                {i === 0 && <label className={labelClass}>Opción</label>}
                <input
                  value={v.name}
                  onChange={(e) => updateVariant(v.key, 'name', e.target.value)}
                  placeholder={variants.length > 1 ? 'Ej: 5 Litros' : 'Opcional'}
                  aria-label={`Nombre de la opción ${i + 1}`}
                  className={inputClass}
                />
              </div>
              <div className="w-32">
                {i === 0 && <label className={labelClass}>Precio ($)</label>}
                <input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  step={1}
                  value={v.price}
                  onChange={(e) => updateVariant(v.key, 'price', e.target.value)}
                  placeholder="1990"
                  aria-label={`Precio de la opción ${i + 1}`}
                  className={inputClass}
                />
              </div>
              <button
                type="button"
                onClick={() => removeVariant(v.key)}
                disabled={variants.length === 1}
                aria-label={`Quitar opción ${i + 1}`}
                className="p-2.5 text-red-400 hover:text-red-600 disabled:opacity-30 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <button type="button" onClick={addVariant} className="flex items-center gap-1.5 text-sm font-bold text-[#0A4D94] hover:underline cursor-pointer">
          <Plus className="w-4 h-4" /> Agregar opción
        </button>
      </section>

      {/* Publicación y oferta */}
      <section className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 space-y-4">
        <h2 className="font-bold text-slate-900">Publicación</h2>

        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-800">Visible en el sitio</p>
            <p className="text-xs text-slate-500">Si lo apagas, el producto se oculta sin borrarlo.</p>
          </div>
          <Toggle checked={isActive} onChange={setIsActive} label="Visible en el sitio" />
        </div>

        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-800">En oferta</p>
            <p className="text-xs text-slate-500">Aparece también en la categoría Ofertas.</p>
          </div>
          <Toggle checked={isOffer} onChange={setIsOffer} label="En oferta" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label htmlFor="badge" className={labelClass}>Etiqueta (opcional)</label>
            <input id="badge" value={badge} onChange={(e) => setBadge(e.target.value)} maxLength={20} placeholder="Ej: ¡Oferta!, Pack, Nuevo" className={inputClass} />
          </div>
          <div>
            <label htmlFor="originalPrice" className={labelClass}>Precio anterior tachado (opcional)</label>
            <input
              id="originalPrice"
              type="number"
              inputMode="numeric"
              min={1}
              step={1}
              value={originalPrice}
              onChange={(e) => setOriginalPrice(e.target.value)}
              placeholder="Ej: 10990"
              className={inputClass}
            />
          </div>
        </div>
      </section>

      {isEdit && (
        <section className="bg-white rounded-2xl border border-red-200 p-4 sm:p-6 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-800">Eliminar producto</p>
            <p className="text-xs text-slate-500">Si solo quieres sacarlo del sitio por un tiempo, mejor ocúltalo.</p>
          </div>
          <button
            type="button"
            onClick={handleDelete}
            disabled={busy}
            className="bg-red-50 hover:bg-red-100 text-red-600 font-bold text-sm py-2.5 px-4 rounded-xl border border-red-200 disabled:opacity-50 cursor-pointer"
          >
            Eliminar
          </button>
        </section>
      )}

      {/* Barra inferior fija con los botones principales */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4">
        <div className="max-w-6xl mx-auto flex justify-end gap-3">
          <Link href="/admin/productos" className="py-3 px-5 rounded-xl font-bold text-sm text-slate-700 bg-slate-100 hover:bg-slate-200">
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={busy}
            className="py-3 px-6 rounded-xl font-bold text-sm text-white bg-[#0A4D94] hover:bg-[#083b73] disabled:opacity-60 cursor-pointer"
          >
            {isPending ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </div>
    </form>
  )
}
