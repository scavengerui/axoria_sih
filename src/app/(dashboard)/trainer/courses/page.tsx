'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, BarChart3, Edit, PlayCircle } from 'lucide-react'
import Link from 'next/link'

const mockCourses = [
  {
    id: 1,
    title: 'Advanced React Patterns',
    status: 'published',
    enrolled: 124,
    completion: 68,
    avgScore: 85,
  },
  {
    id: 2,
    title: 'Introduction to GraphQL',
    status: 'draft',
    enrolled: 0,
    completion: 0,
    avgScore: 0,
  },
  {
    id: 3,
    title: 'Team Leadership 101',
    status: 'pending',
    enrolled: 0,
    completion: 0,
    avgScore: 0,
  },
  {
    id: 4,
    title: 'Outdated Security Practices',
    status: 'rejected',
    enrolled: 0,
    completion: 0,
    avgScore: 0,
  }
]

export default function TrainerCoursesPage() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published': return <Badge className="bg-success text-white hover:bg-success/90">Published</Badge>
      case 'pending': return <Badge className="bg-warning text-white hover:bg-warning/90">Pending</Badge>
      case 'rejected': return <Badge variant="destructive">Rejected</Badge>
      case 'draft': return <Badge variant="secondary">Draft</Badge>
      default: return null
    }
  }

  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Courses</h1>
          <p className="text-muted-foreground mt-1">Manage and track your training content</p>
        </div>
        <Link href="/trainer/courses/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" /> Create Course
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {mockCourses.map((course) => (
          <Card key={course.id} className="overflow-hidden flex flex-col">
            <div className="h-32 bg-muted flex items-center justify-center border-b">
              <PlayCircle className="w-12 h-12 text-muted-foreground/30" />
            </div>
            <CardContent className="p-6 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-semibold text-lg line-clamp-2 pr-2">{course.title}</h3>
                {getStatusBadge(course.status)}
              </div>
              
              <div className="grid grid-cols-3 gap-2 text-center text-sm mb-6 mt-auto bg-muted/30 rounded-lg p-3">
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Enrolled</p>
                  <p className="font-medium">{course.enrolled}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Completion</p>
                  <p className="font-medium">{course.completion}%</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Avg Score</p>
                  <p className="font-medium">{course.avgScore}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" size="sm">
                  <Edit className="w-4 h-4 mr-2" /> Edit
                </Button>
                <Button variant="secondary" className="flex-1" size="sm" disabled={course.status !== 'published'}>
                  <BarChart3 className="w-4 h-4 mr-2" /> Analytics
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
