import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { Course } from "@/lib/models/course";
import { COURSES_DATABASE } from "@/lib/data/courseCatalogData";

export async function GET() {
  try {
    await connectToDatabase();

    // Map all 22 curated courses from COURSES_DATABASE into Mongoose schema
    const formattedCourses = Object.values(COURSES_DATABASE).map((c) => ({
      title: c.title,
      description: c.description,
      thumbnail: "",
      competencyTags: c.tags,
      mandatory: c.isMandatory,
      estimatedDuration: parseInt(c.stats.duration) || 60,
      status: "published",
      createdBy: "admin_seed",
      orgId: "default",
      modules: c.modules.map((m, mIdx) => ({
        title: m.title,
        order: mIdx + 1,
        lessons: m.lessons.map((l, lIdx) => ({
          title: l.title,
          type: l.type || "video",
          contentUrl: l.videoUrl || "https://www.youtube.com/embed/j0ieRrwae5w",
          content: l.articleContent || `Comprehensive training on ${l.title}.`,
          diagram: l.diagram || "Input Context ---> Policy Verification Engine ---> Scalable Enforcement Output",
          reflectionQuestion: l.reflectionQuestion || `In your own words, what is the most critical operational takeaway from ${l.title}?`,
          duration: parseInt(l.duration) || 12,
          order: lIdx + 1,
        })),
      })),
      metadata: {
        quizzes: c.quiz?.questions || [],
        flashcards: c.flashcards || [],
      },
    }));

    // Clear previous seeded courses and insert all 22
    await Course.deleteMany({ createdBy: "admin_seed" });
    const inserted = await Course.insertMany(formattedCourses);

    return NextResponse.json({
      success: true,
      message: `Successfully seeded ${inserted.length} comprehensive technical and leadership courses into MongoDB Atlas!`,
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
