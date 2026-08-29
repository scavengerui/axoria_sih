import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import connectToDatabase from "@/lib/db";
import { Course } from "@/lib/models/course";
import { Enrollment } from "@/lib/models/enrollment";
import { ENTERPRISE_ROSTER } from "@/lib/data/enterpriseRoster";

export async function GET() {
  try {
    const client = await clerkClient();
    await connectToDatabase();

    // 1. Get existing organizations
    const orgs = await client.organizations.getOrganizationList({ limit: 10 });
    const targetOrg = orgs.data[0];
    const orgId = targetOrg?.id;

    // 2. Get published courses in MongoDB
    const publishedCourses = await Course.find({ status: "published" });

    const results = [];
    const defaultPassword = "axoria@123";

    // Clean old enrollments to ensure only valid learners are enrolled
    await Enrollment.deleteMany({});

    // Provision all enterprise personnel in Clerk & MongoDB
    for (const person of ENTERPRISE_ROSTER) {
      try {
        const nameParts = person.name.replace(/^Dr\.\s*|^Prof\.\s*|^Col\.\s*/, "").split(" ");
        const firstName = nameParts[0] || "Member";
        const lastName = nameParts.slice(1).join(" ") || "Axoria";

        // Check if user already exists in Clerk
        const existingUsers = await client.users.getUserList({
          emailAddress: [person.email],
        });

        let clerkUserId = existingUsers.data[0]?.id;

        if (!clerkUserId) {
          // Create new user in Clerk with password
          const newUser = await client.users.createUser({
            firstName,
            lastName,
            emailAddress: [person.email],
            password: defaultPassword,
            skipPasswordChecks: true,
          });
          clerkUserId = newUser.id;
        }

        // Add to Clerk Organization with exact role
        if (orgId && clerkUserId) {
          try {
            const role =
              person.role === "admin"
                ? "org:admin"
                : person.role === "manager"
                  ? "org:manager"
                  : person.role === "trainer"
                    ? "org:trainer"
                    : "org:member";

            await client.organizations.createOrganizationMembership({
              organizationId: orgId,
              userId: clerkUserId,
              role,
            });
          } catch (orgErr: any) {
            // Already member
          }
        }

        // 3. ONLY ENROLL ACTIVE LEARNERS (Trainers and Admins do NOT enroll as learners!)
        if (clerkUserId && person.role === "learner" && publishedCourses.length > 0) {
          for (const course of publishedCourses) {
            const isAgileCourse = course.title.toLowerCase().includes("agile") || course.title.toLowerCase().includes("leadership");
            const isEngineeringOrProduct = person.department === "Engineering" || person.department === "Product & Design";

            // Only enroll in optional agile track if relevant to engineering/product
            if (isAgileCourse && !isEngineeringOrProduct) {
              continue;
            }

            try {
              await Enrollment.create({
                userId: clerkUserId,
                courseId: course._id,
                orgId: orgId || "default",
                mandatory: course.mandatory,
                status: person.status === "Certified" ? "completed" : "in_progress",
                progress: person.status === "Certified" ? 100 : person.completionRate,
                completedAt: person.status === "Certified" ? new Date() : undefined,
              });
            } catch (enrollErr: any) {
              console.warn("Enrollment error:", enrollErr.message);
            }
          }
        }

        results.push({
          name: person.name,
          email: person.email,
          role: person.role,
          status: person.role === "learner" ? "Learner Enrolled" : "Staff Account Synced",
        });
      } catch (userErr: any) {
        console.error(`Clerk error for ${person.name}:`, JSON.stringify(userErr.errors || userErr, null, 2));
        results.push({
          name: person.name,
          email: person.email,
          status: userErr.errors?.[0]?.message || userErr.message,
        });
      }
    }

    const totalEnrollments = await Enrollment.countDocuments();
    const totalLearners = ENTERPRISE_ROSTER.filter((r) => r.role === "learner").length;

    return NextResponse.json({
      success: true,
      message: `Cleanly synced ${results.length} users (${totalLearners} Learners) and created ${totalEnrollments} targeted MongoDB enrollments!`,
      defaultPassword: defaultPassword,
      activeLearners: totalLearners,
      totalEnrollmentsInDB: totalEnrollments,
      users: results,
    });
  } catch (error: any) {
    console.error("Clerk & Mongo seed error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
