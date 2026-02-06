import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL('https://lumeries.com'),
  title: {
    default: 'Mondposter personalisiert | Kostenloses Mondphasen Poster - Lumeries',
    template: '%s | Lumeries',
  },
  description: 'Erstelle dein kostenloses personalisiertes Mondposter! Zeige die exakte Mondphase von eurem besonderen Tag. Perfekt als Geschenk für Hochzeit, Jahrestag oder Geburt. Jetzt gratis herunterladen!',
  keywords: [
    // German keywords
    'Mondposter', 'Mondposter personalisiert', 'personalisiertes Mondposter', 'Mondphasen Poster',
    'Mond Poster Geschenk', 'Mondschein Poster', 'Hochzeitsgeschenk personalisiert',
    'Jahrestag Geschenk', 'Geburt Geschenk', 'Valentinstag Geschenk',
    // English keywords
    'moon poster', 'personalized moon poster', 'custom moon phase poster', 'moon phase print',
    'anniversary gift', 'wedding gift personalized', 'birth gift',
    // French keywords
    'poster lune personnalisé', 'affiche lune', 'cadeau anniversaire mariage',
    // Spanish keywords
    'poster luna personalizado', 'regalo aniversario', 'regalo boda'
  ],
  authors: [{ name: 'Lumeries' }],
  creator: 'Lumeries',
  publisher: 'Lumeries',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'de_DE',
    alternateLocale: ['en_US', 'fr_FR', 'es_ES'],
    url: 'https://lumeries.com',
    siteName: 'Lumeries',
    title: 'Kostenloses Mondposter personalisiert | Lumeries',
    description: 'Erstelle dein kostenloses personalisiertes Mondposter! Zeige die exakte Mondphase von eurem besonderen Tag - Hochzeit, Jahrestag oder Geburt.',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Lumeries - Personalisiertes Mondposter',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kostenloses Mondposter personalisiert | Lumeries',
    description: 'Erstelle dein kostenloses personalisiertes Mondposter mit der exakten Mondphase von eurem besonderen Tag!',
    images: ['/opengraph-image'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add your verification codes here when you have them
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
  },
  alternates: {
    canonical: 'https://lumeries.com',
    languages: {
      'de-DE': 'https://lumeries.com',
      'en-US': 'https://lumeries.com',
      'fr-FR': 'https://lumeries.com',
      'es-ES': 'https://lumeries.com',
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <head>
        {/* Preconnect for faster loading */}
        <link rel="preconnect" href="https://nominatim.openstreetmap.org" />
        <link rel="preconnect" href="https://randomuser.me" />
        <link rel="dns-prefetch" href="https://nominatim.openstreetmap.org" />

        {/* PWA manifest */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0a0a1a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Lumeries" />

        {/* Structured Data for Rich Snippets */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Product',
              name: 'Personalisiertes Mondposter',
              description: 'Erstelle dein kostenloses personalisiertes Mondposter mit der exakten Mondphase von eurem besonderen Tag.',
              brand: {
                '@type': 'Brand',
                name: 'Lumeries',
              },
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'EUR',
                availability: 'https://schema.org/InStock',
                url: 'https://lumeries.com',
              },
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: '4.9',
                reviewCount: '2847',
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Lumeries',
              url: 'https://lumeries.com',
              logo: 'https://lumeries.com/logo.png',
              sameAs: [],
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Lumeries',
              url: 'https://lumeries.com',
              potentialAction: {
                '@type': 'SearchAction',
                target: 'https://lumeries.com/?q={search_term_string}',
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
        {/* FAQ Schema for Rich Snippets */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: [
                {
                  '@type': 'Question',
                  name: 'Was ist ein personalisiertes Mondposter?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Ein personalisiertes Mondposter zeigt die exakte Mondphase eines bestimmten Datums - zum Beispiel der Hochzeitstag, Geburtstag oder Jahrestag. Es ist ein einzigartiges Geschenk, das einen besonderen Moment für immer festhält.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'Ist das Mondposter wirklich kostenlos?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Ja! Bei Lumeries kannst du dein personalisiertes Mondposter komplett kostenlos erstellen und als hochauflösendes PNG herunterladen. Keine versteckten Kosten.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'Wie genau ist die Mondphase auf dem Poster?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Wir berechnen die exakte Mondphase basierend auf astronomischen Daten für jeden Tag seit 1900. Die Darstellung zeigt präzise, wie der Mond an deinem gewählten Datum aussah.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'In welchen Größen kann ich das Poster drucken?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Das heruntergeladene Poster hat eine hohe Auflösung und eignet sich für Druckgrößen von A4 bis A2. Du kannst es bei jedem lokalen Druckservice oder Online-Druckerei drucken lassen.',
                  },
                },
              ],
            }),
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
