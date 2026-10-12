import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// Segunda capa de seguridad: se usa en el layout del panel y en cada acción del servidor
export async function requireAdmin() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const { data: isAdmin } = await supabase.rpc('is_admin')
  if (!isAdmin) redirect('/admin/login')

  return { supabase, user }
}
