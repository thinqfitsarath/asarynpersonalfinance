/**
 * Utility functions for extracting request metadata
 * Used for audit logging and security
 */

/**
 * Extracts the client IP address from the request
 * Handles various proxy headers (x-forwarded-for, x-real-ip, etc.)
 */
export function getClientIp(request: Request): string {
  const headers = request.headers;

  // Try various headers in order of preference
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, get the first one
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }

  const cfConnectingIp = headers.get('cf-connecting-ip'); // Cloudflare
  if (cfConnectingIp) {
    return cfConnectingIp.trim();
  }

  // If no proxy headers, return unknown
  return 'unknown';
}

/**
 * Extracts the user agent from the request
 */
export function getUserAgent(request: Request): string {
  return request.headers.get('user-agent') || 'unknown';
}

/**
 * Extracts request metadata for audit logging
 */
export function getRequestMetadata(request: Request) {
  return {
    ipAddress: getClientIp(request),
    userAgent: getUserAgent(request),
  };
}
