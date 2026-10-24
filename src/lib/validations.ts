import { z } from 'zod';

// Public Event Registration Schema
export const publicRegistrationSchema = z.object({
  eventId: z.string().min(1, 'Event ID is required'),
  role: z.enum(['attendee', 'speaker', 'sponsor', 'volunteer']).default('attendee'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number').max(20),
  college: z.string().optional().default('N/A'),
  courseYear: z.string().optional().default('N/A'),
  collegeId: z.string().optional(),
  hearAbout: z.string().optional().default('Community / Campus Announcement'),
  consent: z.literal(true, {
    message: 'You must agree to be contacted regarding this event',
  }),
  // Honeypot field for spam prevention - must remain empty!
  website_trap: z.string().max(0, 'Spam detected').optional(),
  customAnswers: z.record(z.string(), z.string()).optional(),

  // Speaker fields
  topicTitle: z.string().optional(),
  topicAbstract: z.string().optional(),
  speakerBio: z.string().optional(),
  portfolioOrLinkedin: z.string().optional(),
  previousSpeakingLinks: z.string().optional(),

  // Sponsor fields
  companyName: z.string().optional(),
  companyWebsite: z.string().optional(),
  sponsorTierInterest: z.string().optional(),
  designation: z.string().optional(),
  sponsorshipNotes: z.string().optional(),

  // Volunteer fields
  volunteerInterest: z.string().optional(),
  volunteerExperience: z.string().optional(),

  // Payment field
  paymentUtr: z.string().optional(),
});

export type PublicRegistrationInput = z.infer<typeof publicRegistrationSchema>;

// Admin Event Schema
export const speakerSchema = z.object({
  id: z.string().optional(),
  event_id: z.string().optional(),
  name: z.string().min(1, 'Speaker name is required'),
  role: z.string().min(1, 'Role or title is required'),
  company: z.string().min(1, 'Company or organization is required'),
  photo_url: z.string().default('/sbg-logo.svg'),
  bio: z.string().default(''),
  linkedin_url: z.string().nullable().optional(),
  x_url: z.string().nullable().optional(),
  sort_order: z.number().default(0),
});

export const agendaItemSchema = z.object({
  id: z.string().optional(),
  event_id: z.string().optional(),
  start_label: z.string().min(1, 'Start time is required'),
  end_label: z.string().min(1, 'End time is required'),
  title: z.string().min(1, 'Session title is required'),
  description: z.string().default(''),
  speaker_id: z.string().nullable().optional(),
  tag: z.string().default('Session'),
  sort_order: z.number().default(0),
});

export const customQuestionSchema = z.object({
  id: z.string(),
  label: z.string().min(1, 'Question label is required'),
  type: z.enum(['text', 'dropdown']),
  options: z.array(z.string()).optional(),
  required: z.boolean().default(false),
});

export const adminEventSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3, 'Event title must be at least 3 characters'),
  slug: z.string().min(3, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  summary: z.string().min(10, 'Short summary is required'),
  description_md: z.string().min(20, 'Event description is required'),
  banner_url: z.string().default('/hero.jpg'),
  category: z.string().default('Technical Workshop'),
  tags: z.array(z.string()).default([]),
  status: z.enum(['draft', 'published', 'cancelled', 'completed']).default('draft'),
  featured: z.boolean().default(false),
  event_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  start_time: z.string().min(1, 'Start time is required'),
  end_time: z.string().min(1, 'End time is required'),
  timezone: z.string().default('Asia/Kolkata'),
  mode: z.enum(['offline', 'online', 'hybrid']),
  venue_name: z.string().nullable().optional(),
  venue_address: z.string().nullable().optional(),
  maps_url: z.string().nullable().optional(),
  join_link: z.string().nullable().optional(),
  platform: z.string().nullable().optional(),
  registration_type: z.enum(['site', 'meetup', 'both']).default('site'),
  meetup_event_url: z.string().nullable().optional(),
  capacity: z.number().nullable().optional(),
  waitlist_enabled: z.boolean().default(true),
  registration_opens_at: z.string().nullable().optional(),
  registration_deadline: z.string().nullable().optional(),
  registration_manual_state: z.enum(['auto', 'open', 'closed']).default('auto'),
  fee_type: z.enum(['free', 'paid']).default('free'),
  fee_note: z.string().nullable().optional(),
  payment_link: z.string().nullable().optional(),
  prerequisites: z.string().nullable().optional(),
  what_to_bring: z.string().nullable().optional(),
  certificate: z.boolean().default(true),
  contact_email: z.string().email('Please enter a valid official email address'),
  custom_questions: z.array(customQuestionSchema).max(3).default([]),
  allowed_roles: z.array(z.enum(['attendee', 'speaker', 'sponsor', 'volunteer'])).default(['attendee', 'speaker', 'sponsor', 'volunteer']),
  speakers: z.array(speakerSchema).default([]),
  agenda: z.array(agendaItemSchema).default([]),
});

export type AdminEventInput = z.infer<typeof adminEventSchema>;
