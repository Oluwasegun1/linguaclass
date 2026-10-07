"use client";

import * as React from "react";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Textarea } from "@workspace/ui/components/form-elements";
import {
  useTriggerLessonAnalysis,
  useSaveAnalysisReview,
  useReviewItem,
  type LessonAnalysisData,
  type LessonIntelligencePayload,
  type GrammarCorrectionItem,
  type VocabularyCandidateItem,
} from "@/hooks/use-lesson-analysis";
import {
  Sparkles,
  Check,
  X,
  Edit2,
  BookOpen,
  Volume2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Loader2,
  ChevronDown,
  ChevronUp,
  Target,
  TrendingUp,
  Dumbbell,
  Star,
  ArrowRight,
  RotateCcw,
} from "lucide-react";

interface AIReviewPanelProps {
  lessonId: string;
  data: LessonAnalysisData;
}

// ── Section header with collapse toggle ──────────────────────────────────────

function SectionHeader({
  icon,
  title,
  count,
  status,
  onToggle,
  expanded,
}: {
  icon: React.ReactNode;
  title: string;
  count?: number;
  status?: "SUGGESTED" | "ACCEPTED" | "EDITED" | "DISMISSED";
  onToggle?: () => void;
  expanded: boolean;
}) {
  const statusColors: Record<string, string> = {
    SUGGESTED: "text-amber-600 bg-amber-50 border-amber-200",
    ACCEPTED: "text-teal bg-teal-light border-teal-mid/50",
    EDITED: "text-blue-600 bg-blue-50 border-blue-200",
    DISMISSED: "text-muted bg-surface-2 border-border",
  };

  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between py-3 text-left"
    >
      <div className="flex items-center gap-2.5">
        <span className="text-teal">{icon}</span>
        <span className="font-semibold text-sm text-ink">{title}</span>
        {count !== undefined && (
          <span className="rounded-full bg-surface-2 border border-border px-2 py-0.5 text-xs font-bold text-muted">
            {count}
          </span>
        )}
        {status && (
          <span
            className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${statusColors[status] || statusColors.SUGGESTED}`}
          >
            {status}
          </span>
        )}
      </div>
      {onToggle && (
        <span className="text-muted">
          {expanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </span>
      )}
    </button>
  );
}

// ── Transcript input panel ────────────────────────────────────────────────────

function TranscriptInputPanel({
  lessonId,
  language,
  level,
  objectives,
  onGenerated,
}: {
  lessonId: string;
  language: string;
  level: string;
  objectives: string | null;
  onGenerated: () => void;
}) {
  const [transcript, setTranscript] = React.useState("");
  const triggerMutation = useTriggerLessonAnalysis();

  const handleGenerate = async () => {
    if (!transcript.trim()) return;
    try {
      await triggerMutation.mutateAsync({
        lessonId,
        transcript: transcript.trim(),
        language,
        studentLevel: level,
        objectives: objectives ? [objectives] : undefined,
      });
      onGenerated();
    } catch {
      // Error is surfaced via triggerMutation.error
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-dashed border-teal/40 bg-teal-light/10 p-5 space-y-3">
        <div className="flex items-start gap-3">
          <div className="size-10 rounded-xl bg-teal-light text-teal flex items-center justify-center shrink-0 mt-0.5">
            <Volume2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-semibold text-sm text-ink">
              Paste the lesson transcript
            </h4>
            <p className="text-xs text-muted mt-0.5 leading-relaxed">
              Paste the conversation between teacher and student. The AI will
              analyze it and extract structured learning intelligence for your
              review.
            </p>
          </div>
        </div>

        <Textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder={`Teacher: Bonjour ! Aujourd'hui nous allons parler des voyages.\nStudent: Bonjour. La semaine dernière je suis allé à Paris...\nTeacher: Très bien ! Qu'est-ce que vous avez fait à Paris ?`}
          className="min-h-[180px] text-xs font-mono resize-y"
          disabled={triggerMutation.isPending}
        />

        <div className="flex items-center justify-between">
          <span className="text-xs text-muted">
            {transcript.length > 0
              ? `${transcript.length.toLocaleString()} characters`
              : "Minimum 10 characters required"}
          </span>

          <Button
            variant="primary"
            onClick={handleGenerate}
            disabled={
              triggerMutation.isPending || transcript.trim().length < 10
            }
            className="flex items-center gap-2 bg-teal hover:bg-teal-dark text-white"
          >
            {triggerMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analyzing lesson...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Lesson Intelligence</span>
              </>
            )}
          </Button>
        </div>

        {triggerMutation.error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
            <strong>Error:</strong>{" "}
            {(triggerMutation.error as Error)?.message ||
              "Something went wrong"}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Loading state ─────────────────────────────────────────────────────────────

function AnalyzingState() {
  return (
    <div className="rounded-2xl border border-teal/30 bg-teal-light/10 p-8 space-y-5">
      <div className="flex items-center gap-3">
        <Loader2 className="w-5 h-5 text-teal animate-spin" />
        <span className="font-semibold text-sm text-ink">
          Analyzing lesson...
        </span>
      </div>
      <div className="space-y-2 text-xs text-muted">
        {[
          "Reading transcript",
          "Identifying topics",
          "Extracting vocabulary",
          "Analyzing grammar",
          "Finding corrections",
          "Generating practice recommendations",
        ].map((step, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full border border-teal/40 flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-teal/40" />
            </span>
            <span>{step}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main AI Review Panel ──────────────────────────────────────────────────────

export function AIReviewPanel({ lessonId, data }: AIReviewPanelProps) {
  const analysis = data.analysis;
  const intelligence = analysis?.payload ?? null;

  // Section expand/collapse state
  const [sections, setSections] = React.useState({
    summary: true,
    topics: true,
    vocabulary: true,
    grammar: true,
    corrections: true,
    strengths: true,
    areasForImprovement: true,
    suggestedPractice: true,
    transcript: false,
  });

  const [editingSection, setEditingSection] = React.useState<string | null>(null);
  const [editedPayload, setEditedPayload] =
    React.useState<LessonIntelligencePayload | null>(null);
  const [showTranscriptInput, setShowTranscriptInput] = React.useState(false);

  const triggerMutation = useTriggerLessonAnalysis();
  const reviewMutation = useReviewItem();
  const saveReviewMutation = useSaveAnalysisReview();

  const toggleSection = (section: keyof typeof sections) => {
    setSections((s) => ({ ...s, [section]: !s[section] }));
  };

  const analysisStatus = analysis?.analysisStatus ?? null;

  // ── No analysis yet ────────────────────────────────────────────────────────

  if (!analysis) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-dashed border-border bg-surface p-10 text-center space-y-4">
          <div className="size-14 rounded-2xl bg-teal-light text-teal flex items-center justify-center mx-auto">
            <Sparkles className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-display text-xl font-bold text-ink">
              No AI Analysis Generated Yet
            </h3>
            <p className="text-sm text-muted mt-1.5 max-w-md mx-auto leading-relaxed">
              Provide a lesson transcript and LinguaClass AI will extract
              topics, vocabulary, grammar observations, corrections, and
              suggested practice for your review.
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => setShowTranscriptInput(true)}
            className="inline-flex items-center gap-2 bg-teal hover:bg-teal-dark text-white"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Lesson Intelligence</span>
          </Button>
        </div>

        {showTranscriptInput && (
          <TranscriptInputPanel
            lessonId={lessonId}
            language={data.lesson.course.language}
            level={data.lesson.course.level}
            objectives={data.lesson.objectives}
            onGenerated={() => setShowTranscriptInput(false)}
          />
        )}
      </div>
    );
  }

  // ── Analysis exists but payload is missing (legacy / old analysis) ─────────

  if (!intelligence) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-border bg-surface p-6 space-y-4">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full bg-teal-light border border-teal-mid/40 px-2.5 py-0.5 text-xs font-semibold text-teal">
              <Sparkles className="w-3.5 h-3.5" />
              {analysis.model} • {analysis.modelVersion}
            </span>
            <span className="text-xs text-muted">
              Analyzed on {new Date(analysis.processedAt).toLocaleDateString()}
            </span>
          </div>

          <p className="text-sm text-muted">
            {analysis.summaryText ||
              "This analysis was generated with an older version of the AI engine and does not have structured data."}
          </p>

          {analysis.topicsCovered?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {analysis.topicsCovered.map((t, i) => (
                <Badge key={i} variant="cefr-b">
                  {t}
                </Badge>
              ))}
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              triggerMutation.mutate({
                lessonId,
                ...(analysis.sourceTranscript
                  ? { transcript: analysis.sourceTranscript }
                  : {}),
                language: data.lesson.course.language,
                studentLevel: data.lesson.course.level,
              })
            }
            disabled={triggerMutation.isPending}
            className="flex items-center gap-1.5 text-xs"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${triggerMutation.isPending ? "animate-spin" : ""}`}
            />
            Re-analyze with new AI engine
          </Button>
        </div>

        {showTranscriptInput && (
          <TranscriptInputPanel
            lessonId={lessonId}
            language={data.lesson.course.language}
            level={data.lesson.course.level}
            objectives={data.lesson.objectives}
            onGenerated={() => setShowTranscriptInput(false)}
          />
        )}
      </div>
    );
  }

  const effectiveIntelligence = editedPayload ?? intelligence;

  // ── Handle accept/dismiss whole analysis ──────────────────────────────────

  const handleAcceptAnalysis = async () => {
    await saveReviewMutation.mutateAsync({
      lessonId,
      analysisId: analysis.id,
      status: "ACCEPTED",
    });
  };

  const handleDismissAnalysis = async () => {
    if (
      window.confirm(
        "Dismiss this AI analysis? It will be marked as dismissed and not published to students."
      )
    ) {
      await saveReviewMutation.mutateAsync({
        lessonId,
        analysisId: analysis.id,
        status: "DISMISSED",
      });
    }
  };

  const handleSaveEdited = async () => {
    if (!editedPayload) return;
    await saveReviewMutation.mutateAsync({
      lessonId,
      analysisId: analysis.id,
      status: "EDITED",
      payload: editedPayload,
    });
    setEditingSection(null);
    setEditedPayload(null);
  };

  const handleReanalyze = () => {
    setShowTranscriptInput(true);
    setEditedPayload(null);
    setEditingSection(null);
  };

  const isDismissed = analysisStatus === "DISMISSED";
  const isReviewed =
    analysisStatus === "ACCEPTED" || analysisStatus === "EDITED";

  return (
    <div className="space-y-4">
      {/* ── Analysis header card ─────────────────────────────────────────── */}
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-full bg-teal-light border border-teal-mid/40 px-2.5 py-0.5 text-xs font-semibold text-teal">
                <Sparkles className="w-3.5 h-3.5" />
                Gemini • {analysis.modelVersion}
              </span>
              <span
                className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                  isDismissed
                    ? "text-muted bg-surface-2 border-border"
                    : isReviewed
                      ? "text-teal bg-teal-light border-teal-mid/50"
                      : "text-amber-600 bg-amber-50 border-amber-200"
                }`}
              >
                {analysis.analysisStatus}
              </span>
              <span className="text-xs text-muted">
                {new Date(analysis.processedAt).toLocaleDateString([], {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>

            <h2 className="font-display text-xl font-bold text-ink">
              AI Lesson Intelligence
            </h2>
            <p className="text-xs text-muted max-w-xl leading-relaxed">
              AI-generated — not yet authoritative. Review each section before
              publishing to students.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReanalyze}
              disabled={triggerMutation.isPending || saveReviewMutation.isPending}
              className="flex items-center gap-1.5 text-xs"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${triggerMutation.isPending ? "animate-spin" : ""}`}
              />
              Re-analyze
            </Button>

            {!isDismissed && !isReviewed && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDismissAnalysis}
                  disabled={saveReviewMutation.isPending}
                  className="flex items-center gap-1.5 text-xs text-muted hover:text-coral"
                >
                  <X className="w-3.5 h-3.5" />
                  Dismiss
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleAcceptAnalysis}
                  disabled={saveReviewMutation.isPending}
                  className="flex items-center gap-1.5 text-xs bg-teal hover:bg-teal-dark text-white"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Accept Analysis
                </Button>
              </>
            )}

            {editedPayload && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveEdited}
                disabled={saveReviewMutation.isPending}
                className="flex items-center gap-1.5 text-xs bg-teal hover:bg-teal-dark text-white"
              >
                <Check className="w-3.5 h-3.5" />
                Save Edits
              </Button>
            )}
          </div>
        </div>

        {saveReviewMutation.error && (
          <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
            {(saveReviewMutation.error as Error)?.message || "Failed to save"}
          </div>
        )}
      </div>

      {showTranscriptInput && (
        <TranscriptInputPanel
          lessonId={lessonId}
          language={data.lesson.course.language}
          level={data.lesson.course.level}
          objectives={data.lesson.objectives}
          onGenerated={() => setShowTranscriptInput(false)}
        />
      )}

      {isDismissed && (
        <div className="rounded-2xl border border-border bg-surface-2 p-6 text-center space-y-3">
          <p className="text-sm text-muted">
            This analysis has been dismissed and will not be shown to students.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReanalyze}
            className="flex items-center gap-1.5 text-xs mx-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Start over with new transcript
          </Button>
        </div>
      )}

      {!isDismissed && (
        <div className="rounded-2xl border border-border bg-surface shadow-xs divide-y divide-border">
          {/* ── Summary ──────────────────────────────────────────────────── */}
          <div className="px-6">
            <SectionHeader
              icon={<BookOpen className="w-4 h-4" />}
              title="Lesson Summary"
              expanded={sections.summary}
              onToggle={() => toggleSection("summary")}
            />
            {sections.summary && (
              <div className="pb-5 space-y-3">
                {editingSection === "summary" ? (
                  <div className="space-y-2">
                    <Textarea
                      value={
                        (editedPayload ?? intelligence).summary
                      }
                      onChange={(e) =>
                        setEditedPayload((prev) => ({
                          ...(prev ?? intelligence),
                          summary: e.target.value,
                        }))
                      }
                      className="text-sm min-h-[100px]"
                    />
                    <div className="flex items-center gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingSection(null);
                          if (!editedPayload) setEditedPayload(null);
                        }}
                        className="text-xs h-7"
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setEditingSection(null)}
                        className="text-xs h-7 bg-teal hover:bg-teal-dark text-white"
                      >
                        Done
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-sm text-ink leading-relaxed">
                      {effectiveIntelligence.summary}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingSection("summary");
                        if (!editedPayload)
                          setEditedPayload({ ...intelligence });
                      }}
                      className="text-xs h-7 shrink-0 text-muted hover:text-ink"
                    >
                      <Edit2 className="w-3.5 h-3.5 mr-1" />
                      Edit
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Topics ───────────────────────────────────────────────────── */}
          <div className="px-6">
            <SectionHeader
              icon={<Target className="w-4 h-4" />}
              title="Topics"
              count={effectiveIntelligence.topics.length}
              expanded={sections.topics}
              onToggle={() => toggleSection("topics")}
            />
            {sections.topics && (
              <div className="pb-5">
                {effectiveIntelligence.topics.length === 0 ? (
                  <p className="text-xs text-muted italic">No topics identified.</p>
                ) : (
                  <div className="space-y-2">
                    {effectiveIntelligence.topics.map((topic, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 p-3 rounded-xl bg-surface-2 border border-border"
                      >
                        <ArrowRight className="w-4 h-4 text-teal shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-ink">
                            {topic.title}
                          </p>
                          {topic.description && (
                            <p className="text-xs text-muted mt-0.5">
                              {topic.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Vocabulary ───────────────────────────────────────────────── */}
          <div className="px-6">
            <SectionHeader
              icon={<BookOpen className="w-4 h-4" />}
              title="Vocabulary"
              count={effectiveIntelligence.vocabulary.length}
              expanded={sections.vocabulary}
              onToggle={() => toggleSection("vocabulary")}
            />
            {sections.vocabulary && (
              <div className="pb-5">
                {effectiveIntelligence.vocabulary.length === 0 ? (
                  <p className="text-xs text-muted italic">
                    No vocabulary items identified.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {effectiveIntelligence.vocabulary.map((item, i) => (
                      <div
                        key={i}
                        className="p-4 rounded-xl bg-surface-2 border border-border space-y-1.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-sm text-ink">
                            {item.word}
                          </span>
                          {item.partOfSpeech && (
                            <span className="text-[10px] text-muted font-medium bg-surface border border-border rounded px-1.5 py-0.5">
                              {item.partOfSpeech}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-teal font-semibold">
                          {item.meaning}
                        </p>
                        {item.context && (
                          <p className="text-xs text-muted">
                            <span className="font-semibold">Context:</span>{" "}
                            {item.context}
                          </p>
                        )}
                        {item.example && (
                          <p className="text-xs text-muted italic bg-surface rounded p-2 border border-border/60">
                            &ldquo;{item.example}&rdquo;
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Grammar ──────────────────────────────────────────────────── */}
          <div className="px-6">
            <SectionHeader
              icon={<AlertCircle className="w-4 h-4" />}
              title="Grammar"
              count={effectiveIntelligence.grammar.length}
              expanded={sections.grammar}
              onToggle={() => toggleSection("grammar")}
            />
            {sections.grammar && (
              <div className="pb-5">
                {effectiveIntelligence.grammar.length === 0 ? (
                  <p className="text-xs text-muted italic">
                    No grammar concepts identified.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {effectiveIntelligence.grammar.map((g, i) => (
                      <div
                        key={i}
                        className="p-4 rounded-xl border border-border bg-surface-2 space-y-2"
                      >
                        <p className="font-semibold text-sm text-ink">
                          {g.concept}
                        </p>
                        <p className="text-xs text-muted leading-relaxed">
                          {g.explanation}
                        </p>
                        {g.example && (
                          <p className="text-xs italic text-ink bg-surface rounded p-2 border border-border/60">
                            &ldquo;{g.example}&rdquo;
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Corrections ──────────────────────────────────────────────── */}
          <div className="px-6">
            <SectionHeader
              icon={<Edit2 className="w-4 h-4" />}
              title="Corrections"
              count={effectiveIntelligence.corrections.length}
              expanded={sections.corrections}
              onToggle={() => toggleSection("corrections")}
            />
            {sections.corrections && (
              <div className="pb-5">
                {effectiveIntelligence.corrections.length === 0 ? (
                  <div className="p-4 rounded-xl border border-dashed border-border bg-surface-2 text-center">
                    <p className="text-xs text-muted">
                      No corrections identified. The student may not have made
                      any clear errors in this transcript.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {effectiveIntelligence.corrections.map((corr, i) => (
                      <div
                        key={i}
                        className="rounded-xl border border-border bg-surface p-4 space-y-3"
                      >
                        {corr.category && (
                          <span className="inline-block rounded-md bg-surface-2 border border-border px-2 py-0.5 text-[10px] font-semibold text-muted uppercase tracking-wide">
                            {corr.category}
                          </span>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-2 items-center">
                          <div className="p-3 rounded-xl bg-red-50 border border-red-200 space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-red-500">
                              Original:
                            </span>
                            <p className="text-sm font-medium text-ink">
                              &ldquo;{corr.original}&rdquo;
                            </p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-muted mx-auto hidden md:block" />
                          <div className="p-3 rounded-xl bg-teal-light/20 border border-teal-mid/40 space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-teal">
                              Corrected:
                            </span>
                            <p className="text-sm font-medium text-ink">
                              &ldquo;{corr.corrected}&rdquo;
                            </p>
                          </div>
                        </div>
                        <div className="p-3 rounded-xl bg-surface-2 border border-border/80">
                          <p className="text-xs text-muted leading-relaxed">
                            <strong className="text-ink">Why: </strong>
                            {corr.explanation}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Strengths ────────────────────────────────────────────────── */}
          <div className="px-6">
            <SectionHeader
              icon={<Star className="w-4 h-4" />}
              title="Strengths"
              count={effectiveIntelligence.strengths.length}
              expanded={sections.strengths}
              onToggle={() => toggleSection("strengths")}
            />
            {sections.strengths && (
              <div className="pb-5">
                {effectiveIntelligence.strengths.length === 0 ? (
                  <p className="text-xs text-muted italic">
                    No strengths identified.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {effectiveIntelligence.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-teal shrink-0 mt-0.5" />
                        <span className="text-ink">{s}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* ── Areas for Improvement ────────────────────────────────────── */}
          <div className="px-6">
            <SectionHeader
              icon={<TrendingUp className="w-4 h-4" />}
              title="Areas for Improvement"
              count={effectiveIntelligence.areasForImprovement.length}
              expanded={sections.areasForImprovement}
              onToggle={() => toggleSection("areasForImprovement")}
            />
            {sections.areasForImprovement && (
              <div className="pb-5">
                {effectiveIntelligence.areasForImprovement.length === 0 ? (
                  <p className="text-xs text-muted italic">
                    No specific areas for improvement identified.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {effectiveIntelligence.areasForImprovement.map((a, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm">
                        <span className="w-4 h-4 rounded-full border-2 border-amber-400 shrink-0 mt-0.5" />
                        <span className="text-ink">{a}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* ── Suggested Practice ───────────────────────────────────────── */}
          <div className="px-6">
            <SectionHeader
              icon={<Dumbbell className="w-4 h-4" />}
              title="Suggested Practice"
              count={effectiveIntelligence.suggestedPractice.length}
              expanded={sections.suggestedPractice}
              onToggle={() => toggleSection("suggestedPractice")}
            />
            {sections.suggestedPractice && (
              <div className="pb-5">
                {effectiveIntelligence.suggestedPractice.length === 0 ? (
                  <p className="text-xs text-muted italic">
                    No practice exercises suggested.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {effectiveIntelligence.suggestedPractice.map(
                      (practice, i) => (
                        <div
                          key={i}
                          className="p-4 rounded-xl border border-border bg-surface-2 space-y-2"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-teal text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                              {i + 1}
                            </span>
                            <p className="font-semibold text-sm text-ink">
                              {practice.title}
                            </p>
                          </div>
                          <p className="text-xs text-muted leading-relaxed pl-7">
                            {practice.instruction}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Transcript Source ─────────────────────────────────────────── */}
          {analysis.sourceTranscript && (
            <div className="px-6">
              <SectionHeader
                icon={<Volume2 className="w-4 h-4" />}
                title="Source Transcript"
                expanded={sections.transcript}
                onToggle={() => toggleSection("transcript")}
              />
              {sections.transcript && (
                <div className="pb-5">
                  <pre className="text-xs text-muted whitespace-pre-wrap font-mono bg-surface-2 rounded-xl border border-border p-4 max-h-64 overflow-y-auto leading-relaxed">
                    {analysis.sourceTranscript}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Legacy items (grammar corrections + vocabulary from old analysis) */}
      {(analysis.corrections.length > 0 || analysis.vocabularyItems.length > 0) &&
        !intelligence && (
          <LegacyItemsPanel
            lessonId={lessonId}
            corrections={analysis.corrections}
            vocabularyItems={analysis.vocabularyItems}
          />
        )}
    </div>
  );
}

// ── Legacy items panel (for analyses without full payload) ───────────────────

function LegacyItemsPanel({
  lessonId,
  corrections,
  vocabularyItems,
}: {
  lessonId: string;
  corrections: GrammarCorrectionItem[];
  vocabularyItems: VocabularyCandidateItem[];
}) {
  const reviewMutation = useReviewItem();

  return (
    <div className="space-y-4">
      {corrections.length > 0 && (
        <div className="rounded-2xl border border-border bg-surface p-5 space-y-3">
          <h3 className="font-semibold text-sm text-ink flex items-center gap-2">
            <Edit2 className="w-4 h-4 text-teal" />
            Grammar Corrections
          </h3>
          {corrections.map((corr) => (
            <div
              key={corr.id}
              className="p-3 rounded-xl bg-surface-2 border border-border space-y-2"
            >
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded-lg bg-red-50 border border-red-200">
                  <p className="text-red-500 font-bold mb-1 uppercase text-[10px]">
                    Original
                  </p>
                  <p className="text-ink">{corr.original}</p>
                </div>
                <div className="p-2 rounded-lg bg-teal-light/20 border border-teal-mid/40">
                  <p className="text-teal font-bold mb-1 uppercase text-[10px]">
                    Corrected
                  </p>
                  <p className="text-ink">{corr.corrected}</p>
                </div>
              </div>
              <p className="text-xs text-muted">{corr.explanation}</p>
              {corr.status === "SUGGESTED" && (
                <div className="flex gap-2 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 text-xs text-coral border-coral/30"
                    onClick={() =>
                      reviewMutation.mutate({
                        lessonId,
                        itemType: "correction",
                        itemId: corr.id,
                        action: "DISMISS",
                      })
                    }
                  >
                    Dismiss
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    className="h-6 text-xs bg-teal hover:bg-teal-dark text-white"
                    onClick={() =>
                      reviewMutation.mutate({
                        lessonId,
                        itemType: "correction",
                        itemId: corr.id,
                        action: "ACCEPT",
                      })
                    }
                  >
                    Accept
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {vocabularyItems.length > 0 && (
        <div className="rounded-2xl border border-border bg-surface p-5 space-y-3">
          <h3 className="font-semibold text-sm text-ink flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-teal" />
            Vocabulary Items
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {vocabularyItems.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl bg-surface-2 border border-border space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <p className="font-bold text-sm text-ink">{item.word}</p>
                  <Badge
                    variant={
                      item.aiStatus === "ACCEPTED" ? "completed" : "cefr-a"
                    }
                  >
                    {item.aiStatus}
                  </Badge>
                </div>
                <p className="text-xs text-teal font-semibold">
                  {item.translation}
                </p>
                {item.exampleSentence && (
                  <p className="text-xs text-muted italic">
                    {item.exampleSentence}
                  </p>
                )}
                {item.aiStatus === "SUGGESTED" && (
                  <div className="flex gap-2 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 text-xs text-coral border-coral/30"
                      onClick={() =>
                        reviewMutation.mutate({
                          lessonId,
                          itemType: "vocabulary",
                          itemId: item.id,
                          action: "DISMISS",
                        })
                      }
                    >
                      Dismiss
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      className="h-6 text-xs bg-teal hover:bg-teal-dark text-white"
                      onClick={() =>
                        reviewMutation.mutate({
                          lessonId,
                          itemType: "vocabulary",
                          itemId: item.id,
                          action: "ACCEPT",
                        })
                      }
                    >
                      Add to Bank
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
