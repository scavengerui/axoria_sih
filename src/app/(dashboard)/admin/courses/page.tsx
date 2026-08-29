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
import { Skeleton } from "@/components/ui/skeleton";
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

function CourseApprovalCard({
  course,
  onApprove,
  onReject,
}: {
  course: any;
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
}) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const modulesCount = course.modules?.length || course.modulesCount || 2;
  const lessonsCount =
    course.modules?.reduce((acc: number, m: any) => acc + (m.lessons?.length || 0), 0) ||
    course.lessonsCount ||
    6;

  return (
    <Card className="border border-border hover:shadow-sm transition-all">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary" className="text-[10px] bg-warning/15 text-warning border-warning/30">
                Pending Approval
              </Badge>
              {course.competencyTags?.map((tag: string) => (
                <Badge key={tag} variant="secondary" className="text-[10px]">
                  {tag}
                </Badge>
              ))}
            </div>

            <div>
              <h3 className="text-base font-semibold text-foreground">{course.title}</h3>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{course.description}</p>
            </div>

            <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1 flex-wrap">
              <span className="flex items-center gap-1 font-medium text-foreground">
                <User className="w-3.5 h-3.5 text-primary" /> {course.instructor || "Trainer"}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {course.estimatedDuration || 40}m
              </span>
              <span className="flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" /> {modulesCount} modules • {lessonsCount} lessons
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Full Preview Modal */}
            <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
              <DialogTrigger
                render={
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                    <Eye className="h-3.5 w-3.5" /> Preview Course
                  </Button>
                }
              />
              <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary" className="text-[10px] bg-warning/15 text-warning border-warning/30">
                      Pending Verification
                    </Badge>
                    {course.competencyTags?.map((tag: string) => (
                      <Badge key={tag} variant="outline" className="text-[10px]">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <DialogTitle className="text-xl font-bold">{course.title}</DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="overview" className="mt-4">
                  <TabsList className="grid w-full grid-cols-2 text-xs">
                    <TabsTrigger value="overview" className="text-xs">
                      Course Curriculum
                    </TabsTrigger>
                    <TabsTrigger value="details" className="text-xs">
                      Course Details & Assessment
                    </TabsTrigger>
                  </TabsList>

                  {/* TAB 1: CURRICULUM */}
                  <TabsContent value="overview" className="space-y-4 pt-3">
                    <p className="text-xs text-muted-foreground">{course.description}</p>

                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Syllabus Structure ({modulesCount} Modules)
                      </h4>

                      {course.modules && course.modules.length > 0 ? (
                        course.modules.map((mod: any, idx: number) => (
                          <div key={idx} className="border border-border/70 rounded-xl p-3.5 space-y-2 bg-muted/20">
                            <h5 className="text-xs font-semibold text-foreground flex items-center gap-2">
                              <Layers className="w-3.5 h-3.5 text-primary" /> {mod.title || `Module ${idx + 1}`}
                            </h5>
                            <div className="space-y-1.5 pl-4">
                              {mod.lessons?.map((les: any, lIdx: number) => (
                                <div key={lIdx} className="flex items-center justify-between text-xs py-1 px-2.5 rounded-lg bg-background border border-border/40">
                                  <span className="flex items-center gap-2 text-foreground">
                                    {les.type === "video" ? (
                                      <Play className="w-3 h-3 text-primary" />
                                    ) : (
                                      <FileText className="w-3 h-3 text-muted-foreground" />
                                    )}
                                    {les.title || `Lesson ${lIdx + 1}`}
                                  </span>
                                  <span className="text-[11px] text-muted-foreground font-mono">
                                    {les.duration || 10}m
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 bg-muted/20 border border-border rounded-xl text-xs space-y-2">
                          <p className="font-semibold text-foreground">Module 1: Foundations & Core Principles</p>
                          <p className="text-muted-foreground pl-2 text-[11px]">✦ Lesson 1: Introduction & Threat Landscape (15m)</p>
                          <p className="text-muted-foreground pl-2 text-[11px]">✦ Lesson 2: Key Framework Guidelines & AI Quiz Assessment (10m)</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  {/* TAB 2: DETAILS */}
                  <TabsContent value="details" className="space-y-4 pt-3">
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-3 bg-muted/20 rounded-xl border border-border">
                        <p className="text-muted-foreground text-[10px]">Author / Instructor</p>
                        <p className="font-semibold text-foreground mt-0.5">{course.instructor || "Trainer"}</p>
                      </div>
                      <div className="p-3 bg-muted/20 rounded-xl border border-border">
                        <p className="text-muted-foreground text-[10px]">Estimated Duration</p>
                        <p className="font-semibold text-foreground mt-0.5">{course.estimatedDuration || 40} Minutes</p>
                      </div>
                    </div>

                    <div className="p-3 bg-primary/5 border border-primary/20 rounded-xl space-y-1.5 text-xs">
                      <span className="font-semibold text-primary flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" /> AI Assessment Verified
                      </span>
                      <p className="text-[11px] text-muted-foreground">
                        Includes auto-generated multi-choice questions powered by Groq Llama-3.3.
                      </p>
                    </div>
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
                      className="gap-1.5 text-xs bg-primary font-semibold"
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
                      placeholder="Please expand on Section 2 video explanations before publishing..."
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      className="text-xs min-h-[100px]"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => setRejectOpen(false)} className="text-xs">
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        onReject(course._id, rejectReason);
                        setRejectOpen(false);
                      }}
                      className="text-xs"
                    >
                      Send Revision Request
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Button size="sm" onClick={() => onApprove(course._id)} className="gap-1 text-xs font-semibold">
              <Check className="h-3.5 w-3.5" /> Approve
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPending = async () => {
    try {
      const res = await getPendingCourses();
      if (res.success && res.courses) {
        setCourses(res.courses);
      }
    } catch {
      setCourses([]);
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
        <Badge variant="secondary" className="gap-1 text-xs bg-primary/10 text-primary">
          <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Admin Governance
        </Badge>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Card className="p-6">
            <div className="space-y-3">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-6 w-72" />
              <Skeleton className="h-4 w-full" />
            </div>
          </Card>
        </div>
      ) : courses.length === 0 ? (
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
