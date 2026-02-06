'use client';

import { useState } from 'react';

type ReferralBannerProps = {
  referralCode: string;
  shareUrl: string;
  t: {
    referralTitle: string;
    referralText: string;
    referralCode: string;
    referralCopied: string;
    referralShare: string;
    referralDiscount: string;
  };
};

export default function ReferralBanner({ referralCode, shareUrl, t }: ReferralBannerProps) {
  const [copied, setCopied] = useState(false);

  const fullShareUrl = `${shareUrl}?ref=${referralCode}`;
  const shareText = `${t.referralShare} ${fullShareUrl}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = referralCode;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleWhatsAppShare = () => {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(shareText)}`,
      '_blank',
      'width=600,height=500'
    );
  };

  return (
    <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6 text-center">
      <div className="w-12 h-12 mx-auto mb-3 bg-purple-100 rounded-full flex items-center justify-center">
        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
        </svg>
      </div>

      <h3 className="text-lg font-bold text-gray-900 mb-1">
        {t.referralTitle}
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        {t.referralText}
      </p>

      {/* Discount Badge */}
      <div className="inline-block bg-purple-600 text-white text-sm font-bold px-4 py-1.5 rounded-full mb-4">
        {t.referralDiscount}
      </div>

      {/* Referral Code */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <div className="bg-white border-2 border-dashed border-purple-300 rounded-lg px-4 py-2 font-mono text-lg font-bold text-purple-700 tracking-wider">
          {referralCode}
        </div>
        <button
          onClick={handleCopy}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
            copied
              ? 'bg-green-500 text-white'
              : 'bg-purple-100 hover:bg-purple-200 text-purple-700'
          }`}
        >
          {copied ? t.referralCopied : t.referralCode}
        </button>
      </div>

      {/* Quick Share */}
      <button
        onClick={handleWhatsAppShare}
        className="inline-flex items-center gap-2 px-4 py-2 bg-[#25D366] hover:bg-[#1da851] text-white rounded-full text-sm font-medium transition"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
        {t.referralShare}
      </button>
    </div>
  );
}
