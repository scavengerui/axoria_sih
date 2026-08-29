"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser, useOrganization } from "@clerk/nextjs";
import {
  Search,
  Clock,
  Users,
  Star,
  BookOpen,
  Sparkles,
  Plus,
  Compass,
  ArrowRight,
  Layers,
  HelpCircle,
  FileText,
  RefreshCw,
  Check,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDuration } from "@/lib/utils";
import { getCourses, generatePersonalAICourse } from "@/lib/actions/course";
import { toast } from "sonner";

const QUICK_TOPICS = [
  "Docker Container Security & Zero-Trust",
  "React Server Components & Next.js Architecture",
  "Cloud Native Microservices with Kubernetes",
  "Executive Cross-Functional Leadership",
  "AI Prompt Engineering & LLM Guardrails",
];

function CourseCard({ course }: { course: any }) {
  const targetId = course._id;

  return (
    <Link href={`/catalog/${targetId}`} className="group block">
      <Card className="h-full overflow-hidden border border-border hover:shadow-md transition-all">
        {/* Thumbnail Banner */}
        <div className="h-36 bg-muted/40 flex items-center justify-center border-b border-border/50">
          <BookOpen className="h-10 w-10 text-muted-foreground/30 group-hover:scale-105 transition-transform" />
        </div>

        <CardContent className="p-5 space-y-3">
          {/* Tags & Type */}
          <div className="flex flex-wrap items-center gap-1.5">
            {course.mandatory && (
              <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                Mandatory
              </Badge>
            )}
            {course.competencyTags?.slice(0, 2).map((tag: string) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-[10px] px-1.5 py-0 text-muted-foreground"
              >
                {tag}
              </Badge>
            ))}
          </div>

          {/* Title */}
          <h3 className="font-semibold text-sm group-hover:text-primary transition-colors line-clamp-2 min-h-[2.5rem]">
            {course.title}
          </h3>

          {/* Description */}
          <p className="text-xs text-muted-foreground line-clamp-2">
            {course.description}
          </p>

          {/* Meta stats */}
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/50">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDuration(course.estimatedDuration || 60)}
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {course.enrolledCount || 1} Enrolled
              </span>
            </div>
            <span className="flex items-center gap-1 font-medium text-foreground">
              <Star className="h-3 w-3 fill-warning text-warning" />
              {course.rating || "4.8"}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function CatalogPage() {
  const router = useRouter();
  const { user } = useUser();
  const { organization } = useOrganization();

  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTag, setFilterTag] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [isDbLoaded, setIsDbLoaded] = useState(false);

  // Personal AI Course Creator State
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [customTopic, setCustomTopic] = useState("");
  const [difficulty, setDifficulty] = useState<"Beginner" | "Intermediate" | "Advanced">("Intermediate");
  const [includeQuiz, setIncludeQuiz] = useState(true);
  const [includeFlashcards, setIncludeFlashcards] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    async function loadCourses() {
      try {
        const res = await getCourses();
        if (res.success && res.courses) {
          const dbCourses = res.courses.map((c: any) => {
            const isAgile = c.title.toLowerCase().includes("agile");
            const isPrivacy = c.title.toLowerCase().includes("privacy");
            const instructor = isAgile
              ? "Prof. Sunita Deshmukh"
              : isPrivacy
                ? "Dr. Ananya Sengupta"
                : c.instructor || "Dr. Raghavan Sundaram (CISO)";

            return {
              ...c,
              _id: c._id,
              instructor,
              rating: isAgile ? 4.8 : isPrivacy ? 4.7 : 4.9,
              enrolledCount: c.enrolledCount || 1,
            };
          });

          setCourses(dbCourses);
          setIsDbLoaded(true);
        }
      } catch (err) {
        console.error("Failed to fetch catalog courses:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCourses();
  }, []);

  const handleGenerateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTopic.trim() || isGenerating) return;
    if (!user?.id) {
      toast.error("Please sign in to generate and save personal courses.");
      return;
    }

    setIsGenerating(true);
    toast.info(`Architecting custom curriculum for "${customTopic}" with Groq AI...`);

    try {
      const res = await generatePersonalAICourse({
        topic: customTopic,
        userId: user.id,
        orgId: organization?.id || "axoria_enterprise",
        preferences: {
          includeQuiz,
          includeFlashcards,
          difficulty,
        },
      });

      if (res.success && res.courseId) {
        toast.success(`🎉 Course "${res.courseTitle}" created and added to My Learning!`);
        setIsCreatorOpen(false);
        setCustomTopic("");
        router.push(`/learn/${res.courseId}`);
      } else {
        toast.error(res.error || "Failed to generate personal course.");
      }
    } catch (err: any) {
      toast.error("Generation error: " + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Filtered courses
  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      searchQuery === "" ||
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTag =
      filterTag === "all" ||
      course.competencyTags?.some(
        (t: string) => t.toLowerCase() === filterTag.toLowerCase()
      );

    const matchesType =
      filterType === "all" ||
      (filterType === "mandatory" && course.mandatory) ||
      (filterType === "optional" && !course.mandatory);

    return matchesSearch && matchesTag && matchesType;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Course Catalog</h1>
            {isDbLoaded && (
              <Badge variant="secondary" className="gap-1 text-xs bg-primary/10 text-primary">
                <Sparkles className="h-3 w-3 text-primary" /> Live MongoDB
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Browse published courses or generate your own personalized AI learning track on any topic.
          </p>
        </div>

        {/* Action Button: AI Course Creator */}
        <Button
          onClick={() => setIsCreatorOpen(true)}
          className="gap-2 text-xs h-9 font-semibold shadow-sm"
        >
          <Sparkles className="h-4 w-4" /> AI Course Generator (Any Topic)
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courses or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs h-9 bg-background"
          />
        </div>

        <div className="flex gap-2">
          <Select value={filterTag} onValueChange={(val) => setFilterTag(val || "all")}>
            <SelectTrigger className="w-[140px] text-xs h-9">
              <SelectValue placeholder="All Topics" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Topics</SelectItem>
              <SelectItem value="cybersecurity">Cybersecurity</SelectItem>
              <SelectItem value="compliance">Compliance</SelectItem>
              <SelectItem value="leadership">Leadership</SelectItem>
              <SelectItem value="agile">Agile</SelectItem>
              <SelectItem value="data privacy">Data Privacy</SelectItem>
              <SelectItem value="management">Management</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterType} onValueChange={(val) => setFilterType(val || "all")}>
            <SelectTrigger className="w-[130px] text-xs h-9">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="mandatory">Mandatory</SelectItem>
              <SelectItem value="optional">Optional</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Showing {filteredCourses.length} of {courses.length} courses
        </span>
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-36 w-full" />
              <div className="p-5 space-y-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </div>
            </Card>
          ))}
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border rounded-xl border-dashed bg-muted/10">
          <BookOpen className="h-10 w-10 text-muted-foreground mb-3 opacity-50" />
          <h3 className="text-base font-semibold">No courses found</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mb-4">
            Looking for something specific? Use our AI Course Creator to generate a personalized course on this topic!
          </p>
          <Button
            size="sm"
            onClick={() => {
              setCustomTopic(searchQuery);
              setIsCreatorOpen(true);
            }}
            className="text-xs h-8 gap-1.5"
          >
            <Sparkles className="h-3.5 w-3.5" /> Generate Course on &ldquo;{searchQuery || "This Topic"}&rdquo;
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <CourseCard key={course._id} course={course} />
          ))}
        </div>
      )}

      {/* AI PERSONAL COURSE GENERATOR MODAL */}
      <Dialog open={isCreatorOpen} onOpenChange={setIsCreatorOpen}>
        <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
                <Sparkles className="w-4 h-4" />
              </div>
              <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary font-semibold">
                Instant AI Curriculum Architect
              </Badge>
            </div>
            <DialogTitle className="text-lg font-bold">Search & Generate Personal AI Course</DialogTitle>
            <DialogDescription className="text-xs">
              Type any topic or technology. Axoria AI will synthesize complete modules, video lectures, reading notes, and interactive quizzes synced directly to your MongoDB account.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleGenerateCourse} className="space-y-5 pt-2">
            {/* Topic Input */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground">
                What topic do you want to learn?
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="e.g. Next.js 15 Server Actions, Quantum Computing, Docker Security..."
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  className="pl-9 text-xs h-9"
                  autoFocus
                />
              </div>
            </div>

            {/* Quick Suggestions */}
            <div className="space-y-1.5">
              <span className="text-[11px] text-muted-foreground font-medium">
                ⚡ Quick Inspiration Topics:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_TOPICS.map((topic) => (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => setCustomTopic(topic)}
                    className="text-[11px] px-2.5 py-1 rounded-lg border border-border bg-muted/30 hover:bg-primary/10 hover:text-primary hover:border-primary/40 transition-colors text-left"
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>

            {/* Artifact Selection */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground">
                Include in Your Course:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setIncludeQuiz(!includeQuiz)}
                  className={`p-3 rounded-xl border text-xs flex items-center justify-between transition-all ${
                    includeQuiz
                      ? "border-primary bg-primary/10 text-primary font-semibold"
                      : "border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4" /> AI Practice Quiz
                  </span>
                  {includeQuiz && <Check className="w-3.5 h-3.5" />}
                </button>

                <button
                  type="button"
                  onClick={() => setIncludeFlashcards(!includeFlashcards)}
                  className={`p-3 rounded-xl border text-xs flex items-center justify-between transition-all ${
                    includeFlashcards
                      ? "border-primary bg-primary/10 text-primary font-semibold"
                      : "border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Layers className="w-4 h-4" /> Flashcards & Notes
                  </span>
                  {includeFlashcards && <Check className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Difficulty Level */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground">
                Target Difficulty Level:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["Beginner", "Intermediate", "Advanced"] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setDifficulty(lvl)}
                    className={`py-2 rounded-lg border text-xs transition-all ${
                      difficulty === lvl
                        ? "border-primary bg-primary text-primary-foreground font-semibold"
                        : "border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Actions */}
            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsCreatorOpen(false)}
                className="text-xs h-9"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isGenerating || !customTopic.trim()}
                className="text-xs h-9 font-semibold gap-2"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Synthesizing with Groq LPU...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" /> Generate & Start Learning <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
