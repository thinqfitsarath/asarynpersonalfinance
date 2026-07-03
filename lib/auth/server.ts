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
  },
});
