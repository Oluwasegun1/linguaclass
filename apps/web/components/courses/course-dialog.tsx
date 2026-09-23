"use client"

import * as React from "react"
import { Button } from "@workspace/ui/components/button"
import { Input, Textarea, Select, FormField } from "@workspace/ui/components/form-elements"
import { CourseLevel } from "@workspace/database"
import { useCreateCourse, useUpdateCourse, type CourseWithCounts } from "@/hooks/use-courses"
import { X } from "lucide-react"

interface CourseDialogProps {
  isOpen: boolean
  onClose: () => void
  courseToEdit?: CourseWithCounts | null
  onSuccess?: () => void
}

const COMMON_LANGUAGES = [
  "French",
  "Spanish",
  "German",
  "Italian",
  "Japanese",
  "Mandarin Chinese",
  "Portuguese",
  "Russian",
  "Arabic",
  "Korean",
  "English",
]

export function CourseDialog({
  isOpen,
  onClose,
  courseToEdit,
  onSuccess,
}: CourseDialogProps) {
  const [title, setTitle] = React.useState("")
  const [language, setLanguage] = React.useState("French")
  const [level, setLevel] = React.useState<CourseLevel>(CourseLevel.B1)
  const [description, setDescription] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)

  const createMutation = useCreateCourse()
  const updateMutation = useUpdateCourse()

  React.useEffect(() => {
    if (courseToEdit) {
      setTitle(courseToEdit.title)
      setLanguage(courseToEdit.language)
      setLevel(courseToEdit.level)
      setDescription(courseToEdit.description || "")
    } else {
      setTitle("")
      setLanguage("French")
      setLevel(CourseLevel.B1)
      setDescription("")
    }
    setError(null)
  }, [courseToEdit, isOpen])

  if (!isOpen) return null

  const isEditing = !!courseToEdit
  const isPending = createMutation.isPending || updateMutation.isPending

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!title.trim()) {
      setError("Please enter a course title")
      return
    }

    try {
      if (isEditing) {
        await updateMutation.mutateAsync({
          id: courseToEdit.id,
          title: title.trim(),
          language: language.trim(),
          level,
          description: description.trim() || undefined,
        })
      } else {
        await createMutation.mutateAsync({
          title: title.trim(),
          language: language.trim(),
          level,
          description: description.trim() || undefined,
        })
      }

      onClose()
      onSuccess?.()
    } catch (err: any) {
      setError(err.message || "Something went wrong")
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
            {isEditing ? "Edit Course" : "Create New Course"}
          </h2>
          <p className="text-sm text-muted mt-1">
            {isEditing
              ? "Update course curriculum details and target proficiency."
              : "Set up a structured learning path with target language and CEFR level."}
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-lg bg-coral-light/20 border border-coral text-sm text-coral font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Course Title" required hint="e.g., Conversational French for Professionals">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter course title"
              required
              autoFocus
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Target Language" required>
              <Select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                {COMMON_LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField label="CEFR Level" required hint="Proficiency target">
              <Select
                value={level}
                onChange={(e) => setLevel(e.target.value as CourseLevel)}
              >
                {Object.values(CourseLevel).map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl} {lvl === "A1" ? "(Beginner)" : lvl === "B1" ? "(Intermediate)" : lvl === "C1" ? "(Advanced)" : ""}
                  </option>
                ))}
              </Select>
            </FormField>
          </div>

          <FormField label="Description & Goals" hint="Overview of what students will achieve in this course">
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe curriculum focus, target grammar, vocabulary scope..."
              rows={4}
            />
          </FormField>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isPending}
            >
              {isPending
                ? isEditing
                  ? "Saving..."
                  : "Creating..."
                : isEditing
                ? "Save Changes"
                : "Create Course"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
