import fs from 'fs';
import path from 'path';
import os from 'os';
import { EventRecord, RegistrationRecord, ProfileRecord, SiteSettingsRecord, TeamMemberRecord } from './types';
import { initialProfiles, sampleDraftEvent, initialRegistrations, initialTeamMembers } from './seed';

interface DatabaseData {
  profiles: ProfileRecord[];
  events: EventRecord[];
  registrations: RegistrationRecord[];
  site_settings?: SiteSettingsRecord;
  team?: TeamMemberRecord[];
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
  speakerInterestForm: "https://forms.gle/placeholder-speaker-interest",
  sponsorForm: "https://forms.gle/placeholder-community-partnership",
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
  const { dataDir, dbFile } = getDataPaths();

  try {
    if (!fs.existsSync(/*turbopackIgnore: true*/ dataDir)) {
      fs.mkdirSync(/*turbopackIgnore: true*/ dataDir, { recursive: true });
    }
    const tempFile = `${dbFile}.tmp`;
    fs.writeFileSync(/*turbopackIgnore: true*/ tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(/*turbopackIgnore: true*/ tempFile, dbFile);
  } catch (err) {
    console.warn('Disk write failed (likely read-only serverless environment), kept in memoryCache:', err);
  }
}

export const dbStore = {
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
    fullName: string;
    email: string;
    phone: string;
    college: string;
    courseYear: string;
    collegeId?: string;
    hearAbout: string;
    customAnswers?: Record<string, string>;
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

    // Duplicate check: (event_id, lower(email))
    const normalizedEmail = params.email.trim().toLowerCase();
    const existing = db.registrations.find(
      (r) => r.event_id === params.eventId && r.email.toLowerCase() === normalizedEmail && r.status !== 'cancelled'
    );

    if (existing) {
      return {
        registration: existing,
        alreadyRegistered: true,
      };
    }

    // Capacity & Waitlist check
    const currentConfirmed = db.registrations.filter(
      (r) => r.event_id === params.eventId && r.status === 'confirmed'
    ).length;

    let status: 'confirmed' | 'waitlisted' = 'confirmed';
    if (event.capacity && currentConfirmed >= event.capacity) {
      if (event.waitlist_enabled) {
        status = 'waitlisted';
      } else {
        return { error: 'This event has reached full capacity and registration is closed.' };
      }
    }

    // Generate unique Registration Code
    // Format: NIUSBG-<eventCode>-<suffix>
    const cleanSlug = event.slug.replace(/[^a-zA-Z0-9]/g, '').substring(0, 6).toUpperCase();
    const suffix = Math.random().toString(36).substring(2, 7).toUpperCase();
    const registrationCode = `NIUSBG-${cleanSlug}-${suffix}`;

    const newRegistration: RegistrationRecord = {
      id: `reg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      event_id: params.eventId,
      registration_code: registrationCode,
      full_name: params.fullName.trim(),
      email: normalizedEmail,
      phone: params.phone.trim(),
      college: params.college.trim(),
      course_year: params.courseYear.trim(),
      college_id: params.collegeId ? params.collegeId.trim() : null,
      hear_about: params.hearAbout,
      custom_answers: params.customAnswers || {},
      status,
      checked_in: false,
      checked_in_at: null,
      created_at: new Date().toISOString(),
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

  removeRegistration(registrationId: string): boolean {
    const db = ensureDbFile();
    const idx = db.registrations.findIndex((r) => r.id === registrationId);
    if (idx === -1) return false;

    const [removed] = db.registrations.splice(idx, 1);

    // If a confirmed attendee is removed, auto-promote waitlist #1 if waitlist is active
    if (removed.status === 'confirmed') {
      const waitlisted = db.registrations
        .filter((r) => r.event_id === removed.event_id && r.status === 'waitlisted')
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

    const confirmedCount = db.registrations.filter((r) => r.event_id === eventId && r.status === 'confirmed').length;
    const capacity = event.capacity || 999999;
    const available = Math.max(0, capacity - confirmedCount);

    if (available <= 0) return 0;

    const waitlisted = db.registrations
      .filter((r) => r.event_id === eventId && r.status === 'waitlisted')
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
    const confirmedCount = eventRegs.filter((r) => r.status === 'confirmed').length;
    const waitlistedCount = eventRegs.filter((r) => r.status === 'waitlisted').length;

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
};
