"use client";

import { useState } from "react";
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
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Users,
  BarChart3,
  AlertCircle,
  Award,
  Search,
  CheckCircle2,
  Mail,
  ArrowUpRight,
} from "lucide-react";
import { ENTERPRISE_ROSTER } from "@/lib/data/enterpriseRoster";
import Link from "next/link";

export default function TeamDashboardPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");

  const teamMembers = ENTERPRISE_ROSTER.filter(
    (m) => m.role === "learner" || m.role === "trainer"
  );

  const filteredMembers = teamMembers.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept =
      departmentFilter === "all" || m.department === departmentFilter;
    return matchesSearch && matchesDept;
  });

  const avgCompletion = Math.round(
    teamMembers.reduce((acc, m) => acc + m.completionRate, 0) / teamMembers.length
  );
  const certifiedCount = teamMembers.filter((m) => m.status === "Certified").length;
  const inTrainingCount = teamMembers.filter((m) => m.status === "In Training").length;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Team Training Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Monitor organizational compliance, competency progress, and training velocity.
          </p>
        </div>

        <Link href="/manager/assign">
          <Button size="sm" className="gap-1.5 text-xs h-9">
            Assign New Training
          </Button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="border-border shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                Team Size
              </p>
              <h3 className="text-2xl font-bold mt-1">{teamMembers.length}</h3>
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
                Avg. Completion Rate
              </p>
              <h3 className="text-2xl font-bold mt-1">{avgCompletion}%</h3>
            </div>
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
              <BarChart3 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                Fully Certified
              </p>
              <h3 className="text-2xl font-bold mt-1">{certifiedCount}</h3>
            </div>
            <div className="p-2.5 bg-success/10 rounded-xl text-success">
              <Award className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                In Training Track
              </p>
              <h3 className="text-2xl font-bold mt-1">{inTrainingCount}</h3>
            </div>
            <div className="p-2.5 bg-warning/10 rounded-xl text-warning">
              <AlertCircle className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Roster Table */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 pb-3 border-b border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <CardTitle className="text-base">Team Member Roster</CardTitle>
            <CardDescription className="text-xs">
              Showing {filteredMembers.length} team members across active tracks
            </CardDescription>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-muted-foreground" />
            <Input
              placeholder="Search by name, designation..."
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
                <TableHead className="text-xs">Member & Title</TableHead>
                <TableHead className="text-xs">Department</TableHead>
                <TableHead className="text-xs">Enrolled</TableHead>
                <TableHead className="text-xs w-48">Overall Progress</TableHead>
                <TableHead className="text-xs">Compliance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.map((member) => (
                <TableRow key={member.id} className="hover:bg-muted/30">
                  <TableCell className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                        {member.avatarInitials}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-xs text-foreground truncate">
                          {member.name}
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {member.title}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground font-medium">
                    {member.department}
                  </TableCell>
                  <TableCell className="text-xs font-medium">
                    {member.completedCourses}/{member.enrolledCourses} courses
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <Progress value={member.completionRate} className="h-1.5 flex-1" />
                      <span className="text-xs font-semibold text-foreground w-9 text-right">
                        {member.completionRate}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={`text-[10px] ${
                        member.status === "Certified"
                          ? "bg-success/15 text-success border-success/30"
                          : "bg-warning/15 text-warning border-warning/30"
                      }`}
                    >
                      {member.status === "Certified" ? "Compliant" : "In Progress"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
