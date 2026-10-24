'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Mic, Search, CheckCircle2, Clock, XCircle, Star, 
  ExternalLink, Trash2, Mail, Phone, Building, Briefcase, 
  Eye, AlertCircle, Sparkles, Video, MapPin 
} from 'lucide-react';

function LinkedinIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
    </svg>
  );
}
import { SpeakerProposalRecord, SpeakerProposalStatus } from '@/lib/db/types';

interface SpeakersAdminClientProps {
  initialProposals: SpeakerProposalRecord[];
}

export function SpeakersAdminClient({ initialProposals }: SpeakersAdminClientProps) {
  const [proposals, setProposals] = useState<SpeakerProposalRecord[]>(initialProposals);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | SpeakerProposalStatus>('all');
  const [selectedProposal, setSelectedProposal] = useState<SpeakerProposalRecord | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [adminNotesInput, setAdminNotesInput] = useState('');

  // Metrics
  const totalCount = proposals.length;
  const pendingCount = proposals.filter((p) => p.status === 'pending').length;
  const shortlistedCount = proposals.filter((p) => p.status === 'shortlisted').length;
  const acceptedCount = proposals.filter((p) => p.status === 'accepted').length;

  // Filtered
  const filtered = proposals.filter((p) => {
    const matchesSearch =
      p.full_name.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase()) ||
      p.talk_title.toLowerCase().includes(search.toLowerCase()) ||
      p.organization.toLowerCase().includes(search.toLowerCase()) ||
      p.reference_code.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleUpdateStatus = async (id: string, newStatus: SpeakerProposalStatus, notes?: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/speakers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          admin_notes: notes !== undefined ? notes : selectedProposal?.admin_notes,
        }),
      });

      const data = await res.json();
      if (res.ok && data.proposal) {
        setProposals((prev) => prev.map((p) => (p.id === id ? data.proposal : p)));
        if (selectedProposal?.id === id) {
          setSelectedProposal(data.proposal);
        }
      } else {
        alert(data.error || 'Failed to update proposal status');
      }
    } catch {
      alert('Network error while updating proposal');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete proposal from "${name}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/speakers/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProposals((prev) => prev.filter((p) => p.id !== id));
        if (selectedProposal?.id === id) {
          setSelectedProposal(null);
        }
      } else {
        alert('Failed to delete proposal');
      }
    } catch {
      alert('Network error while deleting proposal');
    }
  };

  const openInspectionModal = (proposal: SpeakerProposalRecord) => {
    setSelectedProposal(proposal);
    setAdminNotesInput(proposal.admin_notes || '');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#FF9900] uppercase tracking-wider mb-1">
            <Mic className="w-4 h-4" />
            <span>Call for Speakers (CFP) Registry</span>
          </div>
          <h1 className="text-2xl font-bold font-heading text-white">Speaker Session Proposals</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Evaluate, shortlist, and approve talk submissions from community builders and industry experts.
          </p>
        </div>

        <Link
          href="/cfp"
          target="_blank"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#1A1A1A] hover:bg-[#262626] border border-[#333333] text-gray-200 text-xs font-semibold rounded-lg transition"
        >
          <span>View Public CFP Page</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#141414] border border-[#262626]">
          <span className="text-xs font-semibold text-gray-400">Total Proposals</span>
          <div className="text-2xl font-bold font-mono text-white mt-2">{totalCount}</div>
          <div className="text-[11px] text-gray-500 mt-1">Submitted sessions</div>
        </div>

        <div className="p-4 rounded-xl bg-[#141414] border border-[#262626]">
          <span className="text-xs font-semibold text-amber-400">Pending Review</span>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-2">{pendingCount}</div>
          <div className="text-[11px] text-gray-500 mt-1">Awaiting evaluation</div>
        </div>

        <div className="p-4 rounded-xl bg-[#141414] border border-[#262626]">
          <span className="text-xs font-semibold text-purple-400">Shortlisted</span>
          <div className="text-2xl font-bold font-mono text-purple-400 mt-2">{shortlistedCount}</div>
          <div className="text-[11px] text-gray-500 mt-1">Under track alignment</div>
        </div>

        <div className="p-4 rounded-xl bg-[#141414] border border-[#262626]">
          <span className="text-xs font-semibold text-emerald-400">Accepted</span>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-2">{acceptedCount}</div>
          <div className="text-[11px] text-gray-500 mt-1">Confirmed for agenda</div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="p-4 rounded-xl bg-[#141414] border border-[#262626] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by speaker, title, organization, or reference code..."
            className="w-full pl-10 pr-4 py-2 bg-[#1A1A1A] border border-[#333333] rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FF9900]"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 bg-[#1A1A1A] border border-[#333333] rounded-lg text-xs text-gray-200 focus:outline-none focus:border-[#FF9900]"
          >
            <option value="all">All Statuses ({totalCount})</option>
            <option value="pending">Pending ({pendingCount})</option>
            <option value="shortlisted">Shortlisted ({shortlistedCount})</option>
            <option value="accepted">Accepted ({acceptedCount})</option>
            <option value="declined">Declined</option>
          </select>
        </div>
      </div>

      {/* Proposals Table */}
      <div className="rounded-xl border border-[#262626] bg-[#141414] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#1A1A1A] border-b border-[#262626] text-gray-400 uppercase text-[10px] tracking-wider font-mono">
              <tr>
                <th className="py-3 px-4">Speaker</th>
                <th className="py-3 px-4">Proposed Session Title</th>
                <th className="py-3 px-4">Track &amp; Format</th>
                <th className="py-3 px-4">Delivery Mode</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#262626]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500 text-xs">
                    No speaker proposals found matching criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-[#1A1A1A]/50 transition">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{item.full_name}</div>
                      <div className="text-[11px] text-gray-400">{item.designation} • {item.organization}</div>
                      <div className="text-[10px] font-mono text-[#FF9900] mt-0.5">{item.reference_code}</div>
                    </td>

                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-medium text-purple-200 truncate" title={item.talk_title}>
                        {item.talk_title}
                      </div>
                      <div className="text-[11px] text-gray-400 truncate max-w-xs" title={item.abstract}>
                        {item.abstract}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-0.5 rounded bg-[#1F1F1F] border border-[#333333] text-[10px] font-medium text-gray-300">
                        {item.track}
                      </span>
                      <div className="text-[10px] text-gray-400 mt-1">{item.session_format}</div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-300">
                        {item.delivery_mode === 'in_person' ? (
                          <>
                            <MapPin className="w-3 h-3 text-[#FF9900]" />
                            <span>In-Person</span>
                          </>
                        ) : item.delivery_mode === 'online' ? (
                          <>
                            <Video className="w-3 h-3 text-cyan-400" />
                            <span>Online</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3 h-3 text-purple-400" />
                            <span>Flexible</span>
                          </>
                        )}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      {item.status === 'accepted' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Accepted</span>
                        </span>
                      ) : item.status === 'shortlisted' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-[10px] font-bold uppercase">
                          <Star className="w-3 h-3" />
                          <span>Shortlisted</span>
                        </span>
                      ) : item.status === 'declined' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[10px] font-bold uppercase">
                          <XCircle className="w-3 h-3" />
                          <span>Declined</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold uppercase">
                          <Clock className="w-3 h-3" />
                          <span>Pending</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openInspectionModal(item)}
                          title="Inspect Proposal"
                          className="p-1.5 hover:bg-[#2A2A2A] text-gray-300 hover:text-white rounded-lg transition"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(item.id, 'accepted')}
                          disabled={updatingId === item.id || item.status === 'accepted'}
                          title="Accept Proposal"
                          className="p-1.5 hover:bg-emerald-950/40 text-gray-400 hover:text-emerald-400 rounded-lg transition disabled:opacity-30"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(item.id, 'shortlisted')}
                          disabled={updatingId === item.id || item.status === 'shortlisted'}
                          title="Shortlist"
                          className="p-1.5 hover:bg-purple-950/40 text-gray-400 hover:text-purple-400 rounded-lg transition disabled:opacity-30"
                        >
                          <Star className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(item.id, item.full_name)}
                          title="Delete Proposal"
                          className="p-1.5 hover:bg-red-950/40 text-gray-400 hover:text-red-400 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Proposal Details Modal */}
      {selectedProposal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#141414] border border-[#2B2B2B] rounded-2xl w-full max-w-2xl p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono text-[#FF9900] uppercase tracking-wider block">
                  Proposal Code: {selectedProposal.reference_code}
                </span>
                <h3 className="text-xl font-bold text-white font-heading mt-0.5">
                  {selectedProposal.talk_title}
                </h3>
                <span className="text-xs text-purple-300">
                  By {selectedProposal.full_name} ({selectedProposal.designation} at {selectedProposal.organization})
                </span>
              </div>
              <button
                onClick={() => setSelectedProposal(null)}
                className="text-gray-400 hover:text-white text-lg p-1"
              >
                ✕
              </button>
            </div>

            {/* Quick Contact & Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-[#0D0A1C] border border-[#241740] text-xs">
              <div className="flex items-center gap-2 text-gray-300">
                <Mail className="w-4 h-4 text-[#FF9900] shrink-0" />
                <a href={`mailto:${selectedProposal.email}`} className="hover:underline truncate">
                  {selectedProposal.email}
                </a>
              </div>

              <div className="flex items-center gap-2 text-gray-300">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{selectedProposal.phone}</span>
              </div>

              <div className="flex items-center gap-2 text-gray-300">
                <LinkedinIcon className="w-4 h-4 text-blue-400 shrink-0" />
                <a
                  href={selectedProposal.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline truncate"
                >
                  LinkedIn Profile ↗
                </a>
              </div>

              {selectedProposal.portfolio_url && (
                <div className="flex items-center gap-2 text-gray-300">
                  <ExternalLink className="w-4 h-4 text-purple-400 shrink-0" />
                  <a
                    href={selectedProposal.portfolio_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline truncate"
                  >
                    Portfolio / Website ↗
                  </a>
                </div>
              )}
            </div>

            {/* Abstract */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block">
                Session Abstract &amp; Takeaways
              </label>
              <div className="p-4 rounded-xl bg-[#1A1A1A] border border-[#2B2B2B] text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                {selectedProposal.abstract}
              </div>
            </div>

            {/* Speaker Bio */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block">
                Speaker Bio
              </label>
              <div className="p-3.5 rounded-xl bg-[#1A1A1A] border border-[#2B2B2B] text-xs text-slate-300 leading-relaxed">
                {selectedProposal.bio}
              </div>
            </div>

            {/* Meta Tags */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-3 bg-[#1A1A1A] rounded-xl border border-[#2B2B2B]">
                <span className="text-[10px] text-gray-400 block uppercase">Track</span>
                <span className="font-semibold text-white mt-0.5 block">{selectedProposal.track}</span>
              </div>
              <div className="p-3 bg-[#1A1A1A] rounded-xl border border-[#2B2B2B]">
                <span className="text-[10px] text-gray-400 block uppercase">Format</span>
                <span className="font-semibold text-white mt-0.5 block">{selectedProposal.session_format}</span>
              </div>
              <div className="p-3 bg-[#1A1A1A] rounded-xl border border-[#2B2B2B]">
                <span className="text-[10px] text-gray-400 block uppercase">Delivery</span>
                <span className="font-semibold text-[#FF9900] mt-0.5 block capitalize">{selectedProposal.delivery_mode.replace('_', ' ')}</span>
              </div>
            </div>

            {/* Admin Notes */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block">
                Internal Organizer Notes
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={adminNotesInput}
                  onChange={(e) => setAdminNotesInput(e.target.value)}
                  placeholder="e.g. Aligned with Cloud Discovery Day lab session..."
                  className="flex-1 px-3 py-2 bg-[#1A1A1A] border border-[#333333] rounded-lg text-xs text-white focus:outline-none focus:border-[#FF9900]"
                />
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedProposal.id, selectedProposal.status, adminNotesInput)}
                  className="px-3.5 py-2 bg-[#262626] hover:bg-[#333333] text-gray-200 text-xs font-medium rounded-lg transition"
                >
                  Save Note
                </button>
              </div>
            </div>

            {/* Status Change Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#2B2B2B]">
              <button
                type="button"
                onClick={() => handleUpdateStatus(selectedProposal.id, 'accepted', adminNotesInput)}
                className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition text-center"
              >
                Accept Proposal
              </button>

              <button
                type="button"
                onClick={() => handleUpdateStatus(selectedProposal.id, 'shortlisted', adminNotesInput)}
                className="flex-1 py-2.5 px-4 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition text-center"
              >
                Shortlist
              </button>

              <button
                type="button"
                onClick={() => handleUpdateStatus(selectedProposal.id, 'declined', adminNotesInput)}
                className="py-2.5 px-4 bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 text-xs font-bold uppercase tracking-wider rounded-lg transition text-center"
              >
                Decline
              </button>

              <button
                type="button"
                onClick={() => setSelectedProposal(null)}
                className="py-2.5 px-4 bg-[#1F1F1F] hover:bg-[#2A2A2A] text-gray-300 text-xs font-semibold rounded-lg transition"
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
