import { EventRecord, ProfileRecord, RegistrationRecord } from './types';

export const initialProfiles: ProfileRecord[] = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'aws@niu.ac.in',
    role: 'admin',
    created_at: '2026-09-19T00:00:00.000Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    email: 'editor@niu.ac.in',
    role: 'editor',
    created_at: '2026-09-19T00:00:00.000Z',
  },
];

// CLEARLY LABELLED SAMPLE DRAFT EVENT (UNPUBLISHED)
// Site launches with ZERO published events. Public sees Launch Mode until this or another event is Published!
export const sampleDraftEvent: EventRecord = {
  id: 'e1000000-0000-0000-0000-000000000001',
  slug: 'aws-cloud-discovery-day-niu',
  title: '[SAMPLE DRAFT] AWS Cloud Discovery Day & Hands-on Lab',
  summary: 'Hands-on foundational workshop exploring AWS core services, Serverless architecture, and building your first cloud app on AWS.',
  description_md: `### Welcome to AWS Cloud Discovery Day!

This foundational, student-focused technical session is curated to introduce you to the world of cloud computing using Amazon Web Services (AWS). Whether you are completely new to cloud or want to sharpen your architectural intuition, this session is tailored for you.

#### What You Will Learn:
- **Cloud Computing Essentials:** Understanding regions, availability zones, and core infrastructure.
- **Compute & Serverless:** Exploring AWS Lambda, API Gateway, and running code without managing servers.
- **Database & Storage:** Storing application data securely with Amazon S3 and Amazon DynamoDB.
- **Hands-on Guided Lab:** Deploying a live serverless REST API from scratch.
- **Career Pathways & Certifications:** Navigating AWS Cloud Practitioner and Solutions Architect certifications.

#### Who Should Attend:
- Any student from Noida International University (all branches/years welcome) aged 18+.
- Aspiring cloud architects, backend engineers, and data enthusiasts.
`,
  banner_url: '/hero.jpg',
  category: 'Technical Workshop',
  tags: ['AWS Lambda', 'Serverless', 'Cloud Foundations', 'Hands-on Lab'],
  status: 'draft', // DRAFT - UNPUBLISHED! Will not appear on public site until published
  featured: true,
  event_date: '2026-11-20',
  start_time: '10:00 AM',
  end_time: '03:00 PM',
  timezone: 'Asia/Kolkata',
  mode: 'offline',
  venue_name: 'Main Auditorium, Block C',
  venue_address: 'Noida International University Campus, Plot 1, Sector 17A, Yamuna Expressway, Greater Noida, UP 203201',
  maps_url: 'https://maps.google.com/?q=Noida+International+University',
  join_link: null,
  platform: 'In-Person Campus Auditorium',
  registration_type: 'site',
  meetup_event_url: null,
  capacity: 120,
  waitlist_enabled: true,
  registration_opens_at: '2026-10-01T00:00:00.000Z',
  registration_deadline: '2026-11-19T18:00:00.000Z',
  registration_manual_state: 'auto',
  fee_type: 'free',
  fee_note: null,
  payment_link: null,
  prerequisites: 'Basic knowledge of any programming language (Python/JS preferred) and an AWS Free Tier account (optional).',
  what_to_bring: 'College ID card, fully charged laptop with charger, and notebook.',
  certificate: true,
  contact_email: 'community@niu.ac.in',
  custom_questions: [
    {
      id: 'q1',
      label: 'What is your current level of experience with AWS Cloud?',
      type: 'dropdown',
      options: ['Absolute Beginner (Never used)', 'Basic (Used S3/EC2 once)', 'Intermediate (Built small projects)'],
      required: true,
    },
    {
      id: 'q2',
      label: 'Which specific cloud topic are you most excited to learn?',
      type: 'text',
      required: false,
    },
  ],
  created_by: '00000000-0000-0000-0000-000000000001',
  created_at: '2026-10-21T09:00:00.000Z',
  updated_at: '2026-10-21T09:00:00.000Z',
  speakers: [
    {
      id: 'sp100000-0000-0000-0000-000000000001',
      event_id: 'e1000000-0000-0000-0000-000000000001',
      name: '[SPEAKER GUEST TO BE ANNOUNCED]',
      role: 'AWS Community Builder / Cloud Architect',
      company: 'AWS Community India',
      photo_url: '/sbg-logo.svg',
      bio: 'Cloud practitioner dedicated to empowering student builders with practical cloud engineering skills.',
      linkedin_url: null,
      x_url: null,
      sort_order: 1,
    },
  ],
  agenda: [
    {
      id: 'ag100000-0000-0000-0000-000000000001',
      event_id: 'e1000000-0000-0000-0000-000000000001',
      start_label: '10:00 AM',
      end_label: '10:30 AM',
      title: 'Welcome & Community Introduction',
      description: 'Opening remarks from student leads and faculty advisor, introducing AWS Student Builder Group at NIU.',
      tag: 'Opening',
      sort_order: 1,
    },
    {
      id: 'ag100000-0000-0000-0000-000000000002',
      event_id: 'e1000000-0000-0000-0000-000000000001',
      start_label: '10:30 AM',
      end_label: '12:00 PM',
      title: 'Deep Dive: Serverless on AWS',
      description: 'Demystifying Lambda, EventBridge, and DynamoDB for production-ready student projects.',
      tag: 'Technical Session',
      sort_order: 2,
    },
    {
      id: 'ag100000-0000-0000-0000-000000000003',
      event_id: 'e1000000-0000-0000-0000-000000000001',
      start_label: '12:00 PM',
      end_label: '01:30 PM',
      title: 'Hands-on Lab: Deploy Your First API',
      description: 'Guided step-by-step interactive lab deploying a live serverless backend.',
      tag: 'Hands-on Lab',
      sort_order: 3,
    },
    {
      id: 'ag100000-0000-0000-0000-000000000004',
      event_id: 'e1000000-0000-0000-0000-000000000001',
      start_label: '01:30 PM',
      end_label: '02:30 PM',
      title: 'Lunch & Student Networking',
      description: 'Connect with fellow student builders, exchange ideas, and meet the core team.',
      tag: 'Networking',
      sort_order: 4,
    },
    {
      id: 'ag100000-0000-0000-0000-000000000005',
      event_id: 'e1000000-0000-0000-0000-000000000001',
      start_label: '02:30 PM',
      end_label: '03:00 PM',
      title: 'AWS Certifications & Closing Q&A',
      description: 'Roadmap to AWS Certified Cloud Practitioner and community resources.',
      tag: 'Closing',
      sort_order: 5,
    },
  ],
};

export const initialRegistrations: RegistrationRecord[] = [];
