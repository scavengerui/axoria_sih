"use client";

import { use, useState } from "react";
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
  const course: CourseDetail = getCourseDetailById(courseId);

  const { user } = useUser();
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
    (completedLessons.size / flatLessons.length) * 100
  );
  const isCompleted = completedLessons.has(currentLesson.id);

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

    handleNext();
  };

  const handleAnswerSelect = (questionId: string, optionIndex: number) => {
    if (quizSubmitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmitQuiz = async () => {
    const questions = course.quiz.questions;
    let correctCount = 0;

    questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctIndex) {
        correctCount += 1;
      }
    });

    const scorePct = Math.round((correctCount / questions.length) * 100);
    setQuizScore(scorePct);
    setQuizSubmitted(true);

    if (scorePct >= 70) {
      toast.success(`Passed Assessment with ${scorePct}%! 🏆`);
      const nextSet = new Set(completedLessons);
      nextSet.add(currentLesson.id);
      setCompletedLessons(nextSet);

      if (user?.id) {
        await createNotification({
          userId: user.id,
          type: "certificate",
          title: `Assessment Passed (${scorePct}%)! 🎓`,
          message: `Passed ${course.quiz.title}. Certificate credential is ready!`,
          link: "/certificates",
        });
      }
    } else {
      toast.error(`Scored ${scorePct}%. Retake required (pass threshold is 70%).`);
    }
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setQuizScore(0);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-7xl mx-auto">
      {/* Top Banner Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-card/60 backdrop-blur shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/catalog"
            className="p-1.5 rounded-lg hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="font-semibold text-xs sm:text-sm text-foreground line-clamp-1">
              {course.title}
            </h1>
            <p className="text-[11px] text-muted-foreground flex items-center gap-2">
              <span>{course.instructor.name}</span>
              <span>•</span>
              <span>Lesson {currentLessonIndex + 1} of {flatLessons.length}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2.5">
            <span className="text-xs font-semibold text-foreground">
              {progressPercent}% Complete
            </span>
            <Progress value={progressPercent} className="w-28 h-2" />
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden text-xs h-8"
          >
            <Menu className="h-4 w-4 mr-1" /> Syllabus
          </Button>
        </div>
      </div>

      {/* Main Learning Surface */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Content Viewer Area */}
        <div className="flex-1 flex flex-col overflow-y-auto p-4 sm:p-6 bg-background">
          <div className="max-w-4xl mx-auto w-full space-y-6">
            {/* Lesson Title & Type Badge */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-[10px] capitalize">
                    {currentLesson.type} Lesson
                  </Badge>
                  {isCompleted && (
                    <Badge variant="outline" className="text-success border-success/30 text-[10px] gap-1">
                      <Check className="h-3 w-3" /> Completed
                    </Badge>
                  )}
                </div>
                <h2 className="text-xl font-bold text-foreground">
                  {currentLesson.title}
                </h2>
              </div>

              {/* Assessment Trigger Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuizOpen(true)}
                className="gap-1.5 text-xs border-primary/40 text-primary hover:bg-primary/5"
              >
                <HelpCircle className="h-3.5 w-3.5" /> Take Quiz
              </Button>
            </div>

            {/* VIDEO LESSON VIEWER */}
            {currentLesson.type === "video" && (
              <div className="rounded-2xl overflow-hidden aspect-video bg-black shadow-md border border-border">
                <iframe
                  src={currentLesson.videoUrl || "https://www.youtube.com/embed/bPVaOlJ6ln0"}
                  title={currentLesson.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}

            {/* ARTICLE LESSON VIEWER */}
            {currentLesson.type === "article" && (
              <div className="p-6 rounded-2xl border border-border bg-card shadow-xs space-y-4">
                <div className="prose prose-sm dark:prose-invert max-w-none text-foreground leading-relaxed whitespace-pre-line text-sm">
                  {currentLesson.articleContent ||
                    "Review key notes and organizational standards for this module."}
                </div>
              </div>
            )}

            {/* PDF DOCUMENT VIEWER */}
            {currentLesson.type === "pdf" && (
              <div className="p-6 rounded-2xl border border-border bg-card shadow-xs space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/40 border border-border/50">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-semibold text-xs text-foreground">
                        {currentLesson.title}.pdf
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Enterprise Operational Policy & Reference Sheet
                      </p>
                    </div>
                  </div>
                  <a
                    href={currentLesson.pdfUrl || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-primary font-medium hover:underline"
                  >
                    Open Full PDF <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            )}

            {/* Bottom Controls */}
            <div className="flex items-center justify-between pt-6 border-t border-border mt-8">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrev}
                disabled={currentLessonIndex === 0}
                className="gap-1 text-xs"
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={handleMarkComplete}
                  className="gap-1.5 text-xs"
                >
                  <Check className="h-3.5 w-3.5" />
                  {isCompleted ? "Completed (Next)" : "Mark as Complete"}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNext}
                  disabled={currentLessonIndex === flatLessons.length - 1}
                  className="gap-1 text-xs"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Interactive Syllabus Sidebar */}
        <div
          className={cn(
            "w-80 border-l border-border bg-card shrink-0 flex flex-col md:flex",
            sidebarOpen ? "fixed inset-y-0 right-0 z-50 shadow-2xl" : "hidden md:flex"
          )}
        >
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
              Course Syllabus
            </h3>
            <span className="text-xs text-primary font-bold">
              {completedLessons.size}/{flatLessons.length} Done
            </span>
          </div>

          <ScrollArea className="flex-1 p-3 space-y-4">
            {course.modules.map((module) => (
              <div key={module.id} className="space-y-1.5 mb-4">
                <p className="text-xs font-bold text-foreground px-2 py-1 flex items-center gap-1.5">
                  {module.title}
                </p>
                <div className="space-y-1">
                  {module.lessons.map((lesson) => {
                    const lIdx = flatLessons.findIndex((fl) => fl.id === lesson.id);
                    const isCurrent = lIdx === currentLessonIndex;
                    const isDone = completedLessons.has(lesson.id);

                    return (
                      <div
                        key={lesson.id}
                        onClick={() => {
                          setCurrentLessonIndex(lIdx);
                          setSidebarOpen(false);
                        }}
                        className={cn(
                          "flex items-center gap-2.5 p-2.5 rounded-xl text-xs cursor-pointer transition-all",
                          isCurrent
                            ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                            : "hover:bg-muted/50 text-foreground"
                        )}
                      >
                        <div className="shrink-0">
                          {isDone ? (
                            <CheckCircle2
                              className={cn(
                                "h-4 w-4",
                                isCurrent ? "text-primary-foreground" : "text-success"
                              )}
                            />
                          ) : (
                            getLessonIcon(lesson.type, "h-4 w-4 opacity-70")
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-xs">{lesson.title}</p>
                          <span
                            className={cn(
                              "text-[10px]",
                              isCurrent ? "text-primary-foreground/80" : "text-muted-foreground"
                            )}
                          >
                            {lesson.duration}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </ScrollArea>
        </div>
      </div>

      {/* UNIQUE COURSE ASSESSMENT MODAL */}
      <Dialog open={quizOpen} onOpenChange={setQuizOpen}>
        <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto p-6">
          <DialogHeader className="border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-[10px]">
                Knowledge Assessment
              </Badge>
              <Badge variant="outline" className="text-[10px]">
                Pass: 70%
              </Badge>
            </div>
            <DialogTitle className="text-lg font-bold text-foreground mt-1">
              {course.quiz.title}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 pt-3">
            {course.quiz.questions.map((q, qIndex) => {
              const isSelected = selectedAnswers[q.id] !== undefined;

              return (
                <div
                  key={q.id}
                  className="p-4 rounded-xl border border-border bg-muted/20 space-y-3"
                >
                  <p className="text-xs font-semibold text-foreground">
                    {qIndex + 1}. {q.text}
                  </p>

                  <div className="space-y-2">
                    {q.options.map((option, optIdx) => {
                      const isChosen = selectedAnswers[q.id] === optIdx;
                      const isCorrect = optIdx === q.correctIndex;

                      return (
                        <div
                          key={optIdx}
                          onClick={() => handleAnswerSelect(q.id, optIdx)}
                          className={cn(
                            "flex items-center justify-between p-2.5 rounded-lg border text-xs cursor-pointer transition-all",
                            !quizSubmitted && isChosen && "border-primary bg-primary/10 font-medium",
                            !quizSubmitted && !isChosen && "border-border/60 bg-background hover:bg-muted/40",
                            quizSubmitted && isCorrect && "border-success bg-success/15 font-semibold text-success",
                            quizSubmitted && isChosen && !isCorrect && "border-destructive bg-destructive/15 text-destructive"
                          )}
                        >
                          <span>{option}</span>
                          {quizSubmitted && isCorrect && (
                            <Check className="h-3.5 w-3.5 text-success shrink-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {quizSubmitted && (
                    <p className="text-[11px] text-muted-foreground/80 italic pt-1 border-t border-border/40">
                      💡 {q.explanation}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border mt-4">
            {quizSubmitted ? (
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-bold text-foreground">
                  Score: {quizScore}% {quizScore >= 70 ? "🎉 (Passed)" : "❌ (Try Again)"}
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleResetQuiz}
                    className="text-xs"
                  >
                    Retake Quiz
                  </Button>
                  <Button size="sm" onClick={() => setQuizOpen(false)} className="text-xs">
                    Done
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex justify-end gap-2 w-full">
                <Button
                  size="sm"
                  onClick={handleSubmitQuiz}
                  disabled={
                    Object.keys(selectedAnswers).length < course.quiz.questions.length
                  }
                  className="text-xs"
                >
                  Submit Assessment
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
