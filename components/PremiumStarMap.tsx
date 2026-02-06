'use client';

import { useEffect, useState } from 'react';

type PremiumStarMapProps = {
  title: string;
  subtitle: string;
  date: string;
  location: string;
  coordinates?: string;
  names?: string;
  style?: 'dark' | 'navy' | 'midnight';
};

// Star catalog - brightest stars
const BRIGHT_STARS = [
  { name: 'Sirius', ra: 6.75, dec: -16.72, mag: -1.46 },
  { name: 'Canopus', ra: 6.4, dec: -52.7, mag: -0.72 },
  { name: 'Arcturus', ra: 14.26, dec: 19.18, mag: -0.04 },
  { name: 'Vega', ra: 18.62, dec: 38.78, mag: 0.03 },
  { name: 'Capella', ra: 5.28, dec: 46.0, mag: 0.08 },
  { name: 'Rigel', ra: 5.24, dec: -8.2, mag: 0.12 },
  { name: 'Procyon', ra: 7.65, dec: 5.22, mag: 0.34 },
  { name: 'Betelgeuse', ra: 5.92, dec: 7.41, mag: 0.42 },
  { name: 'Altair', ra: 19.85, dec: 8.87, mag: 0.77 },
  { name: 'Aldebaran', ra: 4.6, dec: 16.51, mag: 0.85 },
  { name: 'Antares', ra: 16.49, dec: -26.43, mag: 0.96 },
  { name: 'Spica', ra: 13.42, dec: -11.16, mag: 0.97 },
  { name: 'Pollux', ra: 7.76, dec: 28.03, mag: 1.14 },
  { name: 'Fomalhaut', ra: 22.96, dec: -29.62, mag: 1.16 },
  { name: 'Deneb', ra: 20.69, dec: 45.28, mag: 1.25 },
  { name: 'Regulus', ra: 10.14, dec: 11.97, mag: 1.35 },
  { name: 'Polaris', ra: 2.53, dec: 89.26, mag: 1.98 },
];

// Constellation lines
const CONSTELLATIONS = [
  { stars: [[5.92, 7.41], [5.24, -8.2], [5.42, -1.2], [5.68, -1.94]], name: 'Orion' },
  { stars: [[11.06, 61.75], [11.03, 56.38], [11.9, 53.69], [12.26, 57.03], [12.9, 55.96], [13.4, 54.93], [13.79, 49.31]], name: 'Big Dipper' },
  { stars: [[0.15, 59.15], [0.68, 56.54], [0.95, 60.72], [1.43, 60.24], [1.91, 63.67]], name: 'Cassiopeia' },
];

function generateBackgroundStars(seed: number, count: number = 500) {
  const stars = [];
  for (let i = 0; i < count; i++) {
    const random = Math.sin(seed + i * 12345) * 10000;
    stars.push({
      x: Math.abs((random * 17) % 360),
      y: Math.abs((random * 23) % 180) - 90,
      size: 0.2 + Math.abs((random * 7) % 1.5),
      opacity: 0.15 + Math.abs((random * 11) % 0.6),
    });
  }
  return stars;
}

function getSiderealTime(date: Date, longitude: number): number {
  const J2000 = new Date('2000-01-01T12:00:00Z').getTime();
  const days = (date.getTime() - J2000) / (1000 * 60 * 60 * 24);
  const T = days / 36525;
  let GMST = 280.46061837 + 360.98564736629 * days + 0.000387933 * T * T;
  GMST = GMST % 360;
  if (GMST < 0) GMST += 360;
  let LST = GMST + longitude;
  LST = LST % 360;
  if (LST < 0) LST += 360;
  return LST;
}

function raDecToAltAz(ra: number, dec: number, lat: number, lst: number) {
  const raRad = (ra * 15 - lst) * Math.PI / 180;
  const decRad = dec * Math.PI / 180;
  const latRad = lat * Math.PI / 180;
  const sinAlt = Math.sin(decRad) * Math.sin(latRad) + Math.cos(decRad) * Math.cos(latRad) * Math.cos(raRad);
  const alt = Math.asin(sinAlt);
  const cosAz = (Math.sin(decRad) - Math.sin(alt) * Math.sin(latRad)) / (Math.cos(alt) * Math.cos(latRad));
  let az = Math.acos(Math.max(-1, Math.min(1, cosAz)));
  if (Math.sin(raRad) > 0) az = 2 * Math.PI - az;
  return { alt: alt * 180 / Math.PI, az: az * 180 / Math.PI };
}

function altAzToXY(alt: number, az: number, centerX: number, centerY: number, radius: number) {
  if (alt < 0) return null;
  const r = radius * (90 - alt) / 90;
  const azRad = az * Math.PI / 180;
  return { x: centerX + r * Math.sin(azRad), y: centerY - r * Math.cos(azRad) };
}

