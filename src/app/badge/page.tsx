import { Metadata } from 'next';
import { siteConfig as staticSiteConfig } from '@/config/site';
import { getLiveSiteConfig } from '@/lib/siteSettings';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { BadgeCanvas } from '@/components/badge-canvas';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: `Generate Your Community Badge | ${staticSiteConfig.shortName}`,
  description: `Create and download your official customized attendee, member, speaker, or volunteer badge for the AWS Student Builder Group at Noida International University.`,
  openGraph: {
    title: `Badge Generator | ${staticSiteConfig.shortName}`,
    description: `Customize and download your 1080x1350 community badge with #AWSSBGNIU.`,
    url: '/badge',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
  },
};

interface BadgePageProps {
  searchParams: Promise<{ name?: string; role?: string; email?: string }>;
}

export default async function BadgePage({ searchParams }: BadgePageProps) {
  await db.ensureLoaded();
  const { name, role, email } = await searchParams;
  const siteConfig = getLiveSiteConfig();
  const featuredEvent = db.getFeaturedUpcomingEvent();

  return (
    <div className="min-h-screen bg-transparent text-white flex flex-col">
      <Navbar featuredEvent={featuredEvent} config={siteConfig} />

      <main className="flex-1 pt-32 pb-24">
        <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 space-y-12">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#FF9900]/30 bg-[#FF9900]/10 px-3.5 py-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#FF9900] shadow-[0_0_8px_#FF9900]" />
              <span className="text-xs font-semibold text-[#FFB84D] uppercase tracking-wider">
                Official AWS Builder Pass
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold font-heading bg-gradient-to-r from-white via-slate-100 to-[#FF9900] bg-clip-text text-transparent tracking-tight">
              AWS Community Badge Generator
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Design and export your personalized high-resolution conference credential for LinkedIn, X, and event check-in.
            </p>
          </div>

          <BadgeCanvas
            initialName={name}
            initialRole={role}
            initialEmail={email}
          />
        </div>
      </main>

      <Footer config={siteConfig} />
    </div>
  );
}
