"use client";

import * as React from "react";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Clock,
  AlertTriangle,
  FileText,
  CheckCircle,
  ArrowRight,
  Send,
  X,
} from "lucide-react";

export interface PendingAssignmentItem {
  id: string;
  title: string;
  description: string;
  type: string;
  dueAt: string | null;
  lessonTitle: string;
  courseTitle: string;
  submissionStatus: "DRAFT" | "SUBMITTED" | "GRADED" | "NONE";
}

interface PendingAssignmentsSectionProps {
  assignments: PendingAssignmentItem[];
}

export function PendingAssignmentsSection({
  assignments,
}: PendingAssignmentsSectionProps) {
  const [submittingAssignment, setSubmittingAssignment] =
    React.useState<PendingAssignmentItem | null>(null);
  const [submissionText, setSubmissionText] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submittedIds, setSubmittedIds] = React.useState<string[]>([]);

  // Filter for unsubmitted or draft assignments
  const pendingItems = assignments.filter(
    (a) => (a.submissionStatus === "NONE" || a.submissionStatus === "DRAFT") && !submittedIds.includes(a.id)
  );

  if (pendingItems.length === 0) {
    return null; // Silent if no pending assignments
  }

  const now = new Date();

  const handleOpenSubmit = (item: PendingAssignmentItem) => {
    setSubmittingAssignment(item);
    setSubmissionText("");
  };

  const handleSubmitWork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submittingAssignment || !submissionText.trim()) return;

    try {
      setIsSubmitting(true);
      // Simulate submission endpoint
      await new Promise((res) => setTimeout(res, 600));
      setSubmittedIds((prev) => [...prev, submittingAssignment.id]);
      setSubmittingAssignment(null);
    } catch (err) {
      console.error("Submission failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section aria-label="Pending Homework & Assignments" className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center size-2 rounded-full bg-amber animate-ping" />
          <h3 className="font-display text-lg font-bold text-ink flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber" />
            Pending Assignments ({pendingItems.length})
          </h3>
        </div>
        <span className="text-xs text-muted">Time-sensitive action items</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pendingItems.map((item) => {
          const dueDate = item.dueAt ? new Date(item.dueAt) : null;
          const isOverdue = dueDate && dueDate < now;
          const isDueSoon = dueDate && !isOverdue && dueDate.getTime() - now.getTime() < 48 * 60 * 60 * 1000;

          return (
            <div
              key={item.id}
              className={`rounded-2xl border p-5 flex flex-col justify-between space-y-3 transition-all ${
                isOverdue
                  ? "border-coral/50 bg-coral-light/10 shadow-xs"
                  : isDueSoon
                  ? "border-amber/50 bg-amber-light/10 shadow-xs"
                  : "border-border bg-surface shadow-xs"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-semibold text-muted">
                    {item.courseTitle} • {item.lessonTitle}
                  </span>
                  {isOverdue ? (
                    <Badge variant="error">OVERDUE</Badge>
                  ) : isDueSoon ? (
                    <Badge variant="scheduled">DUE SOON</Badge>
                  ) : (
                    <Badge variant="cefr-a">ASSIGNED</Badge>
                  )}
                </div>

                <h4 className="font-display text-base font-bold text-ink">
                  {item.title}
                </h4>
                <p className="text-xs text-muted mt-1 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs">
                  <Clock className={`w-3.5 h-3.5 ${isOverdue ? "text-coral font-bold" : "text-amber"}`} />
                  <span className={isOverdue ? "text-coral font-bold" : "text-muted"}>
                    {dueDate
                      ? `Due ${dueDate.toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}`
                      : "Open deadline"}
                  </span>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleOpenSubmit(item)}
                  className={`h-8 text-xs font-semibold flex items-center gap-1.5 shadow-xs ${
                    isOverdue
                      ? "bg-coral hover:bg-coral-dark text-white"
                      : "bg-teal hover:bg-teal-dark text-white"
                  }`}
                >
                  <span>Submit Work</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Submission Modal */}
      {submittingAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl bg-surface border border-border shadow-2xl p-6 relative space-y-4">
            <button
              onClick={() => setSubmittingAssignment(null)}
              className="absolute top-5 right-5 p-1 rounded-lg text-muted hover:text-ink hover:bg-surface-2 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-xs font-semibold text-teal uppercase tracking-wider">
                {submittingAssignment.courseTitle}
              </span>
              <h3 className="font-display text-xl font-bold text-ink mt-0.5">
                {submittingAssignment.title}
              </h3>
              <p className="text-xs text-muted mt-1 leading-relaxed">
                {submittingAssignment.description}
              </p>
            </div>

            <form onSubmit={handleSubmitWork} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink">
                  Your Written Response or Homework Notes:
                </label>
                <textarea
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  placeholder="Type your translation, essay, or dialogue exercise here..."
                  rows={5}
                  required
                  className="w-full rounded-xl border border-border bg-surface-2 p-3 text-xs text-ink placeholder:text-muted focus:outline-hidden focus:border-teal resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSubmittingAssignment(null)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isSubmitting}
                  className="bg-teal hover:bg-teal-dark font-semibold text-white flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? "Submitting..." : "Turn In Assignment"}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
