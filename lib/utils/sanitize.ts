import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitizes user input to prevent XSS attacks
 * Removes potentially dangerous HTML and JavaScript
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';

  // Configure DOMPurify to be very restrictive
  const clean = DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // No HTML tags allowed
    ALLOWED_ATTR: [], // No attributes allowed
    KEEP_CONTENT: true, // Keep text content
  });

  return clean;
}

/**
 * Sanitizes an object's string properties
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized = { ...obj };

  for (const key in sanitized) {
    if (typeof sanitized[key] === 'string') {
      sanitized[key] = sanitizeInput(sanitized[key]) as any;
    }
  }

  return sanitized;
}

/**
 * Sanitizes HTML content (allows safe HTML tags)
 * Use this for rich text content where some HTML is acceptable
 */
export function sanitizeHtml(html: string): string {
  if (!html) return '';

  // Allow only safe HTML tags
  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'target'],
    ALLOWED_URI_REGEXP: /^(?:(?:https?):\/\/)/i, // Only https/http links
  });

  return clean;
}
