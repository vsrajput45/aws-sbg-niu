'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { chapterFaqs } from '@/data/faqs';

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // First open by default

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-24 sm:py-32 bg-[#070312]/85 backdrop-blur-[2px] border-b border-[#231238]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-[#120829] px-3.5 py-1.5 shadow-sm shadow-purple-950/40">
            <div className="w-1.5 h-1.5 rounded-full bg-[#A855F7]" />
            <span className="text-xs font-semibold text-purple-200 uppercase tracking-wider">
              Common Questions
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading text-white tracking-tight">
            Frequently Asked Questions
          </h2>

          <p className="text-sm sm:text-base text-gray-200 leading-relaxed">
            Everything you need to know about joining, attending sessions, and contributing to our community.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-3">
          {chapterFaqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={faq.id}
                className="bg-[#0E0724] border border-[#24143D] rounded-xl overflow-hidden transition-colors shadow-md shadow-purple-950/20"
              >
                <button
                  type="button"
                  onClick={() => toggleAccordion(index)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm sm:text-base font-bold text-white font-heading">
                    {faq.question}
                  </span>
                  <div className={`p-1.5 rounded-lg bg-[#180C36] text-[#C084FC] transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-6 sm:px-6 text-sm text-gray-200 leading-relaxed border-t border-[#1C1033] pt-4">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
