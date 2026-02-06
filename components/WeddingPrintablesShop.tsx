'use client';

import { useState } from 'react';
import { BohoFloralTemplate, ModernMinimalistTemplate, RusticWoodlandTemplate } from './WeddingTemplates';

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: 'invitations' | 'menus' | 'signs' | 'programs';
  includes: string[];
  template?: 'boho' | 'modern' | 'rustic';
};

const products: Product[] = [
  {
    id: 'boho-invitation',
    name: 'Boho Floral Wedding Invitation Suite',
    description: 'Elegant bohemian design with watercolor florals',
    price: 24.99,
    image: '🌸',
    category: 'invitations',
    template: 'boho',
    includes: [
      'Wedding Invitation (5x7")',
      'RSVP Card (4x6")',
      'Details Card',
      'Thank You Card',
      'Editable PDF & Canva Template',
    ],
  },
  {
    id: 'modern-invitation',
    name: 'Modern Minimalist Invitation Suite',
    description: 'Clean, contemporary design with elegant typography',
    price: 22.99,
    image: '✨',
    category: 'invitations',
    template: 'modern',
    includes: [
      'Wedding Invitation (5x7")',
      'RSVP Card (4x6")',
      'Details Card',
      'Editable PDF Template',
    ],
  },
  {
    id: 'rustic-invitation',
    name: 'Rustic Woodland Wedding Suite',
    description: 'Charming rustic design with greenery and wood elements',
    price: 26.99,
    image: '🌿',
    category: 'invitations',
    template: 'rustic',
    includes: [
      'Wedding Invitation (5x7")',
      'RSVP Card (4x6")',
      'Details Card',
      'Thank You Card',
      'Save the Date',
      'Editable PDF & Canva Template',
    ],
  },
  {
    id: 'menu-elegant',
    name: 'Elegant Dinner Menu Template',
    description: 'Beautiful menu design for your wedding reception',
    price: 12.99,
    image: '🍽️',
    category: 'menus',
    includes: ['Menu Template (5x7")', 'Place Card Template', 'Editable PDF'],
  },
  {
    id: 'welcome-sign',
    name: 'Wedding Welcome Sign Bundle',
    description: 'Set of customizable welcome and directional signs',
    price: 18.99,
    image: '🪧',
    category: 'signs',
    includes: [
      'Welcome Sign (18x24")',
      'Ceremony Sign',
      'Reception Sign',
      'Editable PDF',
    ],
  },
  {
    id: 'program-template',
    name: 'Wedding Ceremony Program',
    description: 'Classic program design for your ceremony',
    price: 9.99,
    image: '📋',
    category: 'programs',
    includes: ['Program Template (5.5x8.5")', 'Editable PDF'],
  },
];

