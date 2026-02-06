import WeddingPrintablesShop from '@/components/WeddingPrintablesShop';
import Link from 'next/link';

export default function WeddingPrintablesPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-rose-400 via-pink-500 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <Link
            href="/"
            className="inline-block mb-6 text-white/80 hover:text-white transition"
          >
            ← Back to Home
          </Link>
          <h1 className="text-6xl font-bold mb-4">
            Beautiful Wedding Printables
          </h1>
          <p className="text-2xl mb-6 text-white/90">
            Instant Download • Fully Customizable • Print at Home
          </p>
          <div className="flex justify-center gap-8 text-lg">
            <div className="flex items-center gap-2">
              <span className="text-3xl">✨</span>
              <span>Professional Designs</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-3xl">⚡</span>
              <span>Instant Access</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-3xl">💰</span>
              <span>Save $$$ vs Print Shops</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <WeddingPrintablesShop />
      </div>

      {/* Why Choose Us Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">
            Why Choose Our Wedding Printables?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="text-5xl mb-4">💝</div>
              <h3 className="text-xl font-bold mb-2">Instant Download</h3>
              <p className="text-gray-600">
                Get your files immediately after purchase. No waiting, no
                shipping delays. Start customizing right away!
              </p>
            </div>
            <div className="text-center p-6">
              <div className="text-5xl mb-4">🎨</div>
              <h3 className="text-xl font-bold mb-2">Easy to Customize</h3>
              <p className="text-gray-600">
                Edit text, colors, and layouts with our simple online editor.
                No design skills needed!
              </p>
            </div>
            <div className="text-center p-6">
              <div className="text-5xl mb-4">💵</div>
              <h3 className="text-xl font-bold mb-2">Save Money</h3>
              <p className="text-gray-600">
                Print as many copies as you need at your local print shop.
                Save hundreds compared to professional printing!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Social Proof */}
      <div className="container mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-rose-100 to-purple-100 rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold mb-6 text-gray-900">
            Loved by 10,000+ Happy Couples
          </h2>
          <div className="flex justify-center gap-1 text-4xl mb-4">
            ⭐⭐⭐⭐⭐
          </div>
          <p className="text-xl text-gray-700 italic">
            "These printables saved us so much money! The quality is amazing
            and customization was super easy."
          </p>
          <p className="text-gray-600 mt-2">- Sarah & Michael, 2025</p>
        </div>
      </div>
    </main>
  );
}
