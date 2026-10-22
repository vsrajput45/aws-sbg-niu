import { 
  Laptop, Award, Users, Network, Briefcase, 
  FileCheck, GitBranch, Rocket, Sparkles, ExternalLink 
} from 'lucide-react';
import { siteConfig } from '@/config/site';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Laptop,
  Award,
  Users,
  Network,
  Briefcase,
  FileCheck,
  GitBranch,
  Rocket,
};

export function WhyJoin({ config }: { config?: typeof siteConfig } = {}) {
  const cfg = config || siteConfig;
  const { whyJoinCards } = cfg;

  return (
    <section id="why-join" className="py-24 sm:py-32 bg-[#000000]/80 backdrop-blur-[2px] border-b border-[#262626]">
      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 space-y-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#262626] bg-[#0A0A0A] px-3.5 py-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#FF9900]" />
            <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
              Member Value
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading text-white tracking-tight">
            Why Join AWS SBG NIU?
          </h2>

          <p className="text-sm sm:text-base text-gray-200 leading-relaxed">
            More than just another club: an authentic student builder incubator preparing you for enterprise cloud architecture and impactful careers.
          </p>
        </div>

        {/* 8 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {whyJoinCards.map((card) => {
            const Icon = iconMap[card.icon] || Rocket;
            return (
              <div
                key={card.title}
                className="bg-[#0D0D0D] border border-[#262626] rounded-xl p-5 hover:border-[#FF9900]/50 hover:bg-[#121212] transition-all duration-200 group space-y-3"
              >
                <div className="w-10 h-10 rounded-lg bg-[#181818] border border-[#262626] flex items-center justify-center text-[#FF9900] group-hover:scale-110 transition-transform">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white font-heading group-hover:text-[#FF9900] transition-colors">
                  {card.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-200 leading-relaxed font-normal">
                  {card.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Founding Member Callout Band */}
        <div className="relative rounded-2xl bg-[#111111] border border-[#FF9900]/40 p-8 sm:p-10 overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#FF9900]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2 text-xs font-bold text-[#FF9900] uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>Inaugural Cohort</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold font-heading text-white">
                Join in our founding semester — help shape our community from day one.
              </h3>
              <p className="text-xs sm:text-sm text-gray-200 leading-relaxed">
                Founding members enjoy early access to workshops, priority selection for AWS Community Day attendee badges, and leadership roles in specialized technical study circles.
              </p>
            </div>

            <a
              href={cfg.meetupUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-lg bg-[#FF9900] hover:bg-[#FFAA22] text-black text-xs font-bold uppercase tracking-wider transition-all hover:scale-[1.02] shadow-lg shadow-[#FF9900]/25 inline-flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <span>Be a Founding Member</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
