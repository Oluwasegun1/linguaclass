"use client"

import * as React from "react"
import Link from "next/link"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { type CourseWithCounts, useDeleteCourse } from "@/hooks/use-courses"
import { Users, Calendar, FileText, ArrowRight, Edit2, Trash2 } from "lucide-react"

interface CourseCardProps {
  course: CourseWithCounts
  onEdit: (course: CourseWithCounts) => void
}

export function CourseCard({ course, onEdit }: CourseCardProps) {
  const deleteMutation = useDeleteCourse()
  const [isDeleting, setIsDeleting] = React.useState(false)

  const getLevelVariant = (level: string) => {
    if (level.startsWith("A")) return "cefr-a" as const
    if (level.startsWith("B")) return "cefr-b" as const
    return "cefr-c" as const
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (
      window.confirm(
        `Are you sure you want to delete "${course.title}"? This will remove all scheduled lessons and resources.`
      )
    ) {
      try {
        setIsDeleting(true)
        await deleteMutation.mutateAsync(course.id)
      } catch (err: any) {
        alert(err.message || "Failed to delete course")
      } finally {
        setIsDeleting(false)
      }
    }
  }

  return (
    <div className="group rounded-2xl border border-border bg-surface p-6 shadow-sm hover:border-teal/50 hover:shadow-md transition-all duration-200 flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-surface-2 text-ink">
              {course.language}
            </span>
            <Badge variant={getLevelVariant(course.level)}>
              CEFR {course.level}
            </Badge>
          </div>

          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(course)}
              className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-surface-2 transition-colors"
              title="Edit course"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-1.5 rounded-lg text-muted hover:text-coral hover:bg-coral-light/20 transition-colors"
              title="Delete course"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <h3 className="font-display text-xl font-bold text-ink group-hover:text-teal transition-colors line-clamp-1">
          {course.title}
        </h3>

        <p className="text-sm text-muted mt-2 line-clamp-2 min-h-[2.5rem]">
          {course.description || "No description provided."}
        </p>

        <div className="flex items-center gap-4 mt-5 pt-4 border-t border-border/60 text-xs text-muted">
          <span className="flex items-center gap-1.5 font-medium">
            <Users className="w-3.5 h-3.5 text-teal" />
            {course._count.enrollments}{" "}
            {course._count.enrollments === 1 ? "student" : "students"}
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <Calendar className="w-3.5 h-3.5 text-teal" />
            {course._count.lessons}{" "}
            {course._count.lessons === 1 ? "lesson" : "lessons"}
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <FileText className="w-3.5 h-3.5 text-teal" />
            {course._count.resources}{" "}
            {course._count.resources === 1 ? "file" : "files"}
          </span>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-border">
        <Link href={`/teacher/courses/${course.id}`} className="w-full block">
          <Button variant="outline" className="w-full justify-between group/btn">
            <span>Manage & Schedule</span>
            <ArrowRight className="w-4 h-4 text-muted group-hover/btn:translate-x-0.5 transition-transform" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
