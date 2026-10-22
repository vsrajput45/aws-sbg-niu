import Image from 'next/image';
import { EventSpeaker } from '@/lib/db/types';

interface SpeakersSectionProps {
  speakers?: EventSpeaker[];
  eventTitle?: string;
}

export function SpeakersSection({ speakers, eventTitle }: SpeakersSectionProps) {
  // If zero speakers, keep section completely hidden (never claim placeholder people)
  if (!speakers || speakers.length === 0) {
    return null;
  }

  return (
    <section id="speakers" className="py-24 sm:py-32 bg-[#000000] border-b border-[#262626]">
      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#262626] bg-[#0A0A0A] px-3.5 py-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#FF9900]" />
            <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
              Expert Lineup
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading text-white tracking-tight">
            Featured Speakers
          </h2>

          <p className="text-sm sm:text-base text-gray-200 leading-relaxed">
            Leading practitioners and architects delivering technical insights for {eventTitle || 'our upcoming event'}.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {speakers.map((sp) => (
            <div
              key={sp.id}
              className="bg-[#0D0D0D] border border-[#262626] rounded-2xl p-6 hover:border-[#FF9900]/50 transition-all duration-300 space-y-4 group shadow-lg"
            >
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-full overflow-hidden bg-[#181818] border border-[#FF9900]/40 shrink-0">
                  <Image
                    src={sp.photo_url || '/sbg-logo.svg'}
                    alt={sp.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-heading group-hover:text-[#FF9900] transition-colors">
                    {sp.name}
                  </h3>
                  <p className="text-xs text-[#FF9900] font-semibold">{sp.role}</p>
                  <p className="text-xs text-gray-400 font-medium">{sp.company}</p>
                </div>
              </div>

              {sp.bio && (
                <p className="text-xs sm:text-sm text-gray-200 leading-relaxed font-normal line-clamp-3">
                  {sp.bio}
                </p>
              )}

              {(sp.linkedin_url || sp.x_url) && (
                <div className="flex items-center gap-4 pt-2 border-t border-[#1C1C1C] text-xs">
                  {sp.linkedin_url && (
                    <a
                      href={sp.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-[#FF9900] transition underline underline-offset-4"
                    >
                      LinkedIn
                    </a>
                  )}
                  {sp.x_url && (
                    <a
                      href={sp.x_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-[#FF9900] transition underline underline-offset-4"
                    >
                      X (Twitter)
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
