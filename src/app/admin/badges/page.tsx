import { Metadata } from 'next';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { AdminNav } from '@/components/admin/admin-nav';
import { BadgeAdminClient } from '@/components/admin/badge-admin-client';
import { Award, ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Badge Verification & Credential Management | Admin Console',
  description: 'Verify, approve, and manage official AWS conference badges, QR codes, and community donation passes.',
};

export default async function AdminBadgesPage() {
  await db.ensureLoaded();
  const session = await getSession();
  const badges = db.getAllBadges();

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <AdminNav userEmail={session?.email} userRole={session?.role} />

      <main className="w-full max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#262626]">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#FF9900]" />
              <span className="text-xs font-bold text-[#FF9900] uppercase tracking-wider">
                Credential Verification System
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white font-heading mt-1">
              Badges &amp; Passes Verification
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Verify participant credentials, monitor event complimentary badges vs. community donation passes, and review scannable QR / Barcode tokens.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#141414] border border-[#262626] text-xs font-semibold text-gray-300">
              <ShieldCheck className="w-4 h-4 text-[#FF9900]" />
              <span>Event Free Passes vs Donation Passes</span>
            </span>
          </div>
        </div>

        {/* Client Interactive Table & Filter Component */}
        <BadgeAdminClient initialBadges={badges} />
      </main>
    </div>
  );
}
