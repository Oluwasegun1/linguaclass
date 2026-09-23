"use client"

import * as React from "react"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@workspace/ui/components/button"
import { Select } from "@workspace/ui/components/form-elements"
import { useLessons, type LessonWithDetails } from "@/hooks/use-lessons"
import { useCourses } from "@/hooks/use-courses"
import { ScheduleLessonDialog } from "@/components/lessons/schedule-lesson-dialog"
import { RescheduleLessonDialog } from "@/components/lessons/reschedule-lesson-dialog"
import { AttachResourceDialog } from "@/components/resources/attach-resource-dialog"
import { LessonCard } from "@/components/lessons/lesson-card"
import {
  COMMON_TIMEZONES,
  getBrowserTimezone,
} from "@/lib/date-utils"
import {
  Calendar,
  Plus,
  ArrowLeft,
  Filter,
  Globe,
  Loader2,
  BookOpen,
} from "lucide-react"

export default function TeacherSchedulePage() {
  const [selectedCourseId, setSelectedCourseId] = React.useState<string>("")
  const [selectedStatus, setSelectedStatus] = React.useState<string>("")
  const [activeTimezone, setActiveTimezone] = React.useState(getBrowserTimezone())

  const { data: coursesData } = useCourses()
  const { data: lessonsData, isLoading, error } = useLessons(
    selectedCourseId || undefined,
    selectedStatus || undefined
  )

  // Dialogs
  const [isScheduleOpen, setIsScheduleOpen] = React.useState(false)
  const [selectedLessonForReschedule, setSelectedLessonForReschedule] =
    React.useState<LessonWithDetails | null>(null)
  const [resourceTargetLesson, setResourceTargetLesson] = React.useState<LessonWithDetails | null>(null)

  const lessons = lessonsData?.lessons || []

  return (
    <div className="min-h-screen bg-page text-ink pb-20">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-surface shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/teacher/dashboard"
              className="flex items-center gap-2 text-muted hover:text-ink transition-colors mr-2"
            >
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
              Master Schedule
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <Link href="/teacher/courses">
              <Button variant="outline" size="sm" className="hidden sm:flex">
                <span>Courses</span>
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
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-teal uppercase tracking-wider">
              Calendar & Timezone Synchronization
            </span>
            <h1 className="font-display text-3xl font-bold text-ink mt-1 flex items-center gap-2">
              <Calendar className="w-7 h-7 text-teal" />
              Lesson Schedule
            </h1>
            <p className="text-sm text-muted mt-1 max-w-xl">
              View upcoming live classroom sessions across all your courses. Automatically synchronized to UTC and rendered in your viewer timezone.
            </p>
          </div>

          {/* Timezone Switcher */}
          <div className="flex items-center gap-2 bg-surface p-2 rounded-xl border border-border self-start sm:self-auto text-xs shadow-xs">
            <Globe className="w-4 h-4 text-teal shrink-0 ml-1" />
            <span className="text-muted font-medium hidden md:inline">Viewing in:</span>
            <div className="w-48 sm:w-56">
              <Select
                value={activeTimezone}
                onChange={(e) => setActiveTimezone(e.target.value)}
                className="py-1 text-xs"
              >
                {COMMON_TIMEZONES.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="p-4 rounded-2xl border border-border bg-surface shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted shrink-0">
              <Filter className="w-3.5 h-3.5" />
              <span>Filter Course:</span>
            </div>
            <div className="w-full sm:w-60">
              <Select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="py-1.5 text-xs"
              >
                <option value="">All Courses ({coursesData?.courses?.length || 0})</option>
                {coursesData?.courses?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title} ({c.language})
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {/* Status Segmented Buttons */}
          <div className="flex items-center gap-1 bg-surface-2 p-1 rounded-xl border border-border self-start md:self-auto overflow-x-auto max-w-full">
            {[
              { label: "All", value: "" },
              { label: "Scheduled", value: "SCHEDULED" },
              { label: "Live Now", value: "LIVE" },
              { label: "Completed", value: "COMPLETED" },
              { label: "Cancelled", value: "CANCELLED" },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setSelectedStatus(tab.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                  selectedStatus === tab.value
                    ? "bg-surface text-ink shadow-xs"
                    : "text-muted hover:text-ink"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Lessons List */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-20 rounded-2xl border border-border bg-surface text-center">
            <Loader2 className="w-8 h-8 text-teal animate-spin mb-3" />
            <span className="text-sm font-medium text-muted">
              Loading scheduled lessons...
            </span>
          </div>
        ) : error ? (
          <div className="p-8 rounded-2xl border border-coral bg-coral-light/20 text-center">
            <p className="text-sm font-semibold text-coral">
              {(error as Error)?.message || "Failed to load schedule"}
            </p>
          </div>
        ) : lessons.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lessons.map((lesson) => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                viewerTimezone={activeTimezone}
                onReschedule={(l) => setSelectedLessonForReschedule(l)}
                onAttachResource={(l) => setResourceTargetLesson(l)}
                isTeacher={true}
              />
            ))}
          </div>
        ) : (
          <div className="p-12 sm:p-16 rounded-2xl border border-dashed border-border bg-surface text-center max-w-xl mx-auto space-y-4">
            <div className="size-12 rounded-2xl bg-teal-light text-teal flex items-center justify-center mx-auto">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display text-xl font-bold text-ink">
                No lessons found
              </h3>
              <p className="text-sm text-muted mt-1 leading-relaxed">
                {selectedCourseId || selectedStatus
                  ? "No lessons match the selected filter criteria. Try resetting filters."
                  : "You haven't scheduled any lessons yet. Add a session to your calendar."}
              </p>
            </div>
            <Button
              variant="primary"
              onClick={() => setIsScheduleOpen(true)}
              className="inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule a Lesson</span>
            </Button>
          </div>
        )}
      </main>

      {/* Dialogs */}
      <ScheduleLessonDialog
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        defaultCourseId={selectedCourseId || undefined}
      />

      <RescheduleLessonDialog
        isOpen={!!selectedLessonForReschedule}
        onClose={() => setSelectedLessonForReschedule(null)}
        lesson={selectedLessonForReschedule}
      />

      {resourceTargetLesson && (
        <AttachResourceDialog
          isOpen={!!resourceTargetLesson}
          onClose={() => setResourceTargetLesson(null)}
          courseId={resourceTargetLesson.courseId}
          lessonId={resourceTargetLesson.id}
          lessonTitle={resourceTargetLesson.title}
        />
      )}
    </div>
  )
}
