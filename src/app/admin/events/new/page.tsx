import { getSession } from '@/lib/auth';
import { AdminNav } from '@/components/admin/admin-nav';
import { EventForm } from '@/components/admin/event-form';

export default async function NewEventPage() {
  const session = await getSession();

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <AdminNav userEmail={session?.email} userRole={session?.role} />

      <main className="w-full max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 py-8">
        <EventForm />
      </main>
    </div>
  );
}
