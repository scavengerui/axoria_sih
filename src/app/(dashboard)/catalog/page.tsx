"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Clock,
  Users,
  Star,
  BookOpen,
  Sparkles,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDuration } from "@/lib/utils";
import { getCourses } from "@/lib/actions/course";

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
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTag, setFilterTag] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [isDbLoaded, setIsDbLoaded] = useState(false);

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
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Course Catalog</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Browse published courses and verify your organizational competencies.
          </p>
        </div>
        {isDbLoaded && (
          <Badge variant="secondary" className="gap-1 text-xs bg-primary/10 text-primary">
            <Sparkles className="h-3.5 w-3.5 text-primary" /> Live MongoDB Data
          </Badge>
        )}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
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
          <p className="text-xs text-muted-foreground mt-1 max-w-sm">
            Try adjusting your search query or filter settings.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <CourseCard key={course._id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}
