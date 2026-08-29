"use client";

import { use } from "react";
import Link from "next/link";
import { useOrganization } from "@clerk/nextjs";
import {
  ArrowLeft,
  Clock,
  Users,
  Star,
  BookOpen,
  Video,
  FileText,
  Award,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { getCourseDetailById } from "@/lib/data/courseCatalogData";

function getLessonIcon(type: string) {
  switch (type) {
    case "video":
      return <Video className="h-4 w-4 text-primary" />;
    case "pdf":
      return <FileText className="h-4 w-4 text-warning" />;
    case "article":
    default:
      return <BookOpen className="h-4 w-4 text-foreground" />;
  }
}

export default function CourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const resolvedParams = use(params);
  const courseId = resolvedParams.courseId || "1";
  const course = getCourseDetailById(courseId);

  const { membership } = useOrganization();
  const role = membership?.role ?? "org:admin";
  const isLearner = role === "org:member";

  const totalLessons = course.modules.reduce(
    (acc, m) => acc + m.lessons.length,
    0
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      {/* Back button */}
      <Link
        href="/catalog"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Catalog
      </Link>

      {/* Course Header */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content (Left 2/3) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              {course.isMandatory && (
                <Badge variant="destructive" className="text-xs">
                  Mandatory Training
                </Badge>
              )}
              {course.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {course.title}
            </h1>

            <p className="text-sm text-muted-foreground leading-relaxed">
              {course.description}
            </p>
          </div>

          {/* Instructor & Stats */}
          <div className="flex flex-wrap items-center gap-6 py-3 border-y border-border text-xs text-muted-foreground">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                {course.instructor.avatar}
              </div>
              <div>
                <p className="font-semibold text-foreground">{course.instructor.name}</p>
                <p className="text-[11px] text-muted-foreground">{course.instructor.role}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 ml-auto">
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {course.stats.duration}
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {course.stats.enrolled || 1} Enrolled
              </span>
              <span className="flex items-center gap-1 font-medium text-foreground">
                <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                {course.stats.rating}
              </span>
            </div>
          </div>

          {/* Course Syllabus */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Course Syllabus</h2>
              <span className="text-xs text-muted-foreground">
                {course.modules.length} modules • {totalLessons} lessons
              </span>
            </div>

            <Accordion defaultValue={["m1", "m2"]} className="space-y-3">
              {course.modules.map((module, index) => (
                <AccordionItem
                  key={module.id}
                  value={module.id}
                  className="border border-border rounded-xl px-4 bg-muted/10"
                >
                  <AccordionTrigger className="hover:no-underline py-3.5">
                    <div className="flex items-center gap-3 text-left">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
                        {index + 1}
                      </span>
                      <span className="font-semibold text-sm">{module.title}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-1 pb-3 space-y-2">
                    {module.lessons.map((lesson) => (
                      <div
                        key={lesson.id}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-background border border-border/50 hover:bg-muted/40 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {getLessonIcon(lesson.type)}
                          <span className="text-xs font-medium text-foreground">
                            {lesson.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-muted-foreground">
                            {lesson.duration}
                          </span>
                        </div>
                      </div>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>

        {/* Sidebar (Right 1/3) */}
        <div className="space-y-6">
          <Card className="border-border shadow-sm sticky top-6">
            <CardContent className="p-6 space-y-6">
              <Link href={`/learn/${course.id}`} className="block">
                <Button className="w-full h-11 text-sm font-semibold gap-2">
                  <BookOpen className="h-4 w-4" /> Start Learning Now
                </Button>
              </Link>

              <div className="space-y-3 text-xs">
                <p className="font-bold text-foreground">Course Overview Includes:</p>
                <div className="space-y-2 text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5" /> Total Duration
                    </span>
                    <span className="font-medium text-foreground">{course.stats.duration}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <BookOpen className="h-3.5 w-3.5" /> Lessons
                    </span>
                    <span className="font-medium text-foreground">{totalLessons} lessons</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Award className="h-3.5 w-3.5" /> Official Certificate
                    </span>
                    <Badge variant="secondary" className="text-[10px] text-success bg-success/10">
                      Included
                    </Badge>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="p-3 bg-muted/40 rounded-xl space-y-1 text-xs">
                <p className="font-semibold text-foreground flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-primary" /> Verified Curriculum
                </p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Accredited by Axoria Enterprise Learning Framework with real-time AI comprehension assessments.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
