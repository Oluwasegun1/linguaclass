"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  Sparkles,
  BookOpen,
  GraduationCap,
  CheckCircle2,
  ArrowRight,
  ChevronRight,
  Play,
  Volume2,
  ShieldCheck,
  Layers,
  MessageSquare,
  Clock,
  Star,
  Users,
  Languages,
  FileText,
  Check,
  X,
  Edit3,
  Headphones,
  Zap,
  BarChart3,
  HelpCircle,
  Award,
  Video,
  Menu,
  RotateCcw,
} from "lucide-react"

// Types for interactive demo
type LanguageDemo = {
  id: string
  name: string
  flag: string
  level: string
  title: string
  student: string
  transcript: {
    speaker: "Teacher" | "Student"
    time: string
    text: string
    highlight?: {
      word: string
      type: "vocab" | "correction"
      note: string
    }
  }[]
  intelligence: {
    summary: string
    vocab: {
      word: string
      ipa: string
      meaning: string
      cefr: string
      example: string
    }[]
    correction: {
      original: string
      corrected: string
      rule: string
    }
    strength: string
    practice: string[]
  }
}

type SupportedLang = "french" | "spanish" | "german"

const DEMOS: Record<SupportedLang, LanguageDemo> = {
  french: {
    id: "french",
    name: "French",
    flag: "🇫🇷",
    level: "B2 Upper Intermediate",
    title: "Subjunctive Mood in Contemporary Discourse",
    student: "Julien Mercer",
    transcript: [
      {
        speaker: "Teacher",
        time: "04:12",
        text: "Bonjour Julien. Aujourd'hui nous allons explorer le subjonctif passé dans un contexte formel.",
      },
      {
        speaker: "Student",
        time: "04:28",
        text: "D'accord ! Bien que j'ai eu des doutes au début, je pense avoir compris la règle générale.",
        highlight: {
          word: "ai eu",
          type: "correction",
          note: "Correction: 'aie eu' (subjonctif passé requis après bien que)",
        },
      },
      {
        speaker: "Teacher",
        time: "04:45",
        text: "Exactement. L'auxiliaire exige le subjonctif : 'aie'. C'est une nuance fondamentale pour le niveau B2/C1.",
        highlight: {
          word: "fondamentale",
          type: "vocab",
          note: "Vocabulaire ciblé : fondamentale (adj.)",
        },
      },
    ],
    intelligence: {
      summary:
        "Julien demonstrated solid comprehension of concessive conjunctions ('bien que') but reverted to the indicative auxiliary in compound past constructions. Rapid self-correction following guided prompt.",
      vocab: [
        {
          word: "Éphémère",
          ipa: "/e.fe.mɛʁ/",
          meaning: "Fleeting, lasting for a short time",
          cefr: "B2",
          example: "Une beauté particulièrement éphémère qui émeut les promeneurs.",
        },
        {
          word: "Inéluctable",
          ipa: "/i.ne.lyk.tabl/",
          meaning: "Inevitable, inescapable",
          cefr: "C1",
          example: "L'évolution des usages linguistiques est un processus inéluctable.",
        },
      ],
      correction: {
        original: "Bien que j'ai eu des doutes...",
        corrected: "Bien que j'aie eu des doutes...",
        rule: "Conjunctions of concession like 'bien que' require the subjunctive auxiliary ('aie' rather than 'ai').",
      },
      strength:
        "Fluid oral pacing with accurate liaison pronunciation and spontaneous connector usage.",
      practice: [
        "Transform 5 indicative opinion clauses into 'bien que + subjonctif' formulations.",
        "Record a 90-second response defending an opinion using 'inéluctable' and 'en dépit de'.",
      ],
    },
  },
  spanish: {
    id: "spanish",
    name: "Spanish",
    flag: "🇪🇸",
    level: "B1 Intermediate",
    title: "Por vs. Para & Subjunctive Emotional Triggers",
    student: "Elena Rostova",
    transcript: [
      {
        speaker: "Teacher",
        time: "08:14",
        text: "¿Cómo te fue con la preparación para la entrevista de trabajo en Madrid?",
      },
      {
        speaker: "Student",
        time: "08:31",
        text: "Estudié para dos horas anoche y espero que la empresa me llama pronto.",
        highlight: {
          word: "para dos horas",
          type: "correction",
          note: "Corrección: 'por dos horas' (duración en el tiempo)",
        },
      },
      {
        speaker: "Teacher",
        time: "08:52",
        text: "Recuerda: la duración de tiempo siempre usa 'por', y el verbo 'esperar' activa el subjuntivo.",
        highlight: {
          word: "esperar",
          type: "vocab",
          note: "Disparador de subjuntivo : esperar que + subjuntivo",
        },
      },
    ],
    intelligence: {
      summary:
        "Elena practiced job interview conversational scenarios. Strong confidence in past preterite verbs, with recurring confusion between 'por' (duration) vs 'para' (destination/deadline).",
      vocab: [
        {
          word: "Desempeñar",
          ipa: "/de.sem.peˈɲaɾ/",
          meaning: "To carry out, perform a role or duties",
          cefr: "B2",
          example: "Tiene todas las habilidades necesarias para desempeñar este puesto.",
        },
        {
          word: "A corto plazo",
          ipa: "/a ˈkoɾ.to ˈpla.so/",
          meaning: "In the short term",
          cefr: "B1",
          example: "Nuestros objetivos a corto plazo son consolidar la presencia regional.",
        },
      ],
      correction: {
        original: "Estudié para dos horas...",
        corrected: "Estudié por dos horas...",
        rule: "Use 'por' to express duration of time. 'Para' is reserved for deadlines, purposes, or destinations.",
      },
      strength:
        "Rich professional vocabulary and natural use of reflexive colloquial connectors.",
      practice: [
        "Complete 8 targeted sentences choosing between 'por' and 'para' in work contexts.",
        "Draft a follow-up email requesting interview feedback using the subjunctive with 'espero que'.",
      ],
    },
  },
  german: {
    id: "german",
    name: "German",
    flag: "🇩🇪",
    level: "C1 Advanced",
    title: "Konjunktiv II & Diplomatic Business Phrasing",
    student: "Marcus Chen",
    transcript: [
      {
        speaker: "Teacher",
        time: "12:05",
        text: "Wie würden Sie diesen Einwand während der Verhandlung diplomatisch formulieren?",
      },
      {
        speaker: "Student",
        time: "12:22",
        text: "Wenn wir mehr Zeit hatten, könnten wir das Angebot gründlicher überprüfen.",
        highlight: {
          word: "hatten",
          type: "correction",
          note: "Korrektur: 'hätten' (Konjunktiv II der Gegenwart)",
        },
      },
      {
        speaker: "Teacher",
        time: "12:44",
        text: "Ausgezeichnet gedacht! Achten Sie nur auf den Umlaut: 'hätten' statt 'hatten'.",
        highlight: {
          word: "gründlicher",
          type: "vocab",
          note: "Fachwortschatz : gründlich (Adjektiv/Adverb)",
        },
      },
    ],
    intelligence: {
      summary:
        "Marcus handled high-level corporate negotiation simulations with elegance. Mastered polite hypotheticals, needing only subtle acoustic calibration between indicative past and subjunctive umlauts.",
      vocab: [
        {
          word: "Einwand erheben",
          ipa: "/ˈaɪ̯n.vant ɛɐ̯ˈheː.bən/",
          meaning: "To raise an objection (formal register)",
          cefr: "C1",
          example: "Niemand aus dem Vorstand hat einen Einwand dagegen erhoben.",
        },
        {
          word: "Verhandlungsbasis",
          ipa: "/fɛɐ̯ˈhant.lʊŋsˌbaː.zɪs/",
          meaning: "Basis for negotiation",
          cefr: "B2",
          example: "Dieser Entwurf dient als hervorragende Verhandlungsbasis.",
        },
      ],
      correction: {
        original: "Wenn wir mehr Zeit hatten...",
        corrected: "Wenn wir mehr Zeit hätten...",
        rule: "Unreal conditional clauses in the present require Konjunktiv II with an umlaut ('hätten').",
      },
      strength:
        "Exemplary modal verb placement in subordinate clauses and nuanced diplomatic cadence.",
      practice: [
        "Refactor 4 direct complaints into indirect diplomatic Konjunktiv II proposals.",
        "Prepare a 2-minute negotiation opening statement using 'Verhandlungsbasis' and 'in Betracht ziehen'.",
      ],
    },
  },
}

