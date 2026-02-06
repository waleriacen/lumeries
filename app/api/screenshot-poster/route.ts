import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

export const maxDuration = 60; // Allow up to 60 seconds for rendering

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  // Get all poster parameters
  const title = searchParams.get('title') || '';
  const names = searchParams.get('names') || '';
  const date = searchParams.get('date') || '';
  const coordinates = searchParams.get('coordinates') || '';
  const tagline = searchParams.get('tagline') || '';
  const style = searchParams.get('style') || 'dark';
  const lang = searchParams.get('lang') || 'de';
  const format = searchParams.get('format') || '50x70';

  // Format dimensions
  const formats: Record<string, { width: number; height: number }> = {
    'a4': { width: 2480, height: 3508 },
    'a3': { width: 3508, height: 4961 },
    'a2': { width: 4961, height: 7016 },
    '50x70': { width: 5906, height: 8268 },
    '8x10': { width: 2400, height: 3000 },
    '11x14': { width: 3300, height: 4200 },
    '16x20': { width: 4800, height: 6000 },
    '18x24': { width: 5400, height: 7200 },
    '24x36': { width: 7200, height: 10800 },
  };

  const { width: targetWidth, height: targetHeight } = formats[format] || formats['50x70'];

  // Base URL for the poster preview page
  // On Vercel, use VERCEL_URL or the request host
  const vercelUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || vercelUrl || 'https://lumeries.com';

  // Build URL for the poster-only page (we'll create this)
  const posterParams = new URLSearchParams({
    title,
    names,
    date,
    coordinates,
    tagline,
    style,
    lang,
  });

  const posterUrl = `${baseUrl}/poster-render?${posterParams.toString()}`;

  try {
    // Launch browser
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: {
        width: 500,
        height: 700,
        deviceScaleFactor: targetWidth / 500, // High DPI for print quality
      },
      executablePath: await chromium.executablePath(),
      headless: true,
    });

    const page = await browser.newPage();

    // Navigate to poster page and wait for it to load
    await page.goto(posterUrl, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    });

    // Wait for the poster to be fully rendered (stars, moon, etc.)
    await page.waitForSelector('#poster-ready', { timeout: 15000 }).catch(async () => {
      // If selector not found, wait a bit more
      await new Promise(resolve => setTimeout(resolve, 3000));
    });

    // Take screenshot
    const screenshot = await page.screenshot({
      type: 'png',
      omitBackground: false,
    });

    await browser.close();

    // Convert to Buffer for NextResponse
    const buffer = Buffer.from(screenshot);

    // Return the image
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="moon-poster-${date}-${format}.png"`,
        'Cache-Control': 'public, max-age=31536000',
      },
    });
  } catch (error) {
    console.error('Screenshot error:', error);
    return NextResponse.json(
      { error: 'Failed to generate poster' },
      { status: 500 }
    );
  }
}
