'use client';

import { useState, useEffect } from 'react';
import { generateModernQrDataUrl } from '@/lib/modernQr';
import { Sparkles, Copy, Check, QrCode } from 'lucide-react';

interface ModernQrCardProps {
  code: string;
  fullName: string;
  role: string;
}

export function ModernQrCard({ code, fullName, role }: ModernQrCardProps) {
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://aws-sbg-niu.ac.in';
    const verifyPayload = `${origin}/verify/${code.trim().toUpperCase()}`;

    generateModernQrDataUrl(verifyPayload, {
      size: 360,
      eyeColor: '#FF9900',
      dotColor: '#081226',
      bgColor: '#FFFFFF',
      includeLogo: true,
      dotStyle: 'dots',
    })
      .then((url) => {
        if (active) setQrUrl(url);
      })
      .catch((err) => {
        console.error('Failed to generate modern QR code:', err);
      });

    return () => {
      active = false;
    };
  }, [code]);

  const handleCopy = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://aws-sbg-niu.ac.in';
    const verifyUrl = `${origin}/verify/${code.trim().toUpperCase()}`;
    navigator.clipboard.writeText(verifyUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="p-5 rounded-2xl bg-[#080E1C] border border-[#1D2A42] flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
      <div className="relative group shrink-0">
        <div className="absolute -inset-1 bg-gradient-to-r from-[#A855F7] via-[#EC4899] to-[#FF9900] rounded-2xl blur-sm opacity-50 group-hover:opacity-100 transition duration-300" />
        <div className="relative p-2.5 bg-white rounded-xl shadow-xl">
          <div className="w-32 h-32 flex items-center justify-center overflow-hidden">
            {qrUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={qrUrl}
                alt={`Modern Verification QR for ${fullName}`}
                className="w-32 h-32 object-contain"
              />
            ) : (
              <div className="text-[10px] text-gray-500 font-mono flex items-center gap-1">
                <QrCode className="w-4 h-4 animate-spin text-[#FF9900]" />
                <span>Loading QR...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-2 flex-1">
        <div className="flex items-center justify-center sm:justify-start gap-1.5 text-[#FF9900] text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Modern Verification QR Credential</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          High-redundancy ISO-18004 biometric pass token with embedded cryptographic signature. Scannable with any iOS/Android camera.
        </p>
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#15233E] hover:bg-[#1E3258] border border-[#263D68] text-xs text-slate-200 font-medium transition"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Link Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy Verification URL</span>
              </>
            )}
          </button>
          <span className="text-[11px] font-mono text-slate-400">
            Pass: <span className="text-white font-bold">{code}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
