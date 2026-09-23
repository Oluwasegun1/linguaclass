"use client";

import * as React from "react";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Input, Textarea } from "@workspace/ui/components/form-elements";
import {
  useReviewItem,
  useTriggerLessonAnalysis,
  type LessonAnalysisData,
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
  Layers,
  ArrowRight,
} from "lucide-react";

interface AIReviewPanelProps {
  lessonId: string;
  data: LessonAnalysisData;
}

export function AIReviewPanel({ lessonId, data }: AIReviewPanelProps) {
  const [activeTab, setActiveTab] = React.useState<"corrections" | "vocabulary" | "transcript">("corrections");
  const [editingCorrectionId, setEditingCorrectionId] = React.useState<string | null>(null);
  const [teacherNoteInput, setTeacherNoteInput] = React.useState<string>("");

  const [editingVocabId, setEditingVocabId] = React.useState<string | null>(null);
  const [vocabTranslationInput, setVocabTranslationInput] = React.useState<string>("");
  const [vocabExampleInput, setVocabExampleInput] = React.useState<string>("");

  const reviewMutation = useReviewItem();
  const triggerAnalysisMutation = useTriggerLessonAnalysis();

  const analysis = data.analysis;
  const corrections = analysis?.corrections || [];
  const vocabularyItems = analysis?.vocabularyItems || [];
  const segments = data.transcript?.segments || [];

  const handleAcceptCorrection = async (id: string, note?: string) => {
    await reviewMutation.mutateAsync({
      lessonId,
      itemType: "correction",
      itemId: id,
      action: note ? "EDIT" : "ACCEPT",
      teacherNote: note,
    });
    setEditingCorrectionId(null);
  };

  const handleDismissCorrection = async (id: string) => {
    await reviewMutation.mutateAsync({
      lessonId,
      itemType: "correction",
      itemId: id,
      action: "DISMISS",
    });
    setEditingCorrectionId(null);
  };

  const handleAcceptVocab = async (id: string, translation?: string, exampleSentence?: string) => {
    await reviewMutation.mutateAsync({
      lessonId,
      itemType: "vocabulary",
      itemId: id,
      action: translation || exampleSentence ? "EDIT" : "ACCEPT",
      translation,
      exampleSentence,
    });
    setEditingVocabId(null);
  };

  const handleDismissVocab = async (id: string) => {
    await reviewMutation.mutateAsync({
      lessonId,
      itemType: "vocabulary",
      itemId: id,
      action: "DISMISS",
    });
    setEditingVocabId(null);
  };

  const handleAcceptAll = async () => {
    if (window.confirm("Accept all AI suggested grammar corrections and vocabulary items into the student's learning profile?")) {
      await reviewMutation.mutateAsync({
        lessonId,
        action: "ACCEPT_ALL",
      });
    }
  };

  const handleReanalyze = async () => {
    await triggerAnalysisMutation.mutateAsync(lessonId);
  };

  if (!analysis) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-surface p-12 text-center space-y-4">
        <div className="size-12 rounded-2xl bg-teal-light text-teal flex items-center justify-center mx-auto">
          <Sparkles className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-display text-xl font-bold text-ink">
            No AI Analysis Generated Yet
          </h3>
          <p className="text-sm text-muted mt-1 max-w-md mx-auto leading-relaxed">
            Run the Google Cloud Vertex AI intelligence engine on this lesson's dialogue to automatically extract grammar corrections and vocabulary.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={handleReanalyze}
          disabled={triggerAnalysisMutation.isPending}
          className="inline-flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>{triggerAnalysisMutation.isPending ? "Analyzing with Gemini..." : "Generate AI Analysis"}</span>
        </Button>
      </div>
    );
  }

  const pendingCorrections = corrections.filter((c) => c.status === "SUGGESTED").length;
  const pendingVocab = vocabularyItems.filter((v) => v.aiStatus === "SUGGESTED").length;

  return (
    <div className="space-y-6">
      {/* 1. Summary Header Card */}
      <div className="rounded-2xl border border-border bg-surface p-6 sm:p-7 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-full bg-teal-light border border-teal-mid/40 px-2.5 py-0.5 text-xs font-semibold text-teal">
                <Sparkles className="w-3.5 h-3.5" />
                Vertex AI • {analysis.modelVersion}
              </span>
              <span className="text-xs text-muted">
                Analyzed on {new Date(analysis.processedAt).toLocaleDateString()}
              </span>
            </div>

            <h2 className="font-display text-xl font-bold text-ink">
              Lesson Intelligence Overview
            </h2>

            <p className="text-sm text-muted leading-relaxed max-w-3xl">
              {analysis.summaryText || "Comprehensive conversation analysis and pedagogical feedback."}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReanalyze}
              disabled={triggerAnalysisMutation.isPending}
              className="flex items-center gap-1.5 text-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${triggerAnalysisMutation.isPending ? "animate-spin" : ""}`} />
              <span>Re-Analyze</span>
            </Button>

            {(pendingCorrections > 0 || pendingVocab > 0) && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleAcceptAll}
                disabled={reviewMutation.isPending}
                className="flex items-center gap-1.5 text-xs bg-teal hover:bg-teal-dark shadow-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Accept All ({pendingCorrections + pendingVocab})</span>
              </Button>
            )}
          </div>
        </div>

        {/* Topics Covered */}
        {analysis.topicsCovered && analysis.topicsCovered.length > 0 && (
          <div className="pt-3 border-t border-border flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-muted mr-1">Topics:</span>
            {analysis.topicsCovered.map((topic, idx) => (
              <Badge key={idx} variant="cefr-b">
                {topic}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* 2. Review Tabs */}
      <div className="flex items-center gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab("corrections")}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "corrections"
              ? "border-teal text-teal"
              : "border-transparent text-muted hover:text-ink"
          }`}
        >
          <AlertCircle className="w-4 h-4" />
          <span>Grammar Corrections</span>
          <span className="rounded-full bg-surface-2 px-2 py-0.2 text-xs font-bold">
            {corrections.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("vocabulary")}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "vocabulary"
              ? "border-teal text-teal"
              : "border-transparent text-muted hover:text-ink"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Target Vocabulary</span>
          <span className="rounded-full bg-surface-2 px-2 py-0.2 text-xs font-bold">
            {vocabularyItems.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("transcript")}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "transcript"
              ? "border-teal text-teal"
              : "border-transparent text-muted hover:text-ink"
          }`}
        >
          <Volume2 className="w-4 h-4" />
          <span>Transcript Source</span>
          <span className="rounded-full bg-surface-2 px-2 py-0.2 text-xs font-bold">
            {segments.length}
          </span>
        </button>
      </div>

      {/* 3. Tab Content */}
      {/* Grammar Corrections */}
      {activeTab === "corrections" && (
        <div className="space-y-4">
          {corrections.length === 0 ? (
            <div className="p-8 rounded-2xl border border-dashed border-border bg-surface text-center text-sm text-muted">
              No grammatical errors detected during this session.
            </div>
          ) : (
            corrections.map((corr) => {
              const isEditing = editingCorrectionId === corr.id;
              const isSuggested = corr.status === "SUGGESTED";
              const isAccepted = corr.status === "ACCEPTED" || corr.status === "EDITED";

              return (
                <div
                  key={corr.id}
                  className={`rounded-2xl border p-5 transition-all bg-surface ${
                    isAccepted
                      ? "border-teal/50 shadow-xs"
                      : corr.status === "DISMISSED"
                      ? "border-border opacity-60"
                      : "border-border shadow-xs hover:border-teal/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          isAccepted
                            ? "completed"
                            : corr.status === "DISMISSED"
                            ? "error"
                            : "cefr-b"
                        }
                      >
                        {corr.status}
                      </Badge>
                      <span className="text-xs text-muted">
                        Student Spoken Utterance
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isSuggested && !isEditing && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingCorrectionId(corr.id);
                              setTeacherNoteInput(corr.teacherNote || "");
                            }}
                            className="h-7 px-2.5 text-xs"
                          >
                            <Edit2 className="w-3.5 h-3.5 mr-1" />
                            Note
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDismissCorrection(corr.id)}
                            className="h-7 px-2.5 text-xs text-coral hover:bg-coral-light/20 border-coral/30"
                          >
                            <X className="w-3.5 h-3.5 mr-1" />
                            Dismiss
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleAcceptCorrection(corr.id)}
                            className="h-7 px-2.5 text-xs bg-teal hover:bg-teal-dark text-white font-semibold"
                          >
                            <Check className="w-3.5 h-3.5 mr-1" />
                            Accept
                          </Button>
                        </>
                      )}

                      {!isSuggested && (
                        <span className="text-xs font-semibold text-muted">
                          {isAccepted ? "Published to student" : "Dismissed"}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Utterance Comparison Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3 text-sm">
                    <div className="p-3 rounded-xl bg-coral-light/15 border border-coral/30 space-y-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-coral">
                        Spoken Error:
                      </span>
                      <p className="font-medium text-ink">"{corr.original}"</p>
                    </div>

                    <div className="p-3 rounded-xl bg-teal-light/20 border border-teal-mid/40 space-y-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-teal">
                        AI Recommended Correction:
                      </span>
                      <p className="font-medium text-ink">"{corr.corrected}"</p>
                    </div>
                  </div>

                  {/* Pedagogical Explanation */}
                  <p className="text-xs text-muted leading-relaxed bg-surface-2 p-3 rounded-xl border border-border/80">
                    <strong className="text-ink">Explanation:</strong> {corr.explanation}
                  </p>

                  {/* Teacher Note Input / Display */}
                  {isEditing ? (
                    <div className="mt-3 pt-3 border-t border-border space-y-2">
                      <span className="text-xs font-semibold text-ink">
                        Add Custom Teacher Guidance:
                      </span>
                      <Input
                        value={teacherNoteInput}
                        onChange={(e) => setTeacherNoteInput(e.target.value)}
                        placeholder="e.g., Remember: subjunctive stem for faire is fass- (je fasse, nous fassions)"
                        className="text-xs"
                      />
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingCorrectionId(null)}
                          className="h-7 text-xs"
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleAcceptCorrection(corr.id, teacherNoteInput)}
                          className="h-7 text-xs"
                        >
                          Save & Accept
                        </Button>
                      </div>
                    </div>
                  ) : corr.teacherNote ? (
                    <div className="mt-2.5 p-2.5 rounded-lg bg-amber-light/20 border border-amber/30 text-xs text-ink">
                      <strong className="text-amber-dark">Teacher Note:</strong> {corr.teacherNote}
                    </div>
                  ) : null}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Target Vocabulary */}
      {activeTab === "vocabulary" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vocabularyItems.length === 0 ? (
            <div className="col-span-2 p-8 rounded-2xl border border-dashed border-border bg-surface text-center text-sm text-muted">
              No new vocabulary candidates identified.
            </div>
          ) : (
            vocabularyItems.map((item) => {
              const isSuggested = item.aiStatus === "SUGGESTED";
              const isAccepted = item.aiStatus === "ACCEPTED" || item.aiStatus === "EDITED";
              const isEditing = editingVocabId === item.id;

              return (
                <div
                  key={item.id}
                  className={`rounded-2xl border p-5 bg-surface transition-all flex flex-col justify-between space-y-3 ${
                    isAccepted
                      ? "border-teal/50 shadow-xs"
                      : item.aiStatus === "DISMISSED"
                      ? "border-border opacity-60"
                      : "border-border shadow-xs hover:border-teal/40"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-surface-2 text-ink uppercase">
                        {item.language}
                      </span>
                      <Badge
                        variant={
                          isAccepted
                            ? "completed"
                            : item.aiStatus === "DISMISSED"
                            ? "error"
                            : "cefr-a"
                        }
                      >
                        {item.aiStatus}
                      </Badge>
                    </div>

                    <h4 className="font-display text-lg font-bold text-ink">
                      {item.word}
                    </h4>

                    {isEditing ? (
                      <div className="space-y-2 pt-1">
                        <Input
                          value={vocabTranslationInput}
                          onChange={(e) => setVocabTranslationInput(e.target.value)}
                          placeholder="Translation / definition"
                          className="text-xs"
                        />
                        <Input
                          value={vocabExampleInput}
                          onChange={(e) => setVocabExampleInput(e.target.value)}
                          placeholder="Example sentence"
                          className="text-xs"
                        />
                      </div>
                    ) : (
                      <>
                        <p className="text-sm font-semibold text-teal">
                          {item.translation}
                        </p>

                        {item.exampleSentence && (
                          <p className="text-xs text-muted italic bg-surface-2 p-2.5 rounded-lg border border-border/80">
                            "{item.exampleSentence}"
                          </p>
                        )}
                      </>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-border flex items-center justify-between">
                    {isSuggested && !isEditing ? (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingVocabId(item.id);
                            setVocabTranslationInput(item.translation);
                            setVocabExampleInput(item.exampleSentence || "");
                          }}
                          className="h-7 text-xs text-muted hover:text-ink px-2"
                        >
                          <Edit2 className="w-3.5 h-3.5 mr-1" />
                          Edit
                        </Button>

                        <div className="flex items-center gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDismissVocab(item.id)}
                            className="h-7 px-2 text-xs text-coral hover:bg-coral-light/20 border-coral/30"
                          >
                            Dismiss
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleAcceptVocab(item.id)}
                            className="h-7 px-2.5 text-xs bg-teal hover:bg-teal-dark font-semibold text-white"
                          >
                            <Check className="w-3.5 h-3.5 mr-1" />
                            Add to Bank
                          </Button>
                        </div>
                      </>
                    ) : isEditing ? (
                      <div className="flex items-center justify-end gap-2 w-full">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingVocabId(null)}
                          className="h-7 text-xs"
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleAcceptVocab(item.id, vocabTranslationInput, vocabExampleInput)}
                          className="h-7 text-xs"
                        >
                          Save & Add
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs font-semibold text-teal">
                        {isAccepted ? "✓ Added to Student Flashcards" : "Dismissed"}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Transcript Source */}
      {activeTab === "transcript" && (
        <div className="rounded-2xl border border-border bg-surface p-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-muted pb-2 border-b border-border">
            <span>Recorded Dialogue Segments</span>
            <span>{segments.length} utterance(s)</span>
          </div>

          <div className="divide-y divide-border/60">
            {segments.map((seg) => (
              <div key={seg.id} className="py-3 text-xs leading-relaxed space-y-1">
                <span
                  className={`inline-block font-bold text-[11px] uppercase tracking-wider ${
                    seg.speakerRole === "TEACHER" ? "text-teal" : "text-amber-dark"
                  }`}
                >
                  {seg.speakerRole}:
                </span>
                <p className="text-ink">{seg.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
