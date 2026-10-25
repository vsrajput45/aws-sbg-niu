'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  AlertTriangle, CheckCircle2, UserCheck, ShieldAlert, 
  RotateCcw, ShieldCheck, Lock, ExternalLink, Clock
} from 'lucide-react';

interface GateCheckinCardProps {
  code: string;
  fullName: string;
  initialCheckedIn: boolean;
  initialCheckedInAt: string | null;
  isAdmin: boolean;
  adminEmail?: string;
}

export function GateCheckinCard({
  code,
  fullName,
  initialCheckedIn,
  initialCheckedInAt,
  isAdmin,
  adminEmail,
}: GateCheckinCardProps) {
  const [checkedIn, setCheckedIn] = useState(initialCheckedIn);
  const [checkedInAt, setCheckedInAt] = useState<string | null>(initialCheckedInAt);
  const [loading, setLoading] = useState(false);
  const [alertMsg, setAlertMsg] = useState<string | null>(null);

  const formatTimestamp = (iso: string | null) => {
    if (!iso) return 'Just now';
    try {
      const date = new Date(iso);
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return iso;
    }
  };

  const handleAction = async (action: 'admit' | 'undo') => {
    setLoading(true);
    setAlertMsg(null);
    try {
      const res = await fetch('/api/verify/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, action }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCheckedIn(data.checked_in);
        setCheckedInAt(data.checked_in_at);
        if (data.previously_checked_in && action === 'admit') {
          setAlertMsg('⚠️ Attention: This pass was ALREADY recorded as checked-in!');
        } else if (data.checked_in) {
          setAlertMsg(`✅ Verified! ${fullName} has been admitted at the venue.`);
        } else {
          setAlertMsg('Check-in status reverted to Unadmitted.');
        }
      } else {
        setAlertMsg(data.error || 'Failed to update check-in status.');
      }
    } catch {
      setAlertMsg('Network error updating gate status.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {checkedIn ? (
        /* DUPLICATE WARNING / ALREADY CHECKED-IN STATE */
        <div className="rounded-2xl bg-gradient-to-br from-rose-950/40 via-amber-950/30 to-[#120B24] border-2 border-amber-500/60 p-5 sm:p-6 shadow-2xl relative overflow-hidden space-y-4 animate-in fade-in duration-200">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center shrink-0 text-amber-400">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>

            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 font-bold text-xs uppercase tracking-wider">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Pass Already Admitted</span>
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400/80" />
                  <span>Checked-in: <strong className="text-white font-mono">{formatTimestamp(checkedInAt)}</strong></span>
                </span>
              </div>

              <h3 className="text-base sm:text-lg font-bold text-white pt-1">
                ⚠️ Duplicate Scan Detection Alert
              </h3>

              <p className="text-xs text-amber-200/90 leading-relaxed">
                This pass has <strong>already been scanned and admitted</strong>. If someone is presenting this pass again, it may be a shared screenshot or duplicate copy.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-black/40 border border-amber-500/30 text-[11px] text-amber-300/90 flex flex-col gap-1.5">
            <div className="font-semibold text-amber-300 flex items-center gap-1.5">
              <span>🛑 GATE INSTRUCTION FOR VOLUNTEERS:</span>
            </div>
            <p className="text-slate-300">
              Check physical wristband / lanyard on attendee. Ask for physical <strong>College ID</strong> matching <strong className="text-white underline">{fullName}</strong> before permitting venue re-entry.
            </p>
          </div>

          {isAdmin && (
            <div className="flex items-center justify-between pt-2 border-t border-amber-500/20 flex-wrap gap-2">
              <span className="text-[11px] text-slate-400">
                Organizer: <span className="text-purple-300 font-mono">{adminEmail}</span>
              </span>

              <button
                type="button"
                onClick={() => handleAction('undo')}
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2A1820] hover:bg-[#3D202B] border border-rose-500/30 text-rose-300 text-xs font-semibold transition disabled:opacity-50"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Undo Check-In</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        /* READY FOR ENTRY / UNADMITTED STATE */
        <div className="rounded-2xl bg-gradient-to-br from-emerald-950/30 via-[#0B1528] to-[#0A071E] border border-emerald-500/40 p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0 text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div className="space-y-1 flex-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                <span>Valid Pass • Not Yet Admitted</span>
              </div>

              <h3 className="text-base sm:text-lg font-bold text-white pt-1">
                Delegate Ready For Venue Admission
              </h3>

              <p className="text-xs text-slate-300 leading-relaxed">
                Official credential verified in registry. This is the first scan for this pass today.
              </p>
            </div>
          </div>

          {isAdmin ? (
            <div className="pt-2 border-t border-emerald-500/20 space-y-3">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleAction('admit')}
                  disabled={loading}
                  className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 transition cursor-pointer disabled:opacity-50"
                >
                  <UserCheck className="w-5 h-5" />
                  <span>{loading ? 'Admitting...' : 'Admit & Mark Checked In'}</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-400 text-center sm:text-left">
                Logged in as organizer: <span className="text-emerald-400 font-mono">{adminEmail}</span>
              </p>
            </div>
          ) : (
            <div className="pt-2 border-t border-[#1F293D] flex items-center justify-between text-xs text-slate-400 flex-wrap gap-2">
              <span>Event Volunteer or Desk Organizer?</span>
              <Link
                href={`/admin/login`}
                className="inline-flex items-center gap-1 text-[#FF9900] hover:underline font-semibold"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Log in to Admit Attendees</span>
              </Link>
            </div>
          )}
        </div>
      )}

      {alertMsg && (
        <div className="p-3 rounded-xl bg-[#18112C] border border-[#3E256C] text-xs text-slate-200 animate-in fade-in duration-150">
          {alertMsg}
        </div>
      )}
    </div>
  );
}
