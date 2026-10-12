import type { NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/proxy'

// Next 16: este archivo reemplaza a middleware.ts
export async function proxy(request: NextRequest) {
  return updateSession(request)
}

// Solo se ejecuta en /admin: la página pública sigue siendo estática
export const config = {
  matcher: ['/admin/:path*'],
}
