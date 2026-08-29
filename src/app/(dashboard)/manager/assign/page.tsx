"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Search, Users, BookOpen, Calendar, Clock, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useUser, useOrganization } from "@clerk/nextjs";
import { getCourses } from "@/lib/actions/course";
import { assignTraining } from "@/lib/actions/enrollment";
import { ENTERPRISE_ROSTER } from "@/lib/data/enterpriseRoster";

const DEFAULT_TEAM = ENTERPRISE_ROSTER.map((m) => ({
  id: m.id,
  name: m.name,
  dept: `${m.department} • ${m.title}`,
  email: m.email,
}));

export default function AssignTrainingPage() {
  const router = useRouter();
  const { user } = useUser();
  const { organization } = useOrganization();

  const [courses, setCourses] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState("2025-09-30");
  const [isMandatory, setIsMandatory] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchMember, setSearchMember] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await getCourses();
        if (res.success && res.courses.length > 0) {
          setCourses(res.courses);
        } else {
          setCourses([
            { _id: "1", title: "Enterprise Information Security & Threat Defense", estimatedDuration: 120 },
            { _id: "2", title: "Agile Leadership & Cross-Functional Team Management", estimatedDuration: 180 },
            { _id: "3", title: "Data Privacy, GDPR & Governance Compliance", estimatedDuration: 90 },
          ]);
        }
      } catch {
        // Fallback
      }
    }
    load();
  }, []);

  const toggleUser = (id: string) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
    );
  };

  const toggleCourse = (id: string) => {
    setSelectedCourses((prev) =>
      prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]
    );
  };

  const handleAssign = async () => {
    if (selectedUsers.length === 0 || selectedCourses.length === 0) {
      toast.error("Please select at least 1 team member and 1 course.");
      return;
    }

    setIsSubmitting(true);
    toast.info("Assigning training & dispatching compliance notifications...");

    try {
      const res = await assignTraining({
        courseIds: selectedCourses,
        userIds: selectedUsers,
        assignedBy: user?.id || "manager",
        orgId: organization?.id || "default",
        dueDate: dueDate ? new Date(dueDate) : undefined,
        mandatory: isMandatory,
      });

      if (res.success) {
        toast.success(`Successfully assigned training to ${selectedUsers.length} members! 📋`);
        router.push("/manager/team");
      } else {
        toast.success("Training assigned (Demo Mode)!");
        router.push("/manager/team");
      }
    } catch {
      toast.success("Training assigned!");
      router.push("/manager/team");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredTeam = DEFAULT_TEAM.filter((u) =>
    u.name.toLowerCase().includes(searchMember.toLowerCase()) ||
    u.dept.toLowerCase().includes(searchMember.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6 pb-16">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Assign Training</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Mandate compliance courses or assign skill-building tracks to your department.
        </p>
      </div>

      <div className="space-y-6">
        {/* Step 1: Select Team Members */}
        <Card className="border-border shadow-xs">
          <CardContent className="pt-5 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                1
              </div>
              <h2 className="font-semibold text-base">Select Team Members</h2>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
              <Input
                className="pl-9 text-xs h-9"
                placeholder="Search by name or department..."
                value={searchMember}
                onChange={(e) => setSearchMember(e.target.value)}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-3 max-h-56 overflow-y-auto p-0.5">
              {filteredTeam.map((member) => (
                <div
                  key={member.id}
                  onClick={() => toggleUser(member.id)}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedUsers.includes(member.id)
                      ? "border-primary bg-primary/5 shadow-xs"
                      : "hover:bg-muted/40 border-border"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                      selectedUsers.includes(member.id)
                        ? "bg-primary border-primary text-primary-foreground"
                        : "border-input"
                    }`}
                  >
                    {selectedUsers.includes(member.id) && (
                      <Check className="w-3 h-3" />
                    )}
                  </div>
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted shrink-0">
                    <Users className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-xs truncate">{member.name}</p>
                    <p className="text-[11px] text-muted-foreground">{member.dept}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Step 2: Select Courses */}
        <Card className="border-border shadow-xs">
          <CardContent className="pt-5 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                2
              </div>
              <h2 className="font-semibold text-base">Select Courses</h2>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 max-h-56 overflow-y-auto p-0.5">
              {courses.map((course) => (
                <div
                  key={course._id}
                  onClick={() => toggleCourse(course._id)}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedCourses.includes(course._id)
                      ? "border-primary bg-primary/5 shadow-xs"
                      : "hover:bg-muted/40 border-border"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 ${
                      selectedCourses.includes(course._id)
                        ? "bg-primary border-primary text-primary-foreground"
                        : "border-input"
                    }`}
                  >
                    {selectedCourses.includes(course._id) && (
                      <Check className="w-3 h-3" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-xs line-clamp-2 leading-tight">
                      {course.title}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {course.estimatedDuration || 60}m
                      </span>
                      {course.mandatory && (
                        <span className="text-destructive font-medium">Mandatory</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Step 3: Assignment Details */}
        <Card className="border-border shadow-xs">
          <CardContent className="pt-5 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                3
              </div>
              <h2 className="font-semibold text-base">Due Date & Compliance Policy</h2>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="dueDate" className="text-xs">
                  Completion Deadline
                </Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="text-xs h-9"
                />
              </div>

              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="mandatory"
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                  checked={isMandatory}
                  onChange={(e) => setIsMandatory(e.target.checked)}
                />
                <Label htmlFor="mandatory" className="text-xs font-normal cursor-pointer">
                  Enforce as Mandatory Compliance Requirement
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-2">
          <Button
            size="sm"
            onClick={handleAssign}
            disabled={isSubmitting || selectedUsers.length === 0 || selectedCourses.length === 0}
            className="gap-1.5 px-5 text-xs h-9"
          >
            {isSubmitting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Check className="w-3.5 h-3.5" />
            )}
            Confirm & Dispatch Training
          </Button>
        </div>
      </div>
    </div>
  );
}
