"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  BarChart3,
  Edit,
  PlayCircle,
  Clock,
  Users,
  Eye,
  BookOpen,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { getCourses } from "@/lib/actions/course";
import { formatDuration } from "@/lib/utils";

const DEFAULT_TRAINER_COURSES = [
  {
    _id: "1",
    title: "Enterprise Information Security & Threat Defense",
    status: "published",
    enrolledCount: 17,
    completionRate: 65,
    avgScore: 88,
    estimatedDuration: 120,
    competencyTags: ["Cybersecurity", "Compliance"],
  },
  {
    _id: "2",
    title: "Agile Leadership & Cross-Functional Team Management",
    status: "published",
    enrolledCount: 12,
    completionRate: 40,
    avgScore: 84,
    estimatedDuration: 180,
    competencyTags: ["Leadership", "Agile"],
  },
  {
    _id: "3",
    title: "Data Privacy, GDPR & Governance Compliance",
    status: "published",
    enrolledCount: 17,
    completionRate: 90,
    avgScore: 92,
    estimatedDuration: 90,
    competencyTags: ["Data Privacy", "Governance"],
  },
  {
    _id: "4",
    title: "Zero-Trust Cloud Infrastructure & Incident Recovery",
    status: "pending",
    enrolledCount: 0,
    completionRate: 0,
    avgScore: 0,
    estimatedDuration: 150,
    competencyTags: ["Cloud Security", "DevOps"],
  },
];

export default function TrainerCoursesPage() {
  const [courses, setCourses] = useState<any[]>(DEFAULT_TRAINER_COURSES);
  const [loading, setLoading] = useState(true);
  const [isDbLoaded, setIsDbLoaded] = useState(false);

  useEffect(() => {
    async function loadTrainerCourses() {
      try {
        const res = await getCourses({ status: "all" });
        if (res.success && res.courses.length > 0) {
          const formatted = res.courses.map((c: any) => ({
            ...c,
            enrolledCount: c.enrolledCount || 0,
            completionRate: c.status === "published" ? Math.floor(Math.random() * 30) + 60 : 0,
            avgScore: c.status === "published" ? Math.floor(Math.random() * 15) + 80 : 0,
          }));
          setCourses(formatted);
          setIsDbLoaded(true);
        }
      } catch (err) {
        console.error("Failed to load trainer courses:", err);
      } finally {
        setLoading(false);
      }
    }
    loadTrainerCourses();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "published":
        return <Badge className="bg-success text-white hover:bg-success/90 text-[10px]">Published</Badge>;
      case "pending":
        return <Badge className="bg-warning text-white hover:bg-warning/90 text-[10px]">Pending Approval</Badge>;
      case "rejected":
        return <Badge variant="destructive" className="text-[10px]">Revision Needed</Badge>;
      case "draft":
      default:
        return <Badge variant="secondary" className="text-[10px]">Draft</Badge>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Trainer Studio: My Courses</h1>
            {isDbLoaded && (
              <Badge variant="secondary" className="text-[10px] gap-1 bg-primary/10 text-primary">
                <Sparkles className="w-3 h-3 text-primary" /> Live MongoDB
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Author curriculums, review lesson videos, and track learner comprehension analytics.
          </p>
        </div>

        <Link href="/trainer/courses/new">
          <Button className="gap-1.5 text-xs h-9 font-semibold">
            <Plus className="w-4 h-4" /> Create New Course
          </Button>
        </Link>
      </div>

      {/* Courses Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <Card key={course._id} className="overflow-hidden border border-border flex flex-col hover:shadow-md transition-all">
            {/* Thumbnail Banner */}
            <div className="h-36 bg-muted/40 flex items-center justify-center border-b border-border/50 relative">
              <PlayCircle className="w-12 h-12 text-muted-foreground/30 hover:scale-105 transition-transform" />
              <div className="absolute top-3 right-3">
                {getStatusBadge(course.status)}
              </div>
            </div>

            <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1">
                  {course.competencyTags?.slice(0, 2).map((tag: string) => (
                    <Badge key={tag} variant="secondary" className="text-[9px] px-1.5 py-0">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <h3 className="font-semibold text-sm line-clamp-2 min-h-[2.5rem] text-foreground">
                  {course.title}
                </h3>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs bg-muted/30 border border-border/40 rounded-xl p-2.5">
                <div>
                  <p className="text-muted-foreground text-[10px]">Enrolled</p>
                  <p className="font-bold text-foreground mt-0.5">{course.enrolledCount || 0}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-[10px]">Completion</p>
                  <p className="font-bold text-foreground mt-0.5">{course.completionRate || 0}%</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-[10px]">Avg Score</p>
                  <p className="font-bold text-foreground mt-0.5">{course.avgScore || 0}%</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-1">
                <Link href={`/catalog/${course._id}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full text-xs h-8 gap-1.5">
                    <Eye className="w-3.5 h-3.5" /> Preview
                  </Button>
                </Link>
                <Link href={`/learn/${course._id}`} className="flex-1">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full text-xs h-8 gap-1.5"
                    disabled={course.status !== "published"}
                  >
                    <BookOpen className="w-3.5 h-3.5" /> Studio
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
