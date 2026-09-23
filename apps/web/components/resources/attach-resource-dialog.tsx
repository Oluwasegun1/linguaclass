"use client"

import * as React from "react"
import { Button } from "@workspace/ui/components/button"
import { Input, Select, FormField } from "@workspace/ui/components/form-elements"
import { useAttachResource } from "@/hooks/use-resources"
import { X, Paperclip, Link as LinkIcon, FileText } from "lucide-react"

interface AttachResourceDialogProps {
  isOpen: boolean
  onClose: () => void
  courseId: string
  lessonId?: string
  lessonTitle?: string
  onSuccess?: () => void
}

export function AttachResourceDialog({
  isOpen,
  onClose,
  courseId,
  lessonId,
  lessonTitle,
  onSuccess,
}: AttachResourceDialogProps) {
  const [fileName, setFileName] = React.useState("")
  const [fileType, setFileType] = React.useState("pdf")
  const [url, setUrl] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)

  const attachMutation = useAttachResource()

  React.useEffect(() => {
    if (isOpen) {
      setFileName("")
      setFileType("pdf")
      setUrl("")
      setError(null)
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!fileName.trim()) {
      setError("Please provide a resource title or file name")
      return
    }

    if (!url.trim()) {
      setError("Please provide a resource URL or link")
      return
    }

    try {
      await attachMutation.mutateAsync({
        courseId,
        lessonId: lessonId || undefined,
        fileName: fileName.trim(),
        fileType,
        url: url.trim(),
      })

      onClose()
      onSuccess?.()
    } catch (err: any) {
      setError(err.message || "Failed to attach resource")
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-2xl bg-surface border border-border shadow-2xl p-6 sm:p-7 relative">
        <button
          onClick={onClose}
          disabled={attachMutation.isPending}
          className="absolute top-5 right-5 p-1 rounded-lg text-muted hover:text-ink hover:bg-surface-2 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <h2 className="font-display text-2xl font-bold text-ink flex items-center gap-2">
            <Paperclip className="w-5 h-5 text-teal" />
            Attach Material
          </h2>
          <p className="text-sm text-muted mt-1">
            {lessonId ? (
              <>
                Attaching to lesson: <strong className="text-ink">{lessonTitle || "Selected Lesson"}</strong>
              </>
            ) : (
              "Attaching to general course materials."
            )}
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-lg bg-coral-light/20 border border-coral text-sm text-coral font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Material Name / Title" required hint="e.g. Dialogue Handout (PDF)">
            <Input
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="e.g., Lesson 3 Vocabulary Worksheet"
              required
              autoFocus
            />
          </FormField>

          <FormField label="Resource Type" required>
            <Select
              value={fileType}
              onChange={(e) => setFileType(e.target.value)}
            >
              <option value="pdf">Document / PDF</option>
              <option value="docx">Word Document (.docx)</option>
              <option value="image">Image (Infographic, Schema)</option>
              <option value="audio">Audio Track (MP3, Podcast)</option>
              <option value="video">Video Lecture (MP4, YouTube)</option>
              <option value="link">Web Link / Article</option>
            </Select>
          </FormField>

          <FormField label="Resource Link or File URL" required hint="Public URL or Cloud Storage path">
            <div className="relative">
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/materials/handout.pdf"
                required
                className="pl-9"
              />
              <LinkIcon className="w-4 h-4 text-muted absolute left-3 top-3.5 pointer-events-none" />
            </div>
          </FormField>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={attachMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={attachMutation.isPending}
            >
              {attachMutation.isPending ? "Attaching..." : "Attach Material"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