function parseCoordinates(coordString?: string): { lat: number; lng: number } | null {
  if (!coordString) return null;
  const match = coordString.match(/(-?\d+\.?\d*)°?\s*([NS])?\s*,?\s*(-?\d+\.?\d*)°?\s*([EW])?/i);
  if (match) {
    let lat = parseFloat(match[1]);
    let lng = parseFloat(match[3] || match[2]);
    if (match[2]?.toUpperCase() === 'S') lat = -lat;
    if (match[4]?.toUpperCase() === 'W') lng = -lng;
    return { lat, lng };
  }
  return null;
}

export default function PremiumStarMap({
  title,
  subtitle,
  date,
  location,
  coordinates,
  names,
  style = 'midnight'
}: PremiumStarMapProps) {
  const [parsedDate, setParsedDate] = useState<Date>(new Date());

  // Parse coordinates
  const parsed = parseCoordinates(coordinates);
  let latitude = parsed?.lat ?? 52.52;
  let longitude = parsed?.lng ?? 13.405;

  // Guess from location
  if (!parsed && location) {
    const loc = location.toLowerCase();
    if (loc.includes('berlin')) { latitude = 52.52; longitude = 13.405; }
    else if (loc.includes('paris')) { latitude = 48.8566; longitude = 2.3522; }
    else if (loc.includes('new york')) { latitude = 40.7128; longitude = -74.006; }
    else if (loc.includes('london')) { latitude = 51.5074; longitude = -0.1278; }
    else if (loc.includes('münchen') || loc.includes('munich')) { latitude = 48.1351; longitude = 11.582; }
    else if (loc.includes('hamburg')) { latitude = 53.5511; longitude = 9.9937; }
    else if (loc.includes('köln') || loc.includes('cologne')) { latitude = 50.9375; longitude = 6.9603; }
    else if (loc.includes('wien') || loc.includes('vienna')) { latitude = 48.2082; longitude = 16.3738; }
  }

  useEffect(() => {
    try {
      const parsed = new Date(date);
      if (!isNaN(parsed.getTime())) {
        setParsedDate(parsed);
      }
    } catch {
      // Keep current date
    }
  }, [date]);

  const lst = getSiderealTime(parsedDate, longitude);
  const centerX = 250;
  const centerY = 250;
  const radius = 200;
  const seed = parsedDate.getTime();
  const backgroundStars = generateBackgroundStars(seed, 600);

  // Color schemes
  const colors = {
    dark: {
      bg: '#0a0a0f',
      starfield: '#0d0d15',
      ring: '#1a1a25',
      accent: '#d4af37',
      text: '#ffffff',
      textSecondary: '#b8b8c8',
      textMuted: '#6a6a7a'
    },
    navy: {
      bg: '#0a0f1a',
      starfield: '#0d1420',
      ring: '#1a2535',
      accent: '#c9a227',
      text: '#ffffff',
      textSecondary: '#a8b8d0',
      textMuted: '#5a6a8a'
    },
    midnight: {
      bg: '#05080f',
      starfield: '#080c18',
      ring: '#101828',
      accent: '#d4a84b',
      text: '#ffffff',
      textSecondary: '#9aa8c0',
      textMuted: '#4a5a70'
    }
  };

  const c = colors[style];

  // Calculate visible stars
  const visibleStars = BRIGHT_STARS.map(star => {
    const altAz = raDecToAltAz(star.ra, star.dec, latitude, lst);
    const pos = altAzToXY(altAz.alt, altAz.az, centerX, centerY, radius);
    if (!pos) return null;
    const size = Math.max(1.5, 5 - star.mag);
    return { ...star, x: pos.x, y: pos.y, size };
  }).filter(Boolean);

  // Constellation paths
  const constellationPaths = CONSTELLATIONS.map(constellation => {
    const points = constellation.stars.map(([ra, dec]) => {
      const altAz = raDecToAltAz(ra, dec, latitude, lst);
      return altAzToXY(altAz.alt, altAz.az, centerX, centerY, radius);
    }).filter(Boolean);
    if (points.length < 2) return null;
    return {
      name: constellation.name,
      path: points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p!.x} ${p!.y}`).join(' ')
    };
  }).filter(Boolean);

  // Format date nicely
  const formattedDate = parsedDate.toLocaleDateString('de-DE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <svg
      viewBox="0 0 500 700"
      className="w-full h-full"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Gradient for starfield */}
        <radialGradient id="starfieldGradient" cx="50%" cy="36%" r="50%">
          <stop offset="0%" stopColor={c.starfield} />
          <stop offset="100%" stopColor={c.bg} />
        </radialGradient>

        {/* Gold gradient for decorative elements */}
        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#b8860b" />
          <stop offset="50%" stopColor="#d4af37" />
          <stop offset="100%" stopColor="#b8860b" />
        </linearGradient>

        {/* Clip path for circular star map */}
        <clipPath id="starClip">
          <circle cx={centerX} cy={centerY} r={radius} />
        </clipPath>

        {/* Glow filter for stars */}
        <filter id="starGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Background */}
      <rect width="500" height="700" fill={c.bg} />

      {/* Decorative border */}
      <rect
        x="15"
        y="15"
        width="470"
        height="670"
        fill="none"
        stroke={c.ring}
        strokeWidth="1"
      />

      {/* Star map circle background */}
      <circle cx={centerX} cy={centerY} r={radius + 5} fill={c.ring} />
      <circle cx={centerX} cy={centerY} r={radius} fill="url(#starfieldGradient)" />

      {/* Background stars */}
      <g clipPath="url(#starClip)">
        {backgroundStars.map((star, i) => {
          const altAz = raDecToAltAz(star.x / 15, star.y, latitude, lst);
          const pos = altAzToXY(altAz.alt, altAz.az, centerX, centerY, radius);
          if (!pos) return null;
          return (
            <circle
              key={`bg-${i}`}
              cx={pos.x}
              cy={pos.y}
              r={star.size}
              fill="#ffffff"
              opacity={star.opacity}
            />
          );
        })}
      </g>

      {/* Constellation lines */}
      <g clipPath="url(#starClip)">
        {constellationPaths.map((c, i) => (
          <path
            key={`const-${i}`}
            d={c!.path}
            stroke="#4a6090"
            strokeWidth="0.6"
            fill="none"
            opacity="0.4"
          />
        ))}
      </g>

      {/* Bright stars with glow */}
      <g clipPath="url(#starClip)" filter="url(#starGlow)">
        {visibleStars.map((star, i) => (
          <circle
            key={`star-${i}`}
            cx={star!.x}
            cy={star!.y}
            r={star!.size}
            fill="#ffffff"
          />
        ))}
      </g>

      {/* Circular frame - decorative rings */}
      <circle
        cx={centerX}
        cy={centerY}
        r={radius + 2}
        fill="none"
        stroke={c.accent}
        strokeWidth="0.5"
        opacity="0.3"
      />
      <circle
        cx={centerX}
        cy={centerY}
        r={radius + 8}
        fill="none"
        stroke={c.accent}
        strokeWidth="0.5"
        opacity="0.2"
      />

      {/* Compass points */}
      <g fill={c.textMuted} fontSize="10" fontFamily="Arial, sans-serif" letterSpacing="1">
        <text x={centerX} y={centerY - radius - 15} textAnchor="middle">N</text>
        <text x={centerX} y={centerY + radius + 22} textAnchor="middle">S</text>
        <text x={centerX + radius + 15} y={centerY + 4} textAnchor="middle">O</text>
        <text x={centerX - radius - 15} y={centerY + 4} textAnchor="middle">W</text>
      </g>

      {/* Decorative line above title */}
      <line
        x1="100"
        y1="490"
        x2="400"
        y2="490"
        stroke="url(#goldGradient)"
        strokeWidth="1"
        opacity="0.5"
      />

      {/* Small decorative star */}
      <text
        x="250"
        y="498"
        textAnchor="middle"
        fill={c.accent}
        fontSize="8"
      >
        ★
      </text>

      {/* Main Title */}
      <text
        x="250"
        y="535"
        textAnchor="middle"
        fill={c.text}
        fontSize="26"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontWeight="400"
        letterSpacing="2"
      >
        {title}
      </text>

      {/* Names or Subtitle */}
      {names ? (
        <text
          x="250"
          y="565"
          textAnchor="middle"
          fill={c.accent}
          fontSize="18"
          fontFamily="Georgia, 'Times New Roman', serif"
          fontStyle="italic"
        >
          {names}
        </text>
      ) : (
        <text
          x="250"
          y="565"
          textAnchor="middle"
          fill={c.textSecondary}
          fontSize="14"
          fontFamily="Georgia, 'Times New Roman', serif"
          fontStyle="italic"
        >
          {subtitle}
        </text>
      )}

      {/* Date */}
      <text
        x="250"
        y="600"
        textAnchor="middle"
        fill={c.text}
        fontSize="14"
        fontFamily="Arial, sans-serif"
        letterSpacing="3"
      >
        {formattedDate}
      </text>

      {/* Location */}
      <text
        x="250"
        y="625"
        textAnchor="middle"
        fill={c.textMuted}
        fontSize="11"
        fontFamily="Arial, sans-serif"
        letterSpacing="1"
      >
        {location}
      </text>

      {/* Coordinates */}
      {coordinates && (
        <text
          x="250"
          y="645"
          textAnchor="middle"
          fill={c.textMuted}
          fontSize="9"
          fontFamily="'Courier New', monospace"
          letterSpacing="1"
          opacity="0.7"
        >
          {coordinates}
        </text>
      )}

      {/* Decorative line below */}
      <line
        x1="150"
        y1="665"
        x2="350"
        y2="665"
        stroke="url(#goldGradient)"
        strokeWidth="1"
        opacity="0.3"
      />


      {/* Corner decorations */}
      <g stroke={c.accent} strokeWidth="0.5" fill="none" opacity="0.3">
        <path d="M 25,25 L 25,50 M 25,25 L 50,25" />
        <path d="M 475,25 L 475,50 M 475,25 L 450,25" />
        <path d="M 25,675 L 25,650 M 25,675 L 50,675" />
        <path d="M 475,675 L 475,650 M 475,675 L 450,675" />
      </g>
    </svg>
  );
}
