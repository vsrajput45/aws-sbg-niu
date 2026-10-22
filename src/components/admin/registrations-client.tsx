'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Users, CheckCircle2, Clock, Search, Download, Trash2, 
  UserCheck, ArrowLeft, RefreshCw, ChevronUp 
} from 'lucide-react';
import { EventRecord, RegistrationRecord, UserRole } from '@/lib/db/types';
import { formatDate, formatDateTime, getRegistrationStatusBadge } from '@/lib/utils';

interface RegistrationsClientProps {
  initialEvent: EventRecord;
  initialRegistrations: RegistrationRecord[];
  userRole?: UserRole;
}

export function RegistrationsClient({
  initialEvent,
  initialRegistrations,
  userRole = 'admin',
}: RegistrationsClientProps) {
  const [event, setEvent] = useState(initialEvent);
  const [registrations, setRegistrations] = useState(initialRegistrations);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'confirmed' | 'waitlisted' | 'cancelled'>('all');
  const [selectedReg, setSelectedReg] = useState<RegistrationRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  // Computed metrics
  const confirmedCount = registrations.filter((r) => r.status === 'confirmed').length;
  const waitlistedCount = registrations.filter((r) => r.status === 'waitlisted').length;
  const checkedInCount = registrations.filter((r) => r.checked_in).length;
  const capacity = event.capacity || 0;
  const seatsLeft = capacity ? Math.max(0, capacity - confirmedCount) : 'Unlimited';

  // Filtered registrations
  const filtered = registrations.filter((r) => {
    const matchesSearch =
      r.full_name.toLowerCase().includes(search.toLowerCase()) ||
      r.email.toLowerCase().includes(search.toLowerCase()) ||
      r.registration_code.toLowerCase().includes(search.toLowerCase()) ||
      r.college.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const refreshData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/events/${event.id}/registrations`);
      const data = await res.json();
      if (res.ok) {
        setEvent(data.event);
        setRegistrations(data.registrations);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCheckIn = async (registrationId: string) => {
    try {
      const res = await fetch(`/api/admin/events/${event.id}/registrations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggleCheckIn', registrationId }),
      });
      if (res.ok) {
        await refreshData();
        setActionMsg('Check-in status updated.');
      }
    } catch {
      setActionMsg('Failed to update check-in.');
    }
  };

  const handleStatusChange = async (registrationId: string, newStatus: 'confirmed' | 'waitlisted') => {
    try {
      const res = await fetch(`/api/admin/events/${event.id}/registrations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'updateStatus', registrationId, newStatus }),
      });
      if (res.ok) {
        await refreshData();
        setActionMsg(`Status changed to ${newStatus}.`);
      }
    } catch {
      setActionMsg('Failed to update status.');
    }
  };

  const handleRemove = async (registrationId: string) => {
    if (!confirm('Are you sure you want to remove this registration? If confirmed, waitlist #1 will be promoted automatically.')) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/events/${event.id}/registrations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'remove', registrationId }),
      });
      if (res.ok) {
        await refreshData();
        if (selectedReg?.id === registrationId) setSelectedReg(null);
        setActionMsg('Registration removed. Seats and waitlist recomputed.');
      }
    } catch {
      setActionMsg('Failed to remove registration.');
    }
  };

  const handlePromoteWaitlist = async () => {
    try {
      const res = await fetch(`/api/admin/events/${event.id}/registrations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'promoteWaitlist' }),
      });
      const data = await res.json();
      if (res.ok) {
        await refreshData();
        setActionMsg(`Promoted ${data.promotedCount || 0} attendee(s) from waitlist.`);
      }
    } catch {
      setActionMsg('Failed to promote waitlist.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#262626]">
        <div>
          <Link href="/admin/events" className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition mb-2">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Events List</span>
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-white font-heading">
              Registrations: {event.title}
            </h1>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
              event.status === 'published' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
            }`}>
              {event.status}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {formatDate(event.event_date)} • {event.start_time} - {event.end_time} • {event.venue_name || event.platform}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={refreshData}
            disabled={loading}
            className="p-2 bg-[#1A1A1A] hover:bg-[#252525] border border-[#333333] text-gray-300 rounded-lg transition"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#FF9900]' : ''}`} />
          </button>

          {userRole === 'admin' && (
            <a
              href={`/api/admin/events/${event.id}/registrations/export`}
              download
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#1A1A1A] hover:bg-[#252525] border border-[#333333] text-white text-xs font-semibold rounded-lg transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#FF9900]" />
              <span>Export CSV</span>
            </a>
          )}
        </div>
      </div>

      {actionMsg && (
        <div className="p-3 bg-[#161616] border border-[#333333] rounded-lg text-xs text-[#FF9900] flex items-center justify-between">
          <span>{actionMsg}</span>
          <button onClick={() => setActionMsg(null)} className="text-gray-500 hover:text-white">✕</button>
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#111111] border border-[#262626] rounded-xl p-4">
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span>Confirmed Seats</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-white font-heading mt-2">
            {confirmedCount} <span className="text-xs text-gray-500 font-normal">/ {capacity || '∞'}</span>
          </p>
          <span className="text-[11px] text-emerald-400 mt-1 block">
            {seatsLeft === 'Unlimited' ? 'Unlimited capacity' : `${seatsLeft} seats remaining`}
          </span>
        </div>

        <div className="bg-[#111111] border border-[#262626] rounded-xl p-4">
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span>Waitlisted</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-white font-heading mt-2">{waitlistedCount}</p>
          {waitlistedCount > 0 && typeof seatsLeft === 'number' && seatsLeft > 0 ? (
            <button
              onClick={handlePromoteWaitlist}
              className="text-[11px] text-[#FF9900] hover:underline flex items-center gap-1 mt-1 font-semibold"
            >
              <ChevronUp className="w-3 h-3" />
              Promote available seats
            </button>
          ) : (
            <span className="text-[11px] text-gray-500 mt-1 block">Queue position order</span>
          )}
        </div>

        <div className="bg-[#111111] border border-[#262626] rounded-xl p-4">
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span>Checked In</span>
            <UserCheck className="w-4 h-4 text-[#FF9900]" />
          </div>
          <p className="text-2xl font-bold text-white font-heading mt-2">{checkedInCount}</p>
          <span className="text-[11px] text-gray-500 mt-1 block">
            {confirmedCount > 0 ? `${Math.round((checkedInCount / confirmedCount) * 100)}% attendance` : '0%'}
          </span>
        </div>

        <div className="bg-[#111111] border border-[#262626] rounded-xl p-4">
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span>Total Submissions</span>
            <CheckCircle2 className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-white font-heading mt-2">{registrations.length}</p>
          <span className="text-[11px] text-gray-500 mt-1 block">All registered records</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#111111] border border-[#262626] rounded-xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, college, or code..."
            className="w-full pl-9 pr-3 py-2 bg-[#181818] border border-[#333333] rounded-lg text-white text-xs placeholder-gray-500 focus:outline-none focus:border-[#FF9900]"
          />
        </div>

        <div className="flex items-center gap-2">
          {(['all', 'confirmed', 'waitlisted', 'cancelled'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                statusFilter === st
                  ? 'bg-[#FF9900] text-black'
                  : 'bg-[#181818] text-gray-400 hover:text-white border border-[#2a2a2a]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Registrations Table */}
      <div className="bg-[#111111] border border-[#262626] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#161616] text-gray-400 uppercase tracking-wider border-b border-[#262626]">
              <tr>
                <th className="px-5 py-3">Code / Attendee</th>
                <th className="px-5 py-3">Institution & Course</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Checked In</th>
                <th className="px-5 py-3">Registered At</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222222]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-gray-500 italic">
                    No registrations found matching the criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => {
                  const badge = getRegistrationStatusBadge(r.status);
                  return (
                    <tr key={r.id} className="hover:bg-[#141414] transition">
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-white">{r.full_name}</div>
                        <div className="text-[11px] text-gray-400 font-mono">{r.registration_code}</div>
                        <div className="text-[11px] text-gray-500">{r.email} • {r.phone}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="text-gray-200">{r.college}</div>
                        <div className="text-[11px] text-gray-500">{r.course_year} {r.college_id ? `(${r.college_id})` : ''}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${badge.className}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => handleToggleCheckIn(r.id)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-bold transition cursor-pointer ${
                            r.checked_in
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                              : 'bg-[#1a1a1a] text-gray-400 border border-[#333] hover:text-white'
                          }`}
                        >
                          <UserCheck className="w-3 h-3" />
                          <span>{r.checked_in ? 'Checked In' : 'Mark In'}</span>
                        </button>
                      </td>
                      <td className="px-5 py-3.5 text-gray-400 text-[11px]">
                        {formatDateTime(r.created_at)}
                      </td>
                      <td className="px-5 py-3.5 text-right space-x-2">
                        <button
                          onClick={() => setSelectedReg(r)}
                          className="px-2.5 py-1 bg-[#1A1A1A] hover:bg-[#252525] border border-[#333333] text-gray-300 hover:text-white rounded text-[11px] font-medium transition cursor-pointer"
                        >
                          Details
                        </button>

                        {r.status === 'waitlisted' && (
                          <button
                            onClick={() => handleStatusChange(r.id, 'confirmed')}
                            className="px-2.5 py-1 bg-emerald-950/40 hover:bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 rounded text-[11px] font-bold transition cursor-pointer"
                          >
                            Confirm
                          </button>
                        )}

                        <button
                          onClick={() => handleRemove(r.id)}
                          className="p-1 text-gray-500 hover:text-red-400 transition cursor-pointer inline-flex items-center align-middle"
                          title="Remove registration"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {selectedReg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-[#141414] border border-[#333333] rounded-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#262626] pb-3">
              <div>
                <span className="text-[10px] text-[#FF9900] font-mono">{selectedReg.registration_code}</span>
                <h3 className="text-lg font-bold text-white">{selectedReg.full_name}</h3>
              </div>
              <button onClick={() => setSelectedReg(null)} className="text-gray-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3 text-xs text-gray-300">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-gray-500 block">Email</span>
                  <span className="font-semibold text-white">{selectedReg.email}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Phone</span>
                  <span className="font-semibold text-white">{selectedReg.phone}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-gray-500 block">College / University</span>
                  <span className="text-white">{selectedReg.college}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Course & Year</span>
                  <span className="text-white">{selectedReg.course_year}</span>
                </div>
              </div>

              <div>
                <span className="text-gray-500 block">How they heard about the event</span>
                <span className="text-white">{selectedReg.hear_about}</span>
              </div>

              {selectedReg.custom_answers && Object.keys(selectedReg.custom_answers).length > 0 && (
                <div className="pt-2 border-t border-[#262626]">
                  <span className="text-[#FF9900] font-bold block mb-1">Custom Answers:</span>
                  <div className="space-y-1">
                    {Object.entries(selectedReg.custom_answers).map(([k, v]) => (
                      <div key={k} className="p-2 bg-[#1a1a1a] rounded text-[11px]">
                        <span className="text-gray-400 block font-medium">{k}:</span>
                        <span className="text-white">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-[#262626]">
              <button
                onClick={() => setSelectedReg(null)}
                className="px-4 py-2 bg-[#1f1f1f] hover:bg-[#2a2a2a] text-white text-xs font-semibold rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
