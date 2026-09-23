import { createClient } from "@supabase/supabase-js";

/**
 * Supabase ADMIN client — uses the secret key to bypass Row Level Security.
 *
 * ⚠️  ONLY use this in Server Actions, Route Handlers, or server-side scripts.
 *     NEVER import this in Client Components or expose it to the browser.
 *     NEVER use this for user-facing reads/writes that should respect RLS.
 *
 * Appropriate uses:
 *   - Sending transactional emails via Edge Functions
 *   - Creating users programmatically (admin signup flows)
 *   - Background jobs / cron tasks that need superuser DB access
 *   - Validating JWTs using SUPABASE_JWKS_URL
 */
export function createAdminClient() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}

/** The JWKS endpoint for verifying Supabase-issued JWTs server-side */
export const SUPABASE_JWKS_URL = process.env.SUPABASE_JWKS_URL!;
