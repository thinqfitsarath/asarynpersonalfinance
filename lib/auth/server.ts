import { createNeonAuth } from '@neondatabase/auth/next/server';

/**
 * Next imports this module during `next build` (to collect route/middleware
 * config). `createNeonAuth` validates `baseUrl` + `cookies.secret` eagerly and
 * throws if either is missing — which fails the whole build if the auth env
 * vars aren't present in the *build* environment (they're only guaranteed in
 * the *runtime* environment: Netlify functions). Auth never actually runs
 * during a build, so fall back to build-only placeholders while the build
 * phase is active. At runtime the placeholders are never used: the real env
 * vars are required, and their absence surfaces as a normal runtime error
 * rather than a silently-weak signing secret.
 */
const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build';

const baseUrl =
  process.env.NEON_AUTH_BASE_URL ??
  (isBuildPhase ? 'https://build-time-placeholder.invalid/auth' : undefined);

const cookieSecret =
  process.env.NEON_AUTH_COOKIE_SECRET ??
  (isBuildPhase
    ? 'build-time-placeholder-secret-not-used-at-runtime'
    : undefined);

/**
 * Server-side Neon Auth (Better Auth) instance.
 * Provides `.handler()` for the API route, `.middleware()` for route
 * protection, and `.getSession()` for server components / actions / routes.
 */
export const auth = createNeonAuth({
  baseUrl: baseUrl!,
  cookies: {
    secret: cookieSecret!,
    // 'strict' (the SDK default) drops the session-challenge cookie on the
    // request that lands back from Google/the magic-link redirect, since
    // that request arrives via a cross-site top-level navigation (through
    // Google/Neon's own domains) even though the destination is same-origin.
    // 'lax' still blocks the cookie on genuine cross-site requests but allows
    // it on top-level navigations, which OAuth/magic-link redirects require.
    sameSite: 'lax',
  },
});
