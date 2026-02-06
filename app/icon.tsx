import { ImageResponse } from 'next/og';

export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

export default function Icon() {
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
          borderRadius: 6,
        }}
      >
        <div
          style={{
            width: 22,
            height: 22,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 30% 30%, #f5f5f5, #c0c0c0, #808080)',
            boxShadow: '0 0 8px rgba(255, 255, 255, 0.4)',
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}
