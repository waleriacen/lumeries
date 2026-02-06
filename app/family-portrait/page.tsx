import FamilyPortraitBuilder from "@/components/FamilyPortraitBuilder";

export default function FamilyPortraitPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-red-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-3">
            🎄 AI Family Portrait Generator
          </h1>
          <p className="text-xl text-gray-600">
            Create your custom family caricature - Just like Teeinblue!
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Perfect for Christmas cards, posters & gifts
          </p>
        </header>
        <FamilyPortraitBuilder />
      </div>
    </main>
  );
}
