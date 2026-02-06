'use client';

import { useEffect, useRef } from 'react';

type RealMapPosterProps = {
  title: string;
  subtitle: string;
  latitude: string;
  longitude: string;
  date?: string;
  style?: 'dark' | 'light' | 'streets';
};

// Parse coordinate string to number
function parseCoordinate(coord: string): number | null {
  if (!coord) return null;

  const cleaned = coord.replace(/[°'"]/g, '').trim();
  const match = cleaned.match(/(-?\d+\.?\d*)\s*([NSEW])?/i);
  if (!match) return null;

  let value = parseFloat(match[1]);
  const direction = match[2]?.toUpperCase();

  if (direction === 'S' || direction === 'W') {
    value = -Math.abs(value);
  }

  return isNaN(value) ? null : value;
}

// Format coordinate for display
function formatCoordinate(value: number, isLatitude: boolean): string {
  const direction = isLatitude
    ? (value >= 0 ? 'N' : 'S')
    : (value >= 0 ? 'E' : 'W');
  return `${Math.abs(value).toFixed(4)}° ${direction}`;
}

export default function RealMapPoster({
  title,
  subtitle,
  latitude,
  longitude,
  date,
  style = 'dark'
}: RealMapPosterProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse coordinates
  const lat = parseCoordinate(latitude) ?? 48.8566;
  const lng = parseCoordinate(longitude) ?? 2.3522;

  // Mapbox style IDs
  const styleMap = {
    dark: 'dark-v11',
    light: 'light-v11',
    streets: 'streets-v12'
  };

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || 'pk.eyJ1IjoicGFzc2l2ZWJ5d2FsZXJpYSIsImEiOiJjbWs1dnlyZHAwOGx1M2ZzOHhoMmZqNm94In0.M8YVlrDG_yAwpGsImayLvg';

  // Mapbox Static API URL
  const zoom = 14;
  const width = 800;
  const height = 560;
  const marker = `pin-l+e74c3c(${lng},${lat})`;
  const mapUrl = `https://api.mapbox.com/styles/v1/mapbox/${styleMap[style]}/static/${marker}/${lng},${lat},${zoom},0/${width}x${height}@2x?access_token=${mapboxToken}`;

  // Color schemes
  const colors = {
    dark: {
      bg: '#0f0f1a',
      accent: '#e74c3c',
      text: '#ffffff',
      textSecondary: '#a0a0c0',
      textMuted: '#666680'
    },
    light: {
      bg: '#f5f5f0',
      accent: '#c0392b',
      text: '#2c2c2c',
      textSecondary: '#5a5a5a',
      textMuted: '#888888'
    },
    streets: {
      bg: '#f8f8f8',
      accent: '#e74c3c',
      text: '#1a1a1a',
      textSecondary: '#4a4a4a',
      textMuted: '#808080'
    }
  };

  const c = colors[style];

  // Hide Mapbox logo via CSS after component mounts
  useEffect(() => {
    if (containerRef.current) {
      const style = document.createElement('style');
      style.textContent = `
        .map-container img {
          object-fit: cover;
        }
      `;
      document.head.appendChild(style);
      return () => {
        document.head.removeChild(style);
      };
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{
        backgroundColor: c.bg,
        aspectRatio: '500/700',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Georgia, "Times New Roman", serif'
      }}
    >
      {/* Map container - crops out the bottom where the logo is */}
      <div
        className="map-container"
        style={{
          margin: '20px 20px 0 20px',
          height: '45%',
          borderRadius: '4px',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        <img
          src={mapUrl}
          alt="Map"
          style={{
            width: '100%',
            height: '120%', // Make image taller than container
            objectFit: 'cover',
            objectPosition: 'center top', // Position from top, cutting off bottom logo
          }}
        />
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
        textAlign: 'center'
      }}>
        {/* Title */}
        <h1 style={{
          color: c.text,
          fontSize: '28px',
          fontWeight: 700,
          margin: '0 0 8px 0'
        }}>
          {title}
        </h1>

        {/* Decorative line */}
        <div style={{
          width: '150px',
          height: '2px',
          backgroundColor: c.accent,
          opacity: 0.6,
          margin: '12px 0'
        }} />

        {/* Subtitle */}
        <p style={{
          color: c.textSecondary,
          fontSize: '14px',
          fontStyle: 'italic',
          margin: '0 0 20px 0'
        }}>
          {subtitle}
        </p>

        {/* Coordinates */}
        <div style={{
          fontFamily: "'Courier New', monospace",
          color: c.accent,
          fontSize: '20px',
          fontWeight: 600,
          letterSpacing: '2px',
          lineHeight: 1.5
        }}>
          <div>{formatCoordinate(lat, true)}</div>
          <div>{formatCoordinate(lng, false)}</div>
        </div>

        {/* Date */}
        {date && (
          <p style={{
            color: c.textMuted,
            fontSize: '12px',
            letterSpacing: '3px',
            marginTop: '16px'
          }}>
            {date}
          </p>
        )}
      </div>
    </div>
  );
}
