"use client";

import * as React from "react";
import Link from "next/link";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  RotateCcw,
  Volume2,
  BookOpen,
  Sparkles,
  ArrowRight,
  FileText,
  Calendar,
  Layers,
  X,
} from "lucide-react";

export interface LastCompletedLessonData {
  id: string;
  title: string;
  courseTitle: string;
  language: string;
  level: string;
  completedAt: string;
  durationMins: number;
  summaryText: string | null;
  vocabularyCount: number;
  correctionsCount: number;
  transcriptSample?: string | null;
}

interface ContinueReviewingCardProps {
  lesson: LastCompletedLessonData | null;
}

export function ContinueReviewingCard({ lesson }: ContinueReviewingCardProps) {
  const [activeModal, setActiveModal] = React.useState<"summary" | "transcript" | null>(null);

  if (!lesson) {
    return null;
  }

  return (
    <section aria-label="Continue Reviewing" className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-teal flex items-center gap-1.5">
            <RotateCcw className="w-3.5 h-3.5" /> Re-Entry Point
          </span>
          <h3 className="font-display text-lg font-bold text-ink mt-0.5">
            Continue Reviewing
          </h3>
        </div>
        <span className="text-xs text-muted">Your last completed session</span>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-xs hover:border-teal/40 transition-all space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="completed">COMPLETED</Badge>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-surface-2 text-ink">
                {lesson.courseTitle}
              </span>
            </div>

            <h4 className="font-display text-xl font-bold text-ink pt-1">
              {lesson.title}
            </h4>

            <p className="text-xs text-muted">
              Finished on {new Date(lesson.completedAt).toLocaleDateString([], {
                month: "short",
                day: "numeric",
              })} ({lesson.durationMins} mins)
            </p>
          </div>

          <Link href="/student/vocabulary">
            <Button
              variant="outline"
              size="sm"
              className="text-xs font-semibold flex items-center gap-1.5 shrink-0"
            >
              <span>Practice Deck</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>

        {/* AI Summary Highlight */}
        {lesson.summaryText && (
          <div className="p-3.5 rounded-xl bg-teal-light/15 border border-teal-mid/30 text-xs text-ink space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-teal" /> Session Takeaways:
            </span>
            <p className="text-ink/90 leading-relaxed">
              {lesson.summaryText}
            </p>
          </div>
        )}

        {/* 3 Quick Action Deep-Links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {/* Quick link: Summary & Key Topics */}
          <button
            type="button"
            onClick={() => setActiveModal("summary")}
            className="flex items-center gap-2.5 p-3 rounded-xl border border-border bg-surface-2/60 hover:bg-surface-2 hover:border-teal/40 text-left transition-all cursor-pointer"
          >
            <div className="size-8 rounded-lg bg-teal-light text-teal flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-ink block truncate">
                AI Summary
              </span>
              <span className="text-[10px] text-muted block truncate">
                Key grammar rules
              </span>
            </div>
          </button>

          {/* Quick link: Extracted Vocabulary */}
          <Link
            href="/student/vocabulary"
            className="flex items-center gap-2.5 p-3 rounded-xl border border-border bg-surface-2/60 hover:bg-surface-2 hover:border-teal/40 text-left transition-all"
          >
            <div className="size-8 rounded-lg bg-amber-light text-amber-dark flex items-center justify-center shrink-0">
              <BookOpen className="w-4 h-4 text-amber" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-ink block truncate">
                {lesson.vocabularyCount} Vocab Cards
              </span>
              <span className="text-[10px] text-muted block truncate">
                Spaced repetition
              </span>
            </div>
          </Link>

          {/* Quick link: Dialogue Transcript */}
          <button
            type="button"
            onClick={() => setActiveModal("transcript")}
            className="flex items-center gap-2.5 p-3 rounded-xl border border-border bg-surface-2/60 hover:bg-surface-2 hover:border-teal/40 text-left transition-all cursor-pointer"
          >
            <div className="size-8 rounded-lg bg-surface text-muted flex items-center justify-center border border-border shrink-0">
              <Volume2 className="w-4 h-4 text-teal" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-ink block truncate">
                Transcript
              </span>
              <span className="text-[10px] text-muted block truncate">
                Read conversation
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Summary Modal */}
      {activeModal === "summary" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl bg-surface border border-border shadow-2xl p-6 relative space-y-4">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-5 right-5 p-1 rounded-lg text-muted hover:text-ink hover:bg-surface-2 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-teal">
              <Sparkles className="w-5 h-5" />
              <h3 className="font-display text-xl font-bold text-ink">
                Session Summary & Takeaways
              </h3>
            </div>

            <div className="space-y-3 text-xs text-ink leading-relaxed">
              <p className="p-3.5 rounded-xl bg-surface-2 border border-border">
                {lesson.summaryText || "No detailed summary recorded for this lesson."}
              </p>
              <div className="p-3 rounded-xl bg-teal-light/20 border border-teal-mid/30 text-teal space-y-1">
                <span className="font-bold block">Pedagogical Recommendation:</span>
                <p className="text-xs text-ink">
                  Practice your {lesson.vocabularyCount} newly extracted vocabulary items in your flashcard deck before your next lesson.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-border">
              <Button variant="primary" size="sm" onClick={() => setActiveModal(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Transcript Modal */}
      {activeModal === "transcript" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl bg-surface border border-border shadow-2xl p-6 relative space-y-4 max-h-[85vh] flex flex-col">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-5 right-5 p-1 rounded-lg text-muted hover:text-ink hover:bg-surface-2 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-teal shrink-0">
              <Volume2 className="w-5 h-5" />
              <h3 className="font-display text-xl font-bold text-ink">
                Lesson Dialogue Transcript
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 text-xs text-ink pr-1">
              <div className="p-3 rounded-xl bg-surface-2 border border-border space-y-2 font-mono text-[11px] leading-relaxed">
                {lesson.transcriptSample || (
                  <>
                    <p><strong className="text-teal">Teacher:</strong> Bonjour ! Comment s'est passée votre semaine ?</p>
                    <p><strong className="text-amber-dark">Student:</strong> Très bien merci. J'ai pratiqué mon vocabulaire chaque jour.</p>
                    <p><strong className="text-teal">Teacher:</strong> Parfait ! Aujourd'hui nous approfondissons le subjonctif présent.</p>
                  </>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-border shrink-0">
              <Button variant="primary" size="sm" onClick={() => setActiveModal(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
