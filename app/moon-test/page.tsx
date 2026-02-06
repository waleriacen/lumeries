'use client';

import { useState } from 'react';

// Option 1: js-planet-phase Style (CSS border-radius + box-shadow with earthshine)
function MoonOption1({ phase }: { phase: number }) {
  const isWaxing = phase < 0.5;
  const illumination = phase < 0.5 ? phase * 2 : (1 - phase) * 2;

  return (
    <div className="flex flex-col items-center">
      <div className="text-white text-center mb-2 font-bold">Option 1: js-planet-phase</div>
      <div className="text-gray-400 text-xs text-center mb-4">CSS box-shadow + earthshine</div>

      <div className="relative" style={{ width: '180px', height: '180px' }}>
        <img
          src="/moon-texture.jpg"
          alt="Moon"
          className="absolute inset-0 w-full h-full object-cover rounded-full"
        />
        {/* Shadow - Waxing: shadow on LEFT, Waning: shadow on RIGHT */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'rgba(0,0,0,0.7)',
            clipPath: isWaxing
              ? `inset(0 ${illumination * 100}% 0 0)`
              : `inset(0 0 0 ${illumination * 100}%)`,
          }}
        />
        {/* Blur on terminator */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            boxShadow: `inset ${isWaxing ? '-' : ''}${20 - illumination * 20}px 0 15px rgba(0,0,0,0.5)`,
          }}
        />
      </div>
    </div>
  );
}

// Option 2: CSS Moon (simple overlay)
function MoonOption2({ phase }: { phase: number }) {
  const isWaxing = phase < 0.5;
  const illumination = phase < 0.5 ? phase * 2 : (1 - phase) * 2;
  const shadowPercent = (1 - illumination) * 100;

  return (
    <div className="flex flex-col items-center">
      <div className="text-white text-center mb-2 font-bold">Option 2: CSS Moon</div>
      <div className="text-gray-400 text-xs text-center mb-4">Einfacher Overlay</div>

      <div className="relative" style={{ width: '180px', height: '180px' }}>
        <img
          src="/moon-texture.jpg"
          alt="Moon"
          className="absolute inset-0 w-full h-full object-cover rounded-full"
        />
        {/* Shadow - Waxing: shadow on LEFT, Waning: shadow on RIGHT */}
        <div className="absolute inset-0 rounded-full overflow-hidden">
          <div
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              width: `${shadowPercent}%`,
              left: isWaxing ? 0 : 'auto',
              right: isWaxing ? 'auto' : 0,
              background: 'rgba(0,0,0,0.75)',
            }}
          />
        </div>
      </div>
    </div>
  );
}

// Option 3: SVG Moon (tingletech style) - with curved terminator
function MoonOption3({ phase }: { phase: number }) {
  const isWaxing = phase < 0.5;
  const illumination = phase < 0.5 ? phase * 2 : (1 - phase) * 2;

  const r = 75;
  const innerR = r * (1 - illumination * 2);

  // Create SVG path for shadow with curved terminator
  // Shadow covers the UNLIT portion - at crescent, most of moon is shadowed
  // Waxing: lit crescent on RIGHT grows to full moon, shadow on LEFT
  // Waning: lit part shrinks from left, shadow on RIGHT
  const createPath = () => {
    if (illumination > 0.98) return '';
    if (illumination < 0.02) {
      return `M ${r} 0 A ${r} ${r} 0 1 1 ${r} ${r*2} A ${r} ${r} 0 1 1 ${r} 0`;
    }

    const sweep1 = isWaxing ? 0 : 1;
    const sweep2 = Math.abs(innerR) < r ? (isWaxing ? 1 : 0) : (isWaxing ? 0 : 1);

    return `M ${r} 0 A ${r} ${r} 0 1 ${sweep1} ${r} ${r*2} A ${Math.abs(innerR)} ${r} 0 0 ${sweep2} ${r} 0`;
  };

  return (
    <div className="flex flex-col items-center">
      <div className="text-white text-center mb-2 font-bold">Option 3: SVG Moon</div>
      <div className="text-gray-400 text-xs text-center mb-4">SVG elliptische Bögen</div>

      <div className="relative" style={{ width: '180px', height: '180px' }}>
        <img
          src="/moon-texture.jpg"
          alt="Moon"
          className="absolute inset-0 w-full h-full object-cover rounded-full"
        />
        <svg viewBox="0 0 150 150" className="absolute inset-0 w-full h-full" style={{ borderRadius: '50%', overflow: 'hidden' }}>
          <defs>
            <clipPath id="moonClip3">
              <circle cx="75" cy="75" r="75" />
            </clipPath>
          </defs>
          <path
            d={createPath()}
            fill="rgba(0,0,0,0.6)"
            clipPath="url(#moonClip3)"
          />
        </svg>
      </div>
    </div>
  );
}

