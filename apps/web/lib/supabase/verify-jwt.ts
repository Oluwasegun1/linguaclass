import {
  createLocalJWKSet,
  createRemoteJWKSet,
  jwtVerify,
  type JSONWebKeySet,
  type JWTPayload,
} from "jose";

// ---------------------------------------------------------------------------
// The Supabase project's JWKS public key (ES256 / P-256).
// Embedded here so JWT verification can run fully offline — no network call
// to the Supabase Auth server needed on every request.
//
// Kid: ce49219a-5caa-4f7d-a94f-541faa1de161
// Rotate this object if you roll the signing key in your Supabase project.
// ---------------------------------------------------------------------------
const EMBEDDED_JWKS: JSONWebKeySet = {
  keys: [
    {
      x: "N91YRE902YZc2sSOVNJzL9S4BhMADkxcSKynaPxY_MM",
      y: "Sr0pES6sMMOyCvbLcAg_rmaPYhUIcKJJZ4cJLbtHYFc",
      alg: "ES256",
      crv: "P-256",
      ext: true,
      kid: "ce49219a-5caa-4f7d-a94f-541faa1de161",
      kty: "EC",
      key_ops: ["verify"],
    },
  ],
};

/**
 * Local JWKS key set built from the embedded public key.
 * Used as the primary verifier — zero latency, no network dependency.
 */
const localJWKS = createLocalJWKSet(EMBEDDED_JWKS);

/**
 * Remote JWKS key set fetched from the Supabase Auth JWKS endpoint.
 * Used as a fallback if the embedded key doesn't match (e.g., after a key rotation).
 * `jose` caches the remote JWKS and only re-fetches when a key ID is unknown.
 */
const remoteJWKS = createRemoteJWKSet(
  new URL(process.env.SUPABASE_JWKS_URL!),
  {
    cooldownDuration: 30_000, // 30-second cooldown between re-fetches
    timeoutDuration: 5_000,   // 5-second fetch timeout
  },
);

// ---------------------------------------------------------------------------
// Supabase JWT payload shape
// ---------------------------------------------------------------------------

export interface SupabaseJWTPayload extends JWTPayload {
  /** Supabase user UUID */
  sub: string;
  /** User's email address */
  email?: string;
  /** User's phone number */
  phone?: string;
  /** Authentication method used (e.g., "email", "google", "otp") */
  amr?: Array<{ method: string; timestamp: number }>;
  /** App metadata — user role, permissions set by your application */
  app_metadata?: {
    provider?: string;
    providers?: string[];
    role?: string;
    [key: string]: unknown;
  };
  /** User metadata — profile data set by the user */
  user_metadata?: Record<string, unknown>;
  /** Supabase-specific session ID */
  session_id?: string;
  /** Token role: "authenticated" for logged-in users, "anon" for anonymous */
  role?: "authenticated" | "anon" | string;
}

// ---------------------------------------------------------------------------
// Verify a Supabase JWT
// ---------------------------------------------------------------------------

export type VerifyResult =
  | { valid: true; payload: SupabaseJWTPayload }
  | { valid: false; error: string };

/**
 * Verifies a Supabase-issued JWT using the embedded EC public key (ES256).
 *
 * Strategy:
 *   1. Try the locally embedded key first (zero network, fastest path).
 *   2. On key mismatch (key rotation), fall back to the remote JWKS endpoint.
 *
 * This is safe to call in Next.js Middleware and Server Components.
 * Do NOT use this to replace `supabase.auth.getUser()` for session management —
 * use it for supplementary server-side validation where you already have a raw token.
 *
 * @example
 * const token = request.headers.get('Authorization')?.replace('Bearer ', '')
 * if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
 * const result = await verifySupabaseJWT(token)
 * if (!result.valid) return NextResponse.json({ error: result.error }, { status: 401 })
 * console.log('User ID:', result.payload.sub)
 */
export async function verifySupabaseJWT(token: string): Promise<VerifyResult> {
  // 1. Try local embedded key (fast path, no network)
  try {
    const { payload } = await jwtVerify<SupabaseJWTPayload>(token, localJWKS, {
      algorithms: ["ES256"],
      issuer: `${process.env.SUPABASE_URL}/auth/v1`,
    });
    return { valid: true, payload };
  } catch (localError) {
    // If the error is "no applicable key" (key rotation), fall through to remote.
    // Re-throw all other errors (expired, malformed, wrong issuer, etc.).
    if (!isKeyNotFoundError(localError)) {
      return {
        valid: false,
        error:
          localError instanceof Error ? localError.message : "Invalid token",
      };
    }
  }

  // 2. Fallback: fetch current keys from JWKS endpoint (handles key rotation)
  try {
    const { payload } = await jwtVerify<SupabaseJWTPayload>(
      token,
      remoteJWKS,
      {
        algorithms: ["ES256"],
        issuer: `${process.env.SUPABASE_URL}/auth/v1`,
      },
    );
    return { valid: true, payload };
  } catch (remoteError) {
    return {
      valid: false,
      error:
        remoteError instanceof Error ? remoteError.message : "Invalid token",
    };
  }
}

/**
 * Decodes a Supabase JWT without verifying the signature.
 * Safe for extracting the user ID or metadata in trusted server contexts
 * where the token has already been verified by Supabase (e.g., from a cookie
 * that `@supabase/ssr` has validated).
 *
 * ⚠️ Do NOT use this as a security check — always verify untrusted tokens
 *    with `verifySupabaseJWT()` first.
 */
export function decodeSupabaseJWT(token: string): SupabaseJWTPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(
      Buffer.from(parts[1]!, "base64url").toString("utf-8"),
    ) as SupabaseJWTPayload;
    return payload;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function isKeyNotFoundError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  return (
    err.message.includes("no applicable key") ||
    err.message.includes("key not found") ||
    err.name === "JWKSNoMatchingKey" ||
    err.name === "JWKSMultipleMatchingKeys"
  );
}
