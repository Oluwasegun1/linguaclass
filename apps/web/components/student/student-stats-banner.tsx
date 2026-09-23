"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import {
  Flame,
  Calendar,
  Clock,
  Video,
  BookOpen,
  Award,
  Sparkles,
  ArrowRight,
} from "lucide-react";

interface StudentStatsBannerProps {
  studentName: string;
  enrolledCoursesCount: number;
  totalVocabLearned: number;
  lessonsAttended: number;
  nextLesson?: {
    id: string;
    title: string;
    courseTitle: string;
    scheduledAt: string;
    status: string;
  } | null;
  studentTimezone: string;
}

export function StudentStatsBanner({
  studentName,
  enrolledCoursesCount,
  totalVocabLearned,
  lessonsAttended,
  nextLesson,
  studentTimezone,
}: StudentStatsBannerProps) {
  const formattedNextLessonDate = nextLesson
    ? new Date(nextLesson.scheduledAt).toLocaleDateString([], {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-sm space-y-6">
      {/* Top Banner Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-amber-dark">
              <Sparkles className="w-3.5 h-3.5 text-amber" />
              Student Learning Center
            </span>
            <div className="flex items-center gap-1 rounded-full bg-amber-light px-2.5 py-0.5 text-xs font-bold text-amber-dark border border-amber/30">
              <Flame className="w-3.5 h-3.5 text-amber fill-amber" />
              <span>5 Day Streak</span>
            </div>
          </div>

          <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink">
            Welcome back, {studentName}
          </h1>

          <p className="text-sm text-muted max-w-2xl leading-relaxed">
            Track your CEFR proficiency milestones, practice active vocabulary with flashcards, and attend your live classroom sessions.
          </p>
        </div>

        {/* Next Live Session Spotlight Card */}
        {nextLesson && (
          <div className="rounded-2xl border border-teal-mid/40 bg-teal-light/20 p-4 sm:p-5 flex flex-col justify-between shrink-0 md:max-w-xs space-y-3">
            <div>
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal">
                  Next Live Classroom
                </span>
                <Badge variant={nextLesson.status === "LIVE" ? "live" : "scheduled"}>
                  {nextLesson.status === "LIVE" ? "LIVE NOW" : "UPCOMING"}
                </Badge>
              </div>

              <h4 className="font-display text-sm font-bold text-ink truncate">
                {nextLesson.title}
              </h4>
              <p className="text-[11px] text-muted truncate">
                {nextLesson.courseTitle}
              </p>
            </div>

            <div className="text-xs text-ink font-semibold flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-teal shrink-0" />
              <span>{formattedNextLessonDate}</span>
            </div>

            <Button
              variant="primary"
              size="sm"
              className="w-full text-xs bg-teal hover:bg-teal-dark font-semibold text-white flex items-center justify-center gap-1.5 shadow-xs"
              onClick={() => window.open(`/classroom/${nextLesson.id}`, "_blank")}
            >
              <Video className="w-3.5 h-3.5" />
              <span>Enter Classroom</span>
            </Button>
          </div>
        )}
      </div>

      {/* Quick Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-5 border-t border-border">
        <div className="p-3.5 rounded-xl bg-surface-2 border border-border/80 text-center sm:text-left">
          <span className="text-[11px] font-semibold text-muted flex items-center justify-center sm:justify-start gap-1">
            <BookOpen className="w-3.5 h-3.5 text-teal" /> Enrolled Courses
          </span>
          <p className="font-display text-2xl font-bold text-ink mt-1">
            {enrolledCoursesCount}
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-surface-2 border border-border/80 text-center sm:text-left">
          <span className="text-[11px] font-semibold text-muted flex items-center justify-center sm:justify-start gap-1">
            <Award className="w-3.5 h-3.5 text-amber-dark" /> Vocab Mastered
          </span>
          <p className="font-display text-2xl font-bold text-ink mt-1">
            {totalVocabLearned}
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-surface-2 border border-border/80 text-center sm:text-left">
          <span className="text-[11px] font-semibold text-muted flex items-center justify-center sm:justify-start gap-1">
            <Calendar className="w-3.5 h-3.5 text-teal" /> Live Sessions
          </span>
          <p className="font-display text-2xl font-bold text-ink mt-1">
            {lessonsAttended}
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-surface-2 border border-border/80 text-center sm:text-left">
          <span className="text-[11px] font-semibold text-muted flex items-center justify-center sm:justify-start gap-1">
            <Clock className="w-3.5 h-3.5 text-teal" /> Local Timezone
          </span>
          <p className="font-mono text-xs font-bold text-ink mt-2 truncate">
            {studentTimezone}
          </p>
        </div>
      </div>
    </div>
  );
}
