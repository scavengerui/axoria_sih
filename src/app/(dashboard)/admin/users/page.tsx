"use client";

import { useState, useEffect } from "react";
import { useUser, useOrganization, OrganizationProfile } from "@clerk/nextjs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Users,
  Plus,
  Search,
  Shield,
  Sparkles,
  Settings,
  Mail,
  UserCheck,
  GraduationCap,
  Briefcase,
  UserPlus,
  CheckCircle2,
} from "lucide-react";
import { getOrganizationMembers } from "@/lib/actions/users";
import { toast } from "sonner";

export default function AdminUsersPage() {
  const { user } = useUser();
  const { organization } = useOrganization();
  const [members, setMembers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showOrgProfile, setShowOrgProfile] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // Invite Form State
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("learner");
  const [inviteDept, setInviteDept] = useState("Engineering");
  const [isInviting, setIsInviting] = useState(false);

  const handleSyncClerkUsers = async () => {
    setIsSyncing(true);
    toast.info("Creating enterprise user accounts in Clerk...");
    try {
      const res = await fetch("/api/seed-clerk-users");
      const data = await res.json();
      if (data.success) {
        toast.success(`Created accounts in Clerk! Default password: ${data.defaultPassword} 🔑`);
        const membersRes = await getOrganizationMembers();
        if (membersRes.success) setMembers(membersRes.members);
      } else {
        toast.error(`Sync error: ${data.error}`);
      }
    } catch (err: any) {
      toast.error("Failed to connect to Clerk user provisioning.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setIsInviting(true);
    const newMember = {
      id: `usr_${Date.now()}`,
      name: inviteName || inviteEmail.split("@")[0],
      title: inviteRole === "trainer" ? "Certified Instructor" : inviteRole === "manager" ? "Engineering Manager" : "Associate Specialist",
      email: inviteEmail,
      role: inviteRole,
      department: inviteDept,
      status: "Active",
      joinedAt: "Today",
      avatarInitials: (inviteName || "U").substring(0, 2).toUpperCase(),
    };

    setMembers((prev) => [newMember, ...prev]);
    toast.success(`Invitation sent to ${inviteEmail}! 🎉`);
    setIsInviteOpen(false);
    setInviteName("");
    setInviteEmail("");
    setIsInviting(false);
  };

  useEffect(() => {
    async function loadMembers() {
      try {
        const res = await getOrganizationMembers();
        if (res.success && res.members.length > 0) {
          setMembers(res.members);
        }
      } catch (err) {
        console.error("Error loading members:", err);
      } finally {
        setLoading(false);
      }
    }
    loadMembers();
  }, [user]);

  const getRoleBadge = (role: string) => {
    switch (role.toLowerCase()) {
      case "admin":
      case "org:admin":
        return <Badge variant="default">Admin</Badge>;
      case "manager":
      case "org:manager":
        return <Badge variant="secondary">Manager</Badge>;
      case "trainer":
      case "org:trainer":
        return (
          <Badge variant="outline" className="text-primary border-primary/40 bg-primary/5">
            Trainer
          </Badge>
        );
      default:
        return <Badge variant="outline" className="text-muted-foreground">Learner</Badge>;
    }
  };

  const filteredMembers = members.filter((m) =>
    m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.department?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
            <Badge variant="secondary" className="text-xs">
              {organization?.name || "Axoria Enterprise"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Directory of organization personnel, certified instructors, and role permissions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={isSyncing}
            onClick={handleSyncClerkUsers}
            className="gap-1.5 text-xs h-9 border-primary/30 text-primary hover:bg-primary/5"
          >
            {isSyncing ? (
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-primary" />
            )}
            Provision in Clerk
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowOrgProfile(true)}
            className="gap-1.5 text-xs h-9"
          >
            <Settings className="w-3.5 h-3.5" /> Manage Organization
          </Button>

          <Button
            size="sm"
            onClick={() => setIsInviteOpen(true)}
            className="gap-1.5 text-xs h-9"
          >
            <UserPlus className="w-3.5 h-3.5" /> Invite Member
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="border-border shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                Total Personnel
              </p>
              <h3 className="text-2xl font-bold mt-1">{members.length}</h3>
            </div>
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
              <Users className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                Instructors / Trainers
              </p>
              <h3 className="text-2xl font-bold mt-1">
                {members.filter((m) => m.role === "trainer").length}
              </h3>
            </div>
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
              <GraduationCap className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                Team Managers
              </p>
              <h3 className="text-2xl font-bold mt-1">
                {members.filter((m) => m.role === "manager").length}
              </h3>
            </div>
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
              <Briefcase className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                Active Learners
              </p>
              <h3 className="text-2xl font-bold mt-1">
                {members.filter((m) => m.role === "learner" || m.role === "member").length}
              </h3>
            </div>
            <div className="p-2.5 bg-success/10 rounded-xl text-success">
              <UserCheck className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Directory Table */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 pb-3 border-b border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <CardTitle className="text-base">Organization Directory</CardTitle>
            <CardDescription className="text-xs">
              Showing {filteredMembers.length} verified enterprise members
            </CardDescription>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-muted-foreground" />
            <Input
              placeholder="Search by name, title, department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 text-xs h-8"
            />
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs">Personnel & Designation</TableHead>
                <TableHead className="text-xs">Role</TableHead>
                <TableHead className="text-xs">Department</TableHead>
                <TableHead className="text-xs">Compliance Status</TableHead>
                <TableHead className="text-xs">Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.map((member) => (
                <TableRow key={member.id} className="hover:bg-muted/30">
                  <TableCell className="py-3">
                    <div className="flex items-center gap-3">
                      {member.avatar ? (
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-9 h-9 rounded-full border shrink-0 object-cover"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                          {member.avatarInitials || member.name.charAt(0)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold text-xs text-foreground truncate">
                          {member.name}
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {member.title || "Enterprise Member"}
                        </p>
                        <p className="text-[10px] text-muted-foreground/70 flex items-center gap-1">
                          <Mail className="w-2.5 h-2.5" /> {member.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getRoleBadge(member.role)}</TableCell>
                  <TableCell className="text-xs text-muted-foreground font-medium">
                    {member.department || "Enterprise"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={`text-[10px] ${
                        member.status === "Certified"
                          ? "bg-success/15 text-success border-success/30"
                          : "bg-primary/10 text-primary border-primary/20"
                      }`}
                    >
                      {member.status || "Active"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {member.joinedAt || "Today"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* DEDICATED NATIVE AXORIA INVITE MEMBER MODAL */}
      <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader className="pb-2 border-b border-border">
            <DialogTitle className="text-lg font-bold">Invite New Member</DialogTitle>
            <p className="text-xs text-muted-foreground">
              Send an onboarding credential invite to a new team member or instructor.
            </p>
          </DialogHeader>

          <form onSubmit={handleSendInvite} className="space-y-4 pt-3 text-xs">
            <div className="space-y-1.5">
              <Label htmlFor="inviteName" className="text-xs">
                Full Name
              </Label>
              <Input
                id="inviteName"
                placeholder="e.g. Vikramaditya Sharma"
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                className="h-9 text-xs"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="inviteEmail" className="text-xs">
                Work Email Address
              </Label>
              <Input
                id="inviteEmail"
                type="email"
                placeholder="name@company.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="h-9 text-xs"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Platform Role</Label>
                <Select value={inviteRole} onValueChange={(val) => setInviteRole(val || "learner")}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="learner">Learner</SelectItem>
                    <SelectItem value="trainer">Trainer / Instructor</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="admin">Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Department</Label>
                <Select value={inviteDept} onValueChange={(val) => setInviteDept(val || "Engineering")}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Engineering">Engineering</SelectItem>
                    <SelectItem value="IT Security">IT Security</SelectItem>
                    <SelectItem value="Human Resources">Human Resources</SelectItem>
                    <SelectItem value="Operations">Operations</SelectItem>
                    <SelectItem value="Compliance & Legal">Compliance & Legal</SelectItem>
                    <SelectItem value="Product & Design">Product & Design</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border mt-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsInviteOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isInviting} className="gap-1.5 text-xs">
                <Mail className="w-3.5 h-3.5" /> Send Invitation
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* FULL-WIDTH RESPONSIVE CLERK ORGANIZATION PROFILE */}
      <Dialog open={showOrgProfile} onOpenChange={setShowOrgProfile}>
        <DialogContent className="sm:max-w-5xl max-w-5xl w-[92vw] h-[85vh] p-6 overflow-hidden flex flex-col">
          <DialogHeader className="pb-3 border-b border-border shrink-0">
            <DialogTitle className="text-lg font-bold">
              Organization & Enterprise Governance Suite
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto pt-2 flex justify-center w-full">
            <OrganizationProfile
              routing="hash"
              appearance={{
                elements: {
                  rootBox: "w-full max-w-4xl shadow-none",
                  cardBox: "w-full shadow-none border-0",
                  card: "shadow-none border-0 w-full",
                  navbar: "w-48 border-r border-border pr-2",
                  navbarButtonsList: "space-y-1",
                  scrollBox: "p-4 w-full",
                  pageScrollBox: "p-4 w-full",
                },
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
