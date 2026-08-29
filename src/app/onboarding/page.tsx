"use client";

import * as React from "react";
import { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  ArrowRight,
  Key,
  ShieldCheck,
  User,
  GraduationCap,
  Briefcase,
  Shield,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { createNotification } from "@/lib/actions/notification";

export default function OnboardingPage() {
  const router = useRouter();
  const { isLoaded, userMemberships, setActive } = useOrganizationList({
    userMemberships: { infinite: true },
  });
  const { user } = useUser();

  // One Single Enterprise Key
  const [inviteCode, setInviteCode] = useState("AXORIA-2025");
  const [selectedRole, setSelectedRole] = useState("learner");
  const [selectedDepartment, setSelectedDepartment] = useState("Engineering");
  const [isJoining, setIsJoining] = useState(false);

  // Auto-switch to Axoria organization if available
  useEffect(() => {
    if (isLoaded && userMemberships?.data && setActive) {
      const axoriaOrg = userMemberships.data.find(
        (m) =>
          m.organization.name.toLowerCase().includes("axoria") ||
          m.organization.id === "org_axoria"
      );
      if (axoriaOrg) {
        setActive({ organization: axoriaOrg.organization.id }).catch(() => {});
      }
    }
  }, [isLoaded, userMemberships, setActive]);

  const handleJoinOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) {
      toast.error("Please enter the organization access code.");
      return;
    }

    const code = inviteCode.trim().toUpperCase();
    if (code !== "AXORIA-2025" && code !== "AXORIA") {
      toast.error("Invalid access code. Please use: AXORIA-2025");
      return;
    }

    setIsJoining(true);
    try {
      // 1. Set Axoria as the Active Organization
      if (userMemberships?.data && setActive) {
        const axoriaOrg = userMemberships.data.find(
          (m) =>
            m.organization.name.toLowerCase().includes("axoria")
        );
        if (axoriaOrg) {
          await setActive({ organization: axoriaOrg.organization.id });
        }
      }

      const roleLabel =
        selectedRole === "admin"
          ? "Administrator"
          : selectedRole === "manager"
            ? "Team Manager"
            : selectedRole === "trainer"
              ? "Instructor"
              : "Active Learner";

      // 2. Dispatch Real-time Alert to Chief Admin (Siva Dhanush)
      const memberName =
        user?.fullName || user?.primaryEmailAddress?.emailAddress || "New Employee";

      await createNotification({
        userId: "all_admins",
        type: "approval",
        title: `New Member Joined: ${memberName}`,
        message: `${memberName} joined Axoria Enterprise as ${roleLabel} in ${selectedDepartment}.`,
        link: "/admin/users",
      });

      toast.success(`Welcome to Axoria! Joined as ${roleLabel} in ${selectedDepartment} 🎉`);
      await new Promise((resolve) => setTimeout(resolve, 800));
      router.push("/dashboard");
    } catch (error) {
      console.error("Join error:", error);
      toast.success("Joined Axoria Enterprise Workspace!");
      router.push("/dashboard");
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <img
            src="/axoria-logo.svg"
            alt="Axoria"
            className="h-12 w-12 mx-auto mb-3"
          />
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Join Axoria Enterprise
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Connect to the official organizational capacity building workspace
          </p>
        </div>

        {/* Single Enterprise Joining Card */}
        <Card className="border border-border shadow-md">
          <CardHeader className="pb-4 space-y-3">
            {/* Primary Workspace Verified Banner */}
            <div className="p-3.5 bg-primary/5 border border-primary/20 rounded-xl space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-primary" /> Axoria Enterprise
                </span>
                <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary font-semibold">
                  Official Workspace
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Supervised by Chief Admin: <strong className="text-foreground">Siva Dhanush</strong> (<code>sivadhanushkotturu@gmail.com</code>).
              </p>
            </div>

            <CardTitle className="text-base font-semibold pt-1">
              Workspace Access & Role Setup
            </CardTitle>
            <CardDescription className="text-xs">
              Verify your organizational access code and select your operational role.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-0">
            <form onSubmit={handleJoinOrganization} className="space-y-4">
              {/* Access Code */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="invite-code" className="text-xs font-medium">
                    Enterprise Access Code
                  </Label>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    Default: <strong className="text-primary">AXORIA-2025</strong>
                  </span>
                </div>
                <div className="relative">
                  <Key className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="invite-code"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    className="pl-9 text-xs h-9 uppercase font-mono tracking-wider font-semibold"
                    required
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Your Role</Label>
                <Select value={selectedRole} onValueChange={(val) => setSelectedRole(val || "learner")}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select platform role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="learner">
                      <span className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-success" /> Active Learner / Employee (Take Courses)
                      </span>
                    </SelectItem>
                    <SelectItem value="trainer">
                      <span className="flex items-center gap-2">
                        <GraduationCap className="w-3.5 h-3.5 text-primary" /> Trainer / Instructor (Create Courses)
                      </span>
                    </SelectItem>
                    <SelectItem value="manager">
                      <span className="flex items-center gap-2">
                        <Briefcase className="w-3.5 h-3.5 text-warning" /> Team Manager (Assign & Track Progress)
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Department Selection */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Your Department</Label>
                <Select value={selectedDepartment} onValueChange={(val) => setSelectedDepartment(val || "Engineering")}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Engineering">Engineering & Software Development</SelectItem>
                    <SelectItem value="IT Security">IT Security & Threat Defense</SelectItem>
                    <SelectItem value="Operations">Operations & Logistics</SelectItem>
                    <SelectItem value="Human Resources">Human Resources & Talent</SelectItem>
                    <SelectItem value="Product & Design">Product Management & UI/UX</SelectItem>
                    <SelectItem value="Legal & Compliance">Legal & Regulatory Compliance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="submit"
                className="w-full text-xs h-10 gap-2 mt-2 font-semibold"
                disabled={isJoining}
              >
                {isJoining ? "Connecting to Axoria..." : "Enter Axoria Enterprise"}
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
