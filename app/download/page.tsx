'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import MoonPoster from '@/components/MoonPoster';
import { generatePosterPNG } from '@/lib/posterExport';

// Scale factors for different print sizes (base is 500x700px)
const POSTER_FORMATS = {
  eu: [
    { id: 'a4', name: 'A4', size: '21 x 29.7 cm', width: 2480, height: 3508 },
    { id: 'a3', name: 'A3', size: '29.7 x 42 cm', width: 3508, height: 4961 },
    { id: 'a2', name: 'A2', size: '42 x 59.4 cm', width: 4961, height: 7016 },
    { id: '50x70', name: '50x70', size: '50 x 70 cm', width: 5906, height: 8268, popular: true },
  ],
  us: [
    { id: '8x10', name: '8x10"', size: '20 x 25 cm', width: 2400, height: 3000 },
    { id: '11x14', name: '11x14"', size: '28 x 36 cm', width: 3300, height: 4200 },
    { id: '16x20', name: '16x20"', size: '41 x 51 cm', width: 4800, height: 6000 },
    { id: '18x24', name: '18x24"', size: '46 x 61 cm', width: 5400, height: 7200, popular: true },
    { id: '24x36', name: '24x36"', size: '61 x 91 cm', width: 7200, height: 10800 },
  ],
};

type Language = 'de' | 'en' | 'fr' | 'es';

const translations: Record<Language, {
  title: string;
  subtitle: string;
  selectFormat: string;
  euFormats: string;
  usFormats: string;
  popular: string;
  download: string;
  downloading: string;
  yourPoster: string;
  printTip: string;
  printTipText: string;
  preparing: string;
  saveToPhotos: string;
  saveToPhotosText: string;
  gotIt: string;
}> = {
  de: {
    title: 'Dein Mondphasen-Poster',
    subtitle: 'Wähle dein Druckformat',
    selectFormat: 'Format auswählen',
    euFormats: 'Europäische Formate',
    usFormats: 'US-Formate',
    popular: 'Beliebt',
    download: 'PNG herunterladen',
    downloading: 'Wird erstellt...',
    yourPoster: 'Dein personalisiertes Poster',
    printTip: 'Drucktipp',
    printTipText: 'Für beste Ergebnisse empfehlen wir den Druck auf mattem Fotopapier (mindestens 200g/m²) bei einer lokalen Druckerei.',
    preparing: 'Poster wird vorbereitet...',
    saveToPhotos: 'In Fotos speichern',
    saveToPhotosText: 'Um das Bild in deine Fotos zu speichern, öffne es in der Dateien-App und tippe auf "Teilen" → "Bild sichern".',
    gotIt: 'Verstanden',
  },
  en: {
    title: 'Your Moon Phase Poster',
    subtitle: 'Choose your print format',
    selectFormat: 'Select format',
    euFormats: 'European Formats',
    usFormats: 'US Formats',
    popular: 'Popular',
    download: 'Download PNG',
    downloading: 'Creating...',
    yourPoster: 'Your personalized poster',
    printTip: 'Print tip',
    printTipText: 'For best results, we recommend printing on matte photo paper (at least 200gsm) at a local print shop.',
    preparing: 'Preparing poster...',
    saveToPhotos: 'Save to Photos',
    saveToPhotosText: 'To save the image to your Photos, open it in the Files app and tap "Share" → "Save Image".',
    gotIt: 'Got it',
  },
  fr: {
    title: 'Votre poster de phases lunaires',
    subtitle: 'Choisissez votre format d\'impression',
    selectFormat: 'Sélectionner le format',
    euFormats: 'Formats européens',
    usFormats: 'Formats US',
    popular: 'Populaire',
    download: 'Télécharger PNG',
    downloading: 'Création...',
    yourPoster: 'Votre poster personnalisé',
    printTip: 'Conseil d\'impression',
    printTipText: 'Pour de meilleurs résultats, nous recommandons l\'impression sur papier photo mat (au moins 200g/m²) dans une imprimerie locale.',
    preparing: 'Préparation du poster...',
    saveToPhotos: 'Enregistrer dans Photos',
    saveToPhotosText: 'Pour enregistrer l\'image dans vos Photos, ouvrez-la dans l\'app Fichiers et appuyez sur "Partager" → "Enregistrer l\'image".',
    gotIt: 'Compris',
  },
  es: {
    title: 'Tu póster de fases lunares',
    subtitle: 'Elige tu formato de impresión',
    selectFormat: 'Seleccionar formato',
    euFormats: 'Formatos europeos',
    usFormats: 'Formatos US',
    popular: 'Popular',
    download: 'Descargar PNG',
    downloading: 'Creando...',
    yourPoster: 'Tu póster personalizado',
    printTip: 'Consejo de impresión',
    printTipText: 'Para mejores resultados, recomendamos imprimir en papel fotográfico mate (al menos 200g/m²) en una imprenta local.',
    preparing: 'Preparando póster...',
    saveToPhotos: 'Guardar en Fotos',
    saveToPhotosText: 'Para guardar la imagen en tus Fotos, ábrela en la app Archivos y toca "Compartir" → "Guardar imagen".',
    gotIt: 'Entendido',
  },
};

