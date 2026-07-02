import crypto from 'crypto';

/** Unambiguous alphabet: no 0/O, 1/I/L, or lookalikes */
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

function randomChars(length: number): string {
  const bytes = crypto.randomBytes(length);
  let out = '';
  for (let i = 0; i < length; i++) {
    out += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return out;
}

/** Family invite code, e.g. "KWNH-73QP" (~40 bits) */
export function generateInviteCode(): string {
  return `${randomChars(4)}-${randomChars(4)}`;
}

/** Emergency recovery code, e.g. "KWNH-73QP-XM2R" (~60 bits) */
export function generateRecoveryCode(): string {
  return `${randomChars(4)}-${randomChars(4)}-${randomChars(4)}`;
}

/** Read-only emergency access token (256 bits, hex) */
export function generateAccessToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/** Normalize user-typed codes: uppercase, strip spaces/hyphens, re-hyphenate */
export function normalizeCode(input: string): string {
  return input
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .replace(/(.{4})(?=.)/g, '$1-');
}

export function sha256(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex');
}
