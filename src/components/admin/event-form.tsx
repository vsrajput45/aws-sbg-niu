'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Calendar, Clock, MapPin, Users, Plus, Trash2, ArrowLeft, 
  Save, Eye, CheckCircle2, AlertTriangle, Sparkles 
} from 'lucide-react';
import { EventRecord, EventSpeaker, EventAgendaItem, CustomQuestion, RegistrationRole } from '@/lib/db/types';
import { siteConfig } from '@/config/site';

interface EventFormProps {
  initialEvent?: EventRecord;
  isEdit?: boolean;
}

export function EventForm({ initialEvent, isEdit = false }: EventFormProps) {
  const router = useRouter();

  // Basic Details
  const [title, setTitle] = useState(initialEvent?.title || '');
  const [slug, setSlug] = useState(initialEvent?.slug || '');
  const [summary, setSummary] = useState(initialEvent?.summary || '');
  const [descriptionMd, setDescriptionMd] = useState(initialEvent?.description_md || '');
  const [bannerUrl, setBannerUrl] = useState(initialEvent?.banner_url || '/hero.jpg');
  const [category, setCategory] = useState(initialEvent?.category || 'Technical Workshop');
  const [tagsStr, setTagsStr] = useState(initialEvent?.tags ? initialEvent.tags.join(', ') : 'AWS Lambda, Serverless, Cloud Foundations');
  const [featured, setFeatured] = useState(initialEvent?.featured ?? false);

  // Schedule
  const [eventDate, setEventDate] = useState(initialEvent?.event_date || '2026-11-20');
  const [startTime, setStartTime] = useState(initialEvent?.start_time || '10:00 AM');
  const [endTime, setEndTime] = useState(initialEvent?.end_time || '04:00 PM');
  const [timezone, setTimezone] = useState(initialEvent?.timezone || 'Asia/Kolkata');
  const [registrationOpensAt, setRegistrationOpensAt] = useState(
    initialEvent?.registration_opens_at ? initialEvent.registration_opens_at.slice(0, 16) : ''
  );
  const [registrationDeadline, setRegistrationDeadline] = useState(
    initialEvent?.registration_deadline ? initialEvent.registration_deadline.slice(0, 16) : ''
  );

  // Location & Mode
  const [mode, setMode] = useState<'offline' | 'online' | 'hybrid'>(initialEvent?.mode || 'offline');
  const [venueName, setVenueName] = useState(initialEvent?.venue_name || 'Main Auditorium, Block C');
  const [venueAddress, setVenueAddress] = useState(initialEvent?.venue_address || 'Noida International University Campus, Plot 1, Sector 17A, Yamuna Expressway, Greater Noida, UP 203201');
  const [mapsUrl, setMapsUrl] = useState(initialEvent?.maps_url || siteConfig.mapsUrl);
  const [joinLink, setJoinLink] = useState(initialEvent?.join_link || '');
  const [platform, setPlatform] = useState(initialEvent?.platform || 'Amazon Chime / Zoom');

  // Registration Settings
  const [registrationType, setRegistrationType] = useState<'site' | 'meetup' | 'both'>(initialEvent?.registration_type || 'site');
  const [meetupEventUrl, setMeetupEventUrl] = useState(initialEvent?.meetup_event_url || '');
  const [capacity, setCapacity] = useState<string>(initialEvent?.capacity !== undefined && initialEvent?.capacity !== null ? String(initialEvent.capacity) : '100');
  const [waitlistEnabled, setWaitlistEnabled] = useState(initialEvent?.waitlist_enabled ?? true);
  const [registrationManualState, setRegistrationManualState] = useState<'auto' | 'open' | 'closed'>(initialEvent?.registration_manual_state || 'auto');
  const [feeType, setFeeType] = useState<'free' | 'paid'>(initialEvent?.fee_type || 'free');
  const [feeNote, setFeeNote] = useState(initialEvent?.fee_note || '');
  const [paymentLink, setPaymentLink] = useState(initialEvent?.payment_link || '');
  const [allowedRoles, setAllowedRoles] = useState<RegistrationRole[]>(
    initialEvent?.allowed_roles && initialEvent.allowed_roles.length > 0
      ? initialEvent.allowed_roles
      : ['attendee', 'speaker', 'sponsor', 'volunteer']
  );

  // Extras
  const [prerequisites, setPrerequisites] = useState(initialEvent?.prerequisites || '');
  const [whatToBring, setWhatToBring] = useState(initialEvent?.what_to_bring || '');
  const [certificate, setCertificate] = useState(initialEvent?.certificate ?? true);
  const [contactEmail, setContactEmail] = useState(initialEvent?.contact_email || 'community@niu.ac.in');

  // Status
  const [status, setStatus] = useState<'draft' | 'published' | 'cancelled' | 'completed'>(initialEvent?.status || 'draft');

  // Speakers list
  const [speakers, setSpeakers] = useState<EventSpeaker[]>(() => {
    return (initialEvent?.speakers || []).map((s, idx) => ({
      ...s,
      id: s.id || `sp-${Date.now()}-${idx}`,
    }));
  });

  // Agenda items
  const [agenda, setAgenda] = useState<EventAgendaItem[]>(() => {
    return (initialEvent?.agenda || []).map((ag, idx) => ({
      ...ag,
      id: ag.id || `ag-${Date.now()}-${idx}`,
    }));
  });

  // Custom questions (max 3)
  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>(() => {
    return (initialEvent?.custom_questions || []).map((q, idx) => ({
      ...q,
      id: q.id || `q-${Date.now()}-${idx}`,
    }));
  });

  // State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showMarkdownPreview, setShowMarkdownPreview] = useState(false);

  // Auto-generate slug from title if new
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEdit && !slug) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '')
      );
    }
  };

  // Speaker helpers
  const addSpeaker = () => {
    const newSpeaker: EventSpeaker = {
      id: `sp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      event_id: initialEvent?.id || '',
      name: '',
      role: '',
      company: '',
      photo_url: '/sbg-logo.svg',
      bio: '',
      linkedin_url: '',
      x_url: '',
      sort_order: speakers.length + 1,
    };
    setSpeakers([...speakers, newSpeaker]);
  };

  const removeSpeaker = (idx: number) => {
    setSpeakers(speakers.filter((_, i) => i !== idx));
  };

  const updateSpeaker = (idx: number, field: keyof EventSpeaker, val: unknown) => {
    const updated = [...speakers];
    updated[idx] = { ...updated[idx], [field]: val };
    setSpeakers(updated);
  };

  // Agenda helpers
  const addAgendaItem = () => {
    const newItem: EventAgendaItem = {
      id: `ag-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      event_id: initialEvent?.id || '',
      start_label: '10:00 AM',
      end_label: '11:00 AM',
      title: '',
      description: '',
      speaker_id: speakers.length > 0 ? (speakers[0].id || null) : null,
      tag: 'Session',
      sort_order: agenda.length + 1,
    };
    setAgenda([...agenda, newItem]);
  };

  const removeAgendaItem = (idx: number) => {
    setAgenda(agenda.filter((_, i) => i !== idx));
  };

  const updateAgendaItem = (idx: number, field: keyof EventAgendaItem, val: unknown) => {
    const updated = [...agenda];
    updated[idx] = { ...updated[idx], [field]: val };
    setAgenda(updated);
  };

  // Custom question helpers
  const addCustomQuestion = () => {
    if (customQuestions.length >= 3) return;
    const newQ: CustomQuestion = {
      id: `q-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      label: '',
      type: 'text',
      options: [],
      required: false,
    };
    setCustomQuestions([...customQuestions, newQ]);
  };

  const removeCustomQuestion = (idx: number) => {
    setCustomQuestions(customQuestions.filter((_, i) => i !== idx));
  };

  const updateCustomQuestion = (idx: number, field: keyof CustomQuestion, val: unknown) => {
    const updated = [...customQuestions];
    updated[idx] = { ...updated[idx], [field]: val };
    setCustomQuestions(updated);
  };

  // Save form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const payload = {
        title,
        slug,
        summary,
        description_md: descriptionMd,
        banner_url: bannerUrl,
        category,
        tags: tagsStr.split(',').map((t) => t.trim()).filter(Boolean),
        status,
        featured,
        event_date: eventDate,
        start_time: startTime,
        end_time: endTime,
        timezone,
        mode,
        venue_name: mode === 'online' ? null : venueName,
        venue_address: mode === 'online' ? null : venueAddress,
        maps_url: mode === 'online' ? null : mapsUrl,
        join_link: mode === 'offline' ? null : joinLink,
        platform: mode === 'offline' ? null : platform,
        registration_type: registrationType,
        meetup_event_url: meetupEventUrl || null,
        capacity: capacity ? parseInt(capacity, 10) : null,
        waitlist_enabled: waitlistEnabled,
        registration_opens_at: (() => {
          if (!registrationOpensAt) return null;
          const d = new Date(registrationOpensAt);
          return isNaN(d.getTime()) ? null : d.toISOString();
        })(),
        registration_deadline: (() => {
          if (!registrationDeadline) return null;
          const d = new Date(registrationDeadline);
          return isNaN(d.getTime()) ? null : d.toISOString();
        })(),
        registration_manual_state: registrationManualState,
        fee_type: feeType,
        fee_note: feeNote || null,
        payment_link: paymentLink || null,
        prerequisites: prerequisites || null,
        what_to_bring: whatToBring || null,
        certificate,
        contact_email: contactEmail,
        custom_questions: customQuestions,
        allowed_roles: allowedRoles,
        speakers,
        agenda,
      };

      const url = isEdit ? `/api/admin/events/${initialEvent?.id}` : '/api/admin/events';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save event');
      }

      setSuccessMsg(isEdit ? 'Event updated successfully!' : 'Event created successfully!');
      
      // Navigate or reload
      setTimeout(() => {
        router.push('/admin/events');
        router.refresh();
      }, 800);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred while saving.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Delete event
  const handleDelete = async () => {
    if (!initialEvent) return;
    if (deleteConfirmText !== initialEvent.title) {
      setError('Confirmation title does not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/events/${initialEvent.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete event');
      }
      router.push('/admin/events');
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      }
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-16">
      {/* Top Banner / Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#262626]">
        <div>
          <Link href="/admin/events" className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition mb-2">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Events List</span>
          </Link>
          <h1 className="text-2xl font-bold text-white font-heading">
            {isEdit ? `Edit Event: ${initialEvent?.title}` : 'Create New Event'}
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Fill in the details below. Publishing an event will immediately make it active across the site.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isEdit && (
            <Link
              href={`/events/${initialEvent?.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#1A1A1A] hover:bg-[#252525] border border-[#333333] text-gray-200 text-xs font-semibold rounded-lg transition"
            >
              <Eye className="w-3.5 h-3.5 text-[#FF9900]" />
              <span>Preview Public Page</span>
            </Link>
          )}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2 bg-[#FF9900] hover:bg-[#FFAA22] text-black text-xs font-bold uppercase tracking-wider rounded-lg transition shadow-md shadow-[#FF9900]/20 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Event'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-950/40 border border-red-800/60 text-red-300 text-xs flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs flex items-start gap-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* SECTION 1: Basics */}
      <div className="bg-[#111111] border border-[#262626] rounded-xl p-6 space-y-6">
        <h2 className="text-base font-bold text-white font-heading flex items-center gap-2 border-b border-[#222222] pb-3">
          <Sparkles className="w-4 h-4 text-[#FF9900]" />
          <span>1. Basic Information</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-300 uppercase tracking-wider mb-2">
              Event Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#181818] border border-[#333333] rounded-lg text-white text-sm focus:outline-none focus:border-[#FF9900]"
              placeholder="e.g. AWS Cloud Discovery Day & Hands-on Lab"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 uppercase tracking-wider mb-2">
              URL Slug *
            </label>
            <div className="flex rounded-lg shadow-sm">
              <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-[#333333] bg-[#141414] text-gray-400 text-xs">
                /events/
              </span>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="flex-1 min-w-0 px-3.5 py-2.5 bg-[#181818] border border-[#333333] rounded-r-lg text-white text-sm focus:outline-none focus:border-[#FF9900]"
                placeholder="aws-cloud-discovery-day"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 uppercase tracking-wider mb-2">
              Category / Track *
            </label>
            <input
              type="text"
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#181818] border border-[#333333] rounded-lg text-white text-sm focus:outline-none focus:border-[#FF9900]"
              placeholder="Technical Workshop / Cloud Conference / Hackathon"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-300 uppercase tracking-wider mb-2">
              Short Summary (Card Text) *
            </label>
            <textarea
              required
              rows={2}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#181818] border border-[#333333] rounded-lg text-white text-sm focus:outline-none focus:border-[#FF9900]"
              placeholder="A concise 1-2 sentence teaser shown on event cards and SEO previews."
            />
          </div>

          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-medium text-gray-300 uppercase tracking-wider">
                Full Description (Markdown Supported) *
              </label>
              <button
                type="button"
                onClick={() => setShowMarkdownPreview(!showMarkdownPreview)}
                className="text-xs text-[#FF9900] hover:underline cursor-pointer"
              >
                {showMarkdownPreview ? 'Edit Markdown' : 'Preview Formatted'}
              </button>
            </div>

            {showMarkdownPreview ? (
              <div className="w-full p-4 bg-[#141414] border border-[#333333] rounded-lg text-white text-sm prose prose-invert max-w-none min-h-[160px] whitespace-pre-wrap">
                {descriptionMd || 'No description provided.'}
              </div>
            ) : (
              <textarea
                required
                rows={8}
                value={descriptionMd}
                onChange={(e) => setDescriptionMd(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#181818] border border-[#333333] rounded-lg text-white text-sm font-mono focus:outline-none focus:border-[#FF9900]"
                placeholder="Write detailed event overview, takeaways, and agenda breakdown..."
              />
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 uppercase tracking-wider mb-2">
              Banner Image URL *
            </label>
            <input
              type="text"
              required
              value={bannerUrl}
              onChange={(e) => setBannerUrl(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#181818] border border-[#333333] rounded-lg text-white text-sm focus:outline-none focus:border-[#FF9900]"
              placeholder="/hero.jpg"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 uppercase tracking-wider mb-2">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={tagsStr}
              onChange={(e) => setTagsStr(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#181818] border border-[#333333] rounded-lg text-white text-sm focus:outline-none focus:border-[#FF9900]"
              placeholder="AWS Lambda, Serverless, AI, DynamoDB"
            />
          </div>

          <div className="md:col-span-2 flex items-center gap-3 pt-2">
            <input
              id="featured"
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="w-4 h-4 rounded text-[#FF9900] bg-[#181818] border-[#333333] focus:ring-[#FF9900]"
            />
            <label htmlFor="featured" className="text-xs text-gray-300 select-none">
              Feature on Homepage Hero (if published and upcoming, this event will be highlighted)
            </label>
          </div>
        </div>
      </div>

      {/* SECTION 2: Schedule */}
      <div className="bg-[#111111] border border-[#262626] rounded-xl p-6 space-y-6">
        <h2 className="text-base font-bold text-white font-heading flex items-center gap-2 border-b border-[#222222] pb-3">
          <Calendar className="w-4 h-4 text-[#FF9900]" />
          <span>2. Schedule & Deadlines</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-medium text-gray-300 uppercase tracking-wider mb-2">
              Event Date * (YYYY-MM-DD)
            </label>
            <input
              type="date"
              required
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#181818] border border-[#333333] rounded-lg text-white text-sm focus:outline-none focus:border-[#FF9900]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 uppercase tracking-wider mb-2">
              Start Time * (IST)
            </label>
            <input
              type="text"
              required
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#181818] border border-[#333333] rounded-lg text-white text-sm focus:outline-none focus:border-[#FF9900]"
              placeholder="10:00 AM"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 uppercase tracking-wider mb-2">
              End Time * (IST)
            </label>
            <input
              type="text"
              required
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#181818] border border-[#333333] rounded-lg text-white text-sm focus:outline-none focus:border-[#FF9900]"
              placeholder="04:00 PM"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 uppercase tracking-wider mb-2">
              Timezone
            </label>
            <input
              type="text"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#181818] border border-[#333333] rounded-lg text-white text-sm focus:outline-none focus:border-[#FF9900]"
              placeholder="Asia/Kolkata"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 uppercase tracking-wider mb-2">
              Registration Opens
            </label>
            <input
              type="datetime-local"
              value={registrationOpensAt}
              onChange={(e) => setRegistrationOpensAt(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#181818] border border-[#333333] rounded-lg text-white text-sm focus:outline-none focus:border-[#FF9900]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 uppercase tracking-wider mb-2">
              Registration Deadline
            </label>
            <input
              type="datetime-local"
              value={registrationDeadline}
              onChange={(e) => setRegistrationDeadline(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#181818] border border-[#333333] rounded-lg text-white text-sm focus:outline-none focus:border-[#FF9900]"
            />
          </div>
        </div>
      </div>

      {/* SECTION 3: Location & Mode */}
      <div className="bg-[#111111] border border-[#262626] rounded-xl p-6 space-y-6">
        <h2 className="text-base font-bold text-white font-heading flex items-center gap-2 border-b border-[#222222] pb-3">
          <MapPin className="w-4 h-4 text-[#FF9900]" />
          <span>3. Location & Mode</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-3">
            <label className="block text-xs font-medium text-gray-300 uppercase tracking-wider mb-2">
              Delivery Mode *
            </label>
            <div className="flex gap-4">
              {(['offline', 'online', 'hybrid'] as const).map((m) => (
                <label key={m} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border cursor-pointer transition ${
                  mode === m ? 'border-[#FF9900] bg-[#FF9900]/10 text-white' : 'border-[#333333] bg-[#141414] text-gray-400'
                }`}>
                  <input
                    type="radio"
                    name="mode"
                    value={m}
                    checked={mode === m}
                    onChange={() => setMode(m)}
                    className="sr-only"
                  />
                  <span className="capitalize text-xs font-bold">{m} Event</span>
                </label>
              ))}
            </div>
          </div>

          {mode !== 'online' && (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-300 uppercase tracking-wider mb-2">
                  Venue Name *
                </label>
                <input
                  type="text"
                  required
                  value={venueName}
                  onChange={(e) => setVenueName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#181818] border border-[#333333] rounded-lg text-white text-sm focus:outline-none focus:border-[#FF9900]"
                  placeholder="Main Auditorium, Block C"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 uppercase tracking-wider mb-2">
                  Venue Campus Address *
                </label>
                <input
                  type="text"
                  required
                  value={venueAddress}
                  onChange={(e) => setVenueAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#181818] border border-[#333333] rounded-lg text-white text-sm focus:outline-none focus:border-[#FF9900]"
                  placeholder="Noida International University Campus..."
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 uppercase tracking-wider mb-2">
                  Google Maps URL
                </label>
                <input
                  type="url"
                  value={mapsUrl}
                  onChange={(e) => setMapsUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#181818] border border-[#333333] rounded-lg text-white text-sm focus:outline-none focus:border-[#FF9900]"
                  placeholder="https://maps.google.com/..."
                />
              </div>
            </>
          )}

          {mode !== 'offline' && (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-300 uppercase tracking-wider mb-2">
                  Online Platform Name
                </label>
                <input
                  type="text"
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#181818] border border-[#333333] rounded-lg text-white text-sm focus:outline-none focus:border-[#FF9900]"
                  placeholder="Amazon Chime / Zoom / YouTube Live"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-300 uppercase tracking-wider mb-2">
                  Meeting Join Link (PRIVATE: Confirmed Registrants Only)
                </label>
                <input
                  type="url"
                  value={joinLink}
                  onChange={(e) => setJoinLink(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#181818] border border-[#333333] rounded-lg text-white text-sm focus:outline-none focus:border-[#FF9900]"
                  placeholder="https://app.chime.aws/..."
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  Note: This link is NEVER printed on the public page. It is only shown on the post-registration screen and confirmation email.
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* SECTION 4: Repeatable Speakers */}
      <div className="bg-[#111111] border border-[#262626] rounded-xl p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-[#222222] pb-3">
          <h2 className="text-base font-bold text-white font-heading flex items-center gap-2">
            <Users className="w-4 h-4 text-[#FF9900]" />
            <span>4. Speakers ({speakers.length})</span>
          </h2>
          <button
            type="button"
            onClick={addSpeaker}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1A1A1A] hover:bg-[#252525] border border-[#333333] text-white text-xs font-semibold rounded-lg transition"
          >
            <Plus className="w-3.5 h-3.5 text-[#FF9900]" />
            <span>Add Speaker</span>
          </button>
        </div>

        {speakers.length === 0 ? (
          <p className="text-xs text-gray-500 italic py-2">
            No speakers added yet. Click &quot;Add Speaker&quot; to attach speakers to this event.
          </p>
        ) : (
          <div className="space-y-4">
            {speakers.map((sp, idx) => (
              <div key={sp.id || idx} className="p-4 bg-[#141414] border border-[#262626] rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#FF9900] uppercase tracking-wider">
                    Speaker #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeSpeaker(idx)}
                    className="p-1 text-gray-500 hover:text-red-400 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={sp.name}
                      onChange={(e) => updateSpeaker(idx, 'name', e.target.value)}
                      className="w-full px-3 py-1.5 bg-[#1c1c1c] border border-[#333] rounded text-white text-xs"
                      placeholder="Jane Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Role / Title *</label>
                    <input
                      type="text"
                      required
                      value={sp.role}
                      onChange={(e) => updateSpeaker(idx, 'role', e.target.value)}
                      className="w-full px-3 py-1.5 bg-[#1c1c1c] border border-[#333] rounded text-white text-xs"
                      placeholder="Cloud Architect / AWS Community Builder"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Company / Organization *</label>
                    <input
                      type="text"
                      required
                      value={sp.company}
                      onChange={(e) => updateSpeaker(idx, 'company', e.target.value)}
                      className="w-full px-3 py-1.5 bg-[#1c1c1c] border border-[#333] rounded text-white text-xs"
                      placeholder="Amazon / Tech Corp"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Photo URL</label>
                    <input
                      type="text"
                      value={sp.photo_url}
                      onChange={(e) => updateSpeaker(idx, 'photo_url', e.target.value)}
                      className="w-full px-3 py-1.5 bg-[#1c1c1c] border border-[#333] rounded text-white text-xs"
                      placeholder="/sbg-logo.svg"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">LinkedIn Profile</label>
                    <input
                      type="url"
                      value={sp.linkedin_url || ''}
                      onChange={(e) => updateSpeaker(idx, 'linkedin_url', e.target.value)}
                      className="w-full px-3 py-1.5 bg-[#1c1c1c] border border-[#333] rounded text-white text-xs"
                      placeholder="https://linkedin.com/in/..."
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">X / Twitter</label>
                    <input
                      type="url"
                      value={sp.x_url || ''}
                      onChange={(e) => updateSpeaker(idx, 'x_url', e.target.value)}
                      className="w-full px-3 py-1.5 bg-[#1c1c1c] border border-[#333] rounded text-white text-xs"
                      placeholder="https://x.com/..."
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-[11px] text-gray-400 mb-1">Short Bio</label>
                    <textarea
                      rows={2}
                      value={sp.bio}
                      onChange={(e) => updateSpeaker(idx, 'bio', e.target.value)}
                      className="w-full px-3 py-1.5 bg-[#1c1c1c] border border-[#333] rounded text-white text-xs"
                      placeholder="Brief bio highlighting cloud expertise and achievements..."
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 5: Repeatable Agenda */}
      <div className="bg-[#111111] border border-[#262626] rounded-xl p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-[#222222] pb-3">
          <h2 className="text-base font-bold text-white font-heading flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#FF9900]" />
            <span>5. Agenda Timeline ({agenda.length})</span>
          </h2>
          <button
            type="button"
            onClick={addAgendaItem}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1A1A1A] hover:bg-[#252525] border border-[#333333] text-white text-xs font-semibold rounded-lg transition"
          >
            <Plus className="w-3.5 h-3.5 text-[#FF9900]" />
            <span>Add Session</span>
          </button>
        </div>

        {agenda.length === 0 ? (
          <p className="text-xs text-gray-500 italic py-2">
            No agenda slots defined. Click &quot;Add Session&quot; to build the timeline.
          </p>
        ) : (
          <div className="space-y-4">
            {agenda.map((item, idx) => (
              <div key={item.id || idx} className="p-4 bg-[#141414] border border-[#262626] rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#FF9900] uppercase tracking-wider">
                    Session #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeAgendaItem(idx)}
                    className="p-1 text-gray-500 hover:text-red-400 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Start Time *</label>
                    <input
                      type="text"
                      required
                      value={item.start_label}
                      onChange={(e) => updateAgendaItem(idx, 'start_label', e.target.value)}
                      className="w-full px-3 py-1.5 bg-[#1c1c1c] border border-[#333] rounded text-white text-xs"
                      placeholder="10:00 AM"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">End Time *</label>
                    <input
                      type="text"
                      required
                      value={item.end_label}
                      onChange={(e) => updateAgendaItem(idx, 'end_label', e.target.value)}
                      className="w-full px-3 py-1.5 bg-[#1c1c1c] border border-[#333] rounded text-white text-xs"
                      placeholder="11:00 AM"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] text-gray-400 mb-1">Tag / Format *</label>
                    <input
                      type="text"
                      required
                      value={item.tag}
                      onChange={(e) => updateAgendaItem(idx, 'tag', e.target.value)}
                      className="w-full px-3 py-1.5 bg-[#1c1c1c] border border-[#333] rounded text-white text-xs"
                      placeholder="Keynote / Workshop / Panel / Networking"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-[11px] text-gray-400 mb-1">Session Title *</label>
                    <input
                      type="text"
                      required
                      value={item.title}
                      onChange={(e) => updateAgendaItem(idx, 'title', e.target.value)}
                      className="w-full px-3 py-1.5 bg-[#1c1c1c] border border-[#333] rounded text-white text-xs"
                      placeholder="e.g. Architecting High-Performance Serverless APIs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Speaker</label>
                    <select
                      value={item.speaker_id || ''}
                      onChange={(e) => updateAgendaItem(idx, 'speaker_id', e.target.value || null)}
                      className="w-full px-3 py-1.5 bg-[#1c1c1c] border border-[#333] rounded text-white text-xs"
                    >
                      <option key="no-speaker" value="">No Speaker / General</option>
                      {speakers.map((s, sIdx) => {
                        const speakerKey = `agenda-speaker-opt-${idx}-${s.id || sIdx}-${sIdx}`;
                        return (
                          <option key={speakerKey} value={s.id || ''}>
                            {s.name || `Speaker ${sIdx + 1}`}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div className="sm:col-span-4">
                    <label className="block text-[11px] text-gray-400 mb-1">Description</label>
                    <textarea
                      rows={2}
                      value={item.description}
                      onChange={(e) => updateAgendaItem(idx, 'description', e.target.value)}
                      className="w-full px-3 py-1.5 bg-[#1c1c1c] border border-[#333] rounded text-white text-xs"
                      placeholder="Brief session overview..."
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 6: Registration Settings */}
      <div className="bg-[#111111] border border-[#262626] rounded-xl p-6 space-y-6">
        <h2 className="text-base font-bold text-white font-heading flex items-center gap-2 border-b border-[#222222] pb-3">
          <CheckCircle2 className="w-4 h-4 text-[#FF9900]" />
          <span>6. Registration & Capacity Controls</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-medium text-gray-300 uppercase tracking-wider mb-2">
              Registration Channel *
            </label>
            <select
              value={registrationType}
              onChange={(e) => setRegistrationType(e.target.value as 'site' | 'meetup' | 'both')}
              className="w-full px-3.5 py-2.5 bg-[#181818] border border-[#333333] rounded-lg text-white text-sm focus:outline-none focus:border-[#FF9900]"
            >
              <option value="site">On-Site Form (Native)</option>
              <option value="meetup">Meetup Event Link Out</option>
              <option value="both">Both (On-Site + Meetup Option)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 uppercase tracking-wider mb-2">
              Capacity (Seats)
            </label>
            <input
              type="number"
              min="0"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#181818] border border-[#333333] rounded-lg text-white text-sm focus:outline-none focus:border-[#FF9900]"
              placeholder="Blank = Unlimited"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 uppercase tracking-wider mb-2">
              Manual Override
            </label>
            <select
              value={registrationManualState}
              onChange={(e) => setRegistrationManualState(e.target.value as 'auto' | 'open' | 'closed')}
              className="w-full px-3.5 py-2.5 bg-[#181818] border border-[#333333] rounded-lg text-white text-sm focus:outline-none focus:border-[#FF9900]"
            >
              <option value="auto">Auto (Follows OpensAt / Deadline)</option>
              <option value="open">Force Open</option>
              <option value="closed">Force Closed</option>
            </select>
          </div>

          {registrationType !== 'site' && (
            <div className="md:col-span-3">
              <label className="block text-xs font-medium text-gray-300 uppercase tracking-wider mb-2">
                Meetup Event URL *
              </label>
              <input
                type="url"
                required
                value={meetupEventUrl}
                onChange={(e) => setMeetupEventUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#181818] border border-[#333333] rounded-lg text-white text-sm focus:outline-none focus:border-[#FF9900]"
                placeholder="https://www.meetup.com/aws-sbg-at-noida-international-university/events/..."
              />
            </div>
          )}

          {/* Accepted Registration Roles */}
          <div className="md:col-span-3 p-4 bg-[#161616] border border-[#2B2B2B] rounded-xl space-y-3">
            <label className="block text-xs font-bold text-[#FF9900] uppercase tracking-wider">
              Accepted Registration Roles (Public Portal)
            </label>
            <p className="text-[11px] text-gray-400">
              Select which roles visitors are permitted to register under for this event.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              {[
                { id: 'attendee' as RegistrationRole, label: 'Attendees', desc: 'General & Workshop Pass' },
                { id: 'speaker' as RegistrationRole, label: 'Speakers', desc: 'Call for Speakers Proposals' },
                { id: 'sponsor' as RegistrationRole, label: 'Sponsors', desc: 'Sponsorship Inquiries' },
                { id: 'volunteer' as RegistrationRole, label: 'Volunteers', desc: 'Event Crew Applications' },
              ].map((role) => {
                const checked = allowedRoles.includes(role.id);
                return (
                  <label 
                    key={role.id}
                    className={`p-3 rounded-lg border text-left cursor-pointer transition flex items-start gap-2.5 select-none ${
                      checked 
                        ? 'bg-[#1E1405] border-[#FF9900]/50 text-white' 
                        : 'bg-[#141414] border-[#2E2E2E] text-gray-400 hover:text-gray-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setAllowedRoles([...allowedRoles, role.id]);
                        } else {
                          if (allowedRoles.length === 1) {
                            alert('At least one role must be allowed for registration.');
                            return;
                          }
                          setAllowedRoles(allowedRoles.filter((r) => r !== role.id));
                        }
                      }}
                      className="w-4 h-4 rounded text-[#FF9900] bg-[#181818] border-[#333333] focus:ring-[#FF9900] mt-0.5"
                    />
                    <div>
                      <div className="text-xs font-bold">{role.label}</div>
                      <div className="text-[10px] text-gray-500 mt-0.5">{role.desc}</div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              id="waitlist"
              type="checkbox"
              checked={waitlistEnabled}
              onChange={(e) => setWaitlistEnabled(e.target.checked)}
              className="w-4 h-4 rounded text-[#FF9900] bg-[#181818] border-[#333333] focus:ring-[#FF9900]"
            />
            <label htmlFor="waitlist" className="text-xs text-gray-300 select-none">
              Enable Waitlist when capacity is reached
            </label>
          </div>

          <div className="flex items-center gap-3">
            <input
              id="cert"
              type="checkbox"
              checked={certificate}
              onChange={(e) => setCertificate(e.target.checked)}
              className="w-4 h-4 rounded text-[#FF9900] bg-[#181818] border-[#333333] focus:ring-[#FF9900]"
            />
            <label htmlFor="cert" className="text-xs text-gray-300 select-none">
              Participation Certificate Provided
            </label>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 uppercase tracking-wider mb-2">
              Event Contact Email *
            </label>
            <input
              type="email"
              required
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#181818] border border-[#333333] rounded-lg text-white text-sm focus:outline-none focus:border-[#FF9900]"
              placeholder="community@niu.ac.in"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-300 uppercase tracking-wider mb-2">
              Fee Type
            </label>
            <select
              value={feeType}
              onChange={(e) => setFeeType(e.target.value as 'free' | 'paid')}
              className="w-full px-3.5 py-2.5 bg-[#181818] border border-[#333333] rounded-lg text-white text-sm focus:outline-none focus:border-[#FF9900]"
            >
              <option value="free">Free (No Charge)</option>
              <option value="paid">Paid</option>
            </select>
          </div>

          {feeType === 'paid' && (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-300 uppercase tracking-wider mb-2">
                  Fee Note
                </label>
                <input
                  type="text"
                  value={feeNote}
                  onChange={(e) => setFeeNote(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#181818] border border-[#333333] rounded-lg text-white text-sm focus:outline-none focus:border-[#FF9900]"
                  placeholder="e.g. ₹150 for materials"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 uppercase tracking-wider mb-2">
                  Payment Link
                </label>
                <input
                  type="url"
                  value={paymentLink}
                  onChange={(e) => setPaymentLink(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#181818] border border-[#333333] rounded-lg text-white text-sm focus:outline-none focus:border-[#FF9900]"
                  placeholder="https://rzp.io/..."
                />
              </div>
            </>
          )}

          <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-medium text-gray-300 uppercase tracking-wider mb-2">
                Prerequisites (Optional)
              </label>
              <input
                type="text"
                value={prerequisites}
                onChange={(e) => setPrerequisites(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#181818] border border-[#333333] rounded-lg text-white text-sm focus:outline-none focus:border-[#FF9900]"
                placeholder="Basic familiarity with AWS / JavaScript"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 uppercase tracking-wider mb-2">
                What to Bring (Optional)
              </label>
              <input
                type="text"
                value={whatToBring}
                onChange={(e) => setWhatToBring(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#181818] border border-[#333333] rounded-lg text-white text-sm focus:outline-none focus:border-[#FF9900]"
                placeholder="Laptop, Charger, Student ID"
              />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 7: Custom Questions */}
      <div className="bg-[#111111] border border-[#262626] rounded-xl p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-[#222222] pb-3">
          <div>
            <h2 className="text-base font-bold text-white font-heading">
              7. Custom Registration Questions ({customQuestions.length}/3)
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Add up to 3 custom questions to ask during public registration.
            </p>
          </div>

          {customQuestions.length < 3 && (
            <button
              type="button"
              onClick={addCustomQuestion}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1A1A1A] hover:bg-[#252525] border border-[#333333] text-white text-xs font-semibold rounded-lg transition"
            >
              <Plus className="w-3.5 h-3.5 text-[#FF9900]" />
              <span>Add Question</span>
            </button>
          )}
        </div>

        {customQuestions.length === 0 ? (
          <p className="text-xs text-gray-500 italic py-2">
            No custom questions configured. The standard fields (Name, Email, Phone, College, Course/Year, Source) will be collected.
          </p>
        ) : (
          <div className="space-y-4">
            {customQuestions.map((q, idx) => (
              <div key={q.id || idx} className="p-4 bg-[#141414] border border-[#262626] rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#FF9900] uppercase tracking-wider">
                    Question #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeCustomQuestion(idx)}
                    className="p-1 text-gray-500 hover:text-red-400 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] text-gray-400 mb-1">Question Prompt *</label>
                    <input
                      type="text"
                      required
                      value={q.label}
                      onChange={(e) => updateCustomQuestion(idx, 'label', e.target.value)}
                      className="w-full px-3 py-1.5 bg-[#1c1c1c] border border-[#333] rounded text-white text-xs"
                      placeholder="e.g. What is your current AWS experience level?"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Input Type</label>
                    <select
                      value={q.type}
                      onChange={(e) => updateCustomQuestion(idx, 'type', e.target.value as 'text' | 'dropdown')}
                      className="w-full px-3 py-1.5 bg-[#1c1c1c] border border-[#333] rounded text-white text-xs"
                    >
                      <option value="text">Short Text</option>
                      <option value="dropdown">Dropdown Options</option>
                    </select>
                  </div>

                  {q.type === 'dropdown' && (
                    <div className="sm:col-span-3">
                      <label className="block text-[11px] text-gray-400 mb-1">
                        Dropdown Options (comma separated)
                      </label>
                      <input
                        type="text"
                        value={q.options?.join(', ') || ''}
                        onChange={(e) => updateCustomQuestion(idx, 'options', e.target.value.split(',').map((o) => o.trim()).filter(Boolean))}
                        className="w-full px-3 py-1.5 bg-[#1c1c1c] border border-[#333] rounded text-white text-xs"
                        placeholder="Beginner, Intermediate, Advanced"
                      />
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <input
                      id={`req-${idx}`}
                      type="checkbox"
                      checked={q.required}
                      onChange={(e) => updateCustomQuestion(idx, 'required', e.target.checked)}
                      className="w-3.5 h-3.5 rounded text-[#FF9900] bg-[#181818] border-[#333333]"
                    />
                    <label htmlFor={`req-${idx}`} className="text-xs text-gray-400">
                      Required Answer
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 8: Status & Publishing */}
      <div className="bg-[#111111] border border-[#262626] rounded-xl p-6 space-y-6">
        <h2 className="text-base font-bold text-white font-heading flex items-center gap-2 border-b border-[#222222] pb-3">
          <AlertTriangle className="w-4 h-4 text-[#FF9900]" />
          <span>8. Publication Status</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div>
            <label className="block text-xs font-medium text-gray-300 uppercase tracking-wider mb-2">
              Event State *
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'draft' | 'published' | 'cancelled' | 'completed')}
              className="w-full px-3.5 py-2.5 bg-[#181818] border border-[#333333] rounded-lg text-white text-sm focus:outline-none focus:border-[#FF9900]"
            >
              <option value="draft">Draft (Hidden from public site)</option>
              <option value="published">Published (Live on homepage, /events & sitemap)</option>
              <option value="completed">Completed (Archived post-event)</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <p className="text-[11px] text-gray-400 mt-2">
              {status === 'draft' && '⚠️ Draft events are completely invisible to regular visitors and excluded from the public sitemap.'}
              {status === 'published' && '🚀 Once saved as Published, this event becomes immediately live on the homepage, /events, and active for registration.'}
            </p>
          </div>

          {isEdit && (
            <div className="p-4 bg-red-950/20 border border-red-900/30 rounded-lg">
              <span className="text-xs font-bold text-red-400 block mb-1">Danger Zone</span>
              <p className="text-[11px] text-gray-400 mb-3">
                Deleting this event retains registrations for records. Requires typed confirmation.
              </p>
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 border border-red-600/40 text-red-400 text-xs font-semibold rounded transition cursor-pointer"
              >
                Delete Event
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="flex items-center justify-end gap-4 pt-4 border-t border-[#262626]">
        <Link
          href="/admin/events"
          className="px-5 py-2.5 text-xs font-semibold text-gray-400 hover:text-white transition"
        >
          Cancel
        </Link>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#FF9900] hover:bg-[#FFAA22] text-black text-xs font-bold uppercase tracking-wider rounded-lg transition shadow-lg shadow-[#FF9900]/20 cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Event'}</span>
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && initialEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-[#141414] border border-[#333333] rounded-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Confirm Event Deletion</h3>
            <p className="text-xs text-gray-300">
              This action cannot be undone. To confirm, please type the full title of the event:
            </p>
            <div className="p-2.5 bg-[#0a0a0a] rounded border border-[#262626] text-xs text-gray-300 select-all font-mono">
              {initialEvent.title}
            </div>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              className="w-full px-3 py-2 bg-[#1f1f1f] border border-[#333] rounded text-white text-xs"
              placeholder="Type event title here"
            />
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-xs text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleteConfirmText !== initialEvent.title || loading}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white text-xs font-bold rounded"
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
