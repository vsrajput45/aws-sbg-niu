// Official Core Team for AWS Student Builder Group at Noida International University (2026-27)

export interface TeamMember {
  name: string;
  role: string;
  department: string;
  bio: string;
  avatarUrl: string;
  cardUrl: string;
  initials: string;
  session: string;
  badge: string;
}

export const coreTeam: TeamMember[] = [
  {
    name: "Samir  Raja",
    role: "Group Leader",
    department: "Computer Science & Engineering",
    bio: "Overall chapter leadership, liaising with AWS Student Programs, setting community vision, and fostering the builder ecosystem at NIU.",
    avatarUrl: "/team/samir-raja.jpg",
    cardUrl: "/team/samir-raja-card.jpg",
    initials: "SR",
    session: "2026-27",
    badge: "Chapter Head",
  },
  {
    name: "Vivek  Kumar",
    role: "Co-Lead & Director of Events",
    department: "Computer Science & Engineering",
    bio: "Co-leading chapter initiatives, event strategy, hands-on cloud hackathons, and seamless speaker coordination for AWS SBG at NIU.",
    avatarUrl: "/team/vivek-kumar-hd.jpg",
    cardUrl: "/team/vivek-kumar-card.jpg",
    initials: "VK",
    session: "2026-27",
    badge: "Leadership Core",
  },
  {
    name: "Anurag  Rai",
    role: "Technical Lead",
    department: "Computer Science & Engineering",
    bio: "Architecting hands-on AWS coding labs, cloud architecture challenges, and mentoring student builders across core cloud services.",
    avatarUrl: "/team/anurag-rai.jpg",
    cardUrl: "/team/anurag-rai-card.jpg",
    initials: "AR",
    session: "2026-27",
    badge: "Technical Architecture",
  },
  {
    name: "Shivam  Dubey",
    role: "Community & Outreach Lead",
    department: "Information Technology",
    bio: "Spearheading student outreach, forging partnerships with tech communities across Delhi NCR, and expanding builder engagement.",
    avatarUrl: "/team/shivam-dubey.jpg",
    cardUrl: "/team/shivam-dubey-card.jpg",
    initials: "SD",
    session: "2026-27",
    badge: "Community & Partnerships",
  },
  {
    name: "Aalok  Sharma",
    role: "Operations Lead",
    department: "Cloud Computing & Systems",
    bio: "Orchestrating end-to-end community operations, logistics, session planning, and student builder workflow management.",
    avatarUrl: "/team/aalok-sharma.jpg",
    cardUrl: "/team/aalok-sharma-card.jpg",
    initials: "AS",
    session: "2026-27",
    badge: "Operations & Logistics",
  },
  {
    name: "Kanika",
    role: "Social Media & Content Lead",
    department: "Computer Applications",
    bio: "Directing official social media channels, brand storytelling, technical session write-ups, and student learning collateral.",
    avatarUrl: "/team/kanika.jpg",
    cardUrl: "/team/kanika-card.jpg",
    initials: "K",
    session: "2026-27",
    badge: "Content & Branding",
  },
];
