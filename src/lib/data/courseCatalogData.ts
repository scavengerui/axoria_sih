export interface QuizQuestion {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface LessonItem {
  id: string;
  title: string;
  type: "video" | "pdf" | "article";
  duration: string;
  videoUrl?: string;
  articleContent?: string;
  pdfUrl?: string;
  hasQuiz?: boolean;
}

export interface CourseModule {
  id: string;
  title: string;
  lessons: LessonItem[];
}

export interface CourseDetail {
  id: string;
  title: string;
  description: string;
  instructor: {
    name: string;
    role: string;
    avatar: string;
  };
  stats: {
    duration: string;
    enrolled: number;
    rating: number;
  };
  tags: string[];
  isMandatory: boolean;
  modules: CourseModule[];
  quiz: {
    title: string;
    questions: QuizQuestion[];
  };
}

export const COURSES_DATABASE: Record<string, CourseDetail> = {
  // COURSE 1: Cybersecurity
  "1": {
    id: "1",
    title: "Enterprise Information Security & Threat Defense",
    description:
      "Master threat detection, zero-trust authentication, credential hygiene, and incident reporting for enterprise compliance. Learn to identify advanced phishing vectors, configure MFA, and isolate compromised hosts.",
    instructor: {
      name: "Dr. Raghavan Sundaram",
      role: "Chief Information Security Officer & Principal Instructor",
      avatar: "RS",
    },
    stats: {
      duration: "2h 00m",
      enrolled: 17,
      rating: 4.9,
    },
    tags: ["Cybersecurity", "Zero-Trust", "Compliance"],
    isMandatory: true,
    modules: [
      {
        id: "m1",
        title: "Module 1: Threat Landscape & Zero-Trust Principles",
        lessons: [
          {
            id: "l1_1",
            title: "Threat Landscape & Cybersecurity Foundations",
            type: "video",
            duration: "15m",
            videoUrl: "https://www.youtube.com/embed/bPVaOlJ6ln0",
          },
          {
            id: "l1_2",
            title: "MFA & Password Hygiene Guidelines",
            type: "article",
            duration: "10m",
            articleContent: `### Best Practices for Enterprise Access Security

Modern enterprise security requires a zero-trust mindset:

1. **Multi-Factor Authentication (MFA):** Always enforce authenticator app or hardware key verification (FIDO2) on all corporate systems.
2. **Password Length over Complexity:** Passphrases with 16+ characters provide exponential entropy compared to short symbol soup.
3. **Privilege Separation:** Never use administrator privileges for everyday browsing and email handling.

> **Key Rule:** If an unexpected prompt asks you to approve an MFA push notification that you did not trigger, reject it immediately and report it to IT Security.`,
          },
          {
            id: "l1_3",
            title: "Incident Response Procedures & Quarantine Policy",
            type: "pdf",
            duration: "10m",
            pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
          },
        ],
      },
      {
        id: "m2",
        title: "Module 2: Zero-Trust Architecture & Isolation",
        lessons: [
          {
            id: "l1_4",
            title: "Zero-Trust Architecture & Modern IAM",
            type: "video",
            duration: "12m",
            videoUrl: "https://www.youtube.com/embed/1vR3bFh_n7A",
          },
          {
            id: "l1_5",
            title: "Microsegmentation & Blast-Radius Containment",
            type: "article",
            duration: "15m",
            articleContent: `### Network Microsegmentation Playbook

- **Assume Breach:** Isolate production databases from developer workstations.
- **Continuous Posture Checks:** Verify device encryption, OS patches, and endpoint detection agents before granting access.
- **Least Privilege Access:** Grant temporary just-in-time (JIT) access tokens for sensitive server SSH sessions.`,
          },
        ],
      },
    ],
    quiz: {
      title: "Enterprise Cybersecurity Compliance Assessment",
      questions: [
        {
          id: "q1_1",
          text: "What is the primary rule of Zero-Trust Architecture?",
          options: [
            "Never trust, always verify every single request regardless of origin",
            "Trust all traffic originating from within the local corporate office Wi-Fi",
            "Disable multi-factor authentication for internal developers",
            "Rely entirely on perimeter firewall rules without host inspection",
          ],
          correctIndex: 0,
          explanation: "Zero-Trust assumes breach and verifies explicit identity, device health, and context for every request.",
        },
        {
          id: "q1_2",
          text: "Which authentication factor is most resistant to SIM-swapping and interception attacks?",
          options: [
            "SMS text message OTP code",
            "FIDO2 Hardware Security Key (e.g. YubiKey) or TOTP Authenticator App",
            "Security questions about childhood pets",
            "Unencrypted email verification links",
          ],
          correctIndex: 1,
          explanation: "Hardware security keys and TOTP apps are cryptographically bound and cannot be intercepted over cellular telecom networks.",
        },
        {
          id: "q1_3",
          text: "What should you do if an unexpected MFA push approval notification appears on your phone?",
          options: [
            "Approve it quickly in case it is a background system backup",
            "Reject it immediately and alert your IT Security / SOC department",
            "Ignore it and leave the phone alone for 2 hours",
            "Disable MFA on your account to prevent future prompts",
          ],
          correctIndex: 1,
          explanation: "Unexpected prompts indicate that someone may have obtained your password and is attempting an unauthorized login.",
        },
      ],
    },
  },

  // COURSE 2: Agile Leadership
  "2": {
    id: "2",
    title: "Agile Leadership & Cross-Functional Team Management",
    description:
      "Develop executive leadership capabilities, facilitate sprint retrospectives, build psychological safety, and lead distributed cross-functional engineering teams with high velocity.",
    instructor: {
      name: "Prof. Sunita Deshmukh",
      role: "Head of Executive Leadership & Org Development",
      avatar: "SD",
    },
    stats: {
      duration: "3h 00m",
      enrolled: 12,
      rating: 4.8,
    },
    tags: ["Leadership", "Agile", "Management"],
    isMandatory: false,
    modules: [
      {
        id: "m2_1",
        title: "Module 1: Agile Mindset & Servant Leadership",
        lessons: [
          {
            id: "l2_1",
            title: "Agile Methodology & Scrum in Practice",
            type: "video",
            duration: "14m",
            videoUrl: "https://www.youtube.com/embed/8eWd1X_kQyo",
          },
          {
            id: "l2_2",
            title: "Servant Leadership: Empowering Autonomous Squads",
            type: "article",
            duration: "12m",
            articleContent: `### Principles of Servant Leadership in Tech Teams

1. **Remove Blockers, Don't Micromanage:** A leader's job is to clear dependencies, provide context, and empower squad members to make local architecture decisions.
2. **Outcome over Output:** Focus on customer impact and deployed business value rather than sheer ticket count or story points.
3. **Transparent Retrospectives:** Normalize discussing failures openly during sprint post-mortems without pointing fingers.`,
          },
        ],
      },
      {
        id: "m2_2",
        title: "Module 2: Psychological Safety & Retrospectives",
        lessons: [
          {
            id: "l2_3",
            title: "Building Psychological Safety in Distributed Teams",
            type: "video",
            duration: "15m",
            videoUrl: "https://www.youtube.com/embed/LhoLuui9gX8",
          },
          {
            id: "l2_4",
            title: "Facilitating High-Impact Sprint Retrospectives",
            type: "article",
            duration: "10m",
            articleContent: `### The 4-Step Retrospective Framework

- **What Went Well:** Celebrate small wins and recognized peer contributions.
- **What Could Be Improved:** Identify friction in deployment pipelines and cross-team communications.
- **Action Items:** Assign exactly 1-2 owners with explicit due dates for process improvements.`,
          },
        ],
      },
    ],
    quiz: {
      title: "Agile Leadership & Team Velocity Assessment",
      questions: [
        {
          id: "q2_1",
          text: "How does high psychological safety impact team performance according to Harvard research?",
          options: [
            "Encourages open risk-taking, defect reporting, and constructive dissent without fear of humiliation",
            "Eliminates all deadlines, accountability, and performance reviews",
            "Requires 100% unanimous agreement on all technical proposals",
            "Restricts team communications to written memos only",
          ],
          correctIndex: 0,
          explanation: "Psychological safety creates an environment where employees feel safe to ask questions, report bugs early, and propose novel solutions.",
        },
        {
          id: "q2_2",
          text: "What is the primary role of an agile manager operating under Servant Leadership?",
          options: [
            "Assigning daily tasks to individual developers each morning",
            "Removing organizational blockers, facilitating alignment, and empowering team autonomy",
            "Controlling all code merges and repository permissions",
            "Writing the performance reviews without peer input",
          ],
          correctIndex: 1,
          explanation: "Servant leaders serve the team by removing friction, coaching growth, and protecting team focus.",
        },
        {
          id: "q2_3",
          text: "What is the key output of an effective Sprint Retrospective ceremony?",
          options: [
            "A blame report detailing which engineer wrote bugs",
            "1-2 concrete, owner-assigned action items to improve team process in the next sprint",
            "A revised estimate of the entire product roadmap",
            "Canceling the upcoming sprint planning session",
          ],
          correctIndex: 1,
          explanation: "Effective retrospectives distill team feedback into actionable continuous improvements with clear owners.",
        },
      ],
    },
  },

  // COURSE 3: Data Privacy
  "3": {
    id: "3",
    title: "Data Privacy, GDPR & Governance Compliance",
    description:
      "Understand data residency regulations, GDPR requirements, PII anonymization techniques, breach notification workflows, and compliance audit preparation.",
    instructor: {
      name: "Dr. Ananya Sengupta",
      role: "Lead Compliance Auditor & Governance Officer",
      avatar: "AS",
    },
    stats: {
      duration: "1h 30m",
      enrolled: 17,
      rating: 4.7,
    },
    tags: ["Data Privacy", "GDPR", "Governance"],
    isMandatory: true,
    modules: [
      {
        id: "m3_1",
        title: "Module 1: GDPR Principles & PII Classification",
        lessons: [
          {
            id: "l3_1",
            title: "GDPR Principles & PII Classification",
            type: "video",
            duration: "15m",
            videoUrl: "https://www.youtube.com/embed/j6wKh_T_y60",
          },
          {
            id: "l3_2",
            title: "PII Classification Matrix & Data Mapping",
            type: "article",
            duration: "12m",
            articleContent: `### Enterprise PII Classification Tiers

1. **Public:** Marketing materials, published press releases, public documentation.
2. **Internal:** Organizational charts, internal wikis, project roadmaps.
3. **Confidential:** Financial statements, vendor contracts, business plans.
4. **Restricted (PII):** Aadhaar/SSN numbers, passwords, biometric data, personal health information.

> **Requirement:** All Restricted PII data must be encrypted with AES-256 both in transit and at rest.`,
          },
        ],
      },
      {
        id: "m3_2",
        title: "Module 2: Data Minimization & Governance",
        lessons: [
          {
            id: "l3_3",
            title: "Enterprise Data Governance & Minimization",
            type: "video",
            duration: "12m",
            videoUrl: "https://www.youtube.com/embed/4yPz9yXk0fM",
          },
          {
            id: "l3_4",
            title: "GDPR Compliance Audit Checklist",
            type: "pdf",
            duration: "10m",
            pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
          },
        ],
      },
    ],
    quiz: {
      title: "Data Privacy & GDPR Governance Assessment",
      questions: [
        {
          id: "q3_1",
          text: "Under GDPR and modern privacy standards, what is the 'Data Minimization' principle?",
          options: [
            "Organizations must collect only the adequate and strictly necessary data for the stated purpose",
            "Compressing database files to reduce cloud storage billing",
            "Deleting all customer accounts after 30 days of inactivity",
            "Storing customer information only on local employee hard drives",
          ],
          correctIndex: 0,
          explanation: "Data Minimization requires that personal data collected is limited strictly to what is necessary in relation to the purposes for which they are processed.",
        },
        {
          id: "q3_2",
          text: "What is the mandatory timeframe for notifying supervisory authorities of a severe personal data breach under GDPR?",
          options: [
            "Within 72 hours of becoming aware of the breach",
            "Within 30 business days",
            "At the end of the fiscal quarter",
            "Only if more than 100,000 records were compromised",
          ],
          correctIndex: 0,
          explanation: "Article 33 of GDPR mandates that personal data breaches must be reported to the supervisory authority within 72 hours.",
        },
        {
          id: "q3_3",
          text: "Which of the following is considered 'Special Category' or Restricted sensitive data under privacy laws?",
          options: [
            "Biometric identifiers, health data, and religious affiliations",
            "Company office physical address",
            "General job title on LinkedIn",
            "Work email domain name",
          ],
          correctIndex: 0,
          explanation: "Special category data includes biometric, genetic, health, and racial/ethnic data, which require explicit consent and heightened safeguards.",
        },
      ],
    },
  },
};

export function getCourseDetailById(id: string): CourseDetail {
  if (COURSES_DATABASE[id]) {
    return COURSES_DATABASE[id];
  }

  // If MongoDB ObjectID or title key passed, match smartly
  if (id.toLowerCase().includes("agile") || id.toLowerCase().includes("lead") || id.endsWith("2")) {
    return COURSES_DATABASE["2"];
  }
  if (id.toLowerCase().includes("privacy") || id.toLowerCase().includes("gdpr") || id.endsWith("3")) {
    return COURSES_DATABASE["3"];
  }

  // Fallback to Course 1 (Cybersecurity)
  return COURSES_DATABASE["1"];
}
