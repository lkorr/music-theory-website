/**
 * Password Security Utilities
 * 
 * SECURITY: This file implements secure password hashing using Argon2id
 * following OWASP recommendations for password storage.
 */

import argon2 from 'argon2';
import crypto from 'crypto';

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
export async function hashPassword(password) {
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
export async function verifyPassword(hashedPassword, plainPassword) {
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
export function validatePasswordStrength(password) {
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

  // Common password checks
  const commonPasswords = [
    'password', '123456', '123456789', 'qwerty', 'abc123',
    'password123', 'admin', 'letmein', 'welcome', 'monkey'
  ];

  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push('Password is too common. Please choose a more unique password');
  }

  // Sequential characters check
  if (/123456|abcdef|qwerty/i.test(password)) {
    errors.push('Password should not contain sequential characters');
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
export function generateSecurePassword(length = 16) {
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
export function constantTimeEquals(a, b) {
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