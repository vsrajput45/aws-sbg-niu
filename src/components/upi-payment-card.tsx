'use client';

import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { 
  QrCode, ExternalLink, Smartphone, 
  ShieldCheck, IndianRupee, Info 
} from 'lucide-react';

interface UpiPaymentCardProps {
  amount: number;
  upiId: string;
  payeeName: string;
  transactionNote: string;
  externalPaymentLink?: string | null;
  customQrUrl?: string | null;
  utrValue: string;
  onUtrChange: (utr: string) => void;
  requiredUtr?: boolean;
  title?: string;
  subtitle?: string;
}

export function UpiPaymentCard({
  amount,
  upiId,
  payeeName,
  transactionNote,
  externalPaymentLink,
  customQrUrl,
  utrValue,
  onUtrChange,
  requiredUtr = false,
  title = 'Scan QR Code to Pay',
  subtitle = 'Scan with any UPI app on your phone to complete payment',
}: UpiPaymentCardProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  // NPCI Standard UPI URI (Used purely inside the scannable QR code and mobile app link)
  const upiUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(
    payeeName
  )}&am=${amount}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;

  // Generate QR Code dynamically
  useEffect(() => {
    let active = true;
    if (customQrUrl) {
      setQrDataUrl(customQrUrl);
    } else {
      QRCode.toDataURL(upiUri, {
        width: 360,
        margin: 1,
        color: {
          dark: '#0A0A0A',
          light: '#FFFFFF',
        },
      })
        .then((url) => {
          if (active) setQrDataUrl(url);
        })
        .catch((err) => {
          console.error('Failed to generate UPI QR code:', err);
        });
    }
    return () => {
      active = false;
    };
  }, [upiUri, customQrUrl]);

  return (
    <div className="rounded-2xl bg-[#090514] border border-[#2D1854] p-4 sm:p-5 text-white space-y-4 shadow-xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-[#21113D] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#FF9900]/15 text-[#FF9900] border border-[#FF9900]/30">
              <IndianRupee className="w-4 h-4" />
            </span>
            <h4 className="text-sm font-bold font-heading text-white">{title}</h4>
          </div>
          <p className="text-[11px] text-gray-400 mt-0.5">{subtitle}</p>
        </div>
        <div className="text-right shrink-0">
          <span className="text-[10px] text-purple-300 font-semibold block uppercase tracking-wider">
            Amount Due
          </span>
          <span className="text-xl font-bold font-mono text-[#FF9900]">₹{amount}</span>
        </div>
      </div>

      {/* Prominent Centered QR Code */}
      <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-white/5 border border-[#301B5A] text-center space-y-3">
        <div className="relative p-2.5 bg-white rounded-2xl shadow-lg">
          {qrDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={qrDataUrl}
              alt={`Scan QR Code to Pay ₹${amount}`}
              className="w-40 h-40 sm:w-44 sm:h-44 object-contain rounded-xl"
            />
          ) : (
            <div className="w-40 h-40 sm:w-44 sm:h-44 flex items-center justify-center text-gray-400 text-xs">
              Generating Official QR...
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-7 h-7 rounded-full bg-[#0E0724] border-2 border-white flex items-center justify-center shadow">
              <span className="text-[8px] font-bold text-[#FF9900]">AWS</span>
            </div>
          </div>
        </div>

        {/* Scan instruction pill */}
        <div className="flex items-center gap-2 text-xs text-purple-200 bg-[#160B36] border border-[#2F1764] px-3.5 py-1.5 rounded-full">
          <QrCode className="w-3.5 h-3.5 text-[#FF9900]" />
          <span>Scan with Google Pay, PhonePe, Paytm, BHIM or Cred</span>
        </div>

        {/* 1-Click Pay for Mobile Users */}
        <div className="w-full max-w-xs pt-1 space-y-2">
          <a
            href={upiUri}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#FF9900] via-[#FFA826] to-[#FFB74D] hover:brightness-110 text-black text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-lg shadow-orange-950/30"
          >
            <Smartphone className="w-4 h-4" />
            <span>Pay ₹{amount} via UPI App (Mobile)</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          {externalPaymentLink && (
            <a
              href={externalPaymentLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2 px-3 rounded-lg bg-[#180C36] hover:bg-[#22104C] border border-[#3F2275] text-purple-200 text-xs font-semibold transition flex items-center justify-center gap-1.5"
            >
              <span>Pay via Card / Netbanking / Gateway</span>
              <ExternalLink className="w-3 h-3 text-[#FF9900]" />
            </a>
          )}
        </div>
      </div>

      {/* UTR Input Section */}
      <div className="pt-2 border-t border-[#21113D] space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-purple-200 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Enter UPI Transaction ID / UTR {requiredUtr ? '(Required)' : '(Optional)'}</span>
          </label>
          <span className="text-[10px] text-gray-400 font-mono">12 Digits</span>
        </div>

        <input
          type="text"
          value={utrValue}
          onChange={(e) => onUtrChange(e.target.value)}
          placeholder="e.g. 428938192837 or UPI/2026/89342918"
          className="w-full px-3.5 py-2.5 bg-[#140A2E] border border-[#301B5A] rounded-xl text-white font-mono text-xs focus:outline-none focus:border-[#FF9900] placeholder:text-gray-500 tracking-wider"
        />

        <div className="flex items-start gap-1.5 text-[11px] text-gray-400 leading-tight">
          <Info className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
          <span>
            After paying via Google Pay, PhonePe, or Paytm, open your payment receipt and copy the <strong>12-digit UPI Reference / UTR Number</strong> here for instant verification by organizers.
          </span>
        </div>
      </div>
    </div>
  );
}
