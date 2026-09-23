"use client";

import * as React from "react";
import Link from "next/link";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { formatInTimezone } from "@/lib/date-utils";
import {
  Calendar,
  Clock,
  Video,
  Sparkles,
  BookOpen,
  FileText,
  CheckCircle2,
  AlertCircle,
  CalendarPlus,
  ArrowRight,
  User,
  Check,
  ChevronRight,
} from "lucide-react";

export interface UpcomingLessonItem {
  id: string;
  title: string;
  courseTitle: string;
  language: string;
  level: string;
  teacherName: string;
  teacherAvatar?: string | null;
  scheduledAt: string;
  durationMins: number;
  status: "SCHEDULED" | "LIVE";
  objectives?: string | null;
}

export interface PastLessonItem {
  id: string;
  title: string;
  courseTitle: string;
  language: string;
  level: string;
  teacherName: string;
  teacherAvatar?: string | null;
  completedAt: string;
  durationMins: number;
  vocabularyCount: number;
  isAiSummaryReady: boolean;
  assignment?: {
    id: string;
    title: string;
    dueAt: string | null;
    status: "NONE" | "ASSIGNED" | "SUBMITTED" | "GRADED" | "OVERDUE";
    score?: number | null;
  } | null;
}

interface StudentLessonsToggleViewProps {
  upcomingLessons: UpcomingLessonItem[];
  pastLessons: PastLessonItem[];
  studentTimezone: string;
}

