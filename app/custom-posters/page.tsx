import CustomPosterShop from '@/components/CustomPosterShop';
import Link from 'next/link';

export default function CustomPostersPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <Link
            href="/"
            className="inline-block mb-6 text-white/80 hover:text-white transition"
          >
            ← Back to Home
          </Link>
          <h1 className="text-6xl font-bold mb-4">
            Custom Posters That Tell Your Story
          </h1>
          <p className="text-2xl mb-6 text-white/90">
            Personalized Gift Posters • Star Maps • Music Art • Coordinates
          </p>
          <div className="flex flex-wrap justify-center gap-8 text-lg">
            <div className="flex items-center gap-2">
              <span className="text-3xl">⚡</span>
              <span>Instant Download</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-3xl">🎨</span>
              <span>100% Customizable</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-3xl">💝</span>
              <span>Perfect Gift</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-3xl">🖨️</span>
              <span>Print at Home</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <button className="bg-white text-purple-600 px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition shadow-xl">
              Browse Bestsellers
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-purple-600 transition">
              See Examples
            </button>
          </div>
        </div>
      </div>

      {/* Main Shop */}
      <div className="container mx-auto px-4 py-12">
        <CustomPosterShop />
      </div>

      {/* How It Works */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">
            How It Works
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                1️⃣
              </div>
              <h3 className="text-lg font-bold mb-2">Choose Your Design</h3>
              <p className="text-gray-600 text-sm">
                Browse our collection of customizable poster templates
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                2️⃣
              </div>
              <h3 className="text-lg font-bold mb-2">Personalize It</h3>
              <p className="text-gray-600 text-sm">
                Add your text, dates, locations, and see live preview
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                3️⃣
              </div>
              <h3 className="text-lg font-bold mb-2">Download Instantly</h3>
              <p className="text-gray-600 text-sm">
                Get high-resolution files ready for printing
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                4️⃣
              </div>
              <h3 className="text-lg font-bold mb-2">Print & Frame</h3>
              <p className="text-gray-600 text-sm">
                Print at home or local shop, frame, and enjoy forever!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Occasions */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">
          Perfect For Every Occasion
        </h2>
        <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
          {[
            { icon: '💑', label: 'Anniversaries', desc: 'Celebrate your love' },
            { icon: '💍', label: 'Weddings', desc: 'Commemorate the day' },
            { icon: '👶', label: 'New Baby', desc: 'Welcome little ones' },
            { icon: '🎓', label: 'Graduations', desc: 'Honor achievements' },
            { icon: '🎂', label: 'Birthdays', desc: 'Personal milestones' },
            { icon: '💝', label: "Valentine's", desc: 'Show your love' },
            { icon: '🎄', label: 'Christmas', desc: 'Unique gifts' },
            { icon: '👨‍👩‍👧', label: 'Family', desc: 'Create memories' },
            { icon: '🏡', label: 'New Home', desc: 'Housewarming gifts' },
            { icon: '🐕', label: 'Pet Lovers', desc: 'Celebrate fur babies' },
          ].map((occasion) => (
            <div
              key={occasion.label}
              className="bg-white rounded-xl p-6 text-center hover:shadow-lg transition cursor-pointer"
            >
              <div className="text-5xl mb-3">{occasion.icon}</div>
              <h3 className="font-bold text-gray-900 mb-1">{occasion.label}</h3>
              <p className="text-sm text-gray-600">{occasion.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Why Choose Us */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">
            Why 50,000+ Customers Love Us
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-6xl mb-4">💯</div>
              <h3 className="text-2xl font-bold mb-3">Premium Quality</h3>
              <p className="text-gray-300">
                All designs are 300 DPI print-ready files. Professional quality
                guaranteed or money back.
              </p>
            </div>
            <div className="text-center">
              <div className="text-6xl mb-4">⚡</div>
              <h3 className="text-2xl font-bold mb-3">Instant Access</h3>
              <p className="text-gray-300">
                Download your files immediately after purchase. No waiting, no
                shipping. Start printing today!
              </p>
            </div>
            <div className="text-center">
              <div className="text-6xl mb-4">💰</div>
              <h3 className="text-2xl font-bold mb-3">Save Hundreds</h3>
              <p className="text-gray-300">
                Custom posters from designers cost $100-$300. Get the same
                quality for $20-$40 and print unlimited copies!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Preview */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">
          Frequently Asked Questions
        </h2>
        <div className="max-w-3xl mx-auto space-y-4">
          {[
            {
              q: 'What file formats do I receive?',
              a: 'You receive high-resolution PDF (300 DPI) and PNG files in multiple sizes (8x10, 11x14, 16x20 inches).',
            },
            {
              q: 'Can I print these at home?',
              a: 'Yes! Our files are optimized for home printing. You can also take them to any print shop like Costco, Staples, or FedEx.',
            },
            {
              q: 'How do I customize my poster?',
              a: 'Simply click "Customize Now", enter your details in the form, and see a live preview. Your personalized files are generated instantly!',
            },
            {
              q: 'What if I need help or changes?',
              a: 'We offer free support via email. If you need design changes, contact us within 7 days and we will help you out!',
            },
          ].map((faq, idx) => (
            <details
              key={idx}
              className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition"
            >
              <summary className="font-bold text-lg cursor-pointer text-gray-900">
                {faq.q}
              </summary>
              <p className="mt-3 text-gray-600">{faq.a}</p>
            </details>
          ))}
        </div>
      </div>

      {/* Final CTA */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-5xl font-bold mb-6">
            Create Your Perfect Poster Today
          </h2>
          <p className="text-2xl mb-8 text-white/90">
            Join 50,000+ happy customers who trust us for their special moments
          </p>
          <button className="bg-white text-purple-600 px-12 py-5 rounded-full font-bold text-xl hover:scale-105 transition shadow-2xl">
            Start Creating Now
          </button>
        </div>
      </div>
    </main>
  );
}
