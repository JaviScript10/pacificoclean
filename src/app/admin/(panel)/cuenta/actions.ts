'use server'

import { requireAdmin } from '@/lib/auth'

export type PasswordState = { error?: string; ok?: boolean } | undefined

export async function changePassword(_prev: PasswordState, formData: FormData): Promise<PasswordState> {
  const { supabase, user } = await requireAdmin()

  const current = String(formData.get('current') ?? '')
  const next = String(formData.get('next') ?? '')
  const confirm = String(formData.get('confirm') ?? '')

  if (!current || !next || !confirm) return { error: 'Completa los tres campos' }
  if (next.length < 10) return { error: 'La nueva contraseña debe tener al menos 10 caracteres' }
  if (!/[a-zA-Z]/.test(next) || !/\d/.test(next)) {
    return { error: 'La nueva contraseña debe tener letras y números' }
  }
  if (next !== confirm) return { error: 'La confirmación no coincide con la nueva contraseña' }
  if (next === current) return { error: 'La nueva contraseña debe ser distinta de la actual' }

  // 1. Verificar la contraseña actual (evita cambios desde una sesión abierta ajena)
  const { error: authError } = await supabase.auth.signInWithPassword({
    email: user.email!,
    password: current,
  })
  if (authError) return { error: 'La contraseña actual no es correcta' }

  // 2. Cambiarla
  const { error: updateError } = await supabase.auth.updateUser({ password: next })
  if (updateError) {
    const msg = updateError.message.toLowerCase()
    if (msg.includes('different') || msg.includes('same')) {
      return { error: 'La nueva contraseña debe ser distinta de la actual' }
    }
    if (msg.includes('weak') || msg.includes('pwned') || msg.includes('leaked')) {
      return { error: 'Esa contraseña es muy débil o aparece en filtraciones conocidas. Elige otra' }
    }
    return { error: 'No se pudo cambiar la contraseña. Intenta de nuevo' }
  }

  // 3. Cerrar la sesión en los demás dispositivos (este sigue conectado)
  await supabase.auth.signOut({ scope: 'others' })

  return { ok: true }
}
