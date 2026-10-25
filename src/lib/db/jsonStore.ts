import fs from 'fs';
import path from 'path';
import os from 'os';
import { 
  EventRecord, 
  RegistrationRecord, 
  ProfileRecord, 
  SiteSettingsRecord, 
  TeamMemberRecord,
  BadgeApplicationRecord,
  BadgeStatus,
  PaymentStatus,
  SpeakerProposalRecord,
  SpeakerProposalStatus,
  SpeakerDeliveryMode
} from './types';
import { initialProfiles, sampleDraftEvent, initialRegistrations, initialTeamMembers } from './seed';
import { getSupabaseClient, isSupabaseConfigured } from './supabaseClient';

interface DatabaseData {
  profiles: ProfileRecord[];
  events: EventRecord[];
  registrations: RegistrationRecord[];
  site_settings?: SiteSettingsRecord;
  team?: TeamMemberRecord[];
  badges?: BadgeApplicationRecord[];
  speaker_proposals?: SpeakerProposalRecord[];
}

// In-memory cache for ultra-fast reads and fallback in serverless environments (Netlify, AWS Lambda)
let memoryCache: DatabaseData | null = null;

function getDataPaths() {
  const localDir = path.join(process.cwd(), '.data');
  const localFile = path.join(localDir, 'db.json');

  const isServerless = Boolean(
    process.env.NETLIFY || 
    process.env.VERCEL || 
    process.env.AWS_LAMBDA_FUNCTION_NAME || 
    process.env.LAMBDA_TASK_ROOT
  );

  if (isServerless) {
    const tmpDir = path.join(os.tmpdir(), 'aws-sbg-niu-data');
    const tmpFile = path.join(tmpDir, 'db.json');
    return { dataDir: tmpDir, dbFile: tmpFile, seedFile: localFile };
  }

  return { dataDir: localDir, dbFile: localFile, seedFile: localFile };
}

export const defaultSiteSettings: SiteSettingsRecord = {
  chapterName: "AWS Student Builder Group at Noida International University",
  shortName: "AWS SBG NIU",
  tagline: "Student-led cloud community innovating with Amazon Web Services",
  universityName: "Noida International University",
  campusVenue: "Main Auditorium, Block C",
  city: "Noida, IN",
  fullLocation: "Noida International University, Greater Noida, Uttar Pradesh, Delhi NCR, India",
  mapsUrl: "https://maps.google.com/?q=Noida+International+University+Greater+Noida",
  appleMapsUrl: "https://maps.apple.com/?q=Noida+International+University+Greater+Noida",
  foundedDate: "2026-09-19",
  memberCountSnapshot: 52,
  snapshotAsOf: "October 2026",
  officialEmail: "aws.sbg@niu.ac.in",
  meetupUrl: "https://www.meetup.com/aws-sbg-at-noida-international-university/",
  instagramUrl: "",
  githubUrl: "",
  linkedinUrl: "",
  twitterUrl: "",
  discordUrl: "",
  upiId: "aws-sbg@niu",
  upiName: "AWS SBG NIU",
  upiQrImageUrl: "",
  speakerInterestForm: "/cfp#speaker-registration-form",
  sponsorForm: "/sponsors",
  aboutHeadline: "Built by the Community, for the Community.",
  aboutDescription: "The AWS Student Builder Group at Noida International University is a student-led, student-driven academic community dedicated to learning, building, and innovating with Amazon Web Services.\n\nWe bridge the gap between classroom theory and real-world industry demands. Through hands-on AWS projects, architectural workshops, and peer mentorship, our members gain deep technical proficiency alongside strategic business acumen.\n\nWhether you are passionate about cloud architecture, cybersecurity, generative AI, machine learning, robotics, or business transformation, this community provides the collaborative launchpad to turn concepts into production cloud systems.",
  marqueeTopics: [
    "Cloud Computing",
    "Generative AI",
    "Serverless",
    "DevOps",
    "Machine Learning",
    "AWS Lambda",
    "Amazon ECS",
    "Infrastructure as Code",
    "Kubernetes",
    "Data Engineering",
    "Security on AWS",
    "CI/CD",
    "Robotics",
    "Business Analytics",
  ],
};

