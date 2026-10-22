'use client';

import { useState } from 'react';
import Image from 'next/image';
import { 
  Calendar, Clock, MapPin, Users, Award, 
  ArrowRight, ExternalLink, Sparkles, Copy, Check 
} from 'lucide-react';
import { EventRecord } from '@/lib/db/types';
import { RegistrationModal } from '@/components/registration-modal';
import { formatDate } from '@/lib/utils';
import { siteConfig } from '@/config/site';

interface EventDetailClientProps {
  event: EventRecord;
}

export function EventDetailClient({ event }: EventDetailClientProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Seat metrics
  const confirmed = event.confirmed_count || 0;
  const capacity = event.capacity || 0;
  const seatsLeft = capacity > 0 ? Math.max(0, capacity - confirmed) : null;
  const isFull = capacity > 0 && confirmed >= capacity;
  const isFillingFast = seatsLeft !== null && capacity > 0 && seatsLeft <= capacity * 0.2 && seatsLeft > 0;

  // Manual status check
  const isClosed = event.registration_manual_state === 'closed';
  const isCompleted = event.status === 'completed';

  const handleCopyShareLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleShareOnX = () => {
    if (typeof window !== 'undefined') {
      const text = encodeURIComponent(`Attending ${event.title} organized by @${siteConfig.shortName}! Register now:`);
      const url = encodeURIComponent(window.location.href);
      window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}&hashtags=AWSSBGNIU,AWSCommunity`, '_blank');
    }
  };

  const handleShareOnLinkedIn = () => {
    if (typeof window !== 'undefined') {
      const url = encodeURIComponent(window.location.href);
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
    }
  };

  const canRegister = !isClosed && !isCompleted;

  return (
    <div className="space-y-12 pb-24">
      {/* Hero Header */}
      <div className="relative rounded-2xl overflow-hidden bg-[#111111] border border-[#262626]">
        <div className="relative h-64 sm:h-96 w-full">
          <Image
            src={event.banner_url || '/hero.jpg'}
            alt={event.title}
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/70 to-black/30" />
        </div>

        <div className="relative p-6 sm:p-10 -mt-24 sm:-mt-32 space-y-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#FF9900]/20 text-[#FF9900] border border-[#FF9900]/40">
              {event.category}
            </span>

            {isCompleted ? (
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gray-700 text-gray-300">
                Event Concluded
              </span>
            ) : isClosed ? (
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/40">
                Registration Closed
              </span>
            ) : isFull ? (
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/40">
                Waitlist Active
              </span>
            ) : isFillingFast ? (
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/20 text-rose-400 border border-rose-500/40">
                Filling Fast ({seatsLeft} Seats Left)
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                Registration Open
              </span>
            )}

            <span className="text-xs text-gray-400 uppercase font-semibold">
              • {event.mode} Mode
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold font-heading text-white tracking-tight">
            {event.title}
          </h1>

          <p className="text-base text-gray-200 max-w-3xl leading-relaxed">
            {event.summary}
          </p>

          {/* Quick Info Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#222222] text-xs text-gray-300">
            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-[#FF9900] shrink-0" />
              <div>
                <span className="text-gray-400 block text-xs uppercase font-bold">Date</span>
                <span className="font-semibold text-white">{formatDate(event.event_date)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-[#FF9900] shrink-0" />
              <div>
                <span className="text-gray-400 block text-xs uppercase font-bold">Time (IST)</span>
                <span className="font-semibold text-white">{event.start_time} - {event.end_time}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-[#FF9900] shrink-0" />
              <div>
                <span className="text-gray-400 block text-xs uppercase font-bold">Location</span>
                <span className="font-semibold text-white truncate max-w-[180px] block">
                  {event.venue_name || event.platform || 'Campus Auditorium, NIU'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left = Details/Agenda/Speakers; Right = RSVP Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-10">
          {/* About / Description */}
          <section className="bg-[#111111] border border-[#262626] rounded-xl p-6 sm:p-8 space-y-4">
            <h2 className="text-lg font-bold font-heading text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#FF9900]" />
              <span>About This Session</span>
            </h2>
            <div className="text-xs sm:text-sm text-gray-200 leading-relaxed whitespace-pre-wrap space-y-3 font-normal">
              {event.description_md}
            </div>
          </section>

          {/* Speakers Section */}
          {event.speakers && event.speakers.length > 0 && (
            <section className="bg-[#111111] border border-[#262626] rounded-xl p-6 sm:p-8 space-y-6">
              <h2 className="text-lg font-bold font-heading text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-[#FF9900]" />
                <span>Featured Speakers</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {event.speakers.map((sp) => (
                  <div
                    key={sp.id}
                    className="p-4 bg-[#141414] border border-[#222222] rounded-xl space-y-3 hover:border-[#333333] transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-full overflow-hidden bg-[#222222] border border-[#FF9900]/40 shrink-0">
                        <Image
                          src={sp.photo_url || '/sbg-logo.svg'}
                          alt={sp.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white font-heading">{sp.name}</h4>
                        <p className="text-xs text-[#FF9900] font-semibold">{sp.role}</p>
                        <p className="text-xs text-gray-400">{sp.company}</p>
                      </div>
                    </div>

                    {sp.bio && (
                      <p className="text-xs sm:text-sm text-gray-200 leading-relaxed font-normal">
                        {sp.bio}
                      </p>
                    )}

                    <div className="flex items-center gap-3 pt-1 text-xs text-gray-400">
                      {sp.linkedin_url && (
                        <a
                          href={sp.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-[#FF9900] transition underline underline-offset-4"
                        >
                          LinkedIn
                        </a>
                      )}
                      {sp.x_url && (
                        <a
                          href={sp.x_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-[#FF9900] transition underline underline-offset-4"
                        >
                          X / Twitter
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Agenda Section */}
          {event.agenda && event.agenda.length > 0 && (
            <section className="bg-[#111111] border border-[#262626] rounded-xl p-6 sm:p-8 space-y-6">
              <h2 className="text-lg font-bold font-heading text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#FF9900]" />
                <span>Session Agenda</span>
              </h2>

              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#262626]">
                {event.agenda.map((item, idx) => (
                  <div key={item.id || idx} className="relative group">
                    {/* Orange Dot */}
                    <div className="absolute -left-[19px] top-1.5 w-3 h-3 rounded-full bg-[#111111] border-2 border-[#FF9900] group-hover:bg-[#FF9900] transition-colors" />

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-mono font-bold text-[#FF9900]">
                          {item.start_label} - {item.end_label}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-[#1c1c1c] text-gray-300 border border-[#2e2e2e]">
                          {item.tag}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-white font-heading">{item.title}</h4>
                      {item.description && (
                        <p className="text-xs text-gray-400">{item.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Prerequisites & What to bring */}
          {(event.prerequisites || event.what_to_bring) && (
            <section className="bg-[#111111] border border-[#262626] rounded-xl p-6 sm:p-8 space-y-4">
              <h2 className="text-base font-bold font-heading text-white">Attendee Preparation</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-gray-300">
                {event.prerequisites && (
                  <div className="p-4 bg-[#141414] border border-[#222222] rounded-lg space-y-1">
                    <span className="text-gray-400 uppercase text-[10px] font-bold block">Prerequisites</span>
                    <p>{event.prerequisites}</p>
                  </div>
                )}
                {event.what_to_bring && (
                  <div className="p-4 bg-[#141414] border border-[#222222] rounded-lg space-y-1">
                    <span className="text-gray-400 uppercase text-[10px] font-bold block">What to Bring</span>
                    <p>{event.what_to_bring}</p>
                  </div>
                )}
              </div>
            </section>
          )}
        </div>

        {/* Right Sidebar: Registration Card & Share */}
        <div className="space-y-6">
          <div className="bg-[#111111] border border-[#262626] rounded-xl p-6 space-y-6 sticky top-24">
            <div>
              <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold block">Registration Pass</span>
              <div className="text-2xl font-bold font-heading text-white mt-1">
                {event.fee_type === 'free' ? 'Free Community Entry' : 'Paid Session'}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Open to students and learners aged 18+ from NIU and beyond.
              </p>
            </div>

            {/* Attendance & Certificate badges */}
            <div className="space-y-2.5 pt-4 border-t border-[#222222] text-xs">
              <div className="flex items-center justify-between text-gray-300">
                <span>Total Seats</span>
                <span className="font-semibold text-white">{event.capacity ? event.capacity : 'Unlimited'}</span>
              </div>

              <div className="flex items-center justify-between text-gray-300">
                <span>Confirmed Registrations</span>
                <span className="font-semibold text-white">{confirmed}</span>
              </div>

              {event.certificate && (
                <div className="flex items-center gap-2 text-emerald-400 text-xs pt-1">
                  <Award className="w-4 h-4 shrink-0" />
                  <span>Verified Participation Certificate</span>
                </div>
              )}
            </div>

            {/* Registration Actions */}
            <div className="pt-2 space-y-3">
              {canRegister ? (
                <>
                  {event.registration_type === 'meetup' && event.meetup_event_url ? (
                    <a
                      href={event.meetup_event_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 px-4 rounded-lg bg-[#FF9900] hover:bg-[#FFAA22] text-black text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#FF9900]/20 cursor-pointer"
                    >
                      <span>RSVP on Meetup</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  ) : (
                    <button
                      onClick={() => setModalOpen(true)}
                      className="w-full py-3 px-4 rounded-lg bg-[#FF9900] hover:bg-[#FFAA22] text-black text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#FF9900]/20 cursor-pointer"
                    >
                      <span>{isFull ? 'Join Waitlist Queue' : 'Register Now'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}

                  {event.registration_type === 'both' && event.meetup_event_url && (
                    <a
                      href={event.meetup_event_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 px-4 rounded-lg bg-[#181818] hover:bg-[#222] border border-[#333] text-gray-300 text-xs font-semibold transition flex items-center justify-center gap-2"
                    >
                      <span>Also Available on Meetup</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </>
              ) : (
                <div className="p-3 bg-[#161616] border border-[#333] rounded-lg text-xs text-gray-400 text-center">
                  Registration is currently unavailable or completed.
                </div>
              )}
            </div>

            {/* Venue & Maps */}
            {event.mode !== 'online' && (
              <div className="pt-4 border-t border-[#222222] space-y-2 text-xs">
                <span className="text-gray-400 uppercase text-[10px] font-bold block">In-Person Venue</span>
                <p className="font-semibold text-white">{event.venue_name}</p>
                <p className="text-gray-400 text-[11px]">{event.venue_address}</p>
                {event.maps_url && (
                  <a
                    href={event.maps_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#FF9900] hover:underline flex items-center gap-1 text-[11px] pt-1"
                  >
                    <span>Open in Google Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            )}

            {/* Share Widget */}
            <div className="pt-4 border-t border-[#222222] space-y-3">
              <span className="text-gray-400 uppercase text-[10px] font-bold block">Share Session</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleShareOnLinkedIn}
                  className="flex-1 py-2 bg-[#1A1A1A] hover:bg-[#252525] border border-[#333] rounded text-xs text-gray-300 hover:text-white transition"
                >
                  LinkedIn
                </button>
                <button
                  onClick={handleShareOnX}
                  className="flex-1 py-2 bg-[#1A1A1A] hover:bg-[#252525] border border-[#333] rounded text-xs text-gray-300 hover:text-white transition"
                >
                  X (Twitter)
                </button>
                <button
                  onClick={handleCopyShareLink}
                  className="p-2 bg-[#1A1A1A] hover:bg-[#252525] border border-[#333] rounded text-gray-300 hover:text-white transition"
                  title="Copy link"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Organizer Contact */}
            <div className="pt-2 text-[11px] text-gray-500">
              Questions? Reach out to <a href={`mailto:${event.contact_email}`} className="text-gray-400 hover:text-white underline">{event.contact_email}</a>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Mobile Registration Bar */}
      {canRegister && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0A0A0A]/95 backdrop-blur-md border-t border-[#262626] p-4 flex items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-white truncate max-w-[180px]">{event.title}</div>
            <div className="text-[10px] text-gray-400">{event.fee_type === 'free' ? 'Free Community Entry' : 'Paid'}</div>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="px-5 py-2.5 rounded-lg bg-[#FF9900] text-black text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#FF9900]/20 shrink-0"
          >
            {isFull ? 'Join Waitlist' : 'RSVP Now'}
          </button>
        </div>
      )}

      {/* Modal */}
      <RegistrationModal
        event={event}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
