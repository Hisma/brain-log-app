// Edge Runtime compatible password hashing and comparison
// Uses Web Crypto API with PBKDF2 for Edge Runtime compatibility

// Constants for PBKDF2 algorithm
const ITERATIONS = 100000; // High iteration count for security
const HASH_ALGORITHM = 'SHA-256';
const SALT_LENGTH = 16; // 16 bytes = 128 bits
const KEY_LENGTH = 32; // 32 bytes = 256 bits

// Format: algorithm:iterations:salt:hash
// Example: PBKDF2:100000:base64salt:base64hash
const HASH_FORMAT = 'PBKDF2';

/**
 * Convert a string to a Uint8Array
 */
function stringToBuffer(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

/**
 * Convert a Uint8Array to a base64 string
 */
function bufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const uint8Array = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  return btoa(String.fromCharCode(...uint8Array));
}

/**
 * Convert a base64 string to a Uint8Array
 */
function base64ToBuffer(base64: string): Uint8Array {
  return Uint8Array.from(atob(base64), c => c.charCodeAt(0));
}

/**
 * Generate a random salt
 */
function generateSalt(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
}

/**
 * Hash a password using PBKDF2 with a random salt
 * Returns a string in the format: PBKDF2:iterations:base64salt:base64hash
 */
export async function hashPassword(password: string): Promise<string> {
  // Generate a random salt
  const salt = generateSalt();
  
  // Import the password as a key
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    stringToBuffer(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );
  
  // Derive bits using PBKDF2
  const keyBuffer = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: ITERATIONS,
      hash: HASH_ALGORITHM
    },
    passwordKey,
    KEY_LENGTH * 8 // bits
  );
  
  // Convert salt and hash to base64
  const saltBase64 = bufferToBase64(salt);
  const hashBase64 = bufferToBase64(keyBuffer);
  
  return `${HASH_FORMAT}:${ITERATIONS}:${saltBase64}:${hashBase64}`;
}

/**
 * Compare a password with a hash string
 * Uses PBKDF2 format: PBKDF2:iterations:salt:hash
 */
export async function comparePasswords(password: string, hashString: string): Promise<boolean> {
  try {
    // Check if this is a PBKDF2 hash
    if (!hashString.startsWith(HASH_FORMAT)) {
      return false;
    }
    
    // Parse the hash string
    const parts = hashString.split(':');
    if (parts.length !== 4) {
      return false;
    }
    
    const [, iterationsStr, saltBase64, hashBase64] = parts;
    const iterations = parseInt(iterationsStr, 10);
    
    if (isNaN(iterations) || iterations <= 0) {
      return false;
    }
    
    const salt = base64ToBuffer(saltBase64);
    
    // Import the password as a key
    const passwordKey = await crypto.subtle.importKey(
      'raw',
      stringToBuffer(password),
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    );
    
    // Derive bits using PBKDF2 with the same salt and iterations
    const keyBuffer = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt,
        iterations,
        hash: HASH_ALGORITHM
      },
      passwordKey,
      KEY_LENGTH * 8 // bits
    );
    
    // Convert to base64 and compare
    const derivedHashBase64 = bufferToBase64(keyBuffer);
    return derivedHashBase64 === hashBase64;
  } catch (error) {
    console.error('Password comparison error:', error);
    return false;
  }
}

/**
 * Generate a cryptographically secure random string
 * Useful for generating tokens, session IDs, etc.
 */
export function generateSecureRandomString(length: number = 32): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return bufferToBase64(array).replace(/[+/=]/g, '').substring(0, length);
}

/**
 * Generate a UUID v4 using crypto.randomUUID if available,
 * otherwise falls back to a secure implementation
 */
export function generateUUID(): string {
  if (typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  
  // Fallback implementation for environments without crypto.randomUUID
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  
  // Set version (4) and variant bits
  array[6] = (array[6] & 0x0f) | 0x40; // Version 4
  array[8] = (array[8] & 0x3f) | 0x80; // Variant 10
  
  const hex = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  return `${hex.substring(0, 8)}-${hex.substring(8, 12)}-${hex.substring(12, 16)}-${hex.substring(16, 20)}-${hex.substring(20, 32)}`;
}
