import { createClient } from '@supabase/supabase-js'

// Cliente sin cookies para lectura pública: permite que la página siga siendo estática
export const supabasePublic = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { persistSession: false } }
)