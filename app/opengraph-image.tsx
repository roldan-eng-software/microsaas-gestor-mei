import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'linear-gradient(120deg, #F8FAFC 0%, #ECFDF5 60%, #FEF3C7 100%)',
          padding: '64px',
          color: '#1E293B',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ fontSize: 24, fontWeight: 600 }}>MEI Organizado</div>
        <div style={{ fontSize: 64, fontWeight: 800, lineHeight: 1.1 }}>
          Organize seu MEI em 5 minutos
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div
            style={{
              background: '#10B981',
              color: '#ffffff',
              padding: '14px 24px',
              borderRadius: 999,
              fontSize: 22,
              fontWeight: 700,
            }}
          >
            7 dias gratis
          </div>
          <div style={{ fontSize: 22 }}>R$19 por mes. Tudo em 1 lugar.</div>
        </div>
      </div>
    ),
    size,
  )
}
