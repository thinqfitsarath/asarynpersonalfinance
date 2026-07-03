import { auth } from '@/lib/auth/server';

// Neon Auth (Better Auth) endpoint — proxies all client auth requests.
export const { GET, POST } = auth.handler();
