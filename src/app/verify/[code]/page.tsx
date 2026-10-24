import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { 
  CheckCircle2, AlertTriangle, ShieldCheck, 
  Calendar, Building, User, Award, ArrowLeft, QrCode
} from 'lucide-react';
import { ModernQrCard } from '@/components/modern-qr-card';

interface VerifyPageProps {
  params: Promise<{ code: string }>;
}

export async function generateMetadata({ params }: VerifyPageProps): Promise<Metadata> {
  const { code } = await params;
  return {
    title: `Badge Verification • ${code} | AWS SBG NIU`,
    description: `Official digital credential verification for AWS Student Builder Group at Noida International University.`,
  };
}

export default async function VerifyBadgePage({ params }: VerifyPageProps) {
  const { code } = await params;
  const badge = db.getBadgeByCode(code);
  const featuredEvent = db.getFeaturedUpcomingEvent();

  // If badge is not found in database, show a simulated active verification for demo or notFound
  const isFound = Boolean(badge);

  return (
    <div className="min-h-screen bg-[#070514] text-white flex flex-col relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-[#7C3AED]/20 via-[#EC4899]/15 to-[#FF9900]/20 rounded-full blur-[140px] pointer-events-none" />

      <Navbar featuredEvent={featuredEvent} />

      <main className="flex-1 pt-32 pb-24 relative z-10">
        <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 space-y-8">
          {/* Breadcrumb / Back Link */}
          <div>
            <Link
              href="/badge"
              className="inline-flex items-center gap-2 text-xs font-semibold text-purple-300 hover:text-white transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Badge Generator</span>
            </Link>
          </div>

          {isFound && badge ? (
            <div className="bg-[#0D0A24] border border-[#2B1D52] rounded-3xl p-6 sm:p-10 shadow-2xl shadow-purple-950/60 relative overflow-hidden space-y-8">
              {/* Top Accent Gradient Bar */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#A855F7] via-[#EC4899] to-[#FF9900]" />

              {/* Status Header */}
              <div className="text-center space-y-3 pt-2">
                {badge.status === 'verified' ? (
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Official Credential Verified &amp; Active</span>
                  </div>
                ) : badge.status === 'pending' ? (
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Application Under Review</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold uppercase tracking-wider">
                    <span>Credential Revoked</span>
                  </div>
                )}

                <h1 className="text-2xl sm:text-4xl font-extrabold font-heading text-white tracking-tight">
                  {badge.full_name}
                </h1>

                <div className="inline-block px-3.5 py-1 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#FF9900] text-white text-xs font-black uppercase tracking-wider">
                  {badge.role}
                </div>
              </div>

              {/* Credential Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-2xl bg-[#140F35] border border-[#261B48] text-xs">
                <div className="space-y-1">
                  <span className="text-slate-400 text-[11px] block">Credential Pass Code</span>
                  <span className="font-mono font-bold text-white text-sm">{badge.code}</span>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 text-[11px] block">Affiliation / Institution</span>
                  <span className="font-semibold text-purple-200">{badge.institution}</span>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 text-[11px] block">Acquisition Source</span>
                  {badge.source === 'event_registration' ? (
                    <span className="inline-flex items-center gap-1 font-bold text-emerald-400">
                      <span>Event Registered (Complimentary Free Pass)</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 font-bold text-[#FF9900]">
                      <span>Community Supporter Donation ({badge.donation_amount ? `₹${badge.donation_amount}` : 'Contributed'})</span>
                    </span>
                  )}
                </div>

                {badge.event_title && (
                  <div className="space-y-1">
                    <span className="text-slate-400 text-[11px] block">Associated Event</span>
                    <span className="font-semibold text-white">{badge.event_title}</span>
                  </div>
                )}

                <div className="space-y-1">
                  <span className="text-slate-400 text-[11px] block">Issued At</span>
                  <span className="text-slate-300">
                    {new Date(badge.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 text-[11px] block">Cloud Region</span>
                  <span className="font-mono text-slate-300">ap-south-1 (Delhi NCR)</span>
                </div>
              </div>

              {/* Modern Verification QR Card */}
              <ModernQrCard code={badge.code || code} fullName={badge.full_name} role={badge.role} />

              {/* Barcode & Security Stamp */}
              <div className="text-center p-4 rounded-xl bg-[#080E1C] border border-[#1D2A42] space-y-2">
                <div className="flex items-center justify-center gap-2 text-xs font-mono text-[#D7E3F5]">
                  <ShieldCheck className="w-4 h-4 text-[#FF9900]" />
                  <span>CRYPTOGRAPHICALLY VALIDATED • AWS STUDENT BUILDER GROUP</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  This digital credential confirms that the delegate is an authorized participant or verified community member of AWS SBG at Noida International University.
                </p>
              </div>

              {/* Action */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <Link
                  href={`/badge?name=${encodeURIComponent(badge.full_name)}&role=${encodeURIComponent(badge.role)}`}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#8B5CF6] via-[#EC4899] to-[#FF9900] text-white text-xs font-bold uppercase tracking-wider text-center transition hover:brightness-110 shadow-lg shadow-purple-950/40"
                >
                  View &amp; Render Badge Image
                </Link>
                <Link
                  href="/badge"
                  className="w-full py-3 px-4 rounded-xl bg-[#140F35] border border-[#2B1D52] hover:bg-[#1E174E] text-slate-200 text-xs font-semibold uppercase tracking-wider text-center transition"
                >
                  Create Another Badge
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-[#0D0A24] border border-[#2B1D52] rounded-3xl p-8 sm:p-12 text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h2 className="text-xl font-bold text-white font-heading">
                  Pass Code Not Found: {code}
                </h2>
                <p className="text-xs text-slate-300 max-w-md mx-auto">
                  We could not find an active badge matching this credential code. You can register for an upcoming event to get a free pass, or claim a community badge pass below.
                </p>
              </div>

              <Link
                href="/badge"
                className="inline-flex items-center gap-2 py-3 px-6 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#FF9900] text-white text-xs font-bold uppercase tracking-wider"
              >
                Claim Your Badge Now
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
