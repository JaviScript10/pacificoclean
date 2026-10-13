'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth'

const settingsSchema = z.object({
  whatsapp: z
    .string()
    .regex(/^\d{10,13}$/, 'El WhatsApp debe tener solo números, con código de país (ej: 56912345678)'),
  shipping: z
    .array(
      z.object({
        city: z.string().trim().min(2, 'Cada comuna necesita un nombre').max(40, 'Nombre de comuna demasiado largo'),
        cost: z.number().int('Los costos deben ser números enteros').min(0, 'Los costos no pueden ser negativos'),
      })
    )
    .min(1, 'Agrega al menos una comuna de despacho'),
})

export type SettingsInput = z.infer<typeof settingsSchema>

export async function saveSettings(input: SettingsInput): Promise<{ error?: string }> {
  const { supabase } = await requireAdmin()

  const parsed = settingsSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }

  const { whatsapp, shipping } = parsed.data

  const names = shipping.map((s) => s.city.toLowerCase())
  if (new Set(names).size !== names.length) return { error: 'Hay comunas repetidas' }

  const shippingObj = Object.fromEntries(shipping.map((s) => [s.city, s.cost]))

  const { data, error } = await supabase
    .from('settings')
    .upsert([
      { key: 'whatsapp', value: whatsapp },
      { key: 'shipping', value: shippingObj },
    ])
    .select('key')

  if (error) return { error: error.message }
  if (!data?.length) return { error: 'Sin permiso para guardar la configuración' }

  revalidatePath('/')
  revalidatePath('/admin', 'layout')
  return {}
}