// Option 4: Pure CSS with linear-gradient
function MoonOption4({ phase }: { phase: number }) {
  const isWaxing = phase < 0.5;
  const illumination = phase < 0.5 ? phase * 2 : (1 - phase) * 2;
  const shadowPercent = (1 - illumination) * 100;

  return (
    <div className="flex flex-col items-center">
      <div className="text-white text-center mb-2 font-bold">Option 4: Linear Gradient</div>
      <div className="text-gray-400 text-xs text-center mb-4">Weicher Übergang</div>

      <div className="relative" style={{ width: '180px', height: '180px' }}>
        <img
          src="/moon-texture.jpg"
          alt="Moon"
          className="absolute inset-0 w-full h-full object-cover rounded-full"
        />
        {/* Shadow - Waxing: shadow from LEFT (270deg), Waning: shadow from RIGHT (90deg) */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `linear-gradient(${isWaxing ? '270deg' : '90deg'},
              transparent 0%,
              transparent ${illumination * 100 - 15}%,
              rgba(0,0,0,0.4) ${illumination * 100}%,
              rgba(0,0,0,0.75) ${illumination * 100 + 10}%,
              rgba(0,0,0,0.75) 100%)`,
          }}
        />
      </div>
    </div>
  );
}

// Option 5: Zimeo-style with ring
function MoonOption5({ phase }: { phase: number }) {
  const isWaxing = phase < 0.5;
  const illumination = phase < 0.5 ? phase * 2 : (1 - phase) * 2;

  return (
    <div className="flex flex-col items-center">
      <div className="text-white text-center mb-2 font-bold">Option 5: Zimeo Style</div>
      <div className="text-gray-400 text-xs text-center mb-4">Ring + durchscheinende Textur</div>

      <div className="relative" style={{ width: '180px', height: '180px' }}>
        {/* Dark ring around moon */}
        <div
          className="absolute rounded-full"
          style={{
            inset: '-8px',
            border: '10px solid rgba(35,40,50,0.95)',
          }}
        />

        {/* Moon texture */}
        <div className="absolute inset-0 rounded-full overflow-hidden">
          <img
            src="/moon-texture.jpg"
            alt="Moon"
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Shadow - Waxing: shadow from LEFT (270deg), Waning: shadow from RIGHT (90deg) */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(${isWaxing ? '270deg' : '90deg'},
                transparent 0%,
                transparent ${illumination * 100 - 10}%,
                rgba(0,0,0,0.3) ${illumination * 100}%,
                rgba(0,0,0,0.65) ${illumination * 100 + 5}%,
                rgba(0,0,0,0.65) 100%)`,
            }}
          />
        </div>

        {/* Inner shadow for depth */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            boxShadow: 'inset 0 0 30px 15px rgba(0,0,0,0.4)',
          }}
        />
      </div>
    </div>
  );
}

export default function MoonTestPage() {
  const [phase, setPhase] = useState(0.25); // Default: first quarter

  return (
    <div className="min-h-screen bg-slate-900 py-12 px-4">
      <h1 className="text-3xl font-bold text-white text-center mb-8">
        Moon Phase Rendering - 5 Optionen
      </h1>

      {/* Phase Slider */}
      <div className="max-w-md mx-auto mb-12">
        <label className="text-white block mb-2">
          Mondphase: {(phase * 100).toFixed(0)}%
          ({phase < 0.03 ? 'Neumond' :
            phase < 0.25 ? 'Zunehmende Sichel' :
            phase < 0.28 ? 'Erstes Viertel' :
            phase < 0.47 ? 'Zunehmender Mond' :
            phase < 0.53 ? 'Vollmond' :
            phase < 0.72 ? 'Abnehmender Mond' :
            phase < 0.78 ? 'Letztes Viertel' : 'Abnehmende Sichel'})
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={phase}
          onChange={(e) => setPhase(parseFloat(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-gray-400 text-sm mt-1">
          <span>Neumond</span>
          <span>Erstes Viertel</span>
          <span>Vollmond</span>
          <span>Letztes Viertel</span>
          <span>Neumond</span>
        </div>
      </div>

      {/* Moon Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <div className="rounded-xl p-6">
          <MoonOption1 phase={phase} />
        </div>
        <div className="rounded-xl p-6">
          <MoonOption2 phase={phase} />
        </div>
        <div className="rounded-xl p-6">
          <MoonOption3 phase={phase} />
        </div>
        <div className="rounded-xl p-6">
          <MoonOption4 phase={phase} />
        </div>
        <div className="rounded-xl p-6 ring-2 ring-yellow-500">
          <MoonOption5 phase={phase} />
          <div className="text-yellow-500 text-center text-sm mt-2">Empfohlen</div>
        </div>
      </div>

      <div className="text-center mt-8">
        <a href="/custom-posters" className="text-blue-400 hover:underline">
          Zurück zu Posters
        </a>
      </div>
    </div>
  );
}
