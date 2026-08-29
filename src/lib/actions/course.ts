"use server";

import connectToDatabase from "@/lib/db";
import { Course, ICourse } from "@/lib/models/course";
import { Enrollment } from "@/lib/models/enrollment";
import { Notification } from "@/lib/models/notification";
import { getGroqClient, FALLBACK_GROQ_MODELS } from "@/lib/groq";
import { revalidatePath } from "next/cache";

export async function createCourse(data: {
  title: string;
  description: string;
  thumbnail?: string;
  competencyTags: string[];
  mandatory: boolean;
  estimatedDuration: number;
  createdBy: string;
  orgId: string;
  modules: Array<{
    title: string;
    order: number;
    lessons: Array<{
      title: string;
      type: "video" | "pdf" | "article";
      contentUrl?: string;
      content?: string;
      duration: number;
      order: number;
    }>;
  }>;
}) {
  try {
    await connectToDatabase();

    const newCourse = await Course.create({
      ...data,
      status: "pending",
    });

    // Notify admins about new pending course
    await Notification.create({
      userId: "all_admins",
      orgId: data.orgId,
      type: "approval",
      title: "New Course Pending Approval",
      message: `"${data.title}" was submitted for review.`,
      link: "/admin/courses",
      read: false,
    });

    revalidatePath("/trainer/courses");
    revalidatePath("/admin/courses");
    revalidatePath("/catalog");

    return { success: true, courseId: newCourse._id.toString() };
  } catch (error: any) {
    console.error("Error creating course:", error);
    return { success: false, error: error.message || "Failed to create course" };
  }
}

export async function getCourses(filters?: {
  orgId?: string;
  status?: string;
  search?: string;
  tag?: string;
  mandatory?: boolean;
}) {
  try {
    await connectToDatabase();

    const query: any = {};
    if (filters?.status && filters.status !== "all") {
      query.status = filters.status;
    } else if (!filters?.status) {
      query.status = "published";
    }

    if (filters?.search) {
      query.$or = [
        { title: { $regex: filters.search, $options: "i" } },
        { description: { $regex: filters.search, $options: "i" } },
      ];
    }

    if (filters?.tag && filters.tag !== "all") {
      query.competencyTags = filters.tag;
    }

    if (filters?.mandatory !== undefined) {
      query.mandatory = filters.mandatory;
    }

    const courses = await Course.find(query).sort({ createdAt: -1 }).lean();

    // Calculate real enrollment count from MongoDB
    const coursesWithStats = await Promise.all(
      courses.map(async (c: any) => {
        const count = await Enrollment.countDocuments({ courseId: c._id });
        return {
          ...c,
          enrolledCount: count,
        };
      })
    );

    return { success: true, courses: JSON.parse(JSON.stringify(coursesWithStats)) };
  } catch (error: any) {
    console.error("Error fetching courses:", error);
    return { success: false, courses: [], error: error.message };
  }
}

export async function getCourseById(courseId: string) {
  try {
    await connectToDatabase();
    const course = await Course.findById(courseId).lean();
    if (!course) {
      return { success: false, error: "Course not found" };
    }
    return { success: true, course: JSON.parse(JSON.stringify(course)) };
  } catch (error: any) {
    console.error("Error fetching course:", error);
    return { success: false, error: error.message };
  }
}

export async function approveCourse(courseId: string) {
  try {
    await connectToDatabase();
    const course = await Course.findByIdAndUpdate(
      courseId,
      { status: "published" },
      { new: true }
    );

    if (!course) return { success: false, error: "Course not found" };

    // Notify trainer
    await Notification.create({
      userId: course.createdBy,
      orgId: course.orgId,
      type: "course_update",
      title: "Course Approved! 🎉",
      message: `Your course "${course.title}" has been approved and is now live in the catalog.`,
      link: `/catalog/${course._id}`,
      read: false,
    });

    revalidatePath("/admin/courses");
    revalidatePath("/catalog");
    revalidatePath("/trainer/courses");

    return { success: true };
  } catch (error: any) {
    console.error("Error approving course:", error);
    return { success: false, error: error.message };
  }
}

export async function rejectCourse(courseId: string, reason?: string) {
  try {
    await connectToDatabase();
    const course = await Course.findByIdAndUpdate(
      courseId,
      { status: "rejected" },
      { new: true }
    );

    if (!course) return { success: false, error: "Course not found" };

    // Notify trainer
    await Notification.create({
      userId: course.createdBy,
      orgId: course.orgId,
      type: "course_update",
      title: "Course Needs Revision",
      message: `"${course.title}" was not approved.${reason ? ` Feedback: ${reason}` : ""}`,
      link: `/trainer/courses`,
      read: false,
    });

    revalidatePath("/admin/courses");
    revalidatePath("/trainer/courses");

    return { success: true };
  } catch (error: any) {
    console.error("Error rejecting course:", error);
    return { success: false, error: error.message };
  }
}

export async function getTrainerCourses(userId: string) {
  try {
    await connectToDatabase();
    const courses = await Course.find({ createdBy: userId }).sort({ createdAt: -1 }).lean();
    return { success: true, courses: JSON.parse(JSON.stringify(courses)) };
  } catch (error: any) {
    console.error("Error fetching trainer courses:", error);
    return { success: false, courses: [], error: error.message };
  }
}

export async function getPendingCourses() {
  try {
    await connectToDatabase();
    const courses = await Course.find({ status: "pending" }).sort({ createdAt: -1 }).lean();
    return { success: true, courses: JSON.parse(JSON.stringify(courses)) };
  } catch (error: any) {
    console.error("Error fetching pending courses:", error);
    return { success: false, courses: [], error: error.message };
  }
}

