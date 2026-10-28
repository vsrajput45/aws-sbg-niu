import { EventRecord, ProfileRecord, RegistrationRecord, TeamMemberRecord } from './types';

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
  title: 'AWS Cloud Discovery Day & Hands-on Lab',
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
  status: 'published',
  featured: true,
  allowed_roles: ['attendee', 'speaker', 'sponsor', 'volunteer'],
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

// AI & CLOUD TECHNOLOGY FLAGSHIP SUMMIT EVENT
export const aiCloudSummitEvent: EventRecord = {
  id: 'e2000000-0000-0000-0000-000000000002',
  slug: 'ai-and-cloud-technology-summit',
  title: 'AI & Cloud Technology Summit: Generative AI, Amazon Bedrock & Modern Cloud Architecture',
  summary: 'Hands-on summit exploring Artificial Intelligence, Generative AI on AWS with Amazon Bedrock, Large Language Models (LLMs), serverless microservices, and modern cloud infrastructure.',
  description_md: `### 🚀 Welcome to AI & Cloud Technology Summit 2026!

Organized by the **AWS Student Builder Group at Noida International University**, this premier flagship summit brings together student innovators, cloud architects, and AI practitioners for an intensive day of learning, building, and hands-on cloud engineering.

---

### 🌟 Key Summit Tracks & Highlights

#### 1. Generative AI on AWS & Foundation Models
- Introduction to **Amazon Bedrock** — serverless access to high-performing foundation models (Anthropic Claude, Amazon Titan, Meta Llama).
- Prompt engineering best practices, Retrieval-Augmented Generation (**RAG**), and AI vector databases.
- Securing enterprise AI workloads and responsible AI guidelines.

#### 2. Cloud Native Infrastructure & Serverless
- Architecting scalable, fault-tolerant cloud backends using **AWS Lambda**, **Amazon ECS**, and **API Gateway**.
- Infrastructure as Code (IaC) and modern DevOps automation pipelines.
- Multi-region cloud resilience and cost optimization strategies.

#### 3. Hands-On Guided Lab
- **Build and deploy a live Generative AI Assistant application** on AWS from scratch!
- Connect frontend APIs to cloud-hosted foundation models with real-time streaming inference.

#### 4. Career Pathways & Industry Mentorship
- Navigating the transition from campus to cloud and AI engineering roles.
- AWS Certifications roadmap (**AWS Certified AI Practitioner**, Solutions Architect).
- Interactive Q&A, networking, and peer builder collaboration.

---

### 📅 Agenda & Schedule

- **10:00 AM – 10:30 AM**: Delegate Check-in & Badge Pass Verification
- **10:30 AM – 11:30 AM**: Keynote: The Convergence of AI & Cloud Computing
- **11:30 AM – 01:00 PM**: Deep Dive: Generative AI Architecture with Amazon Bedrock
- **01:00 PM – 02:00 PM**: Networking Lunch & Community Showcase
- **02:00 PM – 03:30 PM**: Hands-On Coding Lab: Serverless AI Application Deployment
- **03:30 PM – 04:15 PM**: Industry Panel: Careers in Cloud Architecture & AI Engineering
- **04:15 PM – 04:30 PM**: Certificate of Participation & Delegate Credential Distribution

---

### 🎯 Who Can Attend?
- Open to all students, faculty, and technology enthusiasts from Noida International University and regional colleges.
- No prior cloud experience required — beginners and intermediate developers are equally encouraged!
`,
  banner_url: '/hero.jpg',
  category: 'AI & Cloud Summit',
  tags: ['Artificial Intelligence', 'Generative AI', 'Amazon Bedrock', 'Cloud Computing', 'AWS Lambda', 'Machine Learning'],
  status: 'published',
  featured: true,
  allowed_roles: ['attendee', 'speaker', 'sponsor', 'volunteer'],
  event_date: '2026-11-28',
  start_time: '10:00 AM',
  end_time: '04:30 PM',
  timezone: 'Asia/Kolkata',
  mode: 'offline',
  venue_name: 'Main Auditorium, Block C',
  venue_address: 'Noida International University Campus, Plot 1, Sector 17A, Yamuna Expressway, Greater Noida, UP 203201',
  maps_url: 'https://maps.google.com/?q=Noida+International+University',
  join_link: null,
  platform: 'In-Person Campus Auditorium',
  registration_type: 'site',
  meetup_event_url: null,
  capacity: 250,
  waitlist_enabled: true,
  registration_opens_at: '2026-10-01T00:00:00.000Z',
  registration_deadline: '2026-11-27T18:00:00.000Z',
  registration_manual_state: 'auto',
  fee_type: 'free',
  fee_note: null,
  payment_link: null,
  prerequisites: 'Curiosity to learn AI & Cloud computing! Bring your laptop for the hands-on lab.',
  what_to_bring: 'College ID card, fully charged laptop with charger.',
  certificate: true,
  contact_email: 'aws.sbg@niu.ac.in',
  custom_questions: [
    {
      id: 'q1',
      label: 'What is your primary area of interest?',
      type: 'dropdown',
      options: ['Generative AI & LLMs', 'Cloud Architecture & DevOps', 'Machine Learning & Data Engineering', 'Full-Stack AI Apps'],
      required: true,
    },
    {
      id: 'q2',
      label: 'Have you built any AI or Cloud projects before?',
      type: 'dropdown',
      options: ['Absolute beginner (New to AI/Cloud)', 'Built small academic projects/demos', 'Intermediate/Advanced builder'],
      required: true,
    },
    {
      id: 'q3',
      label: 'What specific topic or question do you want our speakers to address?',
      type: 'text',
      required: false,
    },
  ],
  created_by: '00000000-0000-0000-0000-000000000001',
  created_at: '2026-10-28T09:00:00.000Z',
  updated_at: '2026-10-28T09:00:00.000Z',
  speakers: [
    {
      id: 'sp200000-0000-0000-0000-000000000001',
      event_id: 'e2000000-0000-0000-0000-000000000002',
      name: 'Samir Raja',
      role: 'Group Leader & Cloud Architect',
      company: 'AWS SBG NIU',
      photo_url: '/team/samir-raja.jpg',
      bio: 'Leading AWS student builder initiatives and cloud architecture labs at NIU.',
      linkedin_url: null,
      x_url: null,
      sort_order: 1,
    },
    {
      id: 'sp200000-0000-0000-0000-000000000002',
      event_id: 'e2000000-0000-0000-0000-000000000002',
      name: 'Dr. Ananya Sen',
      role: 'Chief AI Scientist & Cloud Researcher',
      company: 'AI Cloud Research Labs',
      photo_url: '/sbg-logo.svg',
      bio: 'Specialist in Foundation Models, PEFT, LoRA, and deploying Generative AI on Amazon Bedrock.',
      linkedin_url: 'https://linkedin.com/in/ananyasen-ai',
      x_url: null,
      sort_order: 2,
    },
  ],
  agenda: [
    {
      id: 'ag200000-0000-0000-0000-000000000001',
      event_id: 'e2000000-0000-0000-0000-000000000002',
      start_label: '10:00 AM',
      end_label: '10:30 AM',
      title: 'Delegate Check-In & Gate Verification',
      description: 'Receive your physical delegate pass lanyard, scan digital credentials, and meet attendees.',
      tag: 'Check-In',
      sort_order: 1,
    },
    {
      id: 'ag200000-0000-0000-0000-000000000002',
      event_id: 'e2000000-0000-0000-0000-000000000002',
      start_label: '10:30 AM',
      end_label: '11:30 AM',
      title: 'Keynote: The AI-Driven Cloud Revolution',
      description: 'How modern cloud infrastructure powers real-time Foundation Models and AI agents.',
      tag: 'Keynote',
      sort_order: 2,
    },
    {
      id: 'ag200000-0000-0000-0000-000000000003',
      event_id: 'e2000000-0000-0000-0000-000000000002',
      start_label: '11:30 AM',
      end_label: '01:00 PM',
      title: 'Building Generative AI on Amazon Bedrock',
      description: 'RAG pipelines, prompt engineering, fine-tuning, and integrating Claude 3.5 with AWS Lambda.',
      tag: 'Deep Dive',
      sort_order: 3,
    },
    {
      id: 'ag200000-0000-0000-0000-000000000004',
      event_id: 'e2000000-0000-0000-0000-000000000002',
      start_label: '01:00 PM',
      end_label: '02:00 PM',
      title: 'Networking Lunch & AI Demo Pods',
      description: 'Lunch provided for all registered delegates with interactive student builder demos.',
      tag: 'Networking',
      sort_order: 4,
    },
    {
      id: 'ag200000-0000-0000-0000-000000000005',
      event_id: 'e2000000-0000-0000-0000-000000000002',
      start_label: '02:00 PM',
      end_label: '03:30 PM',
      title: 'Hands-on Lab: Deploy a Full-Stack AI Cloud App',
      description: 'Follow-along live coding workshop deploying a complete GenAI app on AWS.',
      tag: 'Hands-on Lab',
      sort_order: 5,
    },
    {
      id: 'ag200000-0000-0000-0000-000000000006',
      event_id: 'e2000000-0000-0000-0000-000000000002',
      start_label: '03:30 PM',
      end_label: '04:30 PM',
      title: 'Panel: AI Careers, Badges & Certifications',
      description: 'Hear from industry engineers, Q&A session, and official certificate distribution.',
      tag: 'Closing Panel',
      sort_order: 6,
    },
  ],
};

