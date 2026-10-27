import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

// Imagen que aparece al compartir el link (WhatsApp, Facebook, etc.)
export const alt = 'PacíficoClean – Artículos de aseo y limpieza en Valparaíso'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OpengraphImage() {
  const logo = await readFile(join(process.cwd(), 'public', 'logo.png'))
  const logoSrc = `data:image/png;base64,${logo.toString('base64')}`

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 48,
          padding: 60,
          background: 'linear-gradient(135deg, #ffffff 0%, #e6f0fb 100%)',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} alt="" width={440} height={307} style={{ objectFit: 'contain' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22, flex: 1 }}>
          <div style={{ display: 'flex', fontSize: 62, fontWeight: 800, color: '#0A4D94', lineHeight: 1.08 }}>
            Artículos de aseo en Valparaíso
          </div>
          <div style={{ display: 'flex', fontSize: 30, color: '#334155' }}>
            Para hogares, empresas e instituciones
          </div>
          <div
            style={{
              display: 'flex',
              alignSelf: 'flex-start',
              fontSize: 28,
              color: '#ffffff',
              background: '#0A4D94',
              padding: '12px 26px',
              borderRadius: 16,
            }}
          >
            Pide por WhatsApp · pacificoclean.cl
          </div>
        </div>
      </div>
    ),
    size
  )
}
