'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import MoonPoster from '@/components/MoonPoster';

// Preview Modal Component
function PreviewModal({ isOpen, onClose, children }: { isOpen: boolean; onClose: () => void; children: React.ReactNode }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={onClose}>
      <div className="relative max-w-md w-full" onClick={e => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white text-lg"
        >
          Schließen ✕
        </button>
        {children}
      </div>
    </div>
  );
}

// Background/style options
const styleOptions = [
  { id: 'midnight', label: 'Mitternacht' },
  { id: 'dark', label: 'Dunkel' },
  { id: 'blue', label: 'Blau' },
] as const;

// Title text options
const titleOptions = [
  'Die Nacht unserer Hochzeit',
  'Die Nacht als wir uns trafen',
  'Die Nacht als du geboren wurdest',
  'Der Mond in dieser Nacht',
  'Unsere erste Nacht',
  'Vollmond',
  'Eigener Text',
];

// Address suggestion type
type AddressSuggestion = {
  display_name: string;
  lat: string;
  lon: string;
};

export default function MoonPosterPage() {
  const [selectedStyle, setSelectedStyle] = useState<'midnight' | 'dark' | 'blue'>('midnight');
  const [date, setDate] = useState('');
  const [name1, setName1] = useState('');
  const [name2, setName2] = useState('');
  const [selectedTitle, setSelectedTitle] = useState(titleOptions[0]);
  const [customTitle, setCustomTitle] = useState('');
  const [addressInput, setAddressInput] = useState('');
  const [coordinates, setCoordinates] = useState('');
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [tagline, setTagline] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search for addresses using Nominatim API
  const searchAddress = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'de',
          },
        }
      );
      const data = await response.json();
      setSuggestions(data);
      setShowSuggestions(data.length > 0);
    } catch (error) {
      console.error('Address search error:', error);
      setSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle address input change with debounce
  const handleAddressChange = (value: string) => {
    setAddressInput(value);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Debounce search
    searchTimeoutRef.current = setTimeout(() => {
      searchAddress(value);
    }, 300);
  };

  // Handle suggestion selection
  const selectSuggestion = (suggestion: AddressSuggestion) => {
    const lat = parseFloat(suggestion.lat);
    const lon = parseFloat(suggestion.lon);
    const latDir = lat >= 0 ? 'N' : 'S';
    const lonDir = lon >= 0 ? 'E' : 'W';
    const coordString = `${Math.abs(lat).toFixed(4)}° ${latDir}, ${Math.abs(lon).toFixed(4)}° ${lonDir}`;

    setAddressInput(suggestion.display_name.split(',').slice(0, 2).join(', '));
    setCoordinates(coordString);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  // Build display values
  const displayTitle = selectedTitle === 'Eigener Text' ? customTitle : selectedTitle;
  const displayNames = [name1, name2].filter(Boolean).join(' & ') || 'Sarah & Michael';

  const handleCheckout = async () => {
    if (!email) {
      alert('Bitte E-Mail-Adresse eingeben');
      return;
    }

    setIsLoading(true);
    try {
      const customizationData = {
        email,
        title: displayTitle,
        names: displayNames,
        coordinates,
        date: date || new Date().toISOString().split('T')[0],
        tagline,
        style: selectedStyle,
      };

      const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: 'Moon Phase Poster',
          price: 29.99,
          customizationData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout');
      }

      // Redirect to Stripe Checkout URL
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.');
    } finally {
      setIsLoading(false);
    }
  };

  // Style for background colors matching the poster
  const getStyleBackground = (styleId: string) => {
    switch (styleId) {
      case 'midnight':
        return 'linear-gradient(135deg, #0a0e1a 0%, #1a1f35 50%, #0a0e1a 100%)';
      case 'dark':
        return 'linear-gradient(135deg, #0f0f15 0%, #1a1a22 50%, #0f0f15 100%)';
      case 'blue':
        return 'linear-gradient(135deg, #0a1628 0%, #152540 50%, #0a1628 100%)';
      default:
        return 'linear-gradient(135deg, #0a0e1a 0%, #1a1f35 50%, #0a0e1a 100%)';
    }
  };

  // Poster component for reuse
  const posterPreview = (
    <MoonPoster
      title={displayTitle}
      names={displayNames}
      coordinates={coordinates || '51.5072° N, 0.1276° W'}
      date={date || new Date().toISOString().split('T')[0]}
      tagline={tagline}
      style={selectedStyle}
    />
  );

  return (
    <main className="min-h-screen bg-white">
      {/* Preview Modal for Mobile */}
      <PreviewModal isOpen={showPreview} onClose={() => setShowPreview(false)}>
        <div style={{ aspectRatio: '5/7', width: '100%', borderRadius: '8px', overflow: 'hidden' }}>
          {posterPreview}
        </div>
      </PreviewModal>

      {/* Header */}
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <Link href="/custom-posters" className="text-gray-500 hover:text-gray-900 transition text-sm">
            ← Zurück zur Übersicht
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 lg:py-10">
        {/* Desktop: Image left, form right / Mobile: form only */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

          {/* Left - Product Image Preview - HIDDEN on mobile, shown on desktop */}
          <div className="hidden lg:block lg:sticky lg:top-6 lg:self-start">
            <div className="bg-gray-50 rounded-lg p-8">
              <div style={{
                aspectRatio: '5/7',
                width: '100%',
                maxWidth: '400px',
                margin: '0 auto',
                borderRadius: '4px',
                overflow: 'hidden',
                boxShadow: '0 15px 40px -10px rgba(0, 0, 0, 0.35)',
              }}>
                {posterPreview}
              </div>
            </div>

            {/* Thumbnail gallery */}
            <div className="flex gap-3 justify-center mt-4">
              {styleOptions.map((style) => (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => setSelectedStyle(style.id)}
                  className={`w-16 rounded overflow-hidden transition-all ${
                    selectedStyle === style.id
                      ? 'ring-2 ring-gray-900'
                      : 'ring-1 ring-gray-200 hover:ring-gray-400 opacity-70 hover:opacity-100'
                  }`}
                  style={{ background: getStyleBackground(style.id), height: '88px' }}
                >
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 opacity-80" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right/Main - Form */}
          <div>
            {/* Mobile Preview - shown only on mobile, at top */}
            <div className="lg:hidden mb-6">
              <div
                className="bg-gray-100 rounded-xl p-4 cursor-pointer"
                onClick={() => setShowPreview(true)}
              >
                <div style={{
                  aspectRatio: '5/7',
                  width: '100%',
                  maxWidth: '200px',
                  margin: '0 auto',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.3)',
                }}>
                  {posterPreview}
                </div>
                <p className="text-center text-xs text-gray-500 mt-3">Tippe zum Vergrößern</p>
              </div>
            </div>

            {/* Product Title & Price */}
            <div className="mb-6 lg:mb-8">
              <h1 className="text-2xl lg:text-3xl font-normal text-gray-900 mb-2">Mondphasen Poster</h1>
              <p className="text-gray-500 text-sm mb-3 hidden lg:block">Personalisiertes Poster mit dem Mond deiner besonderen Nacht</p>
              <div className="flex items-baseline gap-2">
                <span className="text-xl lg:text-2xl text-gray-900">29,99 €</span>
                <span className="text-sm text-gray-500">inkl. MwSt.</span>
              </div>
            </div>

            <div className="space-y-5">
              {/* Hintergrund wählen - with poster preview thumbnails */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Hintergrund wählen <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-3">
                  {styleOptions.map((style) => (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => setSelectedStyle(style.id)}
                      className={`relative w-16 h-20 rounded overflow-hidden transition-all ${
                        selectedStyle === style.id
                          ? 'ring-2 ring-blue-500'
                          : 'ring-1 ring-gray-200 hover:ring-gray-400'
                      }`}
                      style={{ background: getStyleBackground(style.id) }}
                    >
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 opacity-80" />
                      </div>
                      {selectedStyle === style.id && (
                        <div className="absolute bottom-1 left-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Datum */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Datum <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-48 px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Name 1 */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Name 1 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={name1}
                    onChange={(e) => setName1(e.target.value.slice(0, 15))}
                    placeholder="Charlie"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                    {name1.length}/15
                  </span>
                </div>
              </div>

              {/* Name 2 */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Name 2 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={name2}
                    onChange={(e) => setName2(e.target.value.slice(0, 15))}
                    placeholder="Sophia"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                    {name2.length}/15
                  </span>
                </div>
              </div>

              {/* Text wählen */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Text wählen <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={selectedTitle}
                    onChange={(e) => setSelectedTitle(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white appearance-none"
                  >
                    {titleOptions.map((title) => (
                      <option key={title} value={title}>{title}</option>
                    ))}
                  </select>
                  <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Custom Title Input */}
              {selectedTitle === 'Eigener Text' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Eigener Text <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value.slice(0, 30))}
                    placeholder="Dein eigener Text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}

              {/* Ort */}
              <div ref={suggestionsRef} className="relative">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Ort <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={addressInput}
                    onChange={(e) => handleAddressChange(e.target.value)}
                    onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                    placeholder="Stadt oder Adresse eingeben..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {isSearching && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <svg className="animate-spin w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  )}
                </div>
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg mt-1 shadow-lg z-50 max-h-48 overflow-y-auto">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => selectSuggestion(suggestion)}
                        className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                      >
                        {suggestion.display_name}
                      </button>
                    ))}
                  </div>
                )}
                {coordinates && <p className="text-xs text-gray-500 mt-2">{coordinates}</p>}
              </div>

              {/* Tagline */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Tagline <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value.slice(0, 30))}
                  placeholder="Love Always & Forever"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  E-Mail Adresse <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="deine@email.de"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-2">Hierhin senden wir deinen Download-Link</p>
              </div>

              {/* Buttons - Fixed at bottom on mobile */}
              <div className="pt-4 space-y-3">
                {/* Preview Button - only on mobile */}
                <button
                  type="button"
                  onClick={() => setShowPreview(true)}
                  className="lg:hidden w-full py-4 bg-white text-blue-600 font-semibold rounded-lg border-2 border-blue-600 hover:bg-blue-50 transition"
                >
                  Vorschau
                </button>

                {/* Add to Cart Button */}
                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={isLoading}
                  className="w-full py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Wird verarbeitet...' : 'In den Warenkorb'}
                </button>
              </div>

              <p className="text-center text-sm text-gray-500">
                Sofortiger Download nach Bezahlung
              </p>

              {/* Trust badges */}
              <div className="flex items-center justify-center gap-6 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Sichere Zahlung
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Sofort-Download
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
