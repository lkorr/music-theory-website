/**
 * Password Security Utilities
 * 
 * SECURITY: This file implements secure password hashing using Argon2id
 * following OWASP recommendations for password storage.
 */

import * as argon2 from 'argon2';
import * as crypto from 'crypto';

// Type definitions for password utilities
export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Argon2id Configuration (OWASP Recommended)
 * 
 * These parameters provide strong security while maintaining reasonable performance:
 * - type: argon2id (hybrid of argon2i and argon2d, recommended by OWASP)
 * - memoryCost: 19456 KB (19 MB) - Recommended minimum
 * - timeCost: 2 iterations - Balance between security and performance
 * - parallelism: 1 - Single-threaded for consistent timing
 */
const ARGON2_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 19456, // 19 MB
  timeCost: 2,       // 2 iterations
  parallelism: 1,    // Single thread
  hashLength: 32,    // 32 byte hash output
};

/**
 * Hash a password using Argon2id
 * 
 * @param {string} password - Plain text password
 * @returns {Promise<string>} - Hashed password with salt
 * @throws {Error} - If password is invalid or hashing fails
 */
export async function hashPassword(password: string): Promise<string> {
  // Input validation
  if (!password || typeof password !== 'string') {
    throw new Error('Password must be a non-empty string');
  }

  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters long');
  }

  if (password.length > 128) {
    throw new Error('Password must be less than 128 characters');
  }

  try {
    // Generate random salt (32 bytes)
    const salt = crypto.randomBytes(32);
    
    // Hash password with Argon2id
    const hashedPassword = await argon2.hash(password, {
      ...ARGON2_OPTIONS,
      salt,
    });

    return hashedPassword;
  } catch (error) {
    console.error('Password hashing error:', error);
    throw new Error('Failed to hash password');
  }
}

/**
 * Verify a password against its hash
 * 
 * @param {string} hashedPassword - Stored password hash
 * @param {string} plainPassword - Plain text password to verify
 * @returns {Promise<boolean>} - True if password matches, false otherwise
 * @throws {Error} - If verification fails due to invalid input
 */
export async function verifyPassword(hashedPassword: string, plainPassword: string): Promise<boolean> {
  // Input validation
  if (!hashedPassword || typeof hashedPassword !== 'string') {
    throw new Error('Hashed password must be a non-empty string');
  }

  if (!plainPassword || typeof plainPassword !== 'string') {
    throw new Error('Plain password must be a non-empty string');
  }

  try {
    // Verify password using Argon2
    const isValid = await argon2.verify(hashedPassword, plainPassword);
    return isValid;
  } catch (error) {
    console.error('Password verification error:', error);
    // Return false for verification errors (don't throw)
    // This prevents timing attacks and maintains security
    return false;
  }
}

/**
 * Validate password strength
 * 
 * @param {string} password - Password to validate
 * @returns {Object} - Validation result with isValid and errors
 */
export function validatePasswordStrength(password: string): PasswordValidationResult {
  const errors = [];
  
  if (!password) {
    return {
      isValid: false,
      errors: ['Password is required']
    };
  }

  // Length requirements
  if (password.length < 12) {
    errors.push('Password must be at least 12 characters long');
  }

  if (password.length > 128) {
    errors.push('Password must be less than 128 characters');
  }

  // Character requirements
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  // Common password checks - expanded list
  const commonPasswords = [
    // Most common passwords
    'password', '123456', '123456789', 'qwerty', 'abc123',
    'password123', 'admin', 'letmein', 'welcome', 'monkey',
    'dragon', 'master', 'shadow', 'superman', 'michael',
    'football', 'baseball', 'liverpool', 'jordan', 'harley',
    'robert', 'thomas', 'daniel', 'andrew', 'joshua',
    // Years and dates
    '2023', '2024', '2025', '1990', '1991', '1992', '1993', '1994', '1995',
    // Simple variations
    'password1', 'password!', 'Password1', 'Password!',
    'qwerty123', 'abc12345', '12345678', '87654321',
    // Common words with numbers
    'love123', 'god123', 'sex123', 'money123', 'beer123',
    // Keyboard patterns (will be caught by pattern check but good to have)
    '1q2w3e4r', 'qazwsx', '1qaz2wsx', 'zaq12wsx',
    // Default passwords
    'default', 'guest', 'user', 'test', 'demo',
    'changeme', 'newpass', 'temp123', 'password1234'
  ];

  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push('Password is too common. Please choose a more unique password');
  }

  // Enhanced keyboard pattern and sequential characters check
  const keyboardPatterns = [
    // QWERTY patterns
    'qwertyuiop', 'asdfghjkl', 'zxcvbnm',
    'qwertyui', 'asdfghjk', 'zxcvbn',
    'qwerty', 'asdfgh', 'zxcv',
    // Numeric sequences
    '1234567890', '0987654321',
    '123456789', '987654321',
    '12345678', '87654321',
    '1234567', '7654321',
    '123456', '654321',
    '12345', '54321',
    '1234', '4321',
    // Alphabetical sequences
    'abcdefghijklmnopqrstuvwxyz', 'zyxwvutsrqponmlkjihgfedcba',
    'abcdefghijklm', 'nopqrstuvwxyz',
    'abcdefgh', 'ijklmnop', 'qrstuvwx',
    'abcdefg', 'hijklmn', 'opqrstu', 'vwxyz',
    'abcdef', 'ghijkl', 'mnopqr', 'stuvwx',
    'abcde', 'fghij', 'klmno', 'pqrst', 'uvwxy',
    'abcd', 'efgh', 'ijkl', 'mnop', 'qrst', 'uvwx',
    // Common substitution patterns
    '@bcd', '3fgh', 'ijk1', 'mn0p', 'qr5t', 'uvw×',
    // Mobile keypad patterns
    '147258369', '963852741', '159357', '357159'
  ];

  const passwordLower = password.toLowerCase();
  for (const pattern of keyboardPatterns) {
    if (passwordLower.includes(pattern.toLowerCase())) {
      errors.push('Password should not contain keyboard patterns or sequential characters');
      break;
    }
  }

  // Additional pattern checks for repetition
  if (/(.)\1{2,}/.test(password)) {
    errors.push('Password should not contain repeated characters (e.g., "aaa", "111")');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Generate a secure random password
 * 
 * @param {number} length - Password length (default: 16)
 * @returns {string} - Secure random password
 */
export function generateSecurePassword(length: number = 16): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
  let password = '';
  
  // Ensure at least one character from each required category
  const categories = [
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    'abcdefghijklmnopqrstuvwxyz', 
    '0123456789',
    '!@#$%^&*()_+-=[]{}|;:,.<>?'
  ];

  // Add one character from each category
  for (const category of categories) {
    const randomIndex = crypto.randomInt(0, category.length);
    password += category[randomIndex];
  }

  // Fill remaining length with random characters
  for (let i = password.length; i < length; i++) {
    const randomIndex = crypto.randomInt(0, charset.length);
    password += charset[randomIndex];
  }

  // Shuffle the password to avoid predictable patterns
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

/**
 * Constant-time string comparison to prevent timing attacks
 * 
 * @param {string} a - First string
 * @param {string} b - Second string  
 * @returns {boolean} - True if strings are equal
 */
export function constantTimeEquals(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') {
    return false;
  }

  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}