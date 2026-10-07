/**
 * LinguaClass — Gemini API Client (Server-Only)
 *
 * Initializes a single @google/genai client for server-side use.
 * This module MUST NEVER be imported by client components.
 *
 * Uses the GEMINI_API_KEY environment variable — never NEXT_PUBLIC_GEMINI_API_KEY.
 */

import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey && process.env.NODE_ENV !== "test") {
  // Warn at startup so missing key is caught early.
  // We don't throw here because Prisma/app startup should still work without it.
  console.warn(
    "[AI] GEMINI_API_KEY is not set. Lesson Intelligence will not function."
  );
}

/**
 * Singleton Gemini client.
 * Initialised lazily with a guard so app boot doesn't fail when the key is absent.
 */
let _client: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  if (!apiKey) {
    throw new Error(
      "AI service is not configured. Please set the GEMINI_API_KEY environment variable."
    );
  }
  if (!_client) {
    _client = new GoogleGenAI({ apiKey });
  }
  return _client;
}

/**
 * The model to use for lesson analysis.
 * Choose a model available under your API key's quota.
 */
export const GEMINI_MODEL = "gemini-2.0-flash";
