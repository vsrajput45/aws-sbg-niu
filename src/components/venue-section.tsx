import Image from 'next/image';
import { MapPin, Navigation, Mail } from 'lucide-react';
import { siteConfig } from '@/config/site';

interface VenueSectionProps {
  venueName?: string | null;
  config?: typeof siteConfig;
}

export function VenueSection({ venueName, config }: VenueSectionProps) {
  const cfg = config || siteConfig;
  const displayVenue = venueName || cfg.campusVenue;

  return (
    <section id="venue" className="py-24 sm:py-32 bg-[#000000]/80 backdrop-blur-[2px] border-b border-[#262626]">
      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#262626] bg-[#0A0A0A] px-3.5 py-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#FF9900]" />
            <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
              Host Campus
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading text-white tracking-tight">
            Venue &amp; Location
          </h2>

          <p className="text-sm sm:text-base text-gray-200 leading-relaxed">
            All offline sessions are hosted at the world-class campus of Noida International University on the Yamuna Expressway in Greater Noida, UP.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-center bg-[#0D0D0D] border border-[#262626] rounded-2xl overflow-hidden p-6 sm:p-10 shadow-2xl">
          {/* Left Details */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#FF9900] uppercase tracking-wider">
                Auditorium / Meeting Space
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold font-heading text-white">
                {displayVenue}
              </h3>
              <p className="text-sm text-gray-200 font-medium">
                {cfg.universityName}
              </p>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-lg">
                {cfg.fullLocation}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a
                href={cfg.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#FF9900] hover:bg-[#FFAA22] text-black text-xs font-bold uppercase tracking-wider transition-all hover:scale-[1.02] shadow-md shadow-[#FF9900]/20"
              >
                <Navigation className="w-4 h-4" />
                <span>Get Directions (Google Maps)</span>
              </a>

              <a
                href={cfg.appleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#181818] hover:bg-[#222] border border-[#333] text-gray-300 hover:text-white text-xs font-semibold uppercase tracking-wider transition-all"
              >
                <MapPin className="w-4 h-4 text-[#FF9900]" />
                <span>Apple Maps</span>
              </a>

              <a
                href={`mailto:${cfg.officialEmail}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#181818] hover:bg-[#222] border border-[#333] text-gray-300 hover:text-white text-xs font-semibold uppercase tracking-wider transition-all"
              >
                <Mail className="w-4 h-4 text-[#FF9900]" />
                <span>Contact Organizers</span>
              </a>
            </div>
          </div>

          {/* Right Visual Campus Photo */}
          <div className="lg:col-span-5 relative h-64 sm:h-80 w-full rounded-xl overflow-hidden border border-[#222222] group">
            <Image
              src="/hero.jpg"
              alt="Noida International University Campus"
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-5">
              <div className="text-xs text-white">
                <span className="font-bold block">Greater Noida, Delhi NCR</span>
                <span className="text-gray-400 text-[11px]">Yamuna Expressway, Sector 17A</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
