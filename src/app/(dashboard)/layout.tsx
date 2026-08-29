"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useOrganization, UserButton, OrganizationSwitcher, useUser } from "@clerk/nextjs";
import { AskAssistant } from "@/components/ai/AskAssistant";
import { NotificationDropdown } from "@/components/layout/NotificationDropdown";
import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  Award,
  Users,
  BarChart3,
  ClipboardList,
  PlusCircle,
  Settings,
  Menu,
  Search,
  ChevronLeft,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, resolveUserRole } from "@/lib/utils";
import { useState } from "react";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
}

// Navigation lists per role
const commonNavItems: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Course Catalog", href: "/catalog", icon: BookOpen },
  { title: "Synapse", href: "/synapse", icon: Sparkles },
];

const learnerNavItems: NavItem[] = [
  { title: "My Learning", href: "/my-learning", icon: GraduationCap },
  { title: "Certificates", href: "/certificates", icon: Award },
];

const trainerNavItems: NavItem[] = [
  { title: "My Courses", href: "/trainer/courses", icon: ClipboardList },
  { title: "Create Course", href: "/trainer/courses/new", icon: PlusCircle },
];

const managerNavItems: NavItem[] = [
  { title: "Team", href: "/manager/team", icon: Users },
  { title: "Assign Training", href: "/manager/assign", icon: ClipboardList },
];

const adminNavItems: NavItem[] = [
  { title: "User Management", href: "/admin/users", icon: Users },
  { title: "Course Approval", href: "/admin/courses", icon: ClipboardList },
  { title: "Analytics", href: "/admin/analytics", icon: BarChart3 },
];

function NavLink({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const pathname = usePathname();
  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
        isActive
          ? "bg-primary text-primary-foreground font-medium"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        collapsed && "justify-center px-2"
      )}
      title={collapsed ? item.title : undefined}
    >
      <item.icon className="h-4 w-4 shrink-0" />
      {!collapsed && <span>{item.title}</span>}
    </Link>
  );
}

function NavSection({
  title,
  items,
  collapsed,
}: {
  title: string;
  items: NavItem[];
  collapsed: boolean;
}) {
  if (items.length === 0) return null;

  return (
    <div className="space-y-1">
      {!collapsed && (
        <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {title}
        </p>
      )}
      <div className="space-y-0.5">
        {items.map((item) => (
          <NavLink key={item.href} item={item} collapsed={collapsed} />
        ))}
      </div>
    </div>
  );
}

function SidebarContent({
  collapsed,
  userRole,
  isLoaded,
}: {
  collapsed: boolean;
  userRole: string;
  isLoaded: boolean;
}) {
  return (
    <div className="flex h-full flex-col justify-between">
      {/* Brand */}
      <div>
        <div
          className={cn(
            "flex h-14 items-center border-b border-border px-4",
            collapsed ? "justify-center" : "gap-3"
          )}
        >
          <img src="/axoria-logo.svg" alt="Axoria" className="h-7 w-7 shrink-0" />
          {!collapsed && (
            <span className="font-bold tracking-wider text-base">AXORIA</span>
          )}
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3 py-4">
          <div className="space-y-6">
            <NavSection
              title="Overview"
              items={commonNavItems}
              collapsed={collapsed}
            />

            {!isLoaded ? (
              <div className="space-y-2 px-3 pt-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-full rounded-lg" />
                <Skeleton className="h-8 w-full rounded-lg" />
              </div>
            ) : (
              <>
                {/* Learner Nav */}
                {userRole === "org:member" && (
                  <NavSection
                    title="My Progress"
                    items={learnerNavItems}
                    collapsed={collapsed}
                  />
                )}

                {/* Trainer Nav */}
                {(userRole === "org:trainer" || userRole === "org:admin") && (
                  <NavSection
                    title="Trainer Studio"
                    items={trainerNavItems}
                    collapsed={collapsed}
                  />
                )}

                {/* Manager Nav */}
                {(userRole === "org:manager" || userRole === "org:admin") && (
                  <NavSection
                    title="Management"
                    items={managerNavItems}
                    collapsed={collapsed}
                  />
                )}

                {/* Admin Nav */}
                {userRole === "org:admin" && (
                  <NavSection
                    title="Administration"
                    items={adminNavItems}
                    collapsed={collapsed}
                  />
                )}
              </>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Footer / Settings */}
      <div className="px-3 py-3">
        <NavLink
          item={{ title: "Settings", href: "/settings", icon: Settings }}
          collapsed={collapsed}
        />
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoaded: isUserLoaded } = useUser();
  const { membership, isLoaded: isOrgLoaded } = useOrganization();
  const [collapsed, setCollapsed] = useState(false);

  const isLoaded = isUserLoaded && isOrgLoaded;
  const userEmail = user?.primaryEmailAddress?.emailAddress;
  const userRole = resolveUserRole(userEmail, membership?.role);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col border-r border-border bg-sidebar transition-all duration-300",
          collapsed ? "w-16" : "w-64"
        )}
      >
        <SidebarContent collapsed={collapsed} userRole={userRole} isLoaded={isLoaded} />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex items-center justify-center p-2 mb-2 mx-3 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeft
            className={cn(
              "h-4 w-4 transition-transform duration-300",
              collapsed && "rotate-180"
            )}
          />
        </button>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex h-14 items-center gap-4 border-b border-border bg-background px-4 md:px-6">
          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              }
            />
            <SheetContent side="left" className="w-64 p-0">
              <SidebarContent collapsed={false} userRole={userRole} isLoaded={isLoaded} />
            </SheetContent>
          </Sheet>

          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search courses, lessons..."
                className="pl-9 bg-muted/50 border-0 focus-visible:ring-1 text-xs"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Native Clerk Organization Switcher */}
            <OrganizationSwitcher
              hidePersonal={false}
              appearance={{
                elements: {
                  rootBox: "flex items-center",
                  organizationSwitcherTrigger: "h-8 px-2.5 rounded-lg border border-border text-xs font-medium hover:bg-accent",
                },
              }}
            />

            {/* Notifications */}
            <NotificationDropdown />

            <Separator orientation="vertical" className="h-6" />

            {/* User button (Clerk) */}
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "h-8 w-8",
                },
              }}
            />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="p-4 md:p-6 lg:p-8">{children}</div>
        </main>
      </div>

      {/* AI Assistant floating chat */}
      <AskAssistant />
    </div>
  );
}
