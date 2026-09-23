"use client";

import * as React from "react";
import Link from "next/link";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Sparkles,
  Award,
  CheckCircle2,
  TrendingUp,
  X,
  ArrowRight,
  MessageSquare,
  User,
} from "lucide-react";

export interface RecentFeedbackData {
  id: string;
  submissionId: string;
  assignmentTitle: string;
  courseTitle: string;
  teacherName: string;
  score: number | null;
  strengths?: string | null;
  improvements?: string | null;
  teacherNote?: string | null;
  publishedAt: string;
}

interface RecentFeedbackCardProps {
  feedbacks: RecentFeedbackData[];
}

export function RecentFeedbackCard({ feedbacks }: RecentFeedbackCardProps) {
  const [dismissedIds, setDismissedIds] = React.useState<string[]>([]);
  const [hasLoadedStorage, setHasLoadedStorage] = React.useState(false);

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem("linguaclass_dismissed_feedback");
      if (stored) {
        setDismissedIds(JSON.parse(stored));
      }
    } catch {
      // ignore localStorage errors
    }
    setHasLoadedStorage(true);
  }, []);

  const handleDismiss = (id: string) => {
    const updated = [...dismissedIds, id];
    setDismissedIds(updated);
    try {
      localStorage.setItem("linguaclass_dismissed_feedback", JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  // Active unread / non-dismissed feedbacks
  const activeFeedbacks = feedbacks.filter(
    (f) => !dismissedIds.includes(f.id)
  );

  if (!hasLoadedStorage || activeFeedbacks.length === 0) {
    return null;
  }

  // Display the latest published feedback notification
  const item = activeFeedbacks[0];
  if (!item) {
    return null;
  }

  return (
    <section aria-label="Recent Feedback" className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-dark flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber" /> New Notification
          </span>
          <h3 className="font-display text-lg font-bold text-ink mt-0.5">
            Recent Teacher Feedback
          </h3>
        </div>
        <button
          type="button"
          onClick={() => handleDismiss(item.id)}
          className="text-xs text-muted hover:text-ink flex items-center gap-1 transition-colors p-1"
        >
          <X className="w-3.5 h-3.5" />
          <span>Dismiss</span>
        </button>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-amber/40 bg-gradient-to-r from-amber-light/20 via-surface to-surface p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="cefr-a">FEEDBACK PUBLISHED</Badge>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-surface-2 text-ink">
                {item.courseTitle}
              </span>
            </div>

            <h4 className="font-display text-xl font-bold text-ink pt-0.5">
              {item.assignmentTitle}
            </h4>

            <div className="flex items-center gap-2 text-xs text-muted pt-0.5">
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-teal" />
                Reviewed by <strong>{item.teacherName}</strong>
              </span>
              <span>•</span>
              <span>
                {new Date(item.publishedAt).toLocaleDateString([], {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>

          {item.score !== null && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface border border-border shadow-xs self-start sm:self-auto">
              <Award className="w-5 h-5 text-amber" />
              <div>
                <span className="text-[10px] uppercase font-bold text-muted block">Grade</span>
                <span className="text-lg font-bold text-ink">{item.score}/100</span>
              </div>
            </div>
          )}
        </div>

        {/* Teacher Note & Comments */}
        {item.teacherNote && (
          <div className="p-3.5 rounded-xl bg-surface-2 border border-border text-xs text-ink space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-teal">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Teacher Note:</span>
            </div>
            <p className="leading-relaxed text-ink/90 italic">
              "{item.teacherNote}"
            </p>
          </div>
        )}

        {/* Strengths & Improvements */}
        {(item.strengths || item.improvements) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {item.strengths && (
              <div className="p-3 rounded-xl bg-teal-light/20 border border-teal-mid/30 text-xs space-y-1">
                <span className="font-bold text-teal flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Strengths
                </span>
                <p className="text-ink/90 text-[11px] leading-relaxed">
                  {item.strengths}
                </p>
              </div>
            )}

            {item.improvements && (
              <div className="p-3 rounded-xl bg-amber-light/20 border border-amber/30 text-xs space-y-1">
                <span className="font-bold text-amber-dark flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" /> Next Steps & Practice
                </span>
                <p className="text-ink/90 text-[11px] leading-relaxed">
                  {item.improvements}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="pt-2 flex items-center justify-between border-t border-border/80">
          <span className="text-[11px] text-muted">
            Marked as reviewed upon dismissal
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDismiss(item.id)}
            className="text-xs font-semibold"
          >
            Mark as Read & Dismiss
          </Button>
        </div>
      </div>
    </section>
  );
}
