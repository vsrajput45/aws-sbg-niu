'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Building2, MapPin, Globe, Share2, Sparkles, FileText, 
  Save, RotateCcw, ExternalLink, CheckCircle2, AlertCircle, Loader2, IndianRupee,
  Mail, Send, Eye, EyeOff, ShieldCheck, Check 
} from 'lucide-react';
import { SiteSettingsRecord } from '@/lib/db/types';

interface SiteSettingsFormProps {
  initialSettings: SiteSettingsRecord;
}

export function SiteSettingsForm({ initialSettings }: SiteSettingsFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState<SiteSettingsRecord>(initialSettings);
  const [marqueeInput, setMarqueeInput] = useState<string>(
    initialSettings.marqueeTopics ? initialSettings.marqueeTopics.join(', ') : ''
  );
  const [activeTab, setActiveTab] = useState<'branding' | 'email' | 'venue' | 'socials' | 'about' | 'forms' | 'payment'>('branding');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Email test & password visibility state
  const [showSmtpPass, setShowSmtpPass] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState('');
  const [testLoading, setTestLoading] = useState(false);
  const [testStatus, setTestStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    const tabParam = searchParams?.get('tab');
    if (tabParam && ['branding', 'email', 'venue', 'socials', 'about', 'forms', 'payment'].includes(tabParam)) {
      setActiveTab(tabParam as any);
    }
  }, [searchParams]);

  const handleChange = (field: keyof SiteSettingsRecord, value: string | number | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setStatus(null);
  };

  const handleSendTestEmail = async () => {
    const emailToSend = testEmailAddress.trim() || formData.candidateSenderEmail || formData.officialEmail || '';
    if (!emailToSend || !emailToSend.includes('@')) {
      setTestStatus({ type: 'error', message: 'Please enter a valid recipient email address for testing.' });
      return;
    }

    setTestLoading(true);
    setTestStatus(null);

    try {
      const res = await fetch('/api/admin/email-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testEmail: emailToSend,
          candidateSenderEmail: formData.candidateSenderEmail,
          candidateSenderName: formData.candidateSenderName,
          candidateReplyToEmail: formData.candidateReplyToEmail,
          smtpHost: formData.smtpHost,
          smtpPort: formData.smtpPort,
          smtpUser: formData.smtpUser,
          smtpPass: formData.smtpPass,
          smtpSecure: formData.smtpSecure,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to dispatch test email');
      }

      setTestStatus({
        type: 'success',
        message: data.message || `Test email successfully dispatched to ${emailToSend}!`,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error sending test email';
      setTestStatus({ type: 'error', message: msg });
    } finally {
      setTestLoading(false);
    }
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
      router.refresh();
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
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error resetting settings';
      setStatus({ type: 'error', message: msg });
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'branding', label: 'Branding & Identity', icon: Building2 },
    { id: 'email', label: 'Candidate Email Dispatch', icon: Mail },
    { id: 'venue', label: 'Venue & Location', icon: MapPin },
    { id: 'socials', label: 'Social & Communication', icon: Share2 },
    { id: 'payment', label: 'UPI & Payments', icon: IndianRupee },
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

        {/* Tab: Candidate Email Dispatch */}
        {activeTab === 'email' && (
          <div className="space-y-8">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#FF9900]/10 border border-[#FF9900]/30 text-[#FF9900] text-xs font-bold uppercase tracking-wider mb-2">
                <Mail className="w-3.5 h-3.5" />
                <span>Candidate Email Dispatch System</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white font-heading">
                Candidate Sender Email &amp; Dispatch Settings
              </h3>
              <p className="text-xs text-gray-400 mt-1 max-w-3xl leading-relaxed">
                उम्मीदवार (Candidate) जब किसी इवेंट के लिए रजिस्टर करेगा, तो उसे डिजिटल पास, क्यूआर कोड और बैज जिस ईमेल एड्रेस से भेजा जाएगा, उसे आप यहाँ से बदल सकते हैं।
              </p>
            </div>

            {/* Current Active Sender Overview Card */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-[#18112C] via-[#120D22] to-[#18112C] border border-[#3B286E] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-[#7C3AED]/20 border border-[#7C3AED]/40 text-[#A78BFA] shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    Current Candidate Sender Address
                  </div>
                  <div className="text-sm sm:text-base font-bold text-white font-mono flex items-center gap-2 flex-wrap">
                    <span>{formData.candidateSenderEmail || 'aws.sbg@niu.ac.in'}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                      Active Dispatcher
                    </span>
                  </div>
                  <p className="text-[11px] text-purple-300 mt-0.5">
                    Display Name: &ldquo;{formData.candidateSenderName || 'AWS Student Builder Group • NIU'}&rdquo;
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('test-email-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-3 py-1.5 rounded-lg bg-[#251A45] hover:bg-[#32235E] border border-[#523A8C] text-xs font-semibold text-purple-200 transition"
                >
                  Jump to Test Tool ↓
                </button>
              </div>
            </div>

            {/* Primary Dispatch Sender Configuration */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-gray-200 uppercase tracking-wider border-b border-[#262626] pb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#FF9900]" />
                <span>1. Official Sender Identity (उम्मीदवार को दिखने वाला प्रेषक)</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-300 flex items-center justify-between">
                    <span>Candidate Sender Email (प्रेषक का ईमेल एड्रेस) *</span>
                    <span className="text-[10px] text-[#FF9900] lowercase font-mono">from email</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.candidateSenderEmail || ''}
                    onChange={(e) => handleChange('candidateSenderEmail', e.target.value)}
                    className="w-full bg-[#161616] border border-[#2B2B2B] rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FF9900] font-mono"
                    placeholder="aws.sbg@niu.ac.in"
                  />
                  <p className="text-[11px] text-gray-400">
                    उम्मीदवार के इनबॉक्स में यह ईमेल एड्रेस प्रेषक (From) के रूप में दिखेगा (e.g. <span className="text-gray-300 font-mono">aws.sbg@niu.ac.in</span> या <span className="text-gray-300 font-mono">events@niu.ac.in</span>)।
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-300 flex items-center justify-between">
                    <span>Sender Display Name (प्रेषक का नाम)</span>
                    <span className="text-[10px] text-gray-400 lowercase">from name</span>
                  </label>
                  <input
                    type="text"
                    value={formData.candidateSenderName || ''}
                    onChange={(e) => handleChange('candidateSenderName', e.target.value)}
                    className="w-full bg-[#161616] border border-[#2B2B2B] rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FF9900]"
                    placeholder="AWS Student Builder Group • NIU"
                  />
                  <p className="text-[11px] text-gray-400">
                    मेल इनबॉक्स में दिखने वाला आर्गेनाइजेशन या प्रेषक का नाम (e.g. <span className="text-gray-300">AWS Student Builder Group • NIU</span>)।
                  </p>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-300 flex items-center justify-between">
                    <span>Candidate Reply-To Email Address (रिप्लाई-टू ईमेल)</span>
                    <span className="text-[10px] text-gray-400 lowercase font-mono">reply-to</span>
                  </label>
                  <input
                    type="email"
                    value={formData.candidateReplyToEmail || ''}
                    onChange={(e) => handleChange('candidateReplyToEmail', e.target.value)}
                    className="w-full bg-[#161616] border border-[#2B2B2B] rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FF9900] font-mono"
                    placeholder="aws.sbg@niu.ac.in"
                  />
                  <p className="text-[11px] text-gray-400">
                    अगर कोई उम्मीदवार कन्फर्मेशन मेल पर सीधे &ldquo;Reply&rdquo; करता है, तो जवाब इस ईमेल पर आएगा। खाली रखने पर ऊपर दिया गया Sender Email इस्तेमाल होगा।
                  </p>
                </div>
              </div>
            </div>

            {/* Live Candidate Inbox Preview Mockup */}
            <div className="p-5 rounded-xl bg-[#0E0A1A] border border-[#2B1D4F] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                  <span>📱 Live Preview: Candidate Inbox Appearance</span>
                </span>
                <span className="text-[10px] text-gray-400">Candidate Mail Preview</span>
              </div>
              <div className="p-3.5 rounded-lg bg-[#140F27] border border-[#382669] space-y-2 font-sans text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-[#2C1E54] pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#FF9900] to-[#EC4899] text-[10px] font-bold text-black flex items-center justify-center font-mono">
                      AWS
                    </span>
                    <div>
                      <span className="font-bold text-white">
                        {formData.candidateSenderName || 'AWS Student Builder Group • NIU'}
                      </span>
                      <span className="text-gray-400 font-mono text-[11px] ml-1.5">
                        &lt;{formData.candidateSenderEmail || 'aws.sbg@niu.ac.in'}&gt;
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono">Just now</span>
                </div>
                <div className="text-[11px] text-gray-300 space-y-1">
                  <div>
                    <strong className="text-gray-400">To:</strong>{' '}
                    <span className="text-gray-200 font-mono">candidate.student@niu.ac.in</span>
                  </div>
                  <div>
                    <strong className="text-gray-400">Reply-To:</strong>{' '}
                    <span className="text-gray-200 font-mono">
                      {formData.candidateReplyToEmail || formData.candidateSenderEmail || 'aws.sbg@niu.ac.in'}
                    </span>
                  </div>
                  <div>
                    <strong className="text-gray-400">Subject:</strong>{' '}
                    <span className="text-[#FF9900] font-semibold">
                      🎟️ Registration Confirmed: AWS Cloud Architecture Day • Pass NIUSBG-AWS-2026-WCEG (Student Name)
                    </span>
                  </div>
                  <div className="mt-2 text-[10px] text-emerald-400 flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    <span>Attached: Scannable Delegate Pass QR Code (.png)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Optional Custom SMTP Transporter Server Settings */}
            <div className="space-y-4 pt-4 border-t border-[#262626]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h4 className="text-xs font-bold text-gray-200 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-400" />
                  <span>2. SMTP Server Configuration (वैकल्पिक SMTP सर्वर विवरण)</span>
                </h4>
                <span className="text-[11px] text-gray-400">
                  Optional: Override credentials without editing .env.local
                </span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                सर्वर डिफ़ॉल्ट रूप से <span className="text-white font-mono">.env.local</span> में मौजूद <span className="text-white font-mono">SMTP_USER</span> और <span className="text-white font-mono">SMTP_PASS</span> का उपयोग करता है। अगर आप एडमिन पैनल से ही Gmail App Password या कस्टम SMTP कॉन्फ़िगर करना चाहते हैं, तो नीचे दर्ज करें:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-300">
                    SMTP Host
                  </label>
                  <input
                    type="text"
                    value={formData.smtpHost || ''}
                    onChange={(e) => handleChange('smtpHost', e.target.value)}
                    className="w-full bg-[#161616] border border-[#2B2B2B] rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FF9900] font-mono"
                    placeholder="smtp.gmail.com"
                  />
                  <p className="text-[10px] text-gray-500">
                    Gmail के लिए: <span className="font-mono text-gray-400">smtp.gmail.com</span>, AWS SES के लिए: <span className="font-mono text-gray-400">email-smtp.ap-south-1.amazonaws.com</span>
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-300">
                    SMTP Port
                  </label>
                  <input
                    type="number"
                    value={formData.smtpPort || 465}
                    onChange={(e) => handleChange('smtpPort', Number(e.target.value))}
                    className="w-full bg-[#161616] border border-[#2B2B2B] rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FF9900] font-mono"
                    placeholder="465"
                  />
                  <p className="text-[10px] text-gray-500">
                    465 (SSL) या 587 (TLS/STARTTLS)
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-300">
                    SMTP Username / Email
                  </label>
                  <input
                    type="text"
                    value={formData.smtpUser || ''}
                    onChange={(e) => handleChange('smtpUser', e.target.value)}
                    className="w-full bg-[#161616] border border-[#2B2B2B] rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FF9900] font-mono"
                    placeholder="your-account@gmail.com"
                  />
                  <p className="text-[10px] text-gray-500">
                    खाली रखने पर Candidate Sender Email या .env.local का SMTP_USER प्रयुक्त होगा।
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-300 flex items-center justify-between">
                    <span>SMTP Password / App Password</span>
                    <button
                      type="button"
                      onClick={() => setShowSmtpPass(!showSmtpPass)}
                      className="text-[10px] text-purple-300 hover:text-purple-200 flex items-center gap-1 cursor-pointer"
                    >
                      {showSmtpPass ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      <span>{showSmtpPass ? 'Hide' : 'Show'}</span>
                    </button>
                  </label>
                  <div className="relative">
                    <input
                      type={showSmtpPass ? 'text' : 'password'}
                      value={formData.smtpPass || ''}
                      onChange={(e) => handleChange('smtpPass', e.target.value)}
                      className="w-full bg-[#161616] border border-[#2B2B2B] rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FF9900] font-mono"
                      placeholder="••••••••••••••••"
                    />
                  </div>
                  <p className="text-[10px] text-gray-500">
                    Gmail App Password (16-character code) या SMTP Server Password.
                  </p>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="inline-flex items-center gap-2 text-xs font-semibold text-gray-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.smtpSecure ?? true}
                      onChange={(e) => handleChange('smtpSecure', e.target.checked)}
                      className="w-4 h-4 rounded bg-[#161616] border-[#2B2B2B] text-[#FF9900] focus:ring-0"
                    />
                    <span>Use SSL/TLS Secure Connection (Recommended for Port 465)</span>
                  </label>
                </div>
              </div>

              {/* Gmail Guide Notice */}
              <div className="p-3.5 rounded-lg bg-[#141414] border border-[#292929] text-[11px] text-gray-400 space-y-1">
                <span className="font-semibold text-gray-200 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#FF9900]" />
                  <span>Gmail Users Guide (गूगल जीमेल से ईमेल भेजने के लिए):</span>
                </span>
                <p className="leading-relaxed">
                  1. Google Account &rarr; Security &rarr; 2-Step Verification चालू करें।<br />
                  2. Security &rarr; Search &ldquo;App passwords&rdquo; &rarr; App Name: &ldquo;AWS SBG NIU&rdquo; &rarr; Generate।<br />
                  3. प्राप्त 16 अंकों का पासवर्ड ऊपर &ldquo;SMTP Password&rdquo; में भरें और &ldquo;Save Changes&rdquo; पर क्लिक करें।
                </p>
              </div>
            </div>

            {/* Test Email Dispatch Card */}
            <div id="test-email-section" className="p-5 rounded-xl bg-[#111111] border border-[#2B2B2B] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Send className="w-4 h-4 text-[#FF9900]" />
                    <span>Send Test Email (परीक्षण ईमेल भेजें)</span>
                  </h4>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    सत्यापित करें कि उम्मीदवार को इस ईमेल से सही संदेश और पास प्राप्त हो रहा है।
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="flex-1">
                  <input
                    type="email"
                    value={testEmailAddress}
                    onChange={(e) => {
                      setTestEmailAddress(e.target.value);
                      setTestStatus(null);
                    }}
                    placeholder={formData.candidateSenderEmail || 'admin@niu.ac.in'}
                    className="w-full bg-[#181818] border border-[#333333] rounded-lg px-3.5 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FF9900]"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSendTestEmail}
                  disabled={testLoading}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-[#FF9900] to-[#FFAA22] hover:opacity-95 text-black text-xs font-bold uppercase tracking-wider transition disabled:opacity-50 cursor-pointer shadow-md shadow-[#FF9900]/20"
                >
                  {testLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending Test...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Test Email</span>
                    </>
                  )}
                </button>
              </div>

              {testStatus && (
                <div
                  className={`p-3 rounded-lg border text-xs font-medium flex items-center gap-2.5 ${
                    testStatus.type === 'success'
                      ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                      : 'bg-red-950/40 border-red-500/50 text-red-200'
                  }`}
                >
                  {testStatus.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  )}
                  <span>{testStatus.message}</span>
                </div>
              )}
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

        {/* Tab 6: UPI & Payments */}
        {activeTab === 'payment' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-white font-heading">Official UPI & Community Payment Settings</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Configure the receiving UPI details and QR codes shown to attendees during paid event registration and community supporter pass contributions.
              </p>
            </div>

            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-300">
                    Official Receiving UPI ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.upiId || ''}
                    onChange={(e) => handleChange('upiId', e.target.value)}
                    className="w-full bg-[#161616] border border-[#2B2B2B] rounded-lg px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#FF9900]"
                    placeholder="e.g. aws-sbg@niu or organizer@okhdfcbank"
                  />
                  <span className="text-[11px] text-gray-500 block">
                    All dynamic QR codes and mobile UPI deep links will send payments directly to this UPI ID.
                  </span>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-300">
                    Payee / Account Display Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.upiName || ''}
                    onChange={(e) => handleChange('upiName', e.target.value)}
                    className="w-full bg-[#161616] border border-[#2B2B2B] rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FF9900]"
                    placeholder="e.g. AWS SBG NIU or Noida International University"
                  />
                  <span className="text-[11px] text-gray-500 block">
                    Displayed in the attendee's Google Pay / PhonePe / Paytm payment screen.
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-300">
                  Custom Static QR Image URL (Optional)
                </label>
                <input
                  type="url"
                  value={formData.upiQrImageUrl || ''}
                  onChange={(e) => handleChange('upiQrImageUrl', e.target.value)}
                  className="w-full bg-[#161616] border border-[#2B2B2B] rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FF9900]"
                  placeholder="Leave empty to use automatic dynamic QR code, or paste image URL"
                />
                <span className="text-[11px] text-gray-500 block">
                  If left empty, a crisp dynamic vector QR code will be generated automatically for the exact amount due.
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
