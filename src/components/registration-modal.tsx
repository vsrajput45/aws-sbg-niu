'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  X, CheckCircle, Clock, Calendar, MapPin, ArrowRight, 
  ExternalLink, ShieldCheck, AlertCircle, Copy, Check,
  GraduationCap, Mic, Sparkles, HeartHandshake, Building2
} from 'lucide-react';
import { UpiPaymentCard } from '@/components/upi-payment-card';
import { EventRecord, RegistrationRole } from '@/lib/db/types';
import { formatDate } from '@/lib/utils';

interface RegistrationModalProps {
  event: EventRecord;
  isOpen: boolean;
  onClose: () => void;
  defaultRole?: RegistrationRole;
}

interface RegistrationSuccessData {
  code: string;
  role: RegistrationRole;
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

export function RegistrationModal({ 
  event, 
  isOpen, 
  onClose,
  defaultRole = 'attendee'
}: RegistrationModalProps) {
  // Configured allowed roles for this event (defaults to all 4 if none specified)
  const allowedRoles: RegistrationRole[] = 
    event.allowed_roles && event.allowed_roles.length > 0 
      ? event.allowed_roles 
      : ['attendee', 'speaker', 'sponsor', 'volunteer'];

  const initialRole = allowedRoles.includes(defaultRole) ? defaultRole : allowedRoles[0] || 'attendee';
  const [selectedRole, setSelectedRole] = useState<RegistrationRole>(initialRole);

  // Common Contact fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [consent, setConsent] = useState(false);
  const [websiteTrap, setWebsiteTrap] = useState(''); // Honeypot
  const [customAnswers, setCustomAnswers] = useState<Record<string, string>>({});

  // Attendee specific fields
  const [college, setCollege] = useState('Noida International University');
  const [courseYear, setCourseYear] = useState('B.Tech CSE - 2nd Year');
  const [collegeId, setCollegeId] = useState('');
  const [hearAbout, setHearAbout] = useState('Campus Announcement / Friends');

  // Speaker specific fields
  const [speakerOrg, setSpeakerOrg] = useState('');
  const [speakerDesignation, setSpeakerDesignation] = useState('');
  const [topicTitle, setTopicTitle] = useState('');
  const [topicAbstract, setTopicAbstract] = useState('');
  const [speakerBio, setSpeakerBio] = useState('');
  const [portfolioOrLinkedin, setPortfolioOrLinkedin] = useState('');
  const [previousSpeakingLinks, setPreviousSpeakingLinks] = useState('');

  // Sponsor specific fields
  const [companyName, setCompanyName] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [sponsorDesignation, setSponsorDesignation] = useState('');
  const [sponsorTierInterest, setSponsorTierInterest] = useState('Gold Community Partner');
  const [sponsorshipNotes, setSponsorshipNotes] = useState('');

  // Volunteer specific fields
  const [volunteerDomain, setVolunteerDomain] = useState('Stage & Speaker Hospitality');
  const [volunteerExperience, setVolunteerExperience] = useState('');

  // Payment state for paid events
  const [upiSettings, setUpiSettings] = useState<{ upiId: string; upiName: string; upiQrImageUrl: string | null }>({
    upiId: 'aws-sbg@niu',
    upiName: 'AWS SBG NIU',
    upiQrImageUrl: null,
  });
  const [paymentUtr, setPaymentUtr] = useState('');

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.upiId) {
          setUpiSettings({
            upiId: data.upiId,
            upiName: data.upiName || 'AWS SBG NIU',
            upiQrImageUrl: data.upiQrImageUrl || null,
          });
        }
      })
      .catch(() => {});
  }, []);

  const parseFeeAmount = () => {
    if (!event.fee_note) return 99;
    const match = event.fee_note.match(/\d+/);
    return match ? parseInt(match[0], 10) : 99;
  };
  const feeAmount = parseFeeAmount();

  // Submission state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<RegistrationSuccessData | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen) return null;

  // Capacity calculations (only for Attendees)
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

    if ((selectedRole === 'attendee' || selectedRole === 'volunteer') && (!collegeId || !collegeId.trim())) {
      setError('Student ID / Enrollment Number is mandatory for event registration.');
      return;
    }

    setLoading(true);

    try {
      const payload: Record<string, unknown> = {
        role: selectedRole,
        fullName,
        email,
        phone,
        consent: true,
        website_trap: websiteTrap,
        customAnswers,
      };

      if (selectedRole === 'attendee') {
        payload.college = college;
        payload.courseYear = courseYear;
        payload.collegeId = collegeId.trim();
        payload.hearAbout = hearAbout;
        if (event.fee_type === 'paid') {
          payload.paymentUtr = paymentUtr;
        }
      } else if (selectedRole === 'speaker') {
        payload.college = speakerOrg || 'Independent Practitioner';
        payload.courseYear = speakerDesignation || 'Speaker';
        payload.topicTitle = topicTitle;
        payload.topicAbstract = topicAbstract;
        payload.speakerBio = speakerBio;
        payload.portfolioOrLinkedin = portfolioOrLinkedin;
        payload.previousSpeakingLinks = previousSpeakingLinks || undefined;
        payload.hearAbout = hearAbout || 'Call for Speakers';
      } else if (selectedRole === 'sponsor') {
        payload.college = companyName;
        payload.courseYear = sponsorDesignation || 'Sponsor Representative';
        payload.companyName = companyName;
        payload.companyWebsite = companyWebsite;
        payload.sponsorTierInterest = sponsorTierInterest;
        payload.designation = sponsorDesignation;
        payload.sponsorshipNotes = sponsorshipNotes || undefined;
        payload.hearAbout = hearAbout || 'Sponsorship Outreach';
      } else if (selectedRole === 'volunteer') {
        payload.college = college;
        payload.courseYear = courseYear;
        payload.collegeId = collegeId.trim();
        payload.volunteerInterest = volunteerDomain;
        payload.volunteerExperience = volunteerExperience;
        payload.hearAbout = hearAbout || 'Volunteer Callout';
      }

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

  const createGoogleCalendarUrl = () => {
    if (!successData) return '#';
    const title = encodeURIComponent(event.title);
    const details = encodeURIComponent(
      `Your Registration Code: ${successData.code} (${successData.role.toUpperCase()})\n\n${event.summary}\n\nVenue: ${event.venue_name || event.platform}`
    );
    const location = encodeURIComponent(event.venue_name || event.venue_address || event.platform || '');
    const dateCompact = event.event_date.replace(/-/g, '');
    const dates = `${dateCompact}T043000Z/${dateCompact}T103000Z`;

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${dates}`;
  };

  const roleDefinitions = [
    {
      id: 'attendee' as RegistrationRole,
      label: 'Attendee',
      icon: GraduationCap,
      badgeText: 'General Entry',
      color: 'from-blue-600 to-indigo-600',
      description: 'Participate in hands-on labs, workshops, networking & get participation certificate.',
    },
    {
      id: 'speaker' as RegistrationRole,
      label: 'Speaker',
      icon: Mic,
      badgeText: 'Call for Speakers',
      color: 'from-purple-600 to-fuchsia-600',
      description: 'Propose a technical talk, share cloud architecture insights & mentor student builders.',
    },
    {
      id: 'sponsor' as RegistrationRole,
      label: 'Sponsor',
      icon: Sparkles,
      badgeText: 'Brand & Partner',
      color: 'from-amber-500 to-orange-600',
      description: 'Partner with the chapter, gain brand visibility, recruit talent & sponsor student projects.',
    },
    {
      id: 'volunteer' as RegistrationRole,
      label: 'Volunteer',
      icon: HeartHandshake,
      badgeText: 'Crew Support',
      color: 'from-emerald-500 to-teal-600',
      description: 'Join the organizing team, coordinate stage/logistics & lead community operations.',
    },
  ].filter((r) => allowedRoles.includes(r.id));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div 
        className="relative bg-[#0E0724] border border-[#24143D] rounded-2xl max-w-2xl w-full p-5 sm:p-8 text-white shadow-2xl my-6 overflow-hidden"
        style={{ overscrollBehavior: 'contain' }}
      >
        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#8B5CF6]/15 rounded-full blur-[110px] pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-gray-400 hover:text-white rounded-lg hover:bg-[#180C36] transition z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {!successData ? (
          <div>
            {/* Header */}
            <div className="pr-8 space-y-1.5 mb-5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold text-[#C084FC] uppercase tracking-wider">
                  Event Registration Portal
                </span>

                {selectedRole === 'attendee' && (
                  isFull ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30">
                      Waitlist Queue Active
                    </span>
                  ) : isFillingFast ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/30">
                      Filling Fast ({seatsLeft} seats left)
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      Registration Open
                    </span>
                  )
                )}

                {selectedRole === 'speaker' && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-500/15 text-purple-300 border border-purple-500/40">
                    Call for Speakers
                  </span>
                )}

                {selectedRole === 'sponsor' && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/40">
                    Sponsorship Prospectus
                  </span>
                )}

                {selectedRole === 'volunteer' && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-teal-500/15 text-teal-300 border border-teal-500/40">
                    Student Crew Application
                  </span>
                )}
              </div>

              <h2 className="text-xl sm:text-2xl font-bold font-heading text-white">{event.title}</h2>
              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-300 pt-0.5">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#C084FC]" />
                  {formatDate(event.event_date)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#C084FC]" />
                  {event.start_time} - {event.end_time}
                </span>
                <span className="flex items-center gap-1 text-gray-400">
                  <MapPin className="w-3.5 h-3.5 text-[#C084FC]" />
                  {event.venue_name || event.platform || 'Campus Auditorium, NIU'}
                </span>
              </div>
            </div>

            {/* Role Selection Tabs */}
            <div className="mb-6 space-y-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-purple-200">
                Select Your Registration Role *
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {roleDefinitions.map((roleDef) => {
                  const Icon = roleDef.icon;
                  const isSelected = selectedRole === roleDef.id;
                  return (
                    <button
                      key={roleDef.id}
                      type="button"
                      onClick={() => {
                        setSelectedRole(roleDef.id);
                        setError(null);
                      }}
                      className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-1.5 cursor-pointer relative overflow-hidden ${
                        isSelected
                          ? 'bg-[#180C36] border-[#A855F7] ring-2 ring-[#A855F7]/30 shadow-lg shadow-purple-950/40'
                          : 'bg-[#120826]/70 border-[#24143D] hover:border-[#381F5E] text-gray-400 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-gradient-to-br ' + roleDef.color + ' text-white' : 'bg-[#1D1038] text-gray-400'}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        {isSelected && (
                          <div className="w-2 h-2 rounded-full bg-[#C084FC] shadow-[0_0_8px_#C084FC]" />
                        )}
                      </div>

                      <div>
                        <div className={`text-xs font-bold font-heading ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                          {roleDef.label}
                        </div>
                        <div className="text-[10px] text-gray-400 leading-tight line-clamp-1 mt-0.5">
                          {roleDef.badgeText}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Role explanation micro-banner */}
              <div className="p-2.5 rounded-lg bg-[#140A2E] border border-[#24143D] text-[11px] text-purple-200/90 flex items-center gap-2">
                <span className="font-semibold text-[#C084FC]">Role Context:</span>
                <span>
                  {roleDefinitions.find((r) => r.id === selectedRole)?.description}
                </span>
              </div>
            </div>

            {selectedRole === 'attendee' && isFull && (
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
            <form onSubmit={handleSubmit} className="space-y-4 max-h-[58vh] overflow-y-auto pr-1">
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

              {/* SECTION: Identity / Contact Information */}
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  1. Contact &amp; Identity
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[11px] font-medium uppercase tracking-wider text-purple-200 mb-1">
                      {selectedRole === 'sponsor' ? 'Representative Name *' : 'Full Name *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder={selectedRole === 'sponsor' ? 'e.g. Priya Sharma' : 'e.g. Aarav Sharma'}
                      className="w-full px-3.5 py-2 bg-[#180C36] border border-[#24143D] rounded-lg text-white text-xs placeholder-gray-500 focus:outline-none focus:border-[#A855F7]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium uppercase tracking-wider text-purple-200 mb-1">
                      {selectedRole === 'sponsor' ? 'Corporate Email *' : 'Email Address *'}
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={selectedRole === 'sponsor' ? 'priya@techcorp.com' : 'aarav@niu.ac.in'}
                      className="w-full px-3.5 py-2 bg-[#180C36] border border-[#24143D] rounded-lg text-white text-xs placeholder-gray-500 focus:outline-none focus:border-[#A855F7]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium uppercase tracking-wider text-purple-200 mb-1">
                    Phone / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2 bg-[#180C36] border border-[#24143D] rounded-lg text-white text-xs placeholder-gray-500 focus:outline-none focus:border-[#A855F7]"
                  />
                </div>
              </div>

              {/* SECTION: Role Specific Fields */}
              <div className="pt-2 border-t border-[#24143D] space-y-3">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  2. {selectedRole.toUpperCase()} Details
                </span>

                {/* ROLE === ATTENDEE */}
                {selectedRole === 'attendee' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-[11px] font-medium uppercase tracking-wider text-purple-200 mb-1">
                          College / University *
                        </label>
                        <input
                          type="text"
                          required
                          value={college}
                          onChange={(e) => setCollege(e.target.value)}
                          placeholder="Noida International University"
                          className="w-full px-3.5 py-2 bg-[#180C36] border border-[#24143D] rounded-lg text-white text-xs placeholder-gray-500 focus:outline-none focus:border-[#A855F7]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium uppercase tracking-wider text-purple-200 mb-1">
                          Course &amp; Academic Year *
                        </label>
                        <input
                          type="text"
                          required
                          value={courseYear}
                          onChange={(e) => setCourseYear(e.target.value)}
                          placeholder="B.Tech CSE - 2nd Year"
                          className="w-full px-3.5 py-2 bg-[#180C36] border border-[#24143D] rounded-lg text-white text-xs placeholder-gray-500 focus:outline-none focus:border-[#A855F7]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-[11px] font-medium uppercase tracking-wider text-purple-200 mb-1">
                          Student ID / Enrollment Number *
                        </label>
                        <input
                          type="text"
                          required
                          value={collegeId}
                          onChange={(e) => setCollegeId(e.target.value)}
                          placeholder="e.g. NIU2024CS089"
                          className="w-full px-3.5 py-2 bg-[#180C36] border border-[#24143D] rounded-lg text-white text-xs placeholder-gray-500 focus:outline-none focus:border-[#A855F7]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium uppercase tracking-wider text-purple-200 mb-1">
                          How did you hear about this event? *
                        </label>
                        <select
                          value={hearAbout}
                          onChange={(e) => setHearAbout(e.target.value)}
                          className="w-full px-3.5 py-2 bg-[#180C36] border border-[#24143D] rounded-lg text-white text-xs focus:outline-none focus:border-[#A855F7]"
                        >
                          <option value="Campus Announcement / Friends">Campus Announcement / Friends</option>
                          <option value="Meetup Group">Official Meetup Group</option>
                          <option value="Faculty Recommendation">Faculty / Professor Recommendation</option>
                          <option value="Social Media (LinkedIn/X/Instagram)">Social Media (LinkedIn/X/Instagram)</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* ROLE === SPEAKER */}
                {selectedRole === 'speaker' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-[11px] font-medium uppercase tracking-wider text-purple-200 mb-1">
                          Organization / Company / Affiliation *
                        </label>
                        <input
                          type="text"
                          required
                          value={speakerOrg}
                          onChange={(e) => setSpeakerOrg(e.target.value)}
                          placeholder="e.g. AWS / Cognizant / NIU Research Lab"
                          className="w-full px-3.5 py-2 bg-[#180C36] border border-[#24143D] rounded-lg text-white text-xs placeholder-gray-500 focus:outline-none focus:border-[#A855F7]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium uppercase tracking-wider text-purple-200 mb-1">
                          Designation / Professional Title *
                        </label>
                        <input
                          type="text"
                          required
                          value={speakerDesignation}
                          onChange={(e) => setSpeakerDesignation(e.target.value)}
                          placeholder="e.g. Senior Cloud Architect / DevOps Lead"
                          className="w-full px-3.5 py-2 bg-[#180C36] border border-[#24143D] rounded-lg text-white text-xs placeholder-gray-500 focus:outline-none focus:border-[#A855F7]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium uppercase tracking-wider text-purple-200 mb-1">
                        Proposed Session Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={topicTitle}
                        onChange={(e) => setTopicTitle(e.target.value)}
                        placeholder="e.g. Building Resilient Microservices with AWS Lambda & Step Functions"
                        className="w-full px-3.5 py-2 bg-[#180C36] border border-[#24143D] rounded-lg text-white text-xs placeholder-gray-500 focus:outline-none focus:border-[#A855F7]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium uppercase tracking-wider text-purple-200 mb-1">
                        Session Abstract &amp; Learning Outcomes *
                      </label>
                      <textarea
                        required
                        rows={3}
                        value={topicAbstract}
                        onChange={(e) => setTopicAbstract(e.target.value)}
                        placeholder="Brief summary of the talk, practical takeaways for student builders, and recommended prerequisites."
                        className="w-full px-3.5 py-2 bg-[#180C36] border border-[#24143D] rounded-lg text-white text-xs placeholder-gray-500 focus:outline-none focus:border-[#A855F7] resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-[11px] font-medium uppercase tracking-wider text-purple-200 mb-1">
                          LinkedIn / Portfolio URL *
                        </label>
                        <input
                          type="url"
                          required
                          value={portfolioOrLinkedin}
                          onChange={(e) => setPortfolioOrLinkedin(e.target.value)}
                          placeholder="https://linkedin.com/in/username"
                          className="w-full px-3.5 py-2 bg-[#180C36] border border-[#24143D] rounded-lg text-white text-xs placeholder-gray-500 focus:outline-none focus:border-[#A855F7]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium uppercase tracking-wider text-purple-200 mb-1">
                          Past Speaking Links / Slides (Optional)
                        </label>
                        <input
                          type="url"
                          value={previousSpeakingLinks}
                          onChange={(e) => setPreviousSpeakingLinks(e.target.value)}
                          placeholder="https://youtube.com/watch?v=..."
                          className="w-full px-3.5 py-2 bg-[#180C36] border border-[#24143D] rounded-lg text-white text-xs placeholder-gray-500 focus:outline-none focus:border-[#A855F7]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium uppercase tracking-wider text-purple-200 mb-1">
                        Speaker Bio (Short Summary) *
                      </label>
                      <textarea
                        required
                        rows={2}
                        value={speakerBio}
                        onChange={(e) => setSpeakerBio(e.target.value)}
                        placeholder="2-3 sentences about your professional experience and technical focus areas."
                        className="w-full px-3.5 py-2 bg-[#180C36] border border-[#24143D] rounded-lg text-white text-xs placeholder-gray-500 focus:outline-none focus:border-[#A855F7] resize-none"
                      />
                    </div>
                  </div>
                )}

                {/* ROLE === SPONSOR */}
                {selectedRole === 'sponsor' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-[11px] font-medium uppercase tracking-wider text-purple-200 mb-1">
                          Company / Brand Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="e.g. CloudTech Solutions"
                          className="w-full px-3.5 py-2 bg-[#180C36] border border-[#24143D] rounded-lg text-white text-xs placeholder-gray-500 focus:outline-none focus:border-[#A855F7]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium uppercase tracking-wider text-purple-200 mb-1">
                          Company Website URL *
                        </label>
                        <input
                          type="url"
                          required
                          value={companyWebsite}
                          onChange={(e) => setCompanyWebsite(e.target.value)}
                          placeholder="https://company.com"
                          className="w-full px-3.5 py-2 bg-[#180C36] border border-[#24143D] rounded-lg text-white text-xs placeholder-gray-500 focus:outline-none focus:border-[#A855F7]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-[11px] font-medium uppercase tracking-wider text-purple-200 mb-1">
                          Your Role / Designation *
                        </label>
                        <input
                          type="text"
                          required
                          value={sponsorDesignation}
                          onChange={(e) => setSponsorDesignation(e.target.value)}
                          placeholder="e.g. DevRel Lead / Head of Talent"
                          className="w-full px-3.5 py-2 bg-[#180C36] border border-[#24143D] rounded-lg text-white text-xs placeholder-gray-500 focus:outline-none focus:border-[#A855F7]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium uppercase tracking-wider text-purple-200 mb-1">
                          Preferred Sponsorship Tier / Focus *
                        </label>
                        <select
                          value={sponsorTierInterest}
                          onChange={(e) => setSponsorTierInterest(e.target.value)}
                          className="w-full px-3.5 py-2 bg-[#180C36] border border-[#24143D] rounded-lg text-white text-xs focus:outline-none focus:border-[#A855F7]"
                        >
                          <option value="Gold Community Partner">Gold Partner (Stage & Branding Priority)</option>
                          <option value="Silver Supporting Partner">Silver Partner (Session Lab Sponsor)</option>
                          <option value="Bronze Partner">Bronze Community Supporter</option>
                          <option value="Food & Refreshments Sponsor">Food &amp; Refreshments Sponsor</option>
                          <option value="Swag & Goodies Partner">Swag, Stickers &amp; Goodies Partner</option>
                          <option value="Cloud Compute / Credits Grant">Cloud Compute / Student Credits Grant</option>
                          <option value="Custom Collaboration">Custom Tailored Collaboration</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium uppercase tracking-wider text-purple-200 mb-1">
                        Collaboration Goals &amp; Expectations (Optional)
                      </label>
                      <textarea
                        rows={2}
                        value={sponsorshipNotes}
                        onChange={(e) => setSponsorshipNotes(e.target.value)}
                        placeholder="Tell us what you hope to achieve (e.g. student recruitment, platform adoption, brand awareness)."
                        className="w-full px-3.5 py-2 bg-[#180C36] border border-[#24143D] rounded-lg text-white text-xs placeholder-gray-500 focus:outline-none focus:border-[#A855F7] resize-none"
                      />
                    </div>
                  </div>
                )}

                {/* ROLE === VOLUNTEER */}
                {selectedRole === 'volunteer' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-[11px] font-medium uppercase tracking-wider text-purple-200 mb-1">
                          College / University *
                        </label>
                        <input
                          type="text"
                          required
                          value={college}
                          onChange={(e) => setCollege(e.target.value)}
                          placeholder="Noida International University"
                          className="w-full px-3.5 py-2 bg-[#180C36] border border-[#24143D] rounded-lg text-white text-xs placeholder-gray-500 focus:outline-none focus:border-[#A855F7]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium uppercase tracking-wider text-purple-200 mb-1">
                          Course &amp; Academic Year *
                        </label>
                        <input
                          type="text"
                          required
                          value={courseYear}
                          onChange={(e) => setCourseYear(e.target.value)}
                          placeholder="B.Tech CSE - 2nd Year"
                          className="w-full px-3.5 py-2 bg-[#180C36] border border-[#24143D] rounded-lg text-white text-xs placeholder-gray-500 focus:outline-none focus:border-[#A855F7]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-[11px] font-medium uppercase tracking-wider text-purple-200 mb-1">
                          Student ID / Enrollment Number *
                        </label>
                        <input
                          type="text"
                          required
                          value={collegeId}
                          onChange={(e) => setCollegeId(e.target.value)}
                          placeholder="e.g. NIU2024CS089"
                          className="w-full px-3.5 py-2 bg-[#180C36] border border-[#24143D] rounded-lg text-white text-xs placeholder-gray-500 focus:outline-none focus:border-[#A855F7]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium uppercase tracking-wider text-purple-200 mb-1">
                          Preferred Organizing Team Domain *
                        </label>
                        <select
                          value={volunteerDomain}
                          onChange={(e) => setVolunteerDomain(e.target.value)}
                          className="w-full px-3.5 py-2 bg-[#180C36] border border-[#24143D] rounded-lg text-white text-xs focus:outline-none focus:border-[#A855F7]"
                        >
                          <option value="Stage & Speaker Hospitality">Stage, AV &amp; Speaker Hospitality</option>
                          <option value="Hands-on Lab & Technical Support">Hands-on Lab &amp; Technical Support</option>
                          <option value="Registration & Check-In Desk">Registration Desk &amp; Check-In Scanner</option>
                          <option value="Media, Photography & Video">Media, Photography &amp; Video Coverage</option>
                          <option value="Social Media & Real-time Coverage">Social Media &amp; Live Community Announcements</option>
                          <option value="General Operations & Logistics">General Operations &amp; Logistics</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium uppercase tracking-wider text-purple-200 mb-1">
                        Why would you like to volunteer? (Skills &amp; Motivation) *
                      </label>
                      <textarea
                        required
                        rows={2}
                        value={volunteerExperience}
                        onChange={(e) => setVolunteerExperience(e.target.value)}
                        placeholder="Briefly describe your skills, past event experience, or why you are excited to support this session."
                        className="w-full px-3.5 py-2 bg-[#180C36] border border-[#24143D] rounded-lg text-white text-xs placeholder-gray-500 focus:outline-none focus:border-[#A855F7] resize-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Event Custom Questions (if any configured for this event) */}
              {selectedRole === 'attendee' && event.custom_questions && event.custom_questions.length > 0 && (
                <div className="pt-2 border-t border-[#24143D] space-y-3">
                  <span className="text-[10px] font-bold text-[#C084FC] uppercase tracking-wider block">
                    Session Specific Questions
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
                          className="w-full px-3 py-2 bg-[#180C36] border border-[#24143D] rounded-lg text-white text-xs focus:outline-none focus:border-[#A855F7]"
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
                          className="w-full px-3 py-2 bg-[#180C36] border border-[#24143D] rounded-lg text-white text-xs focus:outline-none focus:border-[#A855F7]"
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Payment Section for Paid Events */}
              {event.fee_type === 'paid' && selectedRole === 'attendee' && (
                <div className="pt-2">
                  <UpiPaymentCard
                    amount={feeAmount}
                    upiId={upiSettings.upiId}
                    payeeName={upiSettings.upiName}
                    transactionNote={`Event Pass: ${event.title.substring(0, 20)} - ${fullName || 'Attendee'}`}
                    externalPaymentLink={event.payment_link}
                    customQrUrl={upiSettings.upiQrImageUrl}
                    utrValue={paymentUtr}
                    onUtrChange={setPaymentUtr}
                    requiredUtr={false}
                    title={`Event Registration Fee (${event.fee_note || `₹${feeAmount}`})`}
                    subtitle="Scan the QR code or click 'Pay via UPI App' on your mobile"
                  />
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
                    className="w-4 h-4 rounded mt-0.5 text-purple-600 bg-[#180C36] border-[#24143D] focus:ring-purple-500 cursor-pointer"
                  />
                  <span className="text-[11px] text-gray-300 leading-snug">
                    I agree to be contacted by AWS SBG NIU organizers with session updates and logistics. (Learners 18+ only per AWS community guidelines).
                  </span>
                </label>
              </div>

              {/* Submit button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-[#7C3AED] via-[#8B5CF6] to-[#A855F7] hover:brightness-110 text-white text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-purple-900/30 flex items-center justify-center gap-2"
                >
                  {loading
                    ? 'Submitting Application...'
                    : selectedRole === 'speaker'
                    ? 'Submit Speaker Proposal'
                    : selectedRole === 'sponsor'
                    ? 'Submit Sponsorship Request'
                    : selectedRole === 'volunteer'
                    ? 'Submit Volunteer Application'
                    : isFull
                    ? 'Join Priority Waitlist'
                    : 'Complete RSVP Now'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* SUCCESS SCREEN */
          <div className="space-y-6 text-center py-3">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 border-2 border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle className="w-7 h-7" />
            </div>

            <div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                  successData.role === 'speaker'
                    ? 'bg-purple-500/15 text-purple-300 border-purple-500/40'
                    : successData.role === 'sponsor'
                    ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                    : successData.role === 'volunteer'
                    ? 'bg-teal-500/15 text-teal-300 border-teal-500/40'
                    : successData.status === 'confirmed'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                }`}>
                  {successData.role === 'speaker'
                    ? '🎙️ Speaker Proposal Received'
                    : successData.role === 'sponsor'
                    ? '🤝 Sponsorship Request Received'
                    : successData.role === 'volunteer'
                    ? '⚡ Volunteer Application Received'
                    : successData.status === 'confirmed'
                    ? '🎓 Registration Confirmed!'
                    : `Waitlisted (Queue Position #${successData.waitlistPosition || 1})`}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold font-heading text-white">
                {successData.role === 'speaker'
                  ? 'Thank You for Proposing a Talk!'
                  : successData.role === 'sponsor'
                  ? 'Thank You for Supporting Student Builders!'
                  : successData.role === 'volunteer'
                  ? 'Welcome to the Event Organizing Crew!'
                  : successData.status === 'confirmed'
                  ? 'See You at Noida International University!'
                  : 'You Are in the Attendee Waitlist Queue'}
              </h2>

              <p className="text-xs text-gray-300 mt-1 max-w-md mx-auto leading-relaxed">
                {successData.role === 'speaker'
                  ? 'Our technical curation committee will review your session abstract and reach out at your email to align on logistics.'
                  : successData.role === 'sponsor'
                  ? 'Our partnership and outreach team will get in touch with the official sponsorship prospectus and collaboration details.'
                  : successData.role === 'volunteer'
                  ? 'Our lead organizers will invite you to the pre-event volunteer briefing and domain allocation meeting.'
                  : successData.status === 'confirmed'
                  ? 'Your pass is confirmed. Keep your unique Registration Code handy during in-person check-in.'
                  : 'As soon as an attendee cancels or capacity is increased, your seat will be automatically confirmed.'}
              </p>
            </div>

            {/* Registration Code Display */}
            <div className="p-4 bg-[#13092B] border border-[#24143D] rounded-xl max-w-sm mx-auto space-y-1.5">
              <span className="text-[10px] text-purple-300 uppercase tracking-widest block font-medium">
                Official Reference Code ({successData.role.toUpperCase()})
              </span>
              <div className="flex items-center justify-center gap-2">
                <span className="text-lg sm:text-xl font-mono font-bold text-[#C084FC] tracking-wider select-all">
                  {successData.code}
                </span>
                <button
                  onClick={handleCopyCode}
                  className="p-1.5 text-gray-400 hover:text-white transition cursor-pointer"
                  title="Copy code"
                >
                  {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Session Logistics */}
            <div className="bg-[#13092B] border border-[#24143D] rounded-xl p-4 text-left max-w-md mx-auto space-y-2 text-xs">
              <div className="flex items-center gap-2 text-gray-300">
                <Calendar className="w-4 h-4 text-[#C084FC] shrink-0" />
                <span>{formatDate(successData.eventDate)} ({successData.startTime})</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <MapPin className="w-4 h-4 text-[#C084FC] shrink-0" />
                <span>{successData.venue || 'Campus Auditorium, NIU'}</span>
              </div>

              {successData.joinLink && (
                <div className="pt-2 border-t border-[#24143D]">
                  <span className="text-[10px] text-[#C084FC] uppercase font-bold block">Private Meeting Link:</span>
                  <a
                    href={successData.joinLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-purple-300 hover:underline break-all"
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
                className="w-full sm:w-auto px-4 py-2.5 bg-[#180C36] hover:bg-[#201045] border border-[#24143D] text-white text-xs font-semibold rounded-lg transition inline-flex items-center justify-center gap-2"
              >
                <Calendar className="w-3.5 h-3.5 text-[#C084FC]" />
                <span>Add to Calendar</span>
                <ExternalLink className="w-3 h-3 text-purple-300/50" />
              </a>

              {successData.role === 'attendee' && (
                <Link
                  href={`/badge?name=${encodeURIComponent(successData.fullName)}&role=Attendee`}
                  className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-[#7C3AED] via-[#8B5CF6] to-[#A855F7] hover:brightness-110 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition inline-flex items-center justify-center gap-2 shadow-md shadow-purple-900/30"
                >
                  <span>Make Attendee Badge</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>

            <div className="pt-1">
              <button
                onClick={onClose}
                className="text-xs text-purple-300/70 hover:text-white underline underline-offset-4 cursor-pointer"
              >
                Done / Close Window
              </button>
            </div>
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-[#24143D] text-center text-[11px] text-gray-400 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#C084FC]" />
          <span>All submissions are confidential and managed exclusively by AWS SBG NIU organizers.</span>
        </div>
      </div>
    </div>
  );
}