export default function LandingPage() {
  const [selectedLang, setSelectedLang] = React.useState<"french" | "spanish" | "german">("french")
  const [activeIntelTab, setActiveIntelTab] = React.useState<"vocab" | "grammar" | "summary" | "practice">("vocab")
  const [reviewState, setReviewState] = React.useState<"pending" | "accepted" | "dismissed">("pending")
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const [openFaq, setOpenFaq] = React.useState<number | null>(0)
  const [toastMessage, setToastMessage] = React.useState<string | null>(null)

  const activeDemo: LanguageDemo = DEMOS[selectedLang] ?? DEMOS.french

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3200)
  }

  const handleAcceptSuggestion = () => {
    setReviewState("accepted")
    showToast("✓ Verified by Teacher: Saved to Student Knowledge Bank")
  }

  const handleResetSuggestion = () => {
    setReviewState("pending")
    showToast("Suggestion reset to pending review")
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-page font-sans text-ink selection:bg-teal-light selection:text-teal-dark overflow-x-hidden">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 animate-in duration-200 fade-in slide-in-from-top-3">
          <div className="flex items-center gap-2.5 rounded-[var(--r-md)] border border-teal/30 bg-ink px-4 py-3 text-[13px] font-medium text-white shadow-xl backdrop-blur-md">
            <span className="flex size-2 rounded-full bg-teal animate-ping" />
            {toastMessage}
          </div>
        </div>
      )}

      {/* Background Ambient Glows */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[550px] w-[850px] rounded-full bg-gradient-to-b from-teal/15 via-teal-light/25 to-transparent blur-3xl dark:from-teal/10 dark:via-transparent" />
        <div className="absolute top-[800px] -left-48 h-[450px] w-[450px] rounded-full bg-amber/10 blur-3xl dark:bg-amber/5" />
        <div className="absolute top-[1600px] -right-48 h-[550px] w-[550px] rounded-full bg-teal/10 blur-3xl dark:bg-teal/5" />
      </div>

      {/* ========================================================= */}
      {/* NAVIGATION BAR                                            */}
      {/* ========================================================= */}
      <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-surface/85 backdrop-blur-md transition-colors">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
          {/* Logo */}
          <Link href="/" className="group flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-[var(--r-md)] bg-teal font-display text-[18px] font-bold text-white shadow-xs transition-transform group-hover:scale-105">
              L
            </div>
            <div className="flex flex-col">
              <span className="font-display text-[19px] font-bold tracking-tight text-ink">
                Lingua<span className="text-teal">Class</span>
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">
                AI Lesson Intelligence
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden items-center gap-7 text-[13px] font-medium md:flex">
            <a
              href="#how-it-works"
              className="text-muted transition-colors hover:text-ink hover:underline underline-offset-4"
            >
              How It Works
            </a>
            <a
              href="#interactive-preview"
              className="text-muted transition-colors hover:text-ink hover:underline underline-offset-4"
            >
              Live Demo
            </a>
            <a
              href="#features"
              className="text-muted transition-colors hover:text-ink hover:underline underline-offset-4"
            >
              The 8 Pillars
            </a>
            <a
              href="#philosophy"
              className="text-muted transition-colors hover:text-ink hover:underline underline-offset-4"
            >
              Teacher In The Loop
            </a>
            <a
              href="#pricing"
              className="text-muted transition-colors hover:text-ink hover:underline underline-offset-4"
            >
              Pricing
            </a>
            <a
              href="#faq"
              className="text-muted transition-colors hover:text-ink hover:underline underline-offset-4"
            >
              FAQ
            </a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/login"
              className="hidden rounded-[var(--r-md)] px-3.5 py-2 text-[13px] font-medium text-ink transition-colors hover:bg-surface-2 sm:inline-block"
            >
              Sign In
            </Link>
            <Link
              href="/signup/teacher"
              className="group flex items-center gap-1.5 rounded-[var(--r-md)] bg-teal px-4 py-2 text-[13px] font-semibold text-white shadow-sm transition-all hover:bg-teal-dark hover:shadow"
            >
              <span>Teacher Portal</span>
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-[var(--r-sm)] p-1.5 text-muted hover:text-ink md:hidden"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="border-b border-border bg-surface px-6 py-4 space-y-3 md:hidden animate-in fade-in slide-in-from-top-2">
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-[14px] font-medium text-ink py-1"
            >
              How It Works
            </a>
            <a
              href="#interactive-preview"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-[14px] font-medium text-ink py-1"
            >
              Live Demo
            </a>
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-[14px] font-medium text-ink py-1"
            >
              The 8 Pillars
            </a>
            <a
              href="#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-[14px] font-medium text-ink py-1"
            >
              Pricing
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-[14px] font-medium text-ink py-1"
            >
              FAQ
            </a>
            <div className="pt-2 border-t border-border flex flex-col gap-2">
              <Link
                href="/login"
                className="w-full text-center py-2 text-[13px] font-medium border border-border rounded-[var(--r-md)]"
              >
                Sign In
              </Link>
              <Link
                href="/signup/teacher"
                className="w-full text-center py-2 text-[13px] font-semibold bg-teal text-white rounded-[var(--r-md)]"
              >
                Start Free as Teacher
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        {/* ========================================================= */}
        {/* HERO SECTION                                              */}
        {/* ========================================================= */}
        <section className="relative px-6 pt-16 pb-20 md:pt-24 md:pb-28">
          <div className="mx-auto max-w-5xl text-center space-y-7">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-teal/30 bg-teal-light/50 px-3.5 py-1 text-[12px] font-semibold text-teal shadow-xs dark:bg-teal-light/20">
              <span className="flex size-2 rounded-full bg-teal animate-recording-pulse" />
              <span>Introducing AI Lesson Intelligence 2.0</span>
              <span className="text-muted/60">·</span>
              <span className="text-ink font-medium">CEFR-Aligned (A1–C2)</span>
            </div>

            {/* Headline */}
            <h1 className="font-display text-[38px] leading-[1.12] font-bold tracking-tight text-ink sm:text-[54px] md:text-[62px]">
              Turn Live Language Lessons into{" "}
              <span className="relative inline-block text-teal">
                Permanent Mastery.
                <svg
                  className="absolute -bottom-2 left-0 w-full text-teal-mid/50"
                  height="8"
                  viewBox="0 0 200 8"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1 5.5C40 2.5 160 2.5 199 5.5"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>

            {/* Sub-headline */}
            <p className="mx-auto max-w-3xl text-[16px] leading-relaxed text-muted sm:text-[19px]">
              LinguaClass listens to your conversational sessions, captures spoken
              nuances, and synthesizes them into an{" "}
              <strong className="text-ink font-semibold">
                8-pillar, teacher-reviewed learning record
              </strong>
              . Zero scribbling during class. 100% student retention between lessons.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href="/signup/teacher"
                className="group flex w-full sm:w-auto items-center justify-center gap-2 rounded-[var(--r-md)] bg-teal px-6 py-3.5 text-[15px] font-semibold text-white shadow-md transition-all hover:bg-teal-dark hover:shadow-lg"
              >
                <span>Start Teaching Free</span>
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <a
                href="#interactive-preview"
                className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-[var(--r-md)] border-[1.5px] border-border bg-surface px-6 py-3.5 text-[15px] font-semibold text-ink transition-colors hover:bg-surface-2 shadow-xs"
              >
                <Play className="size-4 text-teal fill-teal/20" />
                <span>Try Interactive Demo</span>
              </a>
            </div>

            {/* Trust bullet row */}
            <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-[12px] font-medium text-muted">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-teal" />
                <span>AI Proposes, Teacher Decides</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-teal" />
                <span>No Credit Card Required</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-teal" />
                <span>Built-in Video or Paste Any Audio</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-teal" />
                <span>Private & Encrypted</span>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* INTERACTIVE LIVE PRODUCT DEMO WIDGET                      */}
          {/* ========================================================= */}
          <div
            id="interactive-preview"
            className="mx-auto mt-14 max-w-6xl scroll-mt-24 rounded-[var(--r-xl)] border-[1.5px] border-border bg-surface p-4 shadow-xl md:p-6"
          >
            {/* Demo Header Controls */}
            <div className="flex flex-col gap-4 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex size-2 rounded-full bg-teal animate-ping" />
                  <h3 className="font-display text-[17px] font-bold text-ink">
                    Interactive Live Demonstration
                  </h3>
                  <span className="rounded bg-teal-light px-2 py-0.5 text-[11px] font-semibold text-teal dark:bg-teal/20">
                    Live Simulator
                  </span>
                </div>
                <p className="text-[12px] text-muted">
                  Toggle languages below to observe how spoken dialogue converts into structured student intelligence:
                </p>
              </div>

              {/* Language Switcher Pills */}
              <div className="flex items-center gap-1.5 rounded-[var(--r-md)] bg-surface-2 p-1">
                {(["french", "spanish", "german"] as const).map((lang) => {
                  const demo = DEMOS[lang]
                  if (!demo) return null
                  return (
                    <button
                      key={lang}
                      onClick={() => {
                        setSelectedLang(lang)
                        setReviewState("pending")
                      }}
                      className={`flex items-center gap-1.5 rounded-[var(--r-sm)] px-3 py-1.5 text-[12px] font-semibold transition-all ${
                        selectedLang === lang
                          ? "bg-surface text-teal shadow-xs"
                          : "text-muted hover:text-ink"
                      }`}
                    >
                      <span>{demo.flag}</span>
                      <span>{demo.name}</span>
                      <span className="text-[10px] text-muted-light">
                        ({demo.level.split(" ")[0]})
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Split Screen Simulator */}
            <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-12 items-stretch">
              {/* Left Column: Live Audio & Lesson Transcript (5 cols) */}
              <div className="lg:col-span-5 flex flex-col rounded-[var(--r-lg)] border border-border bg-page p-4">
                {/* Audio Status Header */}
                <div className="flex items-center justify-between border-b border-border/70 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex size-7 items-center justify-center rounded-full bg-teal text-white">
                      <Volume2 className="size-3.5" />
                    </div>
                    <div>
                      <div className="text-[12px] font-semibold text-ink">
                        {activeDemo.title}
                      </div>
                      <div className="text-[11px] text-muted">
                        Student: {activeDemo.student}
                      </div>
                    </div>
                  </div>
                  <span className="rounded-full bg-surface px-2 py-0.5 font-mono text-[10px] text-muted border border-border">
                    REC · 45:00
                  </span>
                </div>

                {/* Simulated Audio Waveform Bar */}
                <div className="my-3 flex items-center justify-between rounded-[var(--r-sm)] bg-surface px-3 py-2 border border-border/60">
                  <div className="flex items-center gap-2">
                    <div className="size-2 rounded-full bg-coral animate-recording-pulse" />
                    <span className="text-[11px] font-medium text-ink">
                      Synchronized Transcript
                    </span>
                  </div>
                  <div className="flex items-center gap-1 h-3">
                    <span className="w-1 bg-teal rounded-full h-2 animate-pulse" />
                    <span className="w-1 bg-teal rounded-full h-3 animate-pulse delay-75" />
                    <span className="w-1 bg-teal rounded-full h-1 animate-pulse delay-150" />
                    <span className="w-1 bg-teal rounded-full h-3 animate-pulse delay-100" />
                    <span className="w-1 bg-teal rounded-full h-2 animate-pulse delay-200" />
                  </div>
                </div>

                {/* Dialogue Transcript Stream */}
                <div className="flex-1 space-y-3.5 overflow-y-auto pr-1 text-[13px]">
                  {activeDemo.transcript.map((line, idx) => (
                    <div
                      key={idx}
                      className={`rounded-[var(--r-md)] p-3 transition-colors ${
                        line.speaker === "Teacher"
                          ? "bg-surface border border-border/80"
                          : "bg-surface-2 border border-border/60"
                      }`}
                    >
                      <div className="mb-1 flex items-center justify-between text-[11px]">
                        <span
                          className={`font-semibold ${
                            line.speaker === "Teacher" ? "text-teal" : "text-amber"
                          }`}
                        >
                          {line.speaker === "Teacher" ? "Teacher (You)" : activeDemo.student}
                        </span>
                        <span className="font-mono text-muted text-[10px]">
                          {line.time}
                        </span>
                      </div>
                      <p className="leading-relaxed text-ink">
                        {line.text}
                      </p>
                      {line.highlight && (
                        <div className="mt-2 rounded bg-surface p-1.5 text-[11px] font-mono border border-border/60 flex items-center gap-1.5 text-muted">
                          <span
                            className={`size-1.5 rounded-full ${
                              line.highlight.type === "correction"
                                ? "bg-coral"
                                : "bg-teal"
                            }`}
                          />
                          <span className="font-sans font-medium text-ink">
                            {line.highlight.note}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-3 border-t border-border/70 flex items-center justify-between text-[11px] text-muted">
                  <span>100% Automated Speech-to-Text</span>
                  <span className="font-mono text-teal">00:45:12 total</span>
                </div>
              </div>

              {/* Right Column: AI Lesson Intelligence & Review Hub (7 cols) */}
              <div className="lg:col-span-7 flex flex-col rounded-[var(--r-lg)] border-[1.5px] border-teal/30 bg-surface p-5 shadow-sm">
                {/* Header & Tabs */}
                <div className="flex flex-col gap-3 border-b border-border pb-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex size-7 items-center justify-center rounded-md bg-teal-light text-teal">
                      <Sparkles className="size-4" />
                    </div>
                    <div>
                      <h4 className="font-display text-[15px] font-bold text-ink">
                        AI Lesson Intelligence
                      </h4>
                      <div className="text-[11px] text-muted">
                        Gemini 2.5 Flash · 8 Dimensions Extracted
                      </div>
                    </div>
                  </div>

                  {/* Tab Selector */}
                  <div className="flex items-center gap-1 overflow-x-auto rounded-[var(--r-sm)] bg-surface-2 p-1">
                    <button
                      onClick={() => setActiveIntelTab("vocab")}
                      className={`rounded px-2.5 py-1 text-[11px] font-semibold transition-all ${
                        activeIntelTab === "vocab"
                          ? "bg-surface text-teal shadow-xs"
                          : "text-muted hover:text-ink"
                      }`}
                    >
                      Vocabulary ({activeDemo.intelligence.vocab.length})
                    </button>
                    <button
                      onClick={() => setActiveIntelTab("grammar")}
                      className={`rounded px-2.5 py-1 text-[11px] font-semibold transition-all ${
                        activeIntelTab === "grammar"
                          ? "bg-surface text-teal shadow-xs"
                          : "text-muted hover:text-ink"
                      }`}
                    >
                      Corrections
                    </button>
                    <button
                      onClick={() => setActiveIntelTab("summary")}
                      className={`rounded px-2.5 py-1 text-[11px] font-semibold transition-all ${
                        activeIntelTab === "summary"
                          ? "bg-surface text-teal shadow-xs"
                          : "text-muted hover:text-ink"
                      }`}
                    >
                      Summary
                    </button>
                    <button
                      onClick={() => setActiveIntelTab("practice")}
                      className={`rounded px-2.5 py-1 text-[11px] font-semibold transition-all ${
                        activeIntelTab === "practice"
                          ? "bg-surface text-teal shadow-xs"
                          : "text-muted hover:text-ink"
                      }`}
                    >
                      Homework
                    </button>
                  </div>
                </div>

                {/* Tab Content Panels */}
                <div className="flex-1 py-4">
                  {/* TAB 1: VOCABULARY */}
                  {activeIntelTab === "vocab" && (
                    <div className="space-y-3 animate-in fade-in duration-150">
                      <div className="flex items-center justify-between text-[12px] text-muted">
                        <span>Extracted Spoken Vocabulary</span>
                        <span className="font-mono text-[11px]">CEFR Classified</span>
                      </div>
                      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                        {activeDemo.intelligence.vocab.map((v, idx) => (
                          <div
                            key={idx}
                            className="rounded-[var(--r-md)] border border-border bg-page p-3.5 transition-all hover:border-teal/40"
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <span className="font-display text-[16px] font-bold text-ink">
                                  {v.word}
                                </span>
                                <span className="ml-2 font-mono text-[11px] text-muted">
                                  {v.ipa}
                                </span>
                              </div>
                              <span className="rounded bg-teal-light px-1.5 py-0.5 text-[10px] font-bold text-teal dark:bg-teal/20">
                                {v.cefr}
                              </span>
                            </div>
                            <p className="mt-1.5 text-[12px] font-medium text-ink/80">
                              {v.meaning}
                            </p>
                            <p className="mt-2 text-[11px] italic text-muted border-t border-border/50 pt-1.5">
                              &ldquo;{v.example}&rdquo;
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TAB 2: CORRECTIONS */}
                  {activeIntelTab === "grammar" && (
                    <div className="space-y-3 animate-in fade-in duration-150">
                      <div className="flex items-center justify-between text-[12px] text-muted">
                        <span>Teacher-In-The-Loop Correction Review</span>
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                            reviewState === "accepted"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                              : "bg-amber-light text-amber-dark dark:bg-amber/20"
                          }`}
                        >
                          {reviewState === "accepted" ? "Verified" : "Pending Teacher Approval"}
                        </span>
                      </div>

                      <div className="rounded-[var(--r-md)] border-[1.5px] border-dashed border-teal/40 bg-page p-4">
                        <div className="space-y-2.5">
                          <div className="flex items-start gap-2">
                            <span className="mt-0.5 rounded bg-coral-light p-1 text-coral text-[10px] font-bold">
                              Spoken
                            </span>
                            <span className="text-[13px] line-through text-muted">
                              {activeDemo.intelligence.correction.original}
                            </span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="mt-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 p-1 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                              Target
                            </span>
                            <span className="font-semibold text-[13px] text-teal">
                              {activeDemo.intelligence.correction.corrected}
                            </span>
                          </div>
                          <p className="mt-2 text-[12px] text-muted border-t border-border/60 pt-2">
                            <strong>Pedagogical rationale:</strong> {activeDemo.intelligence.correction.rule}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: SUMMARY */}
                  {activeIntelTab === "summary" && (
                    <div className="space-y-3 animate-in fade-in duration-150">
                      <div className="rounded-[var(--r-md)] border border-border bg-page p-3.5">
                        <h5 className="text-[12px] font-bold uppercase tracking-wider text-muted mb-1">
                          Executive Synthesis
                        </h5>
                        <p className="text-[13px] leading-relaxed text-ink">
                          {activeDemo.intelligence.summary}
                        </p>
                      </div>
                      <div className="rounded-[var(--r-md)] border border-border bg-page p-3.5">
                        <h5 className="text-[12px] font-bold uppercase tracking-wider text-teal mb-1 flex items-center gap-1.5">
                          <Award className="size-3.5" />
                          Observed Learner Strength
                        </h5>
                        <p className="text-[13px] text-ink">
                          {activeDemo.intelligence.strength}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* TAB 4: PRACTICE */}
                  {activeIntelTab === "practice" && (
                    <div className="space-y-3 animate-in fade-in duration-150">
                      <div className="text-[12px] text-muted">
                        Automated Between-Lesson Drills for {activeDemo.student}
                      </div>
                      <div className="space-y-2">
                        {activeDemo.intelligence.practice.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-3 rounded-[var(--r-md)] border border-border bg-page p-3 text-[13px]"
                          >
                            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-teal text-[10px] font-bold text-white">
                              {idx + 1}
                            </span>
                            <span className="text-ink leading-relaxed">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Teacher Action Footer */}
                <div className="mt-auto border-t border-border pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 bg-surface-2/60 -mx-5 -mb-5 p-4 rounded-b-[var(--r-lg)]">
                  <div className="flex items-center gap-2 text-[12px]">
                    <ShieldCheck className="size-4 text-teal" />
                    <span className="text-muted">
                      Status:{" "}
                      <strong className="text-ink font-semibold">
                        {reviewState === "accepted" ? "Saved to student hub" : "Needs 1-click review"}
                      </strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {reviewState === "accepted" ? (
                      <button
                        onClick={handleResetSuggestion}
                        className="flex flex-1 sm:flex-none items-center justify-center gap-1.5 rounded-[var(--r-md)] border border-border bg-surface px-3 py-1.5 text-[12px] font-medium text-muted hover:text-ink transition-colors"
                      >
                        <RotateCcw className="size-3.5" />
                        <span>Reset to Review</span>
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setReviewState("dismissed")
                            showToast("Item dismissed from student record.")
                          }}
                          className="flex flex-1 sm:flex-none items-center justify-center gap-1 rounded-[var(--r-md)] border border-border bg-surface px-3 py-1.5 text-[12px] font-medium text-muted hover:text-ink transition-colors"
                        >
                          <X className="size-3.5" />
                          <span>Dismiss</span>
                        </button>
                        <button
                          onClick={handleAcceptSuggestion}
                          className="flex flex-1 sm:flex-none items-center justify-center gap-1.5 rounded-[var(--r-md)] bg-teal px-4 py-1.5 text-[12px] font-semibold text-white shadow-xs hover:bg-teal-dark transition-colors"
                        >
                          <Check className="size-3.5" />
                          <span>Accept & Send to Student</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* STATS STRIP                                               */}
        {/* ========================================================= */}
        <section className="border-y border-border bg-surface py-10">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              <div className="text-center md:text-left">
                <div className="font-display text-[34px] font-bold text-teal md:text-[42px]">
                  80%
                </div>
                <div className="text-[13px] font-semibold text-ink">
                  Higher Student Retention
                </div>
                <p className="mt-1 text-[12px] text-muted">
                  Spaced repetition and structured notes eliminate lesson forgetting.
                </p>
              </div>

              <div className="text-center md:text-left">
                <div className="font-display text-[34px] font-bold text-ink md:text-[42px]">
                  &lt; 60s
                </div>
                <div className="text-[13px] font-semibold text-ink">
                  Teacher Review Overhead
                </div>
                <p className="mt-1 text-[12px] text-muted">
                  Save 20+ minutes of note typing per 50-minute student session.
                </p>
              </div>

              <div className="text-center md:text-left">
                <div className="font-display text-[34px] font-bold text-amber md:text-[42px]">
                  8 Pillars
                </div>
                <div className="text-[13px] font-semibold text-ink">
                  Complete Lesson Intelligence
                </div>
                <p className="mt-1 text-[12px] text-muted">
                  Vocabulary, grammar slips, strengths, homework, and summaries.
                </p>
              </div>

              <div className="text-center md:text-left">
                <div className="font-display text-[34px] font-bold text-teal-dark dark:text-teal md:text-[42px]">
                  40+
                </div>
                <div className="text-[13px] font-semibold text-ink">
                  Languages & Dialects
                </div>
                <p className="mt-1 text-[12px] text-muted">
                  Multi-lingual phonetics, idiom parsing, and CEFR grading.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* THE PROBLEM & THE SOLUTION (WHY LINGUACLASS?)              */}
        {/* ========================================================= */}
        <section className="px-6 py-20 md:py-28">
          <div className="mx-auto max-w-7xl">
            <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
              <span className="text-[12px] font-bold uppercase tracking-wider text-teal">
                The Forgotten Lesson Problem
              </span>
              <h2 className="font-display text-[32px] font-bold text-ink sm:text-[40px]">
                Why Language Lessons Vanish by Tomorrow Morning
              </h2>
              <p className="text-[15px] text-muted leading-relaxed">
                During intense 1-on-1 language lessons, conversation flows naturally. But without instantaneous, structured capture, students forget 70% of spoken feedback within 24 hours.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {/* Card 1: The Old Way */}
              <div className="rounded-[var(--r-xl)] border border-border bg-surface p-7 shadow-xs space-y-4">
                <div className="flex size-10 items-center justify-center rounded-[var(--r-md)] bg-coral-light text-coral font-bold">
                  <X className="size-5" />
                </div>
                <h3 className="font-display text-[19px] font-bold text-ink">
                  The Fragmented Note Rush
                </h3>
                <p className="text-[14px] leading-relaxed text-muted">
                  Teachers divide attention trying to type rough phrases into Google Docs, Skype chat, or WhatsApp while trying to maintain eye contact. The notes end up disorganized, unreviewed, and lost in chat history.
                </p>
                <div className="rounded-[var(--r-sm)] bg-surface-2 p-3 text-[12px] text-muted-light italic">
                  &ldquo;Wait, let me write that word down in the chat... sorry, what were you saying?&rdquo;
                </div>
              </div>

              {/* Card 2: The Homework Gap */}
              <div className="rounded-[var(--r-xl)] border border-border bg-surface p-7 shadow-xs space-y-4">
                <div className="flex size-10 items-center justify-center rounded-[var(--r-md)] bg-amber-light text-amber-dark font-bold">
                  <Clock className="size-5" />
                </div>
                <h3 className="font-display text-[19px] font-bold text-ink">
                  The Between-Lesson Vacuum
                </h3>
                <p className="text-[14px] leading-relaxed text-muted">
                  Students don&apos;t know what to review between sessions. Generic apps (like Duolingo) don&apos;t practice what was actually spoken in class, causing identical grammar mistakes to recur week after week.
                </p>
                <div className="rounded-[var(--r-sm)] bg-surface-2 p-3 text-[12px] text-muted-light italic">
                  &ldquo;I know we discussed this last Wednesday, but I don&apos;t remember how you phrased it.&rdquo;
                </div>
              </div>

              {/* Card 3: The LinguaClass Solution */}
              <div className="rounded-[var(--r-xl)] border-[1.5px] border-teal bg-teal-light/20 dark:bg-teal/10 p-7 shadow-sm space-y-4">
                <div className="flex size-10 items-center justify-center rounded-[var(--r-md)] bg-teal text-white font-bold">
                  <Check className="size-5" />
                </div>
                <h3 className="font-display text-[19px] font-bold text-teal">
                  The Living Lesson Record
                </h3>
                <p className="text-[14px] leading-relaxed text-ink">
                  Focus 100% on pure conversation. LinguaClass extracts vocabulary, pronunciations, and grammar slips automatically. The teacher reviews in 60 seconds, and the student receives a personalized, interactive study manuscript.
                </p>
                <div className="rounded-[var(--r-sm)] bg-surface p-3 text-[12px] text-teal font-medium border border-teal/20">
                  ✓ Instant 8-pillar extraction · 1-click teacher verification · Interactive student flashcards
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* HOW IT WORKS (THE 3-STEP PIPELINE)                       */}
        {/* ========================================================= */}
        <section id="how-it-works" className="border-t border-border bg-surface-2/60 px-6 py-20 md:py-28">
          <div className="mx-auto max-w-7xl">
            <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
              <span className="text-[12px] font-bold uppercase tracking-wider text-teal">
                Streamlined Workflow
              </span>
              <h2 className="font-display text-[32px] font-bold text-ink sm:text-[40px]">
                How LinguaClass Works in 3 Simple Steps
              </h2>
              <p className="text-[15px] text-muted leading-relaxed">
                Designed to fit into your existing teaching routine with zero friction. Use our native video classroom or bring audio from Zoom, Google Meet, or in-person lessons.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {/* Step 1 */}
              <div className="relative rounded-[var(--r-xl)] border border-border bg-surface p-8 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <span className="flex size-10 items-center justify-center rounded-full bg-teal text-[15px] font-bold text-white">
                    1
                  </span>
                  <span className="rounded bg-surface-2 px-2.5 py-1 text-[11px] font-medium text-muted">
                    During Lesson
                  </span>
                </div>
                <h3 className="font-display text-[20px] font-bold text-ink">
                  Teach Naturally
                </h3>
                <p className="text-[14px] text-muted leading-relaxed">
                  Connect 1-on-1 with your student in our browser-based video room or simply upload any lesson recording or transcript afterward. No software installation needed.
                </p>
                <ul className="space-y-2 pt-2 text-[13px] text-ink font-medium">
                  <li className="flex items-center gap-2">
                    <Check className="size-4 text-teal" />
                    <span>Real-time speech-to-text recording</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="size-4 text-teal" />
                    <span>Live teacher keyword bookmarking</span>
                  </li>
                </ul>
              </div>

              {/* Step 2 */}
              <div className="relative rounded-[var(--r-xl)] border-[1.5px] border-teal/40 bg-surface p-8 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <span className="flex size-10 items-center justify-center rounded-full bg-teal text-[15px] font-bold text-white">
                    2
                  </span>
                  <span className="rounded bg-teal-light px-2.5 py-1 text-[11px] font-bold text-teal dark:bg-teal/20">
                    Immediately After
                  </span>
                </div>
                <h3 className="font-display text-[20px] font-bold text-ink">
                  AI Structures, You Decide
                </h3>
                <p className="text-[14px] text-muted leading-relaxed">
                  Gemini extracts vocabulary with CEFR levels, grammar slips, and strengths. Spend 60 seconds reviewing suggestions: Accept, Edit, or Dismiss with one click.
                </p>
                <ul className="space-y-2 pt-2 text-[13px] text-ink font-medium">
                  <li className="flex items-center gap-2">
                    <Check className="size-4 text-teal" />
                    <span>8 structured dimensions extracted</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="size-4 text-teal" />
                    <span>100% human-verified quality assurance</span>
                  </li>
                </ul>
              </div>

              {/* Step 3 */}
              <div className="relative rounded-[var(--r-xl)] border border-border bg-surface p-8 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <span className="flex size-10 items-center justify-center rounded-full bg-teal text-[15px] font-bold text-white">
                    3
                  </span>
                  <span className="rounded bg-surface-2 px-2.5 py-1 text-[11px] font-medium text-muted">
                    Between Lessons
                  </span>
                </div>
                <h3 className="font-display text-[20px] font-bold text-ink">
                  Living Student Manuscript
                </h3>
                <p className="text-[14px] text-muted leading-relaxed">
                  Students log into their private hub to study their personalized vocabulary bank, review exact lesson snippets, and complete targeted spaced-repetition drills.
                </p>
                <ul className="space-y-2 pt-2 text-[13px] text-ink font-medium">
                  <li className="flex items-center gap-2">
                    <Check className="size-4 text-teal" />
                    <span>Audio pronunciation and examples</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="size-4 text-teal" />
                    <span>Continuous CEFR progress tracking</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* THE 8 PILLARS OF LESSON INTELLIGENCE (FEATURE BENTO)      */}
        {/* ========================================================= */}
        <section id="features" className="px-6 py-20 md:py-28">
          <div className="mx-auto max-w-7xl">
            <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
              <span className="text-[12px] font-bold uppercase tracking-wider text-teal">
                Comprehensive Pedagogy
              </span>
              <h2 className="font-display text-[32px] font-bold text-ink sm:text-[40px]">
                The 8 Pillars of AI Lesson Intelligence
              </h2>
              <p className="text-[15px] text-muted leading-relaxed">
                Rather than generic summaries, LinguaClass decomposes every lesson into 8 academically rigorous, actionable dimensions.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {/* Pillar 1 */}
              <div className="group rounded-[var(--r-xl)] border border-border bg-surface p-6 shadow-xs transition-all hover:border-teal/50 hover:shadow-md">
                <div className="flex size-10 items-center justify-center rounded-[var(--r-md)] bg-teal-light text-teal mb-4 group-hover:scale-110 transition-transform">
                  <FileText className="size-5" />
                </div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-muted">
                  Pillar 1
                </div>
                <h3 className="mt-1 font-display text-[17px] font-bold text-ink">
                  Executive Summary
                </h3>
                <p className="mt-2 text-[13px] text-muted leading-relaxed">
                  Concise 2–3 sentence overview of themes, discourse style, and communicative goals achieved during the session.
                </p>
              </div>

              {/* Pillar 2 */}
              <div className="group rounded-[var(--r-xl)] border border-border bg-surface p-6 shadow-xs transition-all hover:border-teal/50 hover:shadow-md">
                <div className="flex size-10 items-center justify-center rounded-[var(--r-md)] bg-amber-light text-amber-dark mb-4 group-hover:scale-110 transition-transform">
                  <BookOpen className="size-5" />
                </div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-muted">
                  Pillar 2
                </div>
                <h3 className="mt-1 font-display text-[17px] font-bold text-ink">
                  Vocabulary Bank
                </h3>
                <p className="mt-2 text-[13px] text-muted leading-relaxed">
                  All new target words, idioms, and collocations paired with IPA phonetics, contextual definitions, and CEFR tags.
                </p>
              </div>

              {/* Pillar 3 */}
              <div className="group rounded-[var(--r-xl)] border border-border bg-surface p-6 shadow-xs transition-all hover:border-teal/50 hover:shadow-md">
                <div className="flex size-10 items-center justify-center rounded-[var(--r-md)] bg-teal-light text-teal mb-4 group-hover:scale-110 transition-transform">
                  <Layers className="size-5" />
                </div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-muted">
                  Pillar 3
                </div>
                <h3 className="mt-1 font-display text-[17px] font-bold text-ink">
                  Grammar Focus
                </h3>
                <p className="mt-2 text-[13px] text-muted leading-relaxed">
                  Syntactic patterns explored (e.g. subjunctive triggers, relative pronouns, word order rules) with clean rule summaries.
                </p>
              </div>

              {/* Pillar 4 */}
              <div className="group rounded-[var(--r-xl)] border border-border bg-surface p-6 shadow-xs transition-all hover:border-teal/50 hover:shadow-md">
                <div className="flex size-10 items-center justify-center rounded-[var(--r-md)] bg-coral-light text-coral mb-4 group-hover:scale-110 transition-transform">
                  <Edit3 className="size-5" />
                </div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-muted">
                  Pillar 4
                </div>
                <h3 className="mt-1 font-display text-[17px] font-bold text-ink">
                  Spoken Corrections
                </h3>
                <p className="mt-2 text-[13px] text-muted leading-relaxed">
                  Specific speech slips captured side-by-side with idiomatic alternatives and concise pedagogical explanations.
                </p>
              </div>

              {/* Pillar 5 */}
              <div className="group rounded-[var(--r-xl)] border border-border bg-surface p-6 shadow-xs transition-all hover:border-teal/50 hover:shadow-md">
                <div className="flex size-10 items-center justify-center rounded-[var(--r-md)] bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 mb-4 group-hover:scale-110 transition-transform">
                  <Award className="size-5" />
                </div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-muted">
                  Pillar 5
                </div>
                <h3 className="mt-1 font-display text-[17px] font-bold text-ink">
                  Learner Strengths
                </h3>
                <p className="mt-2 text-[13px] text-muted leading-relaxed">
                  Celebration of fluid syntax, spontaneous idiomatic usage, and accurate pronunciation milestones to boost confidence.
                </p>
              </div>

              {/* Pillar 6 */}
              <div className="group rounded-[var(--r-xl)] border border-border bg-surface p-6 shadow-xs transition-all hover:border-teal/50 hover:shadow-md">
                <div className="flex size-10 items-center justify-center rounded-[var(--r-md)] bg-amber-light text-amber-dark mb-4 group-hover:scale-110 transition-transform">
                  <Zap className="size-5" />
                </div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-muted">
                  Pillar 6
                </div>
                <h3 className="mt-1 font-display text-[17px] font-bold text-ink">
                  Growth Areas
                </h3>
                <p className="mt-2 text-[13px] text-muted leading-relaxed">
                  High-leverage phonetic or grammatical bottlenecks to address in upcoming lessons, ranked by communicative importance.
                </p>
              </div>

              {/* Pillar 7 */}
              <div className="group rounded-[var(--r-xl)] border border-border bg-surface p-6 shadow-xs transition-all hover:border-teal/50 hover:shadow-md">
                <div className="flex size-10 items-center justify-center rounded-[var(--r-md)] bg-teal-light text-teal mb-4 group-hover:scale-110 transition-transform">
                  <GraduationCap className="size-5" />
                </div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-muted">
                  Pillar 7
                </div>
                <h3 className="mt-1 font-display text-[17px] font-bold text-ink">
                  Targeted Practice Plan
                </h3>
                <p className="mt-2 text-[13px] text-muted leading-relaxed">
                  Ready-to-use homework prompts, sentence transformations, and conversation scenarios directly tied to lesson content.
                </p>
              </div>

              {/* Pillar 8 */}
              <div className="group rounded-[var(--r-xl)] border border-border bg-surface p-6 shadow-xs transition-all hover:border-teal/50 hover:shadow-md">
                <div className="flex size-10 items-center justify-center rounded-[var(--r-md)] bg-surface-2 text-ink mb-4 group-hover:scale-110 transition-transform">
                  <BarChart3 className="size-5" />
                </div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-muted">
                  Pillar 8
                </div>
                <h3 className="mt-1 font-display text-[17px] font-bold text-ink">
                  CEFR Progress Matrix
                </h3>
                <p className="mt-2 text-[13px] text-muted leading-relaxed">
                  Longitudinal tracking across grammar, vocabulary, fluency, and comprehension from A1 to C2 mastery.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* PHILOSOPHY: TEACHER IN THE LOOP                           */}
        {/* ========================================================= */}
        <section id="philosophy" className="border-t border-border bg-surface py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 items-center">
              {/* Left Column Text */}
              <div className="lg:col-span-6 space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full bg-teal-light px-3 py-1 text-[12px] font-bold text-teal dark:bg-teal/20">
                  <ShieldCheck className="size-4" />
                  <span>The Pedagogical Guarantee</span>
                </div>
                <h2 className="font-display text-[32px] font-bold text-ink sm:text-[42px] leading-tight">
                  AI Proposes. <br />
                  <span className="text-teal">The Teacher Always Decides.</span>
                </h2>
                <p className="text-[16px] text-muted leading-relaxed">
                  Raw AI models can misinterpret deliberate colloquial slang, regional idioms, or nuanced poetic speech. In LinguaClass, AI never publishes unverified notes to students without your review.
                </p>
                <div className="space-y-3.5 pt-2">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-teal text-white">
                      <Check className="size-3" />
                    </div>
                    <div>
                      <strong className="text-[14px] text-ink font-semibold">1-Click Fast Verification:</strong>
                      <p className="text-[13px] text-muted">Accept, modify, or dismiss suggestions with keyboard shortcuts or single clicks.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-teal text-white">
                      <Check className="size-3" />
                    </div>
                    <div>
                      <strong className="text-[14px] text-ink font-semibold">Zero Hallucinations in Student Hubs:</strong>
                      <p className="text-[13px] text-muted">Every item in the student&apos;s spaced repetition bank carries the verified authority of their instructor.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-teal text-white">
                      <Check className="size-3" />
                    </div>
                    <div>
                      <strong className="text-[14px] text-ink font-semibold">Add Custom Teacher Annotations:</strong>
                      <p className="text-[13px] text-muted">Inject personal voice notes, private preparation memos, or tailored homework prompts instantly.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column Visual Card */}
              <div className="lg:col-span-6">
                <div className="relative rounded-[var(--r-xl)] border-[1.5px] border-border bg-page p-6 shadow-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <div className="flex items-center gap-2">
                      <span className="size-2 rounded-full bg-amber animate-pulse" />
                      <span className="text-[12px] font-semibold text-ink">
                        Teacher Review Console
                      </span>
                    </div>
                    <span className="font-mono text-[11px] text-muted">
                      3 items awaiting review
                    </span>
                  </div>

                  {/* Suggestion Card 1 (Accepted) */}
                  <div className="rounded-[var(--r-md)] border border-emerald-300 dark:border-emerald-800 bg-surface p-4 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                        Accepted by Teacher
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">
                        <Check className="size-3" /> Verified
                      </span>
                    </div>
                    <div className="mt-2 text-[13px] text-ink">
                      <span className="line-through text-muted mr-2">Je suis allé hier et je voyais un film.</span>
                      <span className="font-semibold text-teal">... et j&apos;ai vu un film.</span>
                    </div>
                    <div className="mt-1.5 text-[11px] text-muted">
                      Passé composé vs. Imparfait nuance correctly annotated.
                    </div>
                  </div>

                  {/* Suggestion Card 2 (Pending Review) */}
                  <div className="rounded-[var(--r-md)] border-[1.5px] border-dashed border-teal/50 bg-surface p-4 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-amber-dark">
                        Pending Your Approval
                      </span>
                      <span className="rounded bg-amber-light px-1.5 py-0.5 text-[10px] font-bold text-amber-dark">
                        AI Candidate
                      </span>
                    </div>
                    <div className="mt-2 text-[13px] text-ink">
                      Candidate vocabulary item: <strong>&ldquo;Inéluctable&rdquo;</strong> (Adj., C1 level)
                    </div>
                    <div className="mt-3 flex items-center justify-end gap-2">
                      <button className="rounded px-2.5 py-1 text-[11px] font-medium text-muted hover:text-ink border border-border">
                        Dismiss
                      </button>
                      <button className="rounded px-2.5 py-1 text-[11px] font-medium text-teal border border-teal/30 bg-teal-light/40">
                        Edit
                      </button>
                      <button className="rounded px-3 py-1 text-[11px] font-semibold text-white bg-teal shadow-xs">
                        Accept
                      </button>
                    </div>
                  </div>

                  <div className="p-3 rounded-[var(--r-md)] bg-surface-2 text-[12px] text-muted flex items-center gap-2">
                    <Sparkles className="size-4 text-teal shrink-0" />
                    <span>Average teacher review takes just 48 seconds per lesson.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* TESTIMONIALS / TEACHER VOICES                             */}
        {/* ========================================================= */}
        <section className="px-6 py-20 md:py-28 bg-surface-2/40">
          <div className="mx-auto max-w-7xl">
            <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
              <span className="text-[12px] font-bold uppercase tracking-wider text-teal">
                Educator Community
              </span>
              <h2 className="font-display text-[32px] font-bold text-ink sm:text-[40px]">
                Trusted by Independent Tutors & Language Academies
              </h2>
              <p className="text-[15px] text-muted leading-relaxed">
                See how language educators use LinguaClass to increase student retention, deliver institutional-grade value, and eliminate unpaid admin hours.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {/* Testimonial 1 */}
              <div className="rounded-[var(--r-xl)] border border-border bg-surface p-7 shadow-xs space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex text-amber">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="size-4 fill-amber" />
                    ))}
                  </div>
                  <p className="text-[14px] leading-relaxed text-ink italic">
                    &ldquo;My students used to forget what we covered between our weekly sessions. Now, every single word and correction is neatly cataloged. Several students told me it feels like they have a private textbook written just for them.&rdquo;
                  </p>
                </div>
                <div className="pt-4 border-t border-border/60 flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-teal text-white font-bold text-[14px]">
                    ML
                  </div>
                  <div>
                    <div className="text-[14px] font-bold text-ink">Madame Claire Laurent</div>
                    <div className="text-[12px] text-muted">French C1/C2 Specialist, Paris</div>
                  </div>
                </div>
              </div>

              {/* Testimonial 2 */}
              <div className="rounded-[var(--r-xl)] border border-border bg-surface p-7 shadow-xs space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex text-amber">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="size-4 fill-amber" />
                    ))}
                  </div>
                  <p className="text-[14px] leading-relaxed text-ink italic">
                    &ldquo;I used to spend 2 hours every evening typing notes into Google Docs for my 6 daily Spanish students. LinguaClass cut that down to 10 minutes total. I can&apos;t imagine teaching without it.&rdquo;
                  </p>
                </div>
                <div className="pt-4 border-t border-border/60 flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-amber text-white font-bold text-[14px]">
                    AR
                  </div>
                  <div>
                    <div className="text-[14px] font-bold text-ink">Alejandro Ramirez</div>
                    <div className="text-[12px] text-muted">DELE Examiner & Tutor, Madrid</div>
                  </div>
                </div>
              </div>

              {/* Testimonial 3 */}
              <div className="rounded-[var(--r-xl)] border border-border bg-surface p-7 shadow-xs space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex text-amber">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="size-4 fill-amber" />
                    ))}
                  </div>
                  <p className="text-[14px] leading-relaxed text-ink italic">
                    &ldquo;The distinction that &lsquo;AI proposes, teacher decides&rsquo; is what sold me. I don&apos;t want an AI replacing my expertise; I want a pedagogical assistant that does the heavy lifting while preserving my teaching authority.&rdquo;
                  </p>
                </div>
                <div className="pt-4 border-t border-border/60 flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-teal-dark text-white font-bold text-[14px]">
                    KS
                  </div>
                  <div>
                    <div className="text-[14px] font-bold text-ink">Kenji Sato</div>
                    <div className="text-[12px] text-muted">Director, Shibuya Japanese Academy</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* TRANSPARENT PRICING                                       */}
        {/* ========================================================= */}
        <section id="pricing" className="border-t border-border px-6 py-20 md:py-28">
          <div className="mx-auto max-w-7xl">
            <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
              <span className="text-[12px] font-bold uppercase tracking-wider text-teal">
                Straightforward Plans
              </span>
              <h2 className="font-display text-[32px] font-bold text-ink sm:text-[40px]">
                Invest in Your Teaching Practice
              </h2>
              <p className="text-[15px] text-muted leading-relaxed">
                Free for educators getting started. Upgrade when your student roster expands.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3 items-stretch max-w-5xl mx-auto">
              {/* Plan 1: Free Starter */}
              <div className="rounded-[var(--r-xl)] border border-border bg-surface p-8 shadow-xs flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="text-[13px] font-bold uppercase tracking-wider text-muted">
                    Starter Tutor
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="font-display text-[42px] font-bold text-ink">€0</span>
                    <span className="text-[14px] text-muted">/ forever</span>
                  </div>
                  <p className="text-[13px] text-muted">
                    Ideal for individual tutors wanting to test AI Lesson Intelligence with their first learners.
                  </p>
                  <ul className="space-y-2.5 pt-4 text-[13px] text-ink">
                    <li className="flex items-center gap-2">
                      <Check className="size-4 text-teal" />
                      <span>Up to 5 live lessons / month</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="size-4 text-teal" />
                      <span>Complete 8-pillar AI Lesson Intelligence</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="size-4 text-teal" />
                      <span>Student digital study hub</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="size-4 text-teal" />
                      <span>Built-in WebRTC video classroom</span>
                    </li>
                  </ul>
                </div>
                <div className="pt-8">
                  <Link
                    href="/signup/teacher"
                    className="block w-full text-center rounded-[var(--r-md)] border-[1.5px] border-border bg-surface py-2.5 text-[14px] font-semibold text-ink hover:bg-surface-2 transition-colors"
                  >
                    Start Free
                  </Link>
                </div>
              </div>

              {/* Plan 2: Pro Educator (Featured) */}
              <div className="relative rounded-[var(--r-xl)] border-2 border-teal bg-surface p-8 shadow-xl flex flex-col justify-between">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-teal px-3 py-0.5 text-[11px] font-bold text-white uppercase tracking-wider">
                  Most Popular
                </div>
                <div className="space-y-4">
                  <div className="text-[13px] font-bold uppercase tracking-wider text-teal">
                    Pro Educator
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="font-display text-[42px] font-bold text-ink">€24</span>
                    <span className="text-[14px] text-muted">/ month</span>
                  </div>
                  <p className="text-[13px] text-muted">
                    Everything an active full-time language instructor needs for an unlimited roster of students.
                  </p>
                  <ul className="space-y-2.5 pt-4 text-[13px] text-ink">
                    <li className="flex items-center gap-2">
                      <Check className="size-4 text-teal" />
                      <span><strong>Unlimited</strong> live lessons</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="size-4 text-teal" />
                      <span>Upload audio from Zoom / Google Meet</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="size-4 text-teal" />
                      <span>Custom teacher branding on student hubs</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="size-4 text-teal" />
                      <span>Spaced repetition vocab export (Anki/CSV)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="size-4 text-teal" />
                      <span>Longitudinal CEFR progress analytics</span>
                    </li>
                  </ul>
                </div>
                <div className="pt-8">
                  <Link
                    href="/signup/teacher"
                    className="block w-full text-center rounded-[var(--r-md)] bg-teal py-3 text-[14px] font-semibold text-white shadow-md hover:bg-teal-dark transition-colors"
                  >
                    Start 14-Day Free Trial
                  </Link>
                </div>
              </div>

              {/* Plan 3: Academy */}
              <div className="rounded-[var(--r-xl)] border border-border bg-surface p-8 shadow-xs flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="text-[13px] font-bold uppercase tracking-wider text-muted">
                    Language Academy
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="font-display text-[42px] font-bold text-ink">€79</span>
                    <span className="text-[14px] text-muted">/ month</span>
                  </div>
                  <p className="text-[13px] text-muted">
                    For boutique schools and language institutes managing multiple instructors and cohorts.
                  </p>
                  <ul className="space-y-2.5 pt-4 text-[13px] text-ink">
                    <li className="flex items-center gap-2">
                      <Check className="size-4 text-teal" />
                      <span>Includes up to 5 teacher seats</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="size-4 text-teal" />
                      <span>Centralized student cohort analytics</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="size-4 text-teal" />
                      <span>Custom curriculum and vocabulary lists</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="size-4 text-teal" />
                      <span>Dedicated pedagogical onboarding</span>
                    </li>
                  </ul>
                </div>
                <div className="pt-8">
                  <Link
                    href="/signup/teacher"
                    className="block w-full text-center rounded-[var(--r-md)] border-[1.5px] border-border bg-surface py-2.5 text-[14px] font-semibold text-ink hover:bg-surface-2 transition-colors"
                  >
                    Contact School Sales
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* INTERACTIVE FAQ                                           */}
        {/* ========================================================= */}
        <section id="faq" className="border-t border-border bg-surface px-6 py-20 md:py-28">
          <div className="mx-auto max-w-4xl">
            <div className="text-center space-y-3 mb-16">
              <span className="text-[12px] font-bold uppercase tracking-wider text-teal">
                Got Questions?
              </span>
              <h2 className="font-display text-[32px] font-bold text-ink sm:text-[40px]">
                Frequently Asked Questions
              </h2>
              <p className="text-[15px] text-muted">
                Everything you need to know about LinguaClass, lesson intelligence, and pedagogical control.
              </p>
            </div>

            <div className="space-y-4">
              {[
                {
                  q: "Does LinguaClass replace the language teacher?",
                  a: "Never. LinguaClass is fundamentally teacher-centric: 'AI proposes, teacher decides.' Language learning requires human empathy, cultural nuance, and interpersonal rapport. LinguaClass eliminates your administrative overhead (note-taking, transcription, formatting) so you can spend 100% of your energy actively teaching.",
                },
                {
                  q: "Can I use Zoom, Google Meet, or Skype instead of the built-in classroom?",
                  a: "Yes! While LinguaClass includes a built-in, low-latency video classroom with real-time speech transcription, you can also paste any audio recording or raw text transcript from Zoom, Google Meet, or Teams. The AI will extract the same 8-pillar Lesson Intelligence in seconds.",
                },
                {
                  q: "What languages and CEFR levels are supported?",
                  a: "LinguaClass supports over 40 languages including French, Spanish, German, Japanese, Mandarin, Italian, Portuguese, Arabic, and Russian across all CEFR bands (A1 beginner to C2 literary fluency). The AI automatically calibrates its vocabulary suggestions and grammar nuance based on the student's target level.",
                },
                {
                  q: "How does the student receive their notes?",
                  a: "Once you click 'Accept' on your lesson review, the student receives an email notification with a direct link to their private LinguaClass learning portal. There, they can view their lesson summary, listen to audio snippets, review highlighted errors, and practice interactive spaced-repetition flashcards.",
                },
                {
                  q: "Is student data private and secure?",
                  a: "Yes. All audio recordings and transcripts are encrypted in transit and at rest. We never use your private student conversations to train public foundation models.",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-[var(--r-xl)] border border-border bg-page p-5 transition-colors"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="flex w-full items-center justify-between text-left font-display text-[17px] font-bold text-ink"
                  >
                    <span>{item.q}</span>
                    <ChevronRight
                      className={`size-4 text-muted transition-transform duration-200 ${
                        openFaq === idx ? "rotate-90 text-teal" : ""
                      }`}
                    />
                  </button>
                  {openFaq === idx && (
                    <p className="mt-3 text-[14px] leading-relaxed text-muted border-t border-border/60 pt-3">
                      {item.a}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* BOTTOM HIGH-IMPACT CTA                                    */}
        {/* ========================================================= */}
        <section className="relative px-6 py-20 md:py-28 overflow-hidden bg-ink text-white">
          <div className="absolute inset-0 pointer-events-none opacity-20">
            <div className="absolute -top-32 -left-32 size-96 rounded-full bg-teal blur-3xl" />
            <div className="absolute -bottom-32 -right-32 size-96 rounded-full bg-amber blur-3xl" />
          </div>

          <div className="relative mx-auto max-w-4xl text-center space-y-6">
            <span className="rounded-full bg-teal/30 px-3.5 py-1 text-[12px] font-semibold text-teal-mid border border-teal/40">
              Transform Your Teaching Practice
            </span>
            <h2 className="font-display text-[34px] font-bold sm:text-[48px] leading-tight text-white">
              Give Your Students a Learning Record They Will Never Forget.
            </h2>
            <p className="mx-auto max-w-2xl text-[16px] text-white/75 leading-relaxed">
              Join hundreds of professional language educators who have eliminated note-taking fatigue and tripled student retention.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
              <Link
                href="/signup/teacher"
                className="group flex w-full sm:w-auto items-center justify-center gap-2 rounded-[var(--r-md)] bg-teal px-7 py-4 text-[15px] font-semibold text-white shadow-lg transition-all hover:bg-teal-dark"
              >
                <span>Create Free Teacher Account</span>
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/login"
                className="flex w-full sm:w-auto items-center justify-center rounded-[var(--r-md)] border border-white/20 bg-white/10 px-6 py-4 text-[15px] font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
              >
                Sign In to Existing Account
              </Link>
            </div>
            <div className="pt-4 text-[12px] text-white/50">
              Takes under 2 minutes to set up · No credit card required
            </div>
          </div>
        </section>
      </main>

      {/* ========================================================= */}
      {/* COMPREHENSIVE FOOTER                                      */}
      {/* ========================================================= */}
      <footer className="border-t border-border bg-surface py-14 text-ink">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
            {/* Brand Info (2 cols) */}
            <div className="col-span-2 space-y-4">
              <Link href="/" className="flex items-center gap-2.5">
                <div className="flex size-8 items-center justify-center rounded-[var(--r-md)] bg-teal font-display text-[16px] font-bold text-white">
                  L
                </div>
                <span className="font-display text-[18px] font-bold text-ink">
                  Lingua<span className="text-teal">Class</span>
                </span>
              </Link>
              <p className="max-w-sm text-[13px] text-muted leading-relaxed">
                The premier AI Lesson Intelligence platform for language educators. Turning live conversational nuances into structured, teacher-verified mastery.
              </p>
              <div className="text-[12px] text-muted">
                Metaphor: A lesson is an annotated manuscript.
              </div>
            </div>

            {/* Product Column */}
            <div className="space-y-3">
              <div className="text-[12px] font-bold uppercase tracking-wider text-ink">
                Product
              </div>
              <ul className="space-y-2 text-[13px] text-muted">
                <li>
                  <a href="#how-it-works" className="hover:text-ink transition-colors">
                    How It Works
                  </a>
                </li>
                <li>
                  <a href="#interactive-preview" className="hover:text-ink transition-colors">
                    Interactive Demo
                  </a>
                </li>
                <li>
                  <a href="#features" className="hover:text-ink transition-colors">
                    The 8 Pillars
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="hover:text-ink transition-colors">
                    Pricing
                  </a>
                </li>
              </ul>
            </div>

            {/* Portals Column */}
            <div className="space-y-3">
              <div className="text-[12px] font-bold uppercase tracking-wider text-ink">
                Portals
              </div>
              <ul className="space-y-2 text-[13px] text-muted">
                <li>
                  <Link href="/signup/teacher" className="hover:text-ink transition-colors">
                    Teacher Registration
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-ink transition-colors">
                    Teacher & Student Login
                  </Link>
                </li>
                <li>
                  <Link href="/teacher" className="hover:text-ink transition-colors">
                    Teacher Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/student" className="hover:text-ink transition-colors">
                    Student Study Hub
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal / Trust Column */}
            <div className="space-y-3">
              <div className="text-[12px] font-bold uppercase tracking-wider text-ink">
                Pedagogy & Trust
              </div>
              <ul className="space-y-2 text-[13px] text-muted">
                <li>
                  <span className="text-muted/80">CEFR Framework Alignment</span>
                </li>
                <li>
                  <span className="text-muted/80">Teacher-In-The-Loop AI</span>
                </li>
                <li>
                  <span className="text-muted/80">Privacy & Security</span>
                </li>
                <li>
                  <span className="text-muted/80">Terms of Service</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-between border-t border-border pt-6 text-[12px] text-muted gap-4">
            <div>
              © {new Date().getFullYear()} LinguaClass Inc. All rights reserved.
            </div>
            <div className="flex items-center gap-6">
              <span>English (US)</span>
              <span>Français</span>
              <span>Español</span>
              <span>Deutsch</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
