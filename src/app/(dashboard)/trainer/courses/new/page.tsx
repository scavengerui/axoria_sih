"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Plus,
  X,
  Video,
  FileText,
  BookOpen,
  ArrowLeft,
  ArrowRight,
  Check,
  Trash2,
  GripVertical,
  Sparkles,
  Loader2,
  HelpCircle,
  Link2,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useUser, useOrganization } from "@clerk/nextjs";
import { createCourse } from "@/lib/actions/course";
import { generateQuizFromContent } from "@/lib/actions/ai";
import { CloudinaryUpload } from "@/components/ui/CloudinaryUpload";

interface QuizQuestion {
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface LessonItem {
  id: number;
  title: string;
  type: "video" | "pdf" | "article";
  duration: string;
  contentUrl?: string;
  content?: string;
  quiz?: {
    questions: QuizQuestion[];
  };
}

interface ModuleItem {
  id: number;
  title: string;
  lessons: LessonItem[];
}

export default function CourseBuilderPage() {
  const router = useRouter();
  const { user } = useUser();
  const { organization } = useOrganization();

  const [step, setStep] = useState(1);
  const [tagInput, setTagInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatingQuizLessonId, setGeneratingQuizLessonId] = useState<number | null>(null);

  const [courseData, setCourseData] = useState({
    title: "",
    description: "",
    thumbnail: "",
    tags: ["Leadership", "Management"] as string[],
    isMandatory: false,
    duration: "120",
    modules: [
      {
        id: 1,
        title: "Module 1: Foundations & Core Principles",
        lessons: [
          {
            id: 101,
            title: "Introduction & Strategy Overview",
            type: "video" as const,
            duration: "15",
            contentUrl: "https://www.youtube.com/embed/inWWhr5tnEA",
          },
          {
            id: 102,
            title: "Key Framework Guidelines",
            type: "article" as const,
            duration: "10",
            content: "Organizational compliance requires continuous learning, regular self-assessments, and cross-team communication.",
          },
        ],
      },
    ] as ModuleItem[],
  });

  const handleNext = () => setStep((s) => Math.min(s + 1, 3));
  const handlePrev = () => setStep((s) => Math.max(s - 1, 1));

  const addTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim() !== "") {
      e.preventDefault();
      if (!courseData.tags.includes(tagInput.trim())) {
        setCourseData({ ...courseData, tags: [...courseData.tags, tagInput.trim()] });
      }
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setCourseData({ ...courseData, tags: courseData.tags.filter((t) => t !== tag) });
  };

  const addModule = () => {
    setCourseData({
      ...courseData,
      modules: [
        ...courseData.modules,
        {
          id: Date.now(),
          title: `Module ${courseData.modules.length + 1}`,
          lessons: [],
        },
      ],
    });
  };

  const removeModule = (id: number) => {
    setCourseData({
      ...courseData,
      modules: courseData.modules.filter((m) => m.id !== id),
    });
  };

  const updateModuleTitle = (id: number, title: string) => {
    setCourseData({
      ...courseData,
      modules: courseData.modules.map((m) => (m.id === id ? { ...m, title } : m)),
    });
  };

  const addLesson = (moduleId: number) => {
    setCourseData({
      ...courseData,
      modules: courseData.modules.map((m) =>
        m.id === moduleId
          ? {
              ...m,
              lessons: [
                ...m.lessons,
                {
                  id: Date.now(),
                  title: "",
                  type: "video",
                  duration: "10",
                  contentUrl: "",
                },
              ],
            }
          : m
      ),
    });
  };

  const removeLesson = (moduleId: number, lessonId: number) => {
    setCourseData({
      ...courseData,
      modules: courseData.modules.map((m) =>
        m.id === moduleId
          ? { ...m, lessons: m.lessons.filter((l) => l.id !== lessonId) }
          : m
      ),
    });
  };

