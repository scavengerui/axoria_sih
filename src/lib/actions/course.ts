"use server";

import connectToDatabase from "@/lib/db";
import { Course, ICourse } from "@/lib/models/course";
import { Enrollment } from "@/lib/models/enrollment";
import { Notification } from "@/lib/models/notification";
import { getGroqClient, FALLBACK_GROQ_MODELS } from "@/lib/groq";
import { getVideosForTopic } from "@/lib/youtube-matcher";
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
      diagram?: string;
      reflectionQuestion?: string;
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
// AI PERSONAL COURSE GENERATOR (With Automatic YouTube Video Matcher)
// =========================================================================
export async function generatePersonalAICourse(params: {
  topic: string;
  userId: string;
  orgId?: string;
  preferences?: {
    quizCount?: number;
    flashcardCount?: number;
    difficulty?: "Beginner" | "Intermediate" | "Advanced";
  };
}) {
  try {
    const groq = getGroqClient();
    const topic = params.topic.trim();
    const numQuizzes = params.preferences?.quizCount || 3;
    const numFlashcards = params.preferences?.flashcardCount || 4;
    const difficulty = params.preferences?.difficulty || "Intermediate";
    const topicVideos = getVideosForTopic(topic);

    const prompt = `You are the master pedagogical architect for Axoria learning engine.
Create a structured, in-depth educational course on: "${topic}".
Difficulty: ${difficulty}.
Provide conceptual reading summaries, architecture diagrams, and reflection checkpoints.

Return ONLY a valid JSON object matching this EXACT structure (no extra text):
{
  "title": "${topic} Mastery & Operational Architecture",
  "description": "Comprehensive practical curriculum covering fundamentals, architecture, and real-world workflows for ${topic}.",
  "competencyTags": ["${topic.split(" ")[0] || "Specialized"}", "Architecture", "Mastery"],
  "estimatedDuration": 35,
  "modules": [
    {
      "title": "Module 1: Core Fundamentals & Principles",
      "order": 1,
      "lessons": [
        {
          "title": "Foundational Concepts & Principles",
          "type": "video",
          "duration": 15,
          "order": 1,
          "content": "In-depth summary explaining the fundamental concepts, core mechanics, and why this topic is essential in modern software and enterprise engineering.",
          "diagram": "STEP 1: Ingestion / Auth ---> STEP 2: Validation Engine ---> STEP 3: Execution / Enforcement",
          "reflectionQuestion": "In your own words, how would you explain the primary purpose of ${topic} to a junior team member?"
        },
        {
          "title": "Operational Guidelines & Workflow Breakdown",
          "type": "video",
          "duration": 12,
          "order": 2,
          "content": "Detailed step-by-step best practices, operational checklists, and failure modes to avoid when implementing ${topic}.",
          "diagram": "Request Context ---> Policy Evaluation Gate ---> Secure State Transition",
          "reflectionQuestion": "What is one critical pitfall to avoid during practical implementation, and how would you mitigate it?"
        }
      ]
    },
    {
      "title": "Module 2: Practical Implementation & Synthesis",
      "order": 2,
      "lessons": [
        {
          "title": "Real-World Architecture & Case Studies",
          "type": "video",
          "duration": 13,
          "order": 1,
          "content": "Analysis of enterprise design patterns, real-world case studies, and performance optimization strategies.",
          "diagram": "Client / Agent ---> Load Balancer ---> Isolated Execution Core ---> Audit Log",
          "reflectionQuestion": "How does adopting this architecture enhance overall reliability and system compliance?"
        }
      ]
    }
  ],
  "quizzes": [
    {
      "id": "q1",
      "text": "What is a primary principle of ${topic}?",
      "options": [
        "Continuous validation and structured operational hygiene",
        "Ignoring errors during production rollout",
        "Disabling security controls for convenience",
        "Hardcoding static secrets in source code"
      ],
      "correctIndex": 0,
      "explanation": "Continuous validation and structured operational hygiene form the core of reliable execution."
    }
  ],
  "flashcards": [
    {
      "id": "fc1",
      "front": "What is the core objective of ${topic}?",
      "back": "To establish consistent, scalable, and verifiable operational competencies."
    }
  ]
}

Rules:
- Generate exactly ${numQuizzes} multiple choice questions.
- Generate exactly ${numFlashcards} flashcards with front and back.
- Ensure every lesson includes a reflectionQuestion and diagram flow.`;

    let generatedData: any = null;

    for (const model of FALLBACK_GROQ_MODELS) {
      try {
        const completion = await groq.chat.completions.create({
          model,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.3,
          max_tokens: 3500,
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
      // Fallback clean structured course
      generatedData = {
        title: `${topic.charAt(0).toUpperCase() + topic.slice(1)} Mastery & Practical Architecture`,
        description: `Comprehensive practical curriculum covering fundamentals, architecture, and real-world workflows for ${topic}.`,
        competencyTags: [topic.split(" ")[0] || "Specialized", "Enterprise", "Competency"],
        estimatedDuration: 35,
        modules: [
          {
            title: "Module 1: Core Fundamentals & Principles",
            order: 1,
            lessons: [
              {
                title: "Foundational Concepts & Principles",
                type: "video",
                duration: 15,
                order: 1,
                content: `Comprehensive training on ${topic}. Understanding core principles, foundational architecture, and practical operational workflows is essential for high-velocity teams.`,
                diagram: "STEP 1: Input / Request ---> STEP 2: Policy & Logic Gate ---> STEP 3: Execution Output",
                reflectionQuestion: `In your own words, what is the core benefit of mastering ${topic}?`,
              },
              {
                title: "Operational Guidelines & Workflow Breakdown",
                type: "video",
                duration: 12,
                order: 2,
                content: `Step-by-step methodologies and best practices for ${topic}. Regular self-assessments and cross-team communication mitigate failure risks.`,
                diagram: "Client State ---> Verification Check ---> Audit Log Verification",
                reflectionQuestion: "What is one key operational safeguard you would implement first?",
              },
            ],
          },
          {
            title: "Module 2: Practical Implementation & Synthesis",
            order: 2,
            lessons: [
              {
                title: "Real-World Architecture & Case Studies",
                type: "video",
                duration: 13,
                order: 1,
                content: `Analyzing enterprise adoption patterns and optimization techniques for ${topic}.`,
                diagram: "User Context ---> Scalable Service Core ---> Monitored Telemetry",
                reflectionQuestion: "How would you measure the success of this workflow in a production environment?",
              },
            ],
          },
        ],
        quizzes: [
          {
            id: "q1",
            text: `What is the foundational principle of ${topic}?`,
            options: [
              "Continuous validation, clear structure, and proactive hygiene",
              "Disabling compliance checks to save time",
              "Sharing administrative credentials across unverified tools",
              "Ignoring system logs during incident response",
            ],
            correctIndex: 0,
            explanation: "Continuous verification and structured operational hygiene form the core foundation.",
          },
        ],
        flashcards: [
          {
            id: "fc1",
            front: `What is the primary purpose of ${topic}?`,
            back: "To build reliable, scalable, and verifiable competencies across the organization.",
          },
        ],
      };
    }

    // Automatically enrich lessons with relevant YouTube video URLs
    let videoIndex = 0;
    const enrichedModules = (generatedData.modules || []).map((m: any, mIdx: number) => ({
      title: m.title || `Module ${mIdx + 1}`,
      order: m.order || mIdx + 1,
      lessons: (m.lessons || []).map((l: any, lIdx: number) => {
        const assignedVideo = topicVideos[videoIndex % topicVideos.length];
        videoIndex++;

        return {
          title: l.title || `Lesson ${lIdx + 1}`,
          type: "video",
          duration: l.duration || assignedVideo.duration || 12,
          contentUrl: l.contentUrl || assignedVideo.url,
          content: l.content || `Comprehensive structured educational training on ${l.title}.`,
          diagram: l.diagram || "Input Context ---> Policy Verification Engine ---> Scalable Enforcement Output",
          reflectionQuestion: l.reflectionQuestion || `In your own words, what is the most critical operational takeaway from ${l.title}?`,
          order: l.order || lIdx + 1,
        };
      }),
    }));

    await connectToDatabase();

    // 1. Save Course to MongoDB
    const newCourse: any = await Course.create({
      title: generatedData.title,
      description: generatedData.description,
      thumbnail: "",
      competencyTags: generatedData.competencyTags || [topic, "Personalized"],
      mandatory: false,
      estimatedDuration: generatedData.estimatedDuration || 35,
      createdBy: params.userId,
      orgId: params.orgId || "axoria_enterprise",
      status: "published",
      modules: enrichedModules,
      metadata: {
        quizzes: generatedData.quizzes,
        flashcards: generatedData.flashcards,
      },
    });

    // 2. Automatically Enroll the User into their newly generated course (starts at 0% progress!)
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
      message: `Your custom curriculum on "${topic}" with video lectures and interactive reflection checkpoints has been added to My Learning.`,
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
