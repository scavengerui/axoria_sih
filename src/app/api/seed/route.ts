import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { Course } from "@/lib/models/course";

const SAMPLE_COURSES = [
  {
    title: "Enterprise Information Security & Threat Defense",
    description: "Comprehensive training on threat detection, zero-trust authentication, credential hygiene, and incident reporting for modern organizations.",
    competencyTags: ["Cybersecurity", "Compliance", "IT Security"],
    mandatory: true,
    estimatedDuration: 120,
    status: "published",
    createdBy: "admin_seed",
    orgId: "default",
    modules: [
      {
        title: "Module 1: Attack Vectors & Zero-Trust Principles",
        order: 1,
        lessons: [
          {
            title: "Threat Landscape & Cybersecurity Foundations",
            type: "video",
            duration: 15,
            contentUrl: "https://www.youtube.com/embed/bPVaOlJ6ln0", // IBM Technology Cyber Security
            order: 1,
          },
          {
            title: "MFA & Password Hygiene Guidelines",
            type: "article",
            duration: 10,
            content: "Never reuse passwords across personal and enterprise accounts. Enforce hardware TOTP tokens across all production systems.",
            order: 2,
          },
        ],
      },
      {
        title: "Module 2: Zero-Trust Architecture & Incident Response",
        order: 2,
        lessons: [
          {
            title: "Zero-Trust Architecture & Modern IAM",
            type: "video",
            duration: 12,
            contentUrl: "https://www.youtube.com/embed/1vR3bFh_n7A", // IBM Zero Trust Architecture
            order: 1,
          },
          {
            title: "Phishing Simulation & Quarantine Reporting",
            type: "pdf",
            duration: 10,
            contentUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
            order: 2,
          },
        ],
      },
    ],
  },
  {
    title: "Agile Leadership & Cross-Functional Team Management",
    description: "Develop executive leadership capabilities, facilitate sprint retrospectives, and lead distributed teams with high psychological safety.",
    competencyTags: ["Leadership", "Agile", "Management"],
    mandatory: false,
    estimatedDuration: 180,
    status: "published",
    createdBy: "admin_seed",
    orgId: "default",
    modules: [
      {
        title: "Module 1: Agile Mindset & Servant Leadership",
        order: 1,
        lessons: [
          {
            title: "Agile Methodology & Scrum in Practice",
            type: "video",
            duration: 14,
            contentUrl: "https://www.youtube.com/embed/8eWd1X_kQyo", // Agile Methodology
            order: 1,
          },
          {
            title: "Building Psychological Safety in Agile Teams",
            type: "video",
            duration: 15,
            contentUrl: "https://www.youtube.com/embed/LhoLuui9gX8", // TEDx Psychological Safety
            order: 2,
          },
        ],
      },
    ],
  },
  {
    title: "Data Privacy, GDPR & Governance Compliance",
    description: "Understand data residency regulations, PII anonymization techniques, and compliance audit preparation.",
    competencyTags: ["Data Privacy", "Governance", "Legal Compliance"],
    mandatory: true,
    estimatedDuration: 90,
    status: "published",
    createdBy: "admin_seed",
    orgId: "default",
    modules: [
      {
        title: "Module 1: Data Protection Principles & GDPR",
        order: 1,
        lessons: [
          {
            title: "GDPR Principles & PII Classification",
            type: "video",
            duration: 15,
            contentUrl: "https://www.youtube.com/embed/j6wKh_T_y60", // GDPR Explained
            order: 1,
          },
          {
            title: "Enterprise Data Governance & Minimization",
            type: "video",
            duration: 12,
            contentUrl: "https://www.youtube.com/embed/4yPz9yXk0fM", // IBM Data Governance
            order: 2,
          },
        ],
      },
    ],
  },
];

export async function GET() {
  try {
    await connectToDatabase();

    // Check if courses already exist
    const count = await Course.countDocuments();
    if (count === 0) {
      await Course.insertMany(SAMPLE_COURSES);
      return NextResponse.json({
        success: true,
        message: "Successfully seeded initial courses into MongoDB Atlas!",
        coursesCreated: SAMPLE_COURSES.length,
      });
    }

    // Refresh existing courses with exact topic videos
    await Course.deleteMany({ createdBy: "admin_seed" });
    await Course.insertMany(SAMPLE_COURSES);

    return NextResponse.json({
      success: true,
      message: "Refreshed courses in MongoDB Atlas with exact curated YouTube videos!",
      totalCourses: await Course.countDocuments(),
    });
  } catch (error: any) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
