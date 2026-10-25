import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { AdminNav } from '@/components/admin/admin-nav';
import { EventForm } from '@/components/admin/event-form';

interface EditEventPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditEventPage({ params }: EditEventPageProps) {
  const session = await getSession();
  const { id } = await params;
  await db.ensureLoaded();
  const event = db.getEventById(id, true);

  if (!event) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <AdminNav userEmail={session?.email} userRole={session?.role} />

      <main className="w-full max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 py-8">
        <EventForm initialEvent={event} isEdit={true} />
      </main>
    </div>
  );
}
