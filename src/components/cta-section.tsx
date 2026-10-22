import { ArrowRight, ExternalLink, Sparkles } from 'lucide-react';
import { siteConfig } from '@/config/site';

export function CtaSection({ config }: { config?: typeof siteConfig } = {}) {
  const cfg = config || siteConfig;

  return (
    <section className="py-24 bg-[#06020D] relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-purple-600/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/40 bg-purple-950/60 px-4 py-1.5 shadow-sm shadow-purple-950/40">
          <Sparkles className="w-3.5 h-3.5 text-[#C084FC]" />
          <span className="text-xs font-bold text-purple-200 uppercase tracking-wider">
            Inaugural Semester
          </span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-extrabold font-heading text-white tracking-tight leading-tight">
          Be a Founding Member — <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A855F7] via-[#C084FC] to-violet-200">
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
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-[#7C3AED] via-[#8B5CF6] to-[#A855F7] hover:from-[#6D28D9] hover:to-[#9333EA] text-white text-xs font-bold uppercase tracking-wider transition-all hover:scale-[1.03] active:scale-[0.98] shadow-xl shadow-purple-600/30 inline-flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Join Us on Meetup</span>
            <ExternalLink className="w-4 h-4" />
          </a>

          <a
            href="/sponsors"
            className="w-full sm:w-auto px-7 py-4 rounded-xl bg-[#130A29] hover:bg-[#1E0F3D] border border-purple-900/40 text-white text-xs font-semibold uppercase tracking-wider transition-all inline-flex items-center justify-center gap-2"
          >
            <span>Partner With Us</span>
            <ArrowRight className="w-4 h-4 text-purple-300" />
          </a>
        </div>
      </div>
    </section>
  );
}
