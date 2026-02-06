// Canvas-based poster export - draws everything directly to canvas for perfect PNG export
import SunCalc from 'suncalc';

type PosterData = {
  title: string;
  names: string;
  coordinates: string;
  date: string;
  tagline?: string;
  style?: 'dark' | 'midnight' | 'blue';
  locale?: string;
};

type Star = {
  ra: number;
  dec: number;
  mag: number;
  bv?: number;
};

// Color schemes - matched exactly to MoonPoster.tsx
const colorSchemes = {
  dark: {
    bg1: '#0f0f15',
    bg2: '#050508',
    text: '#ffffff',
    textSecondary: '#b8b8c8',
    textMuted: '#6a6a7a',
  },
  midnight: {
    bg1: '#0a0e1a',
    bg2: '#040610',
    text: '#ffffff',
    textSecondary: '#9aa8c0',
    textMuted: '#4a5a70',
  },
  blue: {
    bg1: '#0a1628',
    bg2: '#050c18',
    text: '#ffffff',
    textSecondary: '#a0b8d0',
    textMuted: '#5a7090',
  },
};

// Convert B-V color index to realistic star color
function bvToColor(bv: number): string {
  if (bv < -0.2) return '#aaccff';
  if (bv < 0.0) return '#cad8ff';
  if (bv < 0.3) return '#f8f7ff';
  if (bv < 0.6) return '#fff4e8';
  if (bv < 1.0) return '#ffd2a1';
  return '#ffb56c';
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
function projectStar(ra: number, dec: number, lst: number, width: number, height: number): { x: number; y: number } {
  const raOffset = (ra - lst + 360) % 360;
  const x = (raOffset / 360) * width;
  const y = ((90 - dec) / 180) * height;
  return { x, y };
}

// Seeded random
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

// Load moon texture as ImageBitmap
async function loadMoonTexture(): Promise<ImageBitmap> {
  const response = await fetch('/moon-texture.jpg');
  const blob = await response.blob();
  return createImageBitmap(blob);
}

// Load star data
async function loadStars(): Promise<Star[]> {
  const response = await fetch('/celestial-data/stars.6.json');
  const data = await response.json();
  return data.features
    .filter((f: { properties: { mag: number } }) => f.properties.mag <= 5.5)
    .map((f: { geometry: { coordinates: number[] }; properties: { mag: number; bv?: string } }) => ({
      ra: f.geometry.coordinates[0],
      dec: f.geometry.coordinates[1],
      mag: f.properties.mag,
      bv: f.properties.bv ? parseFloat(f.properties.bv) : 0,
    }));
}

// Load a web font for canvas use
async function loadCursiveFont(): Promise<boolean> {
  try {
    const font = new FontFace(
      'GreatVibes',
      'url(https://fonts.gstatic.com/s/greatvibes/v19/RWmMoKWR9v4ksMfaWd_JN9XFiaQ.woff2)'
    );
    const loaded = await font.load();
    document.fonts.add(loaded);
    return true;
  } catch {
    return false;
  }
}

// Format date based on locale
function formatDate(date: Date, locale: string): string {
  if (locale === 'en-US' || locale === 'en-GB') {
    const day = date.getDate();
    const month = date.toLocaleDateString(locale, { month: 'long' });
    const year = date.getFullYear();
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
  return date.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
}

// Main export function
export async function generatePosterPNG(
  data: PosterData,
  targetWidth: number,
  targetHeight: number,
  onProgress?: (progress: number) => void
): Promise<Blob> {
  const { title, names, coordinates, date, tagline, style = 'midnight', locale = 'de-DE' } = data;

  // Parse date
  let parsedDate: Date;
  try {
    parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      parsedDate = new Date();
    }
  } catch {
    parsedDate = new Date();
  }

  const c = colorSchemes[style];

  // Create canvas
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d')!;

  // Scale factor (base is 500x700 - matches MoonPoster.tsx viewBox)
  const scale = targetWidth / 500;

  onProgress?.(5);

  // Load cursive font for names
  const hasCursiveFont = await loadCursiveFont();

  onProgress?.(10);

  // 1. Draw background gradient - matches MoonPoster.tsx radial gradient
  const gradient = ctx.createRadialGradient(
    targetWidth / 2, targetHeight * 0.35, 0,
    targetWidth / 2, targetHeight * 0.35, targetHeight * 0.7
  );
  gradient.addColorStop(0, c.bg1);
  gradient.addColorStop(1, c.bg2);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, targetWidth, targetHeight);

  onProgress?.(20);

  // 2. Draw stars
  try {
    const stars = await loadStars();
    const lst = calculateLST(parsedDate, 13.405);
    const sortedStars = [...stars].sort((a, b) => b.mag - a.mag);

    sortedStars.forEach((star, index) => {
      const { x, y } = projectStar(star.ra, star.dec, lst, targetWidth, targetHeight);
      const brightnessRatio = Math.pow(2.512, -star.mag);
      const baseSize = brightnessRatio * 8 * scale;
      const size = Math.max(0.15 * scale, Math.min(1.0 * scale, baseSize));
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
    console.error('Failed to load stars:', e);
  }

  onProgress?.(40);

  // 3. Draw moon - positions match MoonPoster.tsx exactly
  // MoonPoster: left: 50%, top: 38%, translate(-50%, -50%), width: 75%
  const moonCenterX = targetWidth / 2;
  const moonCenterY = targetHeight * 0.38;
  const moonRadius = targetWidth * 0.375; // 75% of width / 2

  // Moon rotation - matches MoonPoster.tsx exactly
  const dayOfYear = Math.floor((parsedDate.getTime() - new Date(parsedDate.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const moonRotation = (dayOfYear * 0.5) % 360;
  const rotationRad = (moonRotation * Math.PI) / 180;
  const tiltRad = (25 * Math.PI) / 180; // 25 degree tilt - matches MoonPoster

  // Load and draw moon texture
  try {
    const moonTexture = await loadMoonTexture();

    ctx.save();
    ctx.translate(moonCenterX, moonCenterY);
    ctx.rotate(tiltRad);

    // Clip to circle
    ctx.beginPath();
    ctx.arc(0, 0, moonRadius, 0, Math.PI * 2);
    ctx.clip();

    // Rotate texture
    ctx.rotate(rotationRad);

    // Draw moon texture
    ctx.drawImage(
      moonTexture,
      -moonRadius,
      -moonRadius,
      moonRadius * 2,
      moonRadius * 2
    );

    // Apply color filter - matches MoonPoster: brightness(0.85) contrast(1.15) saturate(0.75)
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = 'rgba(200, 200, 210, 0.15)';
    ctx.fillRect(-moonRadius, -moonRadius, moonRadius * 2, moonRadius * 2);
    ctx.globalCompositeOperation = 'source-over';

    ctx.restore();
  } catch (e) {
    console.error('Failed to load moon texture:', e);
    // Fallback: draw simple circle
    ctx.save();
    ctx.translate(moonCenterX, moonCenterY);
    ctx.rotate(tiltRad);
    ctx.beginPath();
    ctx.arc(0, 0, moonRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#ddd';
    ctx.fill();
    ctx.restore();
  }

  onProgress?.(60);

  // 4. Draw 3D lighting effect - matches MoonPoster.tsx radial-gradient exactly
  ctx.save();
  ctx.translate(moonCenterX, moonCenterY);
  ctx.rotate(tiltRad);
  ctx.beginPath();
  ctx.arc(0, 0, moonRadius, 0, Math.PI * 2);
  ctx.clip();

  const lightGradient = ctx.createRadialGradient(
    -moonRadius * 0.3, -moonRadius * 0.3, 0,
    0, 0, moonRadius
  );
  lightGradient.addColorStop(0, 'rgba(255,255,255,0.05)');
  lightGradient.addColorStop(0.25, 'transparent');
  lightGradient.addColorStop(0.55, 'rgba(0,0,0,0.2)');
  lightGradient.addColorStop(0.8, 'rgba(0,0,0,0.55)');
  lightGradient.addColorStop(1, 'rgba(0,0,0,0.75)');
  ctx.fillStyle = lightGradient;
  ctx.fillRect(-moonRadius, -moonRadius, moonRadius * 2, moonRadius * 2);
  ctx.restore();

  onProgress?.(70);

  // 5. Draw moon phase shadow - matches MoonPoster.tsx SVG logic exactly
  const moonIllumination = SunCalc.getMoonIllumination(parsedDate);
  const phase = moonIllumination.phase;
  const fraction = moonIllumination.fraction;
  const isWaxing = phase < 0.5;
  const illumination = fraction;

  if (illumination < 0.98) {
    ctx.save();
    ctx.translate(moonCenterX, moonCenterY);
    ctx.rotate(tiltRad);

    // Clip to moon circle
    ctx.beginPath();
    ctx.arc(0, 0, moonRadius, 0, Math.PI * 2);
    ctx.clip();

    // Shadow opacity - matches MoonPoster.tsx exactly (0.65)
    const shadowOpacity = 0.65;

    if (illumination < 0.08) {
      const normalizedIllum = illumination / 0.08;
      const newMoonOpacity = 0.65 + Math.sqrt(normalizedIllum) * 0.30;
      ctx.fillStyle = `rgba(0,0,0,${newMoonOpacity})`;
      ctx.fillRect(-moonRadius, -moonRadius, moonRadius * 2, moonRadius * 2);
    } else {
      const isCrescent = illumination < 0.5;
      const terminatorRx = Math.abs(Math.cos(illumination * Math.PI)) * moonRadius;

      ctx.fillStyle = `rgba(0,0,0,${shadowOpacity})`;
      ctx.beginPath();

      if (isCrescent) {
        if (isWaxing) {
          ctx.arc(0, 0, moonRadius, Math.PI / 2, -Math.PI / 2, false);
          ctx.ellipse(0, 0, Math.max(0.1, terminatorRx), moonRadius, 0, -Math.PI / 2, Math.PI / 2, false);
        } else {
          ctx.arc(0, 0, moonRadius, -Math.PI / 2, Math.PI / 2, false);
          ctx.ellipse(0, 0, Math.max(0.1, terminatorRx), moonRadius, 0, Math.PI / 2, -Math.PI / 2, false);
        }
      } else {
        if (isWaxing) {
          ctx.arc(0, 0, moonRadius, Math.PI / 2, -Math.PI / 2, false);
          ctx.ellipse(0, 0, Math.max(0.1, terminatorRx), moonRadius, 0, -Math.PI / 2, Math.PI / 2, true);
        } else {
          ctx.arc(0, 0, moonRadius, -Math.PI / 2, Math.PI / 2, false);
          ctx.ellipse(0, 0, Math.max(0.1, terminatorRx), moonRadius, 0, Math.PI / 2, -Math.PI / 2, true);
        }
      }
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }

  onProgress?.(80);

  // 6. Draw text - positions match MoonPoster.tsx CSS layout exactly
  // MoonPoster.tsx: text container at bottom: 8%, width: 85%, textAlign: center
  // Text flows top-to-bottom: title -> names -> date -> coordinates -> tagline
  const formattedDate = formatDate(parsedDate, locale);
  const textCenterX = targetWidth / 2;

  // Font sizes matching MoonPoster.tsx exactly (in base 500px units, then scaled)
  const titleFontSize = 12 * scale;
  const namesFontSize = 14 * scale;
  const dateFontSize = 9 * scale;
  const coordsFontSize = 8 * scale;
  const taglineFontSize = 7 * scale;

  // Margins matching MoonPoster.tsx CSS marginBottom values
  const titleMarginBottom = 10 * scale;
  const namesMarginBottom = 10 * scale;
  const dateMarginBottom = 4 * scale;
  const coordsMarginBottom = 8 * scale;

  // Calculate total text block height (top-to-bottom like CSS flow)
  let textBlockHeight = titleFontSize + titleMarginBottom;
  textBlockHeight += namesFontSize + namesMarginBottom;
  textBlockHeight += dateFontSize + dateMarginBottom;
  if (coordinates) {
    textBlockHeight += coordsFontSize + coordsMarginBottom;
  }
  if (tagline) {
    textBlockHeight += taglineFontSize;
  }

  // Position the text block so its bottom aligns with CSS bottom: 8%
  const textBlockBottom = targetHeight * 0.92;
  const textBlockTop = textBlockBottom - textBlockHeight;

  ctx.textAlign = 'center';

  // Draw text top-to-bottom (matching CSS flow)
  let currentY = textBlockTop;

  // Title - matches: fontSize 12px, fontWeight 300, letterSpacing 3px, uppercase, Helvetica Neue
  ctx.fillStyle = c.text;
  ctx.font = `300 ${titleFontSize}px "Helvetica Neue", Helvetica, Arial, sans-serif`;
  ctx.letterSpacing = `${3 * scale}px`;
  currentY += titleFontSize;
  ctx.fillText((title || formattedDate).toUpperCase(), textCenterX, currentY);
  currentY += titleMarginBottom;

  // Names - matches: fontSize 14px, italic, cursive font, letterSpacing 1px
  ctx.fillStyle = c.text;
  if (hasCursiveFont) {
    ctx.font = `${namesFontSize}px GreatVibes, cursive`;
  } else {
    ctx.font = `italic ${namesFontSize}px "Snell Roundhand", "Brush Script MT", "Lucida Handwriting", cursive`;
  }
  ctx.letterSpacing = `${1 * scale}px`;
  currentY += namesFontSize;
  ctx.fillText(names, textCenterX, currentY);
  currentY += namesMarginBottom;

  // Date - matches: fontSize 9px, fontWeight 300, letterSpacing 2px, uppercase
  ctx.fillStyle = c.textSecondary;
  ctx.font = `300 ${dateFontSize}px "Helvetica Neue", Helvetica, Arial, sans-serif`;
  ctx.letterSpacing = `${2 * scale}px`;
  currentY += dateFontSize;
  ctx.fillText(formattedDate.toUpperCase(), textCenterX, currentY);
  currentY += dateMarginBottom;

  // Coordinates - matches: fontSize 8px, letterSpacing 1.5px, monospace
  if (coordinates) {
    ctx.fillStyle = c.textMuted;
    ctx.font = `${coordsFontSize}px "SF Mono", Monaco, monospace`;
    ctx.letterSpacing = `${1.5 * scale}px`;
    currentY += coordsFontSize;
    ctx.fillText(coordinates, textCenterX, currentY);
    currentY += coordsMarginBottom;
  }

  // Tagline - matches: fontSize 7px, fontWeight 400, letterSpacing 2px, uppercase
  if (tagline) {
    ctx.fillStyle = c.textMuted;
    ctx.font = `400 ${taglineFontSize}px "Helvetica Neue", Helvetica, Arial, sans-serif`;
    ctx.letterSpacing = `${2 * scale}px`;
    currentY += taglineFontSize;
    ctx.fillText(tagline.toUpperCase(), textCenterX, currentY);
  }

  onProgress?.(100);

  // Convert to blob
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Failed to create blob'));
      }
    }, 'image/png', 1.0);
  });
}
