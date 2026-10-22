import { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { BadgeCanvas } from '@/components/badge-canvas';
import { db } from '@/lib/db';

export const metadata: Metadata = {
  title: `Generate Your Community Badge | ${siteConfig.shortName}`,
  description: `Create and download your official customized attendee, member, speaker, or volunteer badge for the AWS Student Builder Group at Noida International University.`,
  openGraph: {
    title: `Badge Generator | ${siteConfig.shortName}`,
    description: `Customize and download your 1080x1350 community badge with #AWSSBGNIU.`,
    url: '/badge',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
  },
};

interface BadgePageProps {
  searchParams: Promise<{ name?: string; role?: string }>;
}

export default async function BadgePage({ searchParams }: BadgePageProps) {
  const { name, role } = await searchParams;
  const featuredEvent = db.getFeaturedUpcomingEvent();

  return (
    <div className="min-h-screen bg-transparent text-white flex flex-col">
      <Navbar featuredEvent={featuredEvent} />

      <main className="flex-1 pt-32 pb-24">
        <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 space-y-12">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#262626] bg-[#0A0A0A] px-3.5 py-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#FF9900]" />
              <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Official Digital Pass
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold font-heading text-white tracking-tight">
              Community Badge Generator
            </h1>

            <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
              Generate your personalized high-resolution pass for social media, networking, and community participation.
            </p>
          </div>

          <BadgeCanvas
            initialName={name}
            initialRole={role}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
