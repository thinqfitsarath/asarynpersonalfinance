import { createNeonAuth } from '@neondatabase/auth/next/server';

/**
 * Server-side Neon Auth (Better Auth) instance.
 * Provides `.handler()` for the API route, `.middleware()` for route
 * protection, and `.getSession()` for server components / actions / routes.
 */
export const auth = createNeonAuth({
  baseUrl: process.env.NEON_AUTH_BASE_URL!,
  cookies: {
    secret: process.env.NEON_AUTH_COOKIE_SECRET!,
    // 'strict' (the SDK default) drops the session-challenge cookie on the
    // request that lands back from Google/the magic-link redirect, since
    // that request arrives via a cross-site top-level navigation (through
    // Google/Neon's own domains) even though the destination is same-origin.
    // 'lax' still blocks the cookie on genuine cross-site requests but allows
    // it on top-level navigations, which OAuth/magic-link redirects require.
    sameSite: 'lax',
  },
});
