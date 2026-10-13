import { NextResponse } from 'next/server'
import { supabasePublic } from '@/lib/supabase/public'

// Vercel llama a esta ruta una vez al día para que Supabase no pause el proyecto
export async function GET(request: Request) {
  // Solo Vercel puede ejecutarla (envía el CRON_SECRET en la cabecera)
  const secret = process.env.CRON_SECRET
  if (secret && request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  const { error } = await supabasePublic.from('categories').select('id').limit(1)
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, at: new Date().toISOString() })
}