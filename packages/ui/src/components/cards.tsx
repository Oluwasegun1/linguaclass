import * as React from "react"
import { cn } from "@workspace/ui/lib/utils"
import { Button } from "./button"
import { Badge } from "./badge"

// ==========================================
// 1. LESSON CARD (Teacher View)
// ==========================================
export interface LessonCardProps {
  language: string
  cefrLevel: string
  title: string
  date: string
  time: string
  duration: string
  studentName: string
  studentInitials?: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}

export function LessonCard({
  language,
  cefrLevel,
  title,
  date,
  time,
  duration,
  studentName,
  studentInitials,
  actionLabel = "Start lesson",
  onAction,
  className,
}: LessonCardProps) {
  const initials =
    studentInitials ||
    studentName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()

  return (
    <div
      className={cn(
        "rounded-[var(--r-lg)] bg-surface p-5 transition-all duration-200",
        "border-[1.5px] border-border hover:border-border-heavy hover:shadow-md",
        className
      )}
    >
      {/* Eyebrow row: language pill (teal) + CEFR level pill (surface-2) */}
      <div className="mb-3 flex items-center gap-2">
        <span className="inline-flex items-center rounded-full bg-teal-light px-2.5 py-0.5 text-[11px] font-semibold tracking-[0.04em] text-teal">
          {language}
        </span>
        <span className="inline-flex items-center rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-semibold tracking-[0.04em] text-muted">
          {cefrLevel}
        </span>
      </div>

      {/* Title: Lora SemiBold 20px, italic. Always italicised */}
      <h3 className="mb-2 font-display text-[20px] leading-snug font-semibold text-ink italic">
        {title}
      </h3>

      {/* Meta row: date · time · duration, separated by 4px dot dividers */}
      <div className="mb-5 flex items-center gap-2 text-[12px] text-muted">
        <span>{date}</span>
        <span className="inline-block size-1 rounded-full bg-border-heavy" />
        <span>{time}</span>
        <span className="inline-block size-1 rounded-full bg-border-heavy" />
        <span>{duration}</span>
      </div>

      {/* Footer: student avatar (28px circle, amber background) + name on left; primary action button on right */}
      <div className="flex items-center justify-between border-t border-border pt-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-amber text-[11px] font-bold text-white">
            {initials}
          </div>
          <span className="truncate text-[14px] font-medium text-ink">
            {studentName}
          </span>
        </div>
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      </div>
    </div>
  )
}

// ==========================================
// 2. VOCABULARY CARD
// ==========================================
export interface VocabularyCardProps {
  word: string
  status: "new" | "learned" | "review"
  partOfSpeech: string
  translation: string
  exampleSentence: string
  className?: string
}

export function VocabularyCard({
  word,
  status,
  partOfSpeech,
  translation,
  exampleSentence,
  className,
}: VocabularyCardProps) {
  const statusLabels: Record<typeof status, string> = {
    new: "New",
    learned: "Learned",
    review: "Review",
  }

  return (
    <div
      className={cn(
        "rounded-[var(--r-lg)] bg-surface p-5 transition-shadow duration-200",
        "border-[1.5px] border-border hover:shadow-md",
        className
      )}
    >
      <div className="mb-1 flex items-start justify-between gap-2">
        {/* Word: Lora Bold 24px in --ink */}
        <h4 className="font-display text-[24px] font-bold text-teal underline decoration-teal-mid decoration-2 underline-offset-4">
          {word}
        </h4>
        {/* Status badge positioned top-right */}
        <Badge variant={status}>{statusLabels[status]}</Badge>
      </div>

      {/* Part of speech: DM Sans italic, --muted */}
      <p className="mb-2 font-sans text-[13px] text-muted italic">
        {partOfSpeech}
      </p>

      {/* Translation: DM Sans SemiBold, --amber — the one use of amber in a text role */}
      <p className="mb-3 font-sans text-[14px] font-semibold text-amber">
        {translation}
      </p>

      {/* Example sentence: italic, --muted, with a 3px left border in --teal-light */}
      <blockquote className="border-l-[3px] border-teal-light pl-3 font-sans text-[13px] leading-relaxed text-muted italic">
        “{exampleSentence}”
      </blockquote>
    </div>
  )
}

