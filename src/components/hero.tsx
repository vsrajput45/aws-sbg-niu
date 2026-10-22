'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Sparkles, Calendar, MapPin, ArrowRight, ExternalLink 
} from 'lucide-react';
import { siteConfig } from '@/config/site';
import { EventRecord } from '@/lib/db/types';
import { formatDate } from '@/lib/utils';

interface HeroProps {
  featuredEvent?: EventRecord | null;
  config?: typeof siteConfig;
}

export function Hero({ featuredEvent, config }: HeroProps) {
  const cfg = config || siteConfig;
  // Countdown timer state for event mode
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);
  const [isEventConcluded, setIsEventConcluded] = useState(false);

  useEffect(() => {
    if (!featuredEvent) return;

    const eventDateStr = `${featuredEvent.event_date}T09:00:00+05:30`;
    const targetTime = new Date(eventDateStr).getTime();

    const updateCountdown = () => {
      const now = Date.now();
      const difference = targetTime - now;

      if (difference <= 0) {
        setIsEventConcluded(true);
        setTimeLeft(null);
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds });
        setIsEventConcluded(false);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [featuredEvent]);

  const isLaunchMode = !featuredEvent;

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 min-h-[92vh] flex items-center bg-[#070312] overflow-hidden">
      {/* Background Campus Image with Cosmic Purple Overlays */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <Image
          src="/hero.jpg"
          alt="Noida International University Campus"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-75 scale-100 transition-transform duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070312] via-[#070312]/70 to-[#070312]/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#070312]/95 via-[#070312]/75 to-transparent" />
        {/* Glowing atmospheric purple cloud light */}
        <div className="absolute -top-20 right-10 w-[450px] h-[450px] bg-purple-600/20 rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute top-1/2 left-10 w-96 h-96 bg-violet-600/15 rounded-full blur-[140px] pointer-events-none" />
      </div>

      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 w-full relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          {/* Main Left Content */}
          <div className="lg:col-span-8 space-y-8">
            {/* Logos Bar */}
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-12 sm:w-24 sm:h-14">
                <Image src="/aws-logo.svg" alt="AWS" fill className="object-contain" priority />
              </div>
              <div className="w-px h-8 bg-[#2E184A]" />
              <div className="relative w-9 h-9">
                <Image src="/sbg-logo.svg" alt="SBG" fill className="object-contain" />
              </div>
              <div className="w-px h-6 bg-[#2E184A]" />
              <div className="flex flex-col">
                <span className="text-xs font-bold tracking-widest text-[#C084FC] uppercase font-heading">
                  Student Builder Group
                </span>
                <span className="text-xs text-gray-300 font-medium">Noida International University</span>
              </div>
            </div>

            {/* Eyebrow Pill */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-[#120829] px-4 py-1.5 shadow-sm shadow-purple-950/40">
                <div className="w-2 h-2 rounded-full bg-[#A855F7] animate-pulse" />
                <span className="text-xs font-semibold text-purple-200 uppercase tracking-widest">
                  {isLaunchMode
                    ? 'STUDENT BUILDER COMMUNITY • FOUNDED SEPTEMBER 2026 • NOIDA, INDIA'
                    : `UPCOMING EVENT • ${featuredEvent?.category?.toUpperCase() || 'TECHNICAL SESSION'}`}
                </span>
              </div>
            </div>

            {/* Main Headline */}
            <div className="space-y-4">
              {isLaunchMode ? (
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold font-heading text-white tracking-tight leading-[1.08]">
                  AWS Student Builder Group <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A855F7] via-[#C084FC] to-violet-200">
                    Noida International University
                  </span>
                </h1>
              ) : (
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold font-heading text-white tracking-tight leading-[1.08]">
                  {featuredEvent?.title}
                </h1>
              )}

              {/* Subtext */}
              <p className="text-base sm:text-lg text-gray-200 max-w-2xl leading-relaxed font-normal">
                {isLaunchMode
                  ? 'A student-led, student-driven academic community at Noida International University. Learn cloud architecture, explore hands-on AWS projects, and master high-demand skills in AI, Cybersecurity, Robotics, and Business Transformation.'
                  : featuredEvent?.summary}
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              {isLaunchMode ? (
                <>
                  <a
                    href={cfg.meetupUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg bg-gradient-to-r from-[#7C3AED] via-[#8B5CF6] to-[#A855F7] hover:from-[#6D28D9] hover:to-[#9333EA] text-white text-xs font-bold uppercase tracking-wider transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-purple-600/30 cursor-pointer"
                  >
                    <span>Join Us on Meetup</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>

                  <a
                    href="#events"
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg bg-[#13092B] hover:bg-[#1C0E3D] border border-purple-900/40 text-white text-xs font-semibold uppercase tracking-wider transition-all"
                  >
                    <span>Our First Event — Coming Soon</span>
                    <ArrowRight className="w-4 h-4 text-purple-300" />
                  </a>
                </>
              ) : (
                <>
                  <Link
                    href={`/events/${featuredEvent?.slug}`}
                    className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg bg-gradient-to-r from-[#7C3AED] via-[#8B5CF6] to-[#A855F7] hover:from-[#6D28D9] hover:to-[#9333EA] text-white text-xs font-bold uppercase tracking-wider transition-all hover:scale-[1.02] shadow-lg shadow-purple-600/30"
                  >
                    <span>Register Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <a
                    href="#agenda"
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg bg-[#13092B] hover:bg-[#1C0E3D] border border-purple-900/40 text-white text-xs font-semibold uppercase tracking-wider transition-all"
                  >
                    <span>View Agenda</span>
                  </a>
                </>
              )}
            </div>

            {/* Honest Stats Row */}
            <div className="pt-8 border-t border-[#24143D] grid grid-cols-2 sm:grid-cols-4 gap-6">
              {isLaunchMode ? (
                <>
                  <div>
                    <span className="text-2xl sm:text-3xl font-extrabold font-heading text-white tracking-tight">
                      {cfg.memberCountSnapshot}
                    </span>
                    <span className="text-xs text-gray-200 block mt-1 font-medium">
                      Founding Members
                    </span>
                    <span className="text-[11px] text-[#C084FC] font-semibold uppercase tracking-wider block mt-0.5">
                      Snapshot as of {cfg.snapshotAsOf}
                    </span>
                  </div>

                  <div>
                    <span className="text-2xl sm:text-3xl font-extrabold font-heading text-white tracking-tight">
                      {cfg.focusAreas.length}
                    </span>
                    <span className="text-xs text-gray-200 block mt-1 font-medium">
                      Focus Areas
                    </span>
                    <span className="text-[11px] text-gray-400 uppercase tracking-wider block mt-0.5">
                      Cloud, AI, Security & More
                    </span>
                  </div>

                  <div>
                    <span className="text-lg sm:text-xl font-bold font-heading text-[#C084FC] tracking-tight block leading-tight pt-1">
                      First event loading…
                    </span>
                    <span className="text-xs text-gray-200 block mt-1 font-medium">
                      Events Held (0)
                    </span>
                    <span className="text-[11px] text-gray-400 uppercase tracking-wider block mt-0.5">
                      Pre-event launch phase
                    </span>
                  </div>

                  <div>
                    <span className="text-lg sm:text-xl font-bold font-heading text-white tracking-tight block leading-tight pt-1">
                      Open to All
                    </span>
                    <span className="text-xs text-gray-200 block mt-1 font-medium">
                      NIU Students 18+
                    </span>
                    <span className="text-[11px] text-gray-400 uppercase tracking-wider block mt-0.5">
                      Zero membership fee
                    </span>
                  </div>
                </>
              ) : (
                /* Event Mode Stat Row: Reads from DB */
                <>
                  <div>
                    <span className="text-2xl sm:text-3xl font-extrabold font-heading text-white tracking-tight">
                      {featuredEvent?.confirmed_count || 0}
                    </span>
                    <span className="text-xs text-gray-200 block mt-1 font-medium">
                      Attendees Registered
                    </span>
                  </div>

                  <div>
                    <span className="text-2xl sm:text-3xl font-extrabold font-heading text-white tracking-tight">
                      {featuredEvent?.agenda?.length || 0}
                    </span>
                    <span className="text-xs text-gray-200 block mt-1 font-medium">
                      Sessions Planned
                    </span>
                  </div>

                  <div>
                    <span className="text-2xl sm:text-3xl font-extrabold font-heading text-white tracking-tight">
                      {featuredEvent?.speakers?.length || 0}
                    </span>
                    <span className="text-xs text-gray-200 block mt-1 font-medium">
                      Industry Speakers
                    </span>
                  </div>

                  <div>
                    <span className="text-base sm:text-lg font-bold font-heading text-white tracking-tight truncate block pt-1">
                      {featuredEvent?.venue_name || featuredEvent?.platform || 'NIU Campus'}
                    </span>
                    <span className="text-xs text-[#C084FC] block mt-1 font-semibold">
                      {featuredEvent?.mode?.toUpperCase()} EVENT
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right Card: Either Founding Chapter Badge (Launch) or Live Countdown (Event) */}
          <div className="lg:col-span-4 flex justify-center">
            {isLaunchMode ? (
              <div className="bg-[#0D0721]/90 border border-purple-900/40 rounded-2xl p-6 sm:p-8 w-full max-w-sm space-y-6 shadow-2xl shadow-purple-950/40 relative overflow-hidden backdrop-blur-md">
                <div className="absolute top-0 right-0 w-36 h-36 bg-purple-600/15 rounded-full blur-2xl pointer-events-none" />

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[#C084FC] text-xs font-bold uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-[#A855F7]" />
                    <span>Student Community</span>
                  </div>
                  <h3 className="text-xl font-bold font-heading text-white">
                    Be a Founding Member
                  </h3>
                  <p className="text-sm text-gray-300 leading-relaxed font-normal">
                    Join our inaugural cohort during our founding semester. Connect directly with student organizers and help shape our workshops from day one.
                  </p>
                </div>

                <div className="p-4 bg-[#140A30] rounded-xl border border-purple-900/50 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between text-gray-300">
                    <span>Registration</span>
                    <span className="text-emerald-400 font-semibold">Open on Meetup</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-300">
                    <span>Eligibility</span>
                    <span className="text-white font-semibold">Any Learner 18+</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-300">
                    <span>Campus Host</span>
                    <span className="text-white font-semibold">Noida Intl University</span>
                  </div>
                </div>

                <a
                  href={cfg.meetupUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-[#7C3AED] via-[#8B5CF6] to-[#A855F7] hover:from-[#6D28D9] hover:to-[#9333EA] text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md shadow-purple-600/30 cursor-pointer"
                >
                  <span>RSVP & Join Group</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            ) : (
              /* Event Countdown Card */
              <div className="bg-[#0D0721]/90 border border-purple-900/40 rounded-2xl p-6 sm:p-8 backdrop-blur-md w-full max-w-sm space-y-6 shadow-2xl shadow-purple-950/40 relative overflow-hidden">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-[#C084FC] uppercase tracking-wider block">
                    Featured Event
                  </span>
                  <h3 className="text-lg font-bold font-heading text-white">
                    Countdown to Launch
                  </h3>
                </div>

                {isEventConcluded ? (
                  <div className="p-4 bg-[#140A30] rounded-xl border border-purple-900/50 text-center space-y-2">
                    <span className="text-sm font-bold text-white block">Event Concluded</span>
                    <p className="text-xs text-gray-400">See highlights and recap from this session.</p>
                  </div>
                ) : timeLeft ? (
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="bg-[#140A30] border border-purple-900/50 rounded-xl p-3">
                      <span className="text-2xl font-bold font-heading text-white tabular-nums block">
                        {String(timeLeft.days).padStart(2, '0')}
                      </span>
                      <span className="text-[9px] text-gray-400 uppercase tracking-widest font-semibold">
                        DAYS
                      </span>
                    </div>

                    <div className="bg-[#140A30] border border-purple-900/50 rounded-xl p-3">
                      <span className="text-2xl font-bold font-heading text-white tabular-nums block">
                        {String(timeLeft.hours).padStart(2, '0')}
                      </span>
                      <span className="text-[9px] text-gray-400 uppercase tracking-widest font-semibold">
                        HOURS
                      </span>
                    </div>

                    <div className="bg-[#140A30] border border-purple-900/50 rounded-xl p-3">
                      <span className="text-2xl font-bold font-heading text-white tabular-nums block">
                        {String(timeLeft.minutes).padStart(2, '0')}
                      </span>
                      <span className="text-[9px] text-gray-400 uppercase tracking-widest font-semibold">
                        MINS
                      </span>
                    </div>

                    <div className="bg-[#140A30] border border-purple-900/50 rounded-xl p-3">
                      <span className="text-2xl font-bold font-heading text-[#C084FC] tabular-nums block">
                        {String(timeLeft.seconds).padStart(2, '0')}
                      </span>
                      <span className="text-[9px] text-gray-400 uppercase tracking-widest font-semibold">
                        SECS
                      </span>
                    </div>
                  </div>
                ) : null}

                <div className="space-y-2 text-xs text-gray-400 pt-2 border-t border-[#24143D]">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#C084FC] shrink-0" />
                    <span className="text-gray-200">{featuredEvent ? formatDate(featuredEvent.event_date) : ''}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#C084FC] shrink-0" />
                    <span className="text-gray-200 truncate">{featuredEvent?.venue_name || featuredEvent?.platform}</span>
                  </div>
                </div>

                <Link
                  href={`/events/${featuredEvent?.slug}`}
                  className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-[#7C3AED] via-[#8B5CF6] to-[#A855F7] hover:from-[#6D28D9] hover:to-[#9333EA] text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md shadow-purple-600/30"
                >
                  <span>Register for Event</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
