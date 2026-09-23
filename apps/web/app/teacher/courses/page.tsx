"use client"

import * as React from "react"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@workspace/ui/components/button"
import { useCourses, type CourseWithCounts } from "@/hooks/use-courses"
import { CourseCard } from "@/components/courses/course-card"
import { CourseDialog } from "@/components/courses/course-dialog"
import {
  Layers,
  Plus,
  ArrowLeft,
  Calendar,
  UserPlus,
  Loader2,
  BookOpen,
} from "lucide-react"

export default function TeacherCoursesPage() {
  const { data, isLoading, error, refetch } = useCourses()
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [courseToEdit, setCourseToEdit] = React.useState<CourseWithCounts | null>(null)

  const handleOpenCreate = () => {
    setCourseToEdit(null)
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (course: CourseWithCounts) => {
    setCourseToEdit(course)
    setIsDialogOpen(true)
  }

  return (
    <div className="min-h-screen bg-page text-ink pb-16">
      {/* Top Navigation */}
      <header className="sticky top-0 z-30 border-b border-border bg-surface shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/teacher/dashboard" className="flex items-center gap-2 text-muted hover:text-ink transition-colors mr-2">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-xs font-semibold hidden sm:inline">Dashboard</span>
            </Link>
            <div className="h-4 w-px bg-border hidden sm:block" />
            <Link href="/" className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-[var(--r-md)] bg-teal font-display text-base font-bold text-white shadow-xs">
                L
              </div>
              <span className="font-display text-lg font-semibold text-ink">
                LinguaClass
              </span>
            </Link>
            <span className="rounded-full bg-teal-light px-2.5 py-0.5 text-[11px] font-semibold text-teal border border-teal-mid/50 hidden sm:inline-block">
              Course Management
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <Link href="/teacher/schedule">
              <Button variant="outline" size="sm" className="hidden sm:flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-teal" />
                <span>Schedule</span>
              </Button>
            </Link>
            <Link href="/teacher/invites">
              <Button variant="outline" size="sm" className="hidden sm:flex items-center gap-1.5">
                <UserPlus className="w-3.5 h-3.5 text-teal" />
                <span>Invites</span>
              </Button>
            </Link>
            <ThemeToggle />
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenCreate}
              className="flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Create Course</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-teal uppercase tracking-wider">
              Curriculum & Instruction
            </span>
            <h1 className="font-display text-3xl font-bold text-ink mt-1 flex items-center gap-2">
              <Layers className="w-7 h-7 text-teal" />
              Courses
            </h1>
            <p className="text-sm text-muted mt-1 max-w-xl">
              Create, configure, and manage language courses, curriculum syllabi, and scheduled video sessions.
            </p>
          </div>

          <Button
            variant="primary"
            onClick={handleOpenCreate}
            className="flex items-center gap-2 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>New Course</span>
          </Button>
        </div>

        {/* Courses Listing */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-16 rounded-2xl border border-border bg-surface text-center">
            <Loader2 className="w-8 h-8 text-teal animate-spin mb-3" />
            <span className="text-sm font-medium text-muted">
              Loading courses from database...
            </span>
          </div>
        ) : error ? (
          <div className="p-8 rounded-2xl border border-coral bg-coral-light/20 text-center space-y-3">
            <p className="text-sm font-semibold text-coral">
              {(error as Error).message || "Failed to load courses"}
            </p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : data?.courses && data.courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onEdit={handleOpenEdit}
              />
            ))}
          </div>
        ) : (
          <div className="p-12 sm:p-16 rounded-2xl border border-dashed border-border bg-surface text-center max-w-xl mx-auto space-y-4">
            <div className="size-12 rounded-2xl bg-teal-light text-teal flex items-center justify-center mx-auto">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display text-xl font-bold text-ink">
                No courses yet
              </h3>
              <p className="text-sm text-muted mt-1 leading-relaxed">
                Create your first language course to begin scheduling live lessons, attaching learning materials, and enrolling students.
              </p>
            </div>
            <Button
              variant="primary"
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create Your First Course</span>
            </Button>
          </div>
        )}
      </main>

      {/* Modal Dialog */}
      <CourseDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        courseToEdit={courseToEdit}
      />
    </div>
  )
}
