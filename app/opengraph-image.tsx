import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Lumeries - Personalisiertes Mondposter';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 50%, #0a0a1a 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {/* Stars background */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(2px 2px at 20px 30px, white, transparent), radial-gradient(2px 2px at 40px 70px, rgba(255,255,255,0.8), transparent), radial-gradient(1px 1px at 90px 40px, white, transparent), radial-gradient(2px 2px at 130px 80px, rgba(255,255,255,0.6), transparent), radial-gradient(1px 1px at 160px 120px, white, transparent)',
            backgroundSize: '200px 150px',
          }}
        />

        {/* Moon */}
        <div
          style={{
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 30% 30%, #f5f5f5, #c0c0c0, #808080)',
            boxShadow: '0 0 60px rgba(255, 255, 255, 0.3), inset -20px -20px 40px rgba(0,0,0,0.3)',
            marginBottom: 40,
          }}
        />

        {/* Text */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            color: 'white',
            textAlign: 'center',
          }}
        >
          <h1
            style={{
              fontSize: 56,
              fontWeight: 'bold',
              margin: 0,
              marginBottom: 16,
              letterSpacing: '-1px',
            }}
          >
            Personalisiertes Mondposter
          </h1>
          <p
            style={{
              fontSize: 28,
              margin: 0,
              opacity: 0.8,
              maxWidth: 800,
            }}
          >
            Die exakte Mondphase von eurem besonderen Tag
          </p>
          <div
            style={{
              marginTop: 32,
              padding: '12px 32px',
              background: 'rgba(59, 130, 246, 0.9)',
              borderRadius: 8,
              fontSize: 24,
              fontWeight: 'bold',
            }}
          >
            KOSTENLOS erstellen
          </div>
        </div>

        {/* Brand */}
        <div
          style={{
            position: 'absolute',
            bottom: 30,
            right: 40,
            fontSize: 24,
            color: 'rgba(255,255,255,0.6)',
            fontWeight: 'bold',
          }}
        >
          lumeries.com
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
