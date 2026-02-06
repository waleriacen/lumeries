'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate checking order status
    if (sessionId) {
      setTimeout(() => {
        setLoading(false);
      }, 1500);
    } else {
      setLoading(false);
    }
  }, [sessionId]);

  if (loading) {
    return (
      <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-2xl w-full text-center">
        <div className="animate-spin text-6xl mb-6">⏳</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Processing Your Order...
        </h1>
        <p className="text-xl text-gray-600">
          Please wait while we confirm your payment
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 max-w-2xl w-full text-center">
      <div className="text-6xl mb-6">🎉</div>
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        Payment Successful!
      </h1>
      <p className="text-xl text-gray-600 mb-8">
        Thank you for your purchase! Your custom poster is being prepared.
      </p>

      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 mb-8 text-left">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          What Happens Next?
        </h2>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">📧</span>
            <div>
              <h3 className="font-bold text-lg">Check Your Email</h3>
              <p className="text-gray-600">
                Your download links have been sent to your email address within the next few minutes.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">📥</span>
            <div>
              <h3 className="font-bold text-lg">Download Your Files</h3>
              <p className="text-gray-600">
                You will receive high-resolution PDF (300 DPI) and PNG files in 3 sizes.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">🖨️</span>
            <div>
              <h3 className="font-bold text-lg">Print & Frame</h3>
              <p className="text-gray-600">
                Take your PDF to any print shop or print at home, then frame and enjoy!
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-8">
        <p className="text-sm text-gray-700">
          <strong>💡 Pro Tip:</strong> Did not receive the email? Check your spam folder or contact us at{' '}
          <a href="mailto:hello@lumeries.com" className="text-purple-600 underline">
            hello@lumeries.com
          </a>
        </p>
      </div>

      <div className="space-y-4">
        <Link
          href="/custom-posters"
          className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition shadow-xl"
        >
          Create Another Poster
        </Link>
        <br />
        <Link
          href="/"
          className="inline-block text-gray-600 hover:text-gray-900 underline"
        >
          Back to Home
        </Link>
      </div>

      {sessionId && (
        <p className="text-xs text-gray-400 mt-8">Order ID: {sessionId}</p>
      )}
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-2xl w-full text-center">
      <div className="animate-spin text-6xl mb-6">⏳</div>
      <h1 className="text-3xl font-bold text-gray-900 mb-4">
        Loading...
      </h1>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <Suspense fallback={<LoadingFallback />}>
        <SuccessContent />
      </Suspense>
    </main>
  );
}