function ensureDbFile(): DatabaseData {
  if (memoryCache) {
    return memoryCache;
  }

  const { dataDir, dbFile, seedFile } = getDataPaths();

  try {
    if (fs.existsSync(/*turbopackIgnore: true*/ dbFile)) {
      const raw = fs.readFileSync(/*turbopackIgnore: true*/ dbFile, 'utf-8');
      const parsed: DatabaseData = JSON.parse(raw);
      let needsRewrite = false;
      if (!parsed.site_settings) {
        parsed.site_settings = { ...defaultSiteSettings };
        needsRewrite = true;
      }
      if (!parsed.team || parsed.team.length === 0) {
        parsed.team = [...initialTeamMembers];
        needsRewrite = true;
      } else {
        // Ensure any new official team members (e.g. Khusi Kumari) are merged if missing
        for (const initial of initialTeamMembers) {
          if (!parsed.team.some((m) => m.id === initial.id || m.name.toLowerCase().trim() === initial.name.toLowerCase().trim())) {
            parsed.team.push({ ...initial });
            needsRewrite = true;
          }
        }
      }
      if (!parsed.events) {
        parsed.events = [];
        needsRewrite = true;
      }
      if (!parsed.badges) {
        parsed.badges = [];
        needsRewrite = true;
      }
      if (!parsed.speaker_proposals) {
        parsed.speaker_proposals = [];
        needsRewrite = true;
      }
      if (needsRewrite) {
        try {
          fs.writeFileSync(/*turbopackIgnore: true*/ dbFile, JSON.stringify(parsed, null, 2), 'utf-8');
        } catch {
          // Ignore read-only write failure
        }
      }
      memoryCache = parsed;
      return parsed;
    }
  } catch (err) {
    console.warn('Could not read from dbFile:', err);
  }

  try {
    if (!fs.existsSync(/*turbopackIgnore: true*/ dataDir)) {
      fs.mkdirSync(/*turbopackIgnore: true*/ dataDir, { recursive: true });
    }

    if (!fs.existsSync(/*turbopackIgnore: true*/ dbFile)) {
      // If a pre-packaged db.json exists in the repository, baseline from it
      if (seedFile !== dbFile && fs.existsSync(/*turbopackIgnore: true*/ seedFile)) {
        try {
          const seedContent = fs.readFileSync(/*turbopackIgnore: true*/ seedFile, 'utf-8');
          const seedData = JSON.parse(seedContent);
          fs.writeFileSync(/*turbopackIgnore: true*/ dbFile, seedContent, 'utf-8');
          memoryCache = seedData;
          return seedData;
        } catch {
          // Fallback to code defaults below
        }
      }

      const initialData: DatabaseData = {
        profiles: initialProfiles,
        events: [sampleDraftEvent], // starts with ONE clearly-labelled draft event
        registrations: initialRegistrations,
        site_settings: { ...defaultSiteSettings },
        team: [...initialTeamMembers],
        badges: [],
        speaker_proposals: [],
      };
      try {
        fs.writeFileSync(/*turbopackIgnore: true*/ dbFile, JSON.stringify(initialData, null, 2), 'utf-8');
      } catch (e) {
        console.warn('Could not write initial db.json to disk, using in-memory store:', e);
      }
      memoryCache = initialData;
      return initialData;
    }

    const raw = fs.readFileSync(/*turbopackIgnore: true*/ dbFile, 'utf-8');
    const parsed: DatabaseData = JSON.parse(raw);
    let needsRewrite = false;

    if (!parsed.site_settings) {
      parsed.site_settings = { ...defaultSiteSettings };
      needsRewrite = true;
    }
    if (!parsed.team || parsed.team.length === 0) {
      parsed.team = [...initialTeamMembers];
      needsRewrite = true;
    }
    if (!parsed.badges) {
      parsed.badges = [
        {
          id: 'bdg-sample-1',
          code: 'NIU-AWS-2026-5645',
          full_name: 'Aarav Sharma',
          email: 'aarav.sharma@niu.ac.in',
          role: 'Community Builder',
          institution: 'Noida International University',
          photo_url: null,
          source: 'community_donation',
          donation_amount: 99,
          donation_utr: 'UPI/2026/89342918',
          status: 'verified',
          qr_payload: 'https://aws-sbg-niu.ac.in/verify/NIU-AWS-2026-5645',
          access_level: 'Full Conference & Workshops',
          theme: 'sbg',
          verified_by: 'Admin',
          verified_at: '2026-10-22T10:00:00.000Z',
          created_at: '2026-10-22T09:30:00.000Z',
          updated_at: '2026-10-22T10:00:00.000Z',
        },
        {
          id: 'bdg-sample-2',
          code: 'NIU-AWS-2026-8812',
          full_name: 'Neha Sharma',
          email: 'neha.sharma@niu.ac.in',
          role: 'Official Attendee',
          institution: 'Noida International University',
          photo_url: null,
          source: 'event_registration',
          event_id: 'e1000000-0000-0000-0000-000000000001',
          event_title: 'AWS Cloud Discovery Day & Hands-on Lab',
          registration_code: 'NIUSBG-AWSCLO-ATT-Q6LI',
          donation_amount: 0,
          status: 'verified',
          qr_payload: 'https://aws-sbg-niu.ac.in/verify/NIU-AWS-2026-8812',
          access_level: 'Full Conference & Workshops',
          theme: 'sbg',
          verified_by: 'System (Event Match)',
          verified_at: '2026-10-23T11:00:00.000Z',
          created_at: '2026-10-23T11:00:00.000Z',
          updated_at: '2026-10-23T11:00:00.000Z',
        },
        {
          id: 'bdg-sample-3',
          code: 'NIU-AWS-2026-3914',
          full_name: 'Priyanshu Verma',
          email: 'priyanshu.v@gmail.com',
          role: 'Community Builder',
          institution: 'Delhi Technological University',
          photo_url: null,
          source: 'community_donation',
          donation_amount: 49,
          donation_utr: 'UPI/2026/77102941',
          status: 'pending',
          qr_payload: 'https://aws-sbg-niu.ac.in/verify/NIU-AWS-2026-3914',
          access_level: 'Full Conference & Workshops',
          theme: 'classic',
          created_at: '2026-10-23T14:15:00.000Z',
          updated_at: '2026-10-23T14:15:00.000Z',
        },
      ];
      needsRewrite = true;
    }

    if (!parsed.speaker_proposals) {
      parsed.speaker_proposals = [];
      needsRewrite = true;
    }

    if (needsRewrite) {
      try {
        fs.writeFileSync(/*turbopackIgnore: true*/ dbFile, JSON.stringify(parsed, null, 2), 'utf-8');
      } catch {
        // Ignore read-only write failure
      }
    }
    memoryCache = parsed;
    return parsed;
  } catch (error) {
    console.error('Error reading db.json, using fallback:', error);
    const fallback: DatabaseData = {
      profiles: initialProfiles,
      events: [sampleDraftEvent],
      registrations: initialRegistrations,
      site_settings: { ...defaultSiteSettings },
      team: [...initialTeamMembers],
    };
    memoryCache = fallback;
    return fallback;
  }
}

