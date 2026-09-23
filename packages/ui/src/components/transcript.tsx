import * as React from "react"
import { cn } from "@workspace/ui/lib/utils"
import { Badge } from "./badge"
import { Button } from "./button"

export interface TranscriptSegment {
  id: string
  speaker: "teacher" | "student"
  speakerName: string
  timestamp: string // HH:MM:SS
  textSegments: {
    text: string
    type?: "normal" | "vocab" | "error"
    annotationNote?: string
  }[]
}

export interface TranscriptProps {
  lessonTitle: string
  isProcessed?: boolean
  segments: TranscriptSegment[]
  onActionClick?: (action: string, segmentId: string) => void
  onExport?: () => void
  className?: string
}

export function Transcript({
  lessonTitle,
  isProcessed = true,
  segments,
  onActionClick,
  onExport,
  className,
}: TranscriptProps) {
  const [selectedId, setSelectedId] = React.useState<string | null>(
    segments[1]?.id || null
  )

  const actionButtons = [
    "Translate",
    "Explain",
    "Save vocab",
    "Add note",
    "Ask AI",
  ]

  return (
    <div
      className={cn(
        "w-full max-w-[720px] overflow-hidden rounded-[var(--r-lg)] border-[1.5px] border-border bg-surface shadow-sm",
        className
      )}
    >
      {/* Header bar: --page background, 1px bottom border */}
      <div className="flex items-center justify-between border-b border-border bg-page px-5 py-3.5">
        <div className="flex items-center gap-3">
          <h3 className="font-display text-[17px] font-semibold text-ink italic">
            {lessonTitle}
          </h3>
          {isProcessed ? (
            <Badge variant="completed">Processed transcript</Badge>
          ) : (
            <Badge variant="live">Live transcription</Badge>
          )}
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={onExport}
          className="h-7 px-2.5 text-[12px]"
        >
          Export
        </Button>
      </div>

      {/* Transcript Document Lines */}
      <div className="divide-y divide-border">
        {segments.map((seg) => {
          const isSelected = selectedId === seg.id
          const isTeacher = seg.speaker === "teacher"

          return (
            <div
              key={seg.id}
              onClick={() => setSelectedId(isSelected ? null : seg.id)}
              className={cn(
                "group relative cursor-pointer px-5 py-3.5 transition-colors duration-120",
                isSelected
                  ? "bg-teal-light"
                  : "bg-surface hover:bg-surface-2/60"
              )}
            >
              {/* Row Header: Speaker label + timestamp */}
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-[0.02em]",
                    isTeacher
                      ? "bg-teal-light text-teal"
                      : "bg-amber-light text-amber-dark"
                  )}
                >
                  {seg.speakerName}
                </span>
                <span className="font-mono text-[12px] tracking-tight text-muted-light">
                  {seg.timestamp}
                </span>
              </div>

              {/* Speech content: DM Sans 14px, line-height 1.65 */}
              <div className="font-sans text-[14px] leading-[1.65] text-ink">
                {seg.textSegments.map((part, idx) => {
                  if (part.type === "vocab") {
                    return (
                      <mark
                        key={idx}
                        title={part.annotationNote || "Vocabulary candidate"}
                        className="rounded-none border-b-2 border-amber bg-amber-light px-0.5 font-medium text-ink"
                      >
                        {part.text}
                      </mark>
                    )
                  }
                  if (part.type === "error") {
                    return (
                      <mark
                        key={idx}
                        title={part.annotationNote || "Grammar error candidate"}
                        className="rounded-none border-b-2 border-coral bg-coral-light px-0.5 text-ink"
                      >
                        {part.text}
                      </mark>
                    )
                  }
                  return <span key={idx}>{part.text}</span>
                })}
              </div>

              {/* Action Bar on Selected Line */}
              {isSelected && (
                <div
                  className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-teal-mid/30 pt-2.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  {actionButtons.map((act) => (
                    <button
                      key={act}
                      type="button"
                      onClick={() => onActionClick?.(act, seg.id)}
                      className={cn(
                        "rounded-full px-2.5 py-1 font-sans text-[12px] font-medium transition-colors duration-120 select-none",
                        "border border-teal-mid bg-surface text-teal hover:bg-teal hover:text-white"
                      )}
                    >
                      {act}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