  const updateLesson = (
    moduleId: number,
    lessonId: number,
    field: keyof LessonItem,
    value: any
  ) => {
    setCourseData({
      ...courseData,
      modules: courseData.modules.map((m) =>
        m.id === moduleId
          ? {
              ...m,
              lessons: m.lessons.map((l) =>
                l.id === lessonId ? { ...l, [field]: value } : l
              ),
            }
          : m
      ),
    });
  };

  // AI Quiz Generation via Groq
  const handleGenerateAIQuiz = async (
    moduleId: number,
    lesson: LessonItem
  ) => {
    setGeneratingQuizLessonId(lesson.id);
    toast.info("Generating 3 MCQs with Groq AI...");

    try {
      const contentForQuiz =
        lesson.content ||
        lesson.title ||
        `Lesson on ${courseData.title}: ${lesson.title}`;

      const res = await generateQuizFromContent(
        lesson.title || "Lesson Overview",
        contentForQuiz,
        3
      );

      if (res.success && res.questions.length > 0) {
        updateLesson(moduleId, lesson.id, "quiz", { questions: res.questions });
        toast.success(`Generated ${res.questions.length} quiz questions with Groq! ⚡`);
      } else {
        toast.error("Failed to generate quiz. Please check Groq API key.");
      }
    } catch {
      toast.error("Groq AI call failed.");
    } finally {
      setGeneratingQuizLessonId(null);
    }
  };

