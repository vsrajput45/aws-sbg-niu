// FAQ items for AWS SBG at Noida International University

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export const chapterFaqs: FAQItem[] = [
  {
    id: "what-is-group",
    question: "What is the AWS Student Builder Group at Noida International University?",
    answer:
      "The AWS Student Builder Group at Noida International University is a student-led, student-driven academic community supported by AWS Student Programs. Founded to help students learn cloud architecture, build practical solutions, and prepare for industry roles in cloud computing, artificial intelligence, cybersecurity, and data transformation.",
  },
  {
    id: "who-can-join",
    question: "Who can join?",
    answer:
      "Joining is open to any student or learner aged 18 and above, across all undergraduate and postgraduate programs at Noida International University (NIU) and surrounding institutions. Whether you study Computer Science, Information Technology, Engineering, Management, or Business Analytics, you are welcome to join.",
  },
  {
    id: "is-joining-free",
    question: "Is joining free?",
    answer:
      "Yes, joining our community is completely free. Membership registration is hosted on our verified Meetup group. You can join with one click to receive official announcements, session invites, and community updates.",
  },
  {
    id: "need-prior-experience",
    question: "Do I need prior AWS or cloud experience to participate?",
    answer:
      "Not at all! Our sessions and workshops are designed to accommodate all learning levels—from complete beginners writing their first line of cloud infrastructure to advanced students preparing for AWS certifications and enterprise projects.",
  },
  {
    id: "when-is-first-event",
    question: "When is the first event?",
    answer:
      "Founded in September 2026, our inaugural session is actively being planned by the student leadership and faculty advisors. Join our Meetup group to be the first to know the moment the date, venue, and agenda are published.",
  },
  {
    id: "how-to-participate-speak-sponsor",
    question: "How can I speak, volunteer, or partner with the group?",
    answer:
      "We actively welcome external speakers (AWS Community Builders, Heroes, industry cloud engineers), student volunteers for organizing crews, and ecosystem sponsors. You can submit your interest on our Speak page (/cfp) or reach out to our official contact email for year-round partnership inquiries.",
  },
];
