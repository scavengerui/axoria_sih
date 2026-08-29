"use client";

import { use, useState, useEffect } from "react";
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
  Play,
  Layers,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { getCourseDetailById, CourseDetail } from "@/lib/data/courseCatalogData";
import { getCourseById } from "@/lib/actions/course";

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
  const isStandardId = courseId === "1" || courseId === "2" || courseId === "3";

  const [course, setCourse] = useState<CourseDetail | null>(() =>
    isStandardId ? getCourseDetailById(courseId) : null
  );
  const [loading, setLoading] = useState(!isStandardId);

  const { membership } = useOrganization();
  const role = membership?.role ?? "org:admin";
  const isLearner = role === "org:member";

  useEffect(() => {
    async function loadCourse() {
      try {
        if (courseId.length > 5) {
          const res = await getCourseById(courseId);
          if (res.success && res.course) {
            const c = res.course;
            const isAgile = c.title.toLowerCase().includes("agile");
            const isPrivacy = c.title.toLowerCase().includes("privacy");

            const customDetail: CourseDetail = {
              id: c._id,
              title: c.title,
              description: c.description,
              instructor: {
                name: isAgile
                  ? "Prof. Sunita Deshmukh"
                  : isPrivacy
                    ? "Dr. Ananya Sengupta"
                    : c.instructor || "Dr. Raghavan Sundaram (CISO)",
                role: "Senior Enterprise Instructor",
                avatar: "IN",
              },
              stats: {
                duration: `${c.estimatedDuration || 40}m`,
                enrolled: c.enrolledCount || 1,
                rating: 4.9,
              },
              tags: c.competencyTags || ["Enterprise", "Compliance"],
              isMandatory: c.mandatory || false,
              modules:
                c.modules && c.modules.length > 0
                  ? c.modules.map((m: any, idx: number) => ({
                      id: m._id || `m_${idx}`,
                      title: m.title,
                      lessons: (m.lessons || []).map((l: any, lIdx: number) => ({
                        id: l._id || `l_${idx}_${lIdx}`,
                        title: l.title,
                        type: l.type || "video",
                        duration: `${l.duration || 10}m`,
                        hasQuiz: !!l.quizId,
                      })),
                    }))
                  : [
                      {
                        id: "m_def",
                        title: "Module 1: Core Principles & Practical Application",
                        lessons: [
                          {
                            id: "l_def_1",
                            title: "Introduction & Operational Guidelines",
                            type: "video",
                            duration: "15m",
                          },
                          {
                            id: "l_def_2",
                            title: "Practical Scenario & Assessment",
                            type: "article",
                            duration: "10m",
                            hasQuiz: true,
                          },
                        ],
                      },
                    ],
              quiz: {
                title: `${c.title} Assessment`,
                questions: [],
              },
            };
            setCourse(customDetail);
          }
        } else {
          setCourse(getCourseDetailById(courseId));
        }
      } catch (err) {
        console.error("Failed to load course details:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCourse();
  }, [courseId]);

  if (loading || !course) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 pb-16">
        <Link
          href="/catalog"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Catalog
        </Link>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-80 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

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

            <Accordion defaultValue={["module-0"]} className="space-y-3">
              {course.modules.map((module, modIdx) => (
                <AccordionItem
                  key={module.id}
                  value={`module-${modIdx}`}
                  className="border border-border rounded-xl px-4 overflow-hidden"
                >
                  <AccordionTrigger className="hover:no-underline py-3.5">
                    <div className="flex items-center justify-between w-full pr-4 text-left">
                      <span className="text-sm font-semibold text-foreground">
                        {module.title}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {module.lessons.length} lessons
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-3 pt-1">
                    <div className="space-y-1">
                      {module.lessons.map((lesson) => (
                        <div
                          key={lesson.id}
                          className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors text-xs"
                        >
                          <div className="flex items-center gap-2.5">
                            {getLessonIcon(lesson.type)}
                            <span className="text-foreground">{lesson.title}</span>
                            {lesson.hasQuiz && (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                Quiz
                              </Badge>
                            )}
                          </div>
                          <span className="text-muted-foreground">{lesson.duration}</span>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>

        {/* Sidebar (Right 1/3) */}
        <div className="space-y-6">
          <Card className="border border-border shadow-sm sticky top-6">
            <CardContent className="p-6 space-y-5">
              <div className="space-y-2">
                <Link href={`/learn/${courseId}`} className="block">
                  <Button className="w-full text-xs h-10 font-semibold gap-2">
                    Enter Course Player <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
                <p className="text-[11px] text-center text-muted-foreground">
                  Free enterprise enrollment included with your organization account
                </p>
              </div>

              <Separator />

              {/* Quick Details */}
              <div className="space-y-3 text-xs">
                <h3 className="font-semibold text-foreground text-xs uppercase tracking-wider">
                  Course Includes
                </h3>
                <div className="space-y-2 text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-primary" /> Duration
                    </span>
                    <span className="font-medium text-foreground">{course.stats.duration}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <BookOpen className="h-3.5 w-3.5 text-primary" /> Total Lessons
                    </span>
                    <span className="font-medium text-foreground">{totalLessons} Lessons</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Award className="h-3.5 w-3.5 text-success" /> Verified Certificate
                    </span>
                    <span className="font-medium text-success">Yes, upon completion</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Instructor Card */}
              <div className="p-3 bg-muted/40 rounded-xl space-y-2 text-xs">
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                  Instructor
                </p>
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">
                    {course.instructor.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{course.instructor.name}</p>
                    <p className="text-[10px] text-muted-foreground">{course.instructor.role}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
