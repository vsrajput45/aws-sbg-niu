const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', '.data', 'db.json');
if (!fs.existsSync(dbPath)) {
  console.error('.data/db.json not found!');
  process.exit(1);
}

const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

const aiCloudSummitEvent = {
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

const existingIdx = db.events.findIndex(e => e.id === aiCloudSummitEvent.id || e.slug === aiCloudSummitEvent.slug);
if (existingIdx >= 0) {
  db.events[existingIdx] = aiCloudSummitEvent;
  console.log('Updated existing AI & Cloud Summit event in db.events');
} else {
  db.events.unshift(aiCloudSummitEvent);
  console.log('Added AI & Cloud Summit event to db.events');
}

// Also update sample registrations to point to this event if they pointed to old event
if (Array.isArray(db.registrations)) {
  for (const reg of db.registrations) {
    if (reg.event_id === 'evt-1792760640251-803ee') {
      reg.event_id = aiCloudSummitEvent.id;
    }
  }
  console.log('Updated sample registrations event_id to:', aiCloudSummitEvent.id);
}

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
console.log('Successfully synced db.json!');

