'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Users, CheckCircle2, Clock, Search, Download, Trash2, 
  UserCheck, ArrowLeft, RefreshCw, ChevronUp, Mic, Sparkles, 
  HeartHandshake, GraduationCap, Building2, ExternalLink, Briefcase 
} from 'lucide-react';
import { EventRecord, RegistrationRecord, RegistrationRole, UserRole, PaymentStatus } from '@/lib/db/types';
import { formatDate, formatDateTime, getRegistrationStatusBadge, getRegistrationRoleBadge } from '@/lib/utils';

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
  const [roleFilter, setRoleFilter] = useState<'all' | RegistrationRole>('all');
  const [selectedReg, setSelectedReg] = useState<RegistrationRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  // Computed metrics
  const totalCount = registrations.length;
  const attendees = registrations.filter((r) => (r.role || 'attendee') === 'attendee');
  const confirmedAttendees = attendees.filter((r) => r.status === 'confirmed').length;
  const waitlistedAttendees = attendees.filter((r) => r.status === 'waitlisted').length;
  const checkedInCount = registrations.filter((r) => r.checked_in).length;
  const capacity = event.capacity || 0;
  const seatsLeft = capacity ? Math.max(0, capacity - confirmedAttendees) : 'Unlimited';

  const speakerCount = registrations.filter((r) => r.role === 'speaker').length;
  const sponsorCount = registrations.filter((r) => r.role === 'sponsor').length;
  const volunteerCount = registrations.filter((r) => r.role === 'volunteer').length;

  // Filtered registrations
  const filtered = registrations.filter((r) => {
    const role = r.role || 'attendee';
    const matchesRole = roleFilter === 'all' || role === roleFilter;
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;

    const matchesSearch =
      r.full_name.toLowerCase().includes(search.toLowerCase()) ||
      r.email.toLowerCase().includes(search.toLowerCase()) ||
      r.registration_code.toLowerCase().includes(search.toLowerCase()) ||
      (r.college && r.college.toLowerCase().includes(search.toLowerCase())) ||
      (r.company_name && r.company_name.toLowerCase().includes(search.toLowerCase())) ||
      (r.topic_title && r.topic_title.toLowerCase().includes(search.toLowerCase())) ||
      role.toLowerCase().includes(search.toLowerCase());

    return matchesRole && matchesStatus && matchesSearch;
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

  const handleStatusChange = async (registrationId: string, newStatus: 'confirmed' | 'waitlisted' | 'cancelled') => {
    try {
      const res = await fetch(`/api/admin/events/${event.id}/registrations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'updateStatus', registrationId, newStatus }),
      });
      if (res.ok) {
        await refreshData();
        if (selectedReg?.id === registrationId) {
          setSelectedReg({ ...selectedReg, status: newStatus });
        }
        setActionMsg(`Status changed to ${newStatus}.`);
      }
    } catch {
      setActionMsg('Failed to update status.');
    }
  };

  const handlePaymentStatusChange = async (
    registrationId: string, 
    newPaymentStatus: PaymentStatus
  ) => {
    try {
      const res = await fetch(`/api/admin/events/${event.id}/registrations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'updatePaymentStatus', registrationId, newPaymentStatus }),
      });
      if (res.ok) {
        await refreshData();
        if (selectedReg?.id === registrationId) {
          setSelectedReg({ ...selectedReg, payment_status: newPaymentStatus });
        }
        setActionMsg(`Payment status marked as ${newPaymentStatus}.`);
      }
    } catch {
      setActionMsg('Failed to update payment status.');
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
          <div className="flex items-center gap-3 flex-wrap">
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
            className="p-2 bg-[#1A1A1A] hover:bg-[#252525] border border-[#333333] text-gray-300 rounded-lg transition cursor-pointer"
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
              <span>Export CSV (All Roles)</span>
            </a>
          )}
        </div>
      </div>

      {actionMsg && (
        <div className="p-3 bg-[#161616] border border-[#333333] rounded-lg text-xs text-[#FF9900] flex items-center justify-between">
          <span>{actionMsg}</span>
          <button onClick={() => setActionMsg(null)} className="text-gray-500 hover:text-white cursor-pointer">✕</button>
        </div>
      )}

      {/* Stats Cards: Attendees & Multi-Role Breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Total Registrations */}
        <div className="bg-[#111111] border border-[#262626] rounded-xl p-3.5">
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span>Total Records</span>
            <CheckCircle2 className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-white font-heading mt-1.5">{totalCount}</p>
          <span className="text-[10px] text-gray-500 mt-0.5 block">All submissions</span>
        </div>

        {/* Confirmed Attendees */}
        <div className="bg-[#111111] border border-[#262626] rounded-xl p-3.5">
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span>Attendees</span>
            <GraduationCap className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-white font-heading mt-1.5">
            {confirmedAttendees} <span className="text-xs text-gray-500 font-normal">/ {capacity || '∞'}</span>
          </p>
          <span className="text-[10px] text-emerald-400 mt-0.5 block">
            {seatsLeft === 'Unlimited' ? 'Unlimited capacity' : `${seatsLeft} seats open`}
          </span>
        </div>

        {/* Waitlist */}
        <div className="bg-[#111111] border border-[#262626] rounded-xl p-3.5">
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span>Waitlisted</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-white font-heading mt-1.5">{waitlistedAttendees}</p>
          {waitlistedAttendees > 0 && typeof seatsLeft === 'number' && seatsLeft > 0 ? (
            <button
              onClick={handlePromoteWaitlist}
              className="text-[10px] text-[#FF9900] hover:underline flex items-center gap-1 mt-0.5 font-semibold cursor-pointer"
            >
              <ChevronUp className="w-3 h-3" />
              Promote to Confirmed
            </button>
          ) : (
            <span className="text-[10px] text-gray-500 mt-0.5 block">Queue order</span>
          )}
        </div>

        {/* Speakers */}
        <div className="bg-[#111111] border border-[#262626] rounded-xl p-3.5">
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span>Speakers</span>
            <Mic className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-white font-heading mt-1.5">{speakerCount}</p>
          <span className="text-[10px] text-purple-400 mt-0.5 block">Talk proposals</span>
        </div>

        {/* Sponsors */}
        <div className="bg-[#111111] border border-[#262626] rounded-xl p-3.5">
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span>Sponsors</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-white font-heading mt-1.5">{sponsorCount}</p>
          <span className="text-[10px] text-amber-400 mt-0.5 block">Brand partners</span>
        </div>

        {/* Volunteers */}
        <div className="bg-[#111111] border border-[#262626] rounded-xl p-3.5">
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span>Volunteers</span>
            <HeartHandshake className="w-4 h-4 text-teal-400" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-white font-heading mt-1.5">{volunteerCount}</p>
          <span className="text-[10px] text-teal-400 mt-0.5 block">Crew members</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#111111] border border-[#262626] rounded-xl p-4 space-y-3.5">
        {/* Top: Role Tabs */}
        <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-[#222222]">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            Filter by Registration Role:
          </span>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setRoleFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                roleFilter === 'all'
                  ? 'bg-white text-black'
                  : 'bg-[#181818] text-gray-400 hover:text-white border border-[#2a2a2a]'
              }`}
            >
              All Roles ({totalCount})
            </button>

            <button
              onClick={() => setRoleFilter('attendee')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                roleFilter === 'attendee'
                  ? 'bg-blue-600 text-white'
                  : 'bg-[#181818] text-blue-400 hover:text-white border border-[#2a2a2a]'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Attendees ({attendees.length})</span>
            </button>

            <button
              onClick={() => setRoleFilter('speaker')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                roleFilter === 'speaker'
                  ? 'bg-purple-600 text-white'
                  : 'bg-[#181818] text-purple-400 hover:text-white border border-[#2a2a2a]'
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Speakers ({speakerCount})</span>
            </button>

            <button
              onClick={() => setRoleFilter('sponsor')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                roleFilter === 'sponsor'
                  ? 'bg-amber-600 text-white'
                  : 'bg-[#181818] text-amber-400 hover:text-white border border-[#2a2a2a]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sponsors ({sponsorCount})</span>
            </button>

            <button
              onClick={() => setRoleFilter('volunteer')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                roleFilter === 'volunteer'
                  ? 'bg-teal-600 text-white'
                  : 'bg-[#181818] text-teal-400 hover:text-white border border-[#2a2a2a]'
              }`}
            >
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>Volunteers ({volunteerCount})</span>
            </button>
          </div>
        </div>

        {/* Bottom: Search & Status Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, code, talk title, company..."
              className="w-full pl-9 pr-3 py-2 bg-[#181818] border border-[#333333] rounded-lg text-white text-xs placeholder-gray-500 focus:outline-none focus:border-[#FF9900]"
            />
          </div>

          <div className="flex items-center gap-1.5">
            {(['all', 'confirmed', 'waitlisted', 'cancelled'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition cursor-pointer ${
                  statusFilter === st
                    ? 'bg-[#FF9900] text-black font-bold'
                    : 'bg-[#181818] text-gray-400 hover:text-white border border-[#2a2a2a]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Registrations Table */}
      <div className="bg-[#111111] border border-[#262626] rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#161616] text-gray-400 uppercase tracking-wider border-b border-[#262626]">
              <tr>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Applicant / Contact</th>
                <th className="px-5 py-3">Role-Specific Context</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Check-In</th>
                <th className="px-5 py-3">Submitted</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222222]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-gray-500 italic">
                    No registrations found matching the specified role and filters.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => {
                  const roleBadge = getRegistrationRoleBadge(r.role);
                  const statusBadge = getRegistrationStatusBadge(r.status);
                  const role = r.role || 'attendee';

                  return (
                    <tr key={r.id} className="hover:bg-[#151515] transition">
                      {/* Role Column */}
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${roleBadge.className}`}>
                          {role === 'speaker' && <Mic className="w-3 h-3" />}
                          {role === 'sponsor' && <Sparkles className="w-3 h-3" />}
                          {role === 'volunteer' && <HeartHandshake className="w-3 h-3" />}
                          {role === 'attendee' && <GraduationCap className="w-3 h-3" />}
                          <span>{roleBadge.label}</span>
                        </span>
                      </td>

                      {/* Applicant & Contact */}
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-white text-sm">{r.full_name}</div>
                        <div className="text-[11px] text-[#FF9900] font-mono tracking-wider">{r.registration_code}</div>
                        <div className="text-[11px] text-gray-400">{r.email} • {r.phone}</div>
                      </td>

                      {/* Role-Specific Context Column */}
                      <td className="px-5 py-3.5">
                        {role === 'speaker' && (
                          <div className="space-y-0.5 max-w-xs">
                            <div className="font-semibold text-purple-300 truncate" title={r.topic_title || ''}>
                              🎙️ {r.topic_title || 'Session Proposal'}
                            </div>
                            <div className="text-[11px] text-gray-400 truncate">
                              {r.college} {r.course_year ? `• ${r.course_year}` : ''}
                            </div>
                          </div>
                        )}

                        {role === 'sponsor' && (
                          <div className="space-y-0.5 max-w-xs">
                            <div className="font-semibold text-amber-300 truncate">
                              🏢 {r.company_name || r.college}
                            </div>
                            <div className="text-[11px] text-gray-400 truncate">
                              Tier: {r.sponsor_tier_interest || 'Community Partner'}
                            </div>
                          </div>
                        )}

                        {role === 'volunteer' && (
                          <div className="space-y-0.5 max-w-xs">
                            <div className="font-semibold text-teal-300 truncate">
                              ⚡ {r.volunteer_interest || 'Crew Support'}
                            </div>
                            <div className="text-[11px] text-gray-400 truncate">
                              {r.college} • {r.course_year}
                            </div>
                          </div>
                        )}

                        {role === 'attendee' && (
                          <div className="space-y-0.5 max-w-xs">
                            <div className="text-gray-200 truncate">{r.college}</div>
                            <div className="text-[11px] text-gray-500 truncate">
                              {r.course_year} {r.college_id ? `(${r.college_id})` : ''}
                            </div>
                            {r.payment_utr && (
                              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30 text-[10px] text-emerald-300 font-mono mt-1">
                                <span>UTR: {r.payment_utr}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${statusBadge.className}`}>
                          {statusBadge.label}
                        </span>
                      </td>

                      {/* Check-In */}
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

                      {/* Registered Date */}
                      <td className="px-5 py-3.5 text-gray-400 text-[11px] whitespace-nowrap">
                        {formatDateTime(r.created_at)}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right space-x-2 whitespace-nowrap">
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
                          title="Remove record"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#141414] border border-[#333333] rounded-2xl max-w-xl w-full p-6 space-y-5 my-8 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#262626] pb-3.5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-[#FF9900] font-mono font-bold">{selectedReg.registration_code}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getRegistrationRoleBadge(selectedReg.role).className}`}>
                    {selectedReg.role?.toUpperCase() || 'ATTENDEE'}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getRegistrationStatusBadge(selectedReg.status).className}`}>
                    {selectedReg.status}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white font-heading">{selectedReg.full_name}</h3>
              </div>
              <button 
                onClick={() => setSelectedReg(null)} 
                className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-[#202020] transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Content Details */}
            <div className="space-y-4 text-xs text-gray-300 max-h-[60vh] overflow-y-auto pr-1">
              {/* Contact Information */}
              <div className="p-3 bg-[#1A1A1A] rounded-xl border border-[#2B2B2B] space-y-2.5">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Contact Coordinates
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-gray-500 block text-[11px]">Email Address</span>
                    <a href={`mailto:${selectedReg.email}`} className="font-semibold text-white hover:text-[#FF9900] transition">
                      {selectedReg.email}
                    </a>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[11px]">Phone / WhatsApp</span>
                    <a href={`tel:${selectedReg.phone}`} className="font-semibold text-white hover:text-[#FF9900] transition">
                      {selectedReg.phone}
                    </a>
                  </div>
                </div>
              </div>

              {/* SPEAKER DETAILS */}
              {selectedReg.role === 'speaker' && (
                <div className="p-4 bg-purple-950/20 border border-purple-800/40 rounded-xl space-y-3">
                  <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Mic className="w-3.5 h-3.5 text-purple-400" />
                    <span>Speaker Proposal Information</span>
                  </span>

                  <div>
                    <span className="text-gray-400 block text-[11px]">Proposed Session Title</span>
                    <span className="font-bold text-white text-sm block mt-0.5">{selectedReg.topic_title || 'N/A'}</span>
                  </div>

                  <div>
                    <span className="text-gray-400 block text-[11px]">Organization &amp; Title</span>
                    <span className="text-white font-semibold">{selectedReg.college} • {selectedReg.course_year}</span>
                  </div>

                  {selectedReg.topic_abstract && (
                    <div>
                      <span className="text-gray-400 block text-[11px] mb-1">Session Abstract</span>
                      <p className="p-2.5 bg-[#140A28] rounded-lg text-gray-200 leading-relaxed font-normal whitespace-pre-wrap">
                        {selectedReg.topic_abstract}
                      </p>
                    </div>
                  )}

                  {selectedReg.speaker_bio && (
                    <div>
                      <span className="text-gray-400 block text-[11px] mb-1">Speaker Bio</span>
                      <p className="p-2.5 bg-[#140A28] rounded-lg text-gray-200 leading-relaxed font-normal">
                        {selectedReg.speaker_bio}
                      </p>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-4 pt-1">
                    {selectedReg.portfolio_or_linkedin && (
                      <a
                        href={selectedReg.portfolio_or_linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#C084FC] hover:underline flex items-center gap-1 font-semibold"
                      >
                        <span>LinkedIn / Portfolio</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    {selectedReg.previous_speaking_links && (
                      <a
                        href={selectedReg.previous_speaking_links}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-300 hover:underline flex items-center gap-1 font-semibold"
                      >
                        <span>Previous Session Link</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* SPONSOR DETAILS */}
              {selectedReg.role === 'sponsor' && (
                <div className="p-4 bg-amber-950/20 border border-amber-800/40 rounded-xl space-y-3">
                  <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Sponsorship Inquiry Information</span>
                  </span>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-gray-400 block text-[11px]">Sponsoring Company</span>
                      <span className="font-bold text-white text-sm">{selectedReg.company_name || selectedReg.college}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[11px]">Preferred Tier</span>
                      <span className="font-semibold text-amber-400">{selectedReg.sponsor_tier_interest || 'General Partner'}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-gray-400 block text-[11px]">Representative Title</span>
                      <span className="text-white font-medium">{selectedReg.designation || selectedReg.course_year || 'Representative'}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[11px]">Company Website</span>
                      {selectedReg.company_website ? (
                        <a href={selectedReg.company_website} target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline flex items-center gap-1 font-medium">
                          <span>{selectedReg.company_website}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-gray-500">Not provided</span>
                      )}
                    </div>
                  </div>

                  {selectedReg.sponsorship_notes && (
                    <div>
                      <span className="text-gray-400 block text-[11px] mb-1">Partnership Notes &amp; Expectations</span>
                      <p className="p-2.5 bg-[#1F1206] rounded-lg text-amber-200/90 leading-relaxed font-normal">
                        {selectedReg.sponsorship_notes}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* VOLUNTEER DETAILS */}
              {selectedReg.role === 'volunteer' && (
                <div className="p-4 bg-teal-950/20 border border-teal-800/40 rounded-xl space-y-3">
                  <span className="text-[10px] font-bold text-teal-300 uppercase tracking-wider flex items-center gap-1.5">
                    <HeartHandshake className="w-3.5 h-3.5 text-teal-400" />
                    <span>Volunteer Application Details</span>
                  </span>

                  <div>
                    <span className="text-gray-400 block text-[11px]">Preferred Organizing Domain</span>
                    <span className="font-bold text-teal-300 text-sm block mt-0.5">
                      {selectedReg.volunteer_interest || 'General Logistics'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-gray-400 block text-[11px]">College / University</span>
                      <span className="text-white font-semibold">{selectedReg.college}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[11px]">Course &amp; Year</span>
                      <span className="text-white font-semibold">{selectedReg.course_year}</span>
                    </div>
                  </div>

                  {selectedReg.volunteer_experience && (
                    <div>
                      <span className="text-gray-400 block text-[11px] mb-1">Skills &amp; Motivation</span>
                      <p className="p-2.5 bg-[#091F1C] rounded-lg text-teal-200/90 leading-relaxed font-normal whitespace-pre-wrap">
                        {selectedReg.volunteer_experience}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* ATTENDEE DETAILS */}
              {(selectedReg.role === 'attendee' || !selectedReg.role) && (
                <div className="p-3 bg-[#1A1A1A] rounded-xl border border-[#2B2B2B] space-y-2.5">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    Academic Background
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-gray-500 block text-[11px]">College / University</span>
                      <span className="text-white font-semibold">{selectedReg.college}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-[11px]">Course &amp; Academic Year</span>
                      <span className="text-white font-semibold">{selectedReg.course_year}</span>
                    </div>
                  </div>

                  {selectedReg.college_id && (
                    <div>
                      <span className="text-gray-500 block text-[11px]">Student ID Card No.</span>
                      <span className="text-white font-mono">{selectedReg.college_id}</span>
                    </div>
                  )}
                </div>
              )}

              {/* How Heard */}
              <div className="p-3 bg-[#1A1A1A] rounded-xl border border-[#2B2B2B]">
                <span className="text-gray-500 block text-[11px]">How they heard about the event</span>
                <span className="text-white font-medium">{selectedReg.hear_about}</span>
              </div>

              {/* Payment & Financial Info */}
              {(event.fee_type === 'paid' || selectedReg.payment_utr || selectedReg.payment_status) && (
                <div className="p-3 bg-[#17122B] rounded-xl border border-[#38265E] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block">
                      Fee &amp; UPI Payment Details
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      selectedReg.payment_status === 'verified'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : selectedReg.payment_status === 'refunded'
                        ? 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {selectedReg.payment_status || 'unpaid'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-gray-400 block text-[11px]">Payment Mode</span>
                      <span className="text-white font-medium">UPI / QR Code</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[11px]">UTR / Reference Number</span>
                      <span className="text-white font-mono font-semibold">
                        {selectedReg.payment_utr || 'Not submitted yet'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#291B48] flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] text-gray-400">Payment Action:</span>
                    <button
                      onClick={() => handlePaymentStatusChange(selectedReg.id, 'verified')}
                      className="px-2.5 py-1 bg-emerald-950/40 hover:bg-emerald-950/60 border border-emerald-700/60 text-emerald-300 rounded text-[11px] font-bold transition cursor-pointer"
                    >
                      Mark Paid
                    </button>
                    <button
                      onClick={() => handlePaymentStatusChange(selectedReg.id, 'unpaid')}
                      className="px-2.5 py-1 bg-[#1A1A1A] hover:bg-[#252525] border border-[#333] text-gray-400 hover:text-white rounded text-[11px] font-medium transition cursor-pointer"
                    >
                      Mark Unpaid
                    </button>
                    <button
                      onClick={() => handlePaymentStatusChange(selectedReg.id, 'refunded')}
                      className="px-2.5 py-1 bg-[#1A1A1A] hover:bg-[#252525] border border-[#333] text-gray-400 hover:text-white rounded text-[11px] font-medium transition cursor-pointer"
                    >
                      Mark Refunded
                    </button>
                  </div>
                </div>
              )}

              {/* Custom Answers */}
              {selectedReg.custom_answers && Object.keys(selectedReg.custom_answers).length > 0 && (
                <div className="p-3 bg-[#1A1A1A] rounded-xl border border-[#2B2B2B] space-y-2">
                  <span className="text-[#FF9900] font-bold block text-[11px] uppercase tracking-wider">
                    Custom Session Question Responses:
                  </span>
                  <div className="space-y-1.5">
                    {Object.entries(selectedReg.custom_answers).map(([k, v]) => (
                      <div key={k} className="p-2 bg-[#141414] rounded-lg text-[11px]">
                        <span className="text-gray-400 block font-medium">{k}:</span>
                        <span className="text-white font-semibold">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Logistics & Timestamps */}
              <div className="text-[11px] text-gray-400 flex items-center justify-between pt-1">
                <span>Registered: {formatDateTime(selectedReg.created_at)}</span>
                <span>Check-in: {selectedReg.checked_in ? `Yes (${formatDateTime(selectedReg.checked_in_at || '')})` : 'Not Checked In'}</span>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-3.5 border-t border-[#262626] flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleCheckIn(selectedReg.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                    selectedReg.checked_in
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                      : 'bg-[#222222] text-gray-300 border border-[#333333] hover:text-white'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>{selectedReg.checked_in ? 'Checked In' : 'Mark In'}</span>
                </button>

                {selectedReg.status !== 'confirmed' && (
                  <button
                    onClick={() => handleStatusChange(selectedReg.id, 'confirmed')}
                    className="px-3 py-1.5 bg-emerald-900/40 hover:bg-emerald-900/60 border border-emerald-700/60 text-emerald-300 rounded-lg text-xs font-bold transition cursor-pointer"
                  >
                    Confirm Pass
                  </button>
                )}

                {selectedReg.status !== 'waitlisted' && selectedReg.role === 'attendee' && (
                  <button
                    onClick={() => handleStatusChange(selectedReg.id, 'waitlisted')}
                    className="px-3 py-1.5 bg-amber-900/30 hover:bg-amber-900/50 border border-amber-700/50 text-amber-300 rounded-lg text-xs font-semibold transition cursor-pointer"
                  >
                    Move to Waitlist
                  </button>
                )}

                {selectedReg.status !== 'cancelled' && (
                  <button
                    onClick={() => handleStatusChange(selectedReg.id, 'cancelled')}
                    className="px-3 py-1.5 bg-red-950/30 hover:bg-red-950/50 border border-red-800/40 text-red-300 rounded-lg text-xs font-semibold transition cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
              </div>

              <button
                onClick={() => setSelectedReg(null)}
                className="px-4 py-1.5 bg-[#222222] hover:bg-[#2c2c2c] text-white text-xs font-semibold rounded-lg transition cursor-pointer"
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
