"use client"

import * as React from "react"
import { Button } from "@workspace/ui/components/button"
import { Input, Textarea, Select, FormField } from "@workspace/ui/components/form-elements"
import { useScheduleLesson } from "@/hooks/use-lessons"
import { useCourses } from "@/hooks/use-courses"
import {
  COMMON_TIMEZONES,
  getBrowserTimezone,
  localToUtcIso,
  formatInTimezone,
} from "@/lib/date-utils"
import { X, Clock, Calendar as CalendarIcon, Globe } from "lucide-react"

interface ScheduleLessonDialogProps {
  isOpen: boolean
  onClose: () => void
  defaultCourseId?: string
  onSuccess?: () => void
}

export function ScheduleLessonDialog({
  isOpen,
  onClose,
  defaultCourseId,
  onSuccess,
}: ScheduleLessonDialogProps) {
  const [courseId, setCourseId] = React.useState(defaultCourseId || "")
  const [title, setTitle] = React.useState("")
  const [datetimeLocal, setDatetimeLocal] = React.useState("")
  const [durationMins, setDurationMins] = React.useState(60)
  const [timezone, setTimezone] = React.useState(getBrowserTimezone())
  const [objectives, setObjectives] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)

  const { data: coursesData } = useCourses()
  const scheduleMutation = useScheduleLesson()

  // Initialize with tomorrow at 10:00 AM in the current timezone
  React.useEffect(() => {
    if (isOpen) {
      if (defaultCourseId) {
        setCourseId(defaultCourseId)
      } else if (coursesData?.courses?.length && !courseId) {
        setCourseId(coursesData.courses[0]?.id || "")
      }

      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(10, 0, 0, 0)
      
      const year = tomorrow.getFullYear()
      const month = String(tomorrow.getMonth() + 1).padStart(2, "0")
      const day = String(tomorrow.getDate()).padStart(2, "0")
      setDatetimeLocal(`${year}-${month}-${day}T10:00`)
      setTimezone(getBrowserTimezone())
      setTitle("")
      setObjectives("")
      setError(null)
    }
  }, [isOpen, defaultCourseId, coursesData])

  if (!isOpen) return null

  // Calculate live preview in UTC
  let utcPreview = ""
  if (datetimeLocal && timezone) {
    try {
      const utcIso = localToUtcIso(datetimeLocal, timezone)
      utcPreview = formatInTimezone(utcIso, "UTC")
    } catch {
      utcPreview = ""
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!courseId) {
      setError("Please select a course")
      return
    }

    if (!title.trim()) {
      setError("Please provide a lesson title")
      return
    }

    if (!datetimeLocal) {
      setError("Please choose a date and time")
      return
    }

    try {
      const scheduledAtUtc = localToUtcIso(datetimeLocal, timezone)

      await scheduleMutation.mutateAsync({
        courseId,
        title: title.trim(),
        scheduledAt: scheduledAtUtc,
        durationMins,
        timezone,
        objectives: objectives.trim() || undefined,
      })

      onClose()
      onSuccess?.()
    } catch (err: any) {
      setError(err.message || "Failed to schedule lesson")
    }
  }

  const selectedCourse = coursesData?.courses.find((c) => c.id === courseId)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-2xl bg-surface border border-border shadow-2xl p-6 sm:p-7 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          disabled={scheduleMutation.isPending}
          className="absolute top-5 right-5 p-1 rounded-lg text-muted hover:text-ink hover:bg-surface-2 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <h2 className="font-display text-2xl font-bold text-ink flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-teal" />
            Schedule New Lesson
          </h2>
          <p className="text-sm text-muted mt-1">
            Pick a date, time, and timezone. Dates are automatically stored in UTC and converted to local time for participants.
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-lg bg-coral-light/20 border border-coral text-sm text-coral font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!defaultCourseId && (
            <FormField label="Target Course" required hint="The course this lesson belongs to">
              <Select
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
              >
                <option value="" disabled>Select a course...</option>
                {coursesData?.courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title} ({course.language} {course.level})
                  </option>
                ))}
              </Select>
            </FormField>
          )}

          <FormField label="Lesson Title" required hint="e.g., Subjunctive Mood & Dialogue Practice">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter lesson topic or title"
              required
              autoFocus
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Date & Time" required>
              <Input
                type="datetime-local"
                value={datetimeLocal}
                onChange={(e) => setDatetimeLocal(e.target.value)}
                required
              />
            </FormField>

            <FormField label="Duration" required>
              <Select
                value={durationMins}
                onChange={(e) => setDurationMins(Number(e.target.value))}
              >
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>60 minutes (1 hr)</option>
                <option value={90}>90 minutes (1.5 hrs)</option>
                <option value={120}>120 minutes (2 hrs)</option>
              </Select>
            </FormField>
          </div>

          <FormField
            label="Lesson Timezone"
            required
            hint="Timezone used for this scheduled time"
          >
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-muted shrink-0" />
              <Select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
              >
                {COMMON_TIMEZONES.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </Select>
            </div>
          </FormField>

          {/* Timezone Normalization Preview Card */}
          {utcPreview && (
            <div className="p-3 rounded-xl bg-surface-2 border border-border/80 text-xs space-y-1">
              <div className="flex items-center justify-between text-ink font-medium">
                <span className="flex items-center gap-1.5 text-teal">
                  <Clock className="w-3.5 h-3.5" /> UTC Normalized:
                </span>
                <span className="font-mono text-muted">{utcPreview}</span>
              </div>
              <p className="text-muted leading-relaxed">
                Stored in database as UTC. Students will see this lesson converted to their own local timezone.
              </p>
            </div>
          )}

          {selectedCourse && (
            <div className="p-3 rounded-xl bg-teal-light/20 border border-teal-mid/30 text-xs text-ink flex items-center justify-between">
              <span>Enrolled Participants:</span>
              <span className="font-bold text-teal">
                {selectedCourse._count.enrollments} student(s) will receive this session
              </span>
            </div>
          )}

          <FormField
            label="Learning Objectives"
            hint="Key outcomes, grammar focus, or vocabulary themes"
          >
            <Textarea
              value={objectives}
              onChange={(e) => setObjectives(e.target.value)}
              placeholder="- Master conditional tense formation&#10;- Practice ordering at a restaurant&#10;- Review 15 target vocabulary items"
              rows={3}
            />
          </FormField>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={scheduleMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={scheduleMutation.isPending}
            >
              {scheduleMutation.isPending ? "Scheduling..." : "Schedule Lesson"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
