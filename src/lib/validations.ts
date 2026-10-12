import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
})

export const productFormSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres').max(120, 'El nombre es demasiado largo'),
  categoryId: z.string().uuid('Selecciona una categoría'),
  description: z.string().trim().max(1000, 'La descripción es demasiado larga'),
  badge: z.string().trim().max(20, 'La etiqueta debe tener máximo 20 caracteres'),
  originalPrice: z.number().int('El precio anterior debe ser un número entero').positive('El precio anterior debe ser mayor a 0').nullable(),
  isOffer: z.boolean(),
  isActive: z.boolean(),
  imagePath: z.string().nullable(),
  variants: z
    .array(
      z.object({
        name: z.string().trim().max(80, 'El nombre de la opción es demasiado largo'),
        price: z.number().int('Los precios deben ser números enteros').positive('Cada precio debe ser mayor a 0'),
      })
    )
    .min(1, 'Agrega al menos un precio'),
})

export type ProductInput = z.infer<typeof productFormSchema>
