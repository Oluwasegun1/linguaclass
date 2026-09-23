"use client"

import * as React from "react"
import { Button } from "@workspace/ui/components/button"
import { Input, Textarea, Select, FormField } from "@workspace/ui/components/form-elements"
import { useRescheduleLesson, useCancelLesson, type LessonWithDetails } from "@/hooks/use-lessons"
import {
  COMMON_TIMEZONES,
  getBrowserTimezone,
  localToUtcIso,
  utcToDateTimeLocalValue,
  formatInTimezone,
} from "@/lib/date-utils"
import { X, Clock, AlertTriangle } from "lucide-react"

interface RescheduleLessonDialogProps {
  isOpen: boolean
  onClose: () => void
  lesson: LessonWithDetails | null
  onSuccess?: () => void
}

export function RescheduleLessonDialog({
  isOpen,
  onClose,
  lesson,
  onSuccess,
}: RescheduleLessonDialogProps) {
  const [title, setTitle] = React.useState("")
  const [datetimeLocal, setDatetimeLocal] = React.useState("")
  const [durationMins, setDurationMins] = React.useState(60)
  const [timezone, setTimezone] = React.useState(getBrowserTimezone())
  const [objectives, setObjectives] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const [isConfirmingCancel, setIsConfirmingCancel] = React.useState(false)

  const rescheduleMutation = useRescheduleLesson()
  const cancelMutation = useCancelLesson()

  React.useEffect(() => {
    if (lesson && isOpen) {
      setTitle(lesson.title)
      const tz = lesson.timezone || getBrowserTimezone()
      setTimezone(tz)
      setDatetimeLocal(utcToDateTimeLocalValue(lesson.scheduledAt, tz))
      setDurationMins(lesson.durationMins || 60)
      setObjectives(lesson.objectives || "")
      setError(null)
      setIsConfirmingCancel(false)
    }
  }, [lesson, isOpen])

  if (!isOpen || !lesson) return null

  const isPending = rescheduleMutation.isPending || cancelMutation.isPending

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

    if (!title.trim()) {
      setError("Please provide a lesson title")
      return
    }

    if (!datetimeLocal) {
      setError("Please specify date and time")
      return
    }

    try {
      const scheduledAtUtc = localToUtcIso(datetimeLocal, timezone)

      await rescheduleMutation.mutateAsync({
        id: lesson.id,
        title: title.trim(),
        scheduledAt: scheduledAtUtc,
        durationMins,
        timezone,
        objectives: objectives.trim() || undefined,
      })

      onClose()
      onSuccess?.()
    } catch (err: any) {
      setError(err.message || "Failed to update lesson")
    }
  }

  const handleCancelLesson = async () => {
    try {
      await cancelMutation.mutateAsync(lesson.id)
      onClose()
      onSuccess?.()
    } catch (err: any) {
      setError(err.message || "Failed to cancel lesson")
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-2xl bg-surface border border-border shadow-2xl p-6 sm:p-7 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          disabled={isPending}
          className="absolute top-5 right-5 p-1 rounded-lg text-muted hover:text-ink hover:bg-surface-2 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <h2 className="font-display text-2xl font-bold text-ink">
            Reschedule / Manage Lesson
          </h2>
          <p className="text-sm text-muted mt-1">
            Course: <strong className="text-ink">{lesson.course.title}</strong>
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-lg bg-coral-light/20 border border-coral text-sm text-coral font-medium">
            {error}
          </div>
        )}

        {isConfirmingCancel ? (
          <div className="p-4 rounded-xl border border-coral bg-coral-light/20 space-y-3">
            <div className="flex items-center gap-2 text-coral font-bold">
              <AlertTriangle className="w-5 h-5" />
              <span>Cancel this lesson?</span>
            </div>
            <p className="text-xs text-ink/80 leading-relaxed">
              This will mark the lesson as CANCELLED for all enrolled participants. The scheduled live video room will be deactivated.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsConfirmingCancel(false)}
                disabled={isPending}
              >
                Go Back
              </Button>
              <Button
                type="button"
                className="bg-coral hover:bg-coral-dark text-white"
                onClick={handleCancelLesson}
                disabled={isPending}
              >
                {cancelMutation.isPending ? "Cancelling..." : "Confirm Cancellation"}
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Lesson Title" required>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </FormField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Reschedule Date & Time" required>
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

            <FormField label="Timezone" required>
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
            </FormField>

            {utcPreview && (
              <div className="p-3 rounded-xl bg-surface-2 border border-border/80 text-xs flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-teal font-medium">
                  <Clock className="w-3.5 h-3.5" /> UTC Time:
                </span>
                <span className="font-mono text-muted">{utcPreview}</span>
              </div>
            )}

            <FormField label="Objectives">
              <Textarea
                value={objectives}
                onChange={(e) => setObjectives(e.target.value)}
                rows={3}
              />
            </FormField>

            <div className="flex items-center justify-between pt-4 border-t border-border">
              {lesson.status !== "CANCELLED" ? (
                <button
                  type="button"
                  onClick={() => setIsConfirmingCancel(true)}
                  className="text-xs font-semibold text-coral hover:underline"
                >
                  Cancel Lesson
                </button>
              ) : (
                <span className="text-xs font-semibold text-coral">Lesson is Cancelled</span>
              )}

              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isPending}
                >
                  Close
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isPending}
                >
                  {rescheduleMutation.isPending ? "Saving..." : "Save Rescheduled Time"}
                </Button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
