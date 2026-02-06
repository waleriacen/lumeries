import { NextResponse } from 'next/server';
import { PDFDocument, rgb, StandardFonts, PDFPage } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

// Poster formats in mm - EU and US sizes
const POSTER_FORMATS = {
  // European formats
  'a4': { width: 210, height: 297, name: 'A4 (21×29.7cm)' },
  'a3': { width: 297, height: 420, name: 'A3 (29.7×42cm)' },
  'a2': { width: 420, height: 594, name: 'A2 (42×59.4cm)' },
  '50x70': { width: 500, height: 700, name: '50×70cm' },
  // US formats (converted to mm)
  '8x10': { width: 203, height: 254, name: '8×10" (20×25cm)' },
  '11x14': { width: 279, height: 356, name: '11×14" (28×36cm)' },
  '16x20': { width: 406, height: 508, name: '16×20" (41×51cm)' },
  '18x24': { width: 457, height: 610, name: '18×24" (46×61cm)' },
  '24x36': { width: 610, height: 914, name: '24×36" (61×91cm)' },
};

type FormatKey = keyof typeof POSTER_FORMATS;

// Convert mm to PDF points (72 points per inch)
function mmToPoints(mm: number): number {
  return (mm / 25.4) * 72;
}

// Calculate moon phase for a given date using accurate algorithm
function getMoonPhase(date: Date): { phase: number; illumination: number; name: string; nameEn: string } {
  const knownNewMoon = new Date(2000, 0, 6, 18, 14, 0);
  const daysSinceKnown = (date.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24);
  const lunarCycle = 29.53059;
  let phase = (daysSinceKnown % lunarCycle) / lunarCycle;
  if (phase < 0) phase += 1;

  // More accurate illumination calculation
  const illumination = (1 - Math.cos(phase * 2 * Math.PI)) / 2;

  let name = '';
  let nameEn = '';
  if (phase < 0.03 || phase > 0.97) { name = 'Neumond'; nameEn = 'New Moon'; }
  else if (phase < 0.22) { name = 'Zunehmende Sichel'; nameEn = 'Waxing Crescent'; }
  else if (phase < 0.28) { name = 'Erstes Viertel'; nameEn = 'First Quarter'; }
  else if (phase < 0.47) { name = 'Zunehmender Mond'; nameEn = 'Waxing Gibbous'; }
  else if (phase < 0.53) { name = 'Vollmond'; nameEn = 'Full Moon'; }
  else if (phase < 0.72) { name = 'Abnehmender Mond'; nameEn = 'Waning Gibbous'; }
  else if (phase < 0.78) { name = 'Letztes Viertel'; nameEn = 'Last Quarter'; }
  else { name = 'Abnehmende Sichel'; nameEn = 'Waning Crescent'; }

  return { phase, illumination, name, nameEn };
}

// Draw stars
function drawStars(
  page: PDFPage,
  width: number,
  height: number,
  seed: number,
  count: number = 200
) {
  for (let i = 0; i < count; i++) {
    const random = Math.sin(seed + i * 12345) * 10000;
    const x = Math.abs((random * 17) % width);
    const y = Math.abs((random * 23) % height);
    const size = 0.3 + Math.abs((random * 7) % 1.2);
    const opacity = 0.15 + Math.abs((random * 11) % 0.5);

    page.drawCircle({
      x,
      y,
      size,
      color: rgb(1, 1, 1),
      opacity,
    });
  }
}

