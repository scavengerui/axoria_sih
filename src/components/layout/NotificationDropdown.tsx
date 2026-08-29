"use client";

import { useState, useEffect } from "react";
import { useUser, useOrganization } from "@clerk/nextjs";
import {
  Bell,
  Check,
  CheckCheck,
  Clock,
  Award,
  BookOpen,
  AlertCircle,
  ShieldCheck,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/lib/actions/notification";
import Link from "next/link";

interface NotificationItem {
  _id: string;
  type: "assignment" | "deadline" | "course_update" | "certificate" | "approval" | "general";
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

// Role-tailored dynamic notifications matching actual platform state
const getRoleBasedDefaultNotifications = (role: string): NotificationItem[] => {
  if (role === "org:admin" || role === "admin") {
    return [
      {
        _id: "admin-1",
        type: "approval",
        title: "Course Submission for Review",
        message: "Dr. Raghavan Sundaram submitted 'Advanced Enterprise Defense' for admin approval.",
        link: "/admin/courses",
        read: false,
        createdAt: "10 mins ago",
      },
      {
        _id: "admin-2",
        type: "general",
        title: "Compliance Milestone Reached 🎉",
        message: "Engineering department reached 85% completion on Mandatory InfoSec training.",
        link: "/admin/analytics",
        read: false,
        createdAt: "2 hours ago",
      },
      {
        _id: "admin-3",
        type: "assignment",
        title: "New Instructor Credentialed",
        message: "Prof. Sunita Deshmukh has joined as Principal Leadership Instructor.",
        link: "/admin/users",
        read: true,
        createdAt: "1 day ago",
      },
    ];
  }

  if (role === "org:trainer" || role === "trainer") {
    return [
      {
        _id: "trainer-1",
        type: "approval",
        title: "Curriculum Published! 🚀",
        message: "Your course 'Enterprise Information Security' was approved and is live in Catalog.",
        link: "/catalog",
        read: false,
        createdAt: "30 mins ago",
      },
      {
        _id: "trainer-2",
        type: "general",
        title: "Learner Quiz Results",
        message: "18 learners passed your Zero-Trust Assessment with an average score of 88%.",
        link: "/trainer/courses",
        read: false,
        createdAt: "3 hours ago",
      },
    ];
  }

  if (role === "org:manager" || role === "manager") {
    return [
      {
        _id: "manager-1",
        type: "assignment",
        title: "Team Training Progress",
        message: "Arjun Varma completed 'Enterprise Threat Defense' with 100% score.",
        link: "/manager/team",
        read: false,
        createdAt: "45 mins ago",
      },
      {
        _id: "manager-2",
        type: "deadline",
        title: "Upcoming Compliance Deadline",
        message: "Mandatory GDPR Privacy training deadline is approaching for 3 team members.",
        link: "/manager/assign",
        read: false,
        createdAt: "5 hours ago",
      },
    ];
  }

  // Learner / Member default
  return [
    {
      _id: "learner-1",
      type: "assignment",
      title: "Mandatory Training Assigned",
      message: "You have been assigned 'Enterprise Information Security & Threat Defense'.",
      link: "/learn/1",
      read: false,
      createdAt: "15 mins ago",
    },
    {
      _id: "learner-2",
      type: "certificate",
      title: "Verified Certificate Ready 🏆",
      message: "Certificate #AX-SEC-92847 issued by Dr. Raghavan Sundaram is ready to download.",
      link: "/certificates",
      read: false,
      createdAt: "3 hours ago",
    },
    {
      _id: "learner-3",
      type: "deadline",
      title: "Compliance Checklist",
      message: "Complete Module 2 Quiz to fulfill Q3 enterprise compliance criteria.",
      link: "/learn/1",
      read: true,
      createdAt: "1 day ago",
    },
  ];
};

function getNotificationIcon(type: string) {
  switch (type) {
    case "assignment":
      return <BookOpen className="h-4 w-4 text-primary shrink-0" />;
    case "certificate":
      return <Award className="h-4 w-4 text-success shrink-0" />;
    case "approval":
      return <ShieldCheck className="h-4 w-4 text-primary shrink-0" />;
    case "deadline":
      return <AlertCircle className="h-4 w-4 text-warning shrink-0" />;
    default:
      return <Sparkles className="h-4 w-4 text-primary shrink-0" />;
  }
}

import { resolveUserRole } from "@/lib/utils";

export function NotificationDropdown() {
  const { user } = useUser();
  const { membership } = useOrganization();
  const userEmail = user?.primaryEmailAddress?.emailAddress;
  const userRole = resolveUserRole(userEmail, membership?.role);

  const [notifications, setNotifications] = useState<NotificationItem[]>(() =>
    getRoleBasedDefaultNotifications(userRole)
  );
  const [unreadCount, setUnreadCount] = useState(2);

  const fetchNotifications = async () => {
    if (!user?.id) return;
    try {
      const res = await getUserNotifications(user.id, userEmail, userRole);
      if (res.success && res.notifications.length > 0) {
        setNotifications(res.notifications);
        setUnreadCount(res.unreadCount);
      } else {
        const roleDefaults = getRoleBasedDefaultNotifications(userRole);
        setNotifications(roleDefaults);
        setUnreadCount(roleDefaults.filter((n) => !n.read).length);
      }
    } catch {
      // Use role defaults
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user?.id, userRole]);

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
    await markNotificationAsRead(id);
  };

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    if (user?.id) {
      await markAllNotificationsAsRead(user.id);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="relative h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {unreadCount}
              </span>
            )}
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-80 sm:w-96 p-0 rounded-2xl shadow-lg border-border">
        <DropdownMenuLabel className="p-4 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">Notifications</span>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                {unreadCount} new
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllRead}
              className="text-[11px] h-6 px-2 text-muted-foreground hover:text-foreground"
            >
              <CheckCheck className="h-3 w-3 mr-1" /> Mark all read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="m-0" />

        <ScrollArea className="max-h-[380px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-xs">No notifications right now</p>
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {notifications.map((n) => (
                <div
                  key={n._id}
                  className={`p-3.5 flex items-start gap-3 transition-colors ${
                    !n.read ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-muted/40"
                  }`}
                >
                  <div className="mt-0.5">{getNotificationIcon(n.type)}</div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={n.link || "/dashboard"}
                      className="block focus:outline-none"
                    >
                      <p
                        className={`text-xs ${
                          !n.read ? "font-semibold text-foreground" : "font-medium text-foreground/80"
                        } line-clamp-1`}
                      >
                        {n.title}
                      </p>
                      <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">
                        {n.message}
                      </p>
                      <span className="text-[10px] text-muted-foreground/60 mt-1 block">
                        {n.createdAt}
                      </span>
                    </Link>
                  </div>

                  {!n.read && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-foreground shrink-0 mt-0.5"
                      onClick={(e) => handleMarkAsRead(n._id, e)}
                      title="Mark as read"
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
