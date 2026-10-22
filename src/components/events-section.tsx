import Link from 'next/link';
import Image from 'next/image';
import { Calendar, MapPin, ArrowRight, ExternalLink } from 'lucide-react';
import { EventRecord } from '@/lib/db/types';
import { siteConfig } from '@/config/site';
import { formatDate } from '@/lib/utils';

interface EventsSectionProps {
  events: EventRecord[];
}

export function EventsSection({ events }: EventsSectionProps) {
  const today = new Date().toISOString().split('T')[0];

  const upcomingEvents = events
    .filter((e) => e.event_date >= today && e.status === 'published')
    .sort((a, b) => a.event_date.localeCompare(b.event_date));

  return (
    <section id="events" className="py-24 sm:py-32 bg-[#000000]/80 backdrop-blur-[2px] border-b border-[#262626]">
      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 space-y-16">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#262626] bg-[#0A0A0A] px-3.5 py-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#FF9900]" />
            <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
              Community Calendar
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading text-white tracking-tight">
            Events &amp; Workshops
          </h2>

          <p className="text-sm sm:text-base text-gray-200 leading-relaxed">
            Real-world technical masterclasses, hack nights, and certification circles at Noida International University.
          </p>
        </div>

        {upcomingEvents.length === 0 ? (
          /* Designed Empty State */
          <div className="bg-[#0D0D0D] border border-[#262626] rounded-2xl p-10 sm:p-14 text-center max-w-2xl mx-auto space-y-6 shadow-xl">
            <div className="w-16 h-16 rounded-full bg-[#FF9900]/10 border border-[#FF9900]/30 flex items-center justify-center mx-auto text-[#FF9900]">
              <Calendar className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-bold font-heading text-white">
                Our first session is being planned
              </h3>
              <p className="text-xs sm:text-sm text-gray-200 leading-relaxed max-w-lg mx-auto">
                The core team and faculty mentors are putting the final touches on our inaugural hands-on cloud lab. Join our Meetup group to get notified the day it drops.
              </p>
            </div>

            <div className="pt-2">
              <a
                href={siteConfig.meetupUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#FF9900] hover:bg-[#FFAA22] text-black text-xs font-bold uppercase tracking-wider transition-all hover:scale-[1.02] shadow-lg shadow-[#FF9900]/25 cursor-pointer"
              >
                <span>Join Us on Meetup</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        ) : (
          /* Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.map((evt) => {
              const capacity = evt.capacity || 0;
              const confirmed = evt.confirmed_count || 0;
              const seatsLeft = capacity ? Math.max(0, capacity - confirmed) : null;
              const isFull = capacity > 0 && confirmed >= capacity;

              return (
                <div
                  key={evt.id}
                  className="bg-[#0D0D0D] border border-[#262626] rounded-xl overflow-hidden hover:border-[#FF9900]/60 transition-all duration-300 flex flex-col group shadow-lg"
                >
                  <div className="relative h-48 w-full bg-[#181818] overflow-hidden">
                    <Image
                      src={evt.banner_url || '/hero.jpg'}
                      alt={evt.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D] via-transparent to-black/40" />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="px-2.5 py-1 rounded bg-black/80 backdrop-blur-sm border border-white/10 text-[10px] font-bold uppercase tracking-wider text-[#FF9900]">
                        {evt.category}
                      </span>
                      <span className="px-2.5 py-1 rounded bg-black/80 backdrop-blur-sm border border-white/10 text-[10px] font-bold uppercase tracking-wider text-gray-200 capitalize">
                        {evt.mode}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-[#FF9900] font-semibold">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{formatDate(evt.event_date)}</span>
                        <span>•</span>
                        <span>{evt.start_time}</span>
                      </div>

                      <h3 className="text-lg font-bold text-white font-heading group-hover:text-[#FF9900] transition-colors line-clamp-2">
                        {evt.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-gray-200 line-clamp-2">
                        {evt.summary}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-[#1F1F1F] space-y-3">
                      <div className="flex items-center justify-between text-xs text-gray-300">
                        <span className="flex items-center gap-1.5 truncate max-w-[170px]">
                          <MapPin className="w-3.5 h-3.5 text-[#FF9900] shrink-0" />
                          <span className="truncate">{evt.venue_name || evt.platform || 'Auditorium'}</span>
                        </span>

                        <span className="text-xs font-medium text-gray-300">
                          {isFull ? (
                            <span className="text-amber-400 font-semibold">Waitlist Active</span>
                          ) : seatsLeft !== null ? (
                            <span>{seatsLeft} seats left</span>
                          ) : (
                            <span>Open RSVP</span>
                          )}
                        </span>
                      </div>

                      <Link
                        href={`/events/${evt.slug}`}
                        className="w-full py-2.5 px-4 rounded-lg bg-[#181818] hover:bg-[#FF9900] text-white hover:text-black text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
                      >
                        <span>View Details & RSVP</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
