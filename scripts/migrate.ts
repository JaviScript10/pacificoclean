// scripts/migrate.ts
// Migra el catálogo de src/data/legacy-products.ts a Supabase (tablas + fotos).
// Se puede ejecutar varias veces: actualiza lo existente en vez de duplicar.
// Uso: npx tsx scripts/migrate.ts

import fs from 'node:fs'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'
import { productos } from '../src/data/legacy-products'


const BUCKET = 'productos'

// Orden en que aparecerán las categorías en el sitio
const CATEGORIES = [
  'Detergentes',
  'Jabón y Lavalozas',
  'Limpieza',
  'Cloro y Desinfectantes',
  'Bolsas y Accesorios',
  'Papel Higiénico / Toallas de Papel',
  'Dispensadores',
]

// "Ofertas" deja de ser categoría: cada oferta va a su categoría real con is_offer = true
const OFFER_CATEGORY: Record<string, string> = {
  'off-1': 'Limpieza',
  'off-2': 'Limpieza',
  'off-3': 'Papel Higiénico / Toallas de Papel',
  'off-4': 'Cloro y Desinfectantes',
  'off-5': 'Limpieza',
}

const CONTENT_TYPES: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
}

function slugify(text: string) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // quita tildes
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const email = process.env.ADMIN_EMAIL
  const password = process.env.ADMIN_PASSWORD

  const missing = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'ADMIN_EMAIL', 'ADMIN_PASSWORD']
    .filter((k) => !process.env[k])
  if (missing.length) throw new Error(`Faltan en .env.local: ${missing.join(', ')}`)
  if (!url || !key || !email || !password) throw new Error('Variables incompletas')

  const supabase = createClient(url, key, { auth: { persistSession: false } })

  // 1. Iniciar sesión como admin
  const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
  if (authError) throw new Error(`Login falló: ${authError.message}`)
  console.log(`🔐 Sesión iniciada como ${email}\n`)

  // 2. Categorías
  const { data: cats, error: catError } = await supabase
    .from('categories')
    .upsert(
      CATEGORIES.map((name, i) => ({ name, slug: slugify(name), sort_order: i })),
      { onConflict: 'slug' }
    )
    .select('id, name')
  if (catError || !cats) throw new Error(`Categorías: ${catError?.message}`)

  const catId = new Map(cats.map((c) => [c.name, c.id]))
  console.log(`📁 ${cats.length} categorías listas\n`)

  // 3. Productos, fotos y variantes
  const warnings: string[] = []
  let ok = 0

  for (const [i, p] of productos.entries()) {
    const isOffer = p.cat === 'Ofertas'
    const categoryName = isOffer ? OFFER_CATEGORY[p.id] : p.cat
    const slug = slugify(p.name)

    // Foto
    let image_path: string | null = null
    const localFile = path.join(process.cwd(), 'public', p.img)

    if (fs.existsSync(localFile)) {
      const ext = path.extname(localFile).toLowerCase()
      image_path = `${slug}${ext}`
      const { error: upError } = await supabase.storage
        .from(BUCKET)
        .upload(image_path, fs.readFileSync(localFile), {
          contentType: CONTENT_TYPES[ext] ?? 'application/octet-stream',
          upsert: true,
        })
      if (upError) {
        warnings.push(`Foto de "${p.name}": ${upError.message}`)
        image_path = null
      }
    } else {
      warnings.push(`Foto no encontrada: public${p.img}`)
    }

    // Producto
    const { data: prod, error: prodError } = await supabase
      .from('products')
      .upsert(
        {
          name: p.name,
          slug,
          category_id: catId.get(categoryName) ?? null,
          image_path,
          badge: p.badge ?? null,
          original_price: p.originalPrice ?? null,
          is_offer: isOffer,
          is_active: true,
          sort_order: i,
        },
        { onConflict: 'slug' }
      )
      .select('id')
      .single()

    if (prodError || !prod) {
      warnings.push(`Producto "${p.name}": ${prodError?.message}`)
      continue
    }

    // Variantes: se reemplazan completas
    await supabase.from('product_variants').delete().eq('product_id', prod.id)

    type VariantRow = { product_id: string; name: string | null; price: number; sort_order: number }
    const variants: VariantRow[] = p.variants?.length
      ? p.variants.map((v, j) => ({ product_id: prod.id, name: v.name, price: v.price, sort_order: j }))
      : [{ product_id: prod.id, name: null, price: p.price, sort_order: 0 }]

    const { error: varError } = await supabase.from('product_variants').insert(variants)
    if (varError) {
      warnings.push(`Variantes de "${p.name}": ${varError.message}`)
      continue
    }

    ok++
    console.log(`✔ ${p.name}`)
  }

  // 4. Resumen
  console.log(`\n✅ ${ok} de ${productos.length} productos migrados`)
  if (warnings.length) {
    console.log(`\n⚠️  ${warnings.length} advertencias:`)
    warnings.forEach((w) => console.log(`   - ${w}`))
  }

  await supabase.auth.signOut()
}

main().catch((err) => {
  console.error('\n❌', err.message ?? err)
  process.exit(1)
})