// Draw moon phase shadow overlay using many small segments for smooth curves
function drawMoonPhaseShadow(
  page: PDFPage,
  centerX: number,
  centerY: number,
  radius: number,
  phase: number,
  illumination: number
) {
  if (illumination > 0.98) return; // Full moon, no shadow needed

  const isWaxing = phase < 0.5;
  const isCrescent = illumination < 0.5;

  // Calculate terminator ellipse X-radius
  // At new/full moon: terminatorRx = 0 (straight line)
  // At quarter moon: terminatorRx = radius (full half circle)
  const terminatorRx = Math.abs(Math.cos(illumination * Math.PI)) * radius;

  // Draw shadow using many small rectangles for smooth appearance
  const segments = 180;
  const shadowOpacity = 0.75;

  for (let i = 0; i < segments; i++) {
    // Angle from top to bottom of moon
    const angle = (i / segments) * Math.PI;
    const y = centerY + radius * Math.cos(angle);
    const halfWidth = Math.sin(angle) * radius;

    if (halfWidth <= 0) continue;

    // Calculate terminator x position at this y
    const terminatorOffset = Math.sin(angle) * terminatorRx;

    let shadowStart: number, shadowEnd: number;

    if (isCrescent) {
      // Crescent: shadow covers more than half
      if (isWaxing) {
        // Waxing crescent: light on right, shadow on left
        shadowStart = centerX - halfWidth;
        shadowEnd = centerX + terminatorOffset;
      } else {
        // Waning crescent: light on left, shadow on right
        shadowStart = centerX - terminatorOffset;
        shadowEnd = centerX + halfWidth;
      }
    } else {
      // Gibbous: shadow covers less than half
      if (isWaxing) {
        // Waxing gibbous: small shadow on left
        shadowStart = centerX - halfWidth;
        shadowEnd = centerX - terminatorOffset;
      } else {
        // Waning gibbous: small shadow on right
        shadowStart = centerX + terminatorOffset;
        shadowEnd = centerX + halfWidth;
      }
    }

    const shadowWidth = shadowEnd - shadowStart;
    if (shadowWidth > 0.5) {
      const segmentHeight = (Math.PI * radius) / segments;
      page.drawRectangle({
        x: shadowStart,
        y: y - segmentHeight / 2,
        width: shadowWidth,
        height: segmentHeight + 0.5,
        color: rgb(0, 0, 0),
        opacity: shadowOpacity,
      });
    }
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const title = searchParams.get('title') || 'The Night We Met';
    const names = searchParams.get('names') || 'Sarah & Michael';
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
    const coordinates = searchParams.get('coordinates') || '';
    const tagline = searchParams.get('tagline') || '';
    const style = searchParams.get('style') || 'midnight';
    const format = (searchParams.get('format') || '50x70') as FormatKey;
    const lang = searchParams.get('lang') || 'de';

    // Get format dimensions
    const posterFormat = POSTER_FORMATS[format] || POSTER_FORMATS['50x70'];
    const widthPt = mmToPoints(posterFormat.width);
    const heightPt = mmToPoints(posterFormat.height);

    // Parse date and get moon phase
    const parsedDate = new Date(date);
    const moonData = getMoonPhase(parsedDate);

    // Format date based on language
    const dateLocales: Record<string, string> = {
      de: 'de-DE',
      en: 'en-US',
      fr: 'fr-FR',
      es: 'es-ES',
    };
    const formattedDate = parsedDate.toLocaleDateString(dateLocales[lang] || 'en-US', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });

    // Create PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([widthPt, heightPt]);

    // Embed fonts
    const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const timesItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);
    const timesBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Background colors based on style
    const bgColors: Record<string, [number, number, number]> = {
      midnight: [0.04, 0.055, 0.1],
      dark: [0.06, 0.06, 0.08],
      blue: [0.04, 0.09, 0.16],
    };
    const bgColor = bgColors[style] || bgColors.midnight;

    // Draw background
    page.drawRectangle({
      x: 0,
      y: 0,
      width: widthPt,
      height: heightPt,
      color: rgb(...bgColor),
    });

    // Draw stars
    const starCount = Math.floor((widthPt * heightPt) / 800);
    drawStars(page, widthPt, heightPt, parsedDate.getTime(), starCount);

    // Calculate proportional sizes based on poster dimensions
    const scale = Math.min(widthPt, heightPt) / 500;
    const moonRadius = 110 * scale;
    const moonCenterX = widthPt / 2;
    const moonCenterY = heightPt * 0.62;

    // Try to load and embed moon texture
    let moonTextureLoaded = false;
    try {
      const moonTexturePath = path.join(process.cwd(), 'public', 'moon-texture.jpg');
      if (fs.existsSync(moonTexturePath)) {
        const moonTextureBytes = fs.readFileSync(moonTexturePath);
        const moonImage = await pdfDoc.embedJpg(moonTextureBytes);

        // Draw moon image (will be circular via clipping simulation with overlapping circles)
        const moonDiameter = moonRadius * 2;

        // Draw the moon image
        page.drawImage(moonImage, {
          x: moonCenterX - moonRadius,
          y: moonCenterY - moonRadius,
          width: moonDiameter,
          height: moonDiameter,
        });

        // Create circular mask by drawing background color around the moon
        // Draw 4 corner rectangles to cut off the corners of the square image
        const maskSegments = 90;
        for (let i = 0; i < maskSegments; i++) {
          const angle1 = (i / maskSegments) * 2 * Math.PI;
          const angle2 = ((i + 1) / maskSegments) * 2 * Math.PI;

          // Calculate points on the circle
          const x1 = moonCenterX + Math.cos(angle1) * moonRadius;
          const y1 = moonCenterY + Math.sin(angle1) * moonRadius;
          const x2 = moonCenterX + Math.cos(angle2) * moonRadius;
          const y2 = moonCenterY + Math.sin(angle2) * moonRadius;

          // Calculate corner point (on square boundary)
          const cornerX = moonCenterX + Math.cos((angle1 + angle2) / 2) * moonRadius * 1.42;
          const cornerY = moonCenterY + Math.sin((angle1 + angle2) / 2) * moonRadius * 1.42;

          // Draw triangle to mask corner
          // This is a simplified approach - for perfect circles we'd need clipping paths
        }

        // Draw dark circles around edges to create circular appearance
        for (let angle = 0; angle < 360; angle += 1) {
          const rad = (angle * Math.PI) / 180;
          const maskSize = 8 * scale;

          // Check if this point is outside the circle
          for (let dist = moonRadius; dist < moonRadius + maskSize * 3; dist += maskSize * 0.7) {
            const maskX = moonCenterX + Math.cos(rad) * dist;
            const maskY = moonCenterY + Math.sin(rad) * dist;

            // Only draw if significantly outside moon bounds
            const distFromCenter = Math.sqrt(
              Math.pow(maskX - moonCenterX, 2) + Math.pow(maskY - moonCenterY, 2)
            );

            if (distFromCenter > moonRadius - 2) {
              page.drawCircle({
                x: maskX,
                y: maskY,
                size: maskSize,
                color: rgb(...bgColor),
              });
            }
          }
        }

        moonTextureLoaded = true;
      }
    } catch (e) {
      console.error('Could not load moon texture:', e);
    }

    // Fallback: Draw simple moon if texture not loaded
    if (!moonTextureLoaded) {
      // Draw moon base (light gray circle)
      page.drawCircle({
        x: moonCenterX,
        y: moonCenterY,
        size: moonRadius,
        color: rgb(0.85, 0.85, 0.82),
      });

      // Add some surface detail circles
      const craterSeeds = [0.2, 0.4, 0.6, 0.8, 0.15, 0.35, 0.55, 0.75, 0.9];
      craterSeeds.forEach((seed, i) => {
        const craterAngle = seed * Math.PI * 2;
        const craterDist = moonRadius * (0.2 + (i % 3) * 0.25);
        const craterX = moonCenterX + Math.cos(craterAngle) * craterDist;
        const craterY = moonCenterY + Math.sin(craterAngle) * craterDist;
        const craterSize = moonRadius * (0.05 + (seed * 0.08));

        page.drawCircle({
          x: craterX,
          y: craterY,
          size: craterSize,
          color: rgb(0.75, 0.75, 0.72),
          opacity: 0.5,
        });
      });
    }

    // Draw moon phase shadow
    drawMoonPhaseShadow(page, moonCenterX, moonCenterY, moonRadius, moonData.phase, moonData.illumination);

    // Draw subtle glow around moon
    for (let i = 5; i > 0; i--) {
      page.drawCircle({
        x: moonCenterX,
        y: moonCenterY,
        size: moonRadius + i * 4 * scale,
        borderColor: rgb(1, 1, 1),
        borderWidth: 0.3,
        opacity: 0.03,
      });
    }

    // Draw decorative line
    const lineY = heightPt * 0.30;
    const lineWidth = widthPt * 0.5;
    const lineStartX = (widthPt - lineWidth) / 2;

    // Gradient-like line (multiple segments with varying opacity)
    for (let i = 0; i < 30; i++) {
      const segmentWidth = lineWidth / 30;
      const opacity = 1 - Math.abs(i - 15) / 15;
      page.drawLine({
        start: { x: lineStartX + i * segmentWidth, y: lineY },
        end: { x: lineStartX + (i + 1) * segmentWidth, y: lineY },
        thickness: 0.5 * scale,
        color: rgb(0.83, 0.69, 0.22),
        opacity: opacity * 0.7,
      });
    }

    // Text colors
    const textColor = rgb(1, 1, 1);
    const accentColor = rgb(0.85, 0.75, 0.35);
    const secondaryColor = rgb(0.65, 0.70, 0.78);

    // Draw title
    const titleSize = 14 * scale;
    const titleWidth = timesRoman.widthOfTextAtSize(title, titleSize);
    page.drawText(title, {
      x: (widthPt - titleWidth) / 2,
      y: heightPt * 0.24,
      size: titleSize,
      font: timesRoman,
      color: textColor,
    });

    // Draw names
    const namesSize = 20 * scale;
    const namesWidth = timesItalic.widthOfTextAtSize(names, namesSize);
    page.drawText(names, {
      x: (widthPt - namesWidth) / 2,
      y: heightPt * 0.18,
      size: namesSize,
      font: timesItalic,
      color: accentColor,
    });

    // Draw date
    const dateSize = 10 * scale;
    const dateWidth = helvetica.widthOfTextAtSize(formattedDate, dateSize);
    page.drawText(formattedDate, {
      x: (widthPt - dateWidth) / 2,
      y: heightPt * 0.13,
      size: dateSize,
      font: helvetica,
      color: secondaryColor,
    });

    // Draw coordinates if provided
    if (coordinates) {
      const coordSize = 7 * scale;
      const coordWidth = helvetica.widthOfTextAtSize(coordinates, coordSize);
      page.drawText(coordinates, {
        x: (widthPt - coordWidth) / 2,
        y: heightPt * 0.10,
        size: coordSize,
        font: helvetica,
        color: secondaryColor,
        opacity: 0.7,
      });
    }

    // Draw tagline if provided
    if (tagline) {
      const taglineSize = 9 * scale;
      const taglineWidth = timesItalic.widthOfTextAtSize(tagline, taglineSize);
      page.drawText(tagline, {
        x: (widthPt - taglineWidth) / 2,
        y: heightPt * 0.06,
        size: taglineSize,
        font: timesItalic,
        color: secondaryColor,
        opacity: 0.8,
      });
    }

    // Draw moon phase name
    const phaseName = lang === 'de' ? moonData.name : moonData.nameEn;
    const phaseSize = 6 * scale;
    const phaseWidth = helvetica.widthOfTextAtSize(phaseName, phaseSize);
    page.drawText(phaseName, {
      x: (widthPt - phaseWidth) / 2,
      y: heightPt * 0.03,
      size: phaseSize,
      font: helvetica,
      color: secondaryColor,
      opacity: 0.5,
    });

    // Generate PDF bytes
    const pdfBytes = await pdfDoc.save();

    // Create filename
    const formatName = format.replace('x', '_');
    const filename = `mondphasen-poster-${date}-${formatName}.pdf`;

    // Convert Uint8Array to Buffer for NextResponse
    const buffer = Buffer.from(pdfBytes);

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.length.toString(),
      },
    });
  } catch (error: unknown) {
    console.error('Error generating moon poster PDF:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Could not create poster', details: errorMessage },
      { status: 500 }
    );
  }
}
