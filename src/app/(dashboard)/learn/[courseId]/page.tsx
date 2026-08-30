"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import {
  BookOpen,
  FileText,
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
  Layers,
  Send,
  MessageSquare,
  Compass,
  Lightbulb,
  CheckCircle,
  Video,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { updateLessonProgress } from "@/lib/actions/enrollment";
import { createNotification } from "@/lib/actions/notification";
import { getCourseById } from "@/lib/actions/course";
import { evaluateReflectionAnswer } from "@/lib/actions/ai";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getCourseDetailById, COURSES_DATABASE, CourseDetail } from "@/lib/data/courseCatalogData";

export default function CoursePlayerPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const resolvedParams = use(params);
  const courseId = resolvedParams.courseId || "1";

  const [course, setCourse] = useState<CourseDetail>(() => getCourseDetailById(courseId));
  const { user } = useUser();

  // Navigation & Completion State (Starts strictly at 0%!)
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showVideo, setShowVideo] = useState(true);

  // In-Lesson Reflection Checkpoint State
  const [reflectionInput, setReflectionInput] = useState("");
  const [reflectionResult, setReflectionResult] = useState<any>(null);
  const [isEvaluatingReflection, setIsEvaluatingReflection] = useState(false);

  // Flashcards Study Modal State
  const [flashcardsOpen, setFlashcardsOpen] = useState(false);
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  // AI Assessment Quiz Modal State
  const [quizOpen, setQuizOpen] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

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
              duration: `${c.estimatedDuration || 35}m`,
              enrolled: c.enrolledCount || 1,
              rating: 4.9,
            },
            tags: c.competencyTags || ["Enterprise", "Specialized"],
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
                      videoUrl: l.contentUrl || l.videoUrl || "https://www.youtube.com/embed/j0ieRrwae5w",
                      articleContent:
                        l.content ||
                        "Comprehensive structured learning on core fundamentals and operational guidelines.",
                      diagram:
                        l.diagram ||
                        "Step 1: Input Analysis ---> Step 2: Policy & Architecture Gate ---> Step 3: Verified Execution",
                      reflectionQuestion:
                        l.reflectionQuestion ||
                        `In your own words, what is the most critical operational takeaway from ${l.title}?`,
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
                          title: "Foundational Concepts & Principles",
                          type: "video",
                          duration: "10m",
                          videoUrl: "https://www.youtube.com/embed/j0ieRrwae5w",
                          articleContent:
                            "Comprehensive training on core fundamentals. Understanding foundational architecture and practical operational workflows is essential for high-velocity teams.",
                          diagram:
                            "Step 1: Ingestion & Auth ---> Step 2: Validation Engine ---> Step 3: Execution Output",
                          reflectionQuestion:
                            "In your own words, how would you explain the primary purpose of this topic to a junior team member?",
                          hasQuiz: true,
                        },
                      ],
                    },
                  ],
            quiz: {
              title: `${c.title} Assessment`,
              questions:
                c.metadata?.quizzes && c.metadata.quizzes.length > 0
                  ? c.metadata.quizzes
                  : [
                      {
                        id: "q_cust_1",
                        text: `What is the foundational principle taught in ${c.title}?`,
                        options: [
                          "Continuous validation, clear structure, and proactive hygiene",
                          "Disabling compliance checks to save time",
                          "Sharing administrative credentials across unverified tools",
                          "Ignoring system logs during incident response",
                        ],
                        correctIndex: 0,
                        explanation:
                          "Continuous verification and structured operational hygiene form the core foundation.",
                      },
                    ],
            },
            flashcards:
              c.metadata?.flashcards && c.metadata.flashcards.length > 0
                ? c.metadata.flashcards
                : [
                    {
                      id: "fc1",
                      front: `Core Principle of ${c.title}`,
                      back: "Establishing consistent, verified, and proactive operational standards.",
                    },
                  ],
          };
          setCourse(customDetail);
        }
      } else if (COURSES_DATABASE[courseId]) {
        setCourse(COURSES_DATABASE[courseId]);
      }
    }
    loadCourse();
  }, [courseId]);

  const flatLessons = course.modules.flatMap((m) => m.lessons);
  const currentLesson: any = flatLessons[currentLessonIndex] || flatLessons[0];

  // Reset reflection input when switching lessons
  useEffect(() => {
    setReflectionInput("");
    setReflectionResult(null);
  }, [currentLessonIndex]);

  // Accurate progress calculation (0% if none completed)
  const progressPercent =
    flatLessons.length > 0
      ? Math.round((completedLessons.size / flatLessons.length) * 100)
      : 0;

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
    toast.success(`Lesson marked complete! Progress: ${Math.round((nextSet.size / flatLessons.length) * 100)}%`);

    if (isAllComplete) {
      toast.success("🎉 Congratulations! You completed all lessons in this course!");
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

  const handleEvaluateReflection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reflectionInput.trim() || isEvaluatingReflection) return;

    setIsEvaluatingReflection(true);
    toast.info("Evaluating your reflection with Groq AI...");

    try {
      const res = await evaluateReflectionAnswer({
        lessonTitle: currentLesson?.title || "Lesson",
        reflectionQuestion:
          currentLesson?.reflectionQuestion ||
          "What is the most critical operational takeaway from this lesson?",
        userAnswer: reflectionInput.trim(),
      });

      if (res.success && res.data) {
        setReflectionResult(res.data);
        toast.success(`Relevance Evaluated: ${res.data.relevanceScore}%! ✨`);
      }
    } catch (err: any) {
      toast.error("Evaluation error: " + err.message);
    } finally {
      setIsEvaluatingReflection(false);
    }
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

    if (score >= 60) {
      toast.success(`🎉 Capstone Exam Passed with ${score}%! Official Certificate Issued! 🏆`);
      const nextSet = new Set(flatLessons.map((l) => l.id));
      setCompletedLessons(nextSet);

      if (user?.id) {
        try {
          await updateLessonProgress({
            userId: user.id,
            courseId: course.id,
            lessonId: currentLesson.id,
            totalLessons: flatLessons.length,
          });

          await createNotification({
            userId: user.id,
            type: "certificate",
            title: `🏆 Certified: ${course.title}`,
            message: `You achieved ${score}% on the Capstone Exam. Your verified Certificate #${course.id} is available for download.`,
            link: "/certificates",
          });
        } catch (err) {
          console.error("Certificate sync notice:", err);
        }
      }
    } else {
      toast.error(`Score: ${score}%. Minimum passing threshold is 60%. Review the reading sections and retake to earn your certificate.`);
    }
  };

  const handleQuizReset = () => {
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setQuizScore(0);
  };

  const activeFlashcards =
    course.flashcards && course.flashcards.length > 0
      ? course.flashcards
      : [
          {
            id: "fc1",
            front: `Core Principle of ${course.title}`,
            back: "Establishing consistent, verified, and proactive operational standards.",
          },
          {
            id: "fc2",
            front: "Why are mid-lesson reflection checkpoints important?",
            back: "They reinforce active recall and validate conceptual synthesis rather than passive reading.",
          },
          {
            id: "fc3",
            front: "What constitutes passing competency?",
            back: "Achieving >=60% score on the comprehensive AI assessment quiz.",
          },
        ];

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
              Course Syllabus
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
              onClick={() => {
                setFlashcardIndex(0);
                setIsCardFlipped(false);
                setFlashcardsOpen(true);
              }}
              className="text-xs h-8 gap-1.5 font-medium"
            >
              <Layers className="h-3.5 w-3.5 text-primary" /> Study Flashcards ({activeFlashcards.length})
            </Button>

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
        <div className="p-6 md:p-8 max-w-4xl mx-auto w-full space-y-8 flex-1">
          {/* Header Badge & Title */}
          <div className="border-b border-border pb-5 space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs bg-primary/10 text-primary font-semibold">
                Lesson {currentLessonIndex + 1} of {flatLessons.length}
              </Badge>
              <span className="text-xs text-muted-foreground">
                Est. Duration: {currentLesson?.duration || "15m"}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {currentLesson?.title}
            </h1>
          </div>

          {/* CURATED YOUTUBE VIDEO LECTURE */}
          {currentLesson?.videoUrl && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Play className="w-3.5 h-3.5 text-primary" /> Educational Video Lecture
                </span>
                <button
                  onClick={() => setShowVideo(!showVideo)}
                  className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showVideo ? "Hide Video" : "Show Video"}
                </button>
              </div>

              {showVideo && (
                <div className="rounded-2xl overflow-hidden border border-border shadow-sm bg-black/90 aspect-video relative">
                  <iframe
                    src={currentLesson.videoUrl}
                    title={currentLesson.title}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}
            </div>
          )}

          {/* VISUAL PROCESS FLOW / ARCHITECTURE DIAGRAM */}
          <div className="p-5 bg-gradient-to-r from-primary/5 via-muted/40 to-primary/5 rounded-2xl border border-border space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-primary">
              <Compass className="w-4 h-4" />
              <span>Operational Flow & Architecture Schematic</span>
            </div>
            <div className="p-3.5 bg-background rounded-xl border border-border/80 font-mono text-xs text-foreground tracking-wide flex items-center justify-center text-center shadow-xs">
              {currentLesson?.diagram ||
                "Input Context ---> Policy Verification Engine ---> Scalable Enforcement Output"}
            </div>
          </div>

          {/* MAIN EDUCATIONAL SUMMARY & READING CONTENT */}
          <div className="space-y-4 text-xs sm:text-sm text-foreground/90 leading-relaxed">
            <div className="p-5 bg-card rounded-2xl border border-border space-y-3">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" /> Key Principles & Conceptual Synthesis
              </h3>
              <p className="text-muted-foreground leading-relaxed text-xs sm:text-sm">
                {currentLesson?.articleContent ||
                  "Comprehensive structured training on core fundamentals. Understanding foundational architecture and practical operational workflows is essential for high-velocity teams."}
              </p>

              <div className="pt-3 border-t border-border/70 space-y-2">
                <h4 className="font-semibold text-xs text-foreground uppercase tracking-wider">
                  Operational Guidelines & Best Practices:
                </h4>
                <ul className="list-disc pl-5 space-y-1.5 text-xs text-muted-foreground">
                  <li>Ensure all access scopes and operational policies are continuously verified.</li>
                  <li>Implement proactive monitoring and automated sanity checks at every transition gate.</li>
                  <li>Regularly evaluate team comprehension through open-ended reflection scenarios.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* MID-LESSON OPEN-ENDED REFLECTION & RELEVANCE EVALUATOR */}
          <div className="p-6 rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
                  <Lightbulb className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-foreground">
                  Knowledge Reflection & AI Coaching Checkpoint
                </h3>
              </div>
              <Badge variant="outline" className="text-[10px]">
                Relevance Graded
              </Badge>
            </div>

            <p className="text-xs font-semibold text-foreground">
              {currentLesson?.reflectionQuestion ||
                "In your own words, what is the most critical operational takeaway from this lesson?"}
            </p>

            <form onSubmit={handleEvaluateReflection} className="space-y-3">
              <Textarea
                placeholder="Type your reflection or practical solution here (e.g. How you would apply this in a production workflow)..."
                value={reflectionInput}
                onChange={(e) => setReflectionInput(e.target.value)}
                className="text-xs min-h-[90px] bg-background"
              />

              <div className="flex justify-between items-center">
                <span className="text-[11px] text-muted-foreground">
                  AI will evaluate relevance and provide coaching notes without failing you.
                </span>

                <Button
                  type="submit"
                  disabled={isEvaluatingReflection || !reflectionInput.trim()}
                  size="sm"
                  className="text-xs h-8 gap-1.5 font-semibold"
                >
                  {isEvaluatingReflection ? (
                    <>
                      <RefreshCw className="w-3 h-3 animate-spin" /> Evaluating...
                    </>
                  ) : (
                    <>
                      <Send className="w-3 h-3" /> Evaluate My Reflection
                    </>
                  )}
                </Button>
              </div>
            </form>

            {/* AI Coaching Feedback Card */}
            {reflectionResult && (
              <div className="p-4 bg-background rounded-xl border border-border space-y-2 mt-3 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <Badge
                    variant="secondary"
                    className="text-xs bg-success/15 text-success border-success/30 font-bold"
                  >
                    Relevance Score: {reflectionResult.relevanceScore}% ✨
                  </Badge>
                  <span className="text-[11px] text-muted-foreground">
                    Strengths: <strong className="text-foreground">{reflectionResult.keyStrength}</strong>
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed pt-1">
                  💡 <strong className="text-foreground">AI Feedback:</strong> {reflectionResult.feedback}
                </p>
              </div>
            )}
          </div>

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
                <ChevronLeft className="h-4 w-4" /> Previous Lesson
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNext}
                disabled={currentLessonIndex === flatLessons.length - 1}
                className="gap-1.5 text-xs h-9"
              >
                Next Lesson <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  handleQuizReset();
                  setQuizOpen(true);
                }}
                className="gap-2 text-xs h-9 font-semibold bg-primary/10 text-primary hover:bg-primary/20"
              >
                <Sparkles className="h-4 w-4 text-primary" /> Take Final Capstone Exam
              </Button>

              <Button
                size="sm"
                onClick={handleMarkComplete}
                className={cn(
                  "gap-2 text-xs h-9 font-semibold",
                  isCompleted ? "bg-success text-white hover:bg-success/90" : "bg-primary"
                )}
              >
                <Check className="h-4 w-4" />
                {isCompleted ? "Completed ✓" : "Mark as Complete"}
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
              <span>Course Progress</span>
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
                            <BookOpen
                              className={cn(
                                "h-4 w-4 shrink-0",
                                isCurrent ? "text-primary-foreground" : "text-muted-foreground"
                              )}
                            />
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

      {/* FLASHCARDS STUDY MODAL */}
      <Dialog open={flashcardsOpen} onOpenChange={setFlashcardsOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" />
                <DialogTitle className="text-base font-bold">Revision Flashcards</DialogTitle>
              </div>
              <Badge variant="secondary" className="text-xs">
                Card {flashcardIndex + 1} of {activeFlashcards.length}
              </Badge>
            </div>
            <DialogDescription className="text-xs">
              Click the card to flip between Question and Conceptual Insight.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 pt-2 flex flex-col items-center">
            <div
              onClick={() => setIsCardFlipped(!isCardFlipped)}
              className="w-full min-h-[200px] p-8 rounded-2xl border-2 border-border/80 bg-gradient-to-br from-card to-muted/40 shadow-xs cursor-pointer flex flex-col items-center justify-center text-center hover:border-primary/50 transition-all select-none relative group"
            >
              <Badge variant="outline" className="absolute top-4 left-4 text-[10px]">
                {isCardFlipped ? "Answer / Definition" : "Prompt / Concept"}
              </Badge>

              <p className="text-sm font-semibold text-foreground leading-relaxed max-w-md">
                {isCardFlipped ? activeFlashcards[flashcardIndex]?.back : activeFlashcards[flashcardIndex]?.front}
              </p>

              <span className="text-[10px] text-muted-foreground absolute bottom-4 group-hover:text-primary transition-colors">
                Click card to flip ↻
              </span>
            </div>

            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsCardFlipped(false);
                  setFlashcardIndex((prev) => Math.max(0, prev - 1));
                }}
                disabled={flashcardIndex === 0}
                className="text-xs h-8 gap-1"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsCardFlipped(false);
                  setFlashcardIndex((prev) => Math.min(activeFlashcards.length - 1, prev + 1));
                }}
                disabled={flashcardIndex === activeFlashcards.length - 1}
                className="text-xs h-8 gap-1"
              >
                Next <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* AI ASSESSMENT QUIZ MODAL */}
      <Dialog open={quizOpen} onOpenChange={setQuizOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="secondary" className="text-[10px] gap-1 bg-primary/10 text-primary">
                <Sparkles className="w-3 h-3 text-primary" /> AI Assessment
              </Badge>
              <Badge variant="outline" className="text-[10px]">
                Passing Score: 60%
              </Badge>
            </div>
            <DialogTitle className="text-lg font-bold">
              {course.quiz?.title || "Final Capstone Certification Exam"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 pt-3">
            {course.quiz?.questions?.map((q, qIdx) => (
              <div key={q.id || qIdx} className="p-4 rounded-xl border border-border/80 bg-muted/20 space-y-3">
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
                    variant={quizScore >= 60 ? "secondary" : "destructive"}
                    className={cn(
                      "text-xs px-2.5 py-1",
                      quizScore >= 60 && "bg-success/15 text-success border-success/30"
                    )}
                  >
                    Your Score: {quizScore}% {quizScore >= 60 ? "🎉 Passed & Certified" : "⚠️ Try Again (Need 60%)"}
                  </Badge>
                  {quizScore >= 60 ? (
                    <Link href="/certificates">
                      <Button size="sm" className="text-xs h-8 gap-1.5 font-semibold bg-success hover:bg-success/90 text-white">
                        <Award className="h-3.5 w-3.5" /> View Certificate
                      </Button>
                    </Link>
                  ) : (
                    <Button variant="outline" size="sm" onClick={handleQuizReset} className="text-xs h-8">
                      <RefreshCw className="h-3 w-3 mr-1" /> Retake Exam
                    </Button>
                  )}
                </div>
              ) : (
                <span className="text-xs text-muted-foreground">
                  Score 60% or higher to pass and unlock your verified certificate.
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
                    Submit Exam Answers
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
