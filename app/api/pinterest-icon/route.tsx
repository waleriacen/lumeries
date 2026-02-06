import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 100%)',
        }}
      >
        {/* Moon */}
        <div
          style={{
            width: 280,
            height: 280,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 30% 30%, #f5f5f5, #c0c0c0, #808080)',
            boxShadow: '0 0 80px rgba(255, 255, 255, 0.4), inset -30px -30px 60px rgba(0,0,0,0.3)',
          }}
        />
      </div>
    ),
    {
      width: 400,
      height: 400,
    }
  );
}
