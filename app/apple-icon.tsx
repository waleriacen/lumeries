import { ImageResponse } from 'next/og';

export const size = {
  width: 180,
  height: 180,
};
export const contentType = 'image/png';

export default function AppleIcon() {
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
          borderRadius: 32,
        }}
      >
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 30% 30%, #f5f5f5, #c0c0c0, #808080)',
            boxShadow: '0 0 40px rgba(255, 255, 255, 0.3), inset -15px -15px 30px rgba(0,0,0,0.3)',
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}
