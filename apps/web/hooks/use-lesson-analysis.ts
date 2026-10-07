"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// ── LessonIntelligence types (mirroring server-side Zod schema) ──────────────

export interface TopicItem {
  title: string;
  description?: string;
}

export interface VocabularyEntry {
  word: string;
  meaning: string;
  context?: string;
  example?: string;
  partOfSpeech?: string;
}

export interface GrammarConceptItem {
  concept: string;
  explanation: string;
  example?: string;
}

export interface CorrectionItem {
  original: string;
  corrected: string;
  explanation: string;
  category?: string;
}

export interface SuggestedPracticeItem {
  title: string;
  instruction: string;
}

export interface LessonIntelligencePayload {
  summary: string;
  topics: TopicItem[];
  vocabulary: VocabularyEntry[];
  grammar: GrammarConceptItem[];
  corrections: CorrectionItem[];
  strengths: string[];
  areasForImprovement: string[];
  suggestedPractice: SuggestedPracticeItem[];
}

// ── Legacy item types (from GrammarCorrection / VocabularyItem DB models) ────

export interface GrammarCorrectionItem {
  id: string;
  aiAnalysisId: string;
  studentId: string;
  original: string;
  corrected: string;
  explanation: string;
  status: "SUGGESTED" | "ACCEPTED" | "EDITED" | "DISMISSED";
  teacherNote: string | null;
  reviewedAt: string | null;
  createdAt: string;
}

export interface VocabularyCandidateItem {
  id: string;
  studentProfileId: string;
  aiAnalysisId: string | null;
  word: string;
  translation: string;
  exampleSentence: string | null;
  language: string;
  status: "NEW" | "LEARNING" | "LEARNED";
  aiStatus: "SUGGESTED" | "ACCEPTED" | "EDITED" | "DISMISSED";
  isFavourited: boolean;
  reviewedAt: string | null;
  createdAt: string;
}

// ── API response type ─────────────────────────────────────────────────────────

export interface LessonAnalysisData {
  lesson: {
    id: string;
    title: string;
    scheduledAt: string;
    durationMins: number;
    timezone: string;
    status: string;
    objectives: string | null;
    course: {
      id: string;
      title: string;
      language: string;
      level: string;
      enrollments: Array<{
        student: {
          user: {
            id: string;
            name: string;
            email: string;
          };
        };
      }>;
    };
  };
  analysis: {
    id: string;
    sessionId: string;
    analysisStatus: "SUGGESTED" | "ACCEPTED" | "EDITED" | "DISMISSED";
    model: string;
    modelVersion: string;
    sourceTranscript: string | null;
    summaryText: string | null;
    topicsCovered: string[];
    payload: LessonIntelligencePayload | null;
    processedAt: string;
    createdAt: string;
    reviewedAt: string | null;
    corrections: GrammarCorrectionItem[];
    vocabularyItems: VocabularyCandidateItem[];
  } | null;
  transcript: {
    id: string;
    language: string;
    status: string;
    segments: Array<{
      id: string;
      speakerId: string;
      speakerRole: string;
      text: string;
    }>;
  } | null;
}

// ── Queries & Mutations ───────────────────────────────────────────────────────

export function useLessonAnalysis(lessonId: string) {
  return useQuery<LessonAnalysisData>({
    queryKey: ["lesson-analysis", lessonId],
    queryFn: async () => {
      const res = await fetch(`/api/lessons/${lessonId}/analyze`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to fetch lesson analysis");
      }
      return res.json();
    },
    enabled: !!lessonId,
  });
}

export interface TriggerAnalysisOptions {
  lessonId: string;
  transcript?: string;
  language?: string;
  studentLevel?: string;
  objectives?: string[];
}

export function useTriggerLessonAnalysis() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (options: TriggerAnalysisOptions) => {
      const { lessonId, ...body } = options;
      const res = await fetch(`/api/lessons/${lessonId}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(
          typeof data.error === "string"
            ? data.error
            : "Failed to analyze lesson"
        );
      }
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["lesson-analysis", variables.lessonId],
      });
      queryClient.invalidateQueries({
        queryKey: ["lessons", variables.lessonId],
      });
    },
  });
}

export function useReviewItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      lessonId,
      ...payload
    }: {
      lessonId: string;
      itemType?: "correction" | "vocabulary";
      itemId?: string;
      action: "ACCEPT" | "EDIT" | "DISMISS" | "ACCEPT_ALL";
      teacherNote?: string;
      translation?: string;
      exampleSentence?: string;
    }) => {
      const res = await fetch(`/api/lessons/${lessonId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to process review");
      }
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["lesson-analysis", variables.lessonId],
      });
    },
  });
}

/**
 * Updates the full AI analysis payload after teacher review.
 * Calls PATCH /api/lessons/[id]/analyze with the updated payload and status.
 */
export function useSaveAnalysisReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      lessonId,
      analysisId,
      status,
      payload,
    }: {
      lessonId: string;
      analysisId: string;
      status: "ACCEPTED" | "EDITED" | "DISMISSED";
      payload?: LessonIntelligencePayload;
    }) => {
      const res = await fetch(`/api/lessons/${lessonId}/analyze/${analysisId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, payload }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save review");
      }
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["lesson-analysis", variables.lessonId],
      });
    },
  });
}
