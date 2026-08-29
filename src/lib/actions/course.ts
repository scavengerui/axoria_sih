"use server";

import connectToDatabase from "@/lib/db";
import { Course, ICourse } from "@/lib/models/course";
import { Enrollment } from "@/lib/models/enrollment";
import { Notification } from "@/lib/models/notification";
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
    if (filters?.status) {
      query.status = filters.status;
    } else {
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
