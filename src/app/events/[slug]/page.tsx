import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { siteConfig } from '@/config/site';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { EventDetailClient } from '@/components/event-detail-client';

interface EventPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = db.getEventBySlug(slug, true); // check if exists

  if (!event || event.status === 'draft') {
    return {
      title: `Event Not Found | ${siteConfig.shortName}`,
    };
  }

  return {
    title: `${event.title} | ${siteConfig.shortName}`,
    description: event.summary,
    openGraph: {
      title: `${event.title} | ${siteConfig.chapterName}`,
      description: event.summary,
      url: `/events/${event.slug}`,
      images: [{ url: event.banner_url || '/og-image.jpg', width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: event.title,
      description: event.summary,
      images: [event.banner_url || '/og-image.jpg'],
    },
  };
}

export default async function EventDetailPage({ params }: EventPageProps) {
  const { slug } = await params;
  const event = db.getEventBySlug(slug, false); // only published for public

  if (!event) {
    notFound();
  }

  const today = new Date().toISOString().split('T')[0];
  const isPast = event.event_date < today || event.status === 'completed';

  // Structured JSON-LD Schema
  const eventJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    description: event.summary,
    image: [event.banner_url || '/og-image.jpg'],
    startDate: `${event.event_date}T09:00:00+05:30`,
    endDate: `${event.event_date}T17:00:00+05:30`,
    eventAttendanceMode:
      event.mode === 'online'
        ? 'https://schema.org/OnlineEventAttendanceMode'
        : event.mode === 'hybrid'
        ? 'https://schema.org/MixedEventAttendanceMode'
        : 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus: isPast
      ? 'https://schema.org/EventCompleted'
      : 'https://schema.org/EventScheduled',
    location:
      event.mode === 'online'
        ? {
            '@type': 'VirtualLocation',
            url: siteConfig.meetupUrl,
          }
        : {
            '@type': 'Place',
            name: event.venue_name || 'Noida International University Campus',
            address: {
              '@type': 'PostalAddress',
              streetAddress: event.venue_address || 'Plot 1, Sector 17A, Yamuna Expressway',
              addressLocality: 'Greater Noida',
              addressRegion: 'Uttar Pradesh',
              postalCode: '203201',
              addressCountry: 'IN',
            },
          },
    organizer: {
      '@type': 'Organization',
      name: siteConfig.chapterName,
      url: siteConfig.meetupUrl,
    },
  };

  return (
    <div className="min-h-screen bg-transparent text-white flex flex-col">
      <Navbar featuredEvent={event} />

      {/* Inject JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }}
      />

      <main className="flex-1 pt-32 pb-16">
        <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
          <EventDetailClient event={event} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
