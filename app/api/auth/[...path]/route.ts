import { auth } from '@/lib/auth/server';

// Neon Auth (Better Auth) endpoint — proxies all client auth requests.
//
// `auth.handler()` is built lazily (on the first real request) rather than
// called here at module top level — see lib/auth/server.ts and proxy.ts for
// why bundling passes must not trigger it.
let handler: ReturnType<typeof auth.handler> | undefined;

function getHandler() {
  return (handler ??= auth.handler());
}

export async function GET(
  ...args: Parameters<ReturnType<typeof auth.handler>['GET']>
) {
  return getHandler().GET(...args);
}

export async function POST(
  ...args: Parameters<ReturnType<typeof auth.handler>['POST']>
) {
  return getHandler().POST(...args);
}
