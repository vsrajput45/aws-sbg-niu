import Link from 'next/link';
import Image from 'next/image';
import { Mail, MapPin, ExternalLink, ShieldCheck } from 'lucide-react';
import { siteConfig } from '@/config/site';

export function Footer({ config }: { config?: typeof siteConfig } = {}) {
  const cfg = config || siteConfig;
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#05020C] border-t border-[#231238] text-gray-400 text-xs">
      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Col 1: Chapter Blurb */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative w-14 h-9 sm:w-16 sm:h-10">
                <Image src="/aws-logo.svg" alt="AWS" fill className="object-contain" />
              </div>
              <div className="w-px h-6 bg-[#2E184A]" />
              <div className="relative w-8 h-8">
                <Image src="/sbg-logo.svg" alt="SBG" fill className="object-contain" />
              </div>
            </div>

            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              {cfg.chapterName} is a student-led academic community under AWS Student Programs, teaching practical cloud engineering, architecture, and technology transformation at Noida International University.
            </p>

            <div className="text-xs text-purple-300 font-medium">
              Founded {cfg.foundedDate} • Registered on Meetup
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-purple-200 font-bold text-xs uppercase tracking-wider font-heading">
              Quick Links
            </h4>
            <ul className="space-y-2 text-gray-300">
              <li>
                <Link href="/#about" className="hover:text-purple-300 transition">About Us</Link>
              </li>
              <li>
                <Link href="/events" className="hover:text-purple-300 transition">Events & Workshops</Link>
              </li>
              <li>
                <Link href="/cfp" className="hover:text-purple-300 transition">Speak at Future Event</Link>
              </li>
              <li>
                <Link href="/badge" className="hover:text-purple-300 transition">Attendee & Member Badge</Link>
              </li>
              <li>
                <Link href="/sponsors" className="hover:text-purple-300 transition">Sponsorship & Partners</Link>
              </li>
              <li>
                <Link href="/admin/login" className="text-gray-400 hover:text-purple-300 transition">Organizer Portal</Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Focus Tracks */}
          <div className="space-y-3">
            <h4 className="text-purple-200 font-bold text-xs uppercase tracking-wider font-heading">
              Focus Tracks
            </h4>
            <ul className="space-y-2 text-gray-300">
              <li>Cloud Computing & AWS Architecture</li>
              <li>Cybersecurity & Governance</li>
              <li>Generative AI & Bedrock</li>
              <li>Machine Learning & SageMaker</li>
              <li>Robotics & IoT Edge</li>
              <li>Business Analytics & Systems</li>
            </ul>
          </div>

          {/* Col 4: Campus Venue & Contact */}
          <div className="space-y-3">
            <h4 className="text-purple-200 font-bold text-xs uppercase tracking-wider font-heading">
              Location & Contact
            </h4>
            
            <div className="space-y-2.5 text-xs text-gray-300">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#C084FC] shrink-0 mt-0.5" />
                <span>
                  {cfg.fullLocation}
                </span>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <a
                  href={cfg.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-200 hover:text-[#C084FC] transition flex items-center gap-1 underline underline-offset-4 decoration-purple-900 font-medium"
                >
                  <span>Google Maps</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
                <span className="text-gray-600">|</span>
                <a
                  href={cfg.appleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-200 hover:text-[#C084FC] transition flex items-center gap-1 underline underline-offset-4 decoration-purple-900 font-medium"
                >
                  <span>Apple Maps</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Mail className="w-4 h-4 text-[#C084FC] shrink-0" />
                <span className="text-gray-200">{cfg.officialEmail}</span>
              </div>

              <div className="pt-2">
                <a
                  href={cfg.meetupUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#130A29] hover:bg-[#1E0F3D] border border-purple-900/40 text-white text-xs font-semibold transition"
                >
                  <span>Official Meetup Group</span>
                  <ExternalLink className="w-3 h-3 text-[#C084FC]" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-[#231238] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <div>
            © {currentYear} {cfg.chapterName}. All rights reserved.
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <ShieldCheck className="w-3.5 h-3.5 text-[#C084FC]" />
            <span>Independent student academic group supported by AWS Student Programs.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
