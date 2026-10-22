import Link from 'next/link';
import { PlusCircle, Calendar, Users, Eye, Edit3, ArrowLeft } from 'lucide-react';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { AdminNav } from '@/components/admin/admin-nav';
import { formatDate } from '@/lib/utils';

export default async function AdminEventsListPage() {
  const session = await getSession();
  const allEvents = db.getAllEvents(true);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <AdminNav userEmail={session?.email} userRole={session?.role} />

      <main className="w-full max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 py-8 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#262626]">
          <div>
            <Link href="/admin" className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition mb-2">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Dashboard</span>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-white font-heading">Manage Events</h1>
            <p className="text-xs text-gray-400 mt-1">
              Create, edit, publish, and review attendance for all community sessions.
            </p>
          </div>

          <Link
            href="/admin/events/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF9900] hover:bg-[#FFAA22] text-black text-xs font-bold uppercase tracking-wider rounded-lg transition shadow-md shadow-[#FF9900]/20"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Event</span>
          </Link>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 gap-4">
          {allEvents.map((evt) => {
            const isPublished = evt.status === 'published';
            const isDraft = evt.status === 'draft';

            return (
              <div
                key={evt.id}
                className="bg-[#111111] border border-[#262626] rounded-xl p-5 hover:border-[#333333] transition flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      isPublished
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : isDraft
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        : 'bg-gray-500/10 text-gray-400 border border-gray-500/30'
                    }`}>
                      {evt.status}
                    </span>

                    {evt.featured && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#FF9900]/10 text-[#FF9900] border border-[#FF9900]/30">
                        Featured Hero
                      </span>
                    )}

                    <span className="text-xs text-gray-400 capitalize">• {evt.mode} ({evt.category})</span>
                  </div>

                  <h3 className="text-lg font-bold text-white font-heading">{evt.title}</h3>
                  <p className="text-xs text-gray-400 line-clamp-2 max-w-3xl">{evt.summary}</p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 pt-1">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#FF9900]" />
                      {formatDate(evt.event_date)} ({evt.start_time} - {evt.end_time})
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-blue-400" />
                      {evt.confirmed_count || 0} Confirmed / {evt.capacity || '∞'} Seats ({evt.waitlisted_count || 0} Waitlisted)
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <Link
                    href={`/admin/events/${evt.id}/registrations`}
                    className="px-3 py-1.5 bg-[#1A1A1A] hover:bg-[#252525] border border-[#333333] text-gray-200 text-xs font-semibold rounded-lg transition flex items-center gap-1.5"
                  >
                    <Users className="w-3.5 h-3.5 text-[#FF9900]" />
                    <span>Registrations ({evt.confirmed_count || 0})</span>
                  </Link>

                  <Link
                    href={`/admin/events/${evt.id}/edit`}
                    className="px-3 py-1.5 bg-[#1A1A1A] hover:bg-[#252525] border border-[#333333] text-[#FF9900] text-xs font-semibold rounded-lg transition flex items-center gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </Link>

                  <Link
                    href={`/events/${evt.slug}`}
                    target="_blank"
                    className="px-3 py-1.5 bg-[#141414] hover:bg-[#202020] border border-[#2a2a2a] text-gray-400 hover:text-white text-xs font-medium rounded-lg transition flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Public View</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
