import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
})

export const categorySchema = z.object({
  name: z.string().min(2, 'El nombre es obligatorio'),
  slug: z.string().min(2, 'El slug es obligatorio'),
  image_url: z.string().optional().nullable(),
})

export const productSchema = z.object({
  name: z.string().min(2, 'El nombre del producto es obligatorio'),
  slug: z.string().min(2, 'El slug es obligatorio'),
  description: z.string().optional().nullable(),
  price: z.coerce.number().positive('El precio debe ser mayor a 0'),
  stock: z.coerce.number().int().min(0, 'El stock no puede ser negativo'),
  category_id: z.string().uuid('Selecciona una categoría válida'),
  is_active: z.boolean().default(true),
  is_featured: z.boolean().default(false),
  is_offer: z.boolean().default(false),
})