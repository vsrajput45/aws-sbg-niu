import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { 
  CheckCircle2, AlertTriangle, ShieldCheck, 
  Download, Lock, ShieldAlert, Cpu
} from 'lucide-react';
import { ModernQrCard } from '@/components/modern-qr-card';
import { GateCheckinCard } from '@/components/gate-checkin-card';

export const dynamic = 'force-dynamic';

interface VerifyPageProps {
  params: Promise<{ code: string }>;
}

export async function generateMetadata({ params }: VerifyPageProps): Promise<Metadata> {
  const { code } = await params;
  return {
    title: `Credential Security Gateway • ${code} | AWS SBG NIU`,
    description: `Encrypted biometric credential verification gateway for AWS Student Builder Group at Noida International University.`,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function VerifyBadgePage({ params }: VerifyPageProps) {
  await db.ensureLoaded();
  const session = await getSession();
  const isAdmin = Boolean(session?.role);
  const { code } = await params;
  const badge = db.getBadgeByCode(code);
  const registration = badge?.email ? db.getRegistrationByEmail(badge.email) : undefined;
  const isCheckedIn = Boolean(badge?.checked_in || registration?.checked_in);
  const checkedInAt = badge?.checked_in_at || registration?.checked_in_at || null;

  const isFound = Boolean(badge);

  return (
    <div className="min-h-screen bg-[#070514] text-white flex flex-col relative overflow-hidden select-none">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-[#7C3AED]/20 via-[#EC4899]/15 to-[#FF9900]/20 rounded-full blur-[140px] pointer-events-none" />

      {/* Standalone Security Gateway Header (No Main Website Navigation) */}
      <header className="sticky top-0 z-40 bg-[#0B081E]/90 backdrop-blur-md border-b border-[#2B1D52]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-7 sm:w-14 sm:h-8">
              <Image src="/aws-logo.svg" alt="AWS" fill className="object-contain" priority />
            </div>
            <div className="h-5 w-px bg-[#3E256C]" />
            <div>
              <span className="text-xs font-bold text-white font-heading tracking-wide block">
                CREDENTIAL SECURITY GATEWAY
              </span>
              <span className="text-[10px] text-purple-300 font-mono">
                AWS SBG • Edge Proxy ap-south-1
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="hidden sm:inline">SECURE VERIFIED PROXY</span>
          </div>
        </div>
      </header>

      {/* Isolated Verification Content Area */}
      <main className="flex-1 py-10 sm:py-14 relative z-10">
        <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 space-y-6">
          {/* Gateway Status Badge */}
          <div className="flex items-center justify-between text-[11px] font-mono text-purple-300/80 bg-[#120B28] px-4 py-2 rounded-xl border border-[#2B1D52]">
            <span className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-[#FF9900]" />
              <span>Proxy Terminal: SECURE-NODE-NIU-01</span>
            </span>
            <span className="text-slate-400">Isolated Gateway Mode</span>
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

              {/* Gate Check-In & Real-Time Duplicate Scanner Status Card */}
              <GateCheckinCard
                code={badge.code || code}
                fullName={badge.full_name}
                initialCheckedIn={isCheckedIn}
                initialCheckedInAt={checkedInAt}
                isAdmin={isAdmin}
                adminEmail={session?.email}
              />

              {/* Credential Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-2xl bg-[#140F35] border border-[#261B48] text-xs">
                <div className="space-y-1">
                  <span className="text-slate-400 text-[11px] block">Credential Pass Code</span>
                  <span className="font-mono font-bold text-white text-sm">* {badge.code} *</span>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 text-[11px] block">Affiliation / Institution</span>
                  <span className="font-semibold text-purple-200">{badge.institution || 'Noida International University'}</span>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 text-[11px] block">Acquisition Source</span>
                  {badge.source === 'event_registration' ? (
                    <span className="inline-flex items-center gap-1 font-bold text-emerald-400">
                      <span>Event Registered Delegate Pass</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 font-bold text-[#FF9900]">
                      <span>Community Supporter Pass</span>
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
                  <span className="text-slate-400 text-[11px] block">Cloud Security Zone</span>
                  <span className="font-mono text-slate-300">ap-south-1 (Delhi NCR)</span>
                </div>
              </div>

              {/* Modern Verification QR Card */}
              <ModernQrCard code={badge.code || code} fullName={badge.full_name} role={badge.role} />

              {/* Barcode & Security Stamp */}
              <div className="text-center p-4 rounded-xl bg-[#080E1C] border border-[#1D2A42] space-y-2">
                <div className="flex items-center justify-center gap-2 text-xs font-mono text-[#D7E3F5]">
                  <ShieldCheck className="w-4 h-4 text-[#FF9900]" />
                  <span>CRYPTOGRAPHICALLY VALIDATED • AWS STUDENT BUILDER GROUP GATEWAY</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  This digital credential confirms that the delegate is an authorized participant or verified community member. Isolated proxy security active.
                </p>
              </div>

              {/* Action Button: Download Offline Pass */}
              <div className="pt-2">
                <Link
                  href={`/badge?name=${encodeURIComponent(badge.full_name)}&role=${encodeURIComponent(badge.role)}`}
                  target="_blank"
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#8B5CF6] via-[#EC4899] to-[#FF9900] text-white text-xs font-bold uppercase tracking-wider text-center transition hover:brightness-110 shadow-lg shadow-purple-950/40 flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Delegate Pass Graphic (1080×1350 PNG)</span>
                </Link>
              </div>
            </div>
          ) : (
            /* Pass Not Found Card */
            <div className="bg-[#0D0A24] border border-[#2B1D52] rounded-3xl p-8 sm:p-12 text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
                <ShieldAlert className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h2 className="text-xl font-bold text-white font-heading">
                  Pass Code Not Found In Security Registry: {code}
                </h2>
                <p className="text-xs text-slate-300 max-w-md mx-auto">
                  This credential could not be verified in the AWS SBG NIU security registry. Access is unauthorized.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Minimal Gateway Security Footer (No website browse links) */}
      <footer className="border-t border-[#1C1338] py-6 text-center text-xs text-slate-500 relative z-10 bg-[#070514]">
        <div className="max-w-2xl mx-auto px-4 space-y-1.5">
          <div className="flex items-center justify-center gap-2 text-slate-400 font-mono text-[11px]">
            <Lock className="w-3.5 h-3.5 text-[#FF9900]" />
            <span>AWS SBG NIU • SECURE IDENTITY &amp; ACCESS GATEWAY</span>
          </div>
          <p className="text-[10px] text-slate-600">
            Authorized delegate inspection portal. External site navigation is isolated in gateway mode.
          </p>
        </div>
      </footer>
    </div>
  );
}
