import { ArrowRight, ExternalLink, Sparkles } from 'lucide-react';
import { siteConfig } from '@/config/site';

export function CtaSection({ config }: { config?: typeof siteConfig } = {}) {
  const cfg = config || siteConfig;

  return (
    <section className="py-24 bg-[#050505] relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[250px] bg-[#FF9900]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#FF9900]/40 bg-[#FF9900]/10 px-4 py-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#FF9900]" />
          <span className="text-xs font-bold text-[#FF9900] uppercase tracking-wider">
            Inaugural Semester
          </span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-extrabold font-heading text-white tracking-tight leading-tight">
          Be a Founding Member — <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF9900] via-[#FFAA22] to-amber-200">
            Join on Meetup Today
          </span>
        </h2>

        <p className="text-base sm:text-lg text-gray-200 max-w-xl mx-auto leading-relaxed font-normal">
          Help shape the future of student cloud innovation at Noida International University. Joining is 100% free, open to any learner 18+, and takes just one click.
        </p>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href={cfg.meetupUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#FF9900] hover:bg-[#FFAA22] text-black text-xs font-bold uppercase tracking-wider transition-all hover:scale-[1.03] active:scale-[0.98] shadow-xl shadow-[#FF9900]/25 inline-flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Join Us on Meetup</span>
            <ExternalLink className="w-4 h-4" />
          </a>

          <a
            href="/sponsors"
            className="w-full sm:w-auto px-7 py-4 rounded-xl bg-[#111111] hover:bg-[#1C1C1C] border border-[#2A2A2A] text-white text-xs font-semibold uppercase tracking-wider transition-all inline-flex items-center justify-center gap-2"
          >
            <span>Partner With Us</span>
            <ArrowRight className="w-4 h-4 text-gray-400" />
          </a>
        </div>
      </div>
    </section>
  );
}
