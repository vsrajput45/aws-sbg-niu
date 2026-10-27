import { Suspense } from 'react';
import { Metadata } from 'next';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { AdminNav } from '@/components/admin/admin-nav';
import { SiteSettingsForm } from '@/components/admin/site-settings-form';
import { siteConfig } from '@/config/site';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: `Web Page Details & Site Settings | Admin | ${siteConfig.shortName}`,
  description: 'Manage website text, venue details, candidate email sender, and external form URLs.',
};

export default async function AdminSiteSettingsPage() {
  await db.ensureLoaded();
  const session = await getSession();
  const currentSettings = db.getSiteSettings();

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <AdminNav userEmail={session?.email} userRole={session?.role} />

      <main className="w-full max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 py-8 space-y-8">
        {/* Header Breadcrumbs */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#262626]">
          <div>
            <span className="text-xs font-bold text-[#FF9900] uppercase tracking-wider">
              Website &amp; Dispatch Customization
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-white font-heading mt-1">
              Web Page Details &amp; Settings
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Change candidate email sender address, site titles, venue information, and form links.
            </p>
          </div>
        </div>

        {/* Live Settings Editor Form */}
        <Suspense fallback={<div className="p-12 text-center text-gray-400 font-mono text-xs">Loading settings...</div>}>
          <SiteSettingsForm initialSettings={currentSettings} />
        </Suspense>
      </main>
    </div>
  );
}