// ==========================================
// 3. AI SUGGESTION CARD (Teacher View & System State)
// ==========================================
export type AISuggestionState =
  "suggested" | "accepted" | "edited" | "dismissed"

export interface AISuggestionCardProps {
  originalError: string
  suggestedCorrection: string
  detectionLabel?: string
  initialState?: AISuggestionState
  onStateChange?: (state: AISuggestionState, modifiedText?: string) => void
  className?: string
}

export function AISuggestionCard({
  originalError,
  suggestedCorrection,
  detectionLabel = "Grammar correction suggested",
  initialState = "suggested",
  onStateChange,
  className,
}: AISuggestionCardProps) {
  const [state, setState] = React.useState<AISuggestionState>(initialState)
  const [isEditing, setIsEditing] = React.useState(false)
  const [editedText, setEditedText] = React.useState(suggestedCorrection)

  const handleAccept = () => {
    setState("accepted")
    onStateChange?.("accepted")
  }

  const handleStartEdit = () => {
    setIsEditing(true)
  }

  const handleSaveEdit = () => {
    setIsEditing(false)
    setState("edited")
    onStateChange?.("edited", editedText)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
  }

  const handleDismiss = () => {
    setState("dismissed")
    onStateChange?.("dismissed")
  }

  const handleUndo = () => {
    setState("suggested")
    onStateChange?.("suggested")
  }

  // 1. Dismissed State: surface-2 bg, 50% opacity, italic notice text, undo button
  if (state === "dismissed") {
    return (
      <div
        className={cn(
          "rounded-[var(--r-lg)] border-[1.5px] border-border bg-surface-2 p-4 opacity-60 transition-all duration-200",
          className
        )}
      >
        <div className="flex items-center justify-between">
          <p className="text-[13px] text-muted italic">
            Dismissed — not in student record
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleUndo}
            className="h-7 px-2.5 text-[12px]"
          >
            Undo
          </Button>
        </div>
      </div>
    )
  }

  // 2. Accepted State: white bg, 1.5px solid --teal-mid, green 'Accepted' badge
  if (state === "accepted") {
    return (
      <div
        className={cn(
          "rounded-[var(--r-lg)] border-[1.5px] border-teal-mid bg-surface p-4 transition-all duration-200",
          className
        )}
      >
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[12px] font-medium text-muted">
            {detectionLabel}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-[#E8F5E9] px-2.5 py-0.5 text-[11px] font-semibold text-[#2E7D32]">
            ✓ Accepted
          </span>
        </div>
        <p className="text-[14px] font-medium text-ink">
          <span className="mr-2 text-coral line-through">{originalError}</span>
          <span className="font-bold text-teal-dark">
            {suggestedCorrection}
          </span>
        </p>
      </div>
    )
  }

  // 3. Edited State: white bg, 1.5px solid --amber, amber 'Edited' badge
  if (state === "edited") {
    return (
      <div
        className={cn(
          "rounded-[var(--r-lg)] border-[1.5px] border-amber bg-surface p-4 transition-all duration-200",
          className
        )}
      >
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[12px] font-medium text-muted">
            {detectionLabel}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-light px-2.5 py-0.5 text-[11px] font-semibold text-amber-dark">
            Edited by teacher
          </span>
        </div>
        <p className="text-[14px] font-medium text-ink">
          <span className="mr-2 text-coral line-through">{originalError}</span>
          <span className="font-bold text-teal-dark">{editedText}</span>
        </p>
      </div>
    )
  }

  // 4. Suggested State: --teal-light bg, 1.5px dashed --teal-mid, action trio
  return (
    <div
      className={cn(
        "rounded-[var(--r-lg)] border-[1.5px] border-dashed border-teal-mid bg-teal-light p-4 transition-all duration-200",
        className
      )}
    >
      {/* Header: small 'AI' pill (teal, white text, --r-sm) + label text */}
      <div className="mb-3 flex items-center gap-2">
        <span className="inline-flex items-center rounded-[var(--r-sm)] bg-teal px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-white uppercase">
          AI
        </span>
        <span className="text-[12px] font-medium text-teal">
          {detectionLabel}
        </span>
      </div>

      {/* Content: error text in --coral with strikethrough; correction in --teal-dark bold */}
      <div className="mb-4 text-[14px]">
        {isEditing ? (
          <div className="flex flex-col gap-2">
            <span className="text-[12px] text-muted">
              Original:{" "}
              <span className="text-coral line-through">{originalError}</span>
            </span>
            <input
              type="text"
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              className="w-full rounded-[var(--r-md)] border-[1.5px] border-teal bg-white px-3 py-1.5 text-[14px] text-ink outline-none"
              autoFocus
            />
            <div className="mt-1 flex items-center gap-2">
              <Button variant="primary" size="sm" onClick={handleSaveEdit}>
                Save modification
              </Button>
              <Button variant="ghost" size="sm" onClick={handleCancelEdit}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <p className="leading-relaxed">
            <span className="mr-2 text-coral line-through">
              {originalError}
            </span>
            <span className="font-bold text-teal-dark">
              {suggestedCorrection}
            </span>
          </p>
        )}
      </div>

      {/* Action row: Accept / Edit / Dismiss is always a trio */}
      {!isEditing && (
        <div className="flex items-center gap-2 border-t border-teal-mid/30 pt-2">
          <Button
            variant="suggestion"
            size="sm"
            onClick={handleAccept}
            className="border-dashed"
          >
            Accept
          </Button>
          <Button variant="ghost" size="sm" onClick={handleStartEdit}>
            Edit
          </Button>
          <Button variant="ghost" size="sm" onClick={handleDismiss}>
            Dismiss
          </Button>
        </div>
      )}
    </div>
  )
}

