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
    <section id="agenda" className="py-24 sm:py-32 bg-[#000000] border-b border-[#262626]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#262626] bg-[#0A0A0A] px-3.5 py-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#FF9900]" />
            <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
              Schedule &amp; Flow
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading text-white tracking-tight">
            Event Agenda
          </h2>

          <p className="text-sm sm:text-base text-gray-200 leading-relaxed">
            Detailed session breakdown for {eventTitle || 'the upcoming event'}.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#262626]">
          {agenda.map((item, idx) => (
            <div key={item.id || idx} className="relative group">
              {/* Dot */}
              <div className="absolute -left-[23px] sm:-left-[27px] top-1.5 w-3.5 h-3.5 rounded-full bg-[#000000] border-2 border-[#FF9900] group-hover:bg-[#FF9900] transition-colors" />

              <div className="bg-[#0D0D0D] border border-[#262626] rounded-xl p-5 sm:p-6 hover:border-[#FF9900]/50 transition-all space-y-2.5 shadow-md">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-mono font-bold text-[#FF9900] flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {item.start_label} - {item.end_label}
                  </span>

                  <span className="px-2.5 py-0.5 rounded text-xs font-semibold uppercase tracking-wider bg-[#181818] text-gray-200 border border-[#2e2e2e]">
                    {item.tag}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-white font-heading">
                  {item.title}
                </h3>

                {item.description && (
                  <p className="text-xs sm:text-sm text-gray-200 leading-relaxed">
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
