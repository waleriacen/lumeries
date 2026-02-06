'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import MoonPoster from '@/components/MoonPoster';

function PosterRenderContent() {
  const searchParams = useSearchParams();
  const [isReady, setIsReady] = useState(false);

  // Get parameters from URL
  const title = searchParams.get('title') || '';
  const names = searchParams.get('names') || '';
  const date = searchParams.get('date') || '';
  const coordinates = searchParams.get('coordinates') || '';
  const tagline = searchParams.get('tagline') || '';
  const style = (searchParams.get('style') || 'dark') as 'dark' | 'midnight' | 'blue';
  const lang = searchParams.get('lang') || 'de';

  // Get locale for date formatting
  const locale = lang === 'de' ? 'de-DE' : lang === 'fr' ? 'fr-FR' : lang === 'es' ? 'es-ES' : 'en-US';

  // Mark as ready after everything has loaded
  useEffect(() => {
    // Wait for images and canvas to load
    const checkReady = async () => {
      // Wait for moon texture to load
      const moonImg = new Image();
      moonImg.src = '/moon-texture.jpg';
      await new Promise<void>((resolve) => {
        if (moonImg.complete) {
          resolve();
        } else {
          moonImg.onload = () => resolve();
          moonImg.onerror = () => resolve();
        }
      });

      // Wait for star data to load
      try {
        await fetch('/celestial-data/stars.6.json');
      } catch {}

      // Additional wait for canvas rendering
      await new Promise(resolve => setTimeout(resolve, 1000));

      setIsReady(true);
    };

    checkReady();
  }, []);

  return (
    <>
      {/* Ready marker for Puppeteer */}
      {isReady && <div id="poster-ready" style={{ display: 'none' }} />}

      {/* The poster at exact dimensions */}
      <div
        style={{
          width: '500px',
          height: '700px',
          margin: 0,
          padding: 0,
          overflow: 'hidden',
        }}
      >
        <MoonPoster
          title={title}
          names={names}
          coordinates={coordinates}
          date={date}
          tagline={tagline}
          style={style}
          locale={locale}
        />
      </div>
    </>
  );
}

export default function PosterRenderPage() {
  return (
    <div style={{ margin: 0, padding: 0, background: '#000', minHeight: '100vh' }}>
      <Suspense fallback={<div style={{ width: 500, height: 700, background: '#0a0e1a' }} />}>
        <PosterRenderContent />
      </Suspense>
    </div>
  );
}
