'use client';

import { useEffect, useRef, useState } from 'react';

type RealStarMapProps = {
  title: string;
  subtitle: string;
  date: string;
  location: string;
  coordinates?: string;
  latitude?: number;
  longitude?: number;
};

// Star catalog - brightest stars visible to naked eye (subset of Hipparcos)
const BRIGHT_STARS = [
  // Name, RA (hours), Dec (degrees), Magnitude
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
  { name: 'Castor', ra: 7.58, dec: 31.89, mag: 1.58 },
  { name: 'Polaris', ra: 2.53, dec: 89.26, mag: 1.98 },
];

// Constellation lines (simplified - connecting major stars)
const CONSTELLATIONS = [
  // Orion
  { stars: [[5.92, 7.41], [5.24, -8.2], [5.42, -1.2], [5.68, -1.94]], name: 'Orion' },
  // Big Dipper (Ursa Major)
  { stars: [[11.06, 61.75], [11.03, 56.38], [11.9, 53.69], [12.26, 57.03], [12.9, 55.96], [13.4, 54.93], [13.79, 49.31]], name: 'Big Dipper' },
  // Cassiopeia
  { stars: [[0.15, 59.15], [0.68, 56.54], [0.95, 60.72], [1.43, 60.24], [1.91, 63.67]], name: 'Cassiopeia' },
  // Leo
  { stars: [[10.14, 11.97], [10.33, 19.84], [11.24, 20.52], [11.82, 14.57]], name: 'Leo' },
  // Scorpius
  { stars: [[16.49, -26.43], [16.01, -22.62], [15.98, -26.11], [16.84, -34.29], [17.56, -37.1]], name: 'Scorpius' },
];

// Generate random background stars
function generateBackgroundStars(seed: number, count: number = 300) {
  const stars = [];
  for (let i = 0; i < count; i++) {
    const random = Math.sin(seed + i * 12345) * 10000;
    stars.push({
      x: Math.abs((random * 17) % 360),
      y: Math.abs((random * 23) % 180) - 90,
      size: 0.3 + Math.abs((random * 7) % 1.2),
      opacity: 0.2 + Math.abs((random * 11) % 0.5),
    });
  }
  return stars;
}

// Calculate sidereal time for a given date and longitude
function getSiderealTime(date: Date, longitude: number): number {
  const J2000 = new Date('2000-01-01T12:00:00Z').getTime();
  const days = (date.getTime() - J2000) / (1000 * 60 * 60 * 24);
  const T = days / 36525;

  // Greenwich Mean Sidereal Time
  let GMST = 280.46061837 + 360.98564736629 * days + 0.000387933 * T * T;
  GMST = GMST % 360;
  if (GMST < 0) GMST += 360;

  // Local Sidereal Time
  let LST = GMST + longitude;
  LST = LST % 360;
  if (LST < 0) LST += 360;

  return LST;
}

// Convert RA/Dec to Alt/Az
function raDecToAltAz(ra: number, dec: number, lat: number, lst: number) {
  const raRad = (ra * 15 - lst) * Math.PI / 180;
  const decRad = dec * Math.PI / 180;
  const latRad = lat * Math.PI / 180;

  const sinAlt = Math.sin(decRad) * Math.sin(latRad) +
                 Math.cos(decRad) * Math.cos(latRad) * Math.cos(raRad);
  const alt = Math.asin(sinAlt);

  const cosAz = (Math.sin(decRad) - Math.sin(alt) * Math.sin(latRad)) /
                (Math.cos(alt) * Math.cos(latRad));
  let az = Math.acos(Math.max(-1, Math.min(1, cosAz)));

  if (Math.sin(raRad) > 0) az = 2 * Math.PI - az;

  return {
    alt: alt * 180 / Math.PI,
    az: az * 180 / Math.PI
  };
}

// Convert Alt/Az to X/Y on circular map (stereographic projection)
function altAzToXY(alt: number, az: number, centerX: number, centerY: number, radius: number) {
  // Only show stars above horizon (alt > 0)
  if (alt < 0) return null;

  // Stereographic projection
  const r = radius * (90 - alt) / 90;
  const azRad = az * Math.PI / 180;

  return {
    x: centerX + r * Math.sin(azRad),
    y: centerY - r * Math.cos(azRad)
  };
}

