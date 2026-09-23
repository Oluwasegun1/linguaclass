"use client";

import * as React from "react";
import { Badge } from "@workspace/ui/components/badge";
import { Sparkles, AlertCircle, CheckCircle, Lightbulb } from "lucide-react";

export interface StudentCorrectionItem {
  id: string;
  original: string;
  corrected: string;
  explanation: string;
  teacherNote: string | null;
  reviewedAt: string | null;
  lessonTitle: string;
  courseTitle: string;
}

interface StudentCorrectionsCardProps {
  corrections: StudentCorrectionItem[];
}

export function StudentCorrectionsCard({ corrections }: StudentCorrectionsCardProps) {
  if (corrections.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center space-y-2">
        <Sparkles className="w-6 h-6 text-teal mx-auto" />
        <h4 className="font-display text-base font-bold text-ink">
          No Grammar Corrections Yet
        </h4>
        <p className="text-xs text-muted max-w-sm mx-auto leading-relaxed">
          During your live sessions, AI and your teacher will identify pronunciation and grammar nuances to help you sound like a native speaker.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-teal flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Pedagogical AI Insights
          </span>
          <h3 className="font-display text-xl font-bold text-ink mt-0.5">
            Personal Grammar Corrections ({corrections.length})
          </h3>
        </div>
        <Badge variant="completed">Teacher Reviewed</Badge>
      </div>

      <div className="space-y-4">
        {corrections.map((corr) => (
          <div
            key={corr.id}
            className="p-4 rounded-xl border border-teal-mid/30 bg-surface-2/60 space-y-3"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-muted">
                {corr.courseTitle} • {corr.lessonTitle}
              </span>
              <span className="text-[11px] text-muted">
                {corr.reviewedAt
                  ? new Date(corr.reviewedAt).toLocaleDateString([], {
                      month: "short",
                      day: "numeric",
                    })
                  : "Recent"}
              </span>
            </div>

            {/* Error vs Correction Diff */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-coral-light/20 border border-coral/30 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-coral">
                  What You Said:
                </span>
                <p className="font-medium text-ink">"{corr.original}"</p>
              </div>

              <div className="p-3 rounded-lg bg-teal-light/25 border border-teal-mid/40 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal">
                  Native Phrasing:
                </span>
                <p className="font-medium text-ink">"{corr.corrected}"</p>
              </div>
            </div>

            {/* Explanation & Note */}
            <div className="p-2.5 rounded-lg bg-surface border border-border/80 text-xs text-muted leading-relaxed">
              <strong className="text-ink">Why: </strong>
              {corr.explanation}
            </div>

            {corr.teacherNote && (
              <div className="p-2.5 rounded-lg bg-amber-light/20 border border-amber/30 text-xs text-ink flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-amber-dark shrink-0 mt-0.5" />
                <div>
                  <strong className="text-amber-dark">Teacher Note: </strong>
                  <span>{corr.teacherNote}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
