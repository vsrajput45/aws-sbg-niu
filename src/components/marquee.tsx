import { siteConfig } from '@/config/site';

export function Marquee({ topics }: { topics?: string[] } = {}) {
  const topicList = topics && topics.length > 0 ? topics : siteConfig.marqueeTopics;

  return (
    <section className="py-4 bg-[#0A0A0A] border-y border-[#262626] overflow-hidden select-none">
      <div className="flex w-max animate-marquee space-x-8">
        {[...topicList, ...topicList, ...topicList].map((topic, i) => (
          <div key={i} className="flex items-center gap-6 shrink-0">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-300 hover:text-white transition">
              {topic}
            </span>
            <span className="text-[#FF9900] text-sm font-bold" aria-hidden="true">
              ✦
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