function writeDbFile(data: DatabaseData) {
  memoryCache = data;

  // 1. Asynchronously persist to Supabase if configured (for Vercel serverless)
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseClient();
      if (supabase) {
        void (async () => {
          try {
            const { error } = await supabase
              .from('app_state')
              .upsert({
                id: 'aws_sbg_niu',
                data,
                updated_at: new Date().toISOString(),
              });
            if (error) console.error('Supabase write error:', error);
          } catch (err: unknown) {
            console.error('Supabase write exception:', err);
          }
        })();
      }
    } catch (e) {
      console.warn('Supabase write call failed:', e);
    }
  }

  // 2. Persist to local disk (development) or /tmp (serverless)
  const { dataDir, dbFile } = getDataPaths();

  try {
    if (!fs.existsSync(/*turbopackIgnore: true*/ dataDir)) {
      fs.mkdirSync(/*turbopackIgnore: true*/ dataDir, { recursive: true });
    }
    const tempFile = `${dbFile}.tmp`;
    fs.writeFileSync(/*turbopackIgnore: true*/ tempFile, JSON.stringify(data, null, 2), 'utf-8');
    try {
      fs.renameSync(/*turbopackIgnore: true*/ tempFile, dbFile);
    } catch {
      // Fallback for Windows if rename fails due to open handle or lock
      fs.writeFileSync(/*turbopackIgnore: true*/ dbFile, JSON.stringify(data, null, 2), 'utf-8');
      try {
        fs.unlinkSync(/*turbopackIgnore: true*/ tempFile);
      } catch {}
    }
  } catch (err) {
    console.warn('Disk write failed (likely read-only serverless environment), kept in memoryCache:', err);
  }
}

