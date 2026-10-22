import { Metadata } from 'next';
import { db } from '@/lib/db';
import { siteConfig as staticSiteConfig } from '@/config/site';
import { getLiveSiteConfig } from '@/lib/siteSettings';
import { Navbar } from '@/components/navbar';
import { Hero } from '@/components/hero';
import { Marquee } from '@/components/marquee';
import { About } from '@/components/about';
import { FocusAreas } from '@/components/focus-areas';
import { WhyJoin } from '@/components/why-join';
import { EventsSection } from '@/components/events-section';
import { SpeakersSection } from '@/components/speakers-section';
import { AgendaSection } from '@/components/agenda-section';
import { TeamSection } from '@/components/team-section';
import { VenueSection } from '@/components/venue-section';
import { FaqSection } from '@/components/faq-section';
import { CtaSection } from '@/components/cta-section';
import { Footer } from '@/components/footer';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: `${staticSiteConfig.shortName} | AWS Student Builder Group at Noida International University`,
  description: `Official website for the AWS Student Builder Group at Noida International University, Greater Noida, UP. Student-led community for cloud computing, AI, security, and hands-on AWS projects.`,
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: `${staticSiteConfig.shortName} | Noida International University`,
    description: `Official website for AWS Student Builder Group at Noida International University. Learn, build, and innovate with Amazon Web Services.`,
    url: '/',
    siteName: staticSiteConfig.chapterName,
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: `${staticSiteConfig.shortName} Banner`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: staticSiteConfig.shortName,
    description: `Student-led cloud community at Noida International University.`,
    images: ['/og-image.jpg'],
  },
};

export default function HomePage() {
  const siteConfig = getLiveSiteConfig();
  // Read database for published upcoming featured event
  const featuredEvent = db.getFeaturedUpcomingEvent();
  const allPublishedEvents = db.getAllEvents(false);

  // Organization + WebSite JSON-LD Schema
  const chapterJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': 'https://aws-sbg-niu.ac.in/#website',
        name: siteConfig.chapterName,
        url: 'https://aws-sbg-niu.ac.in',
        description: siteConfig.tagline,
      },
      {
        '@type': 'Organization',
        '@id': 'https://aws-sbg-niu.ac.in/#organization',
        name: siteConfig.chapterName,
        alternateName: siteConfig.shortName,
        foundingDate: siteConfig.foundedDate,
        parentOrganization: {
          '@type': 'Organization',
          name: 'AWS Student Builder Groups',
        },
        sameAs: [siteConfig.meetupUrl],
        contactPoint: {
          '@type': 'ContactPoint',
          email: siteConfig.officialEmail,
          contactType: 'Community Lead',
        },
      },
    ],
  };

  return (
    <div className="min-h-screen bg-transparent text-white flex flex-col">
      {/* Chapter JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(chapterJsonLd) }}
      />

      {/* Navbar with dynamic state */}
      <Navbar featuredEvent={featuredEvent} config={siteConfig} />

      <main className="flex-1">
        {/* 1. Hero (Launch mode by default; switches to Event mode when DB has published event) */}
        <Hero featuredEvent={featuredEvent} config={siteConfig} />

        {/* 2. Infinite Marquee */}
        <Marquee topics={siteConfig.marqueeTopics} />

        {/* 3. About the Chapter */}
        <About config={siteConfig.aboutSource} />

        {/* 4. Focus Areas */}
        <FocusAreas />

        {/* 5. Why Join */}
        <WhyJoin config={siteConfig} />

        {/* 6. Events (Database Driven - Designed empty state while 0 events) */}
        <EventsSection events={allPublishedEvents} />

        {/* 7. Featured Speakers (Rendered only if featured event has speakers) */}
        {featuredEvent && (
          <SpeakersSection
            speakers={featuredEvent.speakers}
            eventTitle={featuredEvent.title}
          />
        )}

        {/* 8. Featured Agenda (Rendered only if featured event has agenda) */}
        {featuredEvent && (
          <AgendaSection
            agenda={featuredEvent.agenda}
            eventTitle={featuredEvent.title}
          />
        )}

        {/* 9. Core Team */}
        <TeamSection />

        {/* 10. Venue */}
        <VenueSection venueName={featuredEvent?.venue_name} config={siteConfig} />

        {/* 11. FAQ Accordion */}
        <FaqSection />

        {/* 12. Final CTA Band */}
        <CtaSection config={siteConfig} />
      </main>

      {/* Footer */}
      <Footer config={siteConfig} />
    </div>
  );
}
