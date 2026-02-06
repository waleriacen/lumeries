import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getBlogPost, getAllBlogSlugs, blogPosts } from '@/lib/blog-posts';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getAllBlogSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.description,
    keywords: post.keywords,
    alternates: {
      canonical: `https://lumeries.com/blog/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `https://lumeries.com/blog/${post.slug}`,
      type: 'article',
      publishedTime: post.publishedAt,
      siteName: 'Lumeries',
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
    },
  };
}

function renderContent(content: string) {
  const lines = content.trim().split('\n');
  const elements: React.ReactNode[] = [];
  let listItems: string[] = [];
  let key = 0;

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={key++} className="list-disc list-inside space-y-1 text-gray-700 my-4">
          {listItems.map((item, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: formatInlineText(item) }} />
          ))}
        </ul>
      );
      listItems = [];
    }
  };

  const formatInlineText = (text: string): string => {
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>');
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed === '') {
      flushList();
      continue;
    }

    if (trimmed.startsWith('### ')) {
      flushList();
      elements.push(
        <h3 key={key++} className="text-xl font-semibold text-gray-900 mt-8 mb-3">
          {trimmed.slice(4)}
        </h3>
      );
    } else if (trimmed.startsWith('## ')) {
      flushList();
      elements.push(
        <h2 key={key++} className="text-2xl font-bold text-gray-900 mt-10 mb-4">
          {trimmed.slice(3)}
        </h2>
      );
    } else if (trimmed.startsWith('- ')) {
      listItems.push(trimmed.slice(2));
    } else if (/^\d+\.\s/.test(trimmed)) {
      listItems.push(trimmed.replace(/^\d+\.\s/, ''));
    } else {
      flushList();
      elements.push(
        <p
          key={key++}
          className="text-gray-700 leading-relaxed my-3"
          dangerouslySetInnerHTML={{ __html: formatInlineText(trimmed) }}
        />
      );
    }
  }

  flushList();
  return elements;
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    notFound();
  }

  // JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    author: {
      '@type': 'Organization',
      name: 'Lumeries',
      url: 'https://lumeries.com',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Lumeries',
      url: 'https://lumeries.com',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://lumeries.com/blog/${post.slug}`,
    },
    keywords: post.keywords.join(', '),
  };

  // Related posts (other posts)
  const relatedPosts = blogPosts.filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="min-h-screen bg-white">
        <article className="max-w-3xl mx-auto px-4 py-12">
          {/* Breadcrumb */}
          <nav className="mb-8 text-sm text-gray-500">
            <Link href="/" className="hover:text-gray-700">Lumeries</Link>
            {' / '}
            <Link href="/blog" className="hover:text-gray-700">Blog</Link>
            {' / '}
            <span className="text-gray-900">{post.title.split(' – ')[0]}</span>
          </nav>

          {/* Header */}
          <header className="mb-10">
            <time className="text-sm text-gray-400" dateTime={post.publishedAt}>
              {new Date(post.publishedAt).toLocaleDateString('de-DE', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mt-2 mb-4 leading-tight">
              {post.title}
            </h1>
            <p className="text-lg text-gray-600">{post.description}</p>
          </header>

          {/* Content */}
          <div className="prose-container">
            {renderContent(post.content)}
          </div>

          {/* CTA Box */}
          <div className="mt-12 bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 text-center text-white">
            <h2 className="text-2xl font-bold mb-3">
              Erstelle jetzt dein kostenloses Poster
            </h2>
            <p className="text-gray-300 mb-6 max-w-lg mx-auto">
              Personalisiertes Mondphasen-Poster mit astronomisch exaktem Mond – in unter 2 Minuten fertig, 100% kostenlos.
            </p>
            <Link
              href="/"
              className="inline-block px-8 py-3 bg-white text-gray-900 font-semibold rounded-full hover:bg-gray-100 transition"
            >
              Kostenloses Poster erstellen
            </Link>
          </div>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <div className="mt-16">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Weitere Artikel</h2>
              <div className="grid gap-6 md:grid-cols-2">
                {relatedPosts.map((related) => (
                  <Link
                    key={related.slug}
                    href={`/blog/${related.slug}`}
                    className="group block bg-gray-50 rounded-xl p-5 border border-gray-100 hover:border-gray-300 hover:shadow-md transition-all"
                  >
                    <h3 className="text-base font-semibold text-gray-900 group-hover:text-blue-600 transition mb-2">
                      {related.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {related.description}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </article>
      </main>
    </>
  );
}
