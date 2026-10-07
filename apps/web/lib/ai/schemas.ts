/**
 * LinguaClass AI Lesson Intelligence — Zod Schemas
 *
 * This file defines the canonical schema for all AI-generated lesson analysis data.
 * Every Gemini response MUST pass these schemas before it is stored or shown to teachers.
 *
 * Design principle: AI proposes. The teacher decides.
 * Nothing here becomes authoritative learning data until a teacher accepts it.
 */

import { z } from "zod";

// ── Individual section schemas ────────────────────────────────────────────────

export const TopicSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
});

export const VocabularyItemSchema = z.object({
  word: z.string().min(1),
  meaning: z.string().min(1),
  context: z.string().optional(),
  example: z.string().optional(),
  partOfSpeech: z.string().optional(),
});

export const GrammarConceptSchema = z.object({
  concept: z.string().min(1),
  explanation: z.string().min(1),
  example: z.string().optional(),
});

export const CorrectionSchema = z.object({
  original: z.string().min(1),
  corrected: z.string().min(1),
  explanation: z.string().min(1),
  category: z.string().optional(),
});

export const SuggestedPracticeSchema = z.object({
  title: z.string().min(1),
  instruction: z.string().min(1),
});

// ── Top-level LessonIntelligence schema ──────────────────────────────────────

export const LessonIntelligenceSchema = z.object({
  summary: z.string().min(1, "AI must provide a lesson summary"),
  topics: z.array(TopicSchema),
  vocabulary: z.array(VocabularyItemSchema),
  grammar: z.array(GrammarConceptSchema),
  corrections: z.array(CorrectionSchema),
  strengths: z.array(z.string()),
  areasForImprovement: z.array(z.string()),
  suggestedPractice: z.array(SuggestedPracticeSchema),
});

// ── Derived TypeScript types ──────────────────────────────────────────────────

export type Topic = z.infer<typeof TopicSchema>;
export type VocabularyEntry = z.infer<typeof VocabularyItemSchema>;
export type GrammarConcept = z.infer<typeof GrammarConceptSchema>;
export type Correction = z.infer<typeof CorrectionSchema>;
export type SuggestedPractice = z.infer<typeof SuggestedPracticeSchema>;
export type LessonIntelligence = z.infer<typeof LessonIntelligenceSchema>;

// ── Input schema for analysis requests (validated at API layer) ───────────────

export const AnalysisRequestSchema = z.object({
  transcript: z
    .string()
    .min(10, "Transcript is too short to analyze")
    .max(100_000, "Transcript exceeds the maximum allowed length"),
  language: z.string().min(1, "Language is required"),
  studentLevel: z.string().optional(),
  objectives: z.array(z.string()).optional(),
});

export type AnalysisRequest = z.infer<typeof AnalysisRequestSchema>;
