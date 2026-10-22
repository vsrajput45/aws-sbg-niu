import { Terminal, GraduationCap, Network, Briefcase, Award, Rocket, CheckCircle } from 'lucide-react';
import { siteConfig } from '@/config/site';

export function About({ config }: { config?: typeof siteConfig.aboutSource } = {}) {
  const { headline, descriptionParagraphs, chips } = config || siteConfig.aboutSource;

  const chipIcons = [Terminal, GraduationCap, Network, Briefcase, Award, Rocket];

  return (
    <section id="about" className="py-24 sm:py-32 bg-[#070312]/85 backdrop-blur-[2px] border-b border-[#231238] relative">
      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Heading and Story */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-[#120829] px-3.5 py-1.5 shadow-sm shadow-purple-950/40">
              <div className="w-1.5 h-1.5 rounded-full bg-[#A855F7]" />
              <span className="text-xs font-semibold text-purple-200 uppercase tracking-wider">
                About Our Community
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading text-white tracking-tight leading-tight">
              {headline || (
                <>
                  Built by the <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A855F7] via-[#C084FC] to-violet-200">Community</span>, for the Community.
                </>
              )}
            </h2>

            <div className="space-y-4 text-sm sm:text-base text-gray-200 leading-relaxed font-normal">
              {descriptionParagraphs.map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}
            </div>

            <div className="pt-2 text-xs text-gray-300 font-medium flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-[#C084FC]" />
              <span>Officially registered under Noida, IN • Student-Led & Supported by AWS Student Programs</span>
            </div>
          </div>

          {/* Right Column: Chips Grid & Core Principles */}
          <div className="lg:col-span-5 space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-purple-200 font-heading">
              What We Do Together
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {chips.map((chip, idx) => {
                const Icon = chipIcons[idx % chipIcons.length];
                return (
                  <div
                    key={chip}
                    className="flex items-center gap-3 p-4 rounded-xl border border-[#24143D] bg-[#0E0724] hover:bg-[#140A30] hover:border-purple-500/50 transition-all duration-200 group"
                  >
                    <div className="p-2 rounded-lg bg-[#180C36] text-[#C084FC] group-hover:scale-110 transition-transform">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold text-white group-hover:text-[#C084FC] transition-colors">
                      {chip}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Eligibility Note */}
            <div className="p-5 bg-[#0E0724] border border-[#24143D] rounded-xl space-y-2">
              <span className="text-xs font-bold text-white block uppercase tracking-wider">
                Who Can Participate?
              </span>
              <p className="text-xs sm:text-sm text-gray-200 leading-relaxed">
                Joining is open to any student aged 18+ from Noida International University (any course/year) as well as peer learners across Delhi NCR. No prior AWS certifications or deep cloud background is required to start.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
