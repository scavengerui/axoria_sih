"use server";

import connectToDatabase from "@/lib/db";
import { Enrollment } from "@/lib/models/enrollment";
import { Course } from "@/lib/models/course";
import { Certificate } from "@/lib/models/certificate";
import { Notification } from "@/lib/models/notification";
import { generateCertificateId } from "@/lib/utils";
import { revalidatePath } from "next/cache";

export async function assignTraining(data: {
  courseIds: string[];
  userIds: string[];
  assignedBy: string;
  orgId: string;
  dueDate?: Date;
  mandatory?: boolean;
}) {
  try {
    await connectToDatabase();

    const createdEnrollments = [];

    for (const courseId of data.courseIds) {
      const course = await Course.findById(courseId);
      const courseTitle = course?.title || "Assigned Training";

      for (const userId of data.userIds) {
        // Upsert enrollment to avoid duplicates
        const enrollment = await Enrollment.findOneAndUpdate(
          { userId, courseId },
          {
            userId,
            courseId,
            orgId: data.orgId,
            assignedBy: data.assignedBy,
            dueDate: data.dueDate,
            mandatory: data.mandatory ?? true,
            status: "enrolled",
          },
          { upsert: true, new: true }
        );

        createdEnrollments.push(enrollment);

        // Send notification to learner
        await Notification.create({
          userId,
          orgId: data.orgId,
          type: "assignment",
          title: "New Training Assigned",
          message: `You have been assigned "${courseTitle}".${data.dueDate ? ` Due: ${new Date(data.dueDate).toLocaleDateString()}` : ""}`,
          link: `/learn/${courseId}`,
          read: false,
        });
      }
    }

    revalidatePath("/my-learning");
    revalidatePath("/manager/team");
    revalidatePath("/dashboard");

    return { success: true, count: createdEnrollments.length };
  } catch (error: any) {
    console.error("Error assigning training:", error);
    return { success: false, error: error.message || "Failed to assign training" };
  }
}

export async function getUserEnrollments(userId: string) {
  try {
    await connectToDatabase();
    const enrollments = await Enrollment.find({ userId })
      .populate("courseId")
      .sort({ updatedAt: -1 })
      .lean();

    return { success: true, enrollments: JSON.parse(JSON.stringify(enrollments)) };
  } catch (error: any) {
    console.error("Error fetching enrollments:", error);
    return { success: false, enrollments: [], error: error.message };
  }
}

export async function updateLessonProgress(data: {
  userId: string;
  courseId: string;
  lessonId: string;
  totalLessons: number;
}) {
  try {
    await connectToDatabase();

    let enrollment = await Enrollment.findOne({
      userId: data.userId,
      courseId: data.courseId,
    });

    if (!enrollment) {
      // Auto-enroll if learner starts self-enrolled course
      enrollment = await Enrollment.create({
        userId: data.userId,
        courseId: data.courseId,
        orgId: "default",
        status: "in_progress",
        progress: 0,
        completedLessons: [],
      });
    }

    // Add completed lesson if not already present
    const completedSet = new Set(enrollment.completedLessons.map((id: any) => id.toString()));
    completedSet.add(data.lessonId);

    const completedCount = completedSet.size;
    const progress = Math.min(100, Math.round((completedCount / Math.max(1, data.totalLessons)) * 100));

    const isComplete = progress === 100;
    enrollment.completedLessons = Array.from(completedSet);
    enrollment.progress = progress;
    enrollment.status = isComplete ? "completed" : "in_progress";
    if (isComplete && !enrollment.completedAt) {
      enrollment.completedAt = new Date();
    }

    await enrollment.save();

    // Auto-generate certificate record if 100% complete
    if (isComplete) {
      const existingCert = await Certificate.findOne({
        userId: data.userId,
        courseId: data.courseId,
      });

      if (!existingCert) {
        const certId = generateCertificateId();
        await Certificate.create({
          userId: data.userId,
          courseId: data.courseId,
          orgId: enrollment.orgId || "default",
          certificateId: certId,
          issuedAt: new Date(),
        });

        // Notify user about certificate
        await Notification.create({
          userId: data.userId,
          orgId: enrollment.orgId || "default",
          type: "certificate",
          title: "Certificate Earned! 🏆",
          message: `Congratulations! You completed the course and earned Certificate #${certId}.`,
          link: "/certificates",
          read: false,
        });
      }
    }

    revalidatePath(`/learn/${data.courseId}`);
    revalidatePath("/my-learning");
    revalidatePath("/certificates");
    revalidatePath("/dashboard");

    return {
      success: true,
      progress,
      isComplete,
      completedLessons: Array.from(completedSet),
    };
  } catch (error: any) {
    console.error("Error updating lesson progress:", error);
    return { success: false, error: error.message };
  }
}

export async function getUserCertificates(userId: string) {
  try {
    await connectToDatabase();
    const certificates = await Certificate.find({ userId })
      .populate("courseId")
      .sort({ issuedAt: -1 })
      .lean();

    return { success: true, certificates: JSON.parse(JSON.stringify(certificates)) };
  } catch (error: any) {
    console.error("Error fetching certificates:", error);
    return { success: false, certificates: [], error: error.message };
  }
}