export function StudentLessonsToggleView({
  upcomingLessons,
  pastLessons,
  studentTimezone,
}: StudentLessonsToggleViewProps) {
  const [activeTab, setActiveTab] = React.useState<"upcoming" | "past">("upcoming");
  const [calendarAddedId, setCalendarAddedId] = React.useState<string | null>(null);
  const [now, setNow] = React.useState<Date>(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const getLevelVariant = (level: string) => {
    if (level.startsWith("A")) return "cefr-a" as const;
    if (level.startsWith("B")) return "cefr-b" as const;
    return "cefr-c" as const;
  };

  const handleAddToCalendar = (lesson: UpcomingLessonItem) => {
    const startDate = new Date(lesson.scheduledAt);
    const endDate = new Date(startDate.getTime() + lesson.durationMins * 60000);

    const pad = (n: number) => (n < 10 ? "0" + n : n);
    const toICSDate = (d: Date) =>
      `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;

    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//LinguaClass//Lesson Schedule//EN",
      "BEGIN:VEVENT",
      `UID:${lesson.id}@linguaclass.app`,
      `DTSTAMP:${toICSDate(new Date())}`,
      `DTSTART:${toICSDate(startDate)}`,
      `DTEND:${toICSDate(endDate)}`,
      `SUMMARY:${lesson.courseTitle}: ${lesson.title}`,
      `DESCRIPTION:Live language lesson with ${lesson.teacherName}.`,
      "STATUS:CONFIRMED",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${lesson.title.replace(/\s+/g, "_")}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setCalendarAddedId(lesson.id);
    setTimeout(() => setCalendarAddedId(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* 2-Section Segmented Tab Toggle */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="inline-flex rounded-xl bg-surface-2 p-1 border border-border">
          <button
            type="button"
            onClick={() => setActiveTab("upcoming")}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "upcoming"
                ? "bg-surface text-ink shadow-xs"
                : "text-muted hover:text-ink"
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-teal" />
            <span>Upcoming Sessions</span>
            <span className="rounded-full bg-teal-light px-2 py-0.5 text-[10px] font-bold text-teal">
              {upcomingLessons.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("past")}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "past"
                ? "bg-surface text-ink shadow-xs"
                : "text-muted hover:text-ink"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-teal" />
            <span>Past & Completed</span>
            <span className="rounded-full bg-surface px-2 py-0.5 text-[10px] font-bold text-muted border border-border">
              {pastLessons.length}
            </span>
          </button>
        </div>

        <span className="text-xs text-muted hidden sm:inline">
          Times converted to <strong>{studentTimezone}</strong>
        </span>
      </div>

      {/* SECTION 1: UPCOMING LESSONS */}
      {activeTab === "upcoming" && (
        <div className="space-y-4">
          {upcomingLessons.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-surface p-12 text-center max-w-md mx-auto space-y-3">
              <div className="size-12 rounded-2xl bg-teal-light text-teal flex items-center justify-center mx-auto">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="font-display text-lg font-bold text-ink">
                No Upcoming Lessons Scheduled
              </h3>
              <p className="text-xs text-muted leading-relaxed">
                You don't have any lessons scheduled in the coming days. Check back once your instructor posts the next session.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {upcomingLessons.map((lesson) => {
                const lessonDate = new Date(lesson.scheduledAt);
                const diffMinutes = Math.round(
                  (lessonDate.getTime() - now.getTime()) / (1000 * 60)
                );
                const isLive =
                  lesson.status === "LIVE" ||
                  (diffMinutes <= 10 && diffMinutes >= -lesson.durationMins);
                const isWithin10Mins =
                  diffMinutes <= 10 && diffMinutes > -lesson.durationMins;

                const formattedTime = formatInTimezone(
                  lesson.scheduledAt,
                  studentTimezone,
                  {
                    timeZone: studentTimezone,
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  }
                );

                return (
                  <div
                    key={lesson.id}
                    className={`rounded-2xl border p-6 flex flex-col justify-between space-y-4 transition-all ${
                      isLive
                        ? "border-green-500/50 bg-green-500/5 ring-1 ring-green-500/20 shadow-md"
                        : isWithin10Mins
                        ? "border-amber/50 bg-amber-light/10 ring-1 ring-amber/20 shadow-md"
                        : "border-border bg-surface shadow-xs hover:border-teal/40"
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Header tags */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-surface-2 text-ink">
                            {lesson.courseTitle}
                          </span>
                          <Badge variant={getLevelVariant(lesson.level)}>
                            {lesson.language} {lesson.level}
                          </Badge>
                        </div>

                        {isLive ? (
                          <Badge variant="live">LIVE ACTIVE</Badge>
                        ) : isWithin10Mins ? (
                          <Badge variant="scheduled">STARTS SOON</Badge>
                        ) : (
                          <Badge variant="scheduled">SCHEDULED</Badge>
                        )}
                      </div>

                      {/* Lesson Title */}
                      <h3 className="font-display text-xl font-bold text-ink">
                        {lesson.title}
                      </h3>

                      {/* Local Date & Duration */}
                      <div className="p-3 rounded-xl bg-surface-2/70 border border-border/80 flex items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2 font-semibold text-ink">
                          <Calendar className="w-4 h-4 text-teal shrink-0" />
                          <span>{formattedTime}</span>
                        </div>
                        <span className="text-muted flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {lesson.durationMins}m
                        </span>
                      </div>

                      {/* Teacher & Objectives */}
                      <div className="flex items-center gap-2 text-xs text-muted">
                        <User className="w-3.5 h-3.5 text-teal" />
                        <span>Instructor: <strong>{lesson.teacherName}</strong></span>
                      </div>

                      {lesson.objectives && (
                        <p className="text-xs text-muted leading-relaxed line-clamp-2">
                          {lesson.objectives}
                        </p>
                      )}
                    </div>

                    {/* Actions: Join Button + Add to Calendar */}
                    <div className="pt-4 border-t border-border flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => handleAddToCalendar(lesson)}
                        className="text-xs font-semibold text-muted hover:text-teal flex items-center gap-1.5 transition-colors p-1"
                        title="Add to Google Calendar / Apple Calendar / Outlook"
                      >
                        {calendarAddedId === lesson.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-teal font-bold" />
                            <span className="text-teal font-bold">Saved .ics</span>
                          </>
                        ) : (
                          <>
                            <CalendarPlus className="w-3.5 h-3.5" />
                            <span>Add to Calendar</span>
                          </>
                        )}
                      </button>

                      {isLive || isWithin10Mins ? (
                        <Button
                          variant="primary"
                          size="sm"
                          className="bg-teal hover:bg-teal-dark font-bold text-white flex items-center gap-1.5 shadow-sm"
                          onClick={() => window.open(`/classroom/${lesson.id}`, "_blank")}
                        >
                          <Video className="w-4 h-4" />
                          <span>Join Classroom</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs font-semibold"
                          onClick={() => window.open(`/classroom/${lesson.id}`, "_blank")}
                        >
                          <Video className="w-3.5 h-3.5 text-teal" />
                          <span>Classroom Preview</span>
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: PAST & COMPLETED LESSONS */}
      {activeTab === "past" && (
        <div className="space-y-4">
          {pastLessons.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-surface p-12 text-center max-w-md mx-auto space-y-3">
              <div className="size-12 rounded-2xl bg-surface-2 text-muted flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-display text-lg font-bold text-ink">
                No Completed Lessons Yet
              </h3>
              <p className="text-xs text-muted leading-relaxed">
                As you attend live sessions, completed lessons with AI summaries, transcripts, and vocabulary will appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {pastLessons.map((lesson) => {
                const formattedDate = formatInTimezone(
                  lesson.completedAt,
                  studentTimezone,
                  {
                    timeZone: studentTimezone,
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  }
                );

                return (
                  <Link
                    key={lesson.id}
                    href={`/student/lessons/${lesson.id}`}
                    className="group rounded-2xl border border-border bg-surface p-6 shadow-xs hover:border-teal/50 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      {/* Top ribbon: Course title & Completed badge */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="completed">COMPLETED</Badge>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-surface-2 text-ink">
                            {lesson.courseTitle}
                          </span>
                        </div>
                        <span className="text-xs text-muted">
                          {lesson.durationMins} mins
                        </span>
                      </div>

                      {/* Lesson Title (in Lora italic per specification) */}
                      <h3 className="font-display italic text-xl sm:text-2xl font-bold text-ink group-hover:text-teal transition-colors">
                        {lesson.title}
                      </h3>

                      {/* Date & Teacher */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
                        <span className="flex items-center gap-1.5 font-medium text-ink">
                          <Calendar className="w-3.5 h-3.5 text-teal" />
                          {formattedDate}
                        </span>
                        <span>•</span>
                        <span>Instructor: <strong>{lesson.teacherName}</strong></span>
                      </div>

                      {/* Metadata Chips: Vocabulary Added, AI Summary, Homework Status */}
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        {/* Vocab added */}
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-light/20 border border-teal-mid/30 text-[11px] font-semibold text-teal">
                          <BookOpen className="w-3 h-3 text-teal" />
                          {lesson.vocabularyCount} Vocab Added
                        </span>

                        {/* AI Summary Status */}
                        {lesson.isAiSummaryReady ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-light/30 border border-teal-mid/40 text-[11px] font-semibold text-teal-dark">
                            <Sparkles className="w-3 h-3 text-amber" />
                            AI Summary Ready
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-2 text-[11px] font-medium text-muted">
                            Summary Processing
                          </span>
                        )}

                        {/* Assignment Status */}
                        {lesson.assignment ? (
                          lesson.assignment.status === "GRADED" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-green-500/15 border border-green-500/30 text-[11px] font-bold text-green-700 dark:text-green-400">
                              <CheckCircle2 className="w-3 h-3" />
                              Graded: {lesson.assignment.score}/100
                            </span>
                          ) : lesson.assignment.status === "SUBMITTED" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-light/30 border border-teal-mid/40 text-[11px] font-medium text-teal">
                              <FileText className="w-3 h-3" />
                              Submitted
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-light/20 border border-amber/30 text-[11px] font-semibold text-amber-dark">
                              <AlertCircle className="w-3 h-3 text-amber" />
                              Homework Assigned
                            </span>
                          )
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] text-muted">
                            No Homework
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Bottom CTA */}
                    <div className="pt-3 border-t border-border flex items-center justify-between text-xs font-semibold text-teal">
                      <span>Open Lesson Review & Insights</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
