"use client"

import * as React from "react"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { useCourse } from "@/hooks/use-courses"
import type { LessonWithDetails } from "@/hooks/use-lessons"
import { CourseDialog } from "@/components/courses/course-dialog"
import { ScheduleLessonDialog } from "@/components/lessons/schedule-lesson-dialog"
import { RescheduleLessonDialog } from "@/components/lessons/reschedule-lesson-dialog"
import { LessonCard } from "@/components/lessons/lesson-card"
import { AttachResourceDialog } from "@/components/resources/attach-resource-dialog"
import { ResourceList } from "@/components/resources/resource-list"
import {
  ArrowLeft,
  Calendar,
  Plus,
  Users,
  Paperclip,
  Edit2,
  UserPlus,
  BookOpen,
  Loader2,
  Clock,
  CheckCircle2,
} from "lucide-react"

export default function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = React.use(params)
  const { data, isLoading, error } = useCourse(id)

  // Dialog States
  const [isEditCourseOpen, setIsEditCourseOpen] = React.useState(false)
  const [isScheduleOpen, setIsScheduleOpen] = React.useState(false)
  const [selectedLessonForReschedule, setSelectedLessonForReschedule] =
    React.useState<LessonWithDetails | null>(null)
  const [isAttachResourceOpen, setIsAttachResourceOpen] = React.useState(false)
  const [resourceTargetLesson, setResourceTargetLesson] = React.useState<{
    id?: string
    title?: string
  } | null>(null)

  const course = data?.course

  const handleAttachCourseResource = () => {
    setResourceTargetLesson(null)
    setIsAttachResourceOpen(true)
  }

  const handleAttachLessonResource = (lesson: LessonWithDetails) => {
    setResourceTargetLesson({ id: lesson.id, title: lesson.title })
    setIsAttachResourceOpen(true)
  }

  const getLevelVariant = (level: string) => {
    if (level.startsWith("A")) return "cefr-a" as const
    if (level.startsWith("B")) return "cefr-b" as const
    return "cefr-c" as const
  }

  return (
    <div className="min-h-screen bg-page text-ink pb-20">
      {/* Top Navigation */}
      <header className="sticky top-0 z-30 border-b border-border bg-surface shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/teacher/courses"
              className="flex items-center gap-2 text-muted hover:text-ink transition-colors mr-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-xs font-semibold hidden sm:inline">All Courses</span>
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
          </div>

          <div className="flex items-center gap-2.5">
            <Link href="/teacher/schedule">
              <Button variant="outline" size="sm" className="hidden sm:flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-teal" />
                <span>Full Schedule</span>
              </Button>
            </Link>
            <ThemeToggle />
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsScheduleOpen(true)}
              className="flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule Lesson</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-20 rounded-2xl border border-border bg-surface text-center">
            <Loader2 className="w-8 h-8 text-teal animate-spin mb-3" />
            <span className="text-sm font-medium text-muted">
              Loading course curriculum & schedule...
            </span>
          </div>
        ) : error || !course ? (
          <div className="p-8 rounded-2xl border border-coral bg-coral-light/20 text-center space-y-3">
            <p className="text-sm font-semibold text-coral">
              {(error as Error)?.message || "Course not found"}
            </p>
            <Link href="/teacher/courses">
              <Button variant="outline" size="sm">
                Back to Courses
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Course Header Banner */}
            <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-surface-2 text-ink">
                      {course.language}
                    </span>
                    <Badge variant={getLevelVariant(course.level)}>
                      CEFR Level {course.level}
                    </Badge>
                  </div>

                  <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink">
                    {course.title}
                  </h1>

                  <p className="text-sm text-muted max-w-3xl leading-relaxed">
                    {course.description || "No curriculum description provided yet."}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditCourseOpen(true)}
                    className="flex items-center gap-1.5"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Details</span>
                  </Button>
                  <Link href={`/teacher/invites?courseId=${course.id}`}>
                    <Button variant="secondary" size="sm" className="flex items-center gap-1.5">
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Invite Students</span>
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Course Meta Ribbon */}
              <div className="mt-6 pt-5 border-t border-border flex flex-wrap items-center gap-6 text-xs text-muted">
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-teal" />
                  <strong>{course.enrollments.length}</strong> Enrolled Students
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-teal" />
                  <strong>{course.lessons.length}</strong> Scheduled Lessons
                </span>
                <span className="flex items-center gap-1.5">
                  <Paperclip className="w-4 h-4 text-teal" />
                  <strong>{course.resources.length}</strong> Course Materials
                </span>
              </div>
            </div>

            {/* Grid Layout: Lessons on Left (2 cols), Resources & Students on Right (1 col) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Scheduled Lessons Column (Span 2) */}
              <div className="lg:col-span-2 space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-display text-xl font-bold text-ink flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-teal" />
                      Lesson Schedule
                    </h2>
                    <p className="text-xs text-muted mt-0.5">
                      Times are rendered in your local timezone and stored in UTC.
                    </p>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setIsScheduleOpen(true)}
                    className="flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Schedule Lesson</span>
                  </Button>
                </div>

                {course.lessons.length === 0 ? (
                  <div className="p-8 sm:p-12 rounded-2xl border border-dashed border-border bg-surface text-center space-y-3">
                    <div className="size-10 rounded-xl bg-teal-light text-teal flex items-center justify-center mx-auto">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-display text-base font-bold text-ink">
                        No lessons scheduled yet
                      </h4>
                      <p className="text-xs text-muted mt-1 max-w-sm mx-auto">
                        Plan your first interactive video classroom session with grammar objectives and practice exercises.
                      </p>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setIsScheduleOpen(true)}
                      className="inline-flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Schedule First Lesson</span>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {course.lessons.map((lesson) => (
                      <LessonCard
                        key={lesson.id}
                        lesson={{
                          ...lesson,
                          course: {
                            id: course.id,
                            title: course.title,
                            language: course.language,
                            level: course.level,
                            enrollments: course.enrollments,
                          },
                        }}
                        onReschedule={(l) => setSelectedLessonForReschedule(l)}
                        onAttachResource={(l) => handleAttachLessonResource(l)}
                        isTeacher={true}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Sidebar Column: Resources and Students */}
              <div className="space-y-6">
                {/* Course Resources Card */}
                <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-display text-base font-bold text-ink flex items-center gap-1.5">
                        <Paperclip className="w-4 h-4 text-teal" />
                        Course Materials
                      </h3>
                      <p className="text-[11px] text-muted">
                        General resources accessible across all lessons
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAttachCourseResource}
                      className="h-8 text-xs px-2.5"
                    >
                      + Attach
                    </Button>
                  </div>

                  <ResourceList
                    resources={course.resources}
                    canDelete={true}
                  />
                </div>

                {/* Enrolled Students Card */}
                <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-display text-base font-bold text-ink flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-teal" />
                        Enrolled Students ({course.enrollments.length})
                      </h3>
                      <p className="text-[11px] text-muted">
                        Active participants in this course
                      </p>
                    </div>
                    <Link href={`/teacher/invites?courseId=${course.id}`}>
                      <Button variant="ghost" size="sm" className="h-8 text-xs px-2 text-teal font-semibold">
                        + Invite
                      </Button>
                    </Link>
                  </div>

                  {course.enrollments.length === 0 ? (
                    <div className="p-4 rounded-xl border border-dashed border-border text-center text-xs text-muted">
                      No students enrolled yet. Use invitations to enroll students into this course.
                    </div>
                  ) : (
                    <div className="divide-y divide-border/60">
                      {course.enrollments.map((enr) => (
                        <div key={enr.id} className="py-2.5 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2.5">
                            <div className="size-7 rounded-full bg-teal-light text-teal font-bold flex items-center justify-center text-xs">
                              {enr.student.user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <span className="font-semibold text-ink block">
                                {enr.student.user.name}
                              </span>
                              <span className="text-muted text-[11px]">
                                {enr.student.user.email}
                              </span>
                            </div>
                          </div>

                          <span className="text-[10px] font-mono text-muted bg-surface-2 px-1.5 py-0.5 rounded">
                            {enr.student.user.timezone || "UTC"}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Course Edit Dialog */}
      {course && (
        <CourseDialog
          isOpen={isEditCourseOpen}
          onClose={() => setIsEditCourseOpen(false)}
          courseToEdit={{
            ...course,
            _count: {
              enrollments: course.enrollments.length,
              lessons: course.lessons.length,
              resources: course.resources.length,
            },
          }}
        />
      )}

      {/* Schedule Lesson Dialog */}
      {course && (
        <ScheduleLessonDialog
          isOpen={isScheduleOpen}
          onClose={() => setIsScheduleOpen(false)}
          defaultCourseId={course.id}
        />
      )}

      {/* Reschedule Lesson Dialog */}
      <RescheduleLessonDialog
        isOpen={!!selectedLessonForReschedule}
        onClose={() => setSelectedLessonForReschedule(null)}
        lesson={selectedLessonForReschedule}
      />

      {/* Attach Resource Dialog */}
      {course && (
        <AttachResourceDialog
          isOpen={isAttachResourceOpen}
          onClose={() => setIsAttachResourceOpen(false)}
          courseId={course.id}
          lessonId={resourceTargetLesson?.id}
          lessonTitle={resourceTargetLesson?.title}
        />
      )}
    </div>
  )
}
