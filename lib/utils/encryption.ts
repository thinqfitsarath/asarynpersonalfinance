import crypto from 'crypto';

/**
 * Encryption utility using AES-256-GCM encryption with Node.js native crypto
 * This provides secure encryption for passwords and sensitive data
 *
 * Format: iv:authTag:encryptedData (all base64 encoded)
 */

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // 128 bits
const AUTH_TAG_LENGTH = 16; // 128 bits
const SALT_LENGTH = 32; // 256 bits

// Validate encryption key on module load
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '';

if (!ENCRYPTION_KEY) {
  throw new Error('CRITICAL: ENCRYPTION_KEY environment variable is not set. Application cannot start without encryption key.');
}

if (ENCRYPTION_KEY.length < 32) {
  throw new Error('CRITICAL: ENCRYPTION_KEY must be at least 32 characters (256 bits). Generate with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
}

/**
 * Derives a 256-bit key from the encryption key or custom key
 * Uses PBKDF2 with SHA-256
 */
function deriveKeyFromPassword(password: string, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
}

/**
 * Encrypts a string using AES-256-GCM
 * @param text - The text to encrypt
 * @param customKey - Optional custom encryption key (for user-specific encryption)
 * @returns Encrypted string in format: salt:iv:authTag:encryptedData (base64)
 */
export function encrypt(text: string, customKey?: string): string {
  try {
    const key = customKey || ENCRYPTION_KEY;
    if (!key) {
      throw new Error('Encryption key not available');
    }

    // Generate random salt and IV
    const salt = crypto.randomBytes(SALT_LENGTH);
    const iv = crypto.randomBytes(IV_LENGTH);

    // Derive encryption key
    const derivedKey = deriveKeyFromPassword(key, salt);

    // Create cipher
    const cipher = crypto.createCipheriv(ALGORITHM, derivedKey, iv);

    // Encrypt
    let encrypted = cipher.update(text, 'utf8', 'base64');
    encrypted += cipher.final('base64');

    // Get auth tag
    const authTag = cipher.getAuthTag();

    // Return format: salt:iv:authTag:encryptedData
    return [
      salt.toString('base64'),
      iv.toString('base64'),
      authTag.toString('base64'),
      encrypted,
    ].join(':');
  } catch (error) {
    // Don't log the error details in production to avoid information leakage
    if (process.env.NODE_ENV === 'development') {
      console.error('Encryption error:', error);
    }
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypts an AES-256-GCM encrypted string
 * @param encryptedText - The encrypted text in format: salt:iv:authTag:encryptedData
 * @param customKey - Optional custom encryption key (for user-specific encryption)
 * @returns Decrypted string
 */
export function decrypt(encryptedText: string, customKey?: string): string {
  try {
    const key = customKey || ENCRYPTION_KEY;
    if (!key) {
      throw new Error('Decryption key not available');
    }

    // Parse encrypted data
    const parts = encryptedText.split(':');
    if (parts.length !== 4) {
      throw new Error('Invalid encrypted data format');
    }

    const salt = Buffer.from(parts[0], 'base64');
    const iv = Buffer.from(parts[1], 'base64');
    const authTag = Buffer.from(parts[2], 'base64');
    const encrypted = parts[3];

    // Derive decryption key
    const derivedKey = deriveKeyFromPassword(key, salt);

    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, derivedKey, iv);
    decipher.setAuthTag(authTag);

    // Decrypt
    let decrypted = decipher.update(encrypted, 'base64', 'utf8');
    decrypted += decipher.final('utf8');

    if (!decrypted) {
      throw new Error('Decryption failed - invalid key or corrupted data');
    }

    return decrypted;
  } catch (error) {
    // Don't log the error details in production to avoid information leakage
    if (process.env.NODE_ENV === 'development') {
      console.error('Decryption error:', error);
    }
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Hashes a password using SHA-256
 * Used for creating encryption keys from master passwords
 * Note: For password storage, use bcrypt instead
 * @param password - The password to hash
 * @returns Hashed password in hex format
 */
export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

/**
 * Creates a derived key from a master password using PBKDF2
 * This can be used for user-specific encryption
 * @param masterPassword - The master password
 * @param salt - Salt (use user ID or email)
 * @returns Derived encryption key in hex format
 */
export function deriveKey(masterPassword: string, salt: string): string {
  const saltBuffer = Buffer.from(salt, 'utf8');
  const derivedKey = crypto.pbkdf2Sync(masterPassword, saltBuffer, 100000, 32, 'sha256');
  return derivedKey.toString('hex');
}

/**
 * Encrypts an object to JSON string
 * @param data - The object to encrypt
 * @param customKey - Optional custom encryption key
 * @returns Encrypted JSON string
 */
export function encryptObject(data: any, customKey?: string): string {
  const jsonString = JSON.stringify(data);
  return encrypt(jsonString, customKey);
}

/**
 * Decrypts a JSON string to object
 * @param encryptedData - The encrypted JSON string
 * @param customKey - Optional custom encryption key
 * @returns Decrypted object
 */
export function decryptObject<T = any>(encryptedData: string, customKey?: string): T {
  const jsonString = decrypt(encryptedData, customKey);
  return JSON.parse(jsonString) as T;
}

/**
 * Generates a random encryption key
 * @returns Random 32-byte key in hex format
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString('hex');
}
