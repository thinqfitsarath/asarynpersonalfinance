import { auth } from '@/lib/auth/server';

// Next.js 16 middleware (proxy.ts). Protects the dashboard; redirects
// unauthenticated users to the passwordless sign-in page. Everything else
// — the landing page, /signin, /join, /welcome, /api/auth/*, and the
// entire independent /emergency/* system — stays public.
//
// `auth.middleware(...)` is built lazily (on the first real request) rather
// than called here at module top level — Netlify's edge-function bundler
// evaluates this module while packaging it, before any request exists; see
// lib/auth/server.ts for why that must stay side-effect-free.
let handler: ReturnType<typeof auth.middleware> | undefined;

export default function proxyMiddleware(
  ...args: Parameters<ReturnType<typeof auth.middleware>>
) {
  handler ??= auth.middleware({ loginUrl: '/signin' });
  return handler(...args);
}

export const config = {
  // /welcome must also run through the middleware: it's the OAuth/magic-link
  // callbackURL, and the Neon Auth session-verifier exchange only happens
  // inside auth.middleware() — landing there without it means the session
  // cookie never gets set. /welcome itself still requires a session (correct:
  // nobody should land there outside an active sign-in flow), so widening the
  // matcher here doesn't expose anything that wasn't already gated.
  matcher: ['/dashboard/:path*', '/welcome/:path*'],
};
