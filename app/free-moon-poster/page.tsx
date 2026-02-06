'use client';

import { useState, useEffect, useRef } from 'react';
import MoonPoster from '@/components/MoonPoster';
import { translations, languageNames, type Language } from '@/lib/translations';

// Preview Modal Component
function PreviewModal({ isOpen, onClose, children, closeText }: { isOpen: boolean; onClose: () => void; children: React.ReactNode; closeText: string }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={onClose}>
      <div className="relative max-w-md w-full" onClick={e => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white text-lg"
        >
          {closeText} ✕
        </button>
        {children}
      </div>
    </div>
  );
}

// Live Notification Popup Component
function LiveNotification({ message, isVisible, justNow }: { message: string; isVisible: boolean; justNow: string }) {
  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 z-40 animate-slide-in">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3 max-w-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6z" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-gray-800">{message}</p>
            <p className="text-xs text-gray-500">{justNow}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Cities for live notifications per language
const citiesByLang: Record<Language, string[]> = {
  de: ['Berlin', 'München', 'Hamburg', 'Köln', 'Frankfurt', 'Wien', 'Zürich', 'Stuttgart'],
  en: ['London', 'New York', 'Los Angeles', 'Chicago', 'Sydney', 'Toronto', 'Dublin'],
  fr: ['Paris', 'Lyon', 'Marseille', 'Bordeaux', 'Nice', 'Toulouse', 'Bruxelles'],
  es: ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Málaga', 'Buenos Aires', 'México'],
};


// Address suggestion type
type AddressSuggestion = {
  display_name: string;
  lat: string;
  lon: string;
};

export default function FreeMoonPosterPage() {
  const [lang, setLang] = useState<Language>('de');
  const [date, setDate] = useState('');
  const [name1, setName1] = useState('');
  const [name2, setName2] = useState('');
  const [selectedTitleIndex, setSelectedTitleIndex] = useState(0);
  const [customTitle, setCustomTitle] = useState('');
  const [addressInput, setAddressInput] = useState('');
  const [coordinates, setCoordinates] = useState('');
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [tagline, setTagline] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationCity, setNotificationCity] = useState('');
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const t = translations[lang];

  // Set today's date as default
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setDate(today);
  }, []);

  // Detect language from browser
  useEffect(() => {
    const browserLang = navigator.language || (navigator as any).userLanguage;
    const langCode = browserLang?.split('-')[0].toLowerCase();
    if (langCode === 'de') {
      setLang('de');
    } else if (langCode === 'fr') {
      setLang('fr');
    } else if (langCode === 'es') {
      setLang('es');
    } else {
      setLang('en');
    }
  }, []);

  // Update document language when lang changes
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  // Show live notification once after 5 seconds
  useEffect(() => {
    const cities = citiesByLang[lang];
    const randomCity = cities[Math.floor(Math.random() * cities.length)];
    setNotificationCity(randomCity);

    const timeout = setTimeout(() => {
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 6000);
    }, 5000);

    return () => clearTimeout(timeout);
  }, [lang]);

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
            'Accept-Language': lang,
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

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

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
  const isCustomText = selectedTitleIndex === t.titleOptions.length - 1;
  const displayTitle = isCustomText ? customTitle : t.titleOptions[selectedTitleIndex];
  const displayNames = [name1, name2].filter(Boolean).join(' & ') || t.defaultNames;

  const handleGetFreePoster = async () => {
    if (!name1.trim() || !name2.trim()) {
      alert(t.namesRequired);
      return;
    }

    if (!firstName.trim()) {
      alert(t.firstNameRequired);
      return;
    }

    if (!email) {
      alert(t.emailRequired);
      return;
    }

    if (!date) {
      alert(t.dateRequired);
      return;
    }

    setIsLoading(true);
    try {
      const posterData = {
        email,
        firstName,
        title: displayTitle,
        names: displayNames,
        coordinates: coordinates || '51.5072° N, 0.1276° W',
        date: date,
        tagline,
        style: 'dark',
        language: lang,
      };

      const response = await fetch('/api/freebie-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(posterData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t.errorOccurred);
      }

      setIsSuccess(true);
    } catch (error) {
      console.error('Signup error:', error);
      alert(t.errorOccurred);
    } finally {
      setIsLoading(false);
    }
  };


  // Map language to locale
  const localeMap: Record<string, string> = {
    de: 'de-DE',
    en: 'en-US',
    fr: 'fr-FR',
    es: 'es-ES',
  };

  // Poster component for reuse
  const posterPreview = (
    <MoonPoster
      title={displayTitle}
      names={displayNames}
      coordinates={coordinates || '51.5072° N, 0.1276° W'}
      date={date || new Date().toISOString().split('T')[0]}
      tagline={tagline}
      style="dark"
      locale={localeMap[lang] || 'en-US'}
    />
  );

  // Success Screen
  if (isSuccess) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              {t.successTitle}
            </h1>
            <p className="text-gray-600 mb-6" dangerouslySetInnerHTML={{ __html: t.successText.replace('{email}', email) }} />
            <p className="text-sm text-gray-500">
              {t.successSpamNote}
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Language Switcher */}
      <div className="absolute top-4 right-4 z-10">
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {(Object.keys(languageNames) as Language[]).map((langKey) => (
            <button
              key={langKey}
              onClick={() => setLang(langKey)}
              className={`px-2 py-1 text-sm rounded-md transition ${lang === langKey ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {languageNames[langKey]}
            </button>
          ))}
        </div>
      </div>

      {/* Preview Modal for Mobile */}
      <PreviewModal isOpen={showPreview} onClose={() => setShowPreview(false)} closeText={t.closeModal}>
        <div style={{ aspectRatio: '5/7', width: '100%', borderRadius: '8px', overflow: 'hidden' }}>
          {posterPreview}
        </div>
      </PreviewModal>

      {/* Live Notification Popup */}
      <LiveNotification
        message={t.liveNotification.replace('{city}', notificationCity)}
        isVisible={showNotification}
        justNow={t.justNow}
      />

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-6 lg:py-10">
        <div className="text-center mb-6 lg:mb-10">
          {/* Urgency Badge */}
          <div className="inline-flex items-center gap-2 bg-red-100 text-red-800 text-sm font-semibold px-4 py-1 rounded-full mb-3">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            {t.urgencyBadge}
          </div>

          <div className="inline-block bg-green-100 text-green-800 text-sm font-semibold px-4 py-1 rounded-full mb-4 ml-2">
            {t.badge}
          </div>

          <h1 className="text-2xl lg:text-4xl font-normal text-gray-900 mb-3">
            {t.heroTitle}
          </h1>
          <p className="text-gray-500 max-w-xl mx-auto mb-4">
            {t.heroSubtitle}
          </p>

          {/* Social Proof */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="" className="w-8 h-8 rounded-full border-2 border-white object-cover" />
                <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="" className="w-8 h-8 rounded-full border-2 border-white object-cover" />
                <img src="https://randomuser.me/api/portraits/women/68.jpg" alt="" className="w-8 h-8 rounded-full border-2 border-white object-cover" />
                <img src="https://randomuser.me/api/portraits/men/75.jpg" alt="" className="w-8 h-8 rounded-full border-2 border-white object-cover" />
              </div>
              <span className="font-medium">{t.socialProofCount}</span>
            </div>
            <span className="hidden sm:inline text-gray-300">|</span>
            <span className="text-gray-500">{t.limitedText}</span>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">

          {/* Left - Poster Preview */}
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

          </div>

          {/* Right - Form */}
          <div>
            {/* Mobile Preview */}
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
                <p className="text-center text-xs text-gray-500 mt-3">{t.tapToEnlarge}</p>
              </div>

            </div>

            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              {t.formTitle}
            </h2>

            <div className="space-y-4">
              {/* Datum */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  {t.dateLabel} <span className="text-red-500">{t.required}</span>
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  lang={lang}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Name 1 */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  {t.name1Label} <span className="text-red-500">{t.required}</span>
                </label>
                <input
                  type="text"
                  value={name1}
                  onChange={(e) => setName1(e.target.value.slice(0, 15))}
                  placeholder={t.name1Placeholder}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Name 2 */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  {t.name2Label} <span className="text-red-500">{t.required}</span>
                </label>
                <input
                  type="text"
                  value={name2}
                  onChange={(e) => setName2(e.target.value.slice(0, 15))}
                  placeholder={t.name2Placeholder}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Text wählen */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  {t.textLabel}
                </label>
                <select
                  value={selectedTitleIndex}
                  onChange={(e) => setSelectedTitleIndex(parseInt(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  {t.titleOptions.map((title, index) => (
                    <option key={index} value={index}>{title}</option>
                  ))}
                </select>
              </div>

              {/* Custom Title Input */}
              {isCustomText && (
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    {t.customTextLabel}
                  </label>
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value.slice(0, 30))}
                    placeholder={t.customTextPlaceholder}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}

              {/* Ort */}
              <div ref={suggestionsRef} className="relative">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  {t.locationLabel} <span className="text-red-500">{t.required}</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={addressInput}
                    onChange={(e) => handleAddressChange(e.target.value)}
                    onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                    placeholder={t.locationPlaceholder}
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
                  {t.taglineLabel} <span className="text-gray-400 font-normal">{t.optional}</span>
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value.slice(0, 30))}
                  placeholder={t.taglinePlaceholder}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200 pt-4 mt-6">
                <p className="text-sm text-gray-600 mb-4">
                  {t.emailSectionText}
                </p>
              </div>

              {/* Vorname */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  {t.firstNameLabel} <span className="text-red-500">{t.required}</span>
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder={t.firstNamePlaceholder}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  {t.emailLabel} <span className="text-red-500">{t.required}</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.emailPlaceholder}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Submit Button */}
              <button
                type="button"
                onClick={handleGetFreePoster}
                disabled={isLoading}
                className="w-full py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? t.processing : t.submitButton}
              </button>

              <p className="text-center text-xs text-gray-500">
                {t.consentText}
              </p>

              {/* Trust badges */}
              <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {t.completelyFree}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  {t.instantDownload}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {t.highResolution}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonials - Horizontal Scroll */}
        <div className="mt-12 lg:mt-16 border-t border-gray-200 pt-12">
          <div className="overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
            <div className="flex gap-4" style={{ width: 'max-content' }}>
              {[
                { name: 'Lisa & Thomas', text: 'Beautiful keepsake from our wedding night!' },
                { name: 'Anna & Marco', text: 'The perfect gift for our anniversary.' },
                { name: 'Sarah & Jan', text: 'So romantic! Now hanging above our bed.' },
                { name: 'Emma & David', text: 'We absolutely love it! Such a unique idea.' },
                { name: 'Sophie & Lukas', text: 'Amazing quality and so personal!' },
                { name: 'Maria & Felix', text: 'Best anniversary gift ever received!' },
                { name: 'Julia & Tim', text: 'Everyone asks where we got it from!' },
                { name: 'Laura & Ben', text: 'The perfect reminder of our special day.' },
                { name: 'Nina & Max', text: 'Exceeded all our expectations!' },
                { name: 'Lena & Paul', text: 'Such a thoughtful and unique gift idea.' },
                { name: 'Hannah & Erik', text: 'We ordered one for every anniversary!' },
                { name: 'Mia & Jonas', text: 'Beautifully designed and meaningful.' },
                { name: 'Clara & Noah', text: 'Our guests always compliment it!' },
                { name: 'Ella & Leon', text: 'The moon was exactly right. Amazing!' },
                { name: 'Lara & Finn', text: 'Perfect addition to our bedroom!' },
                { name: 'Emily & Oscar', text: 'Love seeing it every morning.' },
                { name: 'Olivia & Henry', text: 'Such wonderful memories captured!' },
                { name: 'Amelie & Jakob', text: 'Worth every minute of creating it!' },
                { name: 'Sophia & Elias', text: 'The best free gift we ever got!' },
                { name: 'Charlotte & Liam', text: 'Absolutely stunning poster!' },
              ].map((testimonial, index) => (
                <div key={index} className="bg-gray-50 rounded-xl p-5 min-w-[280px] max-w-[280px] flex-shrink-0">
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-700 text-sm mb-3">&ldquo;{testimonial.text}&rdquo;</p>
                  <p className="text-gray-500 text-sm font-medium">- {testimonial.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-12 border-t border-gray-200 pt-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              </div>
              <h3 className="text-gray-900 font-semibold mb-1">{t.feature1Title}</h3>
              <p className="text-gray-500 text-sm">{t.feature1Text}</p>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h3 className="text-gray-900 font-semibold mb-1">{t.feature2Title}</h3>
              <p className="text-gray-500 text-sm">{t.feature2Text}</p>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
              </div>
              <h3 className="text-gray-900 font-semibold mb-1">{t.feature3Title}</h3>
              <p className="text-gray-500 text-sm">{t.feature3Text}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
