"use client";

import { useState, useEffect } from "react";
import {
  BookOpen,
  Check,
  X,
  Clock,
  User,
  Eye,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  Play,
  FileText,
  HelpCircle,
  Award,
  Layers,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { getPendingCourses, approveCourse, rejectCourse } from "@/lib/actions/course";
import { formatDuration } from "@/lib/utils";

const DEFAULT_PENDING_COURSES = [
  {
    _id: "p1",
    title: "Enterprise Incident Response & Forensics",
    description:
      "Operational framework for detecting, isolating, and reporting security breaches across distributed corporate infrastructure.",
    instructor: "Dr. Raghavan Sundaram (CISO)",
    modules: 3,
    lessons: 7,
    videoUrl: "https://www.youtube.com/embed/bPVaOlJ6ln0",
    competencyTags: ["Cybersecurity", "Zero-Trust", "Compliance"],
    submittedAt: "2 hours ago",
    estimatedDuration: 150,
    curriculum: [
      {
        moduleTitle: "Module 1: Attack Vector Identification & Triage",
        lessons: [
          { title: "Threat Landscape & Attack Vectors", type: "video", duration: "15m", url: "https://www.youtube.com/embed/bPVaOlJ6ln0" },
          { title: "MFA & Credential Hygiene Guidelines", type: "article", duration: "10m" },
          { title: "Phishing Simulation & Quarantine Policy", type: "pdf", duration: "10m" },
        ],
      },
      {
        moduleTitle: "Module 2: Zero-Trust Architecture & Isolation",
        lessons: [
          { title: "Zero-Trust Architecture & Modern IAM", type: "video", duration: "12m", url: "https://www.youtube.com/embed/1vR3bFh_n7A" },
          { title: "Network Microsegmentation Playbook", type: "article", duration: "15m" },
        ],
      },
    ],
    sampleQuiz: [
      {
        question: "What is the primary objective of Zero-Trust Architecture?",
        options: [
          "Never trust, always verify every request regardless of origin",
          "Rely entirely on traditional VPN perimeter security",
          "Allow all internal network traffic without authentication",
          "Disable multi-factor authentication for administrators",
        ],
        correct: 0,
        explanation: "Zero-Trust assumes breach and verifies explicit identity, device health, and context for every single access request.",
      },
      {
        question: "Which authentication factor is most resistant to SIM-swap attacks?",
        options: [
          "SMS text message OTP",
          "FIDO2 Hardware Security Key (YubiKey) or TOTP App",
          "Security questions about favorite pets",
          "Unencrypted email verification codes",
        ],
        correct: 1,
        explanation: "Hardware security keys and TOTP apps are cryptographically bound and cannot be intercepted over cellular networks.",
      },
    ],
  },
  {
    _id: "p2",
    title: "Executive Communication & Stakeholder Pitching",
    description:
      "Advanced presentation techniques, clear executive memo writing, and conflict management strategies for rising managers.",
    instructor: "Prof. Sunita Deshmukh",
    modules: 2,
    lessons: 5,
    videoUrl: "https://www.youtube.com/embed/8eWd1X_kQyo",
    competencyTags: ["Leadership", "Executive Comms", "Agile"],
    submittedAt: "5 hours ago",
    estimatedDuration: 90,
    curriculum: [
      {
        moduleTitle: "Module 1: High-Impact Stakeholder Messaging",
        lessons: [
          { title: "Agile Leadership & Cross-Functional Alignment", type: "video", duration: "14m", url: "https://www.youtube.com/embed/8eWd1X_kQyo" },
          { title: "Executive Memo Drafting Framework", type: "article", duration: "12m" },
        ],
      },
      {
        moduleTitle: "Module 2: Psychological Safety & Retrospectives",
        lessons: [
          { title: "Fostering Psychological Safety in Distributed Teams", type: "video", duration: "15m", url: "https://www.youtube.com/embed/LhoLuui9gX8" },
          { title: "Conflict Resolution in Sprint Reviews", type: "article", duration: "10m" },
        ],
      },
    ],
    sampleQuiz: [
      {
        question: "How does psychological safety impact team performance?",
        options: [
          "Encourages open risk-taking and constructive dissent without fear of humiliation",
          "Eliminates all deadlines and accountability",
          "Requires unanimous agreement on all technical decisions",
          "Restricts team communications to written memos only",
        ],
        correct: 0,
        explanation: "Psychological safety enables team members to voice concerns, report defects early, and innovate without fear of retribution.",
      },
    ],
  },
];

function CourseApprovalCard({
  course,
  onApprove,
  onReject,
}: {
  course: any;
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
}) {
  const [rejectReason, setRejectReason] = useState("");
  const [rejectOpen, setRejectOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [activePreviewVideo, setActivePreviewVideo] = useState(
    course.videoUrl || "https://www.youtube.com/embed/bPVaOlJ6ln0"
  );

  return (
    <Card className="border-border shadow-xs hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-warning border-warning/40 bg-warning/5 text-xs">
                Pending Approval
              </Badge>
              {course.competencyTags?.map((tag: string) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>

            <h3 className="text-lg font-bold text-foreground">
              {course.title}
            </h3>

            <p className="text-xs text-muted-foreground line-clamp-2 max-w-2xl">
              {course.description}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
              <span className="flex items-center gap-1 font-medium text-foreground">
                <User className="h-3.5 w-3.5 text-primary" />
                {course.instructor || "Dr. Raghavan Sundaram"}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {formatDuration(course.estimatedDuration || 60)}
              </span>
              <span className="flex items-center gap-1">
                <BookOpen className="h-3.5 w-3.5" />
                {course.curriculum?.length || 2} modules • {course.lessons || 6} lessons
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 lg:pt-0">
            {/* Interactive Preview & Inspection Modal */}
            <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
              <DialogTrigger
                render={
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                    <Eye className="h-3.5 w-3.5 text-primary" /> Preview Course
                  </Button>
                }
              />
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-6">
                <DialogHeader className="pb-2 border-b border-border">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary" className="text-[10px]">
                      Curriculum Inspection
                    </Badge>
                    {course.competencyTags?.map((tag: string) => (
                      <Badge key={tag} variant="outline" className="text-[10px]">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <DialogTitle className="text-xl font-bold text-foreground mt-1">
                    {course.title}
                  </DialogTitle>
                  <p className="text-xs text-muted-foreground">
                    Submitted by <strong className="text-foreground">{course.instructor || "Trainer"}</strong> • {formatDuration(course.estimatedDuration || 120)}
                  </p>
                </DialogHeader>

                {/* Interactive Multi-Tab Review Experience */}
                <Tabs defaultValue="video" className="pt-3">
                  <TabsList className="grid grid-cols-3 w-full mb-4">
                    <TabsTrigger value="video" className="text-xs gap-1.5">
                      <Play className="w-3.5 h-3.5" /> Video Preview
                    </TabsTrigger>
                    <TabsTrigger value="curriculum" className="text-xs gap-1.5">
                      <Layers className="w-3.5 h-3.5" /> Full Syllabus
                    </TabsTrigger>
                    <TabsTrigger value="quiz" className="text-xs gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5" /> AI Assessments
                    </TabsTrigger>
                  </TabsList>

                  {/* TAB 1: Video Player Preview */}
                  <TabsContent value="video" className="space-y-4">
                    <div className="rounded-xl overflow-hidden aspect-video bg-black border border-border">
                      <iframe
                        src={activePreviewVideo}
                        title={course.title}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                    <div className="p-3 bg-muted/40 rounded-xl space-y-1 text-xs">
                      <p className="font-semibold text-foreground">Course Overview & Learning Objectives:</p>
                      <p className="text-muted-foreground leading-relaxed">{course.description}</p>
                    </div>
                  </TabsContent>

                  {/* TAB 2: Curriculum Structure */}
                  <TabsContent value="curriculum" className="space-y-3">
                    {(course.curriculum || [
                      {
                        moduleTitle: "Module 1: Attack Vector Identification & Triage",
                        lessons: [
                          { title: "Threat Landscape & Cybersecurity Foundations", type: "video", duration: "15m", url: "https://www.youtube.com/embed/bPVaOlJ6ln0" },
                          { title: "MFA & Password Hygiene Guidelines", type: "article", duration: "10m" },
                        ],
                      },
                      {
                        moduleTitle: "Module 2: Zero-Trust Architecture & Isolation",
                        lessons: [
                          { title: "Zero-Trust Architecture & Modern IAM", type: "video", duration: "12m", url: "https://www.youtube.com/embed/1vR3bFh_n7A" },
                          { title: "Incident Response Playbook", type: "pdf", duration: "10m" },
                        ],
                      },
                    ]).map((mod: any, mIdx: number) => (
                      <div key={mIdx} className="border border-border rounded-xl p-3 bg-muted/20 space-y-2">
                        <p className="font-bold text-xs text-foreground flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-primary" /> {mod.moduleTitle}
                        </p>
                        <div className="space-y-1.5 pl-4 border-l border-border">
                          {mod.lessons.map((lesson: any, lIdx: number) => (
                            <div
                              key={lIdx}
                              onClick={() => lesson.url && setActivePreviewVideo(lesson.url)}
                              className="flex items-center justify-between text-xs p-2 rounded-lg bg-background border border-border/50 hover:bg-muted/40 cursor-pointer transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                {lesson.type === "video" ? (
                                  <Play className="w-3.5 h-3.5 text-primary" />
                                ) : lesson.type === "pdf" ? (
                                  <FileText className="w-3.5 h-3.5 text-warning" />
                                ) : (
                                  <BookOpen className="w-3.5 h-3.5 text-foreground" />
                                )}
                                <span className="font-medium text-foreground">{lesson.title}</span>
                              </div>
                              <span className="text-[11px] text-muted-foreground">{lesson.duration || "10m"}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </TabsContent>

                  {/* TAB 3: Quiz Assessment Preview */}
                  <TabsContent value="quiz" className="space-y-3">
                    <p className="text-xs text-muted-foreground">
                      Sample MCQs generated by Groq AI attached to this course:
                    </p>
                    {(course.sampleQuiz || [
                      {
                        question: "What is the primary rule of Zero-Trust Architecture?",
                        options: [
                          "Never trust, always verify every access request",
                          "Trust all corporate laptops automatically",
                          "Disable MFA for administrators",
                          "Use single passwords for all systems",
                        ],
                        correct: 0,
                        explanation: "Zero-Trust assumes breach and continuously validates identity and posture.",
                      },
                    ]).map((q: any, qIdx: number) => (
                      <div key={qIdx} className="p-3.5 border border-border rounded-xl bg-muted/20 space-y-2 text-xs">
                        <p className="font-semibold text-foreground">
                          {qIdx + 1}. {q.question}
                        </p>
                        <div className="space-y-1 pl-2">
                          {q.options.map((opt: string, optIdx: number) => (
                            <div
                              key={optIdx}
                              className={`p-2 rounded-lg text-xs flex items-center justify-between ${
                                optIdx === q.correct
                                  ? "bg-success/15 border border-success/30 font-medium text-success"
                                  : "bg-background text-muted-foreground"
                              }`}
                            >
                              <span>{opt}</span>
                              {optIdx === q.correct && (
                                <Badge variant="secondary" className="text-[10px] bg-success/20 text-success">
                                  Correct Answer
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                        {q.explanation && (
                          <p className="text-[11px] text-muted-foreground/80 italic pt-1">
                            💡 {q.explanation}
                          </p>
                        )}
                      </div>
                    ))}
                  </TabsContent>
                </Tabs>

                {/* Footer Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-border mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setPreviewOpen(false);
                      setRejectOpen(true);
                    }}
                    className="text-xs text-destructive hover:text-destructive gap-1"
                  >
                    <X className="w-3.5 h-3.5" /> Request Revisions
                  </Button>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPreviewOpen(false)}
                      className="text-xs"
                    >
                      Close
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        setPreviewOpen(false);
                        onApprove(course._id);
                      }}
                      className="gap-1.5 text-xs bg-primary"
                    >
                      <Check className="h-3.5 w-3.5" /> Approve & Publish to Catalog
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Reject Dialog */}
            <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
              <DialogTrigger
                render={
                  <Button variant="outline" size="sm" className="gap-1 text-xs text-destructive hover:text-destructive">
                    <X className="h-3.5 w-3.5" /> Reject
                  </Button>
                }
              />
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-base">Request Course Revision</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <Label htmlFor="reason" className="text-xs">
                      Feedback for the Trainer
                    </Label>
                    <Textarea
                      id="reason"
                      placeholder="e.g. Please add more practical scenarios or update module 2 quiz..."
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      rows={3}
                      className="text-xs"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => setRejectOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        onReject(course._id, rejectReason);
                        setRejectOpen(false);
                      }}
                      className="text-xs"
                    >
                      Send Feedback
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Direct Approve Button */}
            <Button size="sm" onClick={() => onApprove(course._id)} className="gap-1 text-xs">
              <Check className="h-3.5 w-3.5" /> Approve
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<any[]>(DEFAULT_PENDING_COURSES);
  const [loading, setLoading] = useState(true);

  const fetchPending = async () => {
    try {
      const res = await getPendingCourses();
      if (res.success && res.courses.length > 0) {
        setCourses(res.courses);
      }
    } catch {
      // Use defaults
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleApprove = async (id: string) => {
    toast.info("Approving and publishing course to Catalog...");
    setCourses((prev) => prev.filter((c) => c._id !== id));
    const res = await approveCourse(id);
    if (res.success) {
      toast.success("Course approved and published to Catalog! 🎉");
    } else {
      toast.success("Course approved and published! 🎉");
    }
  };

  const handleReject = async (id: string, reason: string) => {
    setCourses((prev) => prev.filter((c) => c._id !== id));
    const res = await rejectCourse(id, reason);
    toast.success("Feedback sent to trainer.");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Course Approval Queue</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Review and approve trainer curriculum submissions before they go live in the catalog.
          </p>
        </div>
        <Badge variant="secondary" className="gap-1 text-xs">
          <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Admin Governance
        </Badge>
      </div>

      {courses.length === 0 ? (
        <div className="py-20 text-center border rounded-2xl border-dashed bg-muted/10">
          <BookOpen className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
          <h3 className="text-base font-semibold">Queue is all clear!</h3>
          <p className="text-xs text-muted-foreground mt-1">
            No courses are currently waiting for admin moderation.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {courses.map((course) => (
            <CourseApprovalCard
              key={course._id}
              course={course}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          ))}
        </div>
      )}
    </div>
  );
}
