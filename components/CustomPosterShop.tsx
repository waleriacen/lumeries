'use client';

import { useState } from 'react';
import { StarMapTemplate, SpotifyPosterTemplate, CoordinatesPosterTemplate, MoonPosterTemplate } from './CustomPosterTemplates';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'star-map' | 'music' | 'coordinates' | 'family' | 'moon';
  template?: 'star-map' | 'spotify' | 'coordinates' | 'moon';
  bestseller?: boolean;
};

const products: Product[] = [
  {
    id: 'star-map',
    name: 'Custom Star Map Poster',
    description: 'The night sky from your special moment - Anniversary, Wedding, Birth',
    price: 34.99,
    category: 'star-map',
    template: 'star-map',
    bestseller: true,
  },
  {
    id: 'spotify-poster',
    name: 'Spotify Song Poster',
    description: 'Your song immortalized - Custom album cover with scannable code',
    price: 29.99,
    category: 'music',
    template: 'spotify',
    bestseller: true,
  },
  {
    id: 'coordinates-poster',
    name: 'Custom Coordinates Print',
    description: 'Where you met, married, or made memories - GPS coordinates art',
    price: 24.99,
    category: 'coordinates',
    template: 'coordinates',
  },
  {
    id: 'moon-poster',
    name: 'Moon Phase Poster',
    description: 'The exact moon from your special night - Wedding, Birthday, Anniversary',
    price: 29.99,
    category: 'moon',
    template: 'moon',
    bestseller: true,
  },
  {
    id: 'birth-stats',
    name: 'Baby Birth Stats Poster',
    description: 'Celebrate your little one with custom birth details',
    price: 27.99,
    category: 'family',
  },
  {
    id: 'pet-portrait',
    name: 'Custom Pet Portrait',
    description: 'Your furry friend as royalty - Renaissance style digital art',
    price: 39.99,
    category: 'family',
  },
  {
    id: 'family-tree',
    name: 'Modern Family Tree Print',
    description: 'Minimalist family tree with custom names and dates',
    price: 32.99,
    category: 'family',
  },
];

