import { Metadata } from 'next';
import { 
  Award, Globe, Share2, Users, HeartHandshake, 
  Sparkles, ExternalLink 
} from 'lucide-react';
import { siteConfig as staticSiteConfig } from '@/config/site';
import { getLiveSiteConfig } from '@/lib/siteSettings';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { db } from '@/lib/db';
import { SpeakerRegistrationForm } from '@/components/speaker-registration-form';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: `Speak at a Future Session | ${staticSiteConfig.shortName}`,
  description: `Express your interest to speak at upcoming AWS Student Builder Group sessions and workshops at Noida International University.`,
  openGraph: {
    title: `Call for Speakers | ${staticSiteConfig.shortName}`,
    description: `Share your cloud architecture, DevOps, AI, or cybersecurity expertise with student builders at Noida International University.`,
    url: '/cfp',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
  },
};

export default function CfpPage() {
  const siteConfig = getLiveSiteConfig();
  const featuredEvent = db.getFeaturedUpcomingEvent();

  const perks = [
    {
      title: "Official Speaker Certificate",
      desc: "Receive formal recognition from AWS Student Builder Group at NIU honoring your technical contribution.",
      icon: Award,
    },
    {
      title: "Website & Agenda Feature",
      desc: "Your profile, bio, talk title, and company branding featured across our official site and event pages.",
      icon: Globe,
    },
    {
      title: "Social & Community Promotion",
      desc: "Dedicated social announcements on Meetup, LinkedIn, and university networks reaching student developers.",
      icon: Share2,
    },
    {
      title: "Student & Academic Impact",
      desc: "Mentor aspiring cloud architects, share real-world engineering war stories, and inspire new builders.",
      icon: HeartHandshake,
    },
    {
      title: "Community Networking",
      desc: "Connect with faculty, AWS Community Builders, and tech enthusiasts across the Delhi NCR region.",
      icon: Users,
    },
    {
      title: "Personal Branding",
      desc: "Strengthen your reputation as an industry practitioner, community mentor, and public technical speaker.",
      icon: Sparkles,
    },
  ];

  const tracks = [
    "Cloud Computing",
    "AWS Architecture",
    "Serverless",
    "Containers & Kubernetes",
    "DevOps",
    "Generative AI",
    "Machine Learning",
    "Security",
    "Data Engineering",
    "Robotics",
    "Career Growth",
    "Open Source",
  ];

  const speakerFaqs = [
    {
      q: "Who can express interest to speak?",
      a: "We welcome AWS Community Builders, AWS Heroes, cloud architects, DevOps practitioners, software engineers, and experienced student builders who have hands-on knowledge to share.",
    },
    {
      q: "What talk formats do you support?",
      a: "We curate 30-minute technical sessions, 60-to-90 minute hands-on coding labs, and panel discussions.",
    },
    {
      q: "Is speaking in-person or online?",
      a: "We host both in-person workshops at our Noida International University campus auditorium and virtual webinars on Amazon Chime/Zoom for remote speakers.",
    },
    {
      q: "Is there a deadline to apply?",
      a: "During our launch phase, speaker interest is reviewed on a rolling basis for our inaugural calendar. We will contact you once a suitable date and track align with your topic.",
    },
  ];

  return (
    <div className="min-h-screen bg-transparent text-white flex flex-col">
      <Navbar featuredEvent={featuredEvent} config={siteConfig} />

      <main className="flex-1 pt-32 pb-24">
        <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 space-y-20">
          {/* Hero */}
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#24143D] bg-[#13092B] px-3.5 py-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#C084FC] shadow-[0_0_8px_#C084FC]" />
              <span className="text-xs font-semibold text-purple-200 uppercase tracking-wider">
                Call For Speakers • Rolling Review
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold font-heading text-white tracking-tight">
              Share Your Knowledge with <br />
              <span className="bg-gradient-to-r from-[#A855F7] via-[#C084FC] to-violet-200 bg-clip-text text-transparent">
                Student Builders at NIU
              </span>
            </h1>

            <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
              We invite engineers, researchers, AWS practitioners, and community leaders to present hands-on sessions, real architecture case studies, and career guidance.
            </p>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
              <a
                href="#speaker-registration-form"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#7C3AED] via-[#8B5CF6] to-[#A855F7] hover:brightness-110 text-white text-xs font-bold uppercase tracking-wider transition-all hover:scale-[1.02] shadow-lg shadow-purple-900/40 cursor-pointer"
              >
                <span>Express Interest to Speak</span>
                <Sparkles className="w-4 h-4 text-[#FF9900]" />
              </a>
            </div>
          </div>

          {/* Interactive Speaker Proposal & Registration Form */}
          <section className="max-w-4xl mx-auto">
            <SpeakerRegistrationForm tracks={tracks} />
          </section>

          {/* Why Speak Grid (Rendered ONCE) */}
          <section className="space-y-8">
            <div className="text-center space-y-2">
              <span className="text-xs font-bold text-[#C084FC] uppercase tracking-wider">Speaker Recognition</span>
              <h2 className="text-2xl sm:text-3xl font-bold font-heading text-white">Why Speak at Our Sessions?</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {perks.map((perk) => {
                const Icon = perk.icon;
                return (
                  <div
                    key={perk.title}
                    className="bg-[#0E0724] border border-[#24143D] rounded-xl p-6 hover:border-[#8B5CF6]/50 transition-all space-y-3 shadow-md"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#180C36] border border-[#24143D] flex items-center justify-center text-[#C084FC]">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-white font-heading">{perk.title}</h3>
                    <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-normal">{perk.desc}</p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Session Tracks */}
          <section className="bg-[#0E0724] border border-[#24143D] rounded-2xl p-8 sm:p-10 space-y-6 text-center shadow-lg">
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#C084FC] uppercase tracking-wider">Topic Areas</span>
              <h2 className="text-2xl font-bold font-heading text-white">Session Tracks We Welcome</h2>
              <p className="text-xs sm:text-sm text-gray-300 max-w-xl mx-auto">
                Aligned with our registered focus areas and high-demand student learning tracks.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-2.5 max-w-3xl mx-auto">
              {tracks.map((track) => (
                <span
                  key={track}
                  className="px-3.5 py-1.5 rounded-lg bg-[#180C36] border border-[#24143D] text-xs font-semibold text-purple-200 hover:text-white hover:border-[#8B5CF6]/60 transition"
                >
                  {track}
                </span>
              ))}
            </div>
          </section>

          {/* Speaker FAQs */}
          <section className="space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold font-heading text-white text-center">
              Speaker Questions &amp; Logistics
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {speakerFaqs.map((faq) => (
                <div key={faq.q} className="p-5 bg-[#0E0724] border border-[#24143D] rounded-xl space-y-2 shadow-sm">
                  <h3 className="text-sm font-bold text-white font-heading">{faq.q}</h3>
                  <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      <Footer config={siteConfig} />
    </div>
  );
}
