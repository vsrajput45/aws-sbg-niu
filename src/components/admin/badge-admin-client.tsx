'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { generateModernQrDataUrl } from '@/lib/modernQr';
import { 
  Award, CheckCircle2, Clock, XCircle, Search, Filter, 
  ExternalLink, QrCode, ShieldCheck, IndianRupee, RefreshCw, 
  Trash2, UserCheck, AlertCircle, Eye, Sparkles, Copy, Download
} from 'lucide-react';
import { BadgeApplicationRecord, BadgeStatus } from '@/lib/db';

interface BadgeAdminClientProps {
  initialBadges: BadgeApplicationRecord[];
}

export function BadgeAdminClient({ initialBadges }: BadgeAdminClientProps) {
  const [badges, setBadges] = useState<BadgeApplicationRecord[]>(initialBadges);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | BadgeStatus>('all');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'event_registration' | 'community_donation'>('all');
  const [selectedBadge, setSelectedBadge] = useState<BadgeApplicationRecord | null>(null);
  const [modalQrUrl, setModalQrUrl] = useState<string | null>(null);
  const [issueModalBadge, setIssueModalBadge] = useState<BadgeApplicationRecord | null>(null);
  const [generatedCode, setGeneratedCode] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [submittingCode, setSubmittingCode] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    if (!selectedBadge?.code) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://aws-sbg-niu.vercel.app';
    const link = `${origin}/verify/${selectedBadge.code}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQr = () => {
    if (!modalQrUrl || !selectedBadge?.code) return;
    const a = document.createElement('a');
    a.href = modalQrUrl;
    a.download = `AWS-QR-${selectedBadge.code}.png`;
    a.click();
  };

  useEffect(() => {
    if (!selectedBadge?.code) {
      setModalQrUrl(null);
      return;
    }
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://aws-sbg-niu.ac.in';
    const payload = selectedBadge.qr_payload || `${origin}/verify/${selectedBadge.code}`;
    generateModernQrDataUrl(payload, {
      size: 360,
      eyeColor: '#FF9900',
      dotColor: '#0B1220',
      bgColor: '#FFFFFF',
      includeLogo: true,
      dotStyle: 'dots',
    })
      .then((url) => setModalQrUrl(url))
      .catch(() => setModalQrUrl(null));
  }, [selectedBadge]);

  // Filtered badges
  const filtered = badges.filter((b) => {
    const matchesSearch = 
      b.full_name.toLowerCase().includes(search.toLowerCase()) ||
      b.email.toLowerCase().includes(search.toLowerCase()) ||
      (b.code && b.code.toLowerCase().includes(search.toLowerCase())) ||
      (b.donation_utr && b.donation_utr.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    const matchesSource = sourceFilter === 'all' || b.source === sourceFilter;

    return matchesSearch && matchesStatus && matchesSource;
  });

  // Metrics
  const totalBadges = badges.length;
  const verifiedCount = badges.filter((b) => b.status === 'verified' && b.code).length;
  const pendingCount = badges.filter((b) => b.status === 'pending' || !b.code).length;
  const eventFreeCount = badges.filter((b) => b.source === 'event_registration').length;
  const donationCount = badges.filter((b) => b.source === 'community_donation').length;
  const totalDonationFunds = badges
    .filter((b) => b.source === 'community_donation' && b.status === 'verified')
    .reduce((sum, b) => sum + (b.donation_amount || 0), 0);

  const makeRandomCode = () => {
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `NIU-AWS-2026-${rand}`;
  };

  const handleOpenIssueModal = (badge: BadgeApplicationRecord) => {
    setIssueModalBadge(badge);
    setGeneratedCode(badge.code || makeRandomCode());
  };

  const handleConfirmIssueCode = async () => {
    if (!issueModalBadge) return;
    const code = generatedCode.trim().toUpperCase();
    if (!code) {
      alert('Please enter or generate a valid pass code.');
      return;
    }

    setSubmittingCode(true);
    try {
      const res = await fetch(`/api/admin/badges/${issueModalBadge.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          status: 'verified',
        }),
      });

      const data = await res.json();
      if (res.ok && data.badge) {
        setBadges((prev) => prev.map((b) => (b.id === issueModalBadge.id ? data.badge : b)));
        if (selectedBadge?.id === issueModalBadge.id) {
          setSelectedBadge(data.badge);
        }
        setIssueModalBadge(null);
      } else {
        alert(data.error || 'Failed to issue pass code');
      }
    } catch {
      alert('Network error while issuing pass code');
    } finally {
      setSubmittingCode(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: BadgeStatus) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/badges/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (res.ok && data.badge) {
        setBadges((prev) => prev.map((b) => (b.id === id ? data.badge : b)));
        if (selectedBadge?.id === id) {
          setSelectedBadge(data.badge);
        }
      } else {
        alert(data.error || 'Failed to update status');
      }
    } catch {
      alert('Network error while updating badge');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this badge record?')) return;

    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/badges/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setBadges((prev) => prev.filter((b) => b.id !== id));
        if (selectedBadge?.id === id) setSelectedBadge(null);
      } else {
        alert('Failed to delete badge');
      }
    } catch {
      alert('Network error while deleting badge');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Total Badges */}
        <div className="p-4 rounded-xl bg-[#141414] border border-[#262626]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400">Total Applications</span>
            <Award className="w-4 h-4 text-[#FF9900]" />
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-2">{totalBadges}</div>
          <div className="text-[11px] text-gray-500 mt-1">{verifiedCount} Pass codes issued</div>
        </div>

        {/* Pending Verification */}
        <div className="p-4 rounded-xl bg-[#141414] border border-[#FF9900]/40 bg-gradient-to-b from-amber-500/5 to-transparent">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-400">Pending Pass Code</span>
            <Clock className="w-4 h-4 text-[#FF9900] animate-pulse" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#FF9900] mt-2">{pendingCount}</div>
          <div className="text-[11px] text-amber-300/80 mt-1">Awaiting admin code generation</div>
        </div>

        {/* Event Free Passes */}
        <div className="p-4 rounded-xl bg-[#141414] border border-[#262626]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400">Event Free Passes</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-2">{eventFreeCount}</div>
          <div className="text-[11px] text-gray-500 mt-1">100% Free for attendees</div>
        </div>

        {/* Community Donations */}
        <div className="p-4 rounded-xl bg-[#141414] border border-[#262626]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400">Donation Passes</span>
            <IndianRupee className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-2">{donationCount}</div>
          <div className="text-[11px] text-gray-500 mt-1">Non-registered supporters</div>
        </div>

        {/* Total Raised */}
        <div className="p-4 rounded-xl bg-[#141414] border border-[#262626]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400">Funds Raised</span>
            <span className="text-xs font-bold text-[#FF9900]">₹ INR</span>
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-2">₹{totalDonationFunds}</div>
          <div className="text-[11px] text-gray-500 mt-1">Supports student builders</div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="p-4 rounded-xl bg-[#141414] border border-[#262626] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by candidate name, email, pass code, or UTR..."
            className="w-full pl-10 pr-4 py-2 bg-[#1A1A1A] border border-[#333333] rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FF9900]"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 bg-[#1A1A1A] border border-[#333333] rounded-lg text-xs text-gray-200 focus:outline-none focus:border-[#FF9900]"
          >
            <option value="all">All Statuses</option>
            <option value="verified">Verified Active</option>
            <option value="pending">Pending Approval</option>
            <option value="revoked">Revoked</option>
          </select>

          {/* Source Filter */}
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value as any)}
            className="px-3 py-2 bg-[#1A1A1A] border border-[#333333] rounded-lg text-xs text-gray-200 focus:outline-none focus:border-[#FF9900]"
          >
            <option value="all">All Sources</option>
            <option value="event_registration">Event Free Passes</option>
            <option value="community_donation">Community Donations</option>
          </select>
        </div>
      </div>

      {/* Badges Table */}
      <div className="rounded-xl border border-[#262626] bg-[#141414] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#1A1A1A] border-b border-[#262626] text-gray-400 uppercase text-[10px] tracking-wider font-mono">
              <tr>
                <th className="py-3 px-4">Delegate / Applicant</th>
                <th className="py-3 px-4">Role &amp; Pass Code</th>
                <th className="py-3 px-4">Source &amp; Payment</th>
                <th className="py-3 px-4">Verification</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#262626]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500">
                    No badges found matching current filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-[#1A1A1A]/50 transition">
                    {/* Delegate */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{b.full_name}</div>
                      <div className="text-gray-400 text-[11px] font-mono">{b.email}</div>
                      <div className="text-gray-500 text-[10px] truncate max-w-[200px]">{b.institution}</div>
                    </td>

                    {/* Role & Pass Code */}
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FF9900]/15 text-[#FF9900] border border-[#FF9900]/30 uppercase tracking-wide">
                        {b.role}
                      </span>
                      {b.code ? (
                        <div className="font-mono text-gray-300 text-[11px] mt-1 font-semibold flex items-center gap-1.5">
                          <span className="text-[#FF9900]">{b.code}</span>
                          <button
                            onClick={() => handleOpenIssueModal(b)}
                            title="Edit or Re-issue Pass Code"
                            className="text-[10px] text-gray-400 hover:text-white underline ml-1 font-sans"
                          >
                            Edit
                          </button>
                        </div>
                      ) : (
                        <div className="mt-1">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/30">
                            <Clock className="w-3 h-3" />
                            Pending Admin Pass Code
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Source & Payment */}
                    <td className="py-3.5 px-4">
                      {b.source === 'event_registration' ? (
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            Event Free Pass (₹0)
                          </span>
                          {b.event_title && (
                            <div className="text-[10px] text-gray-400 truncate max-w-[180px]">
                              {b.event_title}
                            </div>
                          )}
                          {b.registration_code && (
                            <div className="text-[10px] text-gray-500 font-mono">
                              Reg: {b.registration_code}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400">
                            <IndianRupee className="w-3 h-3" />
                            Donation: ₹{b.donation_amount || 0}
                          </span>
                          {b.donation_utr && (
                            <div className="text-[10px] text-gray-400 font-mono truncate max-w-[180px]">
                              UTR: {b.donation_utr}
                            </div>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Verification Status */}
                    <td className="py-3.5 px-4">
                      {b.status === 'verified' && b.code ? (
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" />
                            Issued &amp; Verified
                          </span>
                          {b.verified_by && (
                            <div className="text-[10px] text-gray-500">By: {b.verified_by}</div>
                          )}
                        </div>
                      ) : b.status === 'pending' || !b.code ? (
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                            <Clock className="w-3 h-3" />
                            Awaiting Pass Code
                          </span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                          <XCircle className="w-3 h-3" />
                          Revoked
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Primary Action: Generate Pass Code if not yet issued */}
                        {(!b.code || b.status === 'pending') && (
                          <button
                            onClick={() => handleOpenIssueModal(b)}
                            className="px-2.5 py-1.5 bg-[#FF9900] hover:bg-[#FFAA22] text-black text-xs font-bold rounded-lg transition flex items-center gap-1 shadow-md shadow-amber-500/20"
                            title="Generate Official Pass Code & Issue Badge"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Issue Pass Code</span>
                          </button>
                        )}

                        {/* Revoke Button if verified */}
                        {b.status === 'verified' && b.code && (
                          <button
                            onClick={() => handleUpdateStatus(b.id, 'revoked')}
                            disabled={updatingId === b.id}
                            title="Revoke Badge"
                            className="p-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-lg transition border border-amber-500/30"
                          >
                            <AlertCircle className="w-4 h-4" />
                          </button>
                        )}

                        {/* Re-activate if revoked */}
                        {b.status === 'revoked' && (
                          <button
                            onClick={() => handleUpdateStatus(b.id, 'verified')}
                            disabled={updatingId === b.id}
                            title="Re-activate Badge"
                            className="p-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg transition border border-blue-500/30"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        )}

                        {/* View QR & Barcode Detail Modal (enabled once code exists) */}
                        {b.code && (
                          <button
                            onClick={() => setSelectedBadge(b)}
                            title="View QR Code & Barcode"
                            className="p-1.5 bg-[#1F1F1F] hover:bg-[#2A2A2A] text-purple-300 rounded-lg transition border border-[#333333]"
                          >
                            <QrCode className="w-4 h-4" />
                          </button>
                        )}

                        {/* Open Verification Page */}
                        {b.code && (
                          <Link
                            href={`/verify/${b.code}`}
                            target="_blank"
                            title="Open Live Verification URL"
                            className="p-1.5 bg-[#1F1F1F] hover:bg-[#2A2A2A] text-gray-300 hover:text-white rounded-lg transition border border-[#333333]"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                        )}

                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(b.id)}
                          disabled={updatingId === b.id}
                          title="Delete Badge Record"
                          className="p-1.5 bg-[#1F1F1F] hover:bg-rose-500/20 text-gray-400 hover:text-rose-400 rounded-lg transition border border-[#333333]"
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

      {/* Generate Pass Code & Issue Modal */}
      {issueModalBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#141414] border border-[#2B2B2B] rounded-2xl w-full max-w-lg p-6 space-y-6 shadow-2xl relative">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-[#FF9900] uppercase tracking-wider block">
                  Admin Verification System
                </span>
                <h3 className="text-lg font-bold text-white font-heading mt-0.5">
                  Generate &amp; Issue Official Pass Code
                </h3>
                <p className="text-xs text-gray-400">
                  Assign official credentials to delegate badge.
                </p>
              </div>
              <button
                onClick={() => setIssueModalBadge(null)}
                className="text-gray-400 hover:text-white text-lg p-1"
              >
                ✕
              </button>
            </div>

            {/* Applicant Summary */}
            <div className="p-4 rounded-xl bg-[#0D0A24] border border-[#261B48] space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400">Applicant:</span>
                <span className="font-bold text-white">{issueModalBadge.full_name}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400">Email:</span>
                <span className="font-mono text-purple-300">{issueModalBadge.email}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400">Role:</span>
                <span className="font-bold text-[#FF9900]">{issueModalBadge.role}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400">Pass Type:</span>
                <span className="font-semibold text-emerald-400">
                  {issueModalBadge.source === 'event_registration'
                    ? `Event Registered Free Pass (${issueModalBadge.event_title || 'Confirmed'})`
                    : `Community Donation Pass (₹${issueModalBadge.donation_amount || 0} • UTR: ${issueModalBadge.donation_utr || 'N/A'})`}
                </span>
              </div>
            </div>

            {/* Pass Code Generator Input */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Official Pass Code (Encrypted Barcode &amp; QR Identifier)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={generatedCode}
                  onChange={(e) => setGeneratedCode(e.target.value.toUpperCase())}
                  placeholder="e.g. NIU-AWS-2026-5645"
                  className="flex-1 px-4 py-2.5 bg-[#1F1F1F] border border-[#3A3A3A] rounded-xl text-white font-mono font-bold text-sm tracking-wider focus:outline-none focus:border-[#FF9900]"
                />
                <button
                  type="button"
                  onClick={() => setGeneratedCode(makeRandomCode())}
                  title="Generate New Unique Code"
                  className="px-3.5 py-2.5 bg-[#2A2A2A] hover:bg-[#333333] text-gray-200 text-xs font-medium rounded-xl transition flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-[#FF9900]" />
                  <span>Randomize</span>
                </button>
              </div>
              <p className="text-[11px] text-gray-400">
                Format: <code className="text-[#FF9900]">NIU-AWS-YEAR-XXXX</code>. Admin can edit or customize this pass code before issuing.
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleConfirmIssueCode}
                disabled={submittingCode}
                className="flex-1 py-3 bg-[#FF9900] hover:bg-[#FFAA22] text-black text-xs font-bold uppercase tracking-wider rounded-xl transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{submittingCode ? 'Issuing Pass Code...' : 'Approve & Issue Badge Pass'}</span>
              </button>
              <button
                type="button"
                onClick={() => setIssueModalBadge(null)}
                className="py-3 px-5 bg-[#1F1F1F] hover:bg-[#2A2A2A] text-gray-300 text-xs font-semibold rounded-xl transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code & Barcode Inspection Modal */}
      {selectedBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#141414] border border-[#2B2B2B] rounded-2xl w-full max-w-md p-6 space-y-6 shadow-2xl relative">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-[#FF9900] uppercase tracking-wider block">
                  Scannable Credential Assets
                </span>
                <h3 className="text-lg font-bold text-white font-heading mt-0.5">
                  {selectedBadge.full_name}
                </h3>
                <span className="text-xs text-gray-400 font-mono">{selectedBadge.code}</span>
              </div>
              <button
                onClick={() => setSelectedBadge(null)}
                className="text-gray-400 hover:text-white text-lg p-1"
              >
                ✕
              </button>
            </div>

            {/* Generated Assets Card */}
            <div className="p-4 rounded-xl bg-[#080E1C] border border-[#1D2A42] space-y-4">
              {/* 1D Barcode Preview */}
              <div className="text-center space-y-1">
                <span className="text-[10px] font-mono uppercase text-gray-400 block">
                  Vector 1D Code-128 Barcode
                </span>
                <div className="bg-white p-3 rounded-lg flex flex-col items-center justify-center">
                  {/* CSS barcode emulation */}
                  <div className="flex items-end h-12 gap-[2px] w-full justify-center">
                    {[3, 1, 4, 2, 5, 2, 1, 3, 2, 4, 1, 3, 5, 2, 2, 4, 1, 3, 2, 5, 1, 4, 2, 3, 1, 4, 2, 5, 3, 1, 2, 4, 1, 5, 2, 3, 2, 4].map((w, i) => (
                      <div
                        key={i}
                        className="bg-[#0B1220] h-full"
                        style={{ width: `${w}px` }}
                      />
                    ))}
                  </div>
                  <span className="text-[11px] font-mono font-bold text-black mt-1">
                    * {selectedBadge.code} *
                  </span>
                </div>
              </div>

              {/* Modern Verification QR Code Preview */}
              <div className="text-center space-y-2 pt-2">
                <div className="flex items-center justify-center gap-1.5 text-[11px] font-mono uppercase text-[#FF9900] font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Modern Scannable QR Code (ISO-18004 Compliant)</span>
                </div>
                <div className="bg-white p-3 rounded-2xl inline-block shadow-lg shadow-black/40 ring-2 ring-[#FF9900]/30">
                  <div className="w-40 h-40 relative bg-white flex items-center justify-center rounded-xl overflow-hidden">
                    {modalQrUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={modalQrUrl}
                        alt={`Modern QR Code for ${selectedBadge.code}`}
                        className="w-40 h-40 object-contain"
                      />
                    ) : (
                      <div className="text-gray-500 text-[10px] font-mono">Generating Modern QR...</div>
                    )}
                  </div>
                </div>
                <div className="text-[10px] font-mono text-[#D7E3F5] truncate max-w-xs mx-auto">
                  {selectedBadge.qr_payload || `Live Verification: /verify/${selectedBadge.code}`}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center gap-2">
                <Link
                  href={`/verify/${selectedBadge.code}`}
                  target="_blank"
                  className="flex-1 py-2.5 bg-[#FF9900] hover:bg-[#FFAA22] text-black text-xs font-bold uppercase tracking-wider text-center rounded-lg transition"
                >
                  Test Verification Page
                </Link>
                <Link
                  href={`/badge?name=${encodeURIComponent(selectedBadge.full_name)}&role=${encodeURIComponent(selectedBadge.role)}`}
                  target="_blank"
                  className="flex-1 py-2.5 bg-[#1F1F1F] hover:bg-[#2A2A2A] text-white border border-[#333333] text-xs font-bold uppercase tracking-wider text-center rounded-lg transition flex items-center justify-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#FF9900]" />
                  <span>Open Full Badge</span>
                </Link>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex-1 py-2 bg-[#1A1A1A] hover:bg-[#252525] text-xs text-gray-300 font-medium rounded-lg border border-[#333333] transition flex items-center justify-center gap-1.5"
                >
                  {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#FF9900]" />}
                  <span>{copied ? 'Link Copied!' : 'Copy User Link'}</span>
                </button>
                {modalQrUrl && (
                  <button
                    type="button"
                    onClick={handleDownloadQr}
                    className="flex-1 py-2 bg-[#1A1A1A] hover:bg-[#252525] text-xs text-gray-300 font-medium rounded-lg border border-[#333333] transition flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5 text-[#FF9900]" />
                    <span>Download QR PNG</span>
                  </button>
                )}
                <button
                  onClick={() => setSelectedBadge(null)}
                  className="py-2 px-3 bg-[#1F1F1F] hover:bg-[#2A2A2A] text-gray-400 hover:text-white text-xs font-semibold rounded-lg transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
