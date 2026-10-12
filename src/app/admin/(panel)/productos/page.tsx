import { requireAdmin } from '@/lib/auth'
import { ProductList, type AdminProduct } from './product-list'

export default async function ProductosPage() {
  const { supabase } = await requireAdmin()

  // El admin ve también los productos ocultos (la política RLS lo permite)
  const { data, error } = await supabase
    .from('products')
    .select('id, name, image_path, is_active, is_offer, sort_order, categories ( name ), product_variants ( price )')
    .order('sort_order')

  if (error) throw new Error(error.message)

  const products: AdminProduct[] = (data ?? []).map((p: any) => {
    const prices: number[] = (p.product_variants ?? []).map((v: any) => v.price)
    return {
      id: p.id,
      name: p.name,
      imageUrl: p.image_path
        ? supabase.storage.from('productos').getPublicUrl(p.image_path).data.publicUrl
        : null,
      category: p.categories?.name ?? 'Sin categoría',
      isActive: p.is_active,
      isOffer: p.is_offer,
      minPrice: prices.length ? Math.min(...prices) : null,
      variantCount: prices.length,
    }
  })

  return <ProductList products={products} />
}
