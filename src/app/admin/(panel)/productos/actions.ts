'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth'

type ActionResult = { error?: string }

async function updateFlag(
  id: string,
  field: 'is_active' | 'is_offer',
  value: boolean
): Promise<ActionResult> {
  const { supabase } = await requireAdmin()

  const { data, error } = await supabase
    .from('products')
    .update({ [field]: value, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('id')

  if (error) return { error: error.message }
  // Si RLS bloquea la escritura, Supabase no da error pero no actualiza filas
  if (!data?.length) return { error: 'Sin permiso para modificar este producto' }

  revalidatePath('/')                  // regenera la página pública
  revalidatePath('/admin', 'layout')   // refresca los contadores del panel
  return {}
}

export async function setProductActive(id: string, value: boolean) {
  return updateFlag(id, 'is_active', value)
}

export async function setProductOffer(id: string, value: boolean) {
  return updateFlag(id, 'is_offer', value)
}
