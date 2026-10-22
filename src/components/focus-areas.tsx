import { Cloud, ShieldCheck, Cpu, Brain, Bot, BarChart3 } from 'lucide-react';
import { siteConfig } from '@/config/site';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Cloud,
  ShieldCheck,
  Cpu,
  Brain,
  Bot,
  BarChart3,
};

export function FocusAreas() {
  const { focusAreas } = siteConfig;

  return (
    <section id="focus-areas" className="py-24 sm:py-32 bg-[#000000]/80 backdrop-blur-[2px] border-b border-[#262626]">
      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 space-y-16">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#262626] bg-[#0A0A0A] px-3.5 py-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#FF9900]" />
            <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
              Technical Domains
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading text-white tracking-tight">
            Curated Focus Areas
          </h2>

          <p className="text-sm sm:text-base text-gray-200 leading-relaxed">
            Registered officially under our Meetup group, each focus area represents deep-dive technical workshops, architectural labs, and student portfolio projects.
          </p>
        </div>

        {/* 6 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {focusAreas.map((area, idx) => {
            const Icon = iconMap[area.icon] || Cloud;
            return (
              <div
                key={area.title}
                className="bg-[#0D0D0D] border border-[#262626] rounded-2xl p-7 hover:border-[#FF9900]/60 hover:bg-[#121212] transition-all duration-300 flex flex-col justify-between group space-y-6 shadow-lg"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-[#161616] border border-[#262626] flex items-center justify-center text-[#FF9900] group-hover:scale-110 group-hover:border-[#FF9900]/40 transition-all">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-mono text-gray-400 font-semibold">
                      0{idx + 1}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white font-heading group-hover:text-[#FF9900] transition-colors">
                    {area.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-gray-200 leading-relaxed font-normal">
                    {area.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#1C1C1C] flex items-center text-xs font-semibold text-gray-300 group-hover:text-white transition-colors">
                  <span>Guided Sessions &amp; Labs</span>
                  <span className="ml-2 text-[#FF9900] transition-transform group-hover:translate-x-1">→</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
