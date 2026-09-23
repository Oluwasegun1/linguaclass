"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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

export interface LessonAnalysisData {
  lesson: {
    id: string;
    title: string;
    scheduledAt: string;
    durationMins: number;
    timezone: string;
    status: string;
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
    summaryText: string | null;
    topicsCovered: string[];
    modelVersion: string;
    processedAt: string;
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

export function useTriggerLessonAnalysis() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (lessonId: string) => {
      const res = await fetch(`/api/lessons/${lessonId}/analyze`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to analyze lesson");
      }
      return res.json();
    },
    onSuccess: (_, lessonId) => {
      queryClient.invalidateQueries({ queryKey: ["lesson-analysis", lessonId] });
      queryClient.invalidateQueries({ queryKey: ["lessons", lessonId] });
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
      queryClient.invalidateQueries({ queryKey: ["lesson-analysis", variables.lessonId] });
    },
  });
}
