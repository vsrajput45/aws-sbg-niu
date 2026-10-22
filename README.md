# AWS Student Builder Group at Noida International University (NIU)

> Production-ready official website and event management platform for the **AWS Student Builder Group at Noida International University**, Greater Noida, Uttar Pradesh, Delhi NCR, India.

Built with **Next.js 16 (App Router)**, **TypeScript**, and **Tailwind CSS**, featuring dynamic Chapter Launch / Event Modes, full Admin Panel with Event CRUD, deterministic registration engine with seat capacity & waitlisting, and a 100% offline client-side Attendee Badge Generator on HTML5 Canvas.

---

## 🌟 Key Features

1. **Chapter Reality & Launch Mode**:
   - The chapter is pre-event (founded 19 September 2026, 52 founding members snapshot).
   - Starts in **Launch Mode**: honest story, no false scale claims, no countdown timer, designed empty state for events, and hidden speaker/agenda sections until real published data exists.
   - The moment an organizer publishes an event in the Admin Panel, the website **automatically switches to Event Mode** with hero countdown, registration, speakers, agenda, and Event JSON-LD schema — without any code redeploy!

2. **Single Source of Truth (`src/config/site.ts`)**:
   - Chapter name, university location, official Meetup group URL, focus domains, founded date, sponsorship tiers, and social links are centralized in one file.
   - Empty social URLs automatically hide icons with zero broken links.

3. **Admin Panel (`/admin`)**:
   - Password-protected with cookie session authentication and Next.js middleware.
   - **No public sign-up**: Accounts are restricted to designated chapter leads.
   - **Dashboard**: Metrics for total events, upcoming sessions, and real-time RSVPs.
   - **Event Manager**: Full grouped form covering basics, markdown editor, schedule, delivery mode (offline/online/hybrid), repeatable speakers, repeatable timeline agenda, capacity controls, waitlist toggle, and up to 3 custom registration questions.
   - **Registrations Manager**: Searchable and filterable roster, 1-click attendance check-in, waitlist promotion, and CSV export.

4. **Deterministic Registration Engine (`/events/[slug]`)**:
   - Instant confirmation with formatted code (`NIUSBG-<eventCode>-<suffix>`).
   - Duplicate prevention (`unique(event_id, lower(email))`).
   - Strict capacity enforcement: automatic queueing to **Waitlist** once seats are filled.
   - Privacy first: Online join links are private and displayed only to confirmed registrants.
   - Honeypot and in-memory rate limiting to block automated abuse.

5. **Client-Side Badge Generator (`/badge`)**:
   - 100% client-side HTML5 canvas rendering (1080 × 1350 px PNG).
   - Zero image uploads: user photo is processed locally in the browser.
   - Direct share intents for LinkedIn and X with `#AWSSBGNIU`.

6. **SEO & Accessibility**:
   - Dynamic `sitemap.xml` generated from published events (excluding admin routes).
   - Strict `robots.txt` allowing public pages while blocking `/admin/`.
   - Complete Schema.org JSON-LD: `Organization` & `WebSite` schemas on home, `Event` schema with live attendance status on event pages.
   - Security headers in `next.config.ts`: CSP, HSTS, X-Frame-Options (`SAMEORIGIN`), X-Content-Type-Options (`nosniff`).

---

## 🚀 How to Run Locally

### 1. Prerequisites
- **Node.js**: v18.17+ or v20+ (tested on Node 25)
- **npm**: v9+

### 2. Installation
```bash
git clone <repository-url>
cd AWS
npm install
```

### 3. Environment Setup
Copy the example environment file:
```bash
cp .env.example .env.local
```
By default, the application runs out of the box with the local JSON database store (`.data/db.json`). No external database setup is needed for local development or previewing.

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🚀 Deployment Guide (GitHub & Netlify)

### Step 1: Push to GitHub
1. Create a new repository on GitHub (e.g., `aws-sbg-niu`).
2. Run the following commands in this directory:
```bash
git init -b main
git add .
git commit -m "feat: AWS Student Builder Group portal ready for deployment"
git remote add origin https://github.com/<your-username>/aws-sbg-niu.git
git push -u origin main
```

