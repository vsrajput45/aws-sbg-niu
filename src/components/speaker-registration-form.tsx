'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  User, Mail, Phone, Building, Briefcase, Globe, 
  FileText, Sparkles, CheckCircle2, AlertCircle, ArrowRight, 
  ArrowLeft, Mic, Video, MapPin, Award
} from 'lucide-react';

function LinkedinIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
    </svg>
  );
}

interface SpeakerRegistrationFormProps {
  tracks: string[];
}

export function SpeakerRegistrationForm({ tracks }: SpeakerRegistrationFormProps) {
  const [step, setStep] = useState<1 | 2>(1);

  // Speaker Profile
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [designation, setDesignation] = useState('');
  const [organization, setOrganization] = useState('');
  const [city, setCity] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [bio, setBio] = useState('');

  // Session Proposal
  const [talkTitle, setTalkTitle] = useState('');
  const [track, setTrack] = useState(tracks[0] || 'Cloud Computing');
  const [sessionFormat, setSessionFormat] = useState('45-min Deep Dive with Live Demo');
  const [deliveryMode, setDeliveryMode] = useState<'in_person' | 'online' | 'flexible'>('in_person');
  const [abstract, setAbstract] = useState('');
  const [prerequisites, setPrerequisites] = useState('');
  const [experienceLinks, setExperienceLinks] = useState('');

  // Status & Submission
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedData, setSubmittedData] = useState<{
    referenceCode: string;
    fullName: string;
    talkTitle: string;
    organization: string;
  } | null>(null);

  const validateStep1 = () => {
    if (!fullName.trim()) return 'Please enter your full name.';
    if (!email.trim() || !email.includes('@')) return 'Please enter a valid email address.';
    if (!phone.trim()) return 'Please enter your contact phone or WhatsApp number.';
    if (!designation.trim()) return 'Please enter your designation or job title.';
    if (!organization.trim()) return 'Please enter your current organization, company, or college.';
    if (!linkedinUrl.trim()) return 'Please provide your LinkedIn profile URL.';
    if (bio.trim().length < 15) return 'Please provide a short speaker bio (at least 15 characters).';
    return null;
  };

  const handleNextStep = () => {
    setError(null);
    const step1Err = validateStep1();
    if (step1Err) {
      setError(step1Err);
      return;
    }
    setStep(2);
    // Smooth scroll to top of form
    const el = document.getElementById('speaker-registration-form');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const step1Err = validateStep1();
    if (step1Err) {
      setStep(1);
      setError(step1Err);
      return;
    }

    if (!talkTitle.trim()) {
      setError('Please enter a session or workshop title.');
      return;
    }
    if (abstract.trim().length < 20) {
      setError('Please describe your talk abstract and what students will learn (at least 20 characters).');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/cfp/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          email,
          phone,
          designation,
          organization,
          city,
          linkedinUrl,
          portfolioUrl,
          bio,
          talkTitle,
          track,
          sessionFormat,
          deliveryMode,
          abstract,
          prerequisites,
          experienceLinks,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit proposal. Please verify your details.');
      }

      setSubmittedData({
        referenceCode: data.referenceCode,
        fullName,
        talkTitle,
        organization,
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmittedData(null);
    setStep(1);
    setFullName('');
    setEmail('');
    setPhone('');
    setDesignation('');
    setOrganization('');
    setCity('');
    setLinkedinUrl('');
    setPortfolioUrl('');
    setBio('');
    setTalkTitle('');
    setAbstract('');
    setPrerequisites('');
    setExperienceLinks('');
    setError(null);
  };

  if (submittedData) {
    return (
      <div id="speaker-registration-form" className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-[#130A2A] via-[#0E0724] to-[#0A041C] border border-[#3B1F70] shadow-2xl space-y-6 text-center max-w-3xl mx-auto">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-950/40">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold text-[#FF9900] uppercase tracking-wider block">
            Proposal Successfully Registered
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-white">
            Thank You, {submittedData.fullName}!
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto">
            Your talk proposal <strong className="text-white">&ldquo;{submittedData.talkTitle}&rdquo;</strong> has been logged in the AWS SBG NIU speaker evaluation registry.
          </p>
        </div>

        {/* Reference Code Card */}
        <div className="p-4 rounded-2xl bg-[#1A0E38] border border-[#4C2A85] max-w-md mx-auto space-y-1">
          <span className="text-[10px] font-mono uppercase text-purple-300 block">
            CFP Application Reference
          </span>
          <span className="text-xl sm:text-2xl font-mono font-bold text-[#FF9900] tracking-wider block">
            {submittedData.referenceCode}
          </span>
          <span className="text-[11px] text-gray-400 block">
            Rolling review updates will be sent to your email.
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href={`/badge?name=${encodeURIComponent(submittedData.fullName)}&role=${encodeURIComponent('Featured Speaker')}`}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-[#7C3AED] via-[#8B5CF6] to-[#A855F7] hover:brightness-110 text-white text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-lg shadow-purple-900/30"
          >
            <Award className="w-4 h-4 text-[#FF9900]" />
            <span>Generate Speaker Badge</span>
          </Link>

          <button
            type="button"
            onClick={handleReset}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#180C36] hover:bg-[#23124D] border border-[#3B1F70] text-slate-200 text-xs font-semibold uppercase tracking-wider transition"
          >
            Submit Another Proposal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      id="speaker-registration-form"
      className="p-6 sm:p-10 rounded-3xl bg-gradient-to-b from-[#130A2A] via-[#0E0724] to-[#0A041C] border border-[#2B1D52] shadow-2xl relative overflow-hidden space-y-8"
    >
      {/* Top Accent Gradient Bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#7C3AED] via-[#EC4899] to-[#FF9900]" />

      {/* Header & Step Tracker */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#231248] pb-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#C084FC] uppercase tracking-wider">
            <Mic className="w-4 h-4 text-[#FF9900]" />
            <span>Official Call for Speakers Form</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-white">
            Register to Speak at AWS SBG NIU
          </h2>
          <p className="text-xs text-slate-300">
            Submit your technical session or workshop proposal for upcoming academic and community events.
          </p>
        </div>

        {/* Step Indicator Tabs */}
        <div className="flex items-center gap-2 bg-[#180C36] p-1.5 rounded-xl border border-[#2B1D52] self-stretch md:self-auto justify-center">
          <button
            type="button"
            onClick={() => setStep(1)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              step === 1
                ? 'bg-[#7C3AED] text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-black/30 flex items-center justify-center text-[10px]">1</span>
            <span>Speaker Profile</span>
          </button>

          <button
            type="button"
            onClick={handleNextStep}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              step === 2
                ? 'bg-[#7C3AED] text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-black/30 flex items-center justify-center text-[10px]">2</span>
            <span>Session Proposal</span>
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-red-950/50 border border-red-800/80 text-red-200 text-xs flex items-start gap-3 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {step === 1 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                  Full Name <span className="text-[#FF9900]">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Dr. Rajesh Kumar"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#14082E] border border-[#2C1854] rounded-xl text-white text-xs placeholder-gray-500 focus:outline-none focus:border-[#C084FC]"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                  Email Address <span className="text-[#FF9900]">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. speaker@cloudcorp.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#14082E] border border-[#2C1854] rounded-xl text-white text-xs placeholder-gray-500 focus:outline-none focus:border-[#C084FC]"
                  />
                </div>
              </div>

              {/* Phone / WhatsApp */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                  Phone / WhatsApp <span className="text-[#FF9900]">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#14082E] border border-[#2C1854] rounded-xl text-white text-xs placeholder-gray-500 focus:outline-none focus:border-[#C084FC]"
                  />
                </div>
              </div>

              {/* Current Designation */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                  Designation / Role <span className="text-[#FF9900]">*</span>
                </label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="e.g. Senior Cloud Architect / AWS Community Builder"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#14082E] border border-[#2C1854] rounded-xl text-white text-xs placeholder-gray-500 focus:outline-none focus:border-[#C084FC]"
                  />
                </div>
              </div>

              {/* Organization / Company */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                  Organization / Company / College <span className="text-[#FF9900]">*</span>
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="e.g. Amazon Web Services / Independent"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#14082E] border border-[#2C1854] rounded-xl text-white text-xs placeholder-gray-500 focus:outline-none focus:border-[#C084FC]"
                  />
                </div>
              </div>

              {/* City & State */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                  City / Location
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Noida / New Delhi / Bengaluru"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#14082E] border border-[#2C1854] rounded-xl text-white text-xs placeholder-gray-500 focus:outline-none focus:border-[#C084FC]"
                  />
                </div>
              </div>

              {/* LinkedIn URL */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                  LinkedIn Profile URL <span className="text-[#FF9900]">*</span>
                </label>
                <div className="relative">
                  <LinkedinIcon className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    required
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="https://linkedin.com/in/your-profile"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#14082E] border border-[#2C1854] rounded-xl text-white text-xs placeholder-gray-500 focus:outline-none focus:border-[#C084FC]"
                  />
                </div>
              </div>

              {/* Portfolio / GitHub / Website */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                  GitHub / Portfolio / Twitter URL (Optional)
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    value={portfolioUrl}
                    onChange={(e) => setPortfolioUrl(e.target.value)}
                    placeholder="https://github.com/your-handle"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#14082E] border border-[#2C1854] rounded-xl text-white text-xs placeholder-gray-500 focus:outline-none focus:border-[#C084FC]"
                  />
                </div>
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                Short Speaker Bio <span className="text-[#FF9900]">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="2-4 sentences introducing your cloud experience, notable projects, and community roles for the conference agenda..."
                className="w-full p-3 bg-[#14082E] border border-[#2C1854] rounded-xl text-white text-xs placeholder-gray-500 focus:outline-none focus:border-[#C084FC]"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleNextStep}
                className="px-7 py-3 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#A855F7] hover:brightness-110 text-white text-xs font-bold uppercase tracking-wider transition flex items-center gap-2 shadow-lg shadow-purple-950/40"
              >
                <span>Continue to Session Proposal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* Talk Title */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                Proposed Talk / Workshop Title <span className="text-[#FF9900]">*</span>
              </label>
              <div className="relative">
                <FileText className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={talkTitle}
                  onChange={(e) => setTalkTitle(e.target.value)}
                  placeholder="e.g. Architecting Scalable GenAI Workflows on Amazon Bedrock"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#14082E] border border-[#2C1854] rounded-xl text-white text-xs placeholder-gray-500 focus:outline-none focus:border-[#C084FC]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Technical Domain / Track */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                  Session Track / Category <span className="text-[#FF9900]">*</span>
                </label>
                <select
                  value={track}
                  onChange={(e) => setTrack(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#14082E] border border-[#2C1854] rounded-xl text-white text-xs focus:outline-none focus:border-[#C084FC]"
                >
                  {tracks.map((t) => (
                    <option key={t} value={t} className="bg-[#0E0724] text-white">
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {/* Session Format */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                  Session Format <span className="text-[#FF9900]">*</span>
                </label>
                <select
                  value={sessionFormat}
                  onChange={(e) => setSessionFormat(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#14082E] border border-[#2C1854] rounded-xl text-white text-xs focus:outline-none focus:border-[#C084FC]"
                >
                  <option value="30-min Technical Presentation" className="bg-[#0E0724] text-white">
                    30-min Technical Presentation
                  </option>
                  <option value="45-min Deep Dive with Live Demo" className="bg-[#0E0724] text-white">
                    45-min Deep Dive with Live Demo
                  </option>
                  <option value="90-min Hands-on Coding Lab / Workshop" className="bg-[#0E0724] text-white">
                    90-min Hands-on Coding Lab / Workshop
                  </option>
                  <option value="45-min Panel Discussion / Fireside Chat" className="bg-[#0E0724] text-white">
                    45-min Panel Discussion / Fireside Chat
                  </option>
                </select>
              </div>
            </div>

            {/* Delivery Mode */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                Preferred Mode of Delivery <span className="text-[#FF9900]">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { value: 'in_person', label: 'In-Person at NIU Campus', sub: 'Auditorium Stage' },
                  { value: 'online', label: 'Online / Virtual Session', sub: 'Remote Webinar' },
                  { value: 'flexible', label: 'Flexible / Either Mode', sub: 'Organizer Preference' },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setDeliveryMode(item.value as any)}
                    className={`p-3.5 rounded-xl border text-left transition ${
                      deliveryMode === item.value
                        ? 'bg-[#2B1854] border-[#C084FC] text-white ring-1 ring-[#C084FC]'
                        : 'bg-[#14082E] border-[#2C1854] text-slate-300 hover:border-purple-600/40'
                    }`}
                  >
                    <span className="text-xs font-bold block">{item.label}</span>
                    <span className="text-[10px] text-gray-400 mt-0.5 block">{item.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Abstract */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                Talk Abstract &amp; Student Key Takeaways <span className="text-[#FF9900]">*</span>
              </label>
              <textarea
                required
                rows={4}
                value={abstract}
                onChange={(e) => setAbstract(e.target.value)}
                placeholder="Describe what your session covers, the architecture involved, and what tangible cloud skills student builders will take away..."
                className="w-full p-3 bg-[#14082E] border border-[#2C1854] rounded-xl text-white text-xs placeholder-gray-500 focus:outline-none focus:border-[#C084FC]"
              />
            </div>

            {/* Prerequisites */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                Prerequisites &amp; What Students Should Bring (Optional)
              </label>
              <input
                type="text"
                value={prerequisites}
                onChange={(e) => setPrerequisites(e.target.value)}
                placeholder="e.g. Free-tier AWS account, laptop with VS Code and AWS CLI installed"
                className="w-full px-4 py-2.5 bg-[#14082E] border border-[#2C1854] rounded-xl text-white text-xs placeholder-gray-500 focus:outline-none focus:border-[#C084FC]"
              />
            </div>

            {/* Video / Slide Deck Links */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                Previous Talk Video, Slides, or GitHub Repo (Optional)
              </label>
              <div className="relative">
                <Video className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  value={experienceLinks}
                  onChange={(e) => setExperienceLinks(e.target.value)}
                  placeholder="https://youtube.com/... or https://speakerdeck.com/..."
                  className="w-full pl-10 pr-4 py-2.5 bg-[#14082E] border border-[#2C1854] rounded-xl text-white text-xs placeholder-gray-500 focus:outline-none focus:border-[#C084FC]"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-[#231248]">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-5 py-3 rounded-xl bg-[#14082E] hover:bg-[#1E0F42] border border-[#2C1854] text-slate-300 text-xs font-semibold uppercase tracking-wider transition flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#7C3AED] via-[#8B5CF6] to-[#A855F7] hover:brightness-110 text-white text-xs font-bold uppercase tracking-wider transition-all hover:scale-[1.02] shadow-lg shadow-purple-900/40 flex items-center gap-2 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 text-[#FF9900]" />
                <span>{submitting ? 'Submitting Proposal...' : 'Submit Speaker Proposal'}</span>
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
