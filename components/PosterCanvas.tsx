'use client';

import { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import SunCalc from 'suncalc';

type Star = {
  ra: number;
  dec: number;
  mag: number;
  bv?: number;
};

type PosterCanvasProps = {
  title: string;
  names: string;
  coordinates: string;
  date: string;
  tagline?: string;
  style?: 'dark' | 'midnight' | 'blue';
  locale?: string;
  width?: number;
  height?: number;
  onReady?: () => void;
};

export type PosterCanvasHandle = {
  getCanvas: () => HTMLCanvasElement | null;
  toBlob: (callback: (blob: Blob | null) => void, type?: string, quality?: number) => void;
  toDataURL: (type?: string, quality?: number) => string;
};

// Color schemes
const colorSchemes = {
  dark: {
    bg1: '#0f0f15',
    bg2: '#050508',
    accent: '#d4af37',
    text: '#ffffff',
    textSecondary: '#b8b8c8',
    textMuted: '#6a6a7a',
  },
  midnight: {
    bg1: '#0a0e1a',
    bg2: '#040610',
    accent: '#c9a227',
    text: '#ffffff',
    textSecondary: '#9aa8c0',
    textMuted: '#4a5a70',
  },
  blue: {
    bg1: '#0a1628',
    bg2: '#050c18',
    accent: '#7eb8da',
    text: '#ffffff',
    textSecondary: '#a0b8d0',
    textMuted: '#5a7090',
  }
};

// B-V color index to star color
function bvToColor(bv: number): string {
  if (bv < -0.2) return '#aaccff';
  if (bv < 0.0) return '#cad8ff';
  if (bv < 0.3) return '#f8f7ff';
  if (bv < 0.6) return '#fff4e8';
  if (bv < 1.0) return '#ffd2a1';
  return '#ffb56c';
}

// Sidereal time calculation
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

function dateToJD(date: Date): number {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth() + 1;
  const d = date.getUTCDate() + date.getUTCHours() / 24 + date.getUTCMinutes() / 1440;
  let jy = y, jm = m;
  if (m <= 2) { jy = y - 1; jm = m + 12; }
  const a = Math.floor(jy / 100);
  const b = 2 - a + Math.floor(a / 4);
  return Math.floor(365.25 * (jy + 4716)) + Math.floor(30.6001 * (jm + 1)) + d + b - 1524.5;
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

// Global star cache
let starCache: Star[] | null = null;

async function loadStars(): Promise<Star[]> {
  if (starCache) return starCache;
  const response = await fetch('/celestial-data/stars.6.json');
  const data = await response.json();
  starCache = data.features
    .filter((f: { properties: { mag: number } }) => f.properties.mag <= 5.5)
    .map((f: { geometry: { coordinates: number[] }; properties: { mag: number; bv?: string } }) => ({
      ra: f.geometry.coordinates[0],
      dec: f.geometry.coordinates[1],
      mag: f.properties.mag,
      bv: f.properties.bv ? parseFloat(f.properties.bv) : 0,
    }));
  return starCache!;
}

const PosterCanvas = forwardRef<PosterCanvasHandle, PosterCanvasProps>(({
  title,
  names,
  coordinates,
  date,
  tagline,
  style = 'dark',
  locale = 'de-DE',
  width = 500,
  height = 700,
  onReady,
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isReady, setIsReady] = useState(false);
  const moonImageRef = useRef<HTMLImageElement | null>(null);

  const c = colorSchemes[style];

  // Parse date
  const parsedDate = (() => {
    try {
      const parsed = new Date(date);
      if (!isNaN(parsed.getTime())) return parsed;
    } catch {}
    return new Date();
  })();

  // Moon phase calculations
  const moonIllumination = SunCalc.getMoonIllumination(parsedDate);
  const phase = moonIllumination.phase;
  const fraction = moonIllumination.fraction;
  const isWaxing = phase < 0.5;

  // Moon rotation
  const dayOfYear = Math.floor((parsedDate.getTime() - new Date(parsedDate.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const moonRotation = (dayOfYear * 0.5) % 360;

  // Format date
  const formattedDate = (() => {
    if (locale === 'en-US' || locale === 'en-GB') {
      const day = parsedDate.getDate();
      const month = parsedDate.toLocaleDateString(locale, { month: 'long' });
      const year = parsedDate.getFullYear();
      const ordinal = (d: number) => {
        if (d > 3 && d < 21) return 'th';
        switch (d % 10) {
          case 1: return 'st';
          case 2: return 'nd';
          case 3: return 'rd';
          default: return 'th';
        }
      };
      return `${month} ${day}${ordinal(day)}, ${year}`;
    }
    return parsedDate.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
  })();

  // Expose canvas methods
  useImperativeHandle(ref, () => ({
    getCanvas: () => canvasRef.current,
    toBlob: (callback, type = 'image/png', quality = 1.0) => {
      canvasRef.current?.toBlob(callback, type, quality);
    },
    toDataURL: (type = 'image/png', quality = 1.0) => {
      return canvasRef.current?.toDataURL(type, quality) || '';
    },
  }));

  const drawPoster = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = width;
    canvas.height = height;

    // 1. Draw background gradient
    const bgGradient = ctx.createRadialGradient(
      width / 2, height * 0.35, 0,
      width / 2, height * 0.35, height * 0.7
    );
    bgGradient.addColorStop(0, c.bg1);
    bgGradient.addColorStop(1, c.bg2);
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // 2. Draw stars
    try {
      const stars = await loadStars();
      const lst = calculateLST(parsedDate, 13.405);

      const sortedStars = [...stars].sort((a, b) => b.mag - a.mag);
      sortedStars.forEach((star, index) => {
        const raOffset = (star.ra - lst + 360) % 360;
        const x = (raOffset / 360) * width;
        const y = ((90 - star.dec) / 180) * height;

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
    } catch (e) {
      console.error('Failed to draw stars:', e);
    }

    // 3. Draw moon
    const moonSize = width * 0.75;
    const moonX = width / 2;
    const moonY = height * 0.38;

    // Load and draw moon texture
    if (!moonImageRef.current) {
      moonImageRef.current = new Image();
      moonImageRef.current.crossOrigin = 'anonymous';
    }

    const moonImg = moonImageRef.current;

    await new Promise<void>((resolve) => {
      if (moonImg.complete && moonImg.src) {
        resolve();
      } else {
        moonImg.onload = () => resolve();
        moonImg.onerror = () => resolve();
        moonImg.src = '/moon-texture.jpg';
      }
    });

    // Save context for rotation
    ctx.save();
    ctx.translate(moonX, moonY);
    ctx.rotate(25 * Math.PI / 180); // 25 degree tilt

    // Create circular clip for moon
    ctx.beginPath();
    ctx.arc(0, 0, moonSize / 2, 0, Math.PI * 2);
    ctx.clip();

    // Draw moon texture with rotation
    ctx.save();
    ctx.rotate(moonRotation * Math.PI / 180);

    // Apply brightness/contrast effect manually
    ctx.filter = 'brightness(0.85) contrast(1.15) saturate(0.75)';
    ctx.drawImage(moonImg, -moonSize / 2, -moonSize / 2, moonSize, moonSize);
    ctx.filter = 'none';
    ctx.restore();

    // Draw 3D lighting overlay
    const lightGradient = ctx.createRadialGradient(
      -moonSize * 0.15, -moonSize * 0.15, 0,
      0, 0, moonSize / 2
    );
    lightGradient.addColorStop(0, 'rgba(255,255,255,0.05)');
    lightGradient.addColorStop(0.25, 'transparent');
    lightGradient.addColorStop(0.55, 'rgba(0,0,0,0.2)');
    lightGradient.addColorStop(0.8, 'rgba(0,0,0,0.55)');
    lightGradient.addColorStop(1, 'rgba(0,0,0,0.75)');
    ctx.fillStyle = lightGradient;
    ctx.beginPath();
    ctx.arc(0, 0, moonSize / 2, 0, Math.PI * 2);
    ctx.fill();

    // Draw moon phase shadow
    const illumination = fraction;
    const isCrescent = illumination < 0.5;
    const shadowOpacity = 0.65;

    if (illumination < 0.98) {
      ctx.fillStyle = `rgba(0,0,0,${shadowOpacity})`;

      if (illumination < 0.08) {
        // New moon - full shadow
        const normalizedIllum = illumination / 0.08;
        const newMoonOpacity = 0.65 + Math.sqrt(normalizedIllum) * 0.30;
        ctx.fillStyle = `rgba(0,0,0,${newMoonOpacity})`;
        ctx.beginPath();
        ctx.arc(0, 0, moonSize / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Calculate terminator ellipse
        const terminatorRx = Math.abs(Math.cos(illumination * Math.PI)) * (moonSize / 2);
        const r = moonSize / 2;

        ctx.beginPath();

        if (isCrescent) {
          if (isWaxing) {
            // Waxing crescent - shadow on left
            ctx.arc(0, 0, r, Math.PI / 2, -Math.PI / 2, false);
            ctx.ellipse(0, 0, Math.max(0.1, terminatorRx), r, 0, -Math.PI / 2, Math.PI / 2, false);
          } else {
            // Waning crescent - shadow on right
            ctx.arc(0, 0, r, -Math.PI / 2, Math.PI / 2, false);
            ctx.ellipse(0, 0, Math.max(0.1, terminatorRx), r, 0, Math.PI / 2, -Math.PI / 2, false);
          }
        } else {
          if (isWaxing) {
            // Waxing gibbous - small shadow on left
            ctx.arc(0, 0, r, Math.PI / 2, -Math.PI / 2, false);
            ctx.ellipse(0, 0, Math.max(0.1, terminatorRx), r, 0, -Math.PI / 2, Math.PI / 2, true);
          } else {
            // Waning gibbous - small shadow on right
            ctx.arc(0, 0, r, -Math.PI / 2, Math.PI / 2, false);
            ctx.ellipse(0, 0, Math.max(0.1, terminatorRx), r, 0, Math.PI / 2, -Math.PI / 2, true);
          }
        }

        ctx.closePath();
        ctx.fill();
      }
    }

    ctx.restore();

    // 4. Draw text
    const textY = height * 0.78;
    ctx.textAlign = 'center';

    // Title
    ctx.fillStyle = c.text;
    ctx.font = '300 12px "Helvetica Neue", Helvetica, Arial, sans-serif';
    ctx.letterSpacing = '3px';
    ctx.fillText((title || formattedDate).toUpperCase(), width / 2, textY);

    // Names
    ctx.fillStyle = c.text;
    ctx.font = 'italic 14px "Georgia", serif';
    ctx.fillText(names, width / 2, textY + 25);

    // Date
    ctx.fillStyle = c.textSecondary;
    ctx.font = '300 9px "Helvetica Neue", Helvetica, Arial, sans-serif';
    ctx.fillText(formattedDate.toUpperCase(), width / 2, textY + 45);

    // Coordinates
    if (coordinates) {
      ctx.fillStyle = c.textMuted;
      ctx.font = '8px "SF Mono", Monaco, monospace';
      ctx.fillText(coordinates, width / 2, textY + 60);
    }

    // Tagline
    if (tagline) {
      ctx.fillStyle = c.textMuted;
      ctx.font = '400 7px "Helvetica Neue", Helvetica, Arial, sans-serif';
      ctx.fillText(tagline.toUpperCase(), width / 2, textY + 75);
    }

    setIsReady(true);
    onReady?.();
  }, [width, height, c, parsedDate, phase, fraction, isWaxing, moonRotation, title, names, coordinates, tagline, formattedDate, onReady]);

  useEffect(() => {
    drawPoster();
  }, [drawPoster]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: '100%',
        height: '100%',
      }}
    />
  );
});

PosterCanvas.displayName = 'PosterCanvas';

export default PosterCanvas;
