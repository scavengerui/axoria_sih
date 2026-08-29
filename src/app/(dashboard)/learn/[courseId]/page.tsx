"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import {
  Play,
  FileText,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  CheckCircle2,
  HelpCircle,
  Award,
  Sparkles,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { updateLessonProgress } from "@/lib/actions/enrollment";
import { createNotification } from "@/lib/actions/notification";
import { getCourseById } from "@/lib/actions/course";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getCourseDetailById, CourseDetail } from "@/lib/data/courseCatalogData";

function getLessonIcon(type: string, className?: string) {
  switch (type) {
    case "video":
      return <Play className={className} />;
    case "pdf":
      return <FileText className={className} />;
    case "article":
    default:
      return <BookOpen className={className} />;
  }
}

export default function CoursePlayerPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const resolvedParams = use(params);
  const courseId = resolvedParams.courseId || "1";

  const [course, setCourse] = useState<CourseDetail>(() => getCourseDetailById(courseId));
  const { user } = useUser();

  useEffect(() => {
    async function loadCourse() {
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
            tags: c.competencyTags || ["Enterprise", "Security"],
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
                      videoUrl: l.contentUrl || "https://www.youtube.com/embed/j0ieRrwae5w",
                      articleContent:
                        l.content ||
                        "Organizational compliance requires continuous learning, regular self-assessments, and cross-team communication.",
                      hasQuiz: true,
                    })),
                  }))
                : [
                    {
                      id: "m_def",
                      title: "Module 1: Foundations & Core Principles",
                      lessons: [
                        {
                          id: "l_def_1",
                          title: "Introduction & Strategy Overview",
                          type: "video",
                          duration: "15m",
                          videoUrl: "https://www.youtube.com/embed/j0ieRrwae5w",
                        },
                        {
                          id: "l_def_2",
                          title: "Key Framework Guidelines",
                          type: "article",
                          duration: "10m",
                          articleContent:
                            "Organizational compliance requires continuous learning, regular self-assessments, and cross-team communication.",
                          hasQuiz: true,
                        },
                      ],
                    },
                  ],
            quiz: {
              title: `${c.title} Assessment`,
              questions: [
                {
                  id: "q_cust_1",
                  text: `What is the primary compliance principle taught in ${c.title}?`,
                  options: [
                    "Continuous learning, verification, and proactive security hygiene",
                    "Ignoring security policies unless an audit is announced",
                    "Sharing administrative credentials across departments",
                    "Disabling multifactor authentication for faster login",
                  ],
                  correctIndex: 0,
                  explanation:
                    "Proactive compliance and continuous verification form the core foundation of organizational capability.",
                },
                {
                  id: "q_cust_2",
                  text: "Why is browser extension permission scoping critical for organizational defense?",
                  options: [
                    "Extensions with broad permissions can read and exfiltrate sensitive session tokens and credentials",
                    "Extensions use too much disk space on local SSDs",
                    "Extensions change the browser theme colors unexpectedly",
                    "Extensions disable monitor brightness settings",
                  ],
                  correctIndex: 0,
                  explanation:
                    "Malicious or over-privileged browser extensions can capture keystrokes and session cookies, bypassing standard per-request firewall inspection.",
                },
              ],
            },
          };
          setCourse(customDetail);
        }
      }
    }
    loadCourse();
  }, [courseId]);

  const flatLessons = course.modules.flatMap((m) => m.lessons);

  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(
    new Set([flatLessons[0]?.id || "l1"])
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Quiz Modal State
  const [quizOpen, setQuizOpen] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  const currentLesson = flatLessons[currentLessonIndex] || flatLessons[0];
  const progressPercent = Math.round(
    (completedLessons.size / Math.max(1, flatLessons.length)) * 100
  );
  const isCompleted = completedLessons.has(currentLesson?.id);

  const handleNext = () => {
    if (currentLessonIndex < flatLessons.length - 1) {
      setCurrentLessonIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentLessonIndex > 0) {
      setCurrentLessonIndex((prev) => prev - 1);
    }
  };

  const handleMarkComplete = async () => {
    const nextSet = new Set(completedLessons);
    nextSet.add(currentLesson.id);
    setCompletedLessons(nextSet);

    const isAllComplete = nextSet.size === flatLessons.length;
    toast.success(`Lesson marked as completed! (+${Math.round(100 / flatLessons.length)}%)`);

    if (isAllComplete) {
      toast.success("🎉 Congratulations! You have completed all lessons in this course!");
      if (user?.id) {
        await createNotification({
          userId: user.id,
          type: "certificate",
          title: `Course Completed: ${course.title}`,
          message: `You completed all lessons in ${course.title}. Click to view and download your Certificate.`,
          link: "/certificates",
        });
      }
    }

    if (user?.id) {
      try {
        await updateLessonProgress({
          userId: user.id,
          courseId: course.id,
          lessonId: currentLesson.id,
          totalLessons: flatLessons.length,
        });
      } catch (err) {
        console.error("Progress sync notice:", err);
      }
    }

    handleNext();
  };

  const handleQuizAnswer = (qId: string, optIdx: number) => {
    if (quizSubmitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [qId]: optIdx }));
  };

  const handleQuizSubmit = async () => {
    let correct = 0;
    const questions = course.quiz?.questions || [];
    questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctIndex) {
        correct++;
      }
    });

    const score = Math.round((correct / Math.max(1, questions.length)) * 100);
    setQuizScore(score);
    setQuizSubmitted(true);

    if (score >= 70) {
      toast.success(`Assessment Passed with ${score}%! 🏆`);
      const nextSet = new Set(completedLessons);
      nextSet.add(currentLesson.id);
      setCompletedLessons(nextSet);

      if (user?.id) {
        await createNotification({
          userId: user.id,
          type: "certificate",
          title: `Assessment Passed: ${course.title}`,
          message: `Score: ${score}%. Certificate #${course.id} issued.`,
          link: "/certificates",
        });
      }
    } else {
      toast.error(`Score: ${score}%. Minimum passing threshold is 70%.`);
    }
  };

  const handleQuizReset = () => {
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setQuizScore(0);
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden bg-background">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <Link
              href={`/catalog/${courseId}`}
              className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Course
            </Link>
            <Separator orientation="vertical" className="h-4" />
            <h2 className="text-xs sm:text-sm font-semibold text-foreground truncate max-w-md">
              {currentLesson?.title || "Lesson"}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden text-xs h-8"
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Lesson Viewer Content */}
        <div className="p-6 md:p-8 max-w-4xl mx-auto w-full space-y-6 flex-1">
          {/* VIDEO LESSON */}
          {currentLesson?.type === "video" && (
            <div className="space-y-4">
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-black shadow-lg border border-border">
                <iframe
                  src={currentLesson.videoUrl || "https://www.youtube.com/embed/j0ieRrwae5w"}
                  title={currentLesson.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div>
                  <h1 className="text-xl font-bold text-foreground">{currentLesson.title}</h1>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Module Duration: {currentLesson.duration} • Interactive Video Lecture
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ARTICLE LESSON */}
          {currentLesson?.type === "article" && (
            <div className="space-y-6">
              <div className="border-b border-border pb-4">
                <Badge variant="secondary" className="text-xs mb-2">
                  Compliance Reading
                </Badge>
                <h1 className="text-2xl font-bold text-foreground">{currentLesson.title}</h1>
                <p className="text-xs text-muted-foreground mt-1">
                  Estimated reading time: {currentLesson.duration}
                </p>
              </div>

              <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground leading-relaxed space-y-4">
                <div className="p-4 bg-muted/40 rounded-xl border border-border/70 text-foreground font-medium text-xs leading-relaxed">
                  {currentLesson.articleContent ||
                    "Organizational compliance requires continuous learning, regular self-assessments, and cross-team communication."}
                </div>

                <h3 className="text-base font-semibold text-foreground pt-2">
                  Key Operational Guidelines
                </h3>
                <ul className="list-disc pl-5 space-y-2 text-xs">
                  <li>Always verify permissions requested by third-party tooling and browser add-ons.</li>
                  <li>Ensure multi-factor authentication (MFA) is actively enforced across all team logins.</li>
                  <li>Report any suspicious access or token anomalies to the enterprise security team.</li>
                </ul>
              </div>
            </div>
          )}

          {/* PDF LESSON */}
          {currentLesson?.type === "pdf" && (
            <div className="space-y-4">
              <div className="p-8 border-2 border-dashed border-border rounded-2xl bg-muted/20 text-center space-y-4">
                <FileText className="h-12 w-12 text-primary mx-auto" />
                <div>
                  <h3 className="font-semibold text-base text-foreground">
                    {currentLesson.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Official Documentation & Governance Framework
                  </p>
                </div>
                <Button variant="outline" size="sm" className="gap-2 text-xs">
                  <ExternalLink className="h-3.5 w-3.5" /> Download / Open Document
                </Button>
              </div>
            </div>
          )}

          {/* Lesson Action Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border mt-8">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrev}
                disabled={currentLessonIndex === 0}
                className="gap-1.5 text-xs h-9"
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNext}
                disabled={currentLessonIndex === flatLessons.length - 1}
                className="gap-1.5 text-xs h-9"
              >
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-3">
              {currentLesson?.hasQuiz && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    handleQuizReset();
                    setQuizOpen(true);
                  }}
                  className="gap-2 text-xs h-9 font-semibold bg-primary/10 text-primary hover:bg-primary/20"
                >
                  <Sparkles className="h-4 w-4 text-primary" /> Take AI Assessment
                </Button>
              )}

              <Button
                size="sm"
                onClick={handleMarkComplete}
                className={cn(
                  "gap-2 text-xs h-9 font-semibold",
                  isCompleted ? "bg-success text-white hover:bg-success/90" : "bg-primary"
                )}
              >
                <Check className="h-4 w-4" />
                {isCompleted ? "Completed" : "Mark as Complete"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Lesson Sidebar */}
      <div
        className={cn(
          "w-80 border-l border-border bg-card flex flex-col transition-all duration-300",
          sidebarOpen ? "block fixed inset-y-0 right-0 z-50 shadow-2xl" : "hidden md:flex"
        )}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-border space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-foreground truncate pr-2">
              {course.title}
            </h3>
            {sidebarOpen && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(false)}
                className="h-7 w-7 md:hidden"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Overall Progress</span>
              <span className="font-semibold text-foreground">{progressPercent}%</span>
            </div>
            <Progress value={progressPercent} className="h-1.5" />
          </div>
        </div>

        {/* Scrollable Lesson List */}
        <ScrollArea className="flex-1 p-3">
          <div className="space-y-4">
            {course.modules.map((module, modIdx) => (
              <div key={module.id} className="space-y-1.5">
                <p className="px-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  {module.title}
                </p>

                <div className="space-y-1">
                  {module.lessons.map((lesson) => {
                    const lIndex = flatLessons.findIndex((l) => l.id === lesson.id);
                    const isCurrent = lIndex === currentLessonIndex;
                    const isDone = completedLessons.has(lesson.id);

                    return (
                      <button
                        key={lesson.id}
                        onClick={() => {
                          setCurrentLessonIndex(lIndex);
                          if (sidebarOpen) setSidebarOpen(false);
                        }}
                        className={cn(
                          "w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all text-xs",
                          isCurrent
                            ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                            : "hover:bg-muted text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                          {isDone ? (
                            <CheckCircle2
                              className={cn(
                                "h-4 w-4 shrink-0",
                                isCurrent ? "text-primary-foreground" : "text-success"
                              )}
                            />
                          ) : (
                            getLessonIcon(
                              lesson.type,
                              cn(
                                "h-4 w-4 shrink-0",
                                isCurrent ? "text-primary-foreground" : "text-muted-foreground"
                              )
                            )
                          )}
                          <span className="truncate">{lesson.title}</span>
                        </div>

                        <span
                          className={cn(
                            "text-[10px] font-mono shrink-0",
                            isCurrent ? "text-primary-foreground/80" : "text-muted-foreground"
                          )}
                        >
                          {lesson.duration}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* AI Assessment Quiz Modal */}
      <Dialog open={quizOpen} onOpenChange={setQuizOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="secondary" className="text-[10px] gap-1 bg-primary/10 text-primary">
                <Sparkles className="w-3 h-3 text-primary" /> AI Assessment
              </Badge>
              <Badge variant="outline" className="text-[10px]">
                Passing Score: 70%
              </Badge>
            </div>
            <DialogTitle className="text-lg font-bold">{course.quiz?.title || "Assessment"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 pt-3">
            {course.quiz?.questions?.map((q, qIdx) => (
              <div key={q.id} className="p-4 rounded-xl border border-border/80 bg-muted/20 space-y-3">
                <p className="text-xs font-semibold text-foreground">
                  {qIdx + 1}. {q.text}
                </p>

                <div className="space-y-2">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = selectedAnswers[q.id] === optIdx;
                    const isCorrect = q.correctIndex === optIdx;

                    let btnClass = "border-border hover:bg-muted text-foreground";
                    if (quizSubmitted) {
                      if (isCorrect) btnClass = "border-success bg-success/15 text-success font-semibold";
                      else if (isSelected && !isCorrect)
                        btnClass = "border-destructive bg-destructive/15 text-destructive font-semibold";
                    } else if (isSelected) {
                      btnClass = "border-primary bg-primary/10 text-primary font-semibold";
                    }

                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => handleQuizAnswer(q.id, optIdx)}
                        className={cn(
                          "w-full text-left p-2.5 rounded-lg border text-xs transition-all flex items-center justify-between",
                          btnClass
                        )}
                      >
                        <span>{opt}</span>
                        {quizSubmitted && isCorrect && (
                          <Check className="h-3.5 w-3.5 text-success shrink-0" />
                        )}
                        {quizSubmitted && isSelected && !isCorrect && (
                          <X className="h-3.5 w-3.5 text-destructive shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {quizSubmitted && q.explanation && (
                  <p className="text-[11px] text-muted-foreground p-2.5 bg-background rounded-lg border border-border/50">
                    💡 <strong className="text-foreground">Explanation:</strong> {q.explanation}
                  </p>
                )}
              </div>
            ))}

            {/* Quiz Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              {quizSubmitted ? (
                <div className="flex items-center gap-3">
                  <Badge
                    variant={quizScore >= 70 ? "secondary" : "destructive"}
                    className={cn(
                      "text-xs px-2.5 py-1",
                      quizScore >= 70 && "bg-success/15 text-success border-success/30"
                    )}
                  >
                    Your Score: {quizScore}% {quizScore >= 70 ? "🎉 Passed" : "⚠️ Try Again"}
                  </Badge>
                  <Button variant="outline" size="sm" onClick={handleQuizReset} className="text-xs h-8">
                    <RefreshCw className="h-3 w-3 mr-1" /> Retake Quiz
                  </Button>
                </div>
              ) : (
                <span className="text-xs text-muted-foreground">
                  Answer all questions and submit to validate competency.
                </span>
              )}

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setQuizOpen(false)} className="text-xs h-8">
                  Close
                </Button>
                {!quizSubmitted && (
                  <Button
                    size="sm"
                    onClick={handleQuizSubmit}
                    disabled={Object.keys(selectedAnswers).length < (course.quiz?.questions?.length || 1)}
                    className="text-xs h-8 font-semibold"
                  >
                    Submit Answers
                  </Button>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