export const dbStore = {
  // Cloud Sync for Vercel / Production
  async ensureLoaded(): Promise<DatabaseData> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabaseClient();
        if (supabase) {
          const { data, error } = await supabase
            .from('app_state')
            .select('data')
            .eq('id', 'aws_sbg_niu')
            .maybeSingle();

          if (data && data.data) {
            const parsed = data.data as DatabaseData;
            if (!parsed.team || parsed.team.length === 0) {
              parsed.team = [...initialTeamMembers];
            } else {
              let changed = false;
              for (const initial of initialTeamMembers) {
                if (!parsed.team.some((m) => m.id === initial.id || m.name.toLowerCase().trim() === initial.name.toLowerCase().trim())) {
                  parsed.team.push({ ...initial });
                  changed = true;
                }
              }
              if (changed) {
                void supabase.from('app_state').upsert({
                  id: 'aws_sbg_niu',
                  data: parsed,
                  updated_at: new Date().toISOString(),
                });
              }
            }
            memoryCache = parsed;
            return memoryCache;
          }

          // If no row exists yet in Supabase, seed it with the current local dataset
          if (!data || !data.data) {
            const seed = ensureDbFile();
            await supabase.from('app_state').upsert({
              id: 'aws_sbg_niu',
              data: seed,
              updated_at: new Date().toISOString(),
            });
            memoryCache = seed;
            return seed;
          }
        }
      } catch (err) {
        console.warn('Could not load from Supabase app_state table, falling back to local store:', err);
      }
    }

    return ensureDbFile();
  },

  async syncToCloud(data?: DatabaseData): Promise<void> {
    const target = data || memoryCache || ensureDbFile();
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase.from('app_state').upsert({
          id: 'aws_sbg_niu',
          data: target,
          updated_at: new Date().toISOString(),
        });
      }
    }
    writeDbFile(target);
  },
  // Profiles
  getProfiles(): ProfileRecord[] {
    const db = ensureDbFile();
    return db.profiles;
  },

  getProfileByEmail(email: string): ProfileRecord | undefined {
    const db = ensureDbFile();
    return db.profiles.find((p) => p.email.toLowerCase() === email.toLowerCase());
  },

  // Events
  getAllEvents(includeDrafts = false): EventRecord[] {
    const db = ensureDbFile();
    const list = includeDrafts ? db.events : db.events.filter((e) => e.status === 'published');
    return list.map((e) => this.hydrateEvent(e, db.registrations));
  },

  getEventBySlug(slug: string, includeDrafts = false): EventRecord | null {
    const db = ensureDbFile();
    const event = db.events.find((e) => e.slug === slug);
    if (!event) return null;
    if (!includeDrafts && event.status !== 'published') return null;
    return this.hydrateEvent(event, db.registrations);
  },

  getEventById(id: string, includeDrafts = false): EventRecord | null {
    const db = ensureDbFile();
    const event = db.events.find((e) => e.id === id);
    if (!event) return null;
    if (!includeDrafts && event.status !== 'published') return null;
    return this.hydrateEvent(event, db.registrations);
  },

  getFeaturedUpcomingEvent(): EventRecord | null {
    const db = ensureDbFile();
    // Only published events
    const published = db.events.filter((e) => e.status === 'published');
    if (published.length === 0) return null;

    // Sort upcoming first
    const today = new Date().toISOString().split('T')[0];
    const upcoming = published
      .filter((e) => e.event_date >= today)
      .sort((a, b) => a.event_date.localeCompare(b.event_date));

    if (upcoming.length > 0) {
      // Pick featured if marked, else earliest upcoming
      const featured = upcoming.find((e) => e.featured) || upcoming[0];
      return this.hydrateEvent(featured, db.registrations);
    }

    return null;
  },

  saveEvent(eventData: Partial<EventRecord> & { id?: string; title: string; slug: string }): EventRecord {
    const db = ensureDbFile();
    const now = new Date().toISOString();
    const existingIndex = db.events.findIndex((e) => e.id === eventData.id || e.slug === eventData.slug);

    if (existingIndex >= 0) {
      const existing = db.events[existingIndex];
      const updated: EventRecord = {
        ...existing,
        ...eventData,
        id: existing.id,
        updated_at: now,
      };
      db.events[existingIndex] = updated;
      writeDbFile(db);
      return this.hydrateEvent(updated, db.registrations);
    } else {
      const newEvent: EventRecord = {
        id: eventData.id || `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        slug: eventData.slug,
        title: eventData.title,
        summary: eventData.summary || '',
        description_md: eventData.description_md || '',
        banner_url: eventData.banner_url || '/hero.jpg',
        category: eventData.category || 'Workshop',
        tags: eventData.tags || [],
        status: eventData.status || 'draft',
        featured: !!eventData.featured,
        event_date: eventData.event_date || now.split('T')[0],
        start_time: eventData.start_time || '10:00 AM',
        end_time: eventData.end_time || '04:00 PM',
        timezone: eventData.timezone || 'Asia/Kolkata',
        mode: eventData.mode || 'offline',
        venue_name: eventData.venue_name || null,
        venue_address: eventData.venue_address || null,
        maps_url: eventData.maps_url || null,
        join_link: eventData.join_link || null,
        platform: eventData.platform || null,
        registration_type: eventData.registration_type || 'site',
        meetup_event_url: eventData.meetup_event_url || null,
        capacity: eventData.capacity !== undefined ? eventData.capacity : 100,
        waitlist_enabled: eventData.waitlist_enabled ?? true,
        registration_opens_at: eventData.registration_opens_at || null,
        registration_deadline: eventData.registration_deadline || null,
        registration_manual_state: eventData.registration_manual_state || 'auto',
        fee_type: eventData.fee_type || 'free',
        fee_note: eventData.fee_note || null,
        payment_link: eventData.payment_link || null,
        prerequisites: eventData.prerequisites || null,
        what_to_bring: eventData.what_to_bring || null,
        certificate: eventData.certificate ?? true,
        contact_email: eventData.contact_email || 'community@niu.ac.in',
        custom_questions: eventData.custom_questions || [],
        allowed_roles: eventData.allowed_roles || ['attendee', 'speaker', 'sponsor', 'volunteer'],
        created_by: eventData.created_by || 'admin',
        created_at: now,
        updated_at: now,
        speakers: eventData.speakers || [],
        agenda: eventData.agenda || [],
      };
      db.events.push(newEvent);
      writeDbFile(db);
      return this.hydrateEvent(newEvent, db.registrations);
    }
  },

  deleteEvent(id: string): boolean {
    const db = ensureDbFile();
    const idx = db.events.findIndex((e) => e.id === id);
    if (idx === -1) return false;
    db.events.splice(idx, 1);
    writeDbFile(db);
    return true;
  },

  // Registrations
  getRegistrationsForEvent(eventId: string): RegistrationRecord[] {
    const db = ensureDbFile();
    return db.registrations.filter((r) => r.event_id === eventId);
  },

  getAllRegistrations(): RegistrationRecord[] {
    const db = ensureDbFile();
    return db.registrations.map((r) => {
      const evt = db.events.find((e) => e.id === r.event_id);
      return { ...r, event_title: evt ? evt.title : 'Unknown Event' };
    });
  },

  getRegistrationByCode(code: string): RegistrationRecord | null {
    const db = ensureDbFile();
    return db.registrations.find((r) => r.registration_code.toLowerCase() === code.toLowerCase()) || null;
  },

  createRegistration(params: {
    eventId: string;
    role?: 'attendee' | 'speaker' | 'sponsor' | 'volunteer';
    fullName: string;
    email: string;
    phone: string;
    college?: string;
    courseYear?: string;
    collegeId?: string;
    hearAbout?: string;
    customAnswers?: Record<string, string>;

    // Speaker fields
    topicTitle?: string;
    topicAbstract?: string;
    speakerBio?: string;
    portfolioOrLinkedin?: string;
    previousSpeakingLinks?: string;

    // Sponsor fields
    companyName?: string;
    companyWebsite?: string;
    sponsorTierInterest?: string;
    designation?: string;
    sponsorshipNotes?: string;

    // Volunteer fields
    volunteerInterest?: string;
    volunteerExperience?: string;

    // Payment fields
    paymentUtr?: string;
  }): { registration?: RegistrationRecord; error?: string; alreadyRegistered?: boolean } {
    const db = ensureDbFile();
    const event = db.events.find((e) => e.id === params.eventId);
    if (!event) {
      return { error: 'Event not found.' };
    }

    if (event.status !== 'published') {
      return { error: 'Registration is not available for unpublished events.' };
    }

    // Check manual override
    if (event.registration_manual_state === 'closed') {
      return { error: 'Registration for this event has been closed by the organizers.' };
    }

    // Check dates if auto
    const now = new Date();
    if (event.registration_opens_at && new Date(event.registration_opens_at) > now) {
      return { error: 'Registration has not opened yet.' };
    }
    if (event.registration_deadline && new Date(event.registration_deadline) < now) {
      return { error: 'Registration deadline has passed.' };
    }

    const role = params.role || 'attendee';

    // Verify role is accepted by this event if allowed_roles is specified
    if (event.allowed_roles && event.allowed_roles.length > 0 && !event.allowed_roles.includes(role)) {
      return { error: `Registration for the '${role}' role is not open for this event.` };
    }

    // Duplicate check: (event_id, lower(email), role)
    const normalizedEmail = params.email.trim().toLowerCase();
    const existing = db.registrations.find(
      (r) => r.event_id === params.eventId && r.email.toLowerCase() === normalizedEmail && (r.role || 'attendee') === role && r.status !== 'cancelled'
    );

    if (existing) {
      return {
        registration: existing,
        alreadyRegistered: true,
      };
    }

    // Capacity & Waitlist check: strictly applies to Attendees
    let status: 'confirmed' | 'waitlisted' = 'confirmed';
    if (role === 'attendee') {
      const currentConfirmedAttendees = db.registrations.filter(
        (r) => r.event_id === params.eventId && (r.role || 'attendee') === 'attendee' && r.status === 'confirmed'
      ).length;

      if (event.capacity && currentConfirmedAttendees >= event.capacity) {
        if (event.waitlist_enabled) {
          status = 'waitlisted';
        } else {
          return { error: 'This event has reached full capacity and attendee registration is closed.' };
        }
      }
    }

    // Generate unique Registration Code
    // Format: NIUSBG-<cleanSlug>-<roleCode>-<suffix>
    const cleanSlug = event.slug.replace(/[^a-zA-Z0-9]/g, '').substring(0, 6).toUpperCase();
    const roleCode = role === 'speaker' ? 'SPK' : role === 'sponsor' ? 'SPN' : role === 'volunteer' ? 'VOL' : 'ATT';
    const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const registrationCode = `NIUSBG-${cleanSlug}-${roleCode}-${suffix}`;

    const newRegistration: RegistrationRecord = {
      id: `reg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      event_id: params.eventId,
      registration_code: registrationCode,
      role,
      full_name: params.fullName.trim(),
      email: normalizedEmail,
      phone: params.phone.trim(),
      college: (params.college || 'N/A').trim(),
      course_year: (params.courseYear || 'N/A').trim(),
      college_id: params.collegeId ? params.collegeId.trim() : null,
      hear_about: params.hearAbout || 'Community Announcement',
      custom_answers: params.customAnswers || {},
      status,
      checked_in: false,
      checked_in_at: null,
      created_at: new Date().toISOString(),

      // Role-specific fields
      topic_title: params.topicTitle?.trim() || null,
      topic_abstract: params.topicAbstract?.trim() || null,
      speaker_bio: params.speakerBio?.trim() || null,
      portfolio_or_linkedin: params.portfolioOrLinkedin?.trim() || null,
      previous_speaking_links: params.previousSpeakingLinks?.trim() || null,

      company_name: params.companyName?.trim() || null,
      company_website: params.companyWebsite?.trim() || null,
      sponsor_tier_interest: params.sponsorTierInterest?.trim() || null,
      designation: params.designation?.trim() || null,
      sponsorship_notes: params.sponsorshipNotes?.trim() || null,

      volunteer_interest: params.volunteerInterest?.trim() || null,
      volunteer_experience: params.volunteerExperience?.trim() || null,

      // Payment
      payment_utr: params.paymentUtr?.trim() || null,
      payment_status: params.paymentUtr ? 'pending' : (event.fee_type === 'paid' ? 'unpaid' : 'verified'),
    };

    db.registrations.push(newRegistration);
    writeDbFile(db);

    return { registration: newRegistration };
  },

  toggleCheckIn(registrationId: string): RegistrationRecord | null {
    const db = ensureDbFile();
    const reg = db.registrations.find((r) => r.id === registrationId);
    if (!reg) return null;

    reg.checked_in = !reg.checked_in;
    reg.checked_in_at = reg.checked_in ? new Date().toISOString() : null;
    writeDbFile(db);
    return reg;
  },

  updateRegistrationStatus(registrationId: string, newStatus: 'confirmed' | 'waitlisted' | 'cancelled'): RegistrationRecord | null {
    const db = ensureDbFile();
    const reg = db.registrations.find((r) => r.id === registrationId);
    if (!reg) return null;

    reg.status = newStatus;
    writeDbFile(db);
    return reg;
  },

  updatePaymentStatus(
    registrationId: string, 
    newPaymentStatus: 'verified' | 'unpaid' | 'pending' | 'refunded',
    paymentUtr?: string
  ): RegistrationRecord | null {
    const db = ensureDbFile();
    const reg = db.registrations.find((r) => r.id === registrationId);
    if (!reg) return null;

    reg.payment_status = newPaymentStatus;
    if (paymentUtr !== undefined) {
      reg.payment_utr = paymentUtr;
    }
    writeDbFile(db);
    return reg;
  },

  removeRegistration(registrationId: string): boolean {
    const db = ensureDbFile();
    const idx = db.registrations.findIndex((r) => r.id === registrationId);
    if (idx === -1) return false;

    const [removed] = db.registrations.splice(idx, 1);

    // If a confirmed attendee is removed, auto-promote waitlist #1 if waitlist is active
    if (removed.status === 'confirmed' && (removed.role || 'attendee') === 'attendee') {
      const waitlisted = db.registrations
        .filter((r) => r.event_id === removed.event_id && (r.role || 'attendee') === 'attendee' && r.status === 'waitlisted')
        .sort((a, b) => a.created_at.localeCompare(b.created_at));

      if (waitlisted.length > 0) {
        waitlisted[0].status = 'confirmed';
      }
    }

    writeDbFile(db);
    return true;
  },

  promoteWaitlist(eventId: string): number {
    const db = ensureDbFile();
    const event = db.events.find((e) => e.id === eventId);
    if (!event) return 0;

    const confirmedCount = db.registrations.filter((r) => r.event_id === eventId && (r.role || 'attendee') === 'attendee' && r.status === 'confirmed').length;
    const capacity = event.capacity || 999999;
    const available = Math.max(0, capacity - confirmedCount);

    if (available <= 0) return 0;

    const waitlisted = db.registrations
      .filter((r) => r.event_id === eventId && (r.role || 'attendee') === 'attendee' && r.status === 'waitlisted')
      .sort((a, b) => a.created_at.localeCompare(b.created_at));

    const toPromote = waitlisted.slice(0, available);
    toPromote.forEach((r) => {
      r.status = 'confirmed';
    });

    writeDbFile(db);
    return toPromote.length;
  },

  // Helper
  hydrateEvent(event: EventRecord, allRegistrations: RegistrationRecord[]): EventRecord {
    const eventRegs = allRegistrations.filter((r) => r.event_id === event.id);
    const confirmedCount = eventRegs.filter((r) => (r.role || 'attendee') === 'attendee' && r.status === 'confirmed').length;
    const waitlistedCount = eventRegs.filter((r) => (r.role || 'attendee') === 'attendee' && r.status === 'waitlisted').length;

    return {
      ...event,
      confirmed_count: confirmedCount,
      waitlisted_count: waitlistedCount,
      speakers: event.speakers || [],
      agenda: event.agenda || [],
    };
  },

  // Site Settings Management
  getSiteSettings(): SiteSettingsRecord {
    const db = ensureDbFile();
    if (!db.site_settings) {
      db.site_settings = { ...defaultSiteSettings };
      writeDbFile(db);
    }
    return db.site_settings;
  },

  updateSiteSettings(partial: Partial<SiteSettingsRecord>): SiteSettingsRecord {
    const db = ensureDbFile();
    const current = db.site_settings || { ...defaultSiteSettings };
    db.site_settings = {
      ...current,
      ...partial,
      updated_at: new Date().toISOString(),
    };
    writeDbFile(db);
    return db.site_settings;
  },

  resetSiteSettings(): SiteSettingsRecord {
    const db = ensureDbFile();
    db.site_settings = {
      ...defaultSiteSettings,
      updated_at: new Date().toISOString(),
    };
    writeDbFile(db);
    return db.site_settings;
  },

  // Core Team Management
  getTeamMembers(): TeamMemberRecord[] {
    const db = ensureDbFile();
    if (!db.team || db.team.length === 0) {
      db.team = [...initialTeamMembers];
      writeDbFile(db);
    }
    return [...db.team].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  },

  getTeamMemberById(id: string): TeamMemberRecord | undefined {
    const members = this.getTeamMembers();
    return members.find((m) => m.id === id);
  },

  saveTeamMember(data: Partial<TeamMemberRecord> & { name: string; role: string }): TeamMemberRecord {
    const db = ensureDbFile();
    if (!db.team) {
      db.team = [...initialTeamMembers];
    }

    const now = new Date().toISOString();
    const existingIndex = data.id ? db.team.findIndex((m) => m.id === data.id) : -1;

    const initials = (data.name || 'Member')
      .split(/\s+/)
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 3);

    if (existingIndex >= 0) {
      const existing = db.team[existingIndex];
      const updated: TeamMemberRecord = {
        ...existing,
        ...data,
        id: existing.id,
        initials: data.initials || existing.initials || initials,
        cardUrl: data.cardUrl || data.avatarUrl || existing.cardUrl,
        updated_at: now,
      };
      db.team[existingIndex] = updated;
      writeDbFile(db);
      return updated;
    } else {
      const maxSortOrder = db.team.reduce((max, m) => Math.max(max, m.sort_order ?? 0), 0);
      const newMember: TeamMemberRecord = {
        id: data.id || `tm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: data.name,
        role: data.role,
        department: data.department || 'Computer Science & Engineering',
        bio: data.bio || '',
        avatarUrl: data.avatarUrl || '/sbg-logo.svg',
        cardUrl: data.cardUrl || data.avatarUrl || '/sbg-logo.svg',
        initials: data.initials || initials,
        session: data.session || '2026-27',
        badge: data.badge || 'Leadership Core',
        sort_order: data.sort_order !== undefined ? data.sort_order : maxSortOrder + 1,
        linkedin_url: data.linkedin_url || '',
        github_url: data.github_url || '',
        created_at: now,
        updated_at: now,
      };
      db.team.push(newMember);
      writeDbFile(db);
      return newMember;
    }
  },

  deleteTeamMember(id: string): boolean {
    const db = ensureDbFile();
    if (!db.team) return false;
    const idx = db.team.findIndex((m) => m.id === id);
    if (idx === -1) return false;
    db.team.splice(idx, 1);
    writeDbFile(db);
    return true;
  },

  reorderTeamMembers(ids: string[]): boolean {
    const db = ensureDbFile();
    if (!db.team) return false;

    ids.forEach((id, index) => {
      const member = db.team?.find((m) => m.id === id);
      if (member) {
        member.sort_order = index + 1;
      }
    });

    writeDbFile(db);
    return true;
  },

  resetTeamMembers(): TeamMemberRecord[] {
    const db = ensureDbFile();
    db.team = [...initialTeamMembers];
    writeDbFile(db);
    return [...db.team];
  },

  // -------------------------------------------------------------
  // Badge Applications & Verification Management
  // -------------------------------------------------------------
  getAllBadges(): BadgeApplicationRecord[] {
    const db = ensureDbFile();
    return [...(db.badges || [])].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  getBadgeByCode(code: string): BadgeApplicationRecord | undefined {
    const db = ensureDbFile();
    return db.badges?.find((b) => b.code && b.code.toLowerCase() === code.trim().toLowerCase());
  },

  getBadgeByEmail(email: string): BadgeApplicationRecord | undefined {
    const db = ensureDbFile();
    return db.badges?.find((b) => b.email.toLowerCase() === email.trim().toLowerCase());
  },

  getRegistrationByEmail(email: string): RegistrationRecord | undefined {
    const db = ensureDbFile();
    return db.registrations?.find((r) => r.email.toLowerCase() === email.trim().toLowerCase());
  },

  createBadgeApplication(data: Partial<BadgeApplicationRecord> & { full_name: string; email: string; role: string; institution: string }): BadgeApplicationRecord {
    const db = ensureDbFile();
    if (!db.badges) db.badges = [];

    const now = new Date().toISOString();
    // Check if already applied
    const existing = db.badges.find((b) => b.email.toLowerCase() === data.email.trim().toLowerCase());
    if (existing) {
      existing.updated_at = now;
      if (data.theme) existing.theme = data.theme;
      if (data.photo_url !== undefined) existing.photo_url = data.photo_url;
      if (data.access_level) existing.access_level = data.access_level;
      if (data.full_name) existing.full_name = data.full_name;
      if (data.institution) existing.institution = data.institution;
      if (data.role && existing.status !== 'verified') existing.role = data.role;
      if (data.source) existing.source = data.source;
      if (data.donation_amount !== undefined && data.donation_amount !== null) existing.donation_amount = data.donation_amount;
      if (data.donation_utr) existing.donation_utr = data.donation_utr;
      if (data.event_id) existing.event_id = data.event_id;
      if (data.event_title) existing.event_title = data.event_title;
      if (data.registration_code) existing.registration_code = data.registration_code;
      writeDbFile(db);
      return existing;
    }

    const code = data.code || null;
    const id = data.id || `bdg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const qrPayload = data.qr_payload || (code ? `https://aws-sbg-niu.ac.in/verify/${code}` : null);

    const newBadge: BadgeApplicationRecord = {
      id,
      code,
      full_name: data.full_name,
      email: data.email.trim().toLowerCase(),
      role: data.role,
      institution: data.institution || 'Noida International University',
      photo_url: data.photo_url || null,
      source: data.source || 'community_donation',
      event_id: data.event_id || null,
      event_title: data.event_title || null,
      registration_code: data.registration_code || null,
      donation_amount: data.donation_amount ?? null,
      donation_utr: data.donation_utr || null,
      status: data.status || 'pending',
      qr_payload: qrPayload,
      access_level: data.access_level || 'Full Conference & Workshops',
      theme: data.theme || 'sbg',
      verified_by: data.verified_by || null,
      verified_at: data.verified_at || null,
      created_at: now,
      updated_at: now,
    };

    db.badges.push(newBadge);
    writeDbFile(db);
    return newBadge;
  },

  issueBadgeCode(id: string, code: string, verified_by: string, baseUrl?: string): BadgeApplicationRecord | null {
    const db = ensureDbFile();
    if (!db.badges) return null;
    const badge = db.badges.find((b) => b.id === id);
    if (!badge) return null;

    const now = new Date().toISOString();
    const cleanCode = code.trim().toUpperCase();
    const domain = (baseUrl || 'https://aws-sbg-niu.ac.in').replace(/\/$/, '');

    badge.code = cleanCode;
    badge.qr_payload = `${domain}/verify/${cleanCode}`;
    badge.status = 'verified';
    badge.verified_by = verified_by || 'Admin';
    badge.verified_at = now;
    badge.updated_at = now;

    writeDbFile(db);
    return badge;
  },

  updateBadgeStatus(id: string, status: BadgeStatus, verified_by?: string, code?: string, baseUrl?: string): BadgeApplicationRecord | null {
    const db = ensureDbFile();
    if (!db.badges) return null;
    const badge = db.badges.find((b) => b.id === id || b.code === id);
    if (!badge) return null;

    const now = new Date().toISOString();
    badge.status = status;
    badge.updated_at = now;

    if (code) {
      const cleanCode = code.trim().toUpperCase();
      badge.code = cleanCode;
      const domain = (baseUrl || 'https://aws-sbg-niu.ac.in').replace(/\/$/, '');
      badge.qr_payload = `${domain}/verify/${cleanCode}`;
    }

    if (status === 'verified') {
      badge.verified_at = now;
      badge.verified_by = verified_by || 'Admin';
    }

    writeDbFile(db);
    return badge;
  },

  deleteBadge(id: string): boolean {
    const db = ensureDbFile();
    if (!db.badges) return false;
    const idx = db.badges.findIndex((b) => b.id === id || b.code === id);
    if (idx === -1) return false;
    db.badges.splice(idx, 1);
    writeDbFile(db);
    return true;
  },

  checkInBadge(code: string, action: 'admit' | 'undo' = 'admit'): { 
    badge: BadgeApplicationRecord; 
    checked_in: boolean; 
    checked_in_at: string | null;
    previously_checked_in?: boolean;
    registration?: RegistrationRecord;
  } | null {
    const db = ensureDbFile();
    const cleanCode = code.trim().toLowerCase();
    const badge = db.badges?.find((b) => b.code && b.code.toLowerCase() === cleanCode);
    if (!badge) return null;

    const now = new Date().toISOString();
    const previouslyCheckedIn = Boolean(badge.checked_in);

    if (action === 'undo') {
      badge.checked_in = false;
      badge.checked_in_at = null;
    } else {
      if (!badge.checked_in) {
        badge.checked_in = true;
        badge.checked_in_at = now;
      }
    }
    badge.updated_at = now;

    // Also sync matching registration if any
    let registration: RegistrationRecord | undefined;
    if (badge.email) {
      registration = db.registrations?.find((r) => r.email.toLowerCase() === badge.email.toLowerCase());
      if (registration) {
        registration.checked_in = badge.checked_in || false;
        registration.checked_in_at = badge.checked_in_at || null;
      }
    }

    writeDbFile(db);
    return {
      badge,
      checked_in: Boolean(badge.checked_in),
      checked_in_at: badge.checked_in_at || null,
      previously_checked_in: previouslyCheckedIn,
      registration
    };
  },

  createSpeakerProposal(params: {
    fullName: string;
    email: string;
    phone: string;
    designation: string;
    organization: string;
    city?: string;
    linkedinUrl: string;
    portfolioUrl?: string;
    bio: string;
    talkTitle: string;
    track: string;
    sessionFormat: string;
    deliveryMode: SpeakerDeliveryMode;
    abstract: string;
    prerequisites?: string;
    experienceLinks?: string;
  }): SpeakerProposalRecord {
    const db = ensureDbFile();
    if (!db.speaker_proposals) {
      db.speaker_proposals = [];
    }

    const now = new Date().toISOString();
    const randNum = Math.floor(1000 + Math.random() * 9000);
    const refCode = `SPK-NIU-2026-${randNum}`;

    const newProposal: SpeakerProposalRecord = {
      id: `spk-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      reference_code: refCode,
      full_name: params.fullName.trim(),
      email: params.email.trim().toLowerCase(),
      phone: params.phone.trim(),
      designation: params.designation.trim(),
      organization: params.organization.trim(),
      city: params.city?.trim() || 'Delhi NCR, India',
      linkedin_url: params.linkedinUrl.trim(),
      portfolio_url: params.portfolioUrl?.trim() || undefined,
      bio: params.bio.trim(),
      talk_title: params.talkTitle.trim(),
      track: params.track.trim(),
      session_format: params.sessionFormat.trim(),
      delivery_mode: params.deliveryMode || 'in_person',
      abstract: params.abstract.trim(),
      prerequisites: params.prerequisites?.trim() || undefined,
      experience_links: params.experienceLinks?.trim() || undefined,
      status: 'pending',
      created_at: now,
      updated_at: now,
    };

    db.speaker_proposals.unshift(newProposal);
    writeDbFile(db);
    return newProposal;
  },

  getSpeakerProposals(): SpeakerProposalRecord[] {
    const db = ensureDbFile();
    return db.speaker_proposals || [];
  },

  getSpeakerProposalById(id: string): SpeakerProposalRecord | null {
    const db = ensureDbFile();
    if (!db.speaker_proposals) return null;
    return db.speaker_proposals.find((p) => p.id === id || p.reference_code === id) || null;
  },

  updateSpeakerProposalStatus(id: string, status: SpeakerProposalStatus, admin_notes?: string): SpeakerProposalRecord | null {
    const db = ensureDbFile();
    if (!db.speaker_proposals) return null;
    const proposal = db.speaker_proposals.find((p) => p.id === id || p.reference_code === id);
    if (!proposal) return null;

    proposal.status = status;
    if (admin_notes !== undefined) {
      proposal.admin_notes = admin_notes;
    }
    proposal.updated_at = new Date().toISOString();
    writeDbFile(db);
    return proposal;
  },

  deleteSpeakerProposal(id: string): boolean {
    const db = ensureDbFile();
    if (!db.speaker_proposals) return false;
    const idx = db.speaker_proposals.findIndex((p) => p.id === id || p.reference_code === id);
    if (idx === -1) return false;
    db.speaker_proposals.splice(idx, 1);
    writeDbFile(db);
    return true;
  },
};
