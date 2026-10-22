'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  X, CheckCircle, Clock, Calendar, MapPin, ArrowRight, 
  ExternalLink, ShieldCheck, AlertCircle, Copy, Check 
} from 'lucide-react';
import { EventRecord } from '@/lib/db/types';
import { formatDate } from '@/lib/utils';

interface RegistrationModalProps {
  event: EventRecord;
  isOpen: boolean;
  onClose: () => void;
}

interface RegistrationSuccessData {
  code: string;
  status: 'confirmed' | 'waitlisted';
  fullName: string;
  email: string;
  eventTitle: string;
  eventDate: string;
  startTime: string;
  venue?: string;
  waitlistPosition?: number | null;
  joinLink?: string | null;
}

export function RegistrationModal({ event, isOpen, onClose }: RegistrationModalProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [college, setCollege] = useState('Noida International University');
  const [courseYear, setCourseYear] = useState('B.Tech CSE - 2nd Year');
  const [collegeId, setCollegeId] = useState('');
  const [hearAbout, setHearAbout] = useState('Campus Announcement / Friends');
  const [consent, setConsent] = useState(false);
  const [websiteTrap, setWebsiteTrap] = useState(''); // Honeypot
  const [customAnswers, setCustomAnswers] = useState<Record<string, string>>({});

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<RegistrationSuccessData | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen) return null;

  // Capacity calculations
  const confirmedCount = event.confirmed_count || 0;
  const capacity = event.capacity || 0;
  const isFull = capacity > 0 && confirmedCount >= capacity;
  const seatsLeft = capacity > 0 ? Math.max(0, capacity - confirmedCount) : null;
  const isFillingFast = seatsLeft !== null && capacity > 0 && seatsLeft <= capacity * 0.2 && seatsLeft > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!consent) {
      setError('You must agree to be contacted about this event to register.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        fullName,
        email,
        phone,
        college,
        courseYear,
        collegeId: collegeId || undefined,
        hearAbout,
        consent: true,
        website_trap: websiteTrap,
        customAnswers,
      };

      const res = await fetch(`/api/events/${event.id}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to complete registration.');
      }

      setSuccessData(data.registration);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred during registration.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (successData?.code) {
      navigator.clipboard.writeText(successData.code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  // Google Calendar URL generator
  const createGoogleCalendarUrl = () => {
    if (!successData) return '#';
    const title = encodeURIComponent(event.title);
    const details = encodeURIComponent(
      `Your Registration Code: ${successData.code}\n\n${event.summary}\n\nVenue: ${event.venue_name || event.platform}`
    );
    const location = encodeURIComponent(event.venue_name || event.venue_address || event.platform || '');
    
    // Format YYYYMMDDTHHmmssZ
    const dateCompact = event.event_date.replace(/-/g, '');
    const dates = `${dateCompact}T043000Z/${dateCompact}T103000Z`; // standard ~10:00 AM - 4:00 PM IST in UTC

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${dates}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div 
        className="relative bg-[#111111] border border-[#262626] rounded-2xl max-w-xl w-full p-6 sm:p-8 text-white shadow-2xl my-8 overflow-hidden"
        style={{ overscrollBehavior: 'contain' }}
      >
        {/* Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF9900]/10 rounded-full blur-[100px] pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-gray-400 hover:text-white rounded-lg hover:bg-[#1A1A1A] transition"
        >
          <X className="w-5 h-5" />
        </button>

        {!successData ? (
          <div>
            {/* Header */}
            <div className="pr-8 space-y-1.5 mb-6">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-[#FF9900] uppercase tracking-wider">
                  Event Registration
                </span>
                {isFull ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30">
                    Waitlist Queue
                  </span>
                ) : isFillingFast ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/30">
                    Filling Fast ({seatsLeft} seats left)
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    Registration Open
                  </span>
                )}
              </div>

              <h2 className="text-xl sm:text-2xl font-bold font-heading text-white">{event.title}</h2>
              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 pt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#FF9900]" />
                  {formatDate(event.event_date)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#FF9900]" />
                  {event.start_time} - {event.end_time}
                </span>
              </div>
            </div>

            {isFull && (
              <div className="mb-5 p-3 rounded-lg bg-amber-950/30 border border-amber-800/40 text-amber-300 text-xs flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  All confirmed seats are currently reserved. Submitting this form adds you to the <strong>priority waitlist</strong>. When seats open, you will be auto-promoted in order.
                </span>
              </div>
            )}

            {error && (
              <div className="mb-5 p-3 rounded-lg bg-red-950/40 border border-red-800/60 text-red-300 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Honeypot field - invisible to human users */}
              <input
                type="text"
                name="website_trap"
                value={websiteTrap}
                onChange={(e) => setWebsiteTrap(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                className="hidden"
                aria-hidden="true"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-medium uppercase tracking-wider text-gray-300 mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Aarav Sharma"
                    className="w-full px-3.5 py-2.5 bg-[#181818] border border-[#333333] rounded-lg text-white text-xs placeholder-gray-500 focus:outline-none focus:border-[#FF9900]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium uppercase tracking-wider text-gray-300 mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="aarav@niu.ac.in"
                    className="w-full px-3.5 py-2.5 bg-[#181818] border border-[#333333] rounded-lg text-white text-xs placeholder-gray-500 focus:outline-none focus:border-[#FF9900]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-medium uppercase tracking-wider text-gray-300 mb-1.5">
                    Phone / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 bg-[#181818] border border-[#333333] rounded-lg text-white text-xs placeholder-gray-500 focus:outline-none focus:border-[#FF9900]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium uppercase tracking-wider text-gray-300 mb-1.5">
                    College / University *
                  </label>
                  <input
                    type="text"
                    required
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    placeholder="Noida International University"
                    className="w-full px-3.5 py-2.5 bg-[#181818] border border-[#333333] rounded-lg text-white text-xs placeholder-gray-500 focus:outline-none focus:border-[#FF9900]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-medium uppercase tracking-wider text-gray-300 mb-1.5">
                    Course & Academic Year *
                  </label>
                  <input
                    type="text"
                    required
                    value={courseYear}
                    onChange={(e) => setCourseYear(e.target.value)}
                    placeholder="B.Tech CSE - 2nd Year"
                    className="w-full px-3.5 py-2.5 bg-[#181818] border border-[#333333] rounded-lg text-white text-xs placeholder-gray-500 focus:outline-none focus:border-[#FF9900]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium uppercase tracking-wider text-gray-300 mb-1.5">
                    Student ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={collegeId}
                    onChange={(e) => setCollegeId(e.target.value)}
                    placeholder="e.g. NIU-2024-892"
                    className="w-full px-3.5 py-2.5 bg-[#181818] border border-[#333333] rounded-lg text-white text-xs placeholder-gray-500 focus:outline-none focus:border-[#FF9900]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium uppercase tracking-wider text-gray-300 mb-1.5">
                  How did you hear about this event? *
                </label>
                <select
                  value={hearAbout}
                  onChange={(e) => setHearAbout(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#181818] border border-[#333333] rounded-lg text-white text-xs focus:outline-none focus:border-[#FF9900]"
                >
                  <option value="Campus Announcement / Friends">Campus Announcement / Friends</option>
                  <option value="Meetup Group">Official Meetup Group</option>
                  <option value="Faculty Recommendation">Faculty / Professor Recommendation</option>
                  <option value="Social Media (LinkedIn/X/Instagram)">Social Media (LinkedIn/X/Instagram)</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Custom Questions if configured */}
              {event.custom_questions && event.custom_questions.length > 0 && (
                <div className="pt-2 border-t border-[#222222] space-y-3">
                  <span className="text-[11px] font-bold text-[#FF9900] uppercase tracking-wider block">
                    Session Questions
                  </span>
                  {event.custom_questions.map((q) => (
                    <div key={q.id}>
                      <label className="block text-[11px] text-gray-300 mb-1">
                        {q.label} {q.required && '*'}
                      </label>
                      {q.type === 'dropdown' && q.options && q.options.length > 0 ? (
                        <select
                          required={q.required}
                          value={customAnswers[q.label] || ''}
                          onChange={(e) => setCustomAnswers({ ...customAnswers, [q.label]: e.target.value })}
                          className="w-full px-3 py-2 bg-[#181818] border border-[#333333] rounded-lg text-white text-xs focus:outline-none focus:border-[#FF9900]"
                        >
                          <option value="">Select an option...</option>
                          {q.options.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          required={q.required}
                          value={customAnswers[q.label] || ''}
                          onChange={(e) => setCustomAnswers({ ...customAnswers, [q.label]: e.target.value })}
                          placeholder="Your answer"
                          className="w-full px-3 py-2 bg-[#181818] border border-[#333333] rounded-lg text-white text-xs focus:outline-none focus:border-[#FF9900]"
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Consent checkbox */}
              <div className="pt-2">
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    required
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="w-4 h-4 rounded mt-0.5 text-[#FF9900] bg-[#181818] border-[#333333] focus:ring-[#FF9900]"
                  />
                  <span className="text-[11px] text-gray-400 leading-snug">
                    I agree to be contacted by AWS SBG NIU organizers with session updates and logistics. (Learners 18+ only per AWS guidelines).
                  </span>
                </label>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-lg bg-[#FF9900] hover:bg-[#FFAA22] text-black text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-[#FF9900]/20 flex items-center justify-center gap-2"
                >
                  {loading ? 'Confirming RSVP...' : isFull ? 'Join Priority Waitlist' : 'Complete RSVP Now'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Success Screen */
          <div className="space-y-6 text-center py-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 border-2 border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle className="w-7 h-7" />
            </div>

            <div>
              <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border mb-2 ${
                successData.status === 'confirmed'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              }`}>
                {successData.status === 'confirmed' ? 'Registration Confirmed!' : `Waitlisted (Queue Position #${successData.waitlistPosition || 1})`}
              </span>
              <h2 className="text-2xl font-bold font-heading text-white">
                {successData.status === 'confirmed' ? 'See You at Noida International University!' : 'You Are in the Waitlist Queue'}
              </h2>
              <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">
                {successData.status === 'confirmed'
                  ? 'Your pass is confirmed. Keep your unique Registration Code handy during in-person check-in.'
                  : 'As soon as an attendee cancels or capacity is increased, your seat will be automatically confirmed.'}
              </p>
            </div>

            {/* Registration Code Display */}
            <div className="p-4 bg-[#161616] border border-[#333333] rounded-xl max-w-sm mx-auto space-y-2">
              <span className="text-[10px] text-gray-400 uppercase tracking-widest block font-medium">
                Official Registration Code
              </span>
              <div className="flex items-center justify-center gap-2">
                <span className="text-xl sm:text-2xl font-mono font-bold text-[#FF9900] tracking-wider select-all">
                  {successData.code}
                </span>
                <button
                  onClick={handleCopyCode}
                  className="p-1.5 text-gray-400 hover:text-white transition"
                  title="Copy code"
                >
                  {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Session Logistics */}
            <div className="bg-[#141414] border border-[#262626] rounded-xl p-4 text-left max-w-md mx-auto space-y-2 text-xs">
              <div className="flex items-center gap-2 text-gray-300">
                <Calendar className="w-4 h-4 text-[#FF9900] shrink-0" />
                <span>{formatDate(successData.eventDate)} ({successData.startTime})</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <MapPin className="w-4 h-4 text-[#FF9900] shrink-0" />
                <span>{successData.venue || 'Campus Auditorium, NIU'}</span>
              </div>

              {/* Private join link for online events */}
              {successData.joinLink && (
                <div className="pt-2 border-t border-[#262626]">
                  <span className="text-[10px] text-[#FF9900] uppercase font-bold block">Private Meeting Link:</span>
                  <a
                    href={successData.joinLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-400 hover:underline break-all"
                  >
                    {successData.joinLink}
                  </a>
                </div>
              )}
            </div>

            {/* Actions: Google Calendar & Attendee Badge */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <a
                href={createGoogleCalendarUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-4 py-2.5 bg-[#1f1f1f] hover:bg-[#2a2a2a] border border-[#333] text-white text-xs font-semibold rounded-lg transition inline-flex items-center justify-center gap-2"
              >
                <Calendar className="w-3.5 h-3.5 text-[#FF9900]" />
                <span>Add to Google Calendar</span>
                <ExternalLink className="w-3 h-3 text-gray-500" />
              </a>

              <Link
                href={`/badge?name=${encodeURIComponent(successData.fullName)}&role=Attendee`}
                className="w-full sm:w-auto px-4 py-2.5 bg-[#FF9900] hover:bg-[#FFAA22] text-black text-xs font-bold uppercase tracking-wider rounded-lg transition inline-flex items-center justify-center gap-2 shadow-md shadow-[#FF9900]/20"
              >
                <span>Make Attendee Badge</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="pt-2">
              <button
                onClick={onClose}
                className="text-xs text-gray-400 hover:text-white underline underline-offset-4"
              >
                Done / Close Window
              </button>
            </div>
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-[#1F1F1F] text-center text-[11px] text-gray-500 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#FF9900]" />
          <span>Registrations are secure and never made publicly visible.</span>
        </div>
      </div>
    </div>
  );
}
