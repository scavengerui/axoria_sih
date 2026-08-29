"use client";

import Link from "next/link";
import {
  BookOpen,
  Clock,
  ArrowRight,
  GraduationCap,
  AlertCircle,
  Check,
  CheckCircle2,
  Award,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const IN_PROGRESS_COURSES = [
  {
    id: "1",
    title: "Enterprise Information Security & Threat Defense",
    instructor: "Dr. Raghavan Sundaram (CISO)",
    progress: 60,
    dueDate: "2025-09-30",
    isMandatory: true,
  },
  {
    id: "2",
    title: "Agile Leadership & Cross-Functional Team Management",
    instructor: "Prof. Sunita Deshmukh",
    progress: 25,
    dueDate: null,
    isMandatory: false,
  },
];

const COMPLETED_COURSES = [
  {
    id: "3",
    title: "Data Privacy, GDPR & Governance Compliance",
    instructor: "Dr. Ananya Sengupta",
    progress: 100,
    completedDate: "Aug 20, 2025",
    certificate: true,
  },
];

const OVERDUE_COURSES: any[] = [];

export default function MyLearningPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Learning Journey</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Track your assigned compliance training, in-progress modules, and earned credentials.
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="in-progress" className="space-y-4">
        <TabsList className="grid w-full sm:w-[400px] grid-cols-3">
          <TabsTrigger value="in-progress" className="text-xs">
            In Progress ({IN_PROGRESS_COURSES.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="text-xs">
            Completed ({COMPLETED_COURSES.length})
          </TabsTrigger>
          <TabsTrigger value="overdue" className="text-xs">
            Overdue ({OVERDUE_COURSES.length})
          </TabsTrigger>
        </TabsList>

        {/* IN PROGRESS */}
        <TabsContent value="in-progress" className="space-y-3">
          {IN_PROGRESS_COURSES.map((course) => (
            <Card
              key={course.id}
              className="border-border hover:shadow-md transition-all"
            >
              <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {course.isMandatory && (
                      <Badge variant="destructive" className="text-[10px]">
                        Mandatory
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      Instructor: <strong className="text-foreground">{course.instructor}</strong>
                    </span>
                  </div>

                  <h3 className="font-semibold text-sm sm:text-base text-foreground truncate">
                    {course.title}
                  </h3>

                  <div className="flex items-center gap-3 pt-1">
                    <Progress value={course.progress} className="h-1.5 flex-1 max-w-xs" />
                    <span className="text-xs font-semibold text-foreground">
                      {course.progress}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {course.dueDate && (
                    <div className="text-right hidden md:block">
                      <p className="text-[10px] text-muted-foreground">Due Date</p>
                      <p className="text-xs font-medium text-foreground">{course.dueDate}</p>
                    </div>
                  )}
                  <Link href={`/learn/${course.id}`}>
                    <Button size="sm" className="gap-1.5 text-xs h-9">
                      Continue Learning <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* COMPLETED */}
        <TabsContent value="completed" className="space-y-3">
          {COMPLETED_COURSES.map((course) => (
            <Card key={course.id} className="border-border">
              <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-success/15 text-success border-success/30 text-[10px]">
                      Completed
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Completed on {course.completedDate}
                    </span>
                  </div>

                  <h3 className="font-semibold text-sm sm:text-base text-foreground truncate">
                    {course.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Instructor: {course.instructor}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link href="/certificates">
                    <Button variant="outline" size="sm" className="gap-1.5 text-xs h-9">
                      <Award className="h-3.5 w-3.5 text-primary" /> View Certificate
                    </Button>
                  </Link>
                  <Link href={`/learn/${course.id}`}>
                    <Button variant="ghost" size="sm" className="gap-1.5 text-xs h-9">
                      Review Content
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* OVERDUE */}
        <TabsContent value="overdue">
          <div className="py-12 text-center border rounded-2xl border-dashed bg-muted/10 space-y-2">
            <CheckCircle2 className="h-9 w-9 text-success mx-auto" />
            <h3 className="text-sm font-semibold">No Overdue Trainings!</h3>
            <p className="text-xs text-muted-foreground">
              You are completely up to date with your organizational compliance requirements.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
