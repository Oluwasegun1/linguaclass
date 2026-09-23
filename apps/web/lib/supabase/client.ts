import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase client for use in Client Components ("use client").
 * Call this inside a component or hook — do NOT call at module level,
 * as it must run in the browser where cookies are available.
 *
 * Usage:
 *   const supabase = createClient()
 *   const { data } = await supabase.from('profiles').select()
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