function DownloadPageContent() {
  const searchParams = useSearchParams();
  const [selectedFormat, setSelectedFormat] = useState('50x70');
  const [isDownloading, setIsDownloading] = useState(false);
  const [region, setRegion] = useState<'eu' | 'us'>('eu');

  // Get parameters from URL
  const title = searchParams.get('title') || '';
  const names = searchParams.get('names') || '';
  const date = searchParams.get('date') || '';
  const coordinates = searchParams.get('coordinates') || '';
  const tagline = searchParams.get('tagline') || '';
  const style = (searchParams.get('style') || 'dark') as 'dark' | 'midnight' | 'blue';
  const lang = (searchParams.get('lang') as Language) || 'de';

  const t = translations[lang] || translations.en;

  // Get locale for date formatting
  const locale = lang === 'de' ? 'de-DE' : lang === 'fr' ? 'fr-FR' : lang === 'es' ? 'es-ES' : 'en-US';

  // Detect region based on language
  useEffect(() => {
    if (lang === 'en') {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (timezone.startsWith('America/')) {
        setRegion('us');
        setSelectedFormat('18x24');
      }
    }
  }, [lang]);

  const [downloadProgress, setDownloadProgress] = useState(0);
  const [showSaveHint, setShowSaveHint] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
    };
    checkMobile();
  }, []);

  const handleDownload = async () => {
    setIsDownloading(true);
    setDownloadProgress(0);

    try {
      // Get target dimensions for selected format
      const allFormats = [...POSTER_FORMATS.eu, ...POSTER_FORMATS.us];
      const format = allFormats.find(f => f.id === selectedFormat) || allFormats[3];

      // Generate poster using client-side canvas
      const blob = await generatePosterPNG(
        {
          title,
          names,
          coordinates,
          date,
          tagline,
          style,
          locale,
        },
        format.width,
        format.height,
        (progress) => setDownloadProgress(progress)
      );

      // Download the blob
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `moon-poster-${date}-${selectedFormat}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setIsDownloading(false);
      setDownloadProgress(0);

      // Show save to photos hint on mobile
      if (isMobile) {
        setShowSaveHint(true);
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('Download failed. Please try again.');
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0e1a] via-[#1a1f35] to-[#0a0e1a] text-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-serif mb-2">{t.title}</h1>
          <p className="text-gray-400">{t.subtitle}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Preview - using MoonPoster for visual preview */}
          <div className="bg-[#0f1320] rounded-2xl p-6 border border-gray-800">
            <p className="text-sm text-gray-400 mb-4">{t.yourPoster}</p>
            <div className="aspect-[5/7] rounded-lg overflow-hidden">
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
          </div>

          {/* Format Selection */}
          <div>
            {/* Region Toggle */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => {
                  setRegion('eu');
                  setSelectedFormat('50x70');
                }}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition ${
                  region === 'eu'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {t.euFormats}
              </button>
              <button
                onClick={() => {
                  setRegion('us');
                  setSelectedFormat('18x24');
                }}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition ${
                  region === 'us'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {t.usFormats}
              </button>
            </div>

            {/* Format Grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {POSTER_FORMATS[region].map((format) => (
                <button
                  key={format.id}
                  onClick={() => setSelectedFormat(format.id)}
                  className={`relative p-4 rounded-xl border-2 transition text-left ${
                    selectedFormat === format.id
                      ? 'border-indigo-500 bg-indigo-500/10'
                      : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                  }`}
                >
                  {format.popular && (
                    <span className="absolute -top-2 -right-2 bg-amber-500 text-black text-xs px-2 py-0.5 rounded-full font-medium">
                      {t.popular}
                    </span>
                  )}
                  <p className="font-bold text-lg">{format.name}</p>
                  <p className="text-sm text-gray-400">{format.size}</p>
                </button>
              ))}
            </div>

            {/* Download Button */}
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="relative w-full py-4 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:cursor-wait rounded-xl font-bold text-lg transition flex items-center justify-center gap-2 overflow-hidden"
            >
              {/* Progress bar background */}
              {isDownloading && (
                <div
                  className="absolute inset-0 bg-green-500/30 transition-all duration-300"
                  style={{ width: `${downloadProgress}%` }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                {isDownloading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    {t.downloading} {downloadProgress > 0 && `${downloadProgress}%`}
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {t.download}
                  </>
                )}
              </span>
            </button>

            {/* Save to Photos Hint (mobile only) */}
            {showSaveHint && (
              <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                <p className="text-blue-400 font-medium text-sm mb-1">{t.saveToPhotos}</p>
                <p className="text-gray-400 text-sm mb-3">{t.saveToPhotosText}</p>
                <button
                  onClick={() => setShowSaveHint(false)}
                  className="text-blue-400 text-sm font-medium hover:text-blue-300 transition"
                >
                  {t.gotIt}
                </button>
              </div>
            )}

            {/* Print Tip */}
            <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
              <p className="text-amber-400 font-medium text-sm mb-1">{t.printTip}</p>
              <p className="text-gray-400 text-sm">{t.printTipText}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>Lumeries</p>
        </div>
      </div>
    </div>
  );
}

export default function DownloadPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-[#0a0e1a] via-[#1a1f35] to-[#0a0e1a] flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-white border-t-transparent rounded-full" />
      </div>
    }>
      <DownloadPageContent />
    </Suspense>
  );
}
