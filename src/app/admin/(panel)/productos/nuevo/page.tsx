import { requireAdmin } from '@/lib/auth'
import { ProductForm } from '../product-form'

export default async function NewProductPage() {
  const { supabase } = await requireAdmin()
  const { data: categories } = await supabase.from('categories').select('id, name').order('sort_order')

  return <ProductForm categories={categories ?? []} />
}