export default function RealStarMap({
  title,
  subtitle,
  date,
  location,
  coordinates,
  latitude = 48.8566,  // Default Paris
  longitude = 2.3522
}: RealStarMapProps) {
  const [parsedDate, setParsedDate] = useState<Date>(new Date());

  useEffect(() => {
    // Try to parse the date string
    try {
      const parsed = new Date(date);
      if (!isNaN(parsed.getTime())) {
        setParsedDate(parsed);
      }
    } catch {
      // Use current date if parsing fails
    }
  }, [date]);

  // Calculate local sidereal time
  const lst = getSiderealTime(parsedDate, longitude);

  // Map dimensions
  const centerX = 250;
  const centerY = 280;
  const radius = 180;

  // Generate seed from date for consistent background stars
  const seed = parsedDate.getTime();
  const backgroundStars = generateBackgroundStars(seed, 400);

  // Calculate visible bright stars
  const visibleStars = BRIGHT_STARS.map(star => {
    const altAz = raDecToAltAz(star.ra, star.dec, latitude, lst);
    const pos = altAzToXY(altAz.alt, altAz.az, centerX, centerY, radius);

    if (!pos) return null;

    // Size based on magnitude (brighter = larger)
    const size = Math.max(1, 4 - star.mag);

    return {
      ...star,
      x: pos.x,
      y: pos.y,
      size,
      visible: altAz.alt > 0
    };
  }).filter(Boolean);

  // Calculate constellation lines
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

  return (
    <svg
      viewBox="0 0 500 700"
      className="w-full h-full"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background - Dark navy/black */}
      <defs>
        <radialGradient id="skyGradient" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#0d1528" />
          <stop offset="100%" stopColor="#050810" />
        </radialGradient>
        <clipPath id="circleClip">
          <circle cx={centerX} cy={centerY} r={radius} />
        </clipPath>
      </defs>

      <rect width="500" height="700" fill="#050810" />

      {/* Star map circular area */}
      <circle cx={centerX} cy={centerY} r={radius} fill="url(#skyGradient)" />

      {/* Background stars (clipped to circle) */}
      <g clipPath="url(#circleClip)">
        {backgroundStars.map((star, i) => {
          // Convert random positions to be visible in the circle
          const altAz = raDecToAltAz(star.x / 15, star.y, latitude, lst);
          const pos = altAzToXY(altAz.alt, altAz.az, centerX, centerY, radius);
          if (!pos) return null;

          return (
            <circle
              key={`bg-${i}`}
              cx={pos.x}
              cy={pos.y}
              r={star.size}
              fill="#FFFFFF"
              opacity={star.opacity}
            />
          );
        })}
      </g>

      {/* Constellation lines */}
      <g clipPath="url(#circleClip)">
        {constellationPaths.map((c, i) => (
          <path
            key={`const-${i}`}
            d={c!.path}
            stroke="#4a6fa5"
            strokeWidth="0.8"
            fill="none"
            opacity="0.5"
          />
        ))}
      </g>

      {/* Bright stars with glow effect */}
      <g clipPath="url(#circleClip)">
        {visibleStars.map((star, i) => (
          <g key={`star-${i}`}>
            {/* Glow */}
            <circle
              cx={star!.x}
              cy={star!.y}
              r={star!.size * 3}
              fill="#FFFFFF"
              opacity={0.1}
            />
            {/* Star core */}
            <circle
              cx={star!.x}
              cy={star!.y}
              r={star!.size}
              fill="#FFFFFF"
              opacity={0.95}
            />
          </g>
        ))}
      </g>

      {/* Circular frame */}
      <circle
        cx={centerX}
        cy={centerY}
        r={radius}
        fill="none"
        stroke="#3a4a6a"
        strokeWidth="2"
      />

      {/* Horizon line marker */}
      <text
        x={centerX + radius + 10}
        y={centerY + 4}
        fill="#5a6a8a"
        fontSize="10"
        fontFamily="Arial, sans-serif"
      >
        E
      </text>
      <text
        x={centerX - radius - 18}
        y={centerY + 4}
        fill="#5a6a8a"
        fontSize="10"
        fontFamily="Arial, sans-serif"
      >
        W
      </text>
      <text
        x={centerX - 3}
        y={centerY - radius - 8}
        fill="#5a6a8a"
        fontSize="10"
        fontFamily="Arial, sans-serif"
      >
        N
      </text>
      <text
        x={centerX - 3}
        y={centerY + radius + 16}
        fill="#5a6a8a"
        fontSize="10"
        fontFamily="Arial, sans-serif"
      >
        S
      </text>

      {/* Title */}
      <text
        x="250"
        y="530"
        textAnchor="middle"
        fill="#FFFFFF"
        fontSize="32"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontWeight="400"
      >
        {title}
      </text>

      {/* Decorative line */}
      <line
        x1="150"
        y1="548"
        x2="350"
        y2="548"
        stroke="#FFFFFF"
        strokeWidth="0.5"
        opacity="0.3"
      />

      {/* Subtitle */}
      <text
        x="250"
        y="575"
        textAnchor="middle"
        fill="#a0b0d0"
        fontSize="16"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontStyle="italic"
      >
        {subtitle}
      </text>

      {/* Date */}
      <text
        x="250"
        y="605"
        textAnchor="middle"
        fill="#FFFFFF"
        fontSize="14"
        fontFamily="Arial, sans-serif"
        letterSpacing="2"
      >
        {date}
      </text>

      {/* Location */}
      <text
        x="250"
        y="630"
        textAnchor="middle"
        fill="#8090b0"
        fontSize="12"
        fontFamily="Arial, sans-serif"
      >
        {location}
      </text>

      {/* Coordinates */}
      {coordinates && (
        <text
          x="250"
          y="655"
          textAnchor="middle"
          fill="#607090"
          fontSize="10"
          fontFamily="'Courier New', monospace"
          letterSpacing="1"
        >
          {coordinates}
        </text>
      )}
    </svg>
  );
}