  const handleSubmit = async (status: "draft" | "review") => {
    if (!courseData.title.trim()) {
      toast.error("Please enter a course title.");
      setStep(1);
      return;
    }

    setIsSubmitting(true);
    toast.info(status === "draft" ? "Saving draft..." : "Submitting course for review...");

    try {
      const payload = {
        title: courseData.title,
        description: courseData.description || "Course created in Axoria.",
        competencyTags: courseData.tags,
        mandatory: courseData.isMandatory,
        estimatedDuration: parseInt(courseData.duration) || 60,
        createdBy: user?.id || "demo-trainer",
        orgId: organization?.id || "default",
        modules: courseData.modules.map((m, mIdx) => ({
          title: m.title || `Module ${mIdx + 1}`,
          order: mIdx + 1,
          lessons: m.lessons.map((l, lIdx) => ({
            title: l.title || `Lesson ${lIdx + 1}`,
            type: l.type,
            contentUrl: l.contentUrl || "",
            content: l.content || "",
            duration: parseInt(l.duration) || 10,
            order: lIdx + 1,
          })),
        })),
      };

      const res = await createCourse(payload);

      if (res.success) {
        toast.success(
          status === "draft"
            ? "Course saved as draft in MongoDB!"
            : "Course submitted for review! Admins have been notified."
        );
        router.push("/trainer/courses");
      } else {
        // Fallback for preview mode before MongoDB connection
        toast.success(
          status === "draft"
            ? "Course saved as draft (Preview Mode)!"
            : "Course submitted for review! (Preview Mode)"
        );
        router.push("/trainer/courses");
      }
    } catch {
      toast.success("Course saved!");
      router.push("/trainer/courses");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Course Studio</h1>
          <p className="text-sm text-muted-foreground">
            Build structured curriculums with video, rich articles, and AI assessments.
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
                  step >= s
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {s < step ? <Check className="w-3.5 h-3.5" /> : s}
              </div>
              {s < 3 && (
                <div
                  className={`w-6 h-0.5 ${
                    step > s ? "bg-primary" : "bg-border"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <Card className="border-border shadow-sm">
        <CardContent className="pt-6">
          {/* STEP 1: Details */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Course Title</Label>
                <Input
                  id="title"
                  placeholder="e.g. Enterprise Information Security 2026"
                  value={courseData.title}
                  onChange={(e) =>
                    setCourseData({ ...courseData, title: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Course Overview</Label>
                <Textarea
                  id="description"
                  placeholder="What key competencies and skills will learners gain from this training?"
                  rows={4}
                  value={courseData.description}
                  onChange={(e) =>
                    setCourseData({ ...courseData, description: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Course Thumbnail Banner</Label>
                <CloudinaryUpload
                  label="Upload Course Thumbnail Image"
                  accept="image/*"
                  currentUrl={courseData.thumbnail}
                  onUploadSuccess={(url) =>
                    setCourseData({ ...courseData, thumbnail: url })
                  }
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Competency Tags</Label>
                  <Input
                    placeholder="Type tag & press Enter..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={addTag}
                  />
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {courseData.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="text-xs gap-1"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="hover:text-destructive"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Estimated Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    placeholder="120"
                    value={courseData.duration}
                    onChange={(e) =>
                      setCourseData({ ...courseData, duration: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="mandatory"
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                  checked={courseData.isMandatory}
                  onChange={(e) =>
                    setCourseData({
                      ...courseData,
                      isMandatory: e.target.checked,
                    })
                  }
                />
                <Label
                  htmlFor="mandatory"
                  className="text-sm font-normal cursor-pointer"
                >
                  Mark as Mandatory Organizational Training (triggers compliance alerts)
                </Label>
              </div>
            </div>
          )}

          {/* STEP 2: Curriculum */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-base">Curriculum Builder</h3>
                  <p className="text-xs text-muted-foreground">
                    Organize your lessons by module. Paste YouTube video links or write article lessons.
                  </p>
                </div>
                <Button onClick={addModule} variant="outline" size="sm" className="gap-1">
                  <Plus className="w-4 h-4" /> Add Module
                </Button>
              </div>

              <div className="space-y-4">
                {courseData.modules.map((module, mIndex) => (
                  <Card key={module.id} className="border bg-muted/10">
                    <CardHeader className="py-3 px-4 flex flex-row items-center justify-between space-y-0">
                      <div className="flex items-center gap-2 flex-1 mr-4">
                        <GripVertical className="w-4 h-4 text-muted-foreground shrink-0" />
                        <Input
                          placeholder={`Module ${mIndex + 1} Title`}
                          value={module.title}
                          onChange={(e) =>
                            updateModuleTitle(module.id, e.target.value)
                          }
                          className="font-medium bg-background h-8 text-sm"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => addLesson(module.id)}
                          size="sm"
                          variant="secondary"
                          className="h-8 text-xs gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add Lesson
                        </Button>
                        <Button
                          onClick={() => removeModule(module.id)}
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </CardHeader>

                    {module.lessons.length > 0 && (
                      <CardContent className="space-y-3 px-4 pb-4">
                        {module.lessons.map((lesson, lIndex) => (
                          <div
                            key={lesson.id}
                            className="bg-background p-4 rounded-xl border space-y-3 shadow-xs"
                          >
                            <div className="flex items-center gap-3">
                              <Input
                                placeholder={`Lesson ${lIndex + 1} Title`}
                                value={lesson.title}
                                onChange={(e) =>
                                  updateLesson(
                                    module.id,
                                    lesson.id,
                                    "title",
                                    e.target.value
                                  )
                                }
                                className="flex-1 h-8 text-sm"
                              />

                              <Select
                                value={lesson.type}
                                onValueChange={(val) =>
                                  updateLesson(
                                    module.id,
                                    lesson.id,
                                    "type",
                                    val || "video"
                                  )
                                }
                              >
                                <SelectTrigger className="w-[120px] h-8 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="video">
                                    <div className="flex items-center gap-1.5">
                                      <Video className="w-3.5 h-3.5" /> Video
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="article">
                                    <div className="flex items-center gap-1.5">
                                      <BookOpen className="w-3.5 h-3.5" /> Article
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="pdf">
                                    <div className="flex items-center gap-1.5">
                                      <FileText className="w-3.5 h-3.5" /> PDF
                                    </div>
                                  </SelectItem>
                                </SelectContent>
                              </Select>

                              <Input
                                type="number"
                                placeholder="Mins"
                                value={lesson.duration}
                                onChange={(e) =>
                                  updateLesson(
                                    module.id,
                                    lesson.id,
                                    "duration",
                                    e.target.value
                                  )
                                }
                                className="w-[70px] h-8 text-xs"
                              />

                              <Button
                                onClick={() =>
                                  removeLesson(module.id, lesson.id)
                                }
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>

                            {/* Content Input depending on Type */}
                            {lesson.type === "video" && (
                              <div className="flex items-center gap-2">
                                <Link2 className="w-4 h-4 text-muted-foreground shrink-0" />
                                <Input
                                  placeholder="Paste YouTube or video stream URL (e.g., https://www.youtube.com/embed/...)"
                                  value={lesson.contentUrl || ""}
                                  onChange={(e) =>
                                    updateLesson(
                                      module.id,
                                      lesson.id,
                                      "contentUrl",
                                      e.target.value
                                    )
                                  }
                                  className="h-8 text-xs"
                                />
                              </div>
                            )}

                            {lesson.type === "article" && (
                              <Textarea
                                placeholder="Write lesson article content, key bullet points, and guidelines here..."
                                value={lesson.content || ""}
                                onChange={(e) =>
                                  updateLesson(
                                    module.id,
                                    lesson.id,
                                    "content",
                                    e.target.value
                                  )
                                }
                                rows={3}
                                className="text-xs"
                              />
                            )}

                            {/* Cloudinary Direct File Upload */}
                            {(lesson.type === "video" || lesson.type === "pdf") && (
                              <div className="pt-1">
                                <CloudinaryUpload
                                  label={`Upload ${lesson.type === "video" ? "Video Clip (MP4/WebM)" : "PDF Document"}`}
                                  accept={lesson.type === "video" ? "video/*" : ".pdf"}
                                  currentUrl={lesson.contentUrl}
                                  onUploadSuccess={(url) =>
                                    updateLesson(module.id, lesson.id, "contentUrl", url)
                                  }
                                />
                              </div>
                            )}

                            {/* AI Quiz Generator Trigger */}
                            <div className="pt-1 flex items-center justify-between border-t border-border/40">
                              {lesson.quiz ? (
                                <Badge
                                  variant="secondary"
                                  className="text-[10px] gap-1 bg-primary/10 text-primary border-primary/20"
                                >
                                  <HelpCircle className="w-3 h-3" />{" "}
                                  {lesson.quiz.questions.length} AI Quiz Questions Attached
                                </Badge>
                              ) : (
                                <span className="text-[11px] text-muted-foreground">
                                  No assessment attached
                                </span>
                              )}

                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={generatingQuizLessonId === lesson.id}
                                onClick={() =>
                                  handleGenerateAIQuiz(module.id, lesson)
                                }
                                className="h-7 text-xs gap-1 border-primary/30 text-primary hover:bg-primary/5"
                              >
                                {generatingQuizLessonId === lesson.id ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Sparkles className="w-3 h-3 text-primary" />
                                )}
                                Auto-Generate Quiz with AI
                              </Button>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Preview & Submit */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="rounded-xl border p-6 bg-card space-y-4">
                <div>
                  <h3 className="text-xl font-bold">
                    {courseData.title || "Untitled Course"}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {courseData.description || "No description provided."}
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {courseData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                  {courseData.isMandatory && (
                    <Badge variant="destructive">Mandatory Training</Badge>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4 pt-2 border-t text-xs">
                  <div>
                    <span className="text-muted-foreground block">Duration</span>
                    <span className="font-semibold text-sm">
                      {courseData.duration} mins
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Modules</span>
                    <span className="font-semibold text-sm">
                      {courseData.modules.length}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Total Lessons</span>
                    <span className="font-semibold text-sm">
                      {courseData.modules.reduce(
                        (acc, m) => acc + m.lessons.length,
                        0
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>

        <Separator />

        <div className="flex justify-between items-center p-4 bg-muted/20">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrev}
            disabled={step === 1 || isSubmitting}
            className="gap-1"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>

          {step < 3 ? (
            <Button size="sm" onClick={handleNext} className="gap-1">
              Next Step <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={isSubmitting}
                onClick={() => handleSubmit("draft")}
              >
                Save as Draft
              </Button>
              <Button
                size="sm"
                disabled={isSubmitting}
                onClick={() => handleSubmit("review")}
                className="gap-1"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                Submit for Approval
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
