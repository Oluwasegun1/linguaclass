import * as React from "react"
import { cn } from "@workspace/ui/lib/utils"

// ==========================================
// 1. SIDEBAR NAVIGATION
// ==========================================
export interface SidebarNavItem {
  id: string
  label: string
  badgeCount?: number
}

export interface SidebarSection {
  title: string
  items: SidebarNavItem[]
}

export interface DashboardSidebarProps {
  logoText?: string
  sections: SidebarSection[]
  activeItemId: string
  onSelectItem?: (id: string) => void
  className?: string
}

export function DashboardSidebar({
  logoText = "LinguaClass",
  sections,
  activeItemId,
  onSelectItem,
  className,
}: DashboardSidebarProps) {
  return (
    <aside
      className={cn(
        "flex min-h-full w-[240px] shrink-0 flex-col border-r border-border/10 bg-ink py-6 text-white/90 select-none",
        className
      )}
    >
      {/* Logo: Lora SemiBold 18px, white */}
      <div className="mb-8 px-6">
        <h1 className="font-display text-[18px] font-semibold tracking-normal text-white">
          {logoText}
        </h1>
      </div>

      {/* Sections and Text-Only Links (No icons in sidebar navigation!) */}
      <nav className="flex-1 space-y-6">
        {sections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            {/* Section headers: 11px DM Sans, 0.06em letter-spacing, rgba(255,255,255,0.35). Sentence case */}
            <h4 className="px-6 text-[11px] font-medium tracking-[0.06em] text-white/35">
              {section.title}
            </h4>
            <div className="mt-1 space-y-0.5">
              {section.items.map((item) => {
                const isActive = activeItemId === item.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectItem?.(item.id)}
                    className={cn(
                      "flex w-full cursor-pointer items-center justify-between px-6 py-2 text-left text-[14px] transition-colors",
                      isActive
                        ? "border-l-[2px] border-teal-mid bg-white/6 font-medium text-white"
                        : "border-l-[2px] border-transparent text-white/70 hover:bg-white/4 hover:text-white"
                    )}
                  >
                    <span>{item.label}</span>
                    {item.badgeCount !== undefined && (
                      <span className="py-0.2 rounded bg-white/10 px-1.5 font-mono text-[11px] text-white">
                        {item.badgeCount}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  )
}

// ==========================================
// 2. TEACHER DASHBOARD HERO (Next Lesson Card)
// ==========================================
export interface TeacherHeroProps {
  lessonTitle: string
  studentName: string
  scheduledTime: string
  onStartLesson?: () => void
  className?: string
}

export function TeacherHero({
  lessonTitle,
  studentName,
  scheduledTime,
  onStartLesson,
  className,
}: TeacherHeroProps) {
  return (
    <div
      className={cn(
        "flex w-full items-center justify-between gap-6 rounded-[var(--r-lg)] bg-teal p-6 text-white shadow-md",
        className
      )}
    >
      <div className="min-w-0 space-y-1.5">
        <span className="text-[11px] font-semibold tracking-wider text-teal-light/90 uppercase">
          Next upcoming lesson · Today
        </span>
        {/* Title: Lora italic, 18px */}
        <h2 className="truncate font-display text-[18px] font-semibold text-white italic">
          {lessonTitle}
        </h2>
        <p className="text-[13px] text-teal-light/80">
          with {studentName} · {scheduledTime}
        </p>
      </div>

      {/* Right: 'Start' button (white bg, --teal text) — visually inverted from normal primary button */}
      <button
        type="button"
        onClick={onStartLesson}
        className="shrink-0 cursor-pointer rounded-[var(--r-md)] bg-white px-6 py-3 text-[14px] font-semibold text-teal shadow-sm transition-colors hover:bg-teal-light"
      >
        Start lesson
      </button>
    </div>
  )
}

// ==========================================
// 3. STAT CELLS (2-Column Grid)
// ==========================================
export interface StatItem {
  id: string
  label: string
  value: string | number
  type?: "positive" | "attention" // teal for positive counts, amber for attention-requiring
  subtext?: string
}

export interface StatGridProps {
  items: StatItem[]
  className?: string
}

export function StatGrid({ items, className }: StatGridProps) {
  return (
    <div className={cn("grid grid-cols-2 gap-4", className)}>
      {items.slice(0, 4).map((item) => {
        const isAttention = item.type === "attention"

        return (
          <div
            key={item.id}
            className="rounded-[var(--r-md)] border-[1.5px] border-border bg-surface p-4 shadow-xs"
          >
            {/* Label: DM Sans 12px --muted */}
            <span className="mb-1 block text-[12px] font-medium text-muted">
              {item.label}
            </span>
            {/* Value: Lora Bold 24px — teal for positive counts, amber for attention counts */}
            <span
              className={cn(
                "block font-display text-[24px] font-bold",
                isAttention ? "text-amber" : "text-teal"
              )}
            >
              {item.value}
            </span>
            {item.subtext && (
              <span className="mt-0.5 block text-[11px] text-muted-light">
                {item.subtext}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}
