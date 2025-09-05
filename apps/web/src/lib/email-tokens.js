/**
 * Email Token Management
 * 
 * Secure token generation and validation for email verification and password reset
 */

import crypto from 'crypto';
import { createHash } from 'crypto';

if (!process.env.AUTH_SECRET) {
  throw new Error('AUTH_SECRET environment variable is required for token signing');
}

const TOKEN_SECRET = process.env.AUTH_SECRET;

// In a production app, these would be stored in Redis or database
// For now, using in-memory storage with cleanup
const tokenStore = new Map();

// Clean up expired tokens every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of tokenStore.entries()) {
    if (data.expiresAt < now) {
      tokenStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Generate a secure token for email verification
 * @param {string} email - User's email address
 * @param {number} expiryHours - Hours until token expires (default: 2)
 * @returns {string} Secure token
 */
export function generateEmailToken(email, expiryHours = 2) {
  const timestamp = Date.now();
  const randomBytes = crypto.randomBytes(32).toString('hex');
  const expiresAt = timestamp + (expiryHours * 60 * 60 * 1000);
  
  // Create payload
  const payload = `${email}:${timestamp}:${randomBytes}:${expiresAt}`;
  
  // Create signature
  const signature = crypto
    .createHmac('sha256', TOKEN_SECRET)
    .update(payload)
    .digest('hex');
  
  const token = `${payload}:${signature}`;
  
  // Store token with expiration
  const tokenKey = createTokenKey(email, 'email_verification');
  tokenStore.set(tokenKey, {
    token,
    expiresAt,
    email,
    type: 'email_verification',
    used: false
  });
  
  return Buffer.from(token).toString('base64url');
}

/**
 * Generate a secure token for password reset
 * @param {string} email - User's email address
 * @param {number} expiryHours - Hours until token expires (default: 1)
 * @returns {string} Secure token
 */
export function generatePasswordResetToken(email, expiryHours = 1) {
  const timestamp = Date.now();
  const randomBytes = crypto.randomBytes(32).toString('hex');
  const expiresAt = timestamp + (expiryHours * 60 * 60 * 1000);
  
  // Create payload
  const payload = `${email}:${timestamp}:${randomBytes}:${expiresAt}:password_reset`;
  
  // Create signature
  const signature = crypto
    .createHmac('sha256', TOKEN_SECRET)
    .update(payload)
    .digest('hex');
  
  const token = `${payload}:${signature}`;
  
  // Store token with expiration
  const tokenKey = createTokenKey(email, 'password_reset');
  tokenStore.set(tokenKey, {
    token,
    expiresAt,
    email,
    type: 'password_reset',
    used: false
  });
  
  return Buffer.from(token).toString('base64url');
}

/**
 * Verify email verification token
 * @param {string} email - User's email address
 * @param {string} token - Token to verify
 * @returns {boolean} True if token is valid and not expired
 */
export function verifyEmailToken(email, token) {
  try {
    // Decode token
    const decodedToken = Buffer.from(token, 'base64url').toString();
    const parts = decodedToken.split(':');
    
    if (parts.length !== 5) {
      return false;
    }
    
    const [tokenEmail, timestamp, randomBytes, expiresAt, signature] = parts;
    
    // Check email matches
    if (tokenEmail !== email) {
      return false;
    }
    
    // Check expiration
    const now = Date.now();
    if (parseInt(expiresAt) < now) {
      // Clean up expired token
      const tokenKey = createTokenKey(email, 'email_verification');
      tokenStore.delete(tokenKey);
      return false;
    }
    
    // Verify signature
    const payload = `${tokenEmail}:${timestamp}:${randomBytes}:${expiresAt}`;
    const expectedSignature = crypto
      .createHmac('sha256', TOKEN_SECRET)
      .update(payload)
      .digest('hex');
    
    const isValidSignature = crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
    
    if (!isValidSignature) {
      return false;
    }
    
    // Atomic check-and-delete to prevent race conditions
    const tokenKey = createTokenKey(email, 'email_verification');
    const storedToken = tokenStore.get(tokenKey);
    
    if (!storedToken || storedToken.used) {
      return false;
    }
    
    // Atomically delete token (prevents TOCTOU race conditions)
    const tokenStillExists = tokenStore.delete(tokenKey);
    if (!tokenStillExists) {
      // Token was already used/deleted by another request
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Token verification error:', error);
    return false;
  }
}

/**
 * Verify password reset token
 * @param {string} email - User's email address
 * @param {string} token - Token to verify
 * @returns {boolean} True if token is valid and not expired
 */
export function verifyPasswordResetToken(email, token) {
  try {
    // Decode token
    const decodedToken = Buffer.from(token, 'base64url').toString();
    const parts = decodedToken.split(':');
    
    if (parts.length !== 6) {
      return false;
    }
    
    const [tokenEmail, timestamp, randomBytes, expiresAt, type, signature] = parts;
    
    // Check email matches and type is correct
    if (tokenEmail !== email || type !== 'password_reset') {
      return false;
    }
    
    // Check expiration
    const now = Date.now();
    if (parseInt(expiresAt) < now) {
      // Clean up expired token
      const tokenKey = createTokenKey(email, 'password_reset');
      tokenStore.delete(tokenKey);
      return false;
    }
    
    // Verify signature
    const payload = `${tokenEmail}:${timestamp}:${randomBytes}:${expiresAt}:${type}`;
    const expectedSignature = crypto
      .createHmac('sha256', TOKEN_SECRET)
      .update(payload)
      .digest('hex');
    
    const isValidSignature = crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
    
    if (!isValidSignature) {
      return false;
    }
    
    // Atomic check-and-delete to prevent race conditions
    const tokenKey = createTokenKey(email, 'password_reset');
    const storedToken = tokenStore.get(tokenKey);
    
    if (!storedToken || storedToken.used) {
      return false;
    }
    
    // Atomically delete token (prevents TOCTOU race conditions)
    const tokenStillExists = tokenStore.delete(tokenKey);
    if (!tokenStillExists) {
      // Token was already used/deleted by another request
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Token verification error:', error);
    return false;
  }
}

/**
 * Create a unique key for token storage
 * @param {string} email - User's email
 * @param {string} type - Token type
 * @returns {string} Unique key
 */
function createTokenKey(email, type) {
  return createHash('sha256').update(`${email}:${type}`).digest('hex');
}

/**
 * Clean up tokens for a specific email (useful for logout/security)
 * @param {string} email - User's email
 */
export function cleanupTokensForEmail(email) {
  const emailVerificationKey = createTokenKey(email, 'email_verification');
  const passwordResetKey = createTokenKey(email, 'password_reset');
  
  tokenStore.delete(emailVerificationKey);
  tokenStore.delete(passwordResetKey);
}

/**
 * Check if a valid email verification token exists for an email
 * @param {string} email - User's email
 * @returns {boolean} True if valid token exists
 */
export function hasValidEmailToken(email) {
  const tokenKey = createTokenKey(email, 'email_verification');
  const storedToken = tokenStore.get(tokenKey);
  
  if (!storedToken || storedToken.used) {
    return false;
  }
  
  const now = Date.now();
  return storedToken.expiresAt > now;
}

/**
 * Check if a valid password reset token exists for an email
 * @param {string} email - User's email
 * @returns {boolean} True if valid token exists
 */
export function hasValidPasswordResetToken(email) {
  const tokenKey = createTokenKey(email, 'password_reset');
  const storedToken = tokenStore.get(tokenKey);
  
  if (!storedToken || storedToken.used) {
    return false;
  }
  
  const now = Date.now();
  return storedToken.expiresAt > now;
}