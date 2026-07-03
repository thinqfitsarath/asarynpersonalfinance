import { NextResponse } from 'next/server';
import { normalizeCode } from '@/lib/utils/codes';

/**
 * Invite entry point: `/join?code=ABCD-1234`.
 * Stashes the code in an httpOnly cookie (so it survives the magic-link /
 * Google sign-in redirect) and sends the user to the passwordless sign-in
 * page. /welcome consumes the cookie after authentication.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const raw = url.searchParams.get('code');
  const dest = new URL('/signin', url.origin);

  if (!raw) {
    return NextResponse.redirect(dest);
  }

  dest.searchParams.set('join', '1');
  const res = NextResponse.redirect(dest);
  res.cookies.set('pending_invite', normalizeCode(raw), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60, // 1 hour
  });
  return res;
}
