import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, MapPin, ArrowRight, ExternalLink } from 'lucide-react';
import { db } from '@/lib/db';
import { siteConfig } from '@/config/site';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: `Events & Workshops | ${siteConfig.shortName}`,
  description: `Discover upcoming hands-on cloud workshops, architectural sessions, and technical meetups by the AWS Student Builder Group at Noida International University.`,
  openGraph: {
    title: `Events & Workshops | ${siteConfig.shortName}`,
    description: `Upcoming technical workshops and cloud sessions at Noida International University.`,
    url: '/events',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
  },
};

export default function EventsListingPage() {
  const publishedEvents = db.getAllEvents(false); // Only published events
  const today = new Date().toISOString().split('T')[0];

  const upcomingEvents = publishedEvents
    .filter((e) => e.event_date >= today && e.status === 'published')
    .sort((a, b) => a.event_date.localeCompare(b.event_date));

  const pastEvents = publishedEvents
    .filter((e) => e.event_date < today || e.status === 'completed')
    .sort((a, b) => b.event_date.localeCompare(a.event_date));

  const featuredEvent = db.getFeaturedUpcomingEvent();

  return (
    <div className="min-h-screen bg-transparent text-white flex flex-col">
      <Navbar featuredEvent={featuredEvent} />

      <main className="flex-1 pt-32 pb-20">
        <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 space-y-12">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#24143D] bg-[#13092B] px-3.5 py-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#C084FC] shadow-[0_0_8px_#C084FC]" />
              <span className="text-xs font-semibold text-purple-200 uppercase tracking-wider">
                Hands-on Technical Sessions
              </span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold font-heading bg-gradient-to-r from-white via-purple-100 to-[#C084FC] bg-clip-text text-transparent tracking-tight">
              Events &amp; Workshops
            </h1>
            <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
              Explore in-person architectural labs, cloud bootcamps, and expert sessions organized by student builders at Noida International University.
            </p>
          </div>

          {/* Upcoming Section */}
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-[#24143D] pb-4">
              <h2 className="text-xl font-bold font-heading text-white">Upcoming Sessions</h2>
              <span className="text-xs text-purple-300 font-medium">{upcomingEvents.length} upcoming</span>
            </div>

            {upcomingEvents.length === 0 ? (
              /* Designed Empty State */
              <div className="bg-[#0E0724] border border-[#24143D] rounded-2xl p-10 sm:p-14 text-center max-w-2xl mx-auto space-y-5 my-8 shadow-xl">
                <div className="w-14 h-14 rounded-full bg-[#180C36] border border-[#8B5CF6]/30 flex items-center justify-center mx-auto text-[#C084FC] shadow-[0_0_20px_rgba(168,85,247,0.2)]">
                  <Calendar className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold font-heading text-white">Our First Session is Being Planned</h3>
                  <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-normal">
                    Founded in September 2026, our student team is actively curating our inaugural hands-on cloud workshop. Join the verified Meetup group to get notified the minute the date and registration drop.
                  </p>
                </div>
                <div className="pt-2">
                  <a
                    href={siteConfig.meetupUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-[#7C3AED] via-[#8B5CF6] to-[#A855F7] hover:brightness-110 text-white text-xs font-bold uppercase tracking-wider transition-all hover:scale-[1.02] shadow-lg shadow-purple-900/30"
                  >
                    <span>Join Us on Meetup</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingEvents.map((evt) => {
                  const capacity = evt.capacity || 0;
                  const confirmed = evt.confirmed_count || 0;
                  const seatsLeft = capacity ? Math.max(0, capacity - confirmed) : null;
                  const isFull = capacity > 0 && confirmed >= capacity;

                  return (
                    <div
                      key={evt.id}
                      className="bg-[#0E0724] border border-[#24143D] rounded-xl overflow-hidden hover:border-[#8B5CF6]/60 transition-all duration-300 flex flex-col group shadow-lg"
                    >
                      {/* Event Banner */}
                      <div className="relative h-48 w-full bg-[#180C36] overflow-hidden">
                        <Image
                          src={evt.banner_url || '/hero.jpg'}
                          alt={evt.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0E0724] via-transparent to-black/40" />
                        <div className="absolute top-3 left-3 flex gap-2">
                          <span className="px-2.5 py-1 rounded bg-[#070312]/80 backdrop-blur-sm border border-purple-500/20 text-[10px] font-bold uppercase tracking-wider text-[#C084FC]">
                            {evt.category}
                          </span>
                          <span className="px-2.5 py-1 rounded bg-[#070312]/80 backdrop-blur-sm border border-white/10 text-[10px] font-bold uppercase tracking-wider text-gray-300 capitalize">
                            {evt.mode}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-xs text-[#C084FC] font-semibold">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{formatDate(evt.event_date)}</span>
                            <span>•</span>
                            <span>{evt.start_time}</span>
                          </div>

                          <h3 className="text-lg font-bold text-white font-heading group-hover:text-[#C084FC] transition-colors line-clamp-2">
                            {evt.title}
                          </h3>

                          <p className="text-xs text-gray-300 line-clamp-2">
                            {evt.summary}
                          </p>
                        </div>

                        <div className="pt-4 border-t border-[#1F103A] space-y-3">
                          <div className="flex items-center justify-between text-xs text-gray-400">
                            <span className="flex items-center gap-1.5 truncate max-w-[180px]">
                              <MapPin className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                              <span className="truncate">{evt.venue_name || evt.platform || 'Auditorium'}</span>
                            </span>

                            <span className="text-[11px] font-medium text-purple-300">
                              {isFull ? (
                                <span className="text-amber-400">Waitlist Active</span>
                              ) : seatsLeft !== null ? (
                                <span>{seatsLeft} seats left</span>
                              ) : (
                                <span>Open RSVP</span>
                              )}
                            </span>
                          </div>

                          <Link
                            href={`/events/${evt.slug}`}
                            className="w-full py-2.5 px-4 rounded-lg bg-[#180C36] hover:bg-gradient-to-r hover:from-[#7C3AED] hover:to-[#A855F7] border border-[#24143D] text-purple-200 hover:text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
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
          </section>

          {/* Past Events Section (shown only when completed events exist) */}
          {pastEvents.length > 0 && (
            <section className="space-y-6 pt-10 border-t border-[#24143D]">
              <div className="flex items-center justify-between border-b border-[#24143D] pb-4">
                <h2 className="text-xl font-bold font-heading text-white">Past Sessions & Highlights</h2>
                <span className="text-xs text-gray-400">{pastEvents.length} concluded</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pastEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className="bg-[#0E0724]/70 border border-[#24143D] rounded-xl overflow-hidden p-5 space-y-3 opacity-90"
                  >
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>{formatDate(evt.event_date)}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#180C36] text-purple-200 border border-[#24143D]">
                        Concluded
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white font-heading">{evt.title}</h3>
                    <p className="text-xs text-gray-300 line-clamp-2">{evt.summary}</p>

                    <div className="pt-3 border-t border-[#1F103A] flex items-center justify-between text-xs text-gray-400">
                      <span>{evt.confirmed_count || 0} Attendees Checked-in</span>
                      <Link href={`/events/${evt.slug}`} className="text-[#C084FC] hover:underline">
                        Recap →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