// =========================================================================
// AI PERSONAL COURSE GENERATOR (Instant Topic Search & MongoDB Enrollment)
// =========================================================================
export async function generatePersonalAICourse(params: {
  topic: string;
  userId: string;
  orgId?: string;
  preferences?: {
    includeQuiz?: boolean;
    includeFlashcards?: boolean;
    includeReadings?: boolean;
    difficulty?: "Beginner" | "Intermediate" | "Advanced";
  };
}) {
  try {
    const groq = getGroqClient();
    const topic = params.topic.trim();

    const prompt = `You are the master curriculum architect for the Axoria enterprise learning engine.
Create a rich, structured, comprehensive educational course on the topic: "${topic}".
Difficulty level: ${params.preferences?.difficulty || "Comprehensive"}.

Return ONLY a valid JSON object matching this EXACT schema (No extra commentary, no backticks):
{
  "title": "Comprehensive title for the topic",
  "description": "2-3 sentences explaining what skills the learner will acquire and why it matters.",
  "competencyTags": ["Tag1", "Tag2", "Tag3"],
  "estimatedDuration": 45,
  "modules": [
    {
      "title": "Module 1: Foundations & Core Concepts",
      "order": 1,
      "lessons": [
        {
          "title": "Lesson 1: Introduction and Architecture",
          "type": "video",
          "duration": 15,
          "order": 1,
          "contentUrl": "https://www.youtube.com/embed/j0ieRrwae5w"
        },
        {
          "title": "Lesson 2: Core Principles & Operational Guidelines",
          "type": "article",
          "duration": 10,
          "order": 2,
          "content": "Detailed educational paragraph with operational steps, best practices, and conceptual breakdown."
        }
      ]
    },
    {
      "title": "Module 2: Practical Implementation & Strategy",
      "order": 2,
      "lessons": [
        {
          "title": "Lesson 3: Advanced Techniques & Real-world Scenarios",
          "type": "article",
          "duration": 10,
          "order": 1,
          "content": "In-depth insights, real-world failure modes to avoid, and industry standard procedures."
        },
        {
          "title": "Lesson 4: Capstone Evaluation & Assessment",
          "type": "article",
          "duration": 10,
          "order": 2,
          "content": "Final review of key takeaways and summary checklist before certification."
        }
      ]
    }
  ]
}`;

    let generatedData: any = null;

    for (const model of FALLBACK_GROQ_MODELS) {
      try {
        const completion = await groq.chat.completions.create({
          model,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.3,
          max_tokens: 3000,
        });

        const raw = completion.choices[0]?.message?.content || "";
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          generatedData = JSON.parse(jsonMatch[0]);
          if (generatedData.title && generatedData.modules) {
            break;
          }
        }
      } catch (err: any) {
        console.warn(`Model ${model} failed for personal course generation:`, err.message);
      }
    }

    if (!generatedData) {
      // Fallback structured course in case of network issue
      generatedData = {
        title: `${topic.charAt(0).toUpperCase() + topic.slice(1)} Mastery & Practical Application`,
        description: `Master fundamental concepts, industry guidelines, and practical workflows for ${topic}.`,
        competencyTags: [topic.split(" ")[0] || "Specialized", "Enterprise", "Competency"],
        estimatedDuration: 40,
        modules: [
          {
            title: "Module 1: Core Fundamentals & Principles",
            order: 1,
            lessons: [
              {
                title: `${topic} Foundations & Strategy`,
                type: "video",
                duration: 15,
                order: 1,
                contentUrl: "https://www.youtube.com/embed/j0ieRrwae5w",
              },
              {
                title: "Key Framework Guidelines & Best Practices",
                type: "article",
                duration: 10,
                order: 2,
                content: `Comprehensive training on ${topic}. Continuous learning, regular verification, and adherence to operational standards ensures team success.`,
              },
            ],
          },
          {
            title: "Module 2: Advanced Scenario & Synthesis",
            order: 2,
            lessons: [
              {
                title: "Real-world Applications & Case Studies",
                type: "article",
                duration: 15,
                order: 1,
                content: `Analyzing operational patterns in ${topic} to maximize productivity and mitigate organizational risks.`,
              },
            ],
          },
        ],
      };
    }

    await connectToDatabase();

    // 1. Save Course to MongoDB
    const newCourse = await Course.create({
      title: generatedData.title,
      description: generatedData.description,
      thumbnail: "",
      competencyTags: generatedData.competencyTags || [topic, "Self-Directed"],
      mandatory: false,
      estimatedDuration: generatedData.estimatedDuration || 40,
      createdBy: params.userId,
      orgId: params.orgId || "axoria_enterprise",
      status: "published",
      modules: generatedData.modules,
    });

    // 2. Automatically Enroll the User into their newly generated course
    await Enrollment.findOneAndUpdate(
      { userId: params.userId, courseId: newCourse._id },
      {
        userId: params.userId,
        courseId: newCourse._id,
        orgId: params.orgId || "axoria_enterprise",
        assignedBy: null,
        status: "in_progress",
        progress: 0,
        completedLessons: [],
      },
      { upsert: true, new: true }
    );

    // 3. Create a Notification for the user
    await Notification.create({
      userId: params.userId,
      orgId: params.orgId || "axoria_enterprise",
      type: "course_update",
      title: `✨ Personal Course Generated: ${newCourse.title}`,
      message: `Your custom AI-generated course on "${topic}" has been added to My Learning.`,
      link: `/learn/${newCourse._id}`,
      read: false,
    });

    revalidatePath("/catalog");
    revalidatePath("/my-learning");

    return {
      success: true,
      courseId: newCourse._id.toString(),
      courseTitle: newCourse.title,
    };
  } catch (error: any) {
    console.error("Personal course generation error:", error);
    return { success: false, error: error.message || "Failed to generate personal course" };
  }
}
