import { siteConfig } from '@/config/site';

export function Marquee({ topics }: { topics?: string[] } = {}) {
  const topicList = topics && topics.length > 0 ? topics : siteConfig.marqueeTopics;

  return (
    <section className="py-4 bg-[#0A0518] border-y border-[#231238] overflow-hidden select-none">
      <div className="flex w-max animate-marquee space-x-8">
        {[...topicList, ...topicList, ...topicList].map((topic, i) => (
          <div key={i} className="flex items-center gap-6 shrink-0">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-300 hover:text-white transition">
              {topic}
            </span>
            <span className="text-[#C084FC] text-sm font-bold drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]" aria-hidden="true">
              ✦
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
