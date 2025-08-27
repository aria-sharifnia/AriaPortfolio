import { ImageResponse } from '@vercel/og'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const title = searchParams.get('title') ?? 'Aria Sharifnia'
  const subtitle =
    searchParams.get('subtitle') ?? 'Computer Science student & full-stack developer in Calgary'

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '1200px',
          height: '630px',
          background: 'linear-gradient(135deg,#0b2945 0%,#143d66 60%,#1c4e85 100%)',
          color: 'white',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '64px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontSize: 72, fontWeight: 800, letterSpacing: -1 }}>{title}</div>
          <div style={{ fontSize: 34, opacity: 0.95 }}>{subtitle}</div>
          <div style={{ fontSize: 22, opacity: 0.75 }}>
            React • TypeScript • Flutter • REST APIs
          </div>
          <div style={{ marginTop: 24, fontSize: 18, opacity: 0.5 }}>aria.binarybridges.ca</div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
