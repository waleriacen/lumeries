'use client';

import { useEffect, useState, useRef, useCallback } from 'react';

type Star = {
  ra: number;
  dec: number;
  mag: number;
  bv?: number;
};

type CelestialBackgroundProps = {
  date: Date;
  longitude?: number;
  width?: number;
  height?: number;
  style?: 'dark' | 'midnight' | 'blue';
};

// Convert B-V color index to realistic star color
function bvToColor(bv: number): string {
  if (bv < -0.2) {
    return '#aaccff';
  } else if (bv < 0.0) {
    return '#cad8ff';
  } else if (bv < 0.3) {
    return '#f8f7ff';
  } else if (bv < 0.6) {
    return '#fff4e8';
  } else if (bv < 1.0) {
    return '#ffd2a1';
  } else {
    return '#ffb56c';
  }
}

// Calculate Local Sidereal Time
function calculateLST(date: Date, longitude: number): number {
  const jd = dateToJD(date);
  const t = (jd - 2451545.0) / 36525;
  let gmst = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * t * t;
  gmst = gmst % 360;
  if (gmst < 0) gmst += 360;
  let lst = gmst + longitude;
  lst = lst % 360;
  if (lst < 0) lst += 360;
  return lst;
}

// Convert date to Julian Date
function dateToJD(date: Date): number {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth() + 1;
  const d = date.getUTCDate() + date.getUTCHours() / 24 + date.getUTCMinutes() / 1440;

  let jy = y;
  let jm = m;
  if (m <= 2) {
    jy = y - 1;
    jm = m + 12;
  }

  const a = Math.floor(jy / 100);
  const b = 2 - a + Math.floor(a / 4);

  return Math.floor(365.25 * (jy + 4716)) + Math.floor(30.6001 * (jm + 1)) + d + b - 1524.5;
}

// Project star position
function projectStar(
  ra: number,
  dec: number,
  lst: number,
  width: number,
  height: number
): { x: number; y: number } {
  const raOffset = (ra - lst + 360) % 360;
  const x = (raOffset / 360) * width;
  const y = ((90 - dec) / 180) * height;
  return { x, y };
}

// Seeded random for consistent star variations
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

// Color schemes
const colorSchemes = {
  dark: {
    bg1: '#0f0f15',
    bg2: '#050508',
  },
  midnight: {
    bg1: '#0a0e1a',
    bg2: '#040610',
  },
  blue: {
    bg1: '#0a1628',
    bg2: '#050c18',
  },
};

// Global star cache to avoid re-fetching
let starCache: Star[] | null = null;
let starCachePromise: Promise<Star[]> | null = null;

async function loadStars(): Promise<Star[]> {
  if (starCache) return starCache;

  if (starCachePromise) return starCachePromise;

  starCachePromise = fetch('/celestial-data/stars.6.json')
    .then(response => response.json())
    .then(data => {
      const parsedStars: Star[] = data.features
        .filter((f: { properties: { mag: number } }) => f.properties.mag <= 5.5)
        .map((f: { geometry: { coordinates: number[] }; properties: { mag: number; bv?: string } }) => ({
          ra: f.geometry.coordinates[0],
          dec: f.geometry.coordinates[1],
          mag: f.properties.mag,
          bv: f.properties.bv ? parseFloat(f.properties.bv) : 0,
        }));
      starCache = parsedStars;
      return parsedStars;
    });

  return starCachePromise;
}

export default function CelestialBackground({
  date,
  longitude = 13.405,
  width = 500,
  height = 700,
  style = 'midnight',
}: CelestialBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isReady, setIsReady] = useState(false);

  const c = colorSchemes[style];

  const drawCanvas = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size - use 2x for retina
    const scale = 2;
    canvas.width = width * scale;
    canvas.height = height * scale;
    ctx.scale(scale, scale);

    // Draw background gradient
    const gradient = ctx.createRadialGradient(
      width / 2, height * 0.35, 0,
      width / 2, height * 0.35, height * 0.7
    );
    gradient.addColorStop(0, c.bg1);
    gradient.addColorStop(1, c.bg2);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Load and draw stars
    try {
      const stars = await loadStars();
      const lst = calculateLST(date, longitude);

      // Sort by magnitude (dimmer first)
      const sortedStars = [...stars].sort((a, b) => b.mag - a.mag);

      sortedStars.forEach((star, index) => {
        const { x, y } = projectStar(star.ra, star.dec, lst, width, height);

        const brightnessRatio = Math.pow(2.512, -star.mag);
        const baseSize = brightnessRatio * 8;
        const size = Math.max(0.15, Math.min(1.0, baseSize));
        const opacity = Math.max(0.05, Math.min(0.35, brightnessRatio * 2.5));
        const variation = seededRandom(index) * 0.15;
        const finalSize = size * (1 + variation);
        const color = bvToColor(star.bv || 0);

        ctx.beginPath();
        ctx.arc(x, y, finalSize, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.globalAlpha = opacity;
        ctx.fill();
      });

      ctx.globalAlpha = 1;
      setIsReady(true);
    } catch (error) {
      console.error('Failed to load star data:', error);
      setIsReady(true);
    }
  }, [date, longitude, width, height, c.bg1, c.bg2]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
      }}
    />
  );
}
