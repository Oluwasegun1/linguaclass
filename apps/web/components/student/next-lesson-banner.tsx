"use client";

import * as React from "react";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Video,
  Calendar,
  Clock,
  User,
  Sparkles,
  ArrowRight,
  Radio,
} from "lucide-react";
import { formatInTimezone } from "@/lib/date-utils";

export interface NextLessonData {
  id: string;
  title: string;
  courseTitle: string;
  language: string;
  level: string;
  teacherName: string;
  teacherAvatar?: string | null;
  scheduledAt: string; // UTC ISO string
  durationMins: number;
  status: "SCHEDULED" | "LIVE" | "COMPLETED" | "CANCELLED";
}

interface NextLessonBannerProps {
  lesson: NextLessonData | null;
  studentTimezone: string;
}

export function NextLessonBanner({
  lesson,
  studentTimezone,
}: NextLessonBannerProps) {
  const [now, setNow] = React.useState<Date>(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  if (!lesson) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-surface-2 text-muted flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-ink">
              No Upcoming Lessons This Week
            </h3>
            <p className="text-xs text-muted mt-0.5">
              Your instructor hasn't scheduled a live session for the next 7 days. Check back soon.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const lessonDate = new Date(lesson.scheduledAt);
  const diffMinutes = Math.round((lessonDate.getTime() - now.getTime()) / (1000 * 60));
  const isLive = lesson.status === "LIVE" || (diffMinutes <= 10 && diffMinutes >= -lesson.durationMins);
  const isWithin10Mins = diffMinutes <= 10 && diffMinutes > -lesson.durationMins;
  const isFarOut = diffMinutes > 7 * 24 * 60; // More than 7 days

  // Formatted date in student's timezone
  const formattedTime = formatInTimezone(lesson.scheduledAt, studentTimezone, {
    timeZone: studentTimezone,
    weekday: "long",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });

  // Quieter card if lesson is > 7 days away
  if (isFarOut) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">
              Next Scheduled Session
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-surface-2 text-ink">
              {lesson.courseTitle}
            </span>
          </div>
          <h3 className="font-display text-lg font-bold text-ink">{lesson.title}</h3>
          <p className="text-xs text-muted flex items-center gap-2">
            <span>With <strong>{lesson.teacherName}</strong></span>
            <span>•</span>
            <span>{formattedTime}</span>
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open(`/classroom/${lesson.id}`, "_blank")}
          className="shrink-0 text-xs"
        >
          View Room
        </Button>
      </div>
    );
  }

  // Loudest Full-Width Banner in Teal
  return (
    <section aria-label="Next Live Lesson" className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-dark via-teal to-[#14535A] text-white p-6 sm:p-8 shadow-lg border border-teal-light/20">
      {/* Background radial accent glow */}
      <div className="pointer-events-none absolute -right-20 -top-20 size-80 rounded-full bg-teal-light/20 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 -bottom-20 size-80 rounded-full bg-amber/15 blur-3xl" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-3">
          {/* Top Tag & Live Pulse */}
          <div className="flex flex-wrap items-center gap-2.5">
            {isLive ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/20 px-3 py-1 text-xs font-bold text-green-300 border border-green-400/40 animate-pulse">
                <Radio className="w-3.5 h-3.5" /> LIVE CLASSROOM ACTIVE
              </span>
            ) : isWithin10Mins ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-light/30 px-3 py-1 text-xs font-bold text-amber-light border border-amber/40">
                <Clock className="w-3.5 h-3.5 text-amber" /> STARTS IN {Math.max(1, diffMinutes)} MINS
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white/90 border border-white/20">
                <Sparkles className="w-3.5 h-3.5 text-amber-light" /> NEXT UPCOMING LESSON
              </span>
            )}

            <span className="rounded-full bg-black/20 px-2.5 py-0.5 text-xs font-medium text-white/80 backdrop-blur-xs">
              {lesson.language} • {lesson.level}
            </span>
          </div>

          {/* Lesson Title */}
          <div>
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white drop-shadow-xs">
              {lesson.title}
            </h2>
            <p className="text-sm sm:text-base text-teal-light/90 mt-1 font-medium">
              Course: {lesson.courseTitle}
            </p>
          </div>

          {/* Teacher & Localized Time */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-1 text-xs sm:text-sm text-white/85">
            <div className="flex items-center gap-2">
              <div className="size-6 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs text-white">
                {lesson.teacherName.charAt(0).toUpperCase()}
              </div>
              <span>Instructor: <strong>{lesson.teacherName}</strong></span>
            </div>

            <div className="flex items-center gap-1.5 font-semibold text-white">
              <Calendar className="w-4 h-4 text-teal-light shrink-0" />
              <span>{formattedTime}</span>
            </div>

            <div className="flex items-center gap-1 text-white/70 text-xs">
              <Clock className="w-3.5 h-3.5" />
              <span>{lesson.durationMins} minutes</span>
            </div>
          </div>
        </div>

        {/* Join Button / Activation Status */}
        <div className="flex flex-col items-start lg:items-end shrink-0 gap-2">
          {isLive || isWithin10Mins ? (
            <Button
              variant="primary"
              size="lg"
              className="h-13 px-8 text-base bg-white text-teal-dark hover:bg-white/90 font-bold shadow-xl hover:scale-105 transition-all flex items-center gap-2 cursor-pointer"
              onClick={() => window.open(`/classroom/${lesson.id}`, "_blank")}
            >
              <Video className="w-5 h-5 text-teal-dark" />
              <span>Join Live Classroom</span>
              <ArrowRight className="w-4 h-4 text-teal-dark" />
            </Button>
          ) : (
            <div className="space-y-1.5 text-left lg:text-right">
              <Button
                variant="outline"
                size="lg"
                className="h-12 px-6 text-sm border-white/30 text-white hover:bg-white/10 font-semibold flex items-center gap-2"
                onClick={() => window.open(`/classroom/${lesson.id}`, "_blank")}
              >
                <Video className="w-4 h-4" />
                <span>Classroom Preview</span>
              </Button>
              <p className="text-[11px] text-white/70">
                Join button activates 10 minutes before start time
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
