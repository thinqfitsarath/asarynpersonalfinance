import { createNeonAuth } from '@neondatabase/auth/next/server';
import type { NeonAuth } from '@neondatabase/auth/next/server';

/**
 * This module gets *imported and evaluated* — without ever being invoked —
 * by more than one build-time tool: `next build`'s route/middleware config
 * collection, and (separately) Netlify's edge-function bundler when it
 * packages proxy.ts as an edge function. `createNeonAuth` validates
 * `baseUrl`/`cookies.secret` eagerly and throws if either is missing, and
 * neither of those bundling passes reliably has the real env vars in scope
 * (edge-function bundling in particular runs in its own context that isn't
 * guaranteed the same env injection as the Next build). Auth never actually
 * runs during any bundling pass, only during real requests, so the instance
 * is created lazily on first use instead of at module evaluation time — that
 * keeps merely importing this module side-effect-free everywhere, while
 * runtime behavior (real env vars required, thrown error if absent) is
 * unchanged.
 */
let instance: NeonAuth | undefined;

function getAuth(): NeonAuth {
  return (instance ??= createNeonAuth({
    baseUrl: process.env.NEON_AUTH_BASE_URL!,
    cookies: {
      secret: process.env.NEON_AUTH_COOKIE_SECRET!,
      // 'strict' (the SDK default) drops the session-challenge cookie on the
      // request that lands back from Google/the magic-link redirect, since
      // that request arrives via a cross-site top-level navigation (through
      // Google/Neon's own domains) even though the destination is same-origin.
      // 'lax' still blocks the cookie on genuine cross-site requests but
      // allows it on top-level navigations, which OAuth/magic-link redirects
      // require.
      sameSite: 'lax',
    },
  }));
}

/**
 * Server-side Neon Auth (Better Auth) instance.
 * Provides `.handler()` for the API route, `.middleware()` for route
 * protection, and `.getSession()` for server components / actions / routes.
 * Property access transparently builds (once) and delegates to the real
 * instance — see the lazy-init note above.
 */
export const auth: NeonAuth = new Proxy({} as NeonAuth, {
  get(_target, prop, receiver) {
    const real = getAuth();
    const value = Reflect.get(real, prop, receiver);
    return typeof value === 'function' ? value.bind(real) : value;
  },
});
