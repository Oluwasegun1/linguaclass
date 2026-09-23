import {
  createServerClient,
  parseCookieHeader,
} from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Supabase client for Server Components, Server Actions, and Route Handlers.
 *
 * - Uses SUPABASE_URL / SUPABASE_PUBLISHABLE_KEY (server-only, NOT prefixed
 *   with NEXT_PUBLIC_ — these vars are never shipped to the browser).
 * - Reads/writes the auth session via Next.js `cookies()`.
 * - Respects Row Level Security (RLS) — the signed-in user's permissions apply.
 *
 * Usage in a Server Component:
 *   const supabase = await createClient()
 *   const { data: { user } } = await supabase.auth.getUser()
 *
 * Usage in a Server Action:
 *   'use server'
 *   const supabase = await createClient()
 *   const { error } = await supabase.auth.signInWithPassword({ email, password })
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return parseCookieHeader(
            cookieStore
              .getAll()
              .map(({ name, value }) => `${name}=${value}`)
              .join("; "),
          );
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Swallowed when called from a Server Component —
            // middleware handles the actual cookie write.
          }
        },
      },
    },
  );
}
