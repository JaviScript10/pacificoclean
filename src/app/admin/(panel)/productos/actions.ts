'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth'
import { productFormSchema, type ProductInput } from '@/lib/validations'
import { slugify } from '@/lib/slugify'

type ActionResult = { error?: string }

const BUCKET = 'productos'
const NO_ID = '00000000-0000-0000-0000-000000000000'

function revalidateAll() {
  revalidatePath('/')                 // regenera la página pública
  revalidatePath('/admin', 'layout')  // refresca listas y contadores del panel
}

// ---------- Interruptores de la lista ----------

async function updateFlag(id: string, field: 'is_active' | 'is_offer', value: boolean): Promise<ActionResult> {
  const { supabase } = await requireAdmin()

  const { data, error } = await supabase
    .from('products')
    .update({ [field]: value, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('id')

  if (error) return { error: error.message }
  if (!data?.length) return { error: 'Sin permiso para modificar este producto' }

  revalidateAll()
  return {}
}

export async function setProductActive(id: string, value: boolean) {
  return updateFlag(id, 'is_active', value)
}

export async function setProductOffer(id: string, value: boolean) {
  return updateFlag(id, 'is_offer', value)
}

// ---------- Crear / editar ----------

export async function saveProduct(input: ProductInput): Promise<ActionResult & { id?: string }> {
  const { supabase } = await requireAdmin()

  const parsed = productFormSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }
  const p = parsed.data

  const variants = p.variants.map((v, i) => ({ name: v.name || null, price: v.price, sort_order: i }))
  if (variants.length > 1 && variants.some((v) => !v.name)) {
    return { error: 'Cuando hay varias opciones, cada una necesita un nombre (ej: 1 Litro, 5 Litros)' }
  }

  // Slug único (se usa como identificador legible del producto)
  let slug = slugify(p.name) || 'producto'
  const { data: clash } = await supabase
    .from('products')
    .select('id')
    .eq('slug', slug)
    .neq('id', p.id ?? NO_ID)
    .maybeSingle()
  if (clash) slug = `${slug}-${Date.now().toString(36)}`

  const row = {
    name: p.name,
    slug,
    description: p.description || null,
    category_id: p.categoryId,
    image_path: p.imagePath,
    badge: p.badge || null,
    original_price: p.originalPrice,
    is_offer: p.isOffer,
    is_active: p.isActive,
    updated_at: new Date().toISOString(),
  }

  let productId: string
  let oldImage: string | null = null

  if (p.id) {
    const { data: current } = await supabase.from('products').select('image_path').eq('id', p.id).maybeSingle()
    oldImage = current?.image_path ?? null

    const { data, error } = await supabase.from('products').update(row).eq('id', p.id).select('id')
    if (error) return { error: error.message }
    if (!data?.length) return { error: 'Producto no encontrado o sin permiso' }
    productId = p.id
  } else {
    // Los productos nuevos quedan al final del catálogo
    const { data: last } = await supabase
      .from('products')
      .select('sort_order')
      .order('sort_order', { ascending: false })
      .limit(1)
      .maybeSingle()

    const { data, error } = await supabase
      .from('products')
      .insert({ ...row, sort_order: (last?.sort_order ?? 0) + 1 })
      .select('id')
      .single()
    if (error || !data) return { error: error?.message ?? 'No se pudo crear el producto' }
    productId = data.id
  }

  // Variantes: se reemplazan completas
  const { error: delError } = await supabase.from('product_variants').delete().eq('product_id', productId)
  if (delError) return { error: delError.message }

  const { error: varError } = await supabase
    .from('product_variants')
    .insert(variants.map((v) => ({ ...v, product_id: productId })))
  if (varError) return { error: varError.message }

  // Si se cambió la foto, se borra la anterior del Storage
  if (oldImage && oldImage !== p.imagePath) {
    await supabase.storage.from(BUCKET).remove([oldImage])
  }

  revalidateAll()
  return { id: productId }
}

// ---------- Eliminar ----------

export async function deleteProduct(id: string): Promise<ActionResult> {
  const { supabase } = await requireAdmin()

  const { data: current } = await supabase.from('products').select('image_path').eq('id', id).maybeSingle()

  // Las variantes se borran solas (on delete cascade)
  const { data, error } = await supabase.from('products').delete().eq('id', id).select('id')
  if (error) return { error: error.message }
  if (!data?.length) return { error: 'Producto no encontrado o sin permiso' }

  if (current?.image_path) {
    await supabase.storage.from(BUCKET).remove([current.image_path])
  }

  revalidateAll()
  return {}
}
