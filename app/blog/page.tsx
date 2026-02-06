import { Metadata } from 'next';
import Link from 'next/link';
import { blogPosts } from '@/lib/blog-posts';

export const metadata: Metadata = {
  title: 'Blog – Mondphasen, Geschenkideen & Poster',
  description: 'Tipps und Inspiration rund um personalisierte Poster, Mondphasen, Sternenkarten und die besten Geschenkideen für besondere Anlässe.',
  keywords: ['mondphasen blog', 'personalisierte poster', 'geschenkideen', 'sternenkarte', 'mondphase berechnen'],
  alternates: {
    canonical: 'https://lumeries.com/blog',
  },
  openGraph: {
    title: 'Blog – Lumeries',
    description: 'Tipps und Inspiration rund um personalisierte Poster, Mondphasen und Geschenkideen.',
    url: 'https://lumeries.com/blog',
    type: 'website',
  },
};

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-block">
            &larr; Zurück zu Lumeries
          </Link>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Lumeries Blog
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Inspiration, Tipps und Wissenswertes rund um Mondphasen, personalisierte Poster und die besten Geschenkideen.
          </p>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid gap-8 md:grid-cols-2">
          {blogPosts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group block bg-gray-50 rounded-xl p-6 border border-gray-100 hover:border-gray-300 hover:shadow-lg transition-all"
            >
              <div className="mb-3">
                <time className="text-xs text-gray-400" dateTime={post.publishedAt}>
                  {new Date(post.publishedAt).toLocaleDateString('de-DE', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </time>
              </div>
              <h2 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition mb-2">
                {post.title}
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                {post.description}
              </p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {post.keywords.slice(0, 3).map((keyword) => (
                  <span
                    key={keyword}
                    className="inline-block px-2 py-0.5 bg-gray-200 text-gray-600 rounded text-xs"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>

        {/* CTA Banner */}
        <div className="mt-16 bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-3">
            Erstelle jetzt dein kostenloses Mondphasen-Poster
          </h2>
          <p className="text-gray-300 mb-6 max-w-lg mx-auto">
            Astronomisch exakt, personalisiert mit deinen Namen – in unter 2 Minuten fertig.
          </p>
          <Link
            href="/"
            className="inline-block px-8 py-3 bg-white text-gray-900 font-semibold rounded-full hover:bg-gray-100 transition"
          >
            Kostenloses Poster erstellen
          </Link>
        </div>
      </div>
    </main>
  );
}
