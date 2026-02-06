'use client';

import { useState, useEffect, useCallback } from 'react';

type ExitIntentPopupProps = {
  t: {
    exitTitle: string;
    exitSubtitle: string;
    exitCta: string;
    exitDismiss: string;
  };
  onCtaClick: () => void;
};

export default function ExitIntentPopup({ t, onCtaClick }: ExitIntentPopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const handleMouseLeave = useCallback(
    (e: MouseEvent) => {
      // Only trigger when mouse moves to top of viewport (exit intent)
      if (e.clientY <= 5 && !dismissed) {
        // Check if already shown in this session
        const alreadyShown = sessionStorage.getItem('exit_popup_shown');
        if (!alreadyShown) {
          setIsVisible(true);
          sessionStorage.setItem('exit_popup_shown', 'true');
        }
      }
    },
    [dismissed]
  );

  useEffect(() => {
    // Only add listener on desktop (exit intent doesn't work on mobile)
    if (window.innerWidth < 768) return;

    // Delay adding the listener so it doesn't trigger immediately
    const timeout = setTimeout(() => {
      document.addEventListener('mouseleave', handleMouseLeave);
    }, 5000);

    return () => {
      clearTimeout(timeout);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [handleMouseLeave]);

  // Mobile: show after 30s of inactivity
  useEffect(() => {
    if (window.innerWidth >= 768) return;

    const timeout = setTimeout(() => {
      const alreadyShown = sessionStorage.getItem('exit_popup_shown');
      if (!alreadyShown && !dismissed) {
        setIsVisible(true);
        sessionStorage.setItem('exit_popup_shown', 'true');
      }
    }, 30000);

    return () => clearTimeout(timeout);
  }, [dismissed]);

  const handleDismiss = () => {
    setIsVisible(false);
    setDismissed(true);
  };

  const handleCta = () => {
    setIsVisible(false);
    setDismissed(true);
    onCtaClick();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 animate-fadeIn">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center animate-scaleIn">
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 transition"
          aria-label="Schließen"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Moon icon */}
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-yellow-300" fill="currentColor" viewBox="0 0 24 24">
            <path d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
          </svg>
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-2">
          {t.exitTitle}
        </h2>
        <p className="text-gray-600 text-sm mb-6">
          {t.exitSubtitle}
        </p>

        <button
          onClick={handleCta}
          className="w-full py-3 px-6 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-full transition text-sm"
        >
          {t.exitCta}
        </button>
        <button
          onClick={handleDismiss}
          className="mt-3 text-xs text-gray-400 hover:text-gray-600 transition"
        >
          {t.exitDismiss}
        </button>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
