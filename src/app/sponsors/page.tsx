import { Metadata } from 'next';
import { 
  Check, Mail, ExternalLink, Sparkles, Target, 
  GraduationCap, TrendingUp, Cpu, Handshake 
} from 'lucide-react';
import { siteConfig as staticSiteConfig } from '@/config/site';
import { getLiveSiteConfig } from '@/lib/siteSettings';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: `Sponsorship & Partners | ${staticSiteConfig.shortName}`,
  description: `Partner with the AWS Student Builder Group at Noida International University. Support year-round student workshops, recruit emerging cloud talent, and shape technology education.`,
  openGraph: {
    title: `Sponsorship & Partners | ${staticSiteConfig.shortName}`,
    description: `Year-round community partnership opportunities for technology leaders and innovators.`,
    url: '/sponsors',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
  },
};

export default function SponsorsPage() {
  const siteConfig = getLiveSiteConfig();
  const featuredEvent = db.getFeaturedUpcomingEvent();
  const { sponsorTiers, sponsorComparison, memberCountSnapshot, snapshotAsOf, focusAreas } = siteConfig;

  const whySponsorPoints = [
    {
      title: "Direct Access to Student Cloud Talent",
      desc: "Connect with passionate software, cloud, and AI engineering students from Noida International University actively building AWS projects.",
      icon: Target,
    },
    {
      title: "Year-Round Brand Visibility",
      desc: "Prominent brand placement across our website, session materials, live demos, and community banners throughout the academic year.",
      icon: TrendingUp,
    },
    {
      title: "Technical Speaking & Workshop Privileges",
      desc: "Showcase your engineering stack, developer tools, or platforms via hands-on labs and tech talks to receptive learners.",
      icon: Cpu,
    },
    {
      title: "Recruitment & Talent Pipeline",
      desc: "Access an opt-in talent roster of active builders, ideal for internships, cloud architect apprenticeships, and early career roles.",
      icon: GraduationCap,
    },
    {
      title: "Corporate Social & Academic Impact",
      desc: "Support open technology literacy and bridge the gap between curriculum and real industry demands in Delhi NCR.",
      icon: Handshake,
    },
    {
      title: "Permanent Founding Partner Heritage",
      desc: "Founding partners are permanently recognized in community history and honored across all major inaugural milestone events.",
      icon: Sparkles,
    },
  ];

  const whoAttendsChips = [
    "Undergraduate Engineering Students (CSE/IT)",
    "Cloud Architecture Aspirants",
    "Cybersecurity Enthusiasts",
    "AI & Machine Learning Developers",
    "Open Source Contributors",
    "Faculty Mentors & Researchers",
    "Aspiring AWS Certified Practitioners",
    "Delhi NCR Student Tech Communities",
  ];

  return (
    <div className="min-h-screen bg-transparent text-white flex flex-col">
      <Navbar featuredEvent={featuredEvent} config={siteConfig} />

      <main className="flex-1 pt-32 pb-24">
        <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 space-y-24">
          {/* Hero */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#24143D] bg-[#13092B] px-3.5 py-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#C084FC] shadow-[0_0_8px_#C084FC]" />
              <span className="text-xs font-semibold text-purple-200 uppercase tracking-wider">
                Year-Round Community Partnership
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold font-heading text-white tracking-tight">
              Partner with the Next Generation of <br />
              <span className="bg-gradient-to-r from-[#A855F7] via-[#C084FC] to-violet-200 bg-clip-text text-transparent">
                Cloud Builders
              </span>
            </h1>

            <p className="text-sm sm:text-base text-gray-300 leading-relaxed font-normal">
              Empower student innovation at Noida International University. Support year-round hands-on workshops, cloud labs, and hackathons while connecting with motivated student engineers.
            </p>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
              <a
                href={siteConfig.formLinks.sponsorForm}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#7C3AED] via-[#8B5CF6] to-[#A855F7] hover:brightness-110 text-white text-xs font-bold uppercase tracking-wider transition-all hover:scale-[1.02] shadow-lg shadow-purple-900/30 inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Express Partnership Interest</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <a
                href={`mailto:${siteConfig.officialEmail}`}
                className="px-6 py-3.5 rounded-xl bg-[#180C36] hover:bg-[#201045] border border-[#24143D] text-purple-200 text-xs font-semibold uppercase tracking-wider transition-all inline-flex items-center gap-2"
              >
                <Mail className="w-4 h-4 text-[#C084FC]" />
                <span>Contact Official Email</span>
              </a>
            </div>
          </div>

          {/* Honest Community Snapshot */}
          <section className="bg-[#0E0724] border border-[#24143D] rounded-2xl p-8 sm:p-10 shadow-xl">
            <div className="text-center max-w-2xl mx-auto space-y-2 mb-8">
              <span className="text-xs font-bold text-[#C084FC] uppercase tracking-wider">Verified Community Metrics</span>
              <h2 className="text-xl sm:text-2xl font-bold font-heading text-white">Authentic Community Overview</h2>
              <p className="text-xs sm:text-sm text-gray-300">
                Driven strictly from verified registration records. We believe in transparent partnership with zero inflated claims.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-[#24143D]">
              <div className="space-y-1 pt-4 md:pt-0">
                <span className="text-3xl sm:text-4xl font-extrabold font-heading text-white">{memberCountSnapshot}</span>
                <span className="text-xs text-gray-300 block font-medium">Founding Members</span>
                <span className="text-xs text-[#C084FC] font-semibold uppercase">Snapshot as of {snapshotAsOf}</span>
              </div>

              <div className="space-y-1 pt-4 md:pt-0">
                <span className="text-3xl sm:text-4xl font-extrabold font-heading text-white">{focusAreas.length}</span>
                <span className="text-xs text-gray-300 block font-medium">Technical Focus Domains</span>
                <span className="text-xs text-gray-400 uppercase">Registered on Meetup</span>
              </div>

              <div className="space-y-1 pt-4 md:pt-0">
                <span className="text-3xl sm:text-4xl font-extrabold font-heading text-white">Sep 2026</span>
                <span className="text-xs text-gray-300 block font-medium">Founded</span>
                <span className="text-xs text-gray-400 uppercase">Inaugural Academic Cohort</span>
              </div>

              <div className="space-y-1 pt-4 md:pt-0">
                <span className="text-3xl sm:text-4xl font-extrabold font-heading text-white">Greater Noida</span>
                <span className="text-xs text-gray-300 block font-medium">NIU Host Campus</span>
                <span className="text-xs text-gray-400 uppercase">Delhi NCR Hub</span>
              </div>
            </div>
          </section>

          {/* Why Sponsor Grid */}
          <section className="space-y-8">
            <div className="text-center space-y-2 max-w-2xl mx-auto">
              <span className="text-xs font-bold text-[#C084FC] uppercase tracking-wider">Partner Value</span>
              <h2 className="text-2xl sm:text-3xl font-bold font-heading text-white">Why Partner with Us?</h2>
              <p className="text-xs sm:text-sm text-gray-300">
                Help build high-caliber cloud literacy while gaining direct developer engagement.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {whySponsorPoints.map((pt) => {
                const Icon = pt.icon;
                return (
                  <div key={pt.title} className="bg-[#0E0724] border border-[#24143D] rounded-xl p-6 space-y-3 hover:border-[#8B5CF6]/50 transition-all shadow-md">
                    <div className="w-10 h-10 rounded-lg bg-[#180C36] border border-[#24143D] flex items-center justify-center text-[#C084FC]">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-white font-heading">{pt.title}</h3>
                    <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-normal">{pt.desc}</p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Who Attends */}
          <section className="bg-[#0E0724] border border-[#24143D] rounded-2xl p-8 space-y-6 text-center shadow-lg">
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#C084FC] uppercase tracking-wider">Audience Profile</span>
              <h2 className="text-2xl font-bold font-heading text-white">Who Participates in Our Sessions?</h2>
            </div>

            <div className="flex flex-wrap justify-center gap-2.5 max-w-3xl mx-auto">
              {whoAttendsChips.map((chip) => (
                <span
                  key={chip}
                  className="px-3.5 py-1.5 rounded-lg bg-[#180C36] border border-[#24143D] text-xs font-semibold text-purple-200"
                >
                  {chip}
                </span>
              ))}
            </div>
          </section>

          {/* 4 Sponsorship Tiers */}
          <section className="space-y-8">
            <div className="text-center space-y-2 max-w-2xl mx-auto">
              <span className="text-xs font-bold text-[#C084FC] uppercase tracking-wider">Partnership Packages</span>
              <h2 className="text-2xl sm:text-3xl font-bold font-heading text-white">Year-Round Partnership Tiers</h2>
              <p className="text-xs sm:text-sm text-gray-300">
                Customizable sponsorship packages supporting student builders throughout the academic year.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {sponsorTiers.map((tier) => (
                <div
                  key={tier.name}
                  className={`bg-[#0E0724] border rounded-2xl p-6 flex flex-col justify-between space-y-6 relative transition-all duration-300 shadow-xl ${
                    tier.isPopular ? 'border-[#A855F7] shadow-lg shadow-purple-900/30' : 'border-[#24143D] hover:border-[#8B5CF6]/50'
                  }`}
                >
                  {tier.isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#7C3AED] to-[#A855F7] text-white text-[10px] font-extrabold uppercase tracking-widest px-3 py-0.5 rounded-full shadow-md">
                      Recommended
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-base font-bold text-white font-heading">{tier.name}</h3>
                      <div className="text-sm font-semibold text-[#C084FC] mt-1">{tier.price}</div>
                      <span className="text-[11px] text-gray-400 block mt-0.5">{tier.passes} included</span>
                    </div>

                    <p className="text-xs text-gray-300 leading-relaxed">{tier.description}</p>

                    <div className="pt-4 border-t border-[#24143D] space-y-2.5">
                      <span className="text-[11px] font-bold text-purple-200 uppercase tracking-wider block">Key Benefits</span>
                      {tier.benefits.map((b) => (
                        <div key={b} className="flex items-start gap-2 text-xs text-gray-300">
                          <Check className="w-3.5 h-3.5 text-[#C084FC] shrink-0 mt-0.5" />
                          <span>{b}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <a
                    href={siteConfig.formLinks.sponsorForm}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider text-center transition block cursor-pointer ${
                      tier.isPopular
                        ? 'bg-gradient-to-r from-[#7C3AED] via-[#8B5CF6] to-[#A855F7] hover:brightness-110 text-white shadow-lg shadow-purple-900/30'
                        : 'bg-[#180C36] hover:bg-[#201045] text-purple-200 border border-[#24143D]'
                    }`}
                  >
                    Select Tier
                  </a>
                </div>
              ))}
            </div>
          </section>

          {/* Comparison Matrix Table */}
          <section className="bg-[#0E0724] border border-[#24143D] rounded-2xl overflow-hidden shadow-xl space-y-4 p-6 sm:p-8">
            <div className="border-b border-[#24143D] pb-4">
              <h3 className="text-lg font-bold font-heading text-white">Tier Benefits Comparison</h3>
              <p className="text-xs text-gray-400 mt-0.5">Comprehensive breakdown of deliverables across partnership tiers.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#13092B] text-purple-200 uppercase tracking-wider border-b border-[#24143D]">
                  <tr>
                    <th className="px-5 py-3">Benefit Deliverable</th>
                    <th className="px-4 py-3 text-center">Bronze</th>
                    <th className="px-4 py-3 text-center">Silver</th>
                    <th className="px-4 py-3 text-center text-[#C084FC]">Gold</th>
                    <th className="px-4 py-3 text-center text-purple-200">Diamond</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1F103A]">
                  {sponsorComparison.map((row, idx) => (
                    <tr key={idx} className="hover:bg-[#13092B]/50 transition">
                      <td className="px-5 py-3.5 font-medium text-white">{row.benefit}</td>
                      <td className="px-4 py-3.5 text-center">
                        {typeof row.bronze === 'boolean' ? (
                          row.bronze ? <Check className="w-4 h-4 text-[#C084FC] mx-auto" /> : <span className="text-gray-600">—</span>
                        ) : (
                          <span className="text-gray-300 font-semibold">{row.bronze}</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        {typeof row.silver === 'boolean' ? (
                          row.silver ? <Check className="w-4 h-4 text-[#C084FC] mx-auto" /> : <span className="text-gray-600">—</span>
                        ) : (
                          <span className="text-gray-300 font-semibold">{row.silver}</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-center bg-purple-900/10">
                        {typeof row.gold === 'boolean' ? (
                          row.gold ? <Check className="w-4 h-4 text-[#C084FC] mx-auto" /> : <span className="text-gray-600">—</span>
                        ) : (
                          <span className="text-[#C084FC] font-bold">{row.gold}</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        {typeof row.diamond === 'boolean' ? (
                          row.diamond ? <Check className="w-4 h-4 text-purple-300 mx-auto" /> : <span className="text-gray-600">—</span>
                        ) : (
                          <span className="text-purple-300 font-bold">{row.diamond}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Contact Box with Official Email ONLY */}
          <section className="bg-gradient-to-r from-[#0E0724] via-[#1B0C3D] to-[#0E0724] border border-purple-500/30 rounded-2xl p-8 sm:p-12 text-center space-y-6 shadow-xl">
            <div className="space-y-2 max-w-xl mx-auto">
              <span className="text-xs font-bold text-[#C084FC] uppercase tracking-wider">Official Communications</span>
              <h2 className="text-2xl sm:text-3xl font-bold font-heading text-white">Discuss a Custom Partnership</h2>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                We are open to tailored collaborations including co-branded student hackathons, dedicated cloud compute sponsorship, and certification grants.
              </p>
            </div>

            <div className="p-4 bg-[#13092B] rounded-xl border border-[#24143D] max-w-md mx-auto flex items-center justify-center gap-3 text-xs">
              <Mail className="w-4 h-4 text-[#C084FC]" />
              <span className="font-semibold text-white select-all">{siteConfig.officialEmail}</span>
            </div>

            <p className="text-[11px] text-gray-400 max-w-md mx-auto">
              All communications are routed strictly through our designated institutional channels.
            </p>
          </section>
        </div>
      </main>

      <Footer config={siteConfig} />
    </div>
  );
}
