/**
 * CSRF Protection Middleware
 * 
 * Provides Cross-Site Request Forgery protection for API endpoints
 * by validating CSRF tokens on state-changing operations.
 */

import crypto from 'crypto';

/**
 * Generate a CSRF token for the current session
 * @param {string} sessionId - Unique session identifier
 * @returns {string} CSRF token
 */
export function generateCSRFToken(sessionId) {
  const timestamp = Date.now().toString();
  const randomBytes = crypto.randomBytes(16).toString('hex');
  const payload = `${sessionId}:${timestamp}:${randomBytes}`;
  
  if (!process.env.AUTH_SECRET) {
    throw new Error('AUTH_SECRET required for CSRF token generation');
  }
  
  const signature = crypto
    .createHmac('sha256', process.env.AUTH_SECRET)
    .update(payload)
    .digest('hex');
    
  return `${payload}:${signature}`;
}

/**
 * Validate a CSRF token
 * @param {string} token - CSRF token to validate
 * @param {string} sessionId - Expected session identifier
 * @param {number} maxAge - Maximum age in milliseconds (default: 1 hour)
 * @returns {boolean} True if token is valid
 */
export function validateCSRFToken(token, sessionId, maxAge = 3600000) {
  if (!token || typeof token !== 'string') {
    return false;
  }
  
  const parts = token.split(':');
  if (parts.length !== 4) {
    return false;
  }
  
  const [tokenSessionId, timestamp, randomBytes, signature] = parts;
  
  // Validate session ID matches
  if (tokenSessionId !== sessionId) {
    return false;
  }
  
  // Check token age
  const tokenAge = Date.now() - parseInt(timestamp, 10);
  if (tokenAge > maxAge) {
    return false;
  }
  
  // Verify signature
  const payload = `${tokenSessionId}:${timestamp}:${randomBytes}`;
  
  if (!process.env.AUTH_SECRET) {
    return false;
  }
  
  const expectedSignature = crypto
    .createHmac('sha256', process.env.AUTH_SECRET)
    .update(payload)
    .digest('hex');
    
  // Use constant-time comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
}

/**
 * CSRF protection middleware for API routes
 * @param {Request} request - HTTP request object
 * @param {string} sessionId - Current session ID
 * @returns {boolean} True if CSRF check passes
 */
export function validateCSRFHeader(request, sessionId) {
  // Skip CSRF check for safe methods
  const method = request.method.toLowerCase();
  if (['get', 'head', 'options'].includes(method)) {
    return true;
  }
  
  // Check for CSRF token in header
  const csrfToken = request.headers.get('x-csrf-token');
  if (!csrfToken) {
    return false;
  }
  
  return validateCSRFToken(csrfToken, sessionId);
}

/**
 * Get CSRF token from request cookies
 * @param {Request} request - HTTP request object
 * @returns {string|null} CSRF token or null if not found
 */
export function getCSRFTokenFromCookie(request) {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return null;
  
  const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
    const [name, value] = cookie.trim().split('=');
    acc[name] = value;
    return acc;
  }, {});
  
  return cookies['csrf-token'] || null;
}