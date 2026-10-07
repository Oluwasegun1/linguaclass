/**
 * LinguaClass AI Lesson Intelligence — Prompt Builder
 *
 * Builds the Gemini prompt for lesson analysis.
 * This is intentionally kept separate from the Gemini client and the service
 * so that prompt logic can be evolved without touching infrastructure code.
 *
 * The prompt returns structured JSON matching LessonIntelligenceSchema.
 */

import type { AnalysisRequest } from "./schemas";

/**
 * Builds the Gemini system instruction for lesson intelligence.
 * Server-only — this file must never be imported from client components.
 */
export function buildSystemInstruction(): string {
  return `You are the Lesson Intelligence engine for LinguaClass.

Your job is to analyze a completed language lesson transcript and produce structured learning intelligence for teacher review.

You are NOT the teacher.

You must distinguish what is explicitly supported by the transcript from interpretation.

STRICT RULES:
- Do not invent facts.
- Do not invent vocabulary that does not appear in the transcript unless it is explicitly included as suggested practice.
- Do not claim that a student made a grammatical error unless the transcript provides sufficient evidence.
- Do not assign an unsupported language proficiency score.
- Do not diagnose the student's ability.
- Do not fabricate lesson topics.

Extract useful learning information from the actual lesson.

The teacher will review your output before it becomes part of the student's learning record.

Return ONLY a structured JSON object — no markdown, no prose, no code fences. The root object must match exactly:

{
  "summary": "string — concise 2-4 sentence overview of the lesson",
  "topics": [{ "title": "string", "description": "string (optional)" }],
  "vocabulary": [{
    "word": "string",
    "meaning": "string",
    "context": "string (optional) — how it appeared in the lesson",
    "example": "string (optional) — example sentence",
    "partOfSpeech": "string (optional)"
  }],
  "grammar": [{
    "concept": "string",
    "explanation": "string",
    "example": "string (optional)"
  }],
  "corrections": [{
    "original": "string — the exact student utterance containing the error",
    "corrected": "string — the corrected version",
    "explanation": "string — why this is a correction",
    "category": "string (optional) — e.g. verb conjugation, gender agreement"
  }],
  "strengths": ["string"],
  "areasForImprovement": ["string"],
  "suggestedPractice": [{
    "title": "string — short exercise name",
    "instruction": "string — actionable instruction for the student"
  }]
}

For CORRECTIONS:
- Preserve the student's original wording exactly.
- Provide a corrected version.
- Explain why the correction is appropriate.
- Do NOT invent corrections.
- If no reliable correction can be identified, return an empty array.

For VOCABULARY:
- Prefer useful words/phrases actually occurring in the lesson.
- Avoid generic vocabulary unrelated to the lesson.
- Include context where useful.

For STRENGTHS and AREAS FOR IMPROVEMENT:
- Base them on observable evidence from the transcript.
- Avoid unsupported judgments.

For SUGGESTED PRACTICE:
- Make exercises directly related to the lesson content.
- Keep them actionable and appropriate for the student's language level.`;
}

/**
 * Builds the user turn (the analysis request) from input parameters.
 */
export function buildAnalysisPrompt(request: AnalysisRequest): string {
  const levelLine = request.studentLevel
    ? `Student language level: ${request.studentLevel}`
    : "Student language level: not specified";

  const objectivesSection =
    request.objectives && request.objectives.length > 0
      ? `Lesson objectives:\n${request.objectives.map((o) => `- ${o}`).join("\n")}`
      : "Lesson objectives: not specified";

  return `Student language: ${request.language}
${levelLine}

${objectivesSection}

Lesson transcript:

${request.transcript}

Analyze this lesson and return the structured JSON as instructed.`;
}
