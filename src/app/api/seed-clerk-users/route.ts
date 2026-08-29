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

    // 1. Get the official Axoria Organization in Clerk
    const orgs = await client.organizations.getOrganizationList({ limit: 10 });
    let targetOrg = orgs.data.find((o) => o.name.toLowerCase().includes("axoria")) || orgs.data[0];

    // If no Axoria org exists, create the official one
    if (!targetOrg) {
      targetOrg = await client.organizations.createOrganization({
        name: "Axoria Enterprise",
      });
    }

    const orgId = targetOrg.id;
    console.log("Official Organization Target:", targetOrg.name, orgId);

    // 2. Get published courses in MongoDB
    const publishedCourses = await Course.find({ status: "published" });

    const results = [];
    const defaultPassword = "axoria@123";

    // Clean old enrollments to ensure fresh, accurate state
    await Enrollment.deleteMany({});

    // 3. Migrate ALL registered real Clerk users into Axoria
    const allClerkUsers = await client.users.getUserList({ limit: 100 });
    for (const realUser of allClerkUsers.data) {
      try {
        const userEmail = realUser.emailAddresses[0]?.emailAddress || "";
        const isAdmin = userEmail === "sivadhanushkotturu@gmail.com";
        const role = isAdmin ? "org:admin" : "org:member";

        await client.organizations.createOrganizationMembership({
          organizationId: orgId,
          userId: realUser.id,
          role,
        });

        // If learner, enroll in published courses
        if (!isAdmin && publishedCourses.length > 0) {
          for (const course of publishedCourses) {
            try {
              await Enrollment.create({
                userId: realUser.id,
                courseId: course._id,
                orgId: orgId,
                mandatory: course.mandatory,
                status: "in_progress",
                progress: 15,
              });
            } catch {}
          }
        }

        results.push({
          name: `${realUser.firstName || ""} ${realUser.lastName || ""}`.trim() || userEmail,
          email: userEmail,
          status: "Migrated into Axoria",
        });
      } catch (err: any) {
        // Already a member
      }
    }

    // 4. Provision all 25 Enterprise Personnel into Axoria
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
          const newUser = await client.users.createUser({
            firstName,
            lastName,
            emailAddress: [person.email],
            password: defaultPassword,
            skipPasswordChecks: true,
          });
          clerkUserId = newUser.id;
        }

        // Add to Axoria Organization with exact role
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

        // 5. Enroll active learners in MongoDB
        if (clerkUserId && person.role === "learner" && publishedCourses.length > 0) {
          for (const course of publishedCourses) {
            const isAgileCourse =
              course.title.toLowerCase().includes("agile") ||
              course.title.toLowerCase().includes("leadership");
            const isEngineeringOrProduct =
              person.department === "Engineering" || person.department === "Product & Design";

            if (isAgileCourse && !isEngineeringOrProduct) {
              continue;
            }

            try {
              await Enrollment.create({
                userId: clerkUserId,
                courseId: course._id,
                orgId: orgId,
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
          status: "Synced into Axoria",
        });
      } catch (userErr: any) {
        console.error(`Clerk error for ${person.name}:`, JSON.stringify(userErr.errors || userErr, null, 2));
      }
    }

    const totalEnrollments = await Enrollment.countDocuments();

    return NextResponse.json({
      success: true,
      message: `Successfully migrated all users into ${targetOrg.name} and created ${totalEnrollments} MongoDB enrollments!`,
      targetOrg: targetOrg.name,
      orgId: orgId,
      migratedCount: results.length,
      totalEnrollmentsInDB: totalEnrollments,
      users: results,
    });
  } catch (error: any) {
    console.error("Clerk & Mongo migration error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
