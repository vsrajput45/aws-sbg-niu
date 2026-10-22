'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Building2, MapPin, Globe, Share2, Sparkles, FileText, 
  Save, RotateCcw, ExternalLink, CheckCircle2, AlertCircle, Loader2 
} from 'lucide-react';
import { SiteSettingsRecord } from '@/lib/db/types';

interface SiteSettingsFormProps {
  initialSettings: SiteSettingsRecord;
}

export function SiteSettingsForm({ initialSettings }: SiteSettingsFormProps) {
  const [formData, setFormData] = useState<SiteSettingsRecord>(initialSettings);
  const [marqueeInput, setMarqueeInput] = useState<string>(
    initialSettings.marqueeTopics ? initialSettings.marqueeTopics.join(', ') : ''
  );
  const [activeTab, setActiveTab] = useState<'branding' | 'venue' | 'socials' | 'about' | 'forms'>('branding');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleChange = (field: keyof SiteSettingsRecord, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setStatus(null);
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setStatus(null);

    const parsedMarquee = marqueeInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      const res = await fetch('/api/admin/site-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          marqueeTopics: parsedMarquee,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save settings');
      }

      setFormData(data.settings);
      setMarqueeInput(data.settings.marqueeTopics.join(', '));
      setStatus({ type: 'success', message: 'Web page details saved successfully!' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error updating settings';
      setStatus({ type: 'error', message: msg });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Are you sure you want to reset all site settings to official defaults?')) {
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch('/api/admin/site-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset' }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to reset settings');
      }

      setFormData(data.settings);
      setMarqueeInput(data.settings.marqueeTopics.join(', '));
      setStatus({ type: 'success', message: 'All site details reset to official defaults.' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error resetting settings';
      setStatus({ type: 'error', message: msg });
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'branding', label: 'Branding & Identity', icon: Building2 },
    { id: 'venue', label: 'Venue & Location', icon: MapPin },
    { id: 'socials', label: 'Social & Communication', icon: Share2 },
    { id: 'about', label: 'About & Marquee', icon: Sparkles },
    { id: 'forms', label: 'External Forms (CFP & Sponsors)', icon: FileText },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Top Floating Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#111111] border border-[#262626] sticky top-20 z-30 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-[#FF9900]/10 border border-[#FF9900]/30 text-[#FF9900]">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white font-heading">
              Live Web Page Details Editor
            </h2>
            <p className="text-[11px] text-gray-400">
              Changes apply instantly across all live pages on the website.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <Link
            href="/"
            target="_blank"
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#181818] hover:bg-[#222222] border border-[#333333] text-gray-300 hover:text-white text-xs font-semibold transition"
          >
            <span>Live Site</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            type="button"
            onClick={handleReset}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#181818] hover:bg-[#222222] border border-[#333333] text-gray-400 hover:text-white text-xs font-semibold transition disabled:opacity-50"
            title="Reset to defaults"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Reset</span>
          </button>

          <button
            type="button"
            onClick={() => handleSave()}
            disabled={loading}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2 rounded-lg bg-[#FF9900] hover:bg-[#FFAA22] text-black text-xs font-bold uppercase tracking-wider transition shadow-lg shadow-[#FF9900]/25 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Status Alert */}
      {status && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 transition-all ${
            status.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
              : 'bg-red-950/40 border-red-500/40 text-red-200'
          }`}
        >
          {status.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          )}
          <span className="text-xs sm:text-sm font-medium">{status.message}</span>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-[#262626] pb-2 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-[#1F1F1F] text-[#FF9900] border border-[#333333]'
                  : 'text-gray-400 hover:text-white hover:bg-[#141414]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Form Content */}
      <form onSubmit={handleSave} className="bg-[#111111] border border-[#262626] rounded-xl p-6 space-y-6">
        {/* Tab 1: Branding & Identity */}
        {activeTab === 'branding' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-white font-heading">Chapter Branding</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Primary chapter names and slogans used in headers, hero, and SEO meta tags.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-300">
                  Full Chapter Name
                </label>
                <input
                  type="text"
                  value={formData.chapterName}
                  onChange={(e) => handleChange('chapterName', e.target.value)}
                  className="w-full bg-[#161616] border border-[#2B2B2B] rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FF9900]"
                  placeholder="AWS Student Builder Group at Noida International University"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-300">
                  Short Acronym / Brand Name
                </label>
                <input
                  type="text"
                  value={formData.shortName}
                  onChange={(e) => handleChange('shortName', e.target.value)}
                  className="w-full bg-[#161616] border border-[#2B2B2B] rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FF9900]"
                  placeholder="AWS SBG NIU"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-300">
                  Community Tagline
                </label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => handleChange('tagline', e.target.value)}
                  className="w-full bg-[#161616] border border-[#2B2B2B] rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FF9900]"
                  placeholder="Student-led cloud community innovating with Amazon Web Services"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-300">
                  University / College Name
                </label>
                <input
                  type="text"
                  value={formData.universityName}
                  onChange={(e) => handleChange('universityName', e.target.value)}
                  className="w-full bg-[#161616] border border-[#2B2B2B] rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FF9900]"
                  placeholder="Noida International University"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-300">
                  Founded Date
                </label>
                <input
                  type="date"
                  value={formData.foundedDate}
                  onChange={(e) => handleChange('foundedDate', e.target.value)}
                  className="w-full bg-[#161616] border border-[#2B2B2B] rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FF9900]"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Venue & Location */}
        {activeTab === 'venue' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-white font-heading">Campus Venue & Location</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Displayed in the Venue section on the homepage and throughout event pages.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-300">
                  Campus Venue / Auditorium Name
                </label>
                <input
                  type="text"
                  value={formData.campusVenue}
                  onChange={(e) => handleChange('campusVenue', e.target.value)}
                  className="w-full bg-[#161616] border border-[#2B2B2B] rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FF9900]"
                  placeholder="Main Auditorium, Block C"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-300">
                  City / Region (e.g. Noida, IN)
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  className="w-full bg-[#161616] border border-[#2B2B2B] rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FF9900]"
                  placeholder="Noida, IN"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-300">
                  Full Physical Address
                </label>
                <textarea
                  rows={2}
                  value={formData.fullLocation}
                  onChange={(e) => handleChange('fullLocation', e.target.value)}
                  className="w-full bg-[#161616] border border-[#2B2B2B] rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FF9900]"
                  placeholder="Noida International University, Greater Noida, Uttar Pradesh, Delhi NCR, India"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-300">
                  Google Maps URL
                </label>
                <input
                  type="url"
                  value={formData.mapsUrl}
                  onChange={(e) => handleChange('mapsUrl', e.target.value)}
                  className="w-full bg-[#161616] border border-[#2B2B2B] rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FF9900]"
                  placeholder="https://maps.google.com/?q=..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-300">
                  Apple Maps URL
                </label>
                <input
                  type="url"
                  value={formData.appleMapsUrl}
                  onChange={(e) => handleChange('appleMapsUrl', e.target.value)}
                  className="w-full bg-[#161616] border border-[#2B2B2B] rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FF9900]"
                  placeholder="https://maps.apple.com/?q=..."
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Social & Communication */}
        {activeTab === 'socials' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-white font-heading">Social Links & Official Contacts</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Leave any URL blank to automatically hide its icon from the navigation and footer.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-300">
                  Official Contact Email
                </label>
                <input
                  type="email"
                  value={formData.officialEmail}
                  onChange={(e) => handleChange('officialEmail', e.target.value)}
                  className="w-full bg-[#161616] border border-[#2B2B2B] rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FF9900]"
                  placeholder="aws.sbg@niu.ac.in"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-300">
                  Official Meetup Group URL
                </label>
                <input
                  type="url"
                  value={formData.meetupUrl}
                  onChange={(e) => handleChange('meetupUrl', e.target.value)}
                  className="w-full bg-[#161616] border border-[#2B2B2B] rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FF9900]"
                  placeholder="https://www.meetup.com/aws-sbg-at-noida-international-university/"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-300">
                  LinkedIn Page URL
                </label>
                <input
                  type="url"
                  value={formData.linkedinUrl || ''}
                  onChange={(e) => handleChange('linkedinUrl', e.target.value)}
                  className="w-full bg-[#161616] border border-[#2B2B2B] rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FF9900]"
                  placeholder="https://linkedin.com/company/..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-300">
                  Instagram Profile URL
                </label>
                <input
                  type="url"
                  value={formData.instagramUrl || ''}
                  onChange={(e) => handleChange('instagramUrl', e.target.value)}
                  className="w-full bg-[#161616] border border-[#2B2B2B] rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FF9900]"
                  placeholder="https://instagram.com/..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-300">
                  GitHub Organization URL
                </label>
                <input
                  type="url"
                  value={formData.githubUrl || ''}
                  onChange={(e) => handleChange('githubUrl', e.target.value)}
                  className="w-full bg-[#161616] border border-[#2B2B2B] rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FF9900]"
                  placeholder="https://github.com/..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-300">
                  X / Twitter URL
                </label>
                <input
                  type="url"
                  value={formData.twitterUrl || ''}
                  onChange={(e) => handleChange('twitterUrl', e.target.value)}
                  className="w-full bg-[#161616] border border-[#2B2B2B] rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FF9900]"
                  placeholder="https://x.com/..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-300">
                  Discord / WhatsApp Community Invite URL
                </label>
                <input
                  type="url"
                  value={formData.discordUrl || ''}
                  onChange={(e) => handleChange('discordUrl', e.target.value)}
                  className="w-full bg-[#161616] border border-[#2B2B2B] rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FF9900]"
                  placeholder="https://discord.gg/... or WhatsApp invite"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: About & Marquee */}
        {activeTab === 'about' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-white font-heading">Hero Metrics, About & Marquee</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Highlight chapter scale and define the scrolling technical keyword marquee.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-300">
                  Active Member Count Snapshot
                </label>
                <input
                  type="number"
                  value={formData.memberCountSnapshot}
                  onChange={(e) => handleChange('memberCountSnapshot', parseInt(e.target.value, 10) || 0)}
                  className="w-full bg-[#161616] border border-[#2B2B2B] rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FF9900]"
                  placeholder="52"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-300">
                  Snapshot As Of Period (e.g. October 2026)
                </label>
                <input
                  type="text"
                  value={formData.snapshotAsOf}
                  onChange={(e) => handleChange('snapshotAsOf', e.target.value)}
                  className="w-full bg-[#161616] border border-[#2B2B2B] rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FF9900]"
                  placeholder="October 2026"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-300">
                  About Section Headline
                </label>
                <input
                  type="text"
                  value={formData.aboutHeadline}
                  onChange={(e) => handleChange('aboutHeadline', e.target.value)}
                  className="w-full bg-[#161616] border border-[#2B2B2B] rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FF9900]"
                  placeholder="Built by the Community, for the Community."
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-300">
                  About Description Paragraphs (Separate paragraphs with a blank line)
                </label>
                <textarea
                  rows={6}
                  value={formData.aboutDescription}
                  onChange={(e) => handleChange('aboutDescription', e.target.value)}
                  className="w-full bg-[#161616] border border-[#2B2B2B] rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FF9900]"
                  placeholder="Paragraph 1...&#10;&#10;Paragraph 2..."
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-300">
                  Marquee Topics (Comma-separated list)
                </label>
                <textarea
                  rows={3}
                  value={marqueeInput}
                  onChange={(e) => {
                    setMarqueeInput(e.target.value);
                    setStatus(null);
                  }}
                  className="w-full bg-[#161616] border border-[#2B2B2B] rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FF9900]"
                  placeholder="Cloud Computing, Generative AI, Serverless, DevOps, Machine Learning, AWS Lambda..."
                />
                <span className="text-[11px] text-gray-500 block">
                  These topics animate continuously across the hero banner marquee.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: External Forms */}
        {activeTab === 'forms' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-white font-heading">CFP & Sponsorship Google Forms</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                External Google Form links where speakers submit session proposals and sponsors express partnership interest.
              </p>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-300">
                  Call for Speakers (CFP) Application Form URL
                </label>
                <input
                  type="url"
                  value={formData.speakerInterestForm}
                  onChange={(e) => handleChange('speakerInterestForm', e.target.value)}
                  className="w-full bg-[#161616] border border-[#2B2B2B] rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FF9900]"
                  placeholder="https://forms.gle/..."
                />
                <span className="text-[11px] text-gray-500 block">
                  Used by the CTA buttons on the <Link href="/cfp" target="_blank" className="text-[#FF9900] underline">/cfp</Link> page.
                </span>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-300">
                  Community Sponsorship Inquiry Form URL
                </label>
                <input
                  type="url"
                  value={formData.sponsorForm}
                  onChange={(e) => handleChange('sponsorForm', e.target.value)}
                  className="w-full bg-[#161616] border border-[#2B2B2B] rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FF9900]"
                  placeholder="https://forms.gle/..."
                />
                <span className="text-[11px] text-gray-500 block">
                  Used by the tier action buttons on the <Link href="/sponsors" target="_blank" className="text-[#FF9900] underline">/sponsors</Link> page.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Save Bar */}
        <div className="pt-6 border-t border-[#262626] flex items-center justify-between">
          <span className="text-[11px] text-gray-400">
            {formData.updated_at ? `Last saved: ${new Date(formData.updated_at).toLocaleTimeString()}` : 'Default settings'}
          </span>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#FF9900] hover:bg-[#FFAA22] text-black text-xs font-bold uppercase tracking-wider transition shadow-lg shadow-[#FF9900]/25 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
