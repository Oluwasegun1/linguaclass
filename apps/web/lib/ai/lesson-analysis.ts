/**
 * LinguaClass — Lesson Analysis Service (Server-Only)
 *
 * Implements LessonAnalysisProvider using Gemini via @google/genai.
 * This module must never be imported from client components.
 *
 * Design principle: AI proposes. The teacher decides.
 * This service returns a validated LessonIntelligence object — it does NOT
 * write to the database. The API route is responsible for persistence.
 */

import { getGeminiClient, GEMINI_MODEL } from "./gemini";
import { buildSystemInstruction, buildAnalysisPrompt } from "./prompts";
import { LessonIntelligenceSchema, type LessonIntelligence, type AnalysisRequest } from "./schemas";

// ── Provider interface — keeps the app decoupled from Gemini ─────────────────

/**
 * Implement this interface to plug in a different AI provider (e.g. Claude, GPT-4).
 */
export interface LessonAnalysisProvider {
  generateLessonAnalysis(
    input: AnalysisRequest
  ): Promise<LessonIntelligence>;
  readonly modelId: string;
}

// ── Gemini provider ───────────────────────────────────────────────────────────

class GeminiLessonAnalysisProvider implements LessonAnalysisProvider {
  readonly modelId = GEMINI_MODEL;

  async generateLessonAnalysis(input: AnalysisRequest): Promise<LessonIntelligence> {
    const client = getGeminiClient(); // throws if API key missing
    const startTime = Date.now();

    console.log(
      `[AI] Generating lesson analysis — model: ${this.modelId}, transcript length: ${input.transcript.length} chars`
    );

    let rawText: string;

    try {
      const response = await client.models.generateContent({
        model: this.modelId,
        contents: [
          {
            role: "user",
            parts: [{ text: buildAnalysisPrompt(input) }],
          },
        ],
        config: {
          systemInstruction: buildSystemInstruction(),
          // Request JSON mime type so Gemini is less likely to wrap in markdown
          responseMimeType: "application/json",
          temperature: 0.2,
          topP: 0.8,
        },
      });

      const durationMs = Date.now() - startTime;

      // Log usage if available
      const usage = response.usageMetadata;
      console.log(
        `[AI] Gemini responded in ${durationMs}ms — ` +
          `input tokens: ${usage?.promptTokenCount ?? "unknown"}, ` +
          `output tokens: ${usage?.candidatesTokenCount ?? "unknown"}`
      );

      rawText = response.text ?? "";
    } catch (geminiError) {
      const durationMs = Date.now() - startTime;
      console.error(
        `[AI] Gemini request failed after ${durationMs}ms:`,
        geminiError
      );
      throw new Error("We couldn't analyze this lesson right now. Please try again.");
    }

    if (!rawText || rawText.trim().length === 0) {
      throw new Error("The AI returned an empty lesson analysis. Please try again.");
    }

    // Strip markdown code fences if Gemini added them despite responseMimeType
    const cleaned = rawText
      .trim()
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```\s*$/, "");

    let parsed: unknown;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      console.error("[AI] Gemini response was not valid JSON:", cleaned.slice(0, 500));
      throw new Error("The AI returned an invalid lesson analysis. Please try again.");
    }

    // Validate against the canonical schema
    const validation = LessonIntelligenceSchema.safeParse(parsed);
    if (!validation.success) {
      console.error(
        "[AI] Gemini response failed schema validation:",
        validation.error.flatten()
      );
      throw new Error("The AI returned an invalid lesson analysis. Please try again.");
    }

    return validation.data;
  }
}

// ── Singleton provider ────────────────────────────────────────────────────────

let _provider: LessonAnalysisProvider | null = null;

/**
 * Returns the active LessonAnalysisProvider.
 * Swap this to change AI providers without touching any API route.
 */
export function getLessonAnalysisProvider(): LessonAnalysisProvider {
  if (!_provider) {
    _provider = new GeminiLessonAnalysisProvider();
  }
  return _provider;
}

// Re-export types for convenience
export type { LessonIntelligence, AnalysisRequest };
