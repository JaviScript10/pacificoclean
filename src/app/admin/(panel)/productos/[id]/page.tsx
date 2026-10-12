import { notFound } from 'next/navigation'
import { requireAdmin } from '@/lib/auth'
import { ProductForm, type ProductFormInitial } from '../product-form'

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { supabase } = await requireAdmin()

  const [productRes, categoriesRes] = await Promise.all([
    supabase
      .from('products')
      .select('id, name, description, category_id, image_path, badge, original_price, is_offer, is_active, product_variants ( name, price, sort_order )')
      .eq('id', id)
      .maybeSingle(),
    supabase.from('categories').select('id, name').order('sort_order'),
  ])

  const p: any = productRes.data
  if (!p) notFound()

  const initial: ProductFormInitial = {
    id: p.id,
    name: p.name,
    categoryId: p.category_id ?? '',
    description: p.description ?? '',
    badge: p.badge ?? '',
    originalPrice: p.original_price,
    isOffer: p.is_offer,
    isActive: p.is_active,
    imagePath: p.image_path,
    imageUrl: p.image_path
      ? supabase.storage.from('productos').getPublicUrl(p.image_path).data.publicUrl
      : null,
    variants: [...(p.product_variants ?? [])]
      .sort((a: any, b: any) => a.sort_order - b.sort_order)
      .map((v: any) => ({ name: v.name ?? '', price: v.price })),
  }

  return <ProductForm categories={categoriesRes.data ?? []} initial={initial} />
}
