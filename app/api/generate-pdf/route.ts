import { NextResponse } from 'next/server';

// Generate star positions for a given date (simplified version)
function generateStars(date: string): string {
  const seed = new Date(date).getTime();
  let stars = '';

  // Generate random stars based on date seed
  for (let i = 0; i < 200; i++) {
    const random = Math.sin(seed + i * 12345) * 10000;
    const x = Math.abs((random * 17) % 400);
    const y = Math.abs((random * 23) % 400);
    const r = 0.5 + Math.abs((random * 7) % 2);
    const opacity = 0.3 + Math.abs((random * 11) % 0.7);
    stars += `<circle cx="${x}" cy="${y}" r="${r}" fill="white" opacity="${opacity}"/>`;
  }

  return stars;
}

function generateStarMapSVG(title: string, subtitle: string, date: string, location: string, coordinates: string): string {
  const stars = generateStars(date);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="400" height="500">
  <defs>
    <radialGradient id="skyGradient" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stopColor="#1a1a2e"/>
      <stop offset="100%" stopColor="#0a0a15"/>
    </radialGradient>
  </defs>

  <rect width="400" height="500" fill="#0a0a15"/>

  <circle cx="200" cy="220" r="160" fill="url(#skyGradient)" stroke="#333" strokeWidth="2"/>

  <g transform="translate(40, 60)">
    ${stars}
  </g>

  <text x="200" y="420" textAnchor="middle" fill="white" fontSize="24" fontFamily="Georgia, serif" fontWeight="bold">${title}</text>
  <text x="200" y="445" textAnchor="middle" fill="#888" fontSize="14" fontFamily="Georgia, serif">${subtitle}</text>
  <text x="200" y="470" textAnchor="middle" fill="#666" fontSize="12" fontFamily="Arial, sans-serif">${location} • ${new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</text>
  ${coordinates ? `<text x="200" y="490" textAnchor="middle" fill="#555" fontSize="10" fontFamily="Arial, sans-serif">${coordinates}</text>` : ''}
</svg>`;
}

function generateSpotifySVG(songTitle: string, artist: string, customText: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="400" height="500">
  <rect width="400" height="500" fill="#191414"/>

  <rect x="50" y="50" width="300" height="300" rx="8" fill="#282828"/>

  <circle cx="200" cy="200" r="100" fill="#1DB954" opacity="0.3"/>
  <circle cx="200" cy="200" r="60" fill="#1DB954" opacity="0.5"/>
  <circle cx="200" cy="200" r="20" fill="#1DB954"/>

  <text x="200" y="390" textAnchor="middle" fill="white" fontSize="20" fontFamily="Arial, sans-serif" fontWeight="bold">${songTitle}</text>
  <text x="200" y="415" textAnchor="middle" fill="#b3b3b3" fontSize="14" fontFamily="Arial, sans-serif">${artist}</text>

  <rect x="50" y="440" width="300" height="4" rx="2" fill="#404040"/>
  <rect x="50" y="440" width="180" height="4" rx="2" fill="#1DB954"/>
  <circle cx="230" cy="442" r="6" fill="white"/>

  ${customText ? `<text x="200" y="480" textAnchor="middle" fill="#666" fontSize="12" fontFamily="Georgia, serif" fontStyle="italic">"${customText}"</text>` : ''}
</svg>`;
}

function generateCoordinatesSVG(title: string, subtitle: string, latitude: string, longitude: string, date: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="400" height="500">
  <rect width="400" height="500" fill="#1a1a2e"/>

  <circle cx="200" cy="200" r="120" fill="none" stroke="#333" strokeWidth="1"/>
  <circle cx="200" cy="200" r="80" fill="none" stroke="#333" strokeWidth="1"/>
  <circle cx="200" cy="200" r="40" fill="none" stroke="#333" strokeWidth="1"/>
  <line x1="80" y1="200" x2="320" y2="200" stroke="#333" strokeWidth="1"/>
  <line x1="200" y1="80" x2="200" y2="320" stroke="#333" strokeWidth="1"/>

  <circle cx="200" cy="200" r="8" fill="#e74c3c"/>
  <path d="M200,180 L200,160 M200,220 L200,240 M180,200 L160,200 M220,200 L240,200" stroke="#e74c3c" strokeWidth="2"/>

  <text x="200" y="380" textAnchor="middle" fill="white" fontSize="24" fontFamily="Georgia, serif" fontWeight="bold">${title}</text>
  <text x="200" y="410" textAnchor="middle" fill="#888" fontSize="14" fontFamily="Georgia, serif">${subtitle}</text>

  <text x="200" y="450" textAnchor="middle" fill="#e74c3c" fontSize="18" fontFamily="monospace" fontWeight="bold">${latitude}</text>
  <text x="200" y="475" textAnchor="middle" fill="#e74c3c" fontSize="18" fontFamily="monospace" fontWeight="bold">${longitude}</text>

  ${date ? `<text x="200" y="495" textAnchor="middle" fill="#666" fontSize="10" fontFamily="Arial, sans-serif">${new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</text>` : ''}
</svg>`;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    let svgContent = '';

    if (type === 'star_map') {
      const title = searchParams.get('title') || 'Our Love Story';
      const subtitle = searchParams.get('subtitle') || 'Where It All Began';
      const date = searchParams.get('date') || '2023-12-25';
      const location = searchParams.get('location') || 'Paris, France';
      const coordinates = searchParams.get('coordinates') || '';

      svgContent = generateStarMapSVG(title, subtitle, date, location, coordinates);
    } else if (type === 'spotify') {
      const songTitle = searchParams.get('songTitle') || 'Your Song';
      const artist = searchParams.get('artist') || 'Artist Name';
      const customText = searchParams.get('customText') || '';

      svgContent = generateSpotifySVG(songTitle, artist, customText);
    } else if (type === 'coordinates') {
      const title = searchParams.get('title') || 'Our Special Place';
      const subtitle = searchParams.get('subtitle') || 'Where memories were made';
      const latitude = searchParams.get('latitude') || '48.8566° N';
      const longitude = searchParams.get('longitude') || '2.3522° E';
      const date = searchParams.get('date') || '';

      svgContent = generateCoordinatesSVG(title, subtitle, latitude, longitude, date);
    } else {
      return NextResponse.json({ error: 'Invalid poster type' }, { status: 400 });
    }

    return new NextResponse(svgContent, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Content-Disposition': `attachment; filename="custom-poster-${type}.svg"`,
      },
    });
  } catch (error: any) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate poster', details: error.message },
      { status: 500 }
    );
  }
}
