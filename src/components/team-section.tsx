'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ShieldCheck, Award, X, ExternalLink, Sparkles, UserCheck } from 'lucide-react';
import { coreTeam, TeamMember } from '@/data/team';
import { TeamMemberRecord } from '@/lib/db/types';

export type TeamSectionItem = TeamMember | TeamMemberRecord;

interface TeamSectionProps {
  members?: TeamSectionItem[];
}

export function TeamSection({ members }: TeamSectionProps) {
  const displayMembers = members && members.length > 0 ? members : coreTeam;
  const [selectedPoster, setSelectedPoster] = useState<TeamSectionItem | null>(null);

  return (
    <section id="team" className="py-24 sm:py-32 bg-[#070312]/85 backdrop-blur-[2px] border-b border-[#231238] relative">
      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 space-y-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-950/50 px-4 py-1.5 shadow-sm shadow-purple-950/40">
            <Sparkles className="w-3.5 h-3.5 text-[#C084FC]" />
            <span className="text-xs font-bold text-purple-200 uppercase tracking-wider">
              Student Leadership • 2026-27
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading text-white tracking-tight">
            Leadership &amp; <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A855F7] via-[#C084FC] to-violet-200">Core Team</span>
          </h2>

          <p className="text-sm sm:text-base text-gray-200 leading-relaxed">
            The appointed student organizers steering workshops, community operations, technical labs, design, and industry outreach at Noida International University.
          </p>
        </div>

        {/* Team Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {displayMembers.map((member) => {
            const memberKey = 'id' in member && member.id ? member.id : member.name;
            const avatarSrc = member.avatarUrl || '/sbg-logo.svg';
            return (
            <div
              key={memberKey}
              className="bg-[#0E0724] border border-[#24143D] rounded-2xl overflow-hidden hover:border-purple-500/60 transition-all duration-300 flex flex-col group shadow-xl shadow-purple-950/30 hover:shadow-purple-900/40"
            >
              {/* Member Photo Frame */}
              <div className="relative w-full aspect-[4/5] bg-[#140A30] overflow-hidden">
                <Image
                  src={avatarSrc}
                  alt={`${member.name} - ${member.role}`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  priority
                  unoptimized
                />

                {/* Subtle Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0E0724] via-transparent to-transparent opacity-90" />

                {/* Session Badge */}
                <div className="absolute top-3.5 left-3.5">
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#140A30]/80 backdrop-blur-md text-[#C084FC] border border-purple-500/40 shadow-md">
                    {member.session}
                  </span>
                </div>

                {/* View Official Card Button */}
                <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => setSelectedPoster(member)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/80 hover:bg-gradient-to-r hover:from-[#7C3AED] hover:to-[#A855F7] text-gray-200 hover:text-white text-[11px] font-bold transition shadow-lg backdrop-blur-md cursor-pointer border border-purple-900/50"
                  >
                    <span>View Poster</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Member Details */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#C084FC] block">
                    {member.role}
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-white font-heading tracking-tight">
                    {member.name}
                  </h3>
                  <span className="text-xs text-gray-400 block font-medium">
                    {member.department}
                  </span>
                  <p className="text-xs sm:text-sm text-gray-300 leading-relaxed pt-1 line-clamp-3">
                    {member.bio}
                  </p>
                </div>

                {/* Card Footer */}
                <div className="pt-3 border-t border-[#1C1033] flex items-center justify-between text-xs">
                  <span className="text-gray-400 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-[#C084FC]" />
                    <span>Appointed Lead</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedPoster(member)}
                    className="text-[11px] font-semibold text-purple-300 hover:text-[#C084FC] transition underline underline-offset-4 cursor-pointer"
                  >
                    Poster Card
                  </button>
                </div>
              </div>
            </div>
            );
          })}
        </div>

        {/* Note / Recognition */}
        <div className="text-center text-xs text-gray-400 flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#C084FC]" />
          <span>
            Official Core Team for 2026-27 • AWS Student Builder Group at Noida International University
          </span>
        </div>
      </div>

      {/* Official Poster Modal */}
      {selectedPoster && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          onClick={() => setSelectedPoster(null)}
        >
          <div
            className="relative max-w-lg w-full bg-[#0E0724] border border-purple-900/50 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-purple-900/40">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-[#C084FC]" />
                <span className="text-xs font-bold text-white uppercase tracking-wider font-heading">
                  {selectedPoster.name} • {selectedPoster.role}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPoster(null)}
                className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-purple-900/30 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Poster Image */}
            <div className="relative aspect-[801/1024] w-full bg-black">
              <Image
                src={selectedPoster.cardUrl || selectedPoster.avatarUrl || '/sbg-logo.svg'}
                alt={`${selectedPoster.name} Official Appointment Card`}
                fill
                sizes="(max-width: 768px) 100vw, 600px"
                className="object-contain"
                priority
                unoptimized
              />
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-[#0A041A] border-t border-purple-900/40 flex items-center justify-between">
              <span className="text-xs text-gray-400">
                AWS Student Builder Group at Noida International University
              </span>
              <a
                href={selectedPoster.cardUrl || selectedPoster.avatarUrl || '/sbg-logo.svg'}
                download={`${selectedPoster.name.toLowerCase().replace(/\s+/g, '-')}-aws-sbg.jpg`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-[#C084FC] hover:underline"
              >
                Open Full Size
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
