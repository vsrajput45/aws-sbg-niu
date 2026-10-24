// Single Source of Truth for AWS Student Builder Group at Noida International University

export const siteConfig = {
  chapterName: "AWS Student Builder Group at Noida International University",
  shortName: "AWS SBG NIU",
  tagline: "Student-led cloud community innovating with Amazon Web Services",
  universityName: "Noida International University",
  campusVenue: "[AUDITORIUM / VENUE NAME]",
  city: "Noida, IN", // consistent with official Meetup listing
  fullLocation: "Noida International University, Greater Noida, Uttar Pradesh, Delhi NCR, India",
  mapsUrl: "https://maps.google.com/?q=Noida+International+University+Greater+Noida",
  appleMapsUrl: "https://maps.apple.com/?q=Noida+International+University+Greater+Noida",

  foundedDate: "2026-09-19",
  memberCountSnapshot: 52,
  snapshotAsOf: "October 2026", // formatted as month for honest display
  snapshotDateISO: "2026-10-21",

  // Events are loaded dynamically from the Database (Supabase / local store).
  featuredEventFallback: null,

  // Communication & Official Socials
  officialEmail: "[OFFICIAL CHAPTER EMAIL]", // Placeholder until official inbox assigned
  meetupUrl: "https://www.meetup.com/aws-sbg-at-noida-international-university/", // REAL verified URL

  // Note on socials: Empty strings hide icons automatically. Never link to bare homepages.
  // Meetup currently links to a personal profile, so LinkedIn is left empty at launch.
  instagramUrl: "", // "[URL or empty]" - kept empty to hide icon until chapter page exists
  githubUrl: "",    // "[URL or empty]" - kept empty to hide icon until chapter org exists
  linkedinUrl: "",  // Kept empty at launch to prevent linking personal profile
  twitterUrl: "",   // Kept empty at launch

  // Official UPI & Payment details (Configurable via Admin Console)
  upiId: "aws-sbg@niu",
  upiName: "AWS SBG NIU",
  upiQrImageUrl: "",

  // Meetup-registered focus areas
  focusAreas: [
    {
      title: "Cloud Computing & AWS",
      description: "Foundational architecture, compute, storage, networking, and AWS core infrastructure.",
      icon: "Cloud",
    },
    {
      title: "Cybersecurity",
      description: "Cloud security posture, IAM governance, encryption, and secure cloud workload defense.",
      icon: "ShieldCheck",
    },
    {
      title: "Artificial Intelligence",
      description: "Generative AI, foundation models, Amazon Bedrock, and practical intelligent applications.",
      icon: "Cpu",
    },
    {
      title: "Machine Learning",
      description: "Model training, deployment with Amazon SageMaker, and data science workflows.",
      icon: "Brain",
    },
    {
      title: "Robotics",
      description: "Autonomous systems, IoT integration with AWS IoT Core, and robotic edge computing.",
      icon: "Bot",
    },
    {
      title: "Business Analytics & Transformation",
      description: "Data-driven strategy, modern cloud data warehousing, and organizational transformation.",
      icon: "BarChart3",
    },
  ],

  // Infinite Marquee topics
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

  // Real description adapted from official Meetup
  aboutSource: {
    headline: "Built by the Community, for the Community.",
    descriptionParagraphs: [
      "The AWS Student Builder Group at Noida International University is a student-led, student-driven academic community dedicated to learning, building, and innovating with Amazon Web Services.",
      "We bridge the gap between classroom theory and real-world industry demands. Through hands-on AWS projects, architectural workshops, and peer mentorship, our members gain deep technical proficiency alongside strategic business acumen.",
      "Whether you are passionate about cloud architecture, cybersecurity, generative AI, machine learning, robotics, or business transformation, this community provides the collaborative launchpad to turn concepts into production cloud systems.",
    ],
    chips: [
      "Technical Sessions",
      "Hands-on Workshops",
      "Networking",
      "Career Growth",
      "Cloud Learning",
      "Hands-on AWS Projects",
    ],
  },

  // Why Join Cards
  whyJoinCards: [
    {
      title: "Hands-on Workshops",
      description: "Build live projects on AWS services with step-by-step guidance.",
      icon: "Laptop",
    },
    {
      title: "AWS Experts",
      description: "Learn directly from AWS Community Builders, Heroes, and industry professionals.",
      icon: "Award",
    },
    {
      title: "Community Builders",
      description: "Connect with like-minded peers who are actively building cloud solutions.",
      icon: "Users",
    },
    {
      title: "Networking",
      description: "Expand your professional horizon across Delhi NCR and the global AWS community.",
      icon: "Network",
    },
    {
      title: "Career Opportunities",
      description: "Discover cloud internships, graduate programs, and hiring pathways.",
      icon: "Briefcase",
    },
    {
      title: "Cloud Certifications",
      description: "Structured study circles for AWS Certified Cloud Practitioner & Solutions Architect.",
      icon: "FileCheck",
    },
    {
      title: "Open Source",
      description: "Contribute to collaborative repositories, toolkits, and student cloud architectures.",
      icon: "GitBranch",
    },
    {
      title: "Real Projects",
      description: "Tackle portfolio-grade challenges that solve genuine business and campus problems.",
      icon: "Rocket",
    },
  ],

  // Form links (Internal on-site routes)
  formLinks: {
    speakerInterestForm: "/cfp#speaker-registration-form",
    sponsorForm: "/sponsors",
  },

  // Sponsorship Tiers
  sponsorTiers: [
    {
      name: "Bronze Partner",
      price: "Contact us for pricing",
      passes: "2 VIP Passes",
      description: "Ideal for startups and regional companies supporting student cloud literacy.",
      benefits: [
        "Logo on community website & session banners",
        "Social media welcome announcement",
        "Distribution of promotional swags/stickers",
        "2 complimentary community passes",
      ],
      isPopular: false,
    },
    {
      name: "Silver Partner",
      price: "Contact us for pricing",
      passes: "3 VIP Passes",
      description: "Great for growing technology companies seeking student developer talent.",
      benefits: [
        "All Bronze Partner benefits",
        "Booth/table presence at in-person workshops",
        "1 dedicated community tech spotlight post",
        "Access to opt-in attendee resume pool",
        "3 complimentary community passes",
      ],
      isPopular: false,
    },
    {
      name: "Gold Partner",
      price: "Contact us for pricing",
      passes: "4 VIP Passes",
      description: "Comprehensive partnership offering high brand resonance and speaking slot.",
      benefits: [
        "All Silver Partner benefits",
        "15-minute speaking or tech demo slot",
        "Prominent logo placement on all recording intros",
        "Direct hiring & challenge announcement privileges",
        "4 complimentary community passes",
      ],
      isPopular: true,
    },
    {
      name: "Diamond Founding Partner",
      price: "Contact us for pricing",
      passes: "5 VIP Passes",
      description: "Premier anchor partnership shaping our inaugural academic year.",
      benefits: [
        "All Gold Partner benefits",
        "Keynote address at flagship community events",
        "Co-branded hackathon or cloud build competition",
        "Exclusive recruitment & campus workshop rights",
        "5 complimentary community passes",
        "Permanent Founding Partner recognition",
      ],
      isPopular: false,
    },
  ],

  // Comparison Matrix for sponsors
  sponsorComparison: [
    { benefit: "Logo on Website & Event Collateral", bronze: true, silver: true, gold: true, diamond: true },
    { benefit: "Social Media Welcome Shoutouts", bronze: true, silver: true, gold: true, diamond: true },
    { benefit: "Swag & Marketing Collateral Distribution", bronze: true, silver: true, gold: true, diamond: true },
    { benefit: "Complimentary Passes", bronze: "2 Passes", silver: "3 Passes", gold: "4 Passes", diamond: "5 Passes" },
    { benefit: "Dedicated Booth / Demo Table at Venue", bronze: false, silver: true, gold: true, diamond: true },
    { benefit: "Access to Opt-in Attendee Talent Pool", bronze: false, silver: true, gold: true, diamond: true },
    { benefit: "15-Minute Technical Session / Demo", bronze: false, silver: false, gold: true, diamond: true },
    { benefit: "Keynote Address at Major Community Events", bronze: false, silver: false, gold: false, diamond: true },
    { benefit: "Co-Branded Hackathon / Challenge", bronze: false, silver: false, gold: false, diamond: true },
    { benefit: "Permanent Founding Partner Recognition", bronze: false, silver: false, gold: false, diamond: true },
  ],
};
