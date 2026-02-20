import { ImageResponse } from 'next/og'

export const alt = 'Shiftely - AI-Powered Shift Scheduling for Small Businesses'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0c0a09',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 24,
            padding: 80,
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: 700,
              color: '#fafaf9',
              letterSpacing: '-0.02em',
            }}
          >
            Shiftely
          </div>
          <div
            style={{
              fontSize: 28,
              color: '#d6d3d1',
              textAlign: 'center',
              maxWidth: 700,
              lineHeight: 1.4,
            }}
          >
            AI-powered shift scheduling for small businesses. Generate schedules in minutes, not hours.
          </div>
          <div
            style={{
              display: 'flex',
              padding: '12px 20px',
              backgroundColor: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: 9999,
              fontSize: 18,
              color: '#fbbf24',
            }}
          >
            7-day free trial · No spreadsheets
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
