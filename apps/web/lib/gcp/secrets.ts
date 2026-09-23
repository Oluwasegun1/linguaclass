/**
 * Google Secret Manager Configuration Helper
 *
 * In Google Cloud Run, secrets stored in Secret Manager can be injected directly
 * as environment variables or mounted as files at runtime without requiring SDK calls.
 *
 * This module provides environment verification and documentation helpers for
 * managing production and staging secrets securely.
 */

export interface RequiredSecrets {
  DATABASE_URL: string;
  DIRECT_URL?: string;
  SUPABASE_SECRET_KEY: string;
  LIVEKIT_API_SECRET?: string;
}

export function validateRequiredSecrets(): { valid: boolean; missing: string[] } {
  const required = [
    "DATABASE_URL",
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    "SUPABASE_SECRET_KEY",
  ];

  const missing = required.filter((key) => !process.env[key]);

  return {
    valid: missing.length === 0,
    missing,
  };
}
