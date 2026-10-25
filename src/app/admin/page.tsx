import Link from 'next/link';
import { 
  Calendar, Users, PlusCircle, Clock, UserCheck, Settings, 
  Globe, ArrowRight, ChevronRight, CheckCircle, Mic, Sparkles, 
  HeartHandshake, GraduationCap, Award 
} from 'lucide-react';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { AdminNav } from '@/components/admin/admin-nav';
import { formatDate } from '@/lib/utils';

function getSevenDaysAgoIso(): string {
  const date = new Date();
  date.setDate(date.getDate() - 7);
  return date.toISOString();
}

function getTodayIsoDate(): string {
  return new Date().toISOString().split('T')[0];
}

export default async function AdminDashboardPage() {
  await db.ensureLoaded();
  const session = await getSession();
  const allEvents = db.getAllEvents(true);
  const allRegistrations = db.getAllRegistrations();
  const siteSettings = db.getSiteSettings();
  const teamMembers = db.getTeamMembers();
  const allBadges = db.getAllBadges();
  const pendingBadges = allBadges.filter((b) => b.status === 'pending' || !b.code);
  const speakerProposals = db.getSpeakerProposals();
  const pendingProposals = speakerProposals.filter((p) => p.status === 'pending');

  // Metrics
  const totalEvents = allEvents.length;
  const today = getTodayIsoDate();
  const upcomingEvents = allEvents.filter((e) => e.event_date >= today && e.status === 'published');
  const totalRegistrations = allRegistrations.length;
  
  const attendeesCount = allRegistrations.filter((r) => (r.role || 'attendee') === 'attendee').length;
  const speakersCount = allRegistrations.filter((r) => r.role === 'speaker').length;
  const sponsorsCount = allRegistrations.filter((r) => r.role === 'sponsor').length;
  const volunteersCount = allRegistrations.filter((r) => r.role === 'volunteer').length;

  const oneWeekAgo = getSevenDaysAgoIso();
  const registrationsThisWeek = allRegistrations.filter((r) => r.created_at >= oneWeekAgo).length;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <AdminNav userEmail={session?.email} userRole={session?.role} />

      <main className="w-full max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 py-8 space-y-8">
        {/* Welcome & Action Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#262626]">
          <div>
            <span className="text-xs font-bold text-[#FF9900] uppercase tracking-wider">Community Management</span>
            <h1 className="text-2xl sm:text-3xl font-bold text-white font-heading mt-1">Organizer Dashboard</h1>
            <p className="text-xs text-gray-400 mt-1">
              Overview of events, attendance rosters, credential passes, and community engagement.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Link
              href="/admin/badges"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#181818] hover:bg-[#222222] border border-[#333333] text-gray-200 hover:text-white text-xs font-semibold uppercase tracking-wider rounded-lg transition"
            >
              <Award className="w-4 h-4 text-[#FF9900]" />
              <span>Badges ({allBadges.length}{pendingBadges.length > 0 ? ` • ${pendingBadges.length} Pending` : ''})</span>
            </Link>

            <Link
              href="/admin/team"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#181818] hover:bg-[#222222] border border-[#333333] text-gray-200 hover:text-white text-xs font-semibold uppercase tracking-wider rounded-lg transition"
            >
              <Users className="w-4 h-4 text-[#FF9900]" />
              <span>Core Team ({teamMembers.length})</span>
            </Link>

            <Link
              href="/admin/site-settings"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#181818] hover:bg-[#222222] border border-[#333333] text-gray-200 hover:text-white text-xs font-semibold uppercase tracking-wider rounded-lg transition"
            >
              <Settings className="w-4 h-4 text-[#FF9900]" />
              <span>Edit Page Details</span>
            </Link>

            <Link
              href="/admin/events/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF9900] hover:bg-[#FFAA22] text-black text-xs font-bold uppercase tracking-wider rounded-lg transition shadow-md shadow-[#FF9900]/20"
            >
              <PlusCircle className="w-4 h-4" />
              <span>New Event</span>
            </Link>
          </div>
        </div>

        {/* Quick Action Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Badge Verification Card */}
          <div className="p-5 rounded-xl bg-gradient-to-r from-[#141414] via-[#121212] to-[#141414] border border-[#2B2B2B] flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-[#FF9900]/10 border border-[#FF9900]/30 text-[#FF9900] shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-bold text-white font-heading">
                    Badge Passes
                  </span>
                  {pendingBadges.length > 0 && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                      {pendingBadges.length} New
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5 truncate">
                  Issue passes
                </p>
              </div>
            </div>

            <Link
              href="/admin/badges"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FF9900] hover:bg-[#FFAA22] text-black text-xs font-bold uppercase tracking-wider transition shrink-0"
            >
              <span>Verify</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Speaker Proposals Card */}
          <div className="p-5 rounded-xl bg-gradient-to-r from-[#141414] via-[#121212] to-[#141414] border border-[#2B2B2B] flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400 shrink-0">
                <Mic className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-bold text-white font-heading">
                    Speaker CFP
                  </span>
                  {pendingProposals.length > 0 && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                      {pendingProposals.length} New
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5 truncate">
                  {speakerProposals.length} Submitted
                </p>
              </div>
            </div>

            <Link
              href="/admin/speakers"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#8B5CF6] hover:bg-[#9333EA] text-white text-xs font-bold uppercase tracking-wider transition shrink-0 shadow-md shadow-purple-900/30"
            >
              <span>Review</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Core Team Management Card */}
          <div className="p-5 rounded-xl bg-gradient-to-r from-[#141414] via-[#121212] to-[#141414] border border-[#2B2B2B] flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white font-heading">
                    Core Team
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5 truncate">
                  {teamMembers.length} Leaders
                </p>
              </div>
            </div>

            <Link
              href="/admin/team"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#181818] hover:bg-[#222222] border border-[#333333] text-white text-xs font-semibold uppercase tracking-wider transition shrink-0"
            >
              <span>Manage</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Site Details Card */}
          <div className="p-5 rounded-xl bg-gradient-to-r from-[#141414] via-[#121212] to-[#141414] border border-[#2B2B2B] flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shrink-0">
                <Globe className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white font-heading">
                    Site Details
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5 truncate">
                  Live settings
                </p>
              </div>
            </div>

            <Link
              href="/admin/site-settings"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#181818] hover:bg-[#222222] border border-[#333333] text-white text-xs font-semibold uppercase tracking-wider transition shrink-0"
            >
              <span>Settings</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Stat Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-[#111111] border border-[#262626] rounded-xl p-5 hover:border-[#333333] transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Total Events</span>
              <div className="p-2 bg-[#1A1A1A] rounded-lg text-[#FF9900]">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-white font-heading mt-3">{totalEvents}</p>
            <span className="text-[11px] text-gray-500 mt-1 block">Includes drafts & published</span>
          </div>

          <div className="bg-[#111111] border border-[#262626] rounded-xl p-5 hover:border-[#333333] transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Upcoming Published</span>
              <div className="p-2 bg-[#1A1A1A] rounded-lg text-emerald-400">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-white font-heading mt-3">{upcomingEvents.length}</p>
            <span className="text-[11px] text-gray-500 mt-1 block">Live on website</span>
          </div>

          <div className="bg-[#111111] border border-[#262626] rounded-xl p-5 hover:border-[#333333] transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Total Registrations</span>
              <div className="p-2 bg-[#1A1A1A] rounded-lg text-blue-400">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-white font-heading mt-3">{totalRegistrations}</p>
            <span className="text-[11px] text-gray-500 mt-1 block">Confirmed & waitlisted all-time</span>
          </div>

          <div className="bg-[#111111] border border-[#262626] rounded-xl p-5 hover:border-[#333333] transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Past 7 Days</span>
              <div className="p-2 bg-[#1A1A1A] rounded-lg text-[#FF9900]">
                <UserCheck className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-white font-heading mt-3">{registrationsThisWeek}</p>
            <span className="text-[11px] text-gray-500 mt-1 block">New RSVPs this week</span>
          </div>
        </div>

        {/* Multi-Role Registration Distribution Card */}
        <div className="p-4 sm:p-5 rounded-xl bg-[#111111] border border-[#262626] space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-xs font-bold text-gray-200 uppercase tracking-wider">
                Registration Breakdown by Role
              </h3>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Distribution of community applicants across active roles.
              </p>
            </div>
            <span className="text-xs font-mono font-semibold text-[#FF9900]">
              Total Records: {totalRegistrations}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            <div className="p-3 bg-[#161616] border border-[#262626] rounded-lg flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-semibold block">Attendees</span>
                <span className="text-lg font-bold text-white font-heading">{attendeesCount}</span>
              </div>
            </div>

            <div className="p-3 bg-[#161616] border border-[#262626] rounded-lg flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                <Mic className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-semibold block">Speakers</span>
                <span className="text-lg font-bold text-white font-heading">{speakersCount}</span>
              </div>
            </div>

            <div className="p-3 bg-[#161616] border border-[#262626] rounded-lg flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-semibold block">Sponsors</span>
                <span className="text-lg font-bold text-white font-heading">{sponsorsCount}</span>
              </div>
            </div>

            <div className="p-3 bg-[#161616] border border-[#262626] rounded-lg flex items-center gap-3">
              <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400">
                <HeartHandshake className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-semibold block">Volunteers</span>
                <span className="text-lg font-bold text-white font-heading">{volunteersCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Events Table */}
        <div className="bg-[#111111] border border-[#262626] rounded-xl overflow-hidden">
          <div className="p-5 border-b border-[#222222] flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white font-heading">Events Overview</h2>
              <p className="text-xs text-gray-400 mt-0.5">All scheduled and draft sessions.</p>
            </div>
            <Link href="/admin/events" className="text-xs text-[#FF9900] hover:underline flex items-center gap-1">
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#161616] text-gray-400 uppercase tracking-wider border-b border-[#262626]">
                <tr>
                  <th className="px-5 py-3">Event Title</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Confirmed / Capacity</th>
                  <th className="px-5 py-3">Waitlist</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222222]">
                {allEvents.map((evt) => (
                  <tr key={evt.id} className="hover:bg-[#141414] transition">
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-white">{evt.title}</div>
                      <div className="text-[11px] text-gray-500">{evt.category} • {evt.mode}</div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-300">
                      {formatDate(evt.event_date)}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        evt.status === 'published'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : evt.status === 'draft'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          : 'bg-gray-500/10 text-gray-400 border border-gray-500/30'
                      }`}>
                        {evt.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-300">
                      <span className="font-bold text-white">{evt.confirmed_count || 0}</span>
                      <span className="text-gray-500"> / {evt.capacity ? evt.capacity : '∞'}</span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-300">
                      {evt.waitlisted_count || 0}
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-2">
                      <Link
                        href={`/admin/events/${evt.id}/registrations`}
                        className="px-2.5 py-1 bg-[#1A1A1A] hover:bg-[#252525] border border-[#333333] text-gray-300 hover:text-white rounded text-[11px] font-medium transition"
                      >
                        Registrations ({evt.confirmed_count || 0})
                      </Link>
                      <Link
                        href={`/admin/events/${evt.id}/edit`}
                        className="px-2.5 py-1 bg-[#1A1A1A] hover:bg-[#252525] border border-[#333333] text-[#FF9900] rounded text-[11px] font-medium transition"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Instructions Card */}
        <div className="bg-[#111111] border border-[#262626] rounded-xl p-5 text-xs text-gray-400 space-y-2">
          <div className="flex items-center gap-2 text-white font-bold">
            <CheckCircle className="w-4 h-4 text-[#FF9900]" />
            <span>How Event Publishing Works</span>
          </div>
          <p>
            When zero events are published, the public site runs in pure <strong>Launch Mode</strong> (honest story, no countdown, designed empty events state).
            Once you edit the sample draft event above and change its status from <strong>Draft</strong> to <strong>Published</strong>, it instantly activates the hero countdown, agenda, speakers, and registration on the homepage and <code className="text-[#FF9900]">/events</code> with zero code deployment!
          </p>
        </div>
      </main>
    </div>
  );
}
