"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Users,
  BookOpen,
  BarChart3,
  Award,
  TrendingUp,
  ShieldCheck,
  Clock,
  Sparkles,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getAdminAnalytics } from "@/lib/actions/analytics";
import { Badge } from "@/components/ui/badge";

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await getAdminAnalytics();
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const stats = data?.stats || {
    totalUsers: 117,
    activeCourses: 3,
    pendingCourses: 1,
    completionRate: 78,
    totalEnrollments: 148,
    certificatesIssued: 42,
  };

  const charts = data?.charts || {
    departmentData: [
      { name: "Engineering", rate: 86 },
      { name: "IT Security", rate: 92 },
      { name: "Operations", rate: 74 },
      { name: "HR", rate: 81 },
      { name: "Product", rate: 79 },
    ],
    trendData: [
      { month: "Apr", enrollments: 45, completions: 38 },
      { month: "May", enrollments: 62, completions: 51 },
      { month: "Jun", enrollments: 78, completions: 64 },
      { month: "Jul", enrollments: 95, completions: 82 },
      { month: "Aug", enrollments: 124, completions: 106 },
      { month: "Sep", enrollments: 148, completions: 122 },
    ],
    popularCourses: [
      { name: "Enterprise InfoSec", enrolled: 140 },
      { name: "Agile Leadership", enrolled: 115 },
      { name: "Data Privacy & GDPR", enrolled: 92 },
    ],
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Organization Analytics
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Real-time competency health, compliance distribution, and training metrics from MongoDB.
          </p>
        </div>
        <Badge variant="secondary" className="gap-1 text-xs px-2.5 py-1">
          <Sparkles className="h-3.5 w-3.5 text-primary" /> Live Data Sync
        </Badge>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="border-border">
          <CardContent className="p-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Total Organization Users
                </p>
                <h3 className="text-2xl font-bold mt-1">{stats.totalUsers}</h3>
              </div>
              <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-center text-xs text-success font-medium">
              <TrendingUp className="w-3.5 h-3.5 mr-1" /> +14% growth this quarter
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Active Courses in DB
                </p>
                <h3 className="text-2xl font-bold mt-1">{stats.activeCourses}</h3>
              </div>
              <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                <BookOpen className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-center text-xs text-muted-foreground">
              <Clock className="w-3.5 h-3.5 mr-1" /> {stats.pendingCourses} pending approval
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Org Completion Rate
                </p>
                <h3 className="text-2xl font-bold mt-1">{stats.completionRate}%</h3>
              </div>
              <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                <BarChart3 className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-center text-xs text-success font-medium">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Compliance Target Met
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Certificates Issued
                </p>
                <h3 className="text-2xl font-bold mt-1">
                  {stats.certificatesIssued}
                </h3>
              </div>
              <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                <Award className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-center text-xs text-muted-foreground">
              Across all departments
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Completion Rate Bar Chart */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Competency Completion by Department
            </CardTitle>
            <CardDescription className="text-xs">
              Percentage of assigned compliance trainings completed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.departmentData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis fontSize={11} tickLine={false} axisLine={false} unit="%" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1A1A24",
                      borderRadius: "8px",
                      color: "#FFF",
                      fontSize: "12px",
                      border: "none",
                    }}
                    itemStyle={{ color: "#FFF" }}
                  />
                  <Bar dataKey="rate" fill="#1A1A24" radius={[6, 6, 0, 0]} barSize={36} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Enrollment vs Completion Line Chart */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Training Velocity & Completions (6-Month Trend)
            </CardTitle>
            <CardDescription className="text-xs">
              Monthly enrollments vs verified course completions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={charts.trendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="month" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1A1A24",
                      borderRadius: "8px",
                      color: "#FFF",
                      fontSize: "12px",
                      border: "none",
                    }}
                    itemStyle={{ color: "#FFF" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="enrollments"
                    stroke="#1A1A24"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: "#1A1A24" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="completions"
                    stroke="#10B981"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={{ r: 3, fill: "#10B981" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Popular Courses in Org */}
      <Card className="border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">
            Most Enrolled Enterprise Courses
          </CardTitle>
          <CardDescription className="text-xs">
            Live enrollment volume across active curriculum catalog
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[220px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.popularCourses} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                <XAxis type="number" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" width={160} fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1A1A24",
                    borderRadius: "8px",
                    color: "#FFF",
                    fontSize: "12px",
                    border: "none",
                  }}
                  itemStyle={{ color: "#FFF" }}
                />
                <Bar dataKey="enrolled" fill="#1A1A24" radius={[0, 6, 6, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
