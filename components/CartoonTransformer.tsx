'use client';

import { useState } from 'react';
import Image from 'next/image';

type Style = 'pixar' | 'simpsons';

export default function CartoonTransformer() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<Style>('pixar');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result as string);
      setResultImage(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleTransform = async () => {
    if (!selectedImage) {
      setError('Please upload an image first');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      console.log('Sending transformation request...');
      const response = await fetch('/api/transform-cartoon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: selectedImage,
          style: selectedStyle,
          prompt: customPrompt,
        }),
      });

      const data = await response.json();
      console.log('API response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Transformation failed');
      }

      if (!data.imageUrl) {
        throw new Error('No image URL received from API');
      }

      console.log('Setting result image:', data.imageUrl);
      setResultImage(data.imageUrl);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      console.error('Transform error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = async () => {
    if (!resultImage) return;

    try {
      const response = await fetch(resultImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cartoon-${selectedStyle}-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        {/* Style Selection */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Choose Style</h3>
          <div className="flex gap-4">
            <button
              onClick={() => setSelectedStyle('pixar')}
              className={`flex-1 py-4 px-6 rounded-lg border-2 transition ${
                selectedStyle === 'pixar'
                  ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold'
                  : 'border-gray-300 hover:border-blue-300'
              }`}
            >
              <div className="text-2xl mb-1">🎬</div>
              <div className="font-semibold">Pixar Style</div>
              <div className="text-sm text-gray-600">3D animated movie look</div>
            </button>
            <button
              onClick={() => setSelectedStyle('simpsons')}
              className={`flex-1 py-4 px-6 rounded-lg border-2 transition ${
                selectedStyle === 'simpsons'
                  ? 'border-yellow-500 bg-yellow-50 text-yellow-700 font-semibold'
                  : 'border-gray-300 hover:border-yellow-300'
              }`}
            >
              <div className="text-2xl mb-1">📺</div>
              <div className="font-semibold">Simpsons Style</div>
              <div className="text-sm text-gray-600">Yellow skin, 2D cartoon</div>
            </button>
          </div>
        </div>

        {/* Image Upload */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Upload Photo</h3>
          <label className="block">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 cursor-pointer transition">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <div className="text-4xl mb-2">📸</div>
              <div className="text-gray-700 font-medium">
                Click to upload or drag and drop
              </div>
              <div className="text-sm text-gray-500 mt-1">
                PNG, JPG up to 10MB
              </div>
            </div>
          </label>
        </div>

        {/* Optional Custom Prompt */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">
            Custom Prompt (Optional)
          </h3>
          <input
            type="text"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder={
              selectedStyle === 'pixar'
                ? 'e.g., "happy character with big smile"'
                : 'e.g., "angry character with spiky hair"'
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-sm text-gray-500 mt-1">
            Add specific details or leave empty for default style
          </p>
        </div>

        {/* Transform Button */}
        <button
          onClick={handleTransform}
          disabled={!selectedImage || isProcessing}
          className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition ${
            !selectedImage || isProcessing
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg'
          }`}
        >
          {isProcessing ? (
            <span className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              Transforming... (takes 5-10 seconds)
            </span>
          ) : (
            `Transform to ${selectedStyle === 'pixar' ? 'Pixar' : 'Simpsons'} Style`
          )}
        </button>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            Error: {error}
          </div>
        )}

        {/* Results */}
        {(selectedImage || resultImage) && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Original */}
            {selectedImage && (
              <div>
                <h4 className="font-semibold mb-2">Original Photo</h4>
                <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={selectedImage}
                    alt="Original"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            )}

            {/* Result */}
            {resultImage && (
              <div>
                <h4 className="font-semibold mb-2">
                  {selectedStyle === 'pixar' ? 'Pixar' : 'Simpsons'} Style
                </h4>
                <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={resultImage}
                    alt="Result"
                    className="w-full h-full object-contain"
                  />
                </div>
                <button
                  onClick={handleDownload}
                  className="mt-4 w-full py-2 px-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition"
                >
                  Download Result
                </button>
              </div>
            )}
          </div>
        )}

        {/* Info */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">Pro Tips:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Use clear, well-lit photos for best results</li>
            <li>• Front-facing portraits work best</li>
            <li>• Processing takes 5-10 seconds</li>
            <li>
              • Cost: ~$0.005 per transformation (very affordable!)
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
