"use client"

import * as React from "react"
import Link from "next/link"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { type LessonWithDetails, useDeleteLesson } from "@/hooks/use-lessons"
import { formatLessonTimes, getBrowserTimezone } from "@/lib/date-utils"
import { ResourceList } from "@/components/resources/resource-list"
import {
  Calendar,
  Clock,
  Globe,
  Users,
  Paperclip,
  CheckCircle2,
  Trash2,
  Edit,
  Video,
  Sparkles,
} from "lucide-react"

interface LessonCardProps {
  lesson: LessonWithDetails
  onReschedule: (lesson: LessonWithDetails) => void
  onAttachResource: (lesson: LessonWithDetails) => void
  viewerTimezone?: string
  isTeacher?: boolean
}

export function LessonCard({
  lesson,
  onReschedule,
  onAttachResource,
  viewerTimezone = getBrowserTimezone(),
  isTeacher = true,
}: LessonCardProps) {
  const deleteMutation = useDeleteLesson()
  const [showResources, setShowResources] = React.useState(false)

  const times = formatLessonTimes(
    lesson.scheduledAt,
    lesson.timezone || "UTC",
    viewerTimezone
  )

  const getStatusBadge = () => {
    switch (lesson.status) {
      case "LIVE":
        return <Badge variant="live">LIVE SESSION</Badge>
      case "SCHEDULED":
        return <Badge variant="scheduled">SCHEDULED</Badge>
      case "COMPLETED":
        return <Badge variant="completed">COMPLETED</Badge>
      case "CANCELLED":
        return <Badge variant="error">CANCELLED</Badge>
      default:
        return <Badge variant="scheduled">{lesson.status}</Badge>
    }
  }

  const handleDelete = async () => {
    if (window.confirm(`Delete lesson "${lesson.title}"?`)) {
      try {
        await deleteMutation.mutateAsync(lesson.id)
      } catch (err: any) {
        alert(err.message || "Failed to delete lesson")
      }
    }
  }

  const participants = lesson.course?.enrollments || []

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-xs hover:border-teal/40 transition-all duration-150 flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            {getStatusBadge()}
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-surface-2 text-ink">
              {lesson.course.title}
            </span>
          </div>

          {isTeacher && (
            <div className="flex items-center gap-1">
              <Link href={`/teacher/lessons/${lesson.id}/review`} title="AI Review & Pedagogical Insights">
                <span className="p-1.5 rounded-lg text-teal hover:bg-teal-light/40 transition-colors inline-flex">
                  <Sparkles className="w-4 h-4" />
                </span>
              </Link>
              <button
                onClick={() => onReschedule(lesson)}
                className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-surface-2 transition-colors"
                title="Reschedule / edit lesson"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="p-1.5 rounded-lg text-muted hover:text-coral hover:bg-coral-light/20 transition-colors"
                title="Delete lesson"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        <h4 className="font-display text-lg font-bold text-ink mb-2">
          {lesson.title}
        </h4>

        {/* Localized Time & Timezone Display */}
        <div className="space-y-1.5 mb-4 p-3 rounded-xl bg-surface-2 border border-border/80">
          <div className="flex items-center gap-2 text-sm font-semibold text-ink">
            <Calendar className="w-4 h-4 text-teal shrink-0" />
            <span>{times.viewerTime}</span>
            <span className="text-xs text-teal font-normal">(Your Time)</span>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {lesson.durationMins} mins
            </span>
            <span className="flex items-center gap-1">
              <Globe className="w-3.5 h-3.5" />
              Scheduled: {times.lessonTzTime}
            </span>
            <span className="font-mono text-[11px] text-muted-light">
              UTC: {times.utcTime}
            </span>
          </div>
        </div>

        {/* Objectives */}
        {lesson.objectives && (
          <div className="mb-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted block mb-1">
              Objectives
            </span>
            <p className="text-xs text-ink/85 whitespace-pre-line leading-relaxed bg-surface-2/40 p-2.5 rounded-lg border border-border/50">
              {lesson.objectives}
            </p>
          </div>
        )}

        {/* Participants section */}
        <div className="flex items-center justify-between py-2 border-t border-border/60 text-xs">
          <span className="flex items-center gap-1.5 font-medium text-muted">
            <Users className="w-3.5 h-3.5 text-teal" />
            Participants ({participants.length}):
          </span>

          <div className="flex items-center -space-x-1.5 overflow-hidden">
            {participants.slice(0, 4).map((p, idx) => (
              <div
                key={idx}
                className="size-6 rounded-full border-2 border-surface bg-teal-light text-teal flex items-center justify-center text-[10px] font-bold"
                title={p.student.user.name}
              >
                {p.student.user.name.charAt(0).toUpperCase()}
              </div>
            ))}
            {participants.length > 4 && (
              <div className="size-6 rounded-full border-2 border-surface bg-surface-2 text-muted flex items-center justify-center text-[9px] font-semibold">
                +{participants.length - 4}
              </div>
            )}
            {participants.length === 0 && (
              <span className="text-muted italic">No students yet</span>
            )}
          </div>
        </div>

        {/* Attached Lesson Materials Accordion/Section */}
        <div className="mt-3 pt-3 border-t border-border/60">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => setShowResources(!showResources)}
              className="flex items-center gap-1 text-xs font-semibold text-teal hover:underline"
            >
              <Paperclip className="w-3.5 h-3.5" />
              Lesson Materials ({lesson.resources.length})
            </button>

            {isTeacher && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onAttachResource(lesson)}
                className="text-xs text-teal hover:bg-teal-light/30 px-2 py-1 h-auto"
              >
                + Attach
              </Button>
            )}
          </div>

          {showResources && (
            <div className="mt-2">
              <ResourceList
                resources={lesson.resources}
                canDelete={isTeacher}
              />
            </div>
          )}
        </div>
      </div>

      {/* Footer Action Buttons */}
      <div className="mt-5 pt-3 border-t border-border flex items-center justify-between gap-2">
        {lesson.status === "LIVE" ? (
          <Button
            variant="primary"
            size="sm"
            className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-1.5"
            onClick={() => window.open(`/classroom/${lesson.id}`, "_blank")}
          >
            <Video className="w-4 h-4" />
            Join Live Classroom
          </Button>
        ) : lesson.status === "SCHEDULED" ? (
          <div className="flex items-center gap-2 w-full">
            {isTeacher && (
              <Link href={`/teacher/lessons/${lesson.id}/review`} className="flex-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full flex items-center justify-center gap-1 text-teal border-teal/40 hover:bg-teal-light/20"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Review</span>
                </Button>
              </Link>
            )}
            <Button
              variant="primary"
              size="sm"
              className={isTeacher ? "flex-1" : "w-full"}
              onClick={() => window.open(`/classroom/${lesson.id}`, "_blank")}
            >
              Classroom
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full gap-2">
            <span className="text-xs font-medium text-muted">
              Session {lesson.status.toLowerCase()}
            </span>
            {isTeacher && (
              <Link href={`/teacher/lessons/${lesson.id}/review`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs flex items-center gap-1 text-teal border-teal/40"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Review</span>
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
