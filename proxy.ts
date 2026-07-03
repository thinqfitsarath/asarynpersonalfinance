import { auth } from '@/lib/auth/server';

// Next.js 16 middleware (proxy.ts). Protects the dashboard; redirects
// unauthenticated users to the passwordless sign-in page. Everything else
// — the landing page, /signin, /join, /welcome, /api/auth/*, and the
// entire independent /emergency/* system — stays public.
export default auth.middleware({
  loginUrl: '/signin',
});

export const config = {
  matcher: ['/dashboard/:path*'],
};