export default function WeddingPrintablesShop() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [customText, setCustomText] = useState({
    couple: 'Sarah & Michael',
    date: 'June 15, 2026',
    venue: 'Garden Estate',
    time: '4:00 PM',
  });

  const [cart, setCart] = useState<string[]>([]);

  const renderTemplate = (template: 'boho' | 'modern' | 'rustic' | undefined) => {
    if (!template) return null;

    const props = {
      couple: customText.couple,
      date: customText.date,
      venue: customText.venue,
      time: customText.time,
    };

    switch (template) {
      case 'boho':
        return <BohoFloralTemplate {...props} />;
      case 'modern':
        return <ModernMinimalistTemplate {...props} />;
      case 'rustic':
        return <RusticWoodlandTemplate {...props} />;
      default:
        return null;
    }
  };

  const addToCart = (productId: string) => {
    setCart([...cart, productId]);
    alert('Added to cart! (Demo - would trigger checkout)');
  };

  const quickCustomize = (product: Product) => {
    setSelectedProduct(product);
  };

  const downloadDemo = () => {
    alert(
      '🎉 In production, this would download your customized PDF!\n\nYou would receive:\n- High-resolution PDF (300 DPI)\n- Editable Canva template\n- Print guide\n- Instant access via email'
    );
  };

  return (
    <div className="space-y-12">
      {/* Filter Tabs */}
      <div className="flex flex-wrap justify-center gap-4">
        {[
          { id: 'all', label: 'All Products', icon: '💐' },
          { id: 'invitations', label: 'Invitations', icon: '💌' },
          { id: 'menus', label: 'Menus', icon: '🍽️' },
          { id: 'signs', label: 'Signs', icon: '🪧' },
          { id: 'programs', label: 'Programs', icon: '📋' },
        ].map((tab) => (
          <button
            key={tab.id}
            className="px-6 py-3 bg-white rounded-full shadow-md hover:shadow-lg transition font-semibold text-gray-700 hover:text-rose-600"
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition group"
          >
            {/* Product Image - Real Template Preview */}
            <div className="bg-gradient-to-br from-rose-100 to-purple-100 h-64 flex items-center justify-center group-hover:scale-105 transition overflow-hidden">
              {product.template ? (
                <div className="w-full h-full scale-[0.35]">
                  {renderTemplate(product.template)}
                </div>
              ) : (
                <div className="text-8xl">{product.image}</div>
              )}
            </div>

            {/* Product Details */}
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold text-gray-900">
                  {product.name}
                </h3>
                <span className="text-2xl font-bold text-rose-600">
                  ${product.price}
                </span>
              </div>
              <p className="text-gray-600 mb-4">{product.description}</p>

              {/* What's Included */}
              <div className="mb-4">
                <p className="font-semibold text-sm text-gray-700 mb-2">
                  What's Included:
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  {product.includes.slice(0, 3).map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                  {product.includes.length > 3 && (
                    <li className="text-gray-500 italic">
                      + {product.includes.length - 3} more items
                    </li>
                  )}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => quickCustomize(product)}
                  className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 px-4 rounded-lg transition"
                >
                  Customize Now
                </button>
                <button
                  onClick={() => addToCart(product.id)}
                  className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-4 rounded-lg transition"
                >
                  🛒
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Customizer Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-8">
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    Customize Your Design
                  </h2>
                  <p className="text-gray-600">{selectedProduct.name}</p>
                </div>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="text-gray-500 hover:text-gray-700 text-3xl"
                >
                  ×
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Preview */}
                <div>
                  <h3 className="font-semibold mb-3 text-gray-700">Live Preview</h3>
                  <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl p-6 aspect-[5/7] flex items-center justify-center border-2 border-gray-300 shadow-inner">
                    {selectedProduct.template ? (
                      <div className="w-full h-full bg-white rounded shadow-2xl overflow-hidden">
                        {renderTemplate(selectedProduct.template)}
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="text-6xl mb-6">{selectedProduct.image}</div>
                        <div className="space-y-4">
                          <h1 className="text-3xl font-serif text-gray-800">
                            {customText.couple}
                          </h1>
                          <div className="text-xl text-gray-600">
                            {customText.date}
                          </div>
                          <div className="text-lg text-gray-500">
                            {customText.venue}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Customization Form */}
                <div>
                  <h3 className="font-semibold mb-3 text-gray-700">
                    Your Details
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Couple Names
                      </label>
                      <input
                        type="text"
                        value={customText.couple}
                        onChange={(e) =>
                          setCustomText({ ...customText, couple: e.target.value })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                        placeholder="Sarah & Michael"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Wedding Date
                      </label>
                      <input
                        type="text"
                        value={customText.date}
                        onChange={(e) =>
                          setCustomText({ ...customText, date: e.target.value })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                        placeholder="June 15, 2026"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Venue
                      </label>
                      <input
                        type="text"
                        value={customText.venue}
                        onChange={(e) =>
                          setCustomText({ ...customText, venue: e.target.value })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                        placeholder="Garden Estate"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Time (Optional)
                      </label>
                      <input
                        type="text"
                        value={customText.time}
                        onChange={(e) =>
                          setCustomText({ ...customText, time: e.target.value })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                        placeholder="4:00 PM"
                      />
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                      <h4 className="font-semibold text-blue-900 mb-2">
                        What You'll Get:
                      </h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        {selectedProduct.includes.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span>✓</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={downloadDemo}
                        className="flex-1 bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-lg transition shadow-lg"
                      >
                        Download Now - ${selectedProduct.price}
                      </button>
                    </div>

                    <p className="text-xs text-gray-500 text-center mt-2">
                      ✨ Instant download • 💳 Secure checkout • 🔒 Money-back
                      guarantee
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bundles Section */}
      <div className="bg-gradient-to-r from-purple-100 to-rose-100 rounded-2xl p-12 text-center">
        <h2 className="text-4xl font-bold mb-4 text-gray-900">
          Save with Complete Wedding Bundles
        </h2>
        <p className="text-xl text-gray-700 mb-6">
          Get ALL printables for your wedding at 40% off!
        </p>
        <button className="bg-gradient-to-r from-rose-600 to-purple-700 hover:from-rose-700 hover:to-purple-800 text-white font-bold py-4 px-12 rounded-full text-xl transition shadow-xl">
          View Complete Bundle - Save $120
        </button>
      </div>
    </div>
  );
}
