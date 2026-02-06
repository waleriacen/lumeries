import CartoonTransformer from '@/components/CartoonTransformer';
import Link from 'next/link';

export default function CartoonTransformPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <Link
            href="/"
            className="text-blue-500 hover:text-blue-700 mb-4 inline-block"
          >
            ← Back to Home
          </Link>
          <h1 className="text-5xl font-bold text-gray-900 mb-3">
            Photo → Cartoon Transformer
          </h1>
          <p className="text-xl text-gray-600">
            Transform your photos into Pixar or Simpsons style using AI!
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Powered by Replicate AI (SDXL Models)
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Transformer */}
          <div className="lg:col-span-2">
            <CartoonTransformer />
          </div>

          {/* Info Panel */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold mb-4">How It Works</h2>
              <div className="space-y-3 text-sm text-gray-700">
                <div>
                  <strong className="text-gray-900">1. Upload Photo</strong>
                  <p className="text-gray-600">Choose a clear portrait photo</p>
                </div>
                <div>
                  <strong className="text-gray-900">2. Pick Style</strong>
                  <p className="text-gray-600">Pixar 3D or Simpsons 2D</p>
                </div>
                <div>
                  <strong className="text-gray-900">3. Optional Prompt</strong>
                  <p className="text-gray-600">Add custom details if needed</p>
                </div>
                <div>
                  <strong className="text-gray-900">4. Transform!</strong>
                  <p className="text-gray-600">Wait 5-10 seconds for magic</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-4">Style Examples</h2>
              <div className="space-y-3 text-sm">
                <div className="border-l-4 border-blue-400 pl-3">
                  <strong className="text-gray-900">Pixar</strong>
                  <p className="text-gray-600">
                    3D animated movie style, vibrant colors, professional
                    lighting
                  </p>
                </div>
                <div className="border-l-4 border-yellow-400 pl-3">
                  <strong className="text-gray-900">Simpsons</strong>
                  <p className="text-gray-600">
                    Yellow skin, 2D cartoon, simple outlines, TV show style
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-4">Performance</h2>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex justify-between">
                  <span>Processing time:</span>
                  <strong>5-10 sec</strong>
                </div>
                <div className="flex justify-between">
                  <span>Resolution:</span>
                  <strong>1024x1024</strong>
                </div>
                <div className="flex justify-between">
                  <span>Cost per image:</span>
                  <strong>~$0.005</strong>
                </div>
                <div className="flex justify-between">
                  <span>AI Models:</span>
                  <strong>SDXL</strong>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-blue-50 p-6 rounded-lg border border-green-200">
              <h3 className="font-bold text-green-900 mb-2">
                Professional Quality
              </h3>
              <p className="text-sm text-green-800">
                Uses state-of-the-art SDXL models fine-tuned specifically for
                Pixar and Simpsons styles. Much better quality than generic
                filters!
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-4">Pricing</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Pixar transformation:</span>
                  <strong>$0.0043</strong>
                </div>
                <div className="flex justify-between">
                  <span>Simpsons transformation:</span>
                  <strong>$0.0059</strong>
                </div>
                <div className="mt-3 pt-3 border-t">
                  <p className="text-gray-600">
                    <strong>Example:</strong> 1000 transformations = only
                    $4-6!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
