"use client";

import { useEffect, useState } from "react";
import { useUser, useOrganization } from "@clerk/nextjs";
import {
  BookOpen,
  GraduationCap,
  Award,
  Clock,
  Users,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  PlusCircle,
  BarChart3,
  ShieldCheck,
  Zap,
  Sparkles,
  Play,
  Layers,
  CheckCircle2,
  ExternalLink,
  Flame,
  Star,
  Compass,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { getAdminAnalytics } from "@/lib/actions/analytics";
import { resolveUserRole } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ElementType;
  trend?: string;
}

function StatCard({ title, value, description, icon: Icon, trend }: StatCardProps) {
  return (
    <Card className="border-border">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
            <p className="text-2xl font-bold mt-1 text-foreground">{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
            )}
            {trend && (
              <p className="text-xs text-success flex items-center gap-1 mt-1 font-medium">
                <TrendingUp className="h-3 w-3" />
                {trend}
              </p>
            )}
          </div>
          <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
            <Icon className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const COMPETENCY_RADAR_DATA = [
  { subject: "Cybersecurity", current: 88, target: 95, fullMark: 100 },
  { subject: "Cloud Native", current: 76, target: 90, fullMark: 100 },
  { subject: "System Design", current: 92, target: 85, fullMark: 100 },
  { subject: "Generative AI", current: 84, target: 90, fullMark: 100 },
  { subject: "Data Privacy", current: 72, target: 85, fullMark: 100 },
  { subject: "DevSecOps", current: 80, target: 90, fullMark: 100 },
];

const FEATURED_TRACKS = [
  {
    id: "1",
    title: "Enterprise Information Security & Threat Defense",
    category: "Cybersecurity",
    duration: "2h 00m",
    rating: 4.9,
    gradient: "from-blue-600/90 via-indigo-900 to-slate-900",
    progress: 100,
    status: "Completed",
    icon: "🛡️",
  },
  {
    id: "4",
    title: "Docker Containerization & Zero-Trust Security",
    category: "DevOps & Containers",
    duration: "2h 15m",
    rating: 4.9,
    gradient: "from-cyan-600/90 via-blue-900 to-slate-900",
    progress: 35,
    status: "In Progress",
    icon: "🐳",
  },
  {
    id: "7",
    title: "Generative AI & LLM Prompt Engineering for Enterprise",
    category: "Artificial Intelligence",
    duration: "2h 00m",
    rating: 5.0,
    gradient: "from-violet-600/90 via-purple-900 to-slate-900",
    progress: 0,
    status: "Enrolled",
    icon: "🤖",
  },
];

const RECENT_VERIFIED_LEDGER = [
  {
    id: "AX-SEC-92847",
    user: "Siva Dhanush",
    course: "Enterprise Information Security & Threat Defense",
    date: "August 30, 2026",
    score: "100%",
    status: "Verified On Ledger",
  },
  {
    id: "AX-PRV-48192",
    user: "Elena Rostova",
    course: "Data Privacy, GDPR & Governance Compliance",
    date: "August 29, 2026",
    score: "92%",
    status: "Verified On Ledger",
  },
  {
    id: "AX-K8S-77219",
    user: "Alex Rivers",
    course: "Kubernetes Orchestration & Production Deployment",
    date: "August 29, 2026",
    score: "95%",
    status: "Verified On Ledger",
  },
];

export default function DashboardPage() {
  const { user } = useUser();
  const { membership, organization } = useOrganization();

  const userEmail = user?.primaryEmailAddress?.emailAddress;
  const userRole = resolveUserRole(userEmail, membership?.role);
  const userName = user?.firstName ?? "User";

  const [stats, setStats] = useState({
    totalUsers: 1,
    activeCourses: 22,
    pendingCourses: 0,
    completionRate: 85,
  });

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await getAdminAnalytics();
        if (res.success && res.stats) {
          setStats({
            totalUsers: res.stats.totalUsers || 1,
            activeCourses: res.stats.activeCourses || 22,
            pendingCourses: res.stats.pendingCourses || 0,
            completionRate: res.stats.completionRate || 85,
          });
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Welcome back, {userName}
            </h1>
            {organization && (
              <Badge variant="secondary" className="text-xs">
                {organization.name}
              </Badge>
            )}
            <Badge variant="outline" className="text-xs bg-orange-500/10 text-orange-600 border-orange-500/20 font-bold">
              🔥 4-Day Streak
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            {userRole === "org:admin"
              ? "Here's an overview of your organization's learning, compliance health, and live competency matrix."
              : userRole === "org:manager"
                ? "Track your team's training progress and manage competency assignments."
                : userRole === "org:trainer"
                  ? "Manage your courses, curriculums, and learner assessments."
                  : "Continue your learning journey, inspect your competency radar, and view certified achievements."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/skill-check">
            <Button variant="outline" size="sm" className="text-xs h-9 gap-1.5 font-semibold text-primary hover:bg-primary/5">
              <Zap className="w-4 h-4" /> Skill Check Arena
            </Button>
          </Link>
          <Link href="/catalog">
            <Button size="sm" className="text-xs h-9 gap-1.5 font-semibold">
              <BookOpen className="w-4 h-4" /> Browse 22 Courses
            </Button>
          </Link>
        </div>
      </div>

      {/* Top Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          description="Active in Organization"
        />
        <StatCard
          title="Active Courses"
          value={stats.activeCourses}
          icon={BookOpen}
          description="22 Live Tracks"
        />
        <StatCard
          title="Org Completion"
          value={`${stats.completionRate}%`}
          icon={BarChart3}
          trend="Compliance on track"
        />
        <StatCard
          title="Verifiable Certs"
          value={2}
          icon={Award}
          description="SHA-256 Ledger Verified"
        />
      </div>

      {/* INTERACTIVE 2-COLUMN SECTION: RADAR MATRIX & FEATURED VISUAL TRACKS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Competency Radar Spider Graph (7 Cols) */}
        <Card className="lg:col-span-7 border-border shadow-xs overflow-hidden flex flex-col justify-between">
          <CardHeader className="pb-2 border-b border-border/70 bg-muted/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <CardTitle className="text-sm font-bold">Organizational Competency Radar</CardTitle>
                  <CardDescription className="text-xs">Current Team Mastery vs Enterprise Target (6 Pillars)</CardDescription>
                </div>
              </div>
              <Badge variant="outline" className="text-[10px] bg-background font-mono">
                Live AI Benchmark
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-4 flex-1 flex flex-col justify-center items-center">
            <div className="w-full h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={COMPETENCY_RADAR_DATA}>
                  <PolarGrid stroke="var(--border)" strokeDasharray="3 3" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fill: "var(--foreground)", fontSize: 11, fontWeight: 600 }}
                  />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="var(--muted-foreground)" tick={{ fontSize: 9 }} />
                  <Radar
                    name="Current Mastery"
                    dataKey="current"
                    stroke="#2563eb"
                    fill="#3b82f6"
                    fillOpacity={0.45}
                  />
                  <Radar
                    name="Target Benchmark"
                    dataKey="target"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.15}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--background)",
                      borderColor: "var(--border)",
                      borderRadius: "12px",
                      fontSize: "12px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 w-full pt-3 border-t border-border/60 text-xs">
              <div className="flex items-center gap-4 text-[11px]">
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Current Capacity
                </span>
                <span className="flex items-center gap-1.5 font-medium text-muted-foreground">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Target Benchmark
                </span>
              </div>

              <Link href="/catalog">
                <Button size="sm" variant="ghost" className="text-xs h-7 gap-1 text-primary hover:bg-primary/5">
                  <Zap className="w-3.5 h-3.5" /> Auto-Bridge Skill Gaps
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Visual Training Pathways & Artwork Cards (5 Cols) */}
        <div className="lg:col-span-5 space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-primary" /> Active Learning Pathways
            </h3>
            <Link href="/my-learning" className="text-[11px] text-primary hover:underline font-medium">
              View All
            </Link>
          </div>

          <div className="space-y-3 flex-1 flex flex-col justify-between">
            {FEATURED_TRACKS.map((track) => (
              <Card
                key={track.id}
                className="border border-border shadow-xs overflow-hidden group hover:border-primary/50 transition-all"
              >
                {/* Visual Gradient Header */}
                <div className={`p-3.5 bg-gradient-to-r ${track.gradient} text-white flex items-center justify-between`}>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{track.icon}</span>
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">{track.category}</span>
                      <p className="font-bold text-xs leading-tight line-clamp-1">{track.title}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px] text-white border-white/20 bg-white/10 shrink-0">
                    ⭐ {track.rating}
                  </Badge>
                </div>

                <div className="p-3 bg-card flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground text-[11px] flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {track.duration}
                    </span>
                    <Badge
                      variant="secondary"
                      className={`text-[10px] ${
                        track.status === "Completed"
                          ? "bg-success/15 text-success"
                          : "bg-primary/10 text-primary"
                      }`}
                    >
                      {track.status} ({track.progress}%)
                    </Badge>
                  </div>

                  <Link href={`/learn/${track.id}`}>
                    <Button size="sm" className="text-xs h-7 gap-1 font-semibold">
                      <Play className="w-3 h-3 fill-current" /> {track.status === "Completed" ? "Review" : "Launch"}
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* LIVE VERIFIED CERTIFICATE LEDGER STREAM */}
      <Card className="border-border shadow-xs overflow-hidden">
        <CardHeader className="pb-3 border-b border-border/70 bg-muted/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-emerald-500/15 rounded-lg text-emerald-600">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold">Live Verified Certificate Ledger</CardTitle>
                <CardDescription className="text-xs">Real-time immutable credentials issued on Axoria Enterprise Ledger</CardDescription>
              </div>
            </div>
            <Link href="/certificates">
              <Button variant="outline" size="sm" className="text-xs h-8 gap-1.5">
                <Award className="w-3.5 h-3.5" /> My Certificates
              </Button>
            </Link>
          </div>
        </CardHeader>

        <CardContent className="p-0 divide-y divide-border/60">
          {RECENT_VERIFIED_LEDGER.map((cert) => (
            <div
              key={cert.id}
              className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-success/15 text-success flex items-center justify-center font-bold text-sm shrink-0 border border-success/30">
                  <Award className="w-5 h-5" />
                </div>

                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-xs sm:text-sm text-foreground">{cert.user}</p>
                    <Badge variant="outline" className="text-[10px] font-mono py-0">
                      ID: {cert.id}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{cert.course}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                <div className="text-right hidden sm:block text-xs">
                  <p className="font-semibold text-success flex items-center gap-1 justify-end">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Exam Score: {cert.score}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{cert.date}</p>
                </div>

                <Link href={`/verify/${cert.id}`}>
                  <Button size="sm" variant="outline" className="text-xs h-8 gap-1 font-semibold text-primary hover:bg-primary/5">
                    <ExternalLink className="w-3 h-3" /> Verify Credential
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
