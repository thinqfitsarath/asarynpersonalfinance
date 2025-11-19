import CryptoJS from 'crypto-js';

/**
 * Encryption utility using AES-256 encryption
 * This provides secure encryption for passwords and sensitive data
 */

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '';

if (!ENCRYPTION_KEY) {
  console.warn('WARNING: ENCRYPTION_KEY not set in environment variables');
}

/**
 * Encrypts a string using AES-256
 * @param text - The text to encrypt
 * @param customKey - Optional custom encryption key (for user-specific encryption)
 * @returns Encrypted string
 */
export function encrypt(text: string, customKey?: string): string {
  try {
    const key = customKey || ENCRYPTION_KEY;
    if (!key) {
      throw new Error('Encryption key not available');
    }
    const encrypted = CryptoJS.AES.encrypt(text, key);
    return encrypted.toString();
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypts an AES-256 encrypted string
 * @param encryptedText - The encrypted text
 * @param customKey - Optional custom encryption key (for user-specific encryption)
 * @returns Decrypted string
 */
export function decrypt(encryptedText: string, customKey?: string): string {
  try {
    const key = customKey || ENCRYPTION_KEY;
    if (!key) {
      throw new Error('Decryption key not available');
    }
    const decrypted = CryptoJS.AES.decrypt(encryptedText, key);
    const text = decrypted.toString(CryptoJS.enc.Utf8);

    if (!text) {
      throw new Error('Decryption failed - invalid key or corrupted data');
    }

    return text;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Hashes a password using SHA-256
 * Used for creating encryption keys from master passwords
 * @param password - The password to hash
 * @returns Hashed password
 */
export function hashPassword(password: string): string {
  return CryptoJS.SHA256(password).toString();
}

/**
 * Creates a derived key from a master password
 * This can be used for user-specific encryption
 * @param masterPassword - The master password
 * @param salt - Optional salt (use user ID or email)
 * @returns Derived encryption key
 */
export function deriveKey(masterPassword: string, salt?: string): string {
  const combined = salt ? `${masterPassword}:${salt}` : masterPassword;
  return CryptoJS.SHA256(combined).toString();
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
  return CryptoJS.lib.WordArray.random(32).toString();
}