export const initialRegistrations: RegistrationRecord[] = [];

export const initialTeamMembers: TeamMemberRecord[] = [
  {
    id: "tm-1",
    name: "Samir Raja",
    role: "Group Leader",
    department: "Computer Science & Engineering",
    bio: "Overall chapter leadership, liaising with AWS Student Programs, setting community vision, and fostering the builder ecosystem at NIU.",
    avatarUrl: "/team/samir-raja.jpg",
    cardUrl: "/team/samir-raja-card.jpg",
    initials: "SR",
    session: "2026-27",
    badge: "Chapter Head",
    sort_order: 1,
  },
  {
    id: "tm-2",
    name: "Vivek Kumar",
    role: "Co-Lead & Director of Events",
    department: "Computer Science & Engineering",
    bio: "Co-leading chapter initiatives, event strategy, hands-on cloud hackathons, and seamless speaker coordination for AWS SBG at NIU.",
    avatarUrl: "/team/vivek-kumar-hd.jpg",
    cardUrl: "/team/vivek-kumar-card.jpg",
    initials: "VK",
    session: "2026-27",
    badge: "Leadership Core",
    sort_order: 2,
  },
  {
    id: "tm-3",
    name: "Anurag Rai",
    role: "Technical Lead",
    department: "Computer Science & Engineering",
    bio: "Architecting hands-on AWS coding labs, cloud architecture challenges, and mentoring student builders across core cloud services.",
    avatarUrl: "/team/anurag-rai.jpg",
    cardUrl: "/team/anurag-rai-card.jpg",
    initials: "AR",
    session: "2026-27",
    badge: "Technical Architecture",
    sort_order: 3,
  },
  {
    id: "tm-4",
    name: "Shivam Dubey",
    role: "Community & Outreach Lead",
    department: "Information Technology",
    bio: "Spearheading student outreach, forging partnerships with tech communities across Delhi NCR, and expanding builder engagement.",
    avatarUrl: "/team/shivam-dubey.jpg",
    cardUrl: "/team/shivam-dubey-card.jpg",
    initials: "SD",
    session: "2026-27",
    badge: "Community & Partnerships",
    sort_order: 4,
  },
  {
    id: "tm-5",
    name: "Aalok Sharma",
    role: "Operations Lead",
    department: "Cloud Computing & Systems",
    bio: "Orchestrating end-to-end community operations, logistics, session planning, and student builder workflow management.",
    avatarUrl: "/team/aalok-sharma.jpg",
    cardUrl: "/team/aalok-sharma-card.jpg",
    initials: "AS",
    session: "2026-27",
    badge: "Operations & Logistics",
    sort_order: 5,
  },
  {
    id: "tm-6",
    name: "Kanika",
    role: "Social Media & Content Lead",
    department: "Computer Applications",
    bio: "Directing official social media channels, brand storytelling, technical session write-ups, and student learning collateral.",
    avatarUrl: "/team/kanika.jpg",
    cardUrl: "/team/kanika-card.jpg",
    initials: "K",
    session: "2026-27",
    badge: "Content & Branding",
    sort_order: 6,
  },
  {
    id: "tm-7",
    name: "Khusi Kumari",
    role: "Event Coordinator",
    department: "Computer Science & Engineering",
    bio: "Coordinating event logistics, student registrations, venue readiness, and attendee coordination for AWS Student Builder Group at NIU.",
    avatarUrl: "/team/khusi-kumari.jpg",
    cardUrl: "/team/khusi-kumari-card.jpg",
    initials: "KK",
    session: "2026-27",
    badge: "Event Operations",
    sort_order: 7,
  },
];