// ==========================================
// 4. PROGRESS CARD (Student View)
// ==========================================
export interface ProgressDimension {
  label: string
  value: number // percentage 0-100 or fractional
  formattedValue: string // e.g. "78%" or "5/6 completed"
  type: "grammar" | "vocabulary" | "assignments" | "speaking" | "writing"
}

export interface ProgressCardProps {
  title?: string
  studentName?: string
  dimensions: ProgressDimension[]
  className?: string
}

export function ProgressCard({
  title = "Skill Dimensions & Competency",
  studentName,
  dimensions,
  className,
}: ProgressCardProps) {
  return (
    <div
      className={cn(
        "rounded-[var(--r-lg)] border-[1.5px] border-border bg-surface p-5",
        className
      )}
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h4 className="font-sans text-[16px] font-semibold text-ink">
            {title}
          </h4>
          {studentName && (
            <p className="text-[12px] text-muted">Learner: {studentName}</p>
          )}
        </div>
        <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-muted">
          Multi-dimensional
        </span>
      </div>

      <div className="space-y-4">
        {dimensions.map((dim, idx) => {
          const isAmber = dim.type === "speaking" || dim.type === "writing"
          const barColor = isAmber ? "bg-amber" : "bg-teal"

          return (
            <div key={idx} className="space-y-1.5">
              <div className="flex items-center justify-between text-[13px]">
                <span className="font-medium text-ink capitalize">
                  {dim.label}
                </span>
                <span className="font-mono text-[12px] font-semibold text-muted">
                  {dim.formattedValue}
                </span>
              </div>
              <div className="h-[6px] w-full overflow-hidden rounded-full bg-surface-2">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-600",
                    barColor
                  )}
                  style={{ width: `${Math.min(100, Math.max(0, dim.value))}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
