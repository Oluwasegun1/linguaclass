"use client";

import * as React from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { useLessonAnalysis } from "@/hooks/use-lesson-analysis";
import { AIReviewPanel } from "@/components/ai/ai-review-panel";
import {
  ArrowLeft,
  Sparkles,
  Calendar,
  BookOpen,
  Loader2,
  Users,
  Video,
} from "lucide-react";

export default function LessonReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: lessonId } = React.use(params);
  const { data, isLoading, error, refetch } = useLessonAnalysis(lessonId);

  return (
    <div className="min-h-screen bg-page text-ink pb-20">
      {/* Top Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-surface shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href={data?.lesson ? `/teacher/courses/${data.lesson.course.id}` : "/teacher/courses"}
              className="flex items-center gap-2 text-muted hover:text-ink transition-colors mr-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-xs font-semibold hidden sm:inline">Back to Course</span>
            </Link>
            <div className="h-4 w-px bg-border hidden sm:block" />
            <Link href="/" className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-teal font-display text-base font-bold text-white shadow-xs">
                L
              </div>
              <span className="font-display text-lg font-semibold text-ink">
                LinguaClass
              </span>
            </Link>
            <span className="rounded-full bg-teal-light px-2.5 py-0.5 text-[11px] font-semibold text-teal border border-teal-mid/50 hidden sm:inline-flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              AI Review & Pedagogical Feedback
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {data?.lesson && (
              <Button
                variant="outline"
                size="sm"
                className="hidden sm:flex items-center gap-1.5"
                onClick={() => window.open(`/classroom/${data.lesson.id}`, "_blank")}
              >
                <Video className="w-3.5 h-3.5 text-teal" />
                <span>Classroom</span>
              </Button>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-20 rounded-2xl border border-border bg-surface text-center">
            <Loader2 className="w-8 h-8 text-teal animate-spin mb-3" />
            <span className="text-sm font-medium text-muted">
              Loading lesson transcript and AI pedagogical insights...
            </span>
          </div>
        ) : error || !data?.lesson ? (
          <div className="p-8 rounded-2xl border border-coral bg-coral-light/20 text-center space-y-3">
            <p className="text-sm font-semibold text-coral">
              {(error as Error)?.message || "Lesson not found"}
            </p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : (
          <>
            {/* Lesson Title Header */}
            <div className="rounded-2xl border border-border bg-surface p-6 sm:p-7 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-surface-2 text-ink">
                      {data.lesson.course.language}
                    </span>
                    <Badge variant="cefr-b">
                      CEFR {data.lesson.course.level}
                    </Badge>
                    <span className="text-xs text-muted">
                      Course: <strong>{data.lesson.course.title}</strong>
                    </span>
                  </div>

                  <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink">
                    {data.lesson.title}
                  </h1>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted shrink-0">
                  <Calendar className="w-4 h-4 text-teal" />
                  <span>
                    {new Date(data.lesson.scheduledAt).toLocaleDateString([], {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* AI Review Panel Component */}
            <AIReviewPanel lessonId={lessonId} data={data} />
          </>
        )}
      </main>
    </div>
  );
}
