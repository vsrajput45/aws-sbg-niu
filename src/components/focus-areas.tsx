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

export function FocusAreas({ config }: { config?: typeof siteConfig } = {}) {
  const cfg = config || siteConfig;
  const { focusAreas } = cfg;

  return (
    <section id="focus-areas" className="py-24 sm:py-32 bg-[#070312]/85 backdrop-blur-[2px] border-b border-[#231238]">
      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 space-y-16">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-[#120829] px-3.5 py-1.5 shadow-sm shadow-purple-950/40">
            <div className="w-1.5 h-1.5 rounded-full bg-[#A855F7]" />
            <span className="text-xs font-semibold text-purple-200 uppercase tracking-wider">
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
                className="bg-[#0E0724] border border-[#24143D] rounded-2xl p-7 hover:border-purple-500/60 hover:bg-[#140A30] transition-all duration-300 flex flex-col justify-between group space-y-6 shadow-lg shadow-purple-950/20"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-[#180C36] border border-purple-900/50 flex items-center justify-center text-[#C084FC] group-hover:scale-110 group-hover:border-purple-500/50 transition-all">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-mono text-purple-300 font-semibold">
                      0{idx + 1}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white font-heading group-hover:text-[#C084FC] transition-colors">
                    {area.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-gray-200 leading-relaxed font-normal">
                    {area.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#1C1033] flex items-center text-xs font-semibold text-gray-300 group-hover:text-white transition-colors">
                  <span>Guided Sessions &amp; Labs</span>
                  <span className="ml-2 text-[#A855F7] transition-transform group-hover:translate-x-1">→</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
