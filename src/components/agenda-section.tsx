import { Clock } from 'lucide-react';
import { EventAgendaItem } from '@/lib/db/types';

interface AgendaSectionProps {
  agenda?: EventAgendaItem[];
  eventTitle?: string;
}

export function AgendaSection({ agenda, eventTitle }: AgendaSectionProps) {
  if (!agenda || agenda.length === 0) {
    return null;
  }

  return (
    <section id="agenda" className="py-24 sm:py-32 bg-[#070312]/70 border-b border-[#24143D]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#24143D] bg-[#13092B] px-3.5 py-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#C084FC] shadow-[0_0_8px_#C084FC]" />
            <span className="text-xs font-semibold text-purple-200 uppercase tracking-wider">
              Schedule &amp; Flow
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading bg-gradient-to-r from-white via-purple-100 to-[#C084FC] bg-clip-text text-transparent tracking-tight">
            Event Agenda
          </h2>

          <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
            Detailed session breakdown for {eventTitle || 'the upcoming event'}.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#24143D]">
          {agenda.map((item, idx) => (
            <div key={item.id || idx} className="relative group">
              {/* Dot */}
              <div className="absolute -left-[23px] sm:-left-[27px] top-1.5 w-3.5 h-3.5 rounded-full bg-[#070312] border-2 border-[#A855F7] group-hover:bg-[#C084FC] transition-colors shadow-[0_0_8px_rgba(168,85,247,0.4)]" />

              <div className="bg-[#0E0724] border border-[#24143D] rounded-xl p-5 sm:p-6 hover:border-[#8B5CF6]/50 transition-all space-y-2.5 shadow-md">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-mono font-bold text-[#C084FC] flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {item.start_label} - {item.end_label}
                  </span>

                  <span className="px-2.5 py-0.5 rounded text-xs font-semibold uppercase tracking-wider bg-[#180C36] text-purple-200 border border-[#2D1854]">
                    {item.tag}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-white font-heading">
                  {item.title}
                </h3>

                {item.description && (
                  <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                    {item.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