export default function CustomPosterShop() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [customData, setCustomData] = useState({
    email: '',
    firstName: '',
    // Star Map
    starMapTitle: 'Our Love Story',
    starMapSubtitle: 'Where it all began',
    starMapDate: 'June 15, 2024',
    starMapLocation: 'Paris, France',
    starMapCoordinates: '48.8566° N, 2.3522° E',

    // Spotify
    songTitle: 'Perfect',
    artist: 'Ed Sheeran',
    songCustomText: '"Our first dance"',

    // Coordinates
    coordsTitle: 'Home',
    coordsSubtitle: 'Where our story continues',
    coordsLatitude: '40.7128° N',
    coordsLongitude: '74.0060° W',
    coordsDate: 'Est. 2024',

    // Moon
    moonTitle: 'The Night We Met',
    moonNames: 'Sarah & Jonathan',
    moonCoordinates: '51.5072° N, 0.1276° W',
    moonDate: '2024-08-30',
    moonTagline: 'Love Always & Forever',
  });

  const renderTemplate = (template: string | undefined) => {
    if (!template) return null;

    switch (template) {
      case 'star-map':
        return (
          <StarMapTemplate
            title={customData.starMapTitle}
            subtitle={customData.starMapSubtitle}
            date={customData.starMapDate}
            location={customData.starMapLocation}
            coordinates={customData.starMapCoordinates}
          />
        );
      case 'spotify':
        return (
          <SpotifyPosterTemplate
            songTitle={customData.songTitle}
            artist={customData.artist}
            customText={customData.songCustomText}
          />
        );
      case 'coordinates':
        return (
          <CoordinatesPosterTemplate
            title={customData.coordsTitle}
            subtitle={customData.coordsSubtitle}
            latitude={customData.coordsLatitude}
            longitude={customData.coordsLongitude}
            date={customData.coordsDate}
          />
        );
      case 'moon':
        return (
          <MoonPosterTemplate
            title={customData.moonTitle}
            names={customData.moonNames}
            coordinates={customData.moonCoordinates}
            date={customData.moonDate}
            tagline={customData.moonTagline}
          />
        );
      default:
        return null;
    }
  };

  const renderCustomizationForm = () => {
    if (!selectedProduct?.template) return null;

    switch (selectedProduct.template) {
      case 'star-map':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={customData.email}
                onChange={(e) =>
                  setCustomData({ ...customData, email: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name *
              </label>
              <input
                type="text"
                required
                value={customData.firstName}
                onChange={(e) =>
                  setCustomData({ ...customData, firstName: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="John"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                value={customData.starMapTitle}
                onChange={(e) =>
                  setCustomData({ ...customData, starMapTitle: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Our Love Story"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subtitle
              </label>
              <input
                type="text"
                value={customData.starMapSubtitle}
                onChange={(e) =>
                  setCustomData({ ...customData, starMapSubtitle: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Where it all began"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Special Date
              </label>
              <input
                type="text"
                value={customData.starMapDate}
                onChange={(e) =>
                  setCustomData({ ...customData, starMapDate: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="June 15, 2024"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                value={customData.starMapLocation}
                onChange={(e) =>
                  setCustomData({ ...customData, starMapLocation: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Paris, France"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Coordinates (Optional)
              </label>
              <input
                type="text"
                value={customData.starMapCoordinates}
                onChange={(e) =>
                  setCustomData({ ...customData, starMapCoordinates: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="48.8566° N, 2.3522° E"
              />
            </div>
          </div>
        );

      case 'spotify':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={customData.email}
                onChange={(e) =>
                  setCustomData({ ...customData, email: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name *
              </label>
              <input
                type="text"
                required
                value={customData.firstName}
                onChange={(e) =>
                  setCustomData({ ...customData, firstName: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="John"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Song Title
              </label>
              <input
                type="text"
                value={customData.songTitle}
                onChange={(e) =>
                  setCustomData({ ...customData, songTitle: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Perfect"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Artist Name
              </label>
              <input
                type="text"
                value={customData.artist}
                onChange={(e) =>
                  setCustomData({ ...customData, artist: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Ed Sheeran"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Message (Optional)
              </label>
              <input
                type="text"
                value={customData.songCustomText}
                onChange={(e) =>
                  setCustomData({ ...customData, songCustomText: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder='"Our first dance"'
              />
            </div>
          </div>
        );

      case 'coordinates':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={customData.email}
                onChange={(e) =>
                  setCustomData({ ...customData, email: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name *
              </label>
              <input
                type="text"
                required
                value={customData.firstName}
                onChange={(e) =>
                  setCustomData({ ...customData, firstName: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="John"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                value={customData.coordsTitle}
                onChange={(e) =>
                  setCustomData({ ...customData, coordsTitle: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Home"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subtitle
              </label>
              <input
                type="text"
                value={customData.coordsSubtitle}
                onChange={(e) =>
                  setCustomData({ ...customData, coordsSubtitle: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Where our story continues"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Latitude
              </label>
              <input
                type="text"
                value={customData.coordsLatitude}
                onChange={(e) =>
                  setCustomData({ ...customData, coordsLatitude: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="40.7128° N"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Longitude
              </label>
              <input
                type="text"
                value={customData.coordsLongitude}
                onChange={(e) =>
                  setCustomData({ ...customData, coordsLongitude: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="74.0060° W"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date (Optional)
              </label>
              <input
                type="text"
                value={customData.coordsDate}
                onChange={(e) =>
                  setCustomData({ ...customData, coordsDate: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Est. 2024"
              />
            </div>
          </div>
        );

      case 'moon':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={customData.email}
                onChange={(e) =>
                  setCustomData({ ...customData, email: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                value={customData.moonTitle}
                onChange={(e) =>
                  setCustomData({ ...customData, moonTitle: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="The Night We Met"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Names
              </label>
              <input
                type="text"
                value={customData.moonNames}
                onChange={(e) =>
                  setCustomData({ ...customData, moonNames: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Sarah & Jonathan"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Coordinates
              </label>
              <input
                type="text"
                value={customData.moonCoordinates}
                onChange={(e) =>
                  setCustomData({ ...customData, moonCoordinates: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="51.5072° N, 0.1276° W"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Special Date
              </label>
              <input
                type="date"
                value={customData.moonDate}
                onChange={(e) =>
                  setCustomData({ ...customData, moonDate: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tagline (Optional)
              </label>
              <input
                type="text"
                value={customData.moonTagline}
                onChange={(e) =>
                  setCustomData({ ...customData, moonTagline: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Love Always & Forever"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-12">
      {/* Category Pills */}
      <div className="flex flex-wrap justify-center gap-3">
        {[
          { id: 'all', label: 'All Posters', icon: '🎨' },
          { id: 'star-map', label: 'Star Maps', icon: '✨' },
          { id: 'moon', label: 'Moon Phase', icon: '🌙' },
          { id: 'music', label: 'Music', icon: '🎵' },
          { id: 'coordinates', label: 'Coordinates', icon: '📍' },
          { id: 'family', label: 'Family', icon: '👨‍👩‍👧‍👦' },
        ].map((tab) => (
          <button
            key={tab.id}
            className="px-5 py-2.5 bg-white rounded-full shadow-md hover:shadow-lg transition font-medium text-gray-700 hover:text-blue-600 hover:scale-105"
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition group relative"
          >
            {/* Bestseller Badge */}
            {product.bestseller && (
              <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg z-10">
                BESTSELLER
              </div>
            )}

            {/* Product Preview */}
            <div className="bg-gradient-to-br from-slate-100 to-slate-200 h-64 flex items-center justify-center group-hover:scale-105 transition overflow-hidden">
              {product.template ? (
                <div className="w-full h-full scale-[0.35]">
                  {renderTemplate(product.template)}
                </div>
              ) : (
                <div className="text-7xl opacity-50">🎨</div>
              )}
            </div>

            {/* Product Details */}
            <div className="p-5">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-bold text-gray-900 leading-tight flex-1 pr-2">
                  {product.name}
                </h3>
                <span className="text-xl font-bold text-blue-600 whitespace-nowrap">
                  ${product.price}
                </span>
              </div>
              <p className="text-gray-600 mb-4 text-base leading-relaxed">{product.description}</p>

              {/* Action Button */}
              <button
                onClick={() => {
                  console.log('Button clicked! Product:', product.name);
                  setSelectedProduct(product);
                }}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition shadow-md hover:shadow-lg"
              >
                Customize Now
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Customizer Modal */}
      {selectedProduct && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[9999] overflow-y-auto"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedProduct(null);
            }
          }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full my-8 relative"
            onClick={(e) => e.stopPropagation()}
            style={{ maxHeight: 'calc(100vh - 4rem)' }}
          >
            <div className="p-6 md:p-8 max-h-[calc(100vh-4rem)] overflow-y-auto">
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                    Customize Your Poster
                  </h2>
                  <p className="text-gray-600">{selectedProduct.name}</p>
                </div>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full w-10 h-10 flex items-center justify-center text-3xl font-light transition-colors flex-shrink-0 ml-4"
                  aria-label="Close"
                >
                  ×
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Live Preview */}
                <div>
                  <h3 className="font-semibold mb-3 text-gray-700">Live Preview</h3>
                  <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl p-4 aspect-[5/7] flex items-center justify-center border-2 border-gray-300 shadow-inner max-h-[500px]">
                    {selectedProduct.template ? (
                      <div className="w-full h-full bg-white rounded shadow-2xl overflow-hidden">
                        {renderTemplate(selectedProduct.template)}
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="text-6xl mb-4">🎨</div>
                        <p className="text-gray-500">Preview not available</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Customization Form */}
                <div>
                  <h3 className="font-semibold mb-3 text-gray-700">
                    Your Details
                  </h3>
                  {renderCustomizationForm()}

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                    <h4 className="font-semibold text-blue-900 mb-2">
                      What You'll Get:
                    </h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li className="flex items-start gap-2">
                        <span>✓</span>
                        <span>High-resolution PDF (300 DPI - print ready)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span>✓</span>
                        <span>PNG file for digital use</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span>✓</span>
                        <span>Multiple size options (8x10, 11x14, 16x20)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span>✓</span>
                        <span>Instant download - no waiting!</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span>✓</span>
                        <span>Print at home or local print shop</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    onClick={async () => {
                      if (!customData.email || !customData.firstName) {
                        alert('Please enter your email and first name to continue');
                        return;
                      }

                      setIsCheckingOut(true);

                      try {
                        // Prepare customization data based on product type
                        let customizationData: any = {
                          email: customData.email,
                          firstName: customData.firstName,
                        };

                        if (selectedProduct.template === 'star-map') {
                          customizationData = {
                            ...customizationData,
                            title: customData.starMapTitle,
                            subtitle: customData.starMapSubtitle,
                            date: customData.starMapDate,
                            location: customData.starMapLocation,
                            coordinates: customData.starMapCoordinates,
                          };
                        } else if (selectedProduct.template === 'spotify') {
                          customizationData = {
                            ...customizationData,
                            songTitle: customData.songTitle,
                            artist: customData.artist,
                            customText: customData.songCustomText,
                          };
                        } else if (selectedProduct.template === 'coordinates') {
                          customizationData = {
                            ...customizationData,
                            title: customData.coordsTitle,
                            subtitle: customData.coordsSubtitle,
                            latitude: customData.coordsLatitude,
                            longitude: customData.coordsLongitude,
                            date: customData.coordsDate,
                          };
                        } else if (selectedProduct.template === 'moon') {
                          customizationData = {
                            ...customizationData,
                            title: customData.moonTitle,
                            names: customData.moonNames,
                            coordinates: customData.moonCoordinates,
                            date: customData.moonDate,
                            tagline: customData.moonTagline,
                          };
                        }

                        // Create Stripe checkout session
                        const response = await fetch('/api/create-checkout', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            productName: selectedProduct.name,
                            price: selectedProduct.price,
                            customizationData,
                          }),
                        });

                        const data = await response.json();

                        if (!response.ok) {
                          throw new Error(data.error || 'Failed to create checkout');
                        }

                        // Redirect to Stripe Checkout
                        const stripe = await stripePromise;
                        if (stripe && data.url) {
                          window.location.href = data.url;
                        }
                      } catch (error: any) {
                        console.error('Checkout error:', error);
                        alert('Failed to start checkout. Please try again.');
                        setIsCheckingOut(false);
                      }
                    }}
                    disabled={isCheckingOut}
                    className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 text-white font-bold py-4 px-6 rounded-lg transition shadow-lg text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCheckingOut ? 'Processing...' : `Buy Now - €${selectedProduct.price}`}
                  </button>

                  <p className="text-xs text-gray-500 text-center mt-3">
                    Instant download • Secure checkout • Money-back guarantee
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Trust Section */}
      <div className="bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 rounded-2xl p-12 text-center">
        <h2 className="text-3xl font-bold mb-4 text-gray-900">
          Trusted by 50,000+ Happy Customers
        </h2>
        <div className="flex justify-center gap-1 text-4xl mb-4">
          ⭐⭐⭐⭐⭐
        </div>
        <p className="text-xl text-gray-700 italic max-w-2xl mx-auto">
          "Absolutely beautiful! The star map from our wedding night is now framed in our bedroom.
          The quality is incredible and customization was so easy!"
        </p>
        <p className="text-gray-600 mt-3">- Jennifer M., Verified Customer</p>
      </div>
    </div>
  );
}
