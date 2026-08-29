"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  Clock,
  Users,
  Star,
  BookOpen,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDuration } from "@/lib/utils";
import { getCourses } from "@/lib/actions/course";

function getCourseKeyFromTitle(title: string): string {
  const t = title.toLowerCase();
  if (t.includes("security") || t.includes("threat") || t.includes("cyber")) return "1";
  if (t.includes("agile") || t.includes("leadership") || t.includes("team")) return "2";
  if (t.includes("privacy") || t.includes("gdpr") || t.includes("governance")) return "3";
  return "1";
}

function getInstructorFromKey(key: string): { name: string; rating: number } {
  switch (key) {
    case "1":
      return { name: "Dr. Raghavan Sundaram (CISO)", rating: 4.9 };
    case "2":
      return { name: "Prof. Sunita Deshmukh", rating: 4.8 };
    case "3":
      return { name: "Dr. Ananya Sengupta", rating: 4.7 };
    default:
      return { name: "Axoria Enterprise Trainer", rating: 4.8 };
  }
}

// Default baseline courses
const DEFAULT_COURSES = [
  {
    _id: "1",
    title: "Enterprise Information Security & Threat Defense",
    description:
      "Master modern threat detection, zero-trust authentication, credential hygiene, and incident reporting for enterprise compliance.",
    competencyTags: ["Cybersecurity", "Compliance", "IT Security"],
    estimatedDuration: 120,
    mandatory: true,
    enrolledCount: 1,
    rating: 4.9,
    instructor: "Dr. Raghavan Sundaram (CISO)",
    status: "published",
  },
  {
    _id: "2",
    title: "Agile Leadership & Cross-Functional Team Management",
    description:
      "Develop executive leadership capabilities, facilitate sprint retrospectives, and lead distributed teams with high psychological safety.",
    competencyTags: ["Leadership", "Agile", "Management"],
    estimatedDuration: 180,
    mandatory: false,
    enrolledCount: 1,
    rating: 4.8,
    instructor: "Prof. Sunita Deshmukh",
    status: "published",
  },
  {
    _id: "3",
    title: "Data Privacy, GDPR & Governance Compliance",
    description:
      "Understand data residency regulations, PII anonymization techniques, and compliance audit preparation.",
    competencyTags: ["Data Privacy", "Governance", "Compliance"],
    estimatedDuration: 90,
    mandatory: true,
    enrolledCount: 1,
    rating: 4.7,
    instructor: "Dr. Ananya Sengupta",
    status: "published",
  },
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

        <CardContent className="p-4 space-y-3">
          {/* Tags */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {course.mandatory && (
              <Badge variant="destructive" className="text-[10px] h-4.5 px-1.5">
                Mandatory
              </Badge>
            )}
            {course.competencyTags?.slice(0, 2).map((tag: string) => (
              <Badge key={tag} variant="secondary" className="text-[10px] h-4.5 px-1.5">
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
  const [courses, setCourses] = useState<any[]>(DEFAULT_COURSES);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTag, setFilterTag] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [isDbLoaded, setIsDbLoaded] = useState(false);

  useEffect(() => {
    async function loadCourses() {
      try {
        const res = await getCourses();
        if (res.success && res.courses.length > 0) {
          const dbCourses = res.courses.map((c: any) => {
            const courseKey = getCourseKeyFromTitle(c.title);
            const { name: instructor, rating } = getInstructorFromKey(courseKey);

            return {
              ...c,
              _id: courseKey,
              instructor,
              rating,
              enrolledCount: c.enrolledCount || 1,
            };
          });

          // Sort by course ID: 1, 2, 3
          dbCourses.sort((a: any, b: any) => a._id.localeCompare(b._id));

          setCourses(dbCourses);
          setIsDbLoaded(true);
        }
      } catch (err) {
        console.error("Failed to load MongoDB courses:", err);
      }
    }
    loadCourses();
  }, []);

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      searchQuery === "" ||
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag =
      filterTag === "all" ||
      course.competencyTags?.includes(filterTag);
    const matchesType =
      filterType === "all" ||
      (filterType === "mandatory" && course.mandatory) ||
      (filterType === "optional" && !course.mandatory);
    return matchesSearch && matchesTag && matchesType;
  });

  const allTags = Array.from(
    new Set(courses.flatMap((c) => c.competencyTags || []))
  ).sort();

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Course Catalog</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Browse published courses and verify your organizational competencies.
          </p>
        </div>
        {isDbLoaded && (
          <Badge variant="secondary" className="gap-1 text-xs">
            <Sparkles className="h-3 w-3 text-primary" /> Live MongoDB Data
          </Badge>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs h-9"
          />
        </div>

        <Select value={filterTag} onValueChange={(val) => setFilterTag(val || "all")}>
          <SelectTrigger className="w-[180px] text-xs h-9">
            <Filter className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Competency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Competencies</SelectItem>
            {allTags.map((tag) => (
              <SelectItem key={tag} value={tag}>
                {tag}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterType} onValueChange={(val) => setFilterType(val || "all")}>
          <SelectTrigger className="w-[150px] text-xs h-9">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Courses</SelectItem>
            <SelectItem value="mandatory">Mandatory Only</SelectItem>
            <SelectItem value="optional">Optional Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results count */}
      <p className="text-xs text-muted-foreground">
        Showing {filteredCourses.length} of {courses.length} courses
      </p>

      {/* Course Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <CourseCard key={course._id} course={course} />
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-16 border rounded-2xl border-dashed bg-muted/10">
          <BookOpen className="h-10 w-10 text-muted-foreground/40 mx-auto" />
          <h3 className="text-base font-semibold mt-3">No courses match your criteria</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Try adjusting your search query or competency filter.
          </p>
        </div>
      )}
    </div>
  );
}
