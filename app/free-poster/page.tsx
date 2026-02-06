'use client';

import { useState } from 'react';
import { StarMapTemplate } from '@/components/CustomPosterTemplates';
import Link from 'next/link';

export default function FreePosterPage() {
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    title: 'Our Love Story',
    subtitle: 'Where It All Began',
    date: '2023-12-25',
    location: 'Paris, France',
    coordinates: '48.8566° N, 2.3522° E',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/free-poster', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 max-w-2xl w-full text-center">
          <div className="text-6xl mb-6">🎉</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Check Your Email!
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Your personalized star map has been sent to:
          </p>
          <p className="text-2xl font-bold text-purple-600 mb-8">
            {formData.email}
          </p>
          <div className="bg-blue-50 rounded-xl p-6 mb-8 text-left">
            <h3 className="font-bold text-lg mb-3">What You Received:</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>High-resolution PDF (300 DPI, print-ready)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>PNG file for digital use</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>3 sizes: 8x10, 11x14, 16x20 inches</span>
              </li>
            </ul>
          </div>
          <p className="text-gray-600 mb-6">
            Did not receive it? Check your spam folder or{' '}
            <button
              onClick={() => setIsSuccess(false)}
              className="text-purple-600 underline hover:text-purple-700"
            >
              try again
            </button>
          </p>
          <Link
            href="/custom-posters"
            className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition shadow-xl"
          >
            Explore Premium Designs
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <Link
            href="/"
            className="inline-block mb-6 text-white/80 hover:text-white transition"
          >
            ← Back to Home
          </Link>
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            Get Your Free Custom Star Map
          </h1>
          <p className="text-2xl mb-6 text-white/90">
            Create a personalized star map showing the night sky on your special date
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-lg">
            <div className="flex items-center gap-2">
              <span className="text-3xl">⚡</span>
              <span>Instant Download</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-3xl">🎨</span>
              <span>100% Free</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-3xl">🖨️</span>
              <span>Print-Ready 300 DPI</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Left: Live Preview */}
          <div className="order-2 lg:order-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                Live Preview
              </h2>
              <div className="bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl overflow-hidden">
                <div className="w-full aspect-[5/7] flex items-center justify-center">
                  <div className="w-full h-full scale-75">
                    <StarMapTemplate
                      title={formData.title}
                      subtitle={formData.subtitle}
                      date={formData.date}
                      location={formData.location}
                      coordinates={formData.coordinates}
                    />
                  </div>
                </div>
              </div>
              <p className="text-center text-sm text-gray-500 mt-4">
                Your design updates in real-time as you type
              </p>
            </div>
          </div>

          {/* Right: Customization Form */}
          <div className="order-1 lg:order-2">
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Customize Your Star Map
              </h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    We will send your poster to this email
                  </p>
                </div>

                {/* First Name */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    placeholder="John"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Main Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Our Love Story"
                    maxLength={30}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                {/* Subtitle */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Subtitle
                  </label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) =>
                      setFormData({ ...formData, subtitle: e.target.value })
                    }
                    placeholder="Where It All Began"
                    maxLength={40}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Special Date
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    placeholder="Paris, France"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                {/* Coordinates */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Coordinates (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.coordinates}
                    onChange={(e) =>
                      setFormData({ ...formData, coordinates: e.target.value })
                    }
                    placeholder="48.8566° N, 2.3522° E"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-lg font-bold text-lg hover:scale-105 transition shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isSubmitting ? 'Sending...' : '🎉 Get My Free Poster'}
                </button>

                <p className="text-xs text-center text-gray-500">
                  By submitting, you agree to receive occasional emails with special offers.
                  Unsubscribe anytime.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Social Proof */}
      <div className="bg-white py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-600 mb-6 text-lg">
            Join <span className="font-bold text-purple-600">50,000+</span> happy customers
          </p>
          <div className="flex justify-center gap-2 text-3xl">
            ⭐⭐⭐⭐⭐
          </div>
          <p className="text-gray-500 mt-2">4.9/5 from 12,483 reviews</p>
        </div>
      </div>

      {/* How to Use */}
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">
          How to Use Your Free Poster
        </h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
              📧
            </div>
            <h3 className="text-lg font-bold mb-2">1. Check Your Email</h3>
            <p className="text-gray-600">
              Receive your high-resolution files instantly in your inbox
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
              🖨️
            </div>
            <h3 className="text-lg font-bold mb-2">2. Print It</h3>
            <p className="text-gray-600">
              Take the PDF to any print shop or print at home
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
              🖼️
            </div>
            <h3 className="text-lg font-bold mb-2">3. Frame & Enjoy</h3>
            <p className="text-gray-600">
              Put it in a frame and display your personalized art!
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
