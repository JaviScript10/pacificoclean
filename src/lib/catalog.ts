import { supabasePublic } from '@/lib/supabase/public'

export type Variant = {
  id: string
  name: string | null
  price: number
}

export type CatalogProduct = {
  id: string
  name: string
  slug: string
  description: string | null
  imageUrl: string | null
  badge: string | null
  originalPrice: number | null
  isOffer: boolean
  category: string | null
  variants: Variant[]
}

export type Settings = {
  whatsapp: string
  shipping: Record<string, number>
}

export type Catalog = {
  products: CatalogProduct[]
  categories: string[]
  settings: Settings
}

const DEFAULT_SETTINGS: Settings = {
  whatsapp: '56959406597',
  shipping: { 'Valparaíso': 0, 'Viña del Mar': 2000, 'Concón': 3000, 'Quilpué': 3000 },
}

export async function getCatalog(): Promise<Catalog> {
  const [productsRes, categoriesRes, settingsRes] = await Promise.all([
    supabasePublic
      .from('products')
      .select(`
        id, name, slug, description, image_path, badge, original_price, is_offer, sort_order,
        categories ( name ),
        product_variants ( id, name, price, sort_order )
      `)
      .eq('is_active', true)
      .order('sort_order'),
    supabasePublic.from('categories').select('name').order('sort_order'),
    supabasePublic.from('settings').select('key, value'),
  ])

  // Si algo falla, lanzamos error: Next conserva la última versión buena de la página
  if (productsRes.error) throw new Error(`Productos: ${productsRes.error.message}`)
  if (categoriesRes.error) throw new Error(`Categorías: ${categoriesRes.error.message}`)
  if (settingsRes.error) throw new Error(`Configuración: ${settingsRes.error.message}`)

  const products: CatalogProduct[] = (productsRes.data ?? []).map((p: any) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    imageUrl: p.image_path
      ? supabasePublic.storage.from('productos').getPublicUrl(p.image_path).data.publicUrl
      : null,
    badge: p.badge,
    originalPrice: p.original_price,
    isOffer: p.is_offer,
    category: p.categories?.name ?? null,
    variants: [...(p.product_variants ?? [])]
      .sort((a: any, b: any) => a.sort_order - b.sort_order)
      .map((v: any) => ({ id: v.id, name: v.name, price: v.price })),
  }))

  const settings: Settings = { ...DEFAULT_SETTINGS }
  for (const row of settingsRes.data ?? []) {
    if (row.key === 'whatsapp') settings.whatsapp = row.value
    if (row.key === 'shipping') settings.shipping = row.value
  }

  return {
    products,
    categories: (categoriesRes.data ?? []).map((c) => c.name),
    settings,
  }
}