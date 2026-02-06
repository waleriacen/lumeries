import ProductDesigner from "@/components/ProductDesigner";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Product Personalizer
          </h1>
          <p className="text-gray-600 mb-4">
            Design your custom products - Just like Teeinblue!
          </p>

          <div className="flex flex-wrap gap-3 mb-6">
            <Link
              href="/free-poster"
              className="bg-gradient-to-r from-green-500 via-blue-600 to-purple-600 hover:from-green-600 hover:via-blue-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-lg transition shadow-lg animate-pulse text-lg"
            >
              🎁 Get Your FREE Custom Star Map!
            </Link>
            <Link
              href="/custom-posters"
              className="bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 hover:from-blue-600 hover:via-purple-700 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-lg transition shadow-lg"
            >
              ✨ Premium Custom Posters
            </Link>
            <Link
              href="/wedding-printables"
              className="bg-gradient-to-r from-rose-400 via-pink-500 to-purple-600 hover:from-rose-500 hover:via-pink-600 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg transition shadow-lg"
            >
              💐 Wedding Printables Shop
            </Link>
            <Link
              href="/family-portrait"
              className="bg-gradient-to-r from-red-500 to-green-500 hover:from-red-600 hover:to-green-600 text-white font-bold py-3 px-6 rounded-lg transition shadow-lg"
            >
              🎄 Family Portrait Builder
            </Link>
            <Link
              href="/cartoon-transform"
              className="bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 hover:from-purple-600 hover:via-pink-600 hover:to-blue-600 text-white font-medium py-3 px-6 rounded-lg transition shadow-md"
            >
              🎬 Photo Transform (Beta)
            </Link>
          </div>
        </header>
        <ProductDesigner />
      </div>
    </main>
  );
}
