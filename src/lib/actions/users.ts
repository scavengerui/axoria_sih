"use server";

import { clerkClient, auth } from "@clerk/nextjs/server";
import { ENTERPRISE_ROSTER, EnterpriseMember } from "@/lib/data/enterpriseRoster";
import connectToDatabase from "@/lib/db";
import { Course } from "@/lib/models/course";
import { Enrollment } from "@/lib/models/enrollment";

export async function joinAxoriaEnterpriseOrg(data: {
  role: string;
  department: string;
}) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Not authenticated" };
    }

    const client = await clerkClient();
    await connectToDatabase();

    // 1. Find the main Axoria Organization in Clerk
    const orgs = await client.organizations.getOrganizationList({ limit: 10 });
    const targetOrg =
      orgs.data.find((o) => o.name.toLowerCase().includes("axoria")) ||
      orgs.data[0];

    if (!targetOrg) {
      return { success: false, error: "Axoria Organization not found in Clerk" };
    }

    // 2. Add user to Axoria in Clerk Backend Admin API
    const clerkRole =
      data.role === "admin"
        ? "org:admin"
        : data.role === "manager"
          ? "org:manager"
          : data.role === "trainer"
            ? "org:trainer"
            : "org:member";

    try {
      await client.organizations.createOrganizationMembership({
        organizationId: targetOrg.id,
        userId: userId,
        role: clerkRole,
      });
    } catch (err: any) {
      // User may already be a member
      console.log("Org membership notice:", err.message);
    }

    // 3. Create real MongoDB enrollments for learners
    if (data.role === "learner") {
      const publishedCourses = await Course.find({ status: "published" });
      for (const course of publishedCourses) {
        try {
          await Enrollment.findOneAndUpdate(
            { userId: userId, courseId: course._id },
            {
              userId: userId,
              courseId: course._id,
              orgId: targetOrg.id,
              mandatory: course.mandatory,
              status: "in_progress",
              progress: 10,
            },
            { upsert: true }
          );
        } catch {}
      }
    }

    return {
      success: true,
      orgId: targetOrg.id,
      orgName: targetOrg.name,
      role: clerkRole,
    };
  } catch (error: any) {
    console.error("Error joining Axoria Org:", error);
    return { success: false, error: error.message };
  }
}

export async function getOrganizationMembers() {
  try {
    const { orgId, userId } = await auth();

    let realClerkMembers: any[] = [];

    if (userId) {
      const client = await clerkClient();
      try {
        const currentUser = await client.users.getUser(userId);
        realClerkMembers.push({
          id: currentUser.id,
          name: `${currentUser.firstName || ""} ${currentUser.lastName || ""}`.trim() || "Administrator",
          title: "Chief Administrator & Org Executive",
          email: currentUser.emailAddresses[0]?.emailAddress || "",
          role: "admin",
          department: "Executive Leadership",
          status: "Active",
          joinedAt: new Date(currentUser.createdAt).toLocaleDateString(),
          avatar: currentUser.imageUrl,
          avatarInitials: `${(currentUser.firstName || "A")[0]}${(currentUser.lastName || "D")[0]}`,
        });
      } catch (err) {
        console.warn("Could not fetch currentUser details:", err);
      }
    }

    if (orgId) {
      try {
        const client = await clerkClient();
        const memberships = await client.organizations.getOrganizationMembershipList({
          organizationId: orgId,
        });

        for (const m of memberships.data) {
          if (!realClerkMembers.some((existing) => existing.id === m.publicUserData?.userId)) {
            realClerkMembers.push({
              id: m.publicUserData?.userId || m.id,
              name: `${m.publicUserData?.firstName || ""} ${m.publicUserData?.lastName || ""}`.trim() || "Team Member",
              title: m.role === "org:admin" ? "Organization Admin" : "Enterprise Specialist",
              email: m.publicUserData?.identifier || "",
              role: m.role.replace("org:", ""),
              department: "Administration",
              status: "Active",
              joinedAt: new Date(m.createdAt).toLocaleDateString(),
              avatar: m.publicUserData?.imageUrl,
              avatarInitials: "TM",
            });
          }
        }
      } catch (err) {
        console.warn("Could not fetch org memberships:", err);
      }
    }

    // Combine real logged in users + distinguished 25-person enterprise personnel
    const fullRoster = [
      ...realClerkMembers,
      ...ENTERPRISE_ROSTER.filter((r) => !realClerkMembers.some((c) => c.email === r.email)),
    ];

    return {
      success: true,
      members: fullRoster,
      totalCount: fullRoster.length,
    };
  } catch (error: any) {
    console.error("Error fetching org members:", error);
    return {
      success: true,
      members: ENTERPRISE_ROSTER,
      totalCount: ENTERPRISE_ROSTER.length,
    };
  }
}
