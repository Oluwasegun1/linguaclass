"use client"

import * as React from "react"
import { LessonCard } from "@/components/lessons/lesson-card"
import type { LessonWithDetails } from "@/hooks/use-lessons"
import { Calendar } from "lucide-react"

interface StudentLessonListProps {
  lessons: any[]
  studentTimezone: string
}

export function StudentLessonList({
  lessons,
  studentTimezone,
}: StudentLessonListProps) {
  if (!lessons || lessons.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center space-y-2">
        <Calendar className="w-6 h-6 text-teal mx-auto" />
        <h4 className="font-display text-base font-bold text-ink">
          No upcoming lessons scheduled
        </h4>
        <p className="text-xs text-muted max-w-sm mx-auto">
          Your teachers haven't scheduled live sessions for this week yet. Check back soon!
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {lessons.map((lesson) => (
        <LessonCard
          key={lesson.id}
          lesson={{
            ...lesson,
            scheduledAt:
              typeof lesson.scheduledAt === "string"
                ? lesson.scheduledAt
                : lesson.scheduledAt.toISOString(),
            createdAt:
              typeof lesson.createdAt === "string"
                ? lesson.createdAt
                : lesson.createdAt.toISOString(),
            updatedAt:
              typeof lesson.updatedAt === "string"
                ? lesson.updatedAt
                : lesson.updatedAt.toISOString(),
          }}
          viewerTimezone={studentTimezone}
          isTeacher={false}
          onReschedule={() => {}}
          onAttachResource={() => {}}
        />
      ))}
    </div>
  )
}
