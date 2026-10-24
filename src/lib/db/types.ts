// Type definitions for AWS SBG at NIU Database

export type EventStatus = 'draft' | 'published' | 'cancelled' | 'completed';
export type EventMode = 'offline' | 'online' | 'hybrid';
export type RegistrationType = 'site' | 'meetup' | 'both';
export type RegistrationManualState = 'auto' | 'open' | 'closed';
export type FeeType = 'free' | 'paid';
export type RegistrationStatus = 'confirmed' | 'waitlisted' | 'cancelled';
export type UserRole = 'admin' | 'editor';
export type RegistrationRole = 'attendee' | 'speaker' | 'sponsor' | 'volunteer';

export interface CustomQuestion {
  id: string;
  label: string;
  type: 'text' | 'dropdown';
  options?: string[];
  required?: boolean;
}

export interface EventSpeaker {
  id?: string;
  event_id?: string;
  name: string;
  role: string;
  company: string;
  photo_url: string;
  bio: string;
  linkedin_url?: string | null;
  x_url?: string | null;
  sort_order: number;
}

export interface EventAgendaItem {
  id?: string;
  event_id?: string;
  start_label: string;
  end_label: string;
  title: string;
  description: string;
  speaker_id?: string | null;
  speaker_name?: string | null; // hydrated convenience
  tag: string;
  sort_order: number;
}

export interface EventRecord {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description_md: string;
  banner_url: string;
  category: string;
  tags: string[];
  status: EventStatus;
  featured: boolean;
  event_date: string; // YYYY-MM-DD
  start_time: string; // e.g. "10:00 AM"
  end_time: string;   // e.g. "04:00 PM"
  timezone: string;
  mode: EventMode;
  venue_name?: string | null;
  venue_address?: string | null;
  maps_url?: string | null;
  join_link?: string | null; // private!
  platform?: string | null;
  registration_type: RegistrationType;
  meetup_event_url?: string | null;
  capacity?: number | null; // null = unlimited
  waitlist_enabled: boolean;
  registration_opens_at?: string | null;
  registration_deadline?: string | null;
  registration_manual_state: RegistrationManualState;
  fee_type: FeeType;
  fee_note?: string | null;
  payment_link?: string | null;
  prerequisites?: string | null;
  what_to_bring?: string | null;
  certificate: boolean;
  contact_email: string;
  custom_questions: CustomQuestion[];
  allowed_roles?: RegistrationRole[];
  created_by?: string | null;
  created_at: string;
  updated_at: string;

  // Hydrated counts & children for easy rendering
  speakers?: EventSpeaker[];
  agenda?: EventAgendaItem[];
  confirmed_count?: number;
  waitlisted_count?: number;
}

export interface RegistrationRecord {
  id: string;
  event_id: string;
  registration_code: string;
  role: RegistrationRole;
  full_name: string;
  email: string;
  phone: string;
  college: string;
  course_year: string;
  college_id?: string | null;
  hear_about: string;
  custom_answers: Record<string, string>;
  status: RegistrationStatus;
  checked_in: boolean;
  checked_in_at?: string | null;
  created_at: string;
  event_title?: string; // hydrated

  // Role-specific attributes
  // Speaker attributes:
  topic_title?: string | null;
  topic_abstract?: string | null;
  speaker_bio?: string | null;
  portfolio_or_linkedin?: string | null;
  previous_speaking_links?: string | null;

  // Sponsor attributes:
  company_name?: string | null;
  company_website?: string | null;
  sponsor_tier_interest?: string | null;
  designation?: string | null;
  sponsorship_notes?: string | null;

  // Volunteer attributes:
  volunteer_interest?: string | null;
  volunteer_experience?: string | null;

  // Payment attributes
  payment_utr?: string | null;
  payment_status?: PaymentStatus;
}

export type PaymentStatus = 'unpaid' | 'pending' | 'verified' | 'refunded';

export interface ProfileRecord {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface SiteSettingsRecord {
  chapterName: string;
  shortName: string;
  tagline: string;
  universityName: string;
  campusVenue: string;
  city: string;
  fullLocation: string;
  mapsUrl: string;
  appleMapsUrl: string;
  foundedDate: string;
  memberCountSnapshot: number;
  snapshotAsOf: string;
  officialEmail: string;
  meetupUrl: string;
  instagramUrl: string;
  githubUrl: string;
  linkedinUrl: string;
  twitterUrl: string;
  discordUrl?: string;
  upiId?: string;
  upiName?: string;
  upiQrImageUrl?: string;
  speakerInterestForm: string;
  sponsorForm: string;
  aboutHeadline: string;
  aboutDescription: string;
  marqueeTopics: string[];
  updated_at?: string;
}

export interface TeamMemberRecord {
  id: string;
  name: string;
  role: string;
  department: string;
  bio: string;
  avatarUrl: string;
  cardUrl?: string;
  initials?: string;
  session: string;
  badge: string;
  sort_order: number;
  linkedin_url?: string;
  github_url?: string;
  created_at?: string;
  updated_at?: string;
}

export type BadgeSource = 'event_registration' | 'community_donation';
export type BadgeStatus = 'verified' | 'pending' | 'revoked';

export interface BadgeApplicationRecord {
  id: string;
  code: string | null; // e.g. "NIU-AWS-2026-5645" once generated by admin
  full_name: string;
  email: string;
  role: string;
  institution: string;
  photo_url?: string | null;
  source: BadgeSource;
  event_id?: string | null;
  event_title?: string | null;
  registration_code?: string | null;
  donation_amount?: number | null; // in INR, e.g. 49, 99
  donation_utr?: string | null;
  status: BadgeStatus;
  qr_payload: string | null; // Verification URL once issued
  access_level: string;
  theme: 'sbg' | 'classic';
  verified_by?: string | null;
  verified_at?: string | null;
  created_at: string;
  updated_at: string;
}

