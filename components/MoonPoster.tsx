'use client';

import SunCalc from 'suncalc';
import CelestialBackground from './CelestialBackground';

type MoonPosterProps = {
  title: string;
  names: string;
  coordinates: string;
  date: string;
  tagline?: string;
  style?: 'dark' | 'midnight' | 'blue';
  locale?: string;
};

// Get moon phase name in German
function getMoonPhaseName(phase: number): string {
  if (phase < 0.03 || phase > 0.97) return 'Neumond';
  if (phase < 0.22) return 'Zunehmende Sichel';
  if (phase < 0.28) return 'Erstes Viertel';
  if (phase < 0.47) return 'Zunehmender Mond';
  if (phase < 0.53) return 'Vollmond';
  if (phase < 0.72) return 'Abnehmender Mond';
  if (phase < 0.78) return 'Letztes Viertel';
  return 'Abnehmende Sichel';
}

export default function MoonPoster({
  title,
  names,
  coordinates,
  date,
  tagline,
  style = 'midnight',
  locale = 'de-DE'
}: MoonPosterProps) {
  // Parse date immediately (not in useEffect) to avoid hydration mismatch
  const parsedDate = (() => {
    try {
      const parsed = new Date(date);
      if (!isNaN(parsed.getTime())) {
        return parsed;
      }
    } catch {
      // Fall through to default
    }
    return new Date();
  })();

  // Calculate moon phase using SunCalc
  const moonIllumination = SunCalc.getMoonIllumination(parsedDate);
  const phase = moonIllumination.phase; // 0-1 (0=new, 0.5=full, 1=new again)
  const fraction = moonIllumination.fraction; // 0-1 actual illuminated fraction
  const phaseName = getMoonPhaseName(phase);

  // Color schemes
  const colors = {
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

  const c = colors[style];

  // Format date based on locale
  const formattedDate = (() => {
    if (locale === 'en-US' || locale === 'en-GB') {
      // English: "June 30th, 2023"
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
    return parsedDate.toLocaleDateString(locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  })();

  // Moon phase shadow calculation
  // Waxing (0-0.5): light grows from RIGHT side, shadow on LEFT
  // Waning (0.5-1): light shrinks from LEFT side, shadow on RIGHT
  const isWaxing = phase < 0.5;

  // Use actual illumination fraction from SunCalc (0 = new moon, 1 = full moon)
  const illumination = fraction;

  // Calculate moon rotation based on date (simulates libration)
  // Uses day of year - more noticeable rotation so users see the effect when changing dates
  const dayOfYear = Math.floor((parsedDate.getTime() - new Date(parsedDate.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const moonRotation = (dayOfYear * 0.5) % 360; // Rotates ~0.5 degrees per day, full rotation over ~2 years

  return (
    <div
      className="w-full h-full relative"
      style={{
        aspectRatio: '500/700',
        fontFamily: 'Georgia, "Times New Roman", serif'
      }}
    >
      {/* Real celestial star background based on date */}
      <CelestialBackground
        date={parsedDate}
        longitude={13.405}
        width={500}
        height={700}
        style={style}
      />

      {/* SVG for decorations */}
      <svg
        viewBox="0 0 500 700"
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >

        {/* Gradients for decorations */}
        <defs>
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#a08020" />
            <stop offset="50%" stopColor="#d4af37" />
            <stop offset="100%" stopColor="#a08020" />
          </linearGradient>
        </defs>

      </svg>

      {/* Moon container - rotated 25 degrees clockwise, maximal groß */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '38%',
          transform: 'translate(-50%, -50%) rotate(25deg)',
          width: '75%',
          aspectRatio: '1',
        }}
      >
        {/* Moon texture - full circle */}
        <img
          src="/moon-texture.jpg"
          alt="Moon"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: '50%',
            transform: `rotate(${moonRotation}deg)`,
            filter: 'brightness(0.85) contrast(1.15) saturate(0.75)',
            zIndex: 1,
          }}
        />

        {/* 3D lighting effect - NOT rotating */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            background: `radial-gradient(circle at 35% 35%,
              rgba(255,255,255,0.05) 0%,
              transparent 25%,
              rgba(0,0,0,0.2) 55%,
              rgba(0,0,0,0.55) 80%,
              rgba(0,0,0,0.75) 100%)`,
            zIndex: 2,
          }}
        />

        {/* Moon phase shadow overlay using SVG */}
        <svg
          viewBox="0 0 100 100"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 3,
            borderRadius: '50%',
            overflow: 'hidden',
          }}
        >
          <defs>
            <clipPath id="moonClip">
              <circle cx="50" cy="50" r="50" />
            </clipPath>
            {/* Blur filter for soft terminator edge only */}
            <filter id="terminatorBlur" x="-50%" y="-10%" width="200%" height="120%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" />
            </filter>
          </defs>
          <g clipPath="url(#moonClip)">
            {/*
              Realistic moon phase shadow using SVG path with arcs.
              The terminator (line between light and dark) is always an ellipse.

              Moon phase visualization:
              - Waxing (phase 0-0.5): Light grows from RIGHT, shadow on LEFT
              - Waning (phase 0.5-1): Light shrinks from RIGHT, shadow on RIGHT

              Terminator shape:
              - Near new/full moon: terminator is nearly straight (rx → 0)
              - At quarter moons: terminator is most curved (rx = 50)

              Terminator direction:
              - Waxing crescent to first quarter (phase 0-0.25): terminator bulges LEFT (into shadow)
              - First quarter to full (phase 0.25-0.5): terminator bulges RIGHT (into lit area)
              - Full to last quarter (phase 0.5-0.75): terminator bulges LEFT (into lit area)
              - Last quarter to new (phase 0.75-1): terminator bulges RIGHT (into shadow)
            */}
            {illumination < 0.98 && (() => {
              // Special case: New moon (illumination < 8%) - slightly transparent shadow
              // so the moon texture is faintly visible
              if (illumination < 0.08) {
                // Scale opacity from 0.65 (at 0% illumination) to 0.95 (at 8%)
                // Using square root for smoother transition at lower values
                const normalizedIllum = illumination / 0.08;
                const newMoonOpacity = 0.65 + Math.sqrt(normalizedIllum) * 0.30;
                return (
                  <circle
                    cx="50"
                    cy="50"
                    r="50"
                    fill={`rgba(0,0,0,${newMoonOpacity})`}
                  />
                );
              }

              // Moon phase shadow - using the correct astronomical model
              const isCrescent = illumination < 0.5;
              const terminatorRx = Math.abs(Math.cos(illumination * Math.PI)) * 50;

              // Two layers:
              // 1. Sharp edge layer at moon boundary (prevents glow at outer edge)
              // 2. Blurred layer on top for soft terminator transition

              // Shadow opacity - lower = more transparent, moon shows through more
              const shadowOpacity = 0.65;

              if (isCrescent) {
                // CRESCENT: less than half lit (shadow > 50%)
                if (isWaxing) {
                  // Waxing crescent: lit on RIGHT, shadow on LEFT
                  return (
                    <>
                      {/* Sharp edge - covers outer moon edge exactly */}
                      <path
                        d={`M 50,0
                            A 50,50 0 1,0 50,100
                            A ${Math.max(0.1, terminatorRx)},50 0 0,0 50,0
                            Z`}
                        fill={`rgba(0,0,0,${shadowOpacity})`}
                      />
                      {/* Blurred layer on top for soft terminator */}
                      <path
                        d={`M 50,0
                            A 50,50 0 1,0 50,100
                            A ${Math.max(0.1, terminatorRx)},50 0 0,0 50,0
                            Z`}
                        fill={`rgba(0,0,0,${shadowOpacity})`}
                        filter="url(#terminatorBlur)"
                      />
                    </>
                  );
                } else {
                  // Waning crescent: lit on LEFT, shadow on RIGHT
                  return (
                    <>
                      <path
                        d={`M 50,0
                            A 50,50 0 1,1 50,100
                            A ${Math.max(0.1, terminatorRx)},50 0 0,1 50,0
                            Z`}
                        fill={`rgba(0,0,0,${shadowOpacity})`}
                      />
                      <path
                        d={`M 50,0
                            A 50,50 0 1,1 50,100
                            A ${Math.max(0.1, terminatorRx)},50 0 0,1 50,0
                            Z`}
                        fill={`rgba(0,0,0,${shadowOpacity})`}
                        filter="url(#terminatorBlur)"
                      />
                    </>
                  );
                }
              } else {
                // GIBBOUS: more than half lit (shadow < 50%)
                if (isWaxing) {
                  // Waxing gibbous: small shadow on LEFT only
                  return (
                    <>
                      <path
                        d={`M 50,0
                            A 50,50 0 0,0 50,100
                            A ${Math.max(0.1, terminatorRx)},50 0 0,1 50,0
                            Z`}
                        fill={`rgba(0,0,0,${shadowOpacity})`}
                      />
                      <path
                        d={`M 50,0
                            A 50,50 0 0,0 50,100
                            A ${Math.max(0.1, terminatorRx)},50 0 0,1 50,0
                            Z`}
                        fill={`rgba(0,0,0,${shadowOpacity})`}
                        filter="url(#terminatorBlur)"
                      />
                    </>
                  );
                } else {
                  // Waning gibbous: small shadow on RIGHT only
                  return (
                    <>
                      <path
                        d={`M 50,0
                            A 50,50 0 0,1 50,100
                            A ${Math.max(0.1, terminatorRx)},50 0 0,0 50,0
                            Z`}
                        fill={`rgba(0,0,0,${shadowOpacity})`}
                      />
                      <path
                        d={`M 50,0
                            A 50,50 0 0,1 50,100
                            A ${Math.max(0.1, terminatorRx)},50 0 0,0 50,0
                            Z`}
                        fill={`rgba(0,0,0,${shadowOpacity})`}
                        filter="url(#terminatorBlur)"
                      />
                    </>
                  );
                }
              }
            })()}
          </g>
        </svg>

      </div>

      {/* Text content */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          bottom: '8%',
          width: '85%',
          textAlign: 'center',
        }}
      >
        {/* Title - same font as date */}
        <h1
          style={{
            color: c.text,
            fontSize: '12px',
            fontWeight: 300,
            letterSpacing: '3px',
            marginBottom: '10px',
            fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
            textTransform: 'uppercase',
            lineHeight: 1.3,
          }}
        >
          {title || formattedDate}
        </h1>

        {/* Names - script/cursive style */}
        <p
          style={{
            color: c.text,
            fontSize: '14px',
            letterSpacing: '1px',
            marginBottom: '10px',
            fontFamily: '"Snell Roundhand", "Brush Script MT", "Lucida Handwriting", cursive',
            fontStyle: 'italic',
          }}
        >
          {names}
        </p>

        {/* Date */}
        <p
          style={{
            color: c.textSecondary,
            fontSize: '9px',
            letterSpacing: '2px',
            marginBottom: '4px',
            fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
            fontWeight: 300,
            textTransform: 'uppercase',
          }}
        >
          {formattedDate}
        </p>

        {/* Coordinates */}
        {coordinates && (
          <p
            style={{
              color: c.textMuted,
              fontSize: '8px',
              letterSpacing: '1.5px',
              marginBottom: '8px',
              fontFamily: '"SF Mono", "Monaco", "Inconsolata", monospace',
            }}
          >
            {coordinates}
          </p>
        )}

        {/* Tagline */}
        {tagline && (
          <p
            style={{
              color: c.textMuted,
              fontSize: '7px',
              letterSpacing: '2px',
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
              fontWeight: 400,
              textTransform: 'uppercase',
            }}
          >
            {tagline}
          </p>
        )}
      </div>
    </div>
  );
}
