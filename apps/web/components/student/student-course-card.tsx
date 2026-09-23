"use client";

import * as React from "react";
import Link from "next/link";
import { Badge } from "@workspace/ui/components/badge";
import { ProgressRing } from "@/components/student/progress-ring";
import { formatInTimezone } from "@/lib/date-utils";
import {
  Calendar,
  Clock,
  User,
  ArrowRight,
  BookOpen,
} from "lucide-react";

export interface StudentCourseCardProps {
  course: {
    id: string;
    title: string;
    language: string;
    level: string;
    description: string | null;
    teacher: {
      name: string;
      avatarUrl?: string | null;
    };
    totalLessons: number;
    completedLessons: number;
    nextLessonScheduledAt: string | null;
    nextLessonTitle?: string | null;
    resourceCount: number;
  };
  studentTimezone: string;
}

export function StudentCourseCard({
  course,
  studentTimezone,
}: StudentCourseCardProps) {
  const getLevelVariant = (level: string) => {
    if (level.startsWith("A")) return "cefr-a" as const;
    if (level.startsWith("B")) return "cefr-b" as const;
    return "cefr-c" as const;
  };

  const formattedNextLesson = course.nextLessonScheduledAt
    ? formatInTimezone(course.nextLessonScheduledAt, studentTimezone, {
        timeZone: studentTimezone,
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : null;

  return (
    <Link
      href={`/student/classes/${course.id}`}
      className="group relative rounded-2xl border border-border bg-surface p-6 shadow-xs hover:border-teal/50 hover:shadow-md transition-all flex flex-col justify-between space-y-5"
    >
      <div className="space-y-4">
        {/* Header: Language & CEFR Badge + Visual Progress Ring */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-surface-2 text-ink">
              {course.language}
            </span>
            <Badge variant={getLevelVariant(course.level)}>
              CEFR {course.level}
            </Badge>
          </div>

          {/* Visual Progress Ring (Lessons Attended vs Total) */}
          <div className="shrink-0 flex items-center gap-2">
            <ProgressRing
              completed={course.completedLessons}
              total={course.totalLessons}
              size={44}
              strokeWidth={4}
            />
          </div>
        </div>

        {/* Course Title & Description */}
        <div>
          <h3 className="font-display text-xl font-bold text-ink group-hover:text-teal transition-colors">
            {course.title}
          </h3>
          {course.description && (
            <p className="text-xs text-muted mt-1.5 line-clamp-2 leading-relaxed">
              {course.description}
            </p>
          )}
        </div>
      </div>

      {/* Footer Section: Teacher, Next Lesson Date, and Arrow */}
      <div className="space-y-3 pt-4 border-t border-border/80">
        {/* Next Scheduled Lesson Date */}
        <div className="flex items-center gap-2 text-xs text-ink">
          <Calendar className="w-3.5 h-3.5 text-teal shrink-0" />
          {formattedNextLesson ? (
            <div className="truncate">
              <span className="text-muted">Next: </span>
              <span className="font-semibold text-ink">{formattedNextLesson}</span>
            </div>
          ) : (
            <span className="text-muted italic">No upcoming session</span>
          )}
        </div>

        {/* Teacher Avatar & View Course Link */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-2.5 min-w-0">
            {course.teacher.avatarUrl ? (
              <img
                src={course.teacher.avatarUrl}
                alt={course.teacher.name}
                className="size-7 rounded-full object-cover border border-border shrink-0"
              />
            ) : (
              <div className="size-7 rounded-full bg-teal-light text-teal font-bold text-xs flex items-center justify-center border border-teal/20 shrink-0">
                {course.teacher.name.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-xs font-medium text-ink truncate">
              {course.teacher.name}
            </span>
          </div>

          <div className="flex items-center gap-1 text-xs font-semibold text-teal group-hover:translate-x-0.5 transition-transform shrink-0">
            <span>View Syllabus</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </Link>
  );
}
