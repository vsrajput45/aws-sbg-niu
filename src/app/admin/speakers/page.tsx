import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { AdminNav } from '@/components/admin/admin-nav';
import { SpeakersAdminClient } from '@/components/admin/speakers-admin-client';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Speaker Proposals & CFP Management | Admin Console',
  description: 'Review, shortlist, and approve submitted speaker session proposals for AWS SBG NIU.',
};

export default async function AdminSpeakersPage() {
  const session = await getSession();
  if (!session) {
    redirect('/admin/login?next=/admin/speakers');
  }

  const proposals = db.getSpeakerProposals();

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <AdminNav userEmail={session.email} userRole={session.role} />
      <main className="w-full max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 py-8">
        <SpeakersAdminClient initialProposals={proposals} />
      </main>
    </div>
  );
}
