'use client';

import PremiumStarMap from './PremiumStarMap';
import RealMapPoster from './RealMapPoster';
import MoonPoster from './MoonPoster';

type StarMapProps = {
  title: string;
  subtitle: string;
  date: string;
  location: string;
  coordinates?: string;
};

type SpotifyPosterProps = {
  songTitle: string;
  artist: string;
  imageUrl?: string;
  customText?: string;
};

type CoordinatesPosterProps = {
  title: string;
  subtitle: string;
  latitude: string;
  longitude: string;
  date?: string;
};

type MoonPosterProps = {
  title: string;
  names: string;
  coordinates: string;
  date: string;
  tagline?: string;
};

// Parse coordinates string to get lat/lng numbers
function parseCoordinates(coordString?: string): { lat: number; lng: number } | null {
  if (!coordString) return null;

  // Try to parse formats like "48.8566° N, 2.3522° E" or "48.8566, 2.3522"
  const patterns = [
    /(-?\d+\.?\d*)°?\s*([NS])?\s*,?\s*(-?\d+\.?\d*)°?\s*([EW])?/i,
    /(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)/
  ];

  for (const pattern of patterns) {
    const match = coordString.match(pattern);
    if (match) {
      let lat = parseFloat(match[1]);
      let lng = parseFloat(match[3] || match[2]);

      // Handle N/S/E/W
      if (match[2]?.toUpperCase() === 'S') lat = -lat;
      if (match[4]?.toUpperCase() === 'W') lng = -lng;

      return { lat, lng };
    }
  }

  return null;
}

// Star Map Generator - Shows REAL constellations for a specific date/location
export function StarMapTemplate({ title, subtitle, date, location, coordinates }: StarMapProps) {
  // Parse coordinates or use defaults based on common locations
  const parsed = parseCoordinates(coordinates);
  let lat = parsed?.lat ?? 48.8566;
  let lng = parsed?.lng ?? 2.3522;

  // Try to guess coordinates from location name if not provided
  if (!parsed && location) {
    const locationLower = location.toLowerCase();
    if (locationLower.includes('paris')) { lat = 48.8566; lng = 2.3522; }
    else if (locationLower.includes('new york')) { lat = 40.7128; lng = -74.006; }
    else if (locationLower.includes('london')) { lat = 51.5074; lng = -0.1278; }
    else if (locationLower.includes('tokyo')) { lat = 35.6762; lng = 139.6503; }
    else if (locationLower.includes('berlin')) { lat = 52.52; lng = 13.405; }
    else if (locationLower.includes('sydney')) { lat = -33.8688; lng = 151.2093; }
    else if (locationLower.includes('los angeles')) { lat = 34.0522; lng = -118.2437; }
    else if (locationLower.includes('rome')) { lat = 41.9028; lng = 12.4964; }
    else if (locationLower.includes('amsterdam')) { lat = 52.3676; lng = 4.9041; }
    else if (locationLower.includes('dubai')) { lat = 25.2048; lng = 55.2708; }
  }

  // Parse date string to proper format for the star calculator
  let dateStr = date;
  try {
    const parsed = new Date(date);
    if (!isNaN(parsed.getTime())) {
      dateStr = parsed.toISOString().split('T')[0];
    }
  } catch {
    // Keep original date string
  }

  return (
    <PremiumStarMap
      title={title}
      subtitle={subtitle}
      date={dateStr}
      location={location}
      coordinates={coordinates}
      style="midnight"
    />
  );
}

// Spotify Song Poster - Album cover style with custom song
export function SpotifyPosterTemplate({ songTitle, artist, imageUrl, customText }: SpotifyPosterProps) {
  return (
    <svg
      viewBox="0 0 500 700"
      className="w-full h-full"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background */}
      <rect width="500" height="700" fill="#000000" />

      {/* Album Cover Area */}
      <rect x="50" y="50" width="400" height="400" fill="#1DB954" opacity="0.1" />

      {/* Gradient overlay */}
      <defs>
        <linearGradient id="spotifyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1DB954" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#191414" stopOpacity="0.9" />
        </linearGradient>
      </defs>

      <rect x="50" y="50" width="400" height="400" fill="url(#spotifyGradient)" />

      {/* Spotify Code (decorative bars) */}
      <g transform="translate(100, 250)">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19].map((i) => {
          const seed = i * 3571; // Deterministic seed
          return (
            <rect
              key={i}
              x={i * 15}
              y={(seed % 50)}
              width="10"
              height={(seed % 80) + 40}
              fill="#FFFFFF"
              opacity="0.8"
            />
          );
        })}
      </g>

      {/* Song Title */}
      <text
        x="250"
        y="520"
        textAnchor="middle"
        fill="#FFFFFF"
        fontSize="36"
        fontFamily="'Montserrat', sans-serif"
        fontWeight="700"
      >
        {songTitle}
      </text>

      {/* Artist */}
      <text
        x="250"
        y="555"
        textAnchor="middle"
        fill="#B3B3B3"
        fontSize="20"
        fontFamily="'Montserrat', sans-serif"
        fontWeight="400"
      >
        {artist}
      </text>

      {/* Custom Text */}
      {customText && (
        <text
          x="250"
          y="600"
          textAnchor="middle"
          fill="#1DB954"
          fontSize="16"
          fontFamily="'Montserrat', sans-serif"
          fontStyle="italic"
        >
          {customText}
        </text>
      )}

      {/* Spotify Logo */}
      <g transform="translate(220, 630)">
        <circle cx="30" cy="15" r="15" fill="#1DB954" />
        <g transform="translate(30, 15)" fill="#000000">
          <path d="M -6,-4 Q 0,-2 6,-4" stroke="#000000" strokeWidth="1.5" fill="none" />
          <path d="M -5,-1 Q 0,1 5,-1" stroke="#000000" strokeWidth="1.5" fill="none" />
          <path d="M -4,2 Q 0,4 4,2" stroke="#000000" strokeWidth="1.5" fill="none" />
        </g>
      </g>

      {/* Decorative border */}
      <rect
        x="30"
        y="30"
        width="440"
        height="640"
        fill="none"
        stroke="#1DB954"
        strokeWidth="1"
        opacity="0.3"
      />
    </svg>
  );
}

// Coordinates Poster - Shows REAL map with latitude/longitude of special place
export function CoordinatesPosterTemplate({ title, subtitle, latitude, longitude, date }: CoordinatesPosterProps) {
  return (
    <RealMapPoster
      title={title}
      subtitle={subtitle}
      latitude={latitude}
      longitude={longitude}
      date={date}
      style="dark"
    />
  );
}

// Moon Phase Poster - Shows the REAL moon phase for a specific date
export function MoonPosterTemplate({ title, names, coordinates, date, tagline }: MoonPosterProps) {
  return (
    <MoonPoster
      title={title}
      names={names}
      coordinates={coordinates}
      date={date}
      tagline={tagline}
      style="midnight"
    />
  );
}
