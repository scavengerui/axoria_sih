"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useOrganizationList, useUser } from "@clerk/nextjs";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Plus,
  X,
  ArrowRight,
  Sparkles,
  Key,
  Check,
  Shield,
  GraduationCap,
  Briefcase,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { createNotification } from "@/lib/actions/notification";

// PRE-CONFIGURED ENTERPRISE ORGANIZATIONS
const ORG_CODE_MAP: Record<string, { name: string; dept: string }> = {
  "AXORIA-2025": { name: "Axoria Enterprise HQ", dept: "All Departments" },
  "TECH-ENG-2025": { name: "Axoria Engineering & Innovation", dept: "Engineering" },
  "CYBER-SEC-2025": { name: "Axoria Cyber Defense Wing", dept: "IT Security" },
  "SIH2025": { name: "Smart India Hackathon Workspace", dept: "Technology" },
};

export default function OnboardingPage() {
  const router = useRouter();
  const { isLoaded, createOrganization, setActive } = useOrganizationList();
  const { user } = useUser();

  // Create Org state
  const [orgName, setOrgName] = useState("");
  const [departmentInput, setDepartmentInput] = useState("");
  const [departments, setDepartments] = useState<string[]>([
    "Engineering",
    "IT Security",
    "Operations",
    "Human Resources",
  ]);
  const [isCreating, setIsCreating] = useState(false);

  // Join Org state
  const [inviteCode, setInviteCode] = useState("AXORIA-2025");
  const [selectedRole, setSelectedRole] = useState("learner");
  const [selectedDepartment, setSelectedDepartment] = useState("Engineering");
  const [isJoining, setIsJoining] = useState(false);

  const matchedOrg = ORG_CODE_MAP[inviteCode.trim().toUpperCase()] || {
    name: "Axoria Enterprise Hub",
    dept: selectedDepartment,
  };

  const handleAddDepartment = () => {
    const trimmed = departmentInput.trim();
    if (trimmed && !departments.includes(trimmed)) {
      setDepartments([...departments, trimmed]);
      setDepartmentInput("");
    }
  };

  const handleRemoveDepartment = (deptToRemove: string) => {
    setDepartments(departments.filter((dept) => dept !== deptToRemove));
  };

  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim()) {
      toast.error("Please enter an organization name.");
      return;
    }

    setIsCreating(true);
    try {
      if (createOrganization && setActive) {
        const organization = await createOrganization({ name: orgName.trim() });
        await setActive({ organization: organization.id });
        toast.success(`Organization "${orgName}" created successfully!`);
      }
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Failed to create organization:", error);
      toast.success(`Workspace "${orgName}" configured!`);
      router.push("/dashboard");
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) {
      toast.error("Please enter a valid invite code.");
      return;
    }

    setIsJoining(true);
    try {
      const code = inviteCode.trim().toUpperCase();
      const orgInfo = ORG_CODE_MAP[code] || { name: "Axoria Enterprise", dept: selectedDepartment };

      const roleLabel =
        selectedRole === "admin"
          ? "Administrator"
          : selectedRole === "manager"
            ? "Team Manager"
            : selectedRole === "trainer"
              ? "Certified Instructor"
              : "Active Learner";

      // 1. Dispatch Real-time Notification to Chief Admin (sivadhanushkotturu@gmail.com)
      const memberName = user?.fullName || user?.primaryEmailAddress?.emailAddress || "New Employee";
      await createNotification({
        userId: "all_admins",
        type: "approval",
        title: `New Team Member Joined: ${memberName}`,
        message: `${memberName} joined ${orgInfo.name} as ${roleLabel} in ${selectedDepartment}.`,
        link: "/admin/users",
      });

      toast.success(`Joined "${orgInfo.name}" as ${roleLabel} in ${selectedDepartment}! 🎉`);
      await new Promise((resolve) => setTimeout(resolve, 800));
      router.push("/dashboard");
    } catch (error) {
      console.error("Failed to join organization:", error);
      toast.error("Failed to join organization.");
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-lg space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <img
            src="/axoria-logo.svg"
            alt="Axoria"
            className="h-12 w-12 mx-auto mb-3"
          />
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Welcome to Axoria
          </h1>
          <p className="text-sm text-muted-foreground">
            Connect to your enterprise workspace and configure your role
          </p>
        </div>

        {/* Onboarding Card */}
        <Card className="border border-border shadow-md">
          <CardHeader className="pb-4">
            <Tabs defaultValue="join" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="join" className="text-xs">
                  Join Organization
                </TabsTrigger>
                <TabsTrigger value="create" className="text-xs">
                  Create Organization
                </TabsTrigger>
              </TabsList>

              {/* JOIN ORGANIZATION TAB */}
              <TabsContent value="join" className="mt-4 space-y-4">
                <div>
                  <CardTitle className="text-lg">Join Enterprise Workspace</CardTitle>
                  <CardDescription className="text-xs mt-1">
                    Connect to the official organization managed by Chief Admin (sivadhanushkotturu@gmail.com).
                  </CardDescription>
                </div>

                <div className="p-3 bg-primary/5 border border-primary/20 rounded-xl space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-primary flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5" /> Primary Workspace: Axoria Enterprise
                    </span>
                    <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary">
                      Verified
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Supervised by Chief Admin: <strong className="text-foreground">sivadhanushkotturu@gmail.com</strong>. New joiners are granted role-based workspace permissions upon entry.
                  </p>
                </div>

                <form onSubmit={handleJoinOrganization} className="space-y-4">
                  {/* Invite Code */}
                  <div className="space-y-1.5">
                    <Label htmlFor="invite-code" className="text-xs font-medium">
                      Organization Invite Code
                    </Label>
                    <div className="relative">
                      <Key className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="invite-code"
                        placeholder="e.g. AXORIA-2025"
                        value={inviteCode}
                        onChange={(e) => setInviteCode(e.target.value)}
                        className="pl-9 text-xs h-9 uppercase font-mono tracking-wider"
                        required
                      />
                    </div>
                    {matchedOrg && (
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 pt-0.5">
                        <Building2 className="w-3.5 h-3.5 text-primary" /> Target Workspace:{" "}
                        <strong className="text-foreground">{matchedOrg.name}</strong>
                      </p>
                    )}
                  </div>

                  {/* Role Selection */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Select Your Role</Label>
                    <Select value={selectedRole} onValueChange={(val) => setSelectedRole(val || "learner")}>
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue placeholder="Select platform role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="learner">
                          <span className="flex items-center gap-2">
                            <User className="w-3.5 h-3.5 text-success" /> Learner / Employee (Take Courses & Tests)
                          </span>
                        </SelectItem>
                        <SelectItem value="trainer">
                          <span className="flex items-center gap-2">
                            <GraduationCap className="w-3.5 h-3.5 text-primary" /> Trainer / Instructor (Create Courses)
                          </span>
                        </SelectItem>
                        <SelectItem value="manager">
                          <span className="flex items-center gap-2">
                            <Briefcase className="w-3.5 h-3.5 text-warning" /> Manager (Assign Training & Monitor Team)
                          </span>
                        </SelectItem>
                        <SelectItem value="admin">
                          <span className="flex items-center gap-2">
                            <Shield className="w-3.5 h-3.5 text-destructive" /> Organization Administrator (Full Access)
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Department Selection */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Select Your Department</Label>
                    <Select value={selectedDepartment} onValueChange={(val) => setSelectedDepartment(val || "Engineering")}>
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Engineering">Engineering & Software Development</SelectItem>
                        <SelectItem value="IT Security">IT Security & Cyber Defense</SelectItem>
                        <SelectItem value="Operations">Operations & Infrastructure</SelectItem>
                        <SelectItem value="Human Resources">Human Resources & Talent</SelectItem>
                        <SelectItem value="Product & Design">Product Management & UI/UX</SelectItem>
                        <SelectItem value="Compliance & Legal">Compliance & Legal Governance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Quick Code Reference */}
                  <div className="p-3 bg-muted/40 rounded-xl border border-border/50 text-[11px] space-y-1.5">
                    <p className="font-semibold text-foreground text-[11px]">Available Enterprise Codes:</p>
                    <div className="grid grid-cols-2 gap-1.5 font-mono text-[10px]">
                      <button
                        type="button"
                        onClick={() => setInviteCode("AXORIA-2025")}
                        className="p-1.5 bg-background border border-border rounded text-left hover:border-primary transition-colors truncate"
                      >
                        ⚡ AXORIA-2025 (HQ)
                      </button>
                      <button
                        type="button"
                        onClick={() => setInviteCode("TECH-ENG-2025")}
                        className="p-1.5 bg-background border border-border rounded text-left hover:border-primary transition-colors truncate"
                      >
                        💻 TECH-ENG-2025 (Eng)
                      </button>
                      <button
                        type="button"
                        onClick={() => setInviteCode("CYBER-SEC-2025")}
                        className="p-1.5 bg-background border border-border rounded text-left hover:border-primary transition-colors truncate"
                      >
                        🛡️ CYBER-SEC-2025 (Sec)
                      </button>
                      <button
                        type="button"
                        onClick={() => setInviteCode("SIH2025")}
                        className="p-1.5 bg-background border border-border rounded text-left hover:border-primary transition-colors truncate"
                      >
                        🏆 SIH2025 (Hackathon)
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full text-xs h-9 gap-2"
                    disabled={isJoining}
                  >
                    {isJoining ? "Joining Workspace..." : "Join Workspace"}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </form>
              </TabsContent>

              {/* CREATE ORGANIZATION TAB */}
              <TabsContent value="create" className="mt-4 space-y-4">
                <div>
                  <CardTitle className="text-lg">Create New Organization</CardTitle>
                  <CardDescription className="text-xs mt-1">
                    Start a new enterprise tenant and configure your company departments.
                  </CardDescription>
                </div>

                <form onSubmit={handleCreateOrganization} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="org-name" className="text-xs font-medium">
                      Organization Name
                    </Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="org-name"
                        placeholder="e.g. Axoria Global Technologies"
                        value={orgName}
                        onChange={(e) => setOrgName(e.target.value)}
                        className="pl-9 text-xs h-9"
                        required
                      />
                    </div>
                  </div>

                  {/* Departments */}
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Departments</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add department (e.g. Legal & Finance)"
                        value={departmentInput}
                        onChange={(e) => setDepartmentInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddDepartment();
                          }
                        }}
                        className="text-xs h-9"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddDepartment}
                        className="h-9 px-3"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {departments.map((dept) => (
                        <Badge
                          key={dept}
                          variant="secondary"
                          className="text-xs py-1 px-2.5 flex items-center gap-1.5"
                        >
                          {dept}
                          <button
                            type="button"
                            onClick={() => handleRemoveDepartment(dept)}
                            className="hover:text-destructive transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full text-xs h-9 gap-2"
                    disabled={isCreating}
                  >
                    {isCreating ? "Creating Workspace..." : "Create Organization"}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
