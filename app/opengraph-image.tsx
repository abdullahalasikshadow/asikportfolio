import { ImageResponse } from 'next/og'

export const alt = 'Abdullah Al Asik — Statistics × Systems × Image'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          position: 'relative',
          display: 'flex',
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 72px',
          background: '#090b08',
          color: '#f0f0e7',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-150px',
            right: '-20px',
            width: '610px',
            height: '610px',
            border: '1px solid rgba(215, 247, 109, 0.32)',
            borderRadius: '50%',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '-45px',
            right: '85px',
            width: '390px',
            height: '390px',
            border: '1px solid rgba(215, 247, 109, 0.18)',
            borderRadius: '50%',
          }}
        />
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            color: '#d7f76d',
            fontSize: '17px',
            fontWeight: 600,
            letterSpacing: '4px',
          }}
        >
          <span>A/A</span>
          <span style={{ color: '#a7ae9d' }}>FIELD NOTES / 01</span>
        </div>
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span
            style={{
              fontFamily: 'Georgia, serif',
              fontSize: '118px',
              letterSpacing: '-9px',
              lineHeight: 0.88,
            }}
          >
            Abdullah
          </span>
          <span
            style={{
              color: '#d7f76d',
              fontFamily: 'Georgia, serif',
              fontSize: '118px',
              letterSpacing: '-9px',
              lineHeight: 0.88,
            }}
          >
            Al Asik.
          </span>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid rgba(240, 240, 231, 0.2)',
            paddingTop: '20px',
            color: '#a7ae9d',
            fontSize: '16px',
            letterSpacing: '3px',
            textTransform: 'uppercase',
          }}
        >
          <span>Statistics × Systems × Image</span>
          <span>Dhaka, Bangladesh</span>
        </div>
      </div>
    ),
    size,
  )
}
