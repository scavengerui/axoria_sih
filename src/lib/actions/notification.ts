"use server";

import connectToDatabase from "@/lib/db";
import { Notification } from "@/lib/models/notification";
import { revalidatePath } from "next/cache";

export async function createNotification(data: {
  userId: string;
  orgId?: string;
  type: "assignment" | "deadline" | "course_update" | "certificate" | "approval" | "general";
  title: string;
  message: string;
  link?: string;
}) {
  try {
    await connectToDatabase();
    const notif = await Notification.create({
      userId: data.userId,
      orgId: data.orgId || "default",
      type: data.type,
      title: data.title,
      message: data.message,
      link: data.link || "/dashboard",
      read: false,
    });
    revalidatePath("/dashboard");
    return { success: true, notification: JSON.parse(JSON.stringify(notif)) };
  } catch (error: any) {
    console.error("Error creating notification:", error);
    return { success: false, error: error.message };
  }
}

export async function getUserNotifications(userId: string) {
  try {
    await connectToDatabase();
    const notifications = await Notification.find({
      $or: [{ userId }, { userId: "all_admins" }],
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    const unreadCount = notifications.filter((n: any) => !n.read).length;

    return {
      success: true,
      notifications: JSON.parse(JSON.stringify(notifications)),
      unreadCount,
    };
  } catch (error: any) {
    console.error("Error fetching notifications:", error);
    return { success: false, notifications: [], unreadCount: 0 };
  }
}

export async function markNotificationAsRead(notificationId: string) {
  try {
    await connectToDatabase();
    await Notification.findByIdAndUpdate(notificationId, { read: true });
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    console.error("Error marking notification as read:", error);
    return { success: false, error: error.message };
  }
}

export async function markAllNotificationsAsRead(userId: string) {
  try {
    await connectToDatabase();
    await Notification.updateMany(
      { $or: [{ userId }, { userId: "all_admins" }], read: false },
      { read: true }
    );
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    console.error("Error marking all read:", error);
    return { success: false, error: error.message };
  }
}
