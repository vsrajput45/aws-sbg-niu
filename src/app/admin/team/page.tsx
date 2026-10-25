import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { AdminNav } from '@/components/admin/admin-nav';
import { TeamManager } from '@/components/admin/team-manager';
import { siteConfig } from '@/config/site';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: `Core Team Management | Admin | ${siteConfig.shortName}`,
  description: 'Add, edit, reorder, and manage student leaders for AWS SBG at NIU.',
};

export default async function AdminTeamPage() {
  const session = await getSession();
  if (!session) {
    redirect('/admin/login');
  }

  await db.ensureLoaded();
  const teamMembers = db.getTeamMembers();

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <AdminNav userEmail={session.email} userRole={session.role} />

      <main className="w-full max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 py-8 space-y-8">
        {/* Header Breadcrumbs */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#262626]">
          <div>
            <span className="text-xs font-bold text-[#FF9900] uppercase tracking-wider">
              Student Leadership Directory
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-white font-heading mt-1">
              Core Team Management
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Manage student organizers, update credentials, change roles, and add new appointed leaders.
            </p>
          </div>
        </div>

        {/* Live Team Manager */}
        <TeamManager initialMembers={teamMembers} />
      </main>
    </div>
  );
}
