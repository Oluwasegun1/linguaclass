"use client"

import * as React from "react"
import { useDeleteResource, type ResourceItem } from "@/hooks/use-resources"
import {
  FileText,
  FileCode,
  Image as ImageIcon,
  Music,
  Video,
  ExternalLink,
  Trash2,
  Paperclip,
} from "lucide-react"

interface ResourceListProps {
  resources: Array<{
    id: string
    fileName: string
    fileType: string
    url: string | null
    createdAt?: string | Date
  }>
  canDelete?: boolean
}

export function ResourceList({ resources, canDelete = true }: ResourceListProps) {
  const deleteMutation = useDeleteResource()

  const getFileIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case "pdf":
      case "docx":
      case "doc":
        return <FileText className="w-4 h-4 text-teal" />
      case "image":
        return <ImageIcon className="w-4 h-4 text-amber-dark" />
      case "audio":
        return <Music className="w-4 h-4 text-purple-500" />
      case "video":
        return <Video className="w-4 h-4 text-coral" />
      case "link":
      default:
        return <Paperclip className="w-4 h-4 text-muted" />
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Remove attachment "${name}"?`)) {
      try {
        await deleteMutation.mutateAsync(id)
      } catch (err: any) {
        alert(err.message || "Failed to remove attachment")
      }
    }
  }

  if (!resources || resources.length === 0) {
    return (
      <div className="p-4 rounded-xl border border-dashed border-border text-center text-xs text-muted">
        No learning materials attached yet.
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {resources.map((res) => (
        <div
          key={res.id}
          className="flex items-center justify-between p-2.5 rounded-xl border border-border bg-surface-2/60 hover:bg-surface-2 transition-colors text-sm"
        >
          <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-3">
            <span className="p-1.5 rounded-lg bg-surface border border-border shrink-0">
              {getFileIcon(res.fileType)}
            </span>
            <div className="truncate">
              <span className="font-medium text-ink truncate block text-xs sm:text-sm">
                {res.fileName}
              </span>
              <span className="text-[10px] text-muted uppercase font-semibold">
                {res.fileType}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {res.url && (
              <a
                href={res.url}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 rounded-lg text-muted hover:text-teal hover:bg-surface transition-colors"
                title="Open resource"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            {canDelete && (
              <button
                onClick={() => handleDelete(res.id, res.fileName)}
                disabled={deleteMutation.isPending}
                className="p-1.5 rounded-lg text-muted hover:text-coral hover:bg-coral-light/20 transition-colors"
                title="Remove attachment"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
