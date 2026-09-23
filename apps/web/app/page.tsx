"use client"

import * as React from "react"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import {
  Input,
  Textarea,
  Select,
  FormField,
} from "@workspace/ui/components/form-elements"
import { Alert } from "@workspace/ui/components/alert"
import {
  LessonCard,
  VocabularyCard,
  AISuggestionCard,
  ProgressCard,
} from "@workspace/ui/components/cards"
import { Transcript } from "@workspace/ui/components/transcript"
import { ClassroomUI } from "@workspace/ui/components/classroom-ui"
import {
  DashboardSidebar,
  TeacherHero,
  StatGrid,
} from "@workspace/ui/components/dashboard-ui"

export default function DesignSystemPage() {
  const [activeTab, setActiveTab] = React.useState<
    | "foundations"
    | "components"
    | "cards-ai"
    | "transcript"
    | "classroom"
    | "dashboard"
  >("cards-ai")

  // Interactive state for testing input validation
  const [emailInput, setEmailInput] = React.useState("alex.morin@")
  const [emailError, setEmailError] = React.useState(
    "Enter a valid email address"
  )

  // Interactive state for notification / toast demonstration
  const [toastMessage, setToastMessage] = React.useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Sample transcript data
  const sampleSegments = [
    {
      id: "seg-1",
      speaker: "teacher" as const,
      speakerName: "Madame Laurent",
      timestamp: "00:04:12",
      textSegments: [
        { text: "Bonjour Julien. Aujourd'hui nous allons explorer le " },
        {
          text: "subjonctif passé",
          type: "vocab" as const,
          annotationNote: "Target grammar concept",
        },
        { text: " dans un contexte formel." },
      ],
    },
    {
      id: "seg-2",
      speaker: "student" as const,
      speakerName: "Julien Mercer",
      timestamp: "00:04:28",
      textSegments: [
        { text: "D'accord! Bien que j'" },
        {
          text: "ai eu",
          type: "error" as const,
          annotationNote: "Correction: aie eu (subjonctif)",
        },
        {
          text: " des doutes au début, je pense avoir compris la règle générale.",
        },
      ],
    },
    {
      id: "seg-3",
      speaker: "teacher" as const,
      speakerName: "Madame Laurent",
      timestamp: "00:04:45",
      textSegments: [
        {
          text: "Remarquez bien l'auxiliaire: il faut employer 'aie' avec un 'e'. C'est une nuance ",
        },
        {
          text: "fondamentale",
          type: "vocab" as const,
          annotationNote: "Advanced vocabulary",
        },
        { text: " pour le niveau C1." },
      ],
    },
  ]

  // Sample sidebar navigation
  const sidebarSections = [
    {
      title: "Teaching",
      items: [
        { id: "schedule", label: "Upcoming lessons" },
        { id: "students", label: "Student roster", badgeCount: 14 },
        { id: "reviews", label: "Pending reviews", badgeCount: 3 },
      ],
    },
    {
      title: "Content",
      items: [
        { id: "curriculum", label: "Course materials" },
        { id: "vocab", label: "Vocabulary banks" },
        { id: "transcripts", label: "Lesson archive" },
      ],
    },
    {
      title: "Administration",
      items: [
        { id: "analytics", label: "Learning analytics" },
        { id: "settings", label: "Account settings" },
      ],
    },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-page font-sans text-ink">
      {/* Toast Notification Container */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 animate-in duration-200 fade-in slide-in-from-top-3">
          <div className="flex items-center gap-2 rounded-[var(--r-md)] border border-border/20 bg-ink px-4 py-2.5 text-[13px] font-medium text-white shadow-lg">
            <span className="size-2 rounded-full bg-teal" />
            {toastMessage}
          </div>
        </div>
      )}

      {/* Header Banner */}
      <header className="sticky top-0 z-30 border-b border-border bg-surface shadow-xs">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 px-6 py-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-[var(--r-md)] bg-teal font-display text-[18px] font-bold text-white">
              L
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-[20px] font-semibold text-ink">
                  LinguaClass
                </h1>
                <span className="rounded-full bg-teal-light px-2 py-0.5 text-[11px] font-semibold text-teal">
                  Design System v1.0
                </span>
              </div>
              <p className="text-[12px] text-muted">
                Metaphor: A lesson is an annotated document · Ink, fountain-pen
                teal, and highlighted-word amber
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 overflow-x-auto rounded-[var(--r-md)] bg-surface-2 p-1 text-[13px]">
            <button
              onClick={() => setActiveTab("cards-ai")}
              className={`rounded-[var(--r-sm)] px-3 py-1.5 font-medium transition-colors ${
                activeTab === "cards-ai"
                  ? "bg-surface font-semibold text-teal shadow-xs"
                  : "text-muted hover:text-ink"
              }`}
            >
              Cards & AI States
            </button>
            <button
              onClick={() => setActiveTab("transcript")}
              className={`rounded-[var(--r-sm)] px-3 py-1.5 font-medium transition-colors ${
                activeTab === "transcript"
                  ? "bg-surface font-semibold text-teal shadow-xs"
                  : "text-muted hover:text-ink"
              }`}
            >
              Transcript
            </button>
            <button
              onClick={() => setActiveTab("classroom")}
              className={`rounded-[var(--r-sm)] px-3 py-1.5 font-medium transition-colors ${
                activeTab === "classroom"
                  ? "bg-surface font-semibold text-teal shadow-xs"
                  : "text-muted hover:text-ink"
              }`}
            >
              Classroom UI
            </button>
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`rounded-[var(--r-sm)] px-3 py-1.5 font-medium transition-colors ${
                activeTab === "dashboard"
                  ? "bg-surface font-semibold text-teal shadow-xs"
                  : "text-muted hover:text-ink"
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab("components")}
              className={`rounded-[var(--r-sm)] px-3 py-1.5 font-medium transition-colors ${
                activeTab === "components"
                  ? "bg-surface font-semibold text-teal shadow-xs"
                  : "text-muted hover:text-ink"
              }`}
            >
              Buttons & Forms
            </button>
            <button
              onClick={() => setActiveTab("foundations")}
              className={`rounded-[var(--r-sm)] px-3 py-1.5 font-medium transition-colors ${
                activeTab === "foundations"
                  ? "bg-surface font-semibold text-teal shadow-xs"
                  : "text-muted hover:text-ink"
              }`}
            >
              Foundations
            </button>
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/login"
              className="rounded-[var(--r-sm)] px-3 py-1.5 text-[13px] font-medium text-muted hover:text-ink transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup/teacher"
              className="rounded-[var(--r-sm)] bg-teal px-3 py-1.5 text-[13px] font-medium text-white hover:opacity-90 shadow-xs transition-opacity"
            >
              Teacher Portal
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto w-full max-w-7xl flex-1 space-y-10 px-6 py-8">
        {/* ========================================================= */}
        {/* TAB 1: CARDS & AI UX STATE MACHINE                       */}
        {/* ========================================================= */}
        {activeTab === "cards-ai" && (
          <div className="animate-in space-y-8 duration-200 fade-in">
            <div>
              <h2 className="mb-1 font-display text-[26px] font-semibold text-ink">
                Cards & AI Suggestion UX System States
              </h2>
              <p className="max-w-3xl text-[14px] leading-relaxed text-muted text-white">
                Cards vary strictly by function. The AI suggestion card
                showcases the core <strong>three-state progression</strong>:
                Suggested (dashed teal-mid border) → Accepted (solid green
                badge) or Edited (solid amber badge) or Dismissed (muted with
                Undo).
              </p>
            </div>

            {/* AI Suggestion State Machine Section */}
            <div className="space-y-5 rounded-[var(--r-xl)] border-[1.5px] border-border bg-surface p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-[18px] font-semibold text-ink">
                    Interactive AI Suggestion State Machine
                  </h3>
                  <p className="text-[12px] text-white text-muted">
                    Click Accept, Edit, or Dismiss below to see how state
                    changes. Unconfirmed content uses dashed borders; confirmed
                    content uses solid borders.
                  </p>
                </div>
                <Badge variant="pending">3 pending teacher review</Badge>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <AISuggestionCard
                  originalError="Je suis allé au cinéma hier et je voyais un film."
                  suggestedCorrection="Je suis allé au cinéma hier et j'ai vu un film."
                  detectionLabel="Tense aspect candidate · Passé composé vs Imparfait"
                  onStateChange={(state, text) =>
                    showToast(
                      state === "accepted"
                        ? "Correction accepted into student record."
                        : state === "edited"
                          ? `Saved teacher edit: "${text}"`
                          : state === "dismissed"
                            ? "Suggestion dismissed."
                            : "Suggestion restored."
                    )
                  }
                />

                <AISuggestionCard
                  originalError="Il est nécessaire que vous venez à l'heure."
                  suggestedCorrection="Il est nécessaire que vous veniez à l'heure."
                  detectionLabel="Subjunctive mood required after impersonal expression"
                  initialState="accepted"
                  onStateChange={(state) =>
                    showToast(`Updated second card state: ${state}`)
                  }
                />
              </div>
            </div>

            {/* Functional Cards Grid */}
            <div className="space-y-4">
              <h3 className="font-display text-[20px] font-semibold text-ink">
                Functional Card Variants
              </h3>
              <p className="text-[13px] text-muted">
                Notice distinct treatments: Lesson card has heavy hover border;
                Vocab card has shadow-only; Progress card is read-only without
                hover shadow.
              </p>

              <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-3">
                {/* 1. Lesson Card */}
                <div className="space-y-2">
                  <span className="block text-[12px] font-semibold tracking-wider text-muted uppercase">
                    1. Lesson Card (Teacher View)
                  </span>
                  <LessonCard
                    language="French"
                    cefrLevel="B2 Independent"
                    title="Subjunctive Nuances & Nuanced Literary Speech"
                    date="Today, 18 Sep"
                    time="15:00 — 15:45"
                    duration="45 min"
                    studentName="Julien Mercer"
                    onAction={() => showToast("Starting French B2 lesson...")}
                  />
                </div>

                {/* 2. Vocabulary Card */}
                <div className="space-y-2">
                  <span className="block text-[12px] font-semibold tracking-wider text-muted uppercase">
                    2. Vocabulary Card (Annotation Mark)
                  </span>
                  <VocabularyCard
                    word="Éphémère"
                    status="learned"
                    partOfSpeech="adjective /e.fe.mɛʁ/"
                    translation="Lasting for a very short time; fleeting"
                    exampleSentence="Les fleurs de cerisier ont une beauté particulièrement éphémère qui émeut les promeneurs."
                  />
                </div>

                {/* 3. Progress Card */}
                <div className="space-y-2">
                  <span className="block text-[12px] font-semibold tracking-wider text-muted uppercase">
                    3. Progress Card (Student View)
                  </span>
                  <ProgressCard
                    studentName="Julien Mercer"
                    dimensions={[
                      {
                        label: "Grammar accuracy",
                        value: 84,
                        formattedValue: "84%",
                        type: "grammar",
                      },
                      {
                        label: "Vocabulary mastery",
                        value: 92,
                        formattedValue: "46 / 50 words",
                        type: "vocabulary",
                      },
                      {
                        label: "Assignments completed",
                        value: 83.3,
                        formattedValue: "5 / 6 submitted",
                        type: "assignments",
                      },
                      {
                        label: "Spoken fluency",
                        value: 70,
                        formattedValue: "70%",
                        type: "speaking",
                      },
                      {
                        label: "Written expression",
                        value: 80,
                        formattedValue: "80%",
                        type: "writing",
                      },
                    ]}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: ANNOTATED TRANSCRIPT COMPONENT                     */}
        {/* ========================================================= */}
        {activeTab === "transcript" && (
          <div className="animate-in space-y-6 duration-200 fade-in">
            <div>
              <h2 className="mb-1 font-display text-[26px] font-semibold text-ink">
                Annotated Document Transcript
              </h2>
              <p className="max-w-3xl text-[14px] leading-relaxed text-muted">
                Designed to look like an <em>annotated document</em>, not a chat
                log. Timestamps in Courier New, lines separated by 1px rules,
                dual background+border indicators for color-blind accessibility,
                and an action bar appearing on selected lines.
              </p>
            </div>

            <div className="flex flex-col items-center justify-center p-4">
              <Transcript
                lessonTitle="Le Subjonctif Passé · Séance 4"
                isProcessed={true}
                segments={sampleSegments}
                onActionClick={(action, segId) =>
                  showToast(
                    `Action "${action}" triggered on speech segment ${segId}`
                  )
                }
                onExport={() =>
                  showToast("Exporting annotated lesson transcript as PDF...")
                }
              />
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: CLASSROOM UI (Dark Mode & Workspace First)         */}
        {/* ========================================================= */}
        {activeTab === "classroom" && (
          <div className="animate-in space-y-6 duration-200 fade-in">
            <div>
              <h2 className="mb-1 font-display text-[26px] font-semibold text-ink">
                Classroom UI (Dark Mode & Workspace-First)
              </h2>
              <p className="max-w-3xl text-[14px] leading-relaxed text-muted">
                Uniquely dark-mode (
                <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[12px] text-ink">
                  #0F1E2A
                </code>
                ). Lesson content and live transcript take priority. 1:1
                equal-size video tiles, pulsing recording pill, active speaker
                detection, and a prominent 48px coral leave button.
              </p>
            </div>

            <div className="flex justify-center p-2">
              <ClassroomUI />
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: TEACHER DASHBOARD PATTERN                         */}
        {/* ========================================================= */}
        {activeTab === "dashboard" && (
          <div className="animate-in space-y-6 duration-200 fade-in">
            <div>
              <h2 className="mb-1 font-display text-[26px] font-semibold text-ink">
                Teacher Dashboard Pattern
              </h2>
              <p className="max-w-3xl text-[14px] leading-relaxed text-muted">
                Fixed 240px dark sidebar in{" "}
                <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[12px] text-ink">
                  --ink
                </code>{" "}
                (#1B2D3E) with text-only links. The loudest element on screen is
                the full-width teal banner (&ldquo;One loud thing&rdquo;),
                followed by 2-column stat cells.
              </p>
            </div>

            <div className="flex min-h-[540px] overflow-hidden rounded-[var(--r-xl)] border-[1.5px] border-border bg-page shadow-sm">
              {/* Dark Sidebar */}
              <DashboardSidebar
                sections={sidebarSections}
                activeItemId="schedule"
                onSelectItem={(id) => showToast(`Navigated to section: ${id}`)}
              />

              {/* Main Content Area */}
              <div className="flex-1 space-y-6 overflow-y-auto p-8">
                {/* One Loud Thing: Teacher Hero */}
                <TeacherHero
                  lessonTitle="Subjunctive Mood in French Literature"
                  studentName="Marcus Chen"
                  scheduledTime="Today at 15:30 (in 45 minutes)"
                  onStartLesson={() =>
                    showToast("Launching live digital classroom...")
                  }
                />

                {/* Stat Cells Grid (2 columns, max 4 cells) */}
                <div className="space-y-2">
                  <h3 className="text-[14px] font-semibold text-ink">
                    Weekly Teaching Overview
                  </h3>
                  <StatGrid
                    items={[
                      {
                        id: "lessons",
                        label: "Lessons scheduled this week",
                        value: "18",
                        type: "positive",
                        subtext: "4 completed · 14 remaining",
                      },
                      {
                        id: "reviews",
                        label: "AI suggestions pending review",
                        value: "7",
                        type: "attention",
                        subtext: "Requires teacher confirmation",
                      },
                      {
                        id: "students",
                        label: "Active enrolled learners",
                        value: "12",
                        type: "positive",
                        subtext: "Across A2, B1, and B2 tiers",
                      },
                      {
                        id: "vocab",
                        label: "Vocabulary items flagged",
                        value: "34",
                        type: "positive",
                        subtext: "Saved to student banks this month",
                      },
                    ]}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: BUTTONS & FORM CONTROLS                            */}
        {/* ========================================================= */}
        {activeTab === "components" && (
          <div className="animate-in space-y-10 duration-200 fade-in">
            <div>
              <h2 className="mb-1 font-display text-[26px] font-semibold text-ink">
                Buttons, Forms, Badges & Alerts
              </h2>
              <p className="max-w-3xl text-[14px] leading-relaxed text-muted">
                Six differentiated button variants, 1.5px border inputs with
                low-opacity teal focus rings, status dot badges with pulsing
                live indicators, and structured alerts with specific recovery
                paths.
              </p>
            </div>

            {/* Buttons Section */}
            <div className="space-y-6 rounded-[var(--r-xl)] border-[1.5px] border-border bg-surface p-6">
              <h3 className="font-display text-[18px] font-semibold text-ink">
                Button System (6 Purpose-Driven Variants)
              </h3>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <span className="block text-[12px] font-semibold text-muted">
                    Primary (Teacher Action)
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button variant="primary">Start lesson</Button>
                    <Button variant="primary" size="sm">
                      Save
                    </Button>
                    <Button variant="primary" loading>
                      Save
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="block text-[12px] font-semibold text-muted">
                    Secondary (Teacher Secondary)
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button variant="secondary">View transcript</Button>
                    <Button variant="secondary" size="sm">
                      Edit lesson
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="block text-[12px] font-semibold text-muted">
                    Ghost (Tertiary / Dismiss)
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button variant="ghost">Dismiss</Button>
                    <Button variant="ghost" size="sm">
                      Cancel
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="block text-[12px] font-semibold text-muted">
                    Amber (Primary Student Action)
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button variant="amber">Submit assignment</Button>
                    <Button variant="amber" size="sm">
                      Save vocab
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="block text-[12px] font-semibold text-muted">
                    Danger (Destructive Action)
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button variant="danger">Delete recording</Button>
                    <Button variant="danger" size="sm">
                      Remove
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="block text-sm font-semibold text-muted">
                    AI Suggestion (Teacher Gate)
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button variant="suggestion">Accept AI suggestion</Button>
                  </div>
                </div>
              </div>

              {/* Disabled State Demonstration */}
              <div className="flex items-center gap-4 border-t border-border pt-4">
                <span className="text-[12px] text-muted">
                  Disabled state (opacity 0.38, no pointer events, colour
                  unchanged):
                </span>
                <Button variant="primary" disabled>
                  Disabled Primary
                </Button>
                <Button variant="amber" disabled>
                  Disabled Amber
                </Button>
              </div>
            </div>

            {/* Form Controls Section */}
            <div className="space-y-6 rounded-[var(--r-xl)] border-[1.5px] border-border bg-surface p-6">
              <h3 className="font-display text-[18px] font-semibold text-ink">
                Form Elements (1.5px Borders & Focused State)
              </h3>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  id="title"
                  label="Lesson title"
                  hint="Visible to students in the upcoming schedule"
                  required
                >
                  <Input
                    id="title"
                    defaultValue="The Subjunctive Mood in Modern Literature"
                  />
                </FormField>

                <FormField
                  id="level"
                  label="Target CEFR proficiency"
                  hint="Adjusts vocabulary highlighting threshold"
                >
                  <Select id="level" defaultValue="B2">
                    <option value="A1">A1 — Beginner</option>
                    <option value="A2">A2 — Elementary</option>
                    <option value="B1">B1 — Intermediate</option>
                    <option value="B2">B2 — Upper Intermediate</option>
                    <option value="C1">C1 — Advanced</option>
                    <option value="C2">C2 — Mastery</option>
                  </Select>
                </FormField>

                <FormField
                  id="email"
                  label="Student contact email"
                  error={emailError}
                  required
                >
                  <Input
                    id="email"
                    value={emailInput}
                    hasError={Boolean(emailError)}
                    onChange={(e) => {
                      setEmailInput(e.target.value)
                      if (
                        e.target.value.includes("@") &&
                        e.target.value.endsWith(".com")
                      ) {
                        setEmailError("")
                      } else {
                        setEmailError(
                          "Enter a valid email address (e.g. name@domain.com)"
                        )
                      }
                    }}
                  />
                </FormField>

                <FormField
                  id="notes"
                  label="Teacher preparation notes"
                  hint="Vertical resize only"
                >
                  <Textarea
                    id="notes"
                    defaultValue="Focus on distinction between 'que je sois' and 'que j'aie &eacute;t&eacute;' during transcript review."
                  />
                </FormField>
              </div>
            </div>

            {/* Badges and Alerts Section */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-4 rounded-[var(--r-xl)] border-[1.5px] border-border bg-surface p-6">
                <h3 className="font-display text-[18px] font-semibold text-ink">
                  Status Badges & CEFR Pills
                </h3>
                <div className="flex flex-wrap items-center gap-2.5">
                  <Badge variant="live">Live session</Badge>
                  <Badge variant="scheduled">Scheduled</Badge>
                  <Badge variant="pending">Pending review</Badge>
                  <Badge variant="completed">Completed</Badge>
                  <Badge variant="error">Transcription failed</Badge>
                  <Badge variant="ai">AI Suggestion</Badge>
                </div>

                <div className="space-y-2 border-t border-border pt-3">
                  <span className="block text-[12px] font-semibold text-muted">
                    CEFR Level Badges:
                  </span>
                  <div className="flex items-center gap-2">
                    <Badge variant="cefr-a">A1 / A2</Badge>
                    <Badge variant="cefr-b">B1 / B2</Badge>
                    <Badge variant="cefr-c">C1 / C2</Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-3 rounded-[var(--r-xl)] border-[1.5px] border-border bg-surface p-6">
                <h3 className="font-display text-[18px] font-semibold text-ink">
                  Structured Alerts (Title + Recovery Path)
                </h3>
                <Alert
                  type="info"
                  title="Background transcription in progress"
                  message="Audio processing will take approximately 2 minutes. You may continue navigating."
                />
                <Alert
                  type="error"
                  title="Transcription failed"
                  message="The audio quality was too low. The raw recording is saved. You can retry from Lesson History."
                />
                <Alert
                  type="success"
                  title="Lesson saved"
                  message="All vocabulary items have been added to Daniel's bank."
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 6: FOUNDATIONS & DESIGN TOKENS                       */}
        {/* ========================================================= */}
        {activeTab === "foundations" && (
          <div className="animate-in space-y-10 duration-200 fade-in">
            <div>
              <h2 className="mb-1 font-display text-[26px] font-semibold text-ink">
                Design System Foundations
              </h2>
              <p className="max-w-3xl text-[14px] leading-relaxed text-muted">
                Derived from the metaphor of ink on paper. Cool whites,
                fountain-pen teal as primary (teacher UI), highlighted-word
                amber as accent (student UI & vocabulary), and coral reserved
                for errors and corrections.
              </p>
            </div>

            {/* Brand Colors Grid */}
            <div className="space-y-4 rounded-[var(--r-xl)] border-[1.5px] border-border bg-surface p-6">
              <h3 className="font-display text-[18px] font-semibold text-ink">
                Brand Palette Tokens
              </h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                {[
                  {
                    name: "Ink",
                    token: "--ink",
                    hex: "#1B2D3E",
                    bg: "bg-ink",
                    text: "text-white",
                  },
                  {
                    name: "Teal",
                    token: "--teal",
                    hex: "#1A6B72",
                    bg: "bg-teal",
                    text: "text-white",
                  },
                  {
                    name: "Teal Dark",
                    token: "--teal-dark",
                    hex: "#124D52",
                    bg: "bg-teal-dark",
                    text: "text-white",
                  },
                  {
                    name: "Teal Mid",
                    token: "--teal-mid",
                    hex: "#A8CBCE",
                    bg: "bg-teal-mid",
                    text: "text-ink",
                  },
                  {
                    name: "Teal Light",
                    token: "--teal-light",
                    hex: "#E8F4F5",
                    bg: "bg-teal-light",
                    text: "text-ink",
                  },
                  {
                    name: "Amber",
                    token: "--amber",
                    hex: "#C47B2B",
                    bg: "bg-amber",
                    text: "text-white",
                  },
                  {
                    name: "Amber Dark",
                    token: "--amber-dark",
                    hex: "#9A5E1A",
                    bg: "bg-amber-dark",
                    text: "text-white",
                  },
                  {
                    name: "Amber Light",
                    token: "--amber-light",
                    hex: "#FDF3E3",
                    bg: "bg-amber-light",
                    text: "text-ink",
                  },
                  {
                    name: "Coral",
                    token: "--coral",
                    hex: "#C0503A",
                    bg: "bg-coral",
                    text: "text-white",
                  },
                  {
                    name: "Coral Light",
                    token: "--coral-light",
                    hex: "#FAEAE7",
                    bg: "bg-coral-light",
                    text: "text-ink",
                  },
                ].map((color) => (
                  <div
                    key={color.name}
                    className="flex h-28 flex-col justify-between rounded-[var(--r-md)] border border-border p-3"
                  >
                    <div
                      className={`h-10 rounded-[var(--r-sm)] ${color.bg} border border-black/5`}
                    />
                    <div className="mt-2 text-[12px]">
                      <span className="block font-semibold text-ink">
                        {color.name}
                      </span>
                      <span className="font-mono text-[11px] text-muted">
                        {color.hex}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Typography Hierarchy */}
            <div className="space-y-4 rounded-[var(--r-xl)] border-[1.5px] border-border bg-surface p-6">
              <h3 className="font-display text-[18px] font-semibold text-ink">
                Dual Typeface Scale (Lora Serif & DM Sans)
              </h3>
              <div className="space-y-4 divide-y divide-border">
                <div className="pt-2">
                  <span className="text-[11px] font-semibold text-muted uppercase">
                    Display 1 · Lora Bold 48px / 3rem
                  </span>
                  <h1 className="font-display text-[48px] leading-tight font-bold text-ink">
                    LinguaClass Digital Classroom
                  </h1>
                </div>

                <div className="pt-3">
                  <span className="text-[11px] font-semibold text-muted uppercase">
                    H1 · Lora SemiBold 30px / 1.875rem
                  </span>
                  <h2 className="font-display text-[30px] leading-snug font-semibold text-ink">
                    Advanced Subjunctive Literature Review
                  </h2>
                </div>

                <div className="pt-3">
                  <span className="text-[11px] font-semibold text-muted uppercase">
                    Lesson Title · Lora SemiBold Italic 24px
                  </span>
                  <p className="font-display text-[24px] font-semibold text-ink italic">
                    L&apos;art de la conversation au XIXe siècle
                  </p>
                </div>

                <div className="pt-3">
                  <span className="text-[11px] font-semibold text-muted uppercase">
                    Vocabulary Word · Lora Bold 24px with teal-mid annotation
                    underline
                  </span>
                  <p className="font-display text-[24px] font-bold text-teal underline decoration-teal-mid decoration-2 underline-offset-4">
                    Inéluctable
                  </p>
                </div>

                <div className="pt-3">
                  <span className="text-[11px] font-semibold text-muted uppercase">
                    Body Text · DM Sans 16px (60–75 char constrained width,
                    line-height 1.65)
                  </span>
                  <p className="prose-body mt-1 text-[16px] text-ink">
                    Language learning demands consistent exposure, focused
                    document annotation, and rapid feedback loops between
                    educators and learners. By treating every session as a
                    living manuscript, students retain vocabulary faster and
                    anchor complex syntactic rules into memory.
                  </p>
                </div>
              </div>
            </div>

            {/* Spacing & Radius Reference */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-3 rounded-[var(--r-xl)] border-[1.5px] border-border bg-surface p-6">
                <h3 className="font-display text-[18px] font-semibold text-ink">
                  4px Spacing Scale
                </h3>
                <div className="space-y-1.5 font-mono text-[12px]">
                  <div className="flex justify-between border-b border-border/50 py-1">
                    <span>--sp-1 (4px)</span>
                    <span className="text-muted">
                      Icon gap, tight inline spacing
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-border/50 py-1">
                    <span>--sp-2 (8px)</span>
                    <span className="text-muted">
                      Badge padding, icon-to-label
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-border/50 py-1">
                    <span>--sp-3 (12px)</span>
                    <span className="text-muted">
                      Button padding (vertical)
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-border/50 py-1">
                    <span>--sp-4 (16px)</span>
                    <span className="text-muted">
                      Button padding (horizontal)
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-border/50 py-1">
                    <span>--sp-6 (24px)</span>
                    <span className="text-muted">
                      Card padding, section gap
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>--sp-8 (32px)</span>
                    <span className="text-muted">Between cards in a grid</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 rounded-[var(--r-xl)] border-[1.5px] border-border bg-surface p-6">
                <h3 className="font-display text-[18px] font-semibold text-ink">
                  Border Radius Hierarchy
                </h3>
                <div className="space-y-2.5 text-[13px]">
                  <div className="flex items-center justify-between rounded-[var(--r-sm)] border border-border bg-surface-2 p-2">
                    <span className="font-medium">--r-sm (4px)</span>
                    <span className="text-muted">Badges, pills, code tags</span>
                  </div>
                  <div className="flex items-center justify-between rounded-[var(--r-md)] border border-border bg-surface-2 p-2">
                    <span className="font-medium">--r-md (8px)</span>
                    <span className="text-muted">
                      Buttons, inputs, dropdowns
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-[var(--r-lg)] border border-border bg-surface-2 p-2">
                    <span className="font-medium">--r-lg (12px)</span>
                    <span className="text-muted">
                      Cards, transcript document
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-[var(--r-xl)] border border-border bg-surface-2 p-2">
                    <span className="font-medium">--r-xl (16px)</span>
                    <span className="text-muted">
                      Modals, panels, dashboard wrappers
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-full border border-border bg-surface-2 p-2">
                    <span className="font-medium">--r-full (9999px)</span>
                    <span className="text-muted">
                      Circular avatars, status dot pills
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-border bg-surface py-6 text-center text-[13px] text-muted">
        <p>LinguaClass Design System · Ink & Annotation Visual Metaphor</p>
      </footer>
    </div>
  )
}
