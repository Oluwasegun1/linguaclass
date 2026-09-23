"use client";

import * as React from "react";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export interface StudentAssignmentItem {
  id: string;
  title: string;
  description: string;
  type: string;
  dueAt: string | null;
  lessonTitle: string;
  courseTitle: string;
  submission: {
    id: string;
    status: "DRAFT" | "SUBMITTED" | "GRADED";
    content: string | null;
    submittedAt: string | null;
    feedback: {
      score: number | null;
      strengths: string | null;
      improvements: string | null;
      teacherNote: string | null;
      publishedAt: string | null;
    } | null;
  } | null;
}

interface StudentAssignmentsCardProps {
  assignments: StudentAssignmentItem[];
}

export function StudentAssignmentsCard({ assignments }: StudentAssignmentsCardProps) {
  const [selectedAssignment, setSelectedAssignment] =
    React.useState<StudentAssignmentItem | null>(null);

  if (assignments.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center space-y-2">
        <FileText className="w-6 h-6 text-teal mx-auto" />
        <h4 className="font-display text-base font-bold text-ink">
          No Pending Homework
        </h4>
        <p className="text-xs text-muted max-w-sm mx-auto">
          You are all caught up! New assignments and practice exercises will appear here when assigned by your teacher.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-teal">
            Practice & Homework
          </span>
          <h3 className="font-display text-xl font-bold text-ink mt-0.5">
            Assignments ({assignments.length})
          </h3>
        </div>
        <span className="text-xs text-muted font-medium">
          {assignments.filter((a) => a.submission?.status === "GRADED").length} of {assignments.length} Graded
        </span>
      </div>

      <div className="space-y-3">
        {assignments.map((item) => {
          const isGraded = item.submission?.status === "GRADED";
          const isSubmitted = item.submission?.status === "SUBMITTED";
          const isPending = !item.submission || item.submission.status === "DRAFT";

          return (
            <div
              key={item.id}
              className="p-4 rounded-xl border border-border/80 bg-surface-2/40 hover:bg-surface-2 transition-all space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-surface border border-border text-muted">
                      {item.courseTitle}
                    </span>
                    <Badge
                      variant={
                        isGraded
                          ? "completed"
                          : isSubmitted
                          ? "scheduled"
                          : "error"
                      }
                    >
                      {isGraded ? "GRADED" : isSubmitted ? "SUBMITTED" : "PENDING"}
                    </Badge>
                  </div>
                  <h4 className="font-display text-base font-bold text-ink">
                    {item.title}
                  </h4>
                  <p className="text-xs text-muted mt-1 line-clamp-2">
                    {item.description}
                  </p>
                </div>

                {isGraded && item.submission?.feedback?.score != null && (
                  <div className="size-11 rounded-xl bg-teal-light text-teal border border-teal-mid/40 flex flex-col items-center justify-center shrink-0">
                    <span className="font-display text-sm font-bold">
                      {item.submission.feedback.score}%
                    </span>
                    <span className="text-[8px] font-semibold uppercase">Score</span>
                  </div>
                )}
              </div>

              {/* Feedback Banner if Graded */}
              {isGraded && item.submission?.feedback && (
                <div className="p-3 rounded-lg bg-teal-light/20 border border-teal-mid/30 space-y-1.5 text-xs text-ink">
                  <div className="flex items-center gap-1.5 font-bold text-teal">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Teacher Feedback & AI Insights:</span>
                  </div>
                  {item.submission.feedback.teacherNote && (
                    <p className="text-ink/90 italic">
                      "{item.submission.feedback.teacherNote}"
                    </p>
                  )}
                  {item.submission.feedback.strengths && (
                    <div className="text-[11px] text-muted">
                      <strong className="text-teal">Strengths:</strong> {item.submission.feedback.strengths}
                    </div>
                  )}
                </div>
              )}

              {/* Bottom Meta */}
              <div className="flex items-center justify-between text-xs text-muted pt-2 border-t border-border/50">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {item.dueAt
                    ? `Due ${new Date(item.dueAt).toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                      })}`
                    : "No strict deadline"}
                </span>

                <span className="text-[11px] font-medium text-teal">
                  Lesson: {item.lessonTitle}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
