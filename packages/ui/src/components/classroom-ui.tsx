import * as React from "react"
import { cn } from "@workspace/ui/lib/utils"

export interface ClassroomUIProps {
  lessonTitle?: string
  teacherName?: string
  studentName?: string
  elapsedTime?: string
  className?: string
}

export function ClassroomUI({
  lessonTitle = "Subjunctive Mood in French Literature",
  teacherName = "Elena Rostova",
  studentName = "Marcus Chen",
  elapsedTime = "24:18",
  className,
}: ClassroomUIProps) {
  const [activeTab, setActiveTab] = React.useState<
    "transcript" | "chat" | "notes" | "ai"
  >("transcript")
  const [micOn, setMicOn] = React.useState(true)
  const [camOn, setCamOn] = React.useState(true)
  const [screenShare, setScreenShare] = React.useState(false)
  const [activeSpeaker, setActiveSpeaker] = React.useState<
    "teacher" | "student"
  >("teacher")

  return (
    <div
      className={cn(
        "flex h-[600px] w-full max-w-[1000px] flex-col overflow-hidden rounded-[var(--r-xl)] text-white shadow-lg select-none",
        "border border-[rgba(255,255,255,0.10)] bg-[#0F1E2A]",
        className
      )}
    >
      {/* 1. TOP BAR */}
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-4">
        <div className="flex items-center gap-3">
          <h2 className="truncate font-display text-[15px] font-semibold text-white/95 italic">
            {lessonTitle}
          </h2>
          <span className="rounded bg-[rgba(255,255,255,0.06)] px-2 py-0.5 font-mono text-[12px] text-[#9AABBA]">
            {elapsedTime}
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Recording Pill: #FF6B6B pulsing dot. Always visible */}
          <div className="flex items-center gap-1.5 rounded-full border border-[rgba(255,107,107,0.30)] bg-[rgba(255,107,107,0.15)] px-2 py-0.5 text-[11px] font-semibold text-[#FF6B6B]">
            <span className="animate-recording-pulse size-2 rounded-full bg-[#FF6B6B]" />
            <span>REC</span>
          </div>

          {/* Live Badge */}
          <div className="flex items-center gap-1 rounded-full border border-[#4CAF50]/30 bg-[#E8F5E9]/15 px-2 py-0.5 text-[11px] font-semibold text-[#A5D6A7]">
            <span className="animate-recording-pulse size-1.5 rounded-full bg-[#4CAF50]" />
            <span>Live</span>
          </div>
        </div>
      </header>

      {/* 2. BODY: Video Area (flex 1) + Sidebar Panel (220px fixed) */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Video Area: 2-column grid for 1:1 sessions, equal size tiles */}
        <div className="grid min-w-0 flex-1 grid-cols-2 gap-3 bg-[#0F1E2A] p-3">
          {/* Teacher Tile */}
          <div
            onClick={() => setActiveSpeaker("teacher")}
            className={cn(
              "relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[var(--r-lg)] bg-[#1B2D3E] transition-all duration-120",
              "border-[1.5px]",
              activeSpeaker === "teacher"
                ? "border-teal shadow-[0_0_15px_rgba(26,107,114,0.3)]"
                : "border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.2)]"
            )}
          >
            <div className="flex size-20 items-center justify-center rounded-full border-2 border-teal bg-teal/20 font-display text-[24px] font-bold text-teal">
              ER
            </div>
            <div className="absolute right-2 bottom-2 left-2 flex items-center justify-between rounded bg-[rgba(15,30,42,0.7)] px-2 py-1 text-[11px] backdrop-blur-xs">
              <span className="flex items-center gap-1.5 font-medium text-white">
                {teacherName}
                <span className="py-0.2 rounded bg-teal px-1 text-[9px] font-bold">
                  Teacher
                </span>
              </span>
              {activeSpeaker === "teacher" && (
                <span className="font-mono text-[10px] text-teal">
                  Speaking
                </span>
              )}
            </div>
          </div>

          {/* Student Tile */}
          <div
            onClick={() => setActiveSpeaker("student")}
            className={cn(
              "relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[var(--r-lg)] bg-[#1B2D3E] transition-all duration-120",
              "border-[1.5px]",
              activeSpeaker === "student"
                ? "border-teal shadow-[0_0_15px_rgba(26,107,114,0.3)]"
                : "border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.2)]"
            )}
          >
            <div className="flex size-20 items-center justify-center rounded-full border-2 border-amber bg-amber/20 font-display text-[24px] font-bold text-amber">
              MC
            </div>
            <div className="absolute right-2 bottom-2 left-2 flex items-center justify-between rounded bg-[rgba(15,30,42,0.7)] px-2 py-1 text-[11px] backdrop-blur-xs">
              <span className="flex items-center gap-1.5 font-medium text-white">
                {studentName}
                <span className="py-0.2 rounded bg-amber px-1 text-[9px] font-bold text-white">
                  Student
                </span>
              </span>
              {activeSpeaker === "student" && (
                <span className="font-mono text-[10px] text-teal">
                  Speaking
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Panel: 220px fixed width */}
        <aside className="flex w-[220px] shrink-0 flex-col border-l border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)]">
          {/* Sidebar Tabs: 11px DM Sans SemiBold, active tab has white colour + 2px teal underline */}
          <div className="flex items-center border-b border-[rgba(255,255,255,0.08)] px-1">
            {(["transcript", "chat", "notes", "ai"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "relative flex-1 py-2.5 text-center text-[11px] font-semibold tracking-wider uppercase transition-colors",
                  activeTab === tab
                    ? "text-white"
                    : "text-[#9AABBA] hover:text-white/80"
                )}
              >
                {tab}
                {activeTab === tab && (
                  <span className="absolute right-2 bottom-0 left-2 h-[2px] rounded-full bg-teal" />
                )}
              </button>
            ))}
          </div>

          {/* Sidebar Content */}
          <div className="flex-1 space-y-2.5 overflow-y-auto p-2.5 font-sans text-[12px]">
            {activeTab === "transcript" && (
              <div className="space-y-2">
                <div>
                  <span className="block text-[11px] font-semibold text-[#A8CBCE]">
                    Elena (Teacher):
                  </span>
                  <p className="leading-snug text-white/80">
                    Pourriez-vous conjuguer ce verbe au subjonctif présent ?
                  </p>
                </div>
                <div>
                  <span className="block text-[11px] font-semibold text-[#F5C07A]">
                    Marcus (Student):
                  </span>
                  <p className="leading-snug text-white/80">
                    Bien sûr: il faut que nous{" "}
                    <span className="text-coral underline">partions</span> avant
                    midi.
                  </p>
                </div>
                <div>
                  <span className="block text-[11px] font-semibold text-[#A8CBCE]">
                    Elena (Teacher):
                  </span>
                  <p className="leading-snug text-white/80">
                    Exactement ! Bonne terminaison en -ions.
                  </p>
                </div>
              </div>
            )}

            {activeTab === "chat" && (
              <p className="text-[11px] text-muted-light italic">
                Chat messages between teacher and student will appear here.
              </p>
            )}

            {activeTab === "notes" && (
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-amber">
                  Teacher Notes:
                </span>
                <p className="text-white/80">
                  Review irregular stems next session (faire, aller).
                </p>
              </div>
            )}

            {activeTab === "ai" && (
              <div className="rounded-[var(--r-md)] border border-dashed border-teal-mid/40 bg-teal-light/10 p-2">
                <span className="mb-1 block text-[10px] font-bold text-teal-light">
                  AI ASSISTANT
                </span>
                <p className="text-[11px] text-white/90">
                  Detected 3 subjonctif usages in the last 5 minutes. Accuracy:
                  100%.
                </p>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* 3. CONTROL BAR: Centred row of 44px circle buttons. Leave is 48px and coral */}
      <footer className="flex h-16 shrink-0 items-center justify-center gap-3 border-t border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] px-4">
        {/* Mic Toggle */}
        <button
          type="button"
          onClick={() => setMicOn(!micOn)}
          className={cn(
            "flex size-11 cursor-pointer flex-col items-center justify-center rounded-full text-[10px] transition-colors",
            micOn
              ? "bg-teal text-white"
              : "bg-[rgba(255,255,255,0.10)] text-white/80 hover:bg-[rgba(255,255,255,0.20)]"
          )}
          aria-label={micOn ? "Mute microphone" : "Unmute microphone"}
        >
          <svg
            className="size-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
            />
          </svg>
        </button>

        {/* Cam Toggle */}
        <button
          type="button"
          onClick={() => setCamOn(!camOn)}
          className={cn(
            "flex size-11 cursor-pointer flex-col items-center justify-center rounded-full text-[10px] transition-colors",
            camOn
              ? "bg-teal text-white"
              : "bg-[rgba(255,255,255,0.10)] text-white/80 hover:bg-[rgba(255,255,255,0.20)]"
          )}
          aria-label={camOn ? "Turn off camera" : "Turn on camera"}
        >
          <svg
            className="size-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        </button>

        {/* Share Screen */}
        <button
          type="button"
          onClick={() => setScreenShare(!screenShare)}
          className={cn(
            "flex size-11 cursor-pointer flex-col items-center justify-center rounded-full text-[10px] transition-colors",
            screenShare
              ? "bg-teal text-white"
              : "bg-[rgba(255,255,255,0.10)] text-white/80 hover:bg-[rgba(255,255,255,0.20)]"
          )}
          aria-label="Share screen"
        >
          <svg
            className="size-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </button>

        {/* Resources */}
        <button
          type="button"
          className="flex size-11 cursor-pointer items-center justify-center rounded-full bg-[rgba(255,255,255,0.10)] text-white/80 transition-colors hover:bg-[rgba(255,255,255,0.20)]"
          aria-label="Lesson resources"
        >
          <svg
            className="size-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        </button>

        {/* Leave Button: 48px and coral - intentionally more prominent */}
        <button
          type="button"
          className="ml-2 flex size-12 cursor-pointer items-center justify-center rounded-full bg-coral text-white shadow-md transition-all hover:bg-coral/90"
          aria-label="Leave session"
        >
          <svg
            className="size-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16 17l5-5m0 0l-5-5m5 5H9m4 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
        </button>
      </footer>
    </div>
  )
}