### Step 2: Deploy to Netlify
1. Log in to [Netlify](https://app.netlify.com/) and click **Add new site > Import an existing project**.
2. Select **GitHub** and choose your repository.
3. Netlify will automatically read `netlify.toml`:
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
   - **Plugin**: `@netlify/plugin-nextjs` (Next.js Runtime v5)
4. Configure **Environment Variables** in Netlify (*Site configuration > Environment variables*):
   - `NEXT_PUBLIC_SITE_URL`: `https://your-domain.netlify.app`
   - `ADMIN_PASSWORD`: `<your-secure-admin-password>`
   - *(Optional for Supabase PostgreSQL)*:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`
5. Click **Deploy Site**. Your site will be live on Netlify's high-speed global CDN with full server-side rendering and edge functions!

---

## 🔑 Admin Credentials & Initial Account Setup

The site ships with an initial admin profile pre-seeded:
- **Admin Portal**: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
- **Email**: `aws@niu.ac.in`
- **Password**: Set via the `ADMIN_PASSWORD` environment variable (in `.env.local` locally, and in Netlify Environment Variables for production). Never committed to source code!

### Adding Additional Admins / Editors
1. In development, profiles are stored in `.data/db.json` under `profiles`. You can add new organizers with roles `'admin'` or `'editor'`.
2. In production with Supabase, invite users directly from the **Supabase Dashboard > Authentication > Users**, and assign their role in the `public.profiles` table.

---

## 📋 How an Admin Adds an Event (No Code)

1. Log in at `/admin/login`.
2. Click **＋ New Event** in the top navigation or dashboard.
3. Fill in the grouped form:
   - **Basic Info**: Title, URL slug, short teaser, and markdown description.
   - **Schedule**: Date, start/end time, and registration opening/deadline dates.
   - **Location**: Choose *Offline*, *Online*, or *Hybrid*. If offline, provide venue name & Google Maps link. If online, provide the private join link (only confirmed registrants will see this).
   - **Speakers**: Click *Add Speaker* to add name, bio, company, and photo.
   - **Agenda**: Click *Add Session* to sequence the timeline.
   - **Capacity & Waitlist**: Set total seat capacity and toggle waitlist.
   - **Status**: Set to **Published** to make it immediately live, or leave as **Draft** to preview first.
4. Click **Create Event**.
5. Once published, the event automatically appears on `/events`, as the homepage featured event with countdown, and in the dynamic sitemap!

---

## 🖼️ How to Replace Logos & Photos

All visual assets reside in the `public/` directory:
- **AWS Logo**: `public/aws-logo.svg`
- **SBG Logo**: `public/sbg-logo.svg`
- **Campus Background / Hero**: `public/hero.jpg`
- **Open Graph Social Card**: `public/og-image.jpg` (1200 × 630 px)
- **Favicon**: `public/favicon.ico`

To swap photos or logos, simply replace the file with the same filename.

---

## 🚢 Deploying to Vercel & Connecting Supabase

### 1. Database Setup (Supabase)
1. Create a project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in Supabase and run the migration script located at:
   ```
   supabase/migrations/20261021000000_init_schema.sql
   ```
   This creates all tables (`events`, `event_speakers`, `event_agenda_items`, `registrations`, `profiles`), RLS security policies, indexes, and the `event-assets` storage bucket.

### 2. Vercel Deployment
1. Import the repository in [Vercel](https://vercel.com).
2. In the **Environment Variables** section, add:
   ```env
   NEXT_PUBLIC_SITE_URL=https://your-custom-domain.com
   ADMIN_PASSWORD=YourStrongPasswordHere
   NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
   SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
   ```
3. Deploy!

---

## 📁 Project File Tree

```
v:/PROJECTS/AWS/
├── README.md                          # Complete documentation & deployment guide
├── .env.example                       # Environment variables template
├── .env.local                         # Local environment settings
├── package.json                       # Dependencies & scripts
├── tsconfig.json                      # Strict TypeScript configuration
├── next.config.ts                     # Security headers (CSP, HSTS) & Next.js config
├── supabase/
│   └── migrations/
│       └── 20261021000000_init_schema.sql  # Full PostgreSQL migration with RLS
├── public/
│   ├── aws-logo.svg                   # Stylized AWS vector logo
│   ├── sbg-logo.svg                   # AWS Student Builder Group logo
│   ├── hero.jpg                       # High-res campus background
│   └── og-image.jpg                   # 1200x630 official social preview
├── src/
│   ├── config/
│   │   └── site.ts                    # Single Source of Truth
│   ├── data/
│   │   ├── team.ts                    # Core team structure & role placeholders
│   │   └── faqs.ts                    # Chapter FAQs (6 verified questions)
│   ├── lib/
│   │   ├── auth.ts                    # Admin auth & session handling
│   │   ├── validations.ts             # Zod schemas for forms and API
│   │   ├── utils.ts                   # Date formatting and Tailwind helpers
│   │   └── db/
│   │       ├── index.ts               # Unified DB access interface
│   │       ├── types.ts               # TypeScript data models
│   │       ├── seed.ts                # Initial admin & sample draft event
│   │       └── jsonStore.ts           # File-backed local DB with atomic transactions
│   ├── middleware.ts                  # Route protection for /admin and /api/admin
│   ├── components/
│   │   ├── navbar.tsx                 # Fixed navbar with dynamic launch/event CTA
│   │   ├── footer.tsx                 # Chapter footer with map links & official email
│   │   ├── hero.tsx                   # Launch mode / Event mode hero with countdown
│   │   ├── marquee.tsx                # Infinite scrolling technical topics strip
│   │   ├── about.tsx                  # Meetup-adapted chapter overview & chips
│   │   ├── focus-areas.tsx            # 6 registered focus domains
│   │   ├── why-join.tsx               # 8 value cards & founding member band
│   │   ├── events-section.tsx         # Events listing with designed empty state
│   │   ├── speakers-section.tsx       # Dynamic speaker grid (hidden when 0 speakers)
│   │   ├── agenda-section.tsx         # Dynamic timeline (hidden when 0 sessions)
│   │   ├── team-section.tsx           # Core leadership team
│   │   ├── venue-section.tsx          # Campus venue, Google & Apple Maps
│   │   ├── faq-section.tsx            # Keyboard accessible FAQ accordion
│   │   ├── cta-section.tsx            # Final Join on Meetup band
│   │   ├── registration-modal.tsx     # Public registration with waitlist & confirmation
│   │   ├── event-detail-client.tsx    # Interactive event detail page
│   │   ├── badge-canvas.tsx           # 1080x1350 client-side badge generator
│   │   └── admin/
│   │       ├── admin-nav.tsx          # Admin navigation header
│   │       ├── event-form.tsx         # Grouped event creation/edit form
│   │       └── registrations-client.tsx # Registrations manager & CSV export
│   └── app/
│       ├── layout.tsx                 # Root layout with Manrope + IBM Plex Sans
│       ├── globals.css                # Obsidian & AWS Orange design system
│       ├── page.tsx                   # Homepage (assembled in exact sequence)
│       ├── not-found.tsx              # Custom 404 page
│       ├── sitemap.ts                 # Dynamic sitemap (excludes /admin)
│       ├── robots.ts                  # Robots.txt (blocks /admin)
│       ├── cfp/
│       │   └── page.tsx               # Call for speakers & session tracks
│       ├── badge/
│       │   └── page.tsx               # Badge generator page
│       ├── sponsors/
│       │   └── page.tsx               # 4 sponsorship tiers & comparison matrix
│       ├── events/
│       │   ├── page.tsx               # Public events directory
│       │   └── [slug]/
│       │       └── page.tsx           # Dynamic event detail with Event JSON-LD
│       ├── admin/
│       │   ├── page.tsx               # Organizer dashboard
│       │   ├── login/
│       │   │   └── page.tsx           # Admin login with Suspense
│       │   ├── events/
│       │   │   ├── page.tsx           # Events listing table
│       │   │   ├── new/
│       │   │   │   └── page.tsx       # Create event route
│       │   │   └── [id]/
│       │   │       ├── edit/
│       │   │       │   └── page.tsx   # Edit event route
│       │   │       └── registrations/
│       │   │           └── page.tsx   # Registration manager route
│       └── api/
│           ├── auth/
│           │   ├── login/route.ts     # Admin login endpoint
│           │   └── logout/route.ts    # Admin logout endpoint
│           ├── events/
│           │   ├── route.ts           # Published events query
│           │   └── [id]/
│           │       └── register/route.ts # Public registration API
│           └── admin/
│               └── events/
│                   ├── route.ts       # Admin events collection API
│                   └── [id]/
│                       ├── route.ts   # Admin single event CRUD API
│                       └── registrations/
│                           ├── route.ts      # Manage attendee status & check-in
│                           └── export/route.ts # CSV export API
```

---

## 🔒 Verification & Acceptance Checklist

- [x] **Launch Mode with zero published events**: No countdown, no agenda, no speakers, no Event JSON-LD, no fake attendee claims.
- [x] **Publishing an event in `/admin`**: Instantly appears on `/events`, on `/events/[slug]`, on the homepage featured hero with live countdown, and in the dynamic sitemap without any code redeploy.
- [x] **End-to-End Registration**: Immediate confirmation screen with unique registration code (`NIUSBG-<eventCode>-<suffix>`), duplicate prevention per email, and "Add to Google Calendar" link.
- [x] **Capacity & Waitlist**: Strict capacity enforcement. When full, registrations automatically route to waitlist queue with priority numbering.
- [x] **Admin Protection**: `/admin` and `/api/admin/*` reject unauthenticated requests. No public sign-up page exists.
- [x] **Registrations Management**: Searchable and filterable table, 1-click check-in, waitlist promotion, and CSV export.
- [x] **Real Meetup Link**: Every Join / RSVP button links directly to `https://www.meetup.com/aws-sbg-at-noida-international-university/`.
- [x] **Valid OpenGraph Image**: Real 1200 × 630 px social image at `/og-image.jpg`.
- [x] **Privacy & Safety**: Empty social icons are hidden; no personal contact numbers or unverified profiles are displayed.
- [x] **Badge Generator**: 1080 × 1350 px PNG download on local canvas, fully offline.
- [x] **Responsive Design**: Tested at 390px mobile viewport and 1440px desktop viewport.
