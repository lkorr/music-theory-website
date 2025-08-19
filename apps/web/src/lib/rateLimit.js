/**
 * Rate Limiting Implementation
 * 
 * SECURITY: This file implements rate limiting to prevent brute force attacks,
 * DDoS attempts, and abuse of authentication endpoints.
 */

import { generateRateLimitKey, validateIPAddress } from './validation.js';

/**
 * In-memory rate limit store
 * 
 * NOTE: In production, consider using Redis for distributed rate limiting
 * across multiple server instances.
 */
class RateLimitStore {
  constructor() {
    this.store = new Map();
    this.cleanup();
  }

  /**
   * Get rate limit data for a key
   * 
   * @param {string} key - Rate limit key
   * @returns {Object|null} - Rate limit data or null
   */
  get(key) {
    const data = this.store.get(key);
    if (!data) return null;

    // Check if expired
    if (Date.now() > data.resetTime) {
      this.store.delete(key);
      return null;
    }

    return data;
  }

  /**
   * Set rate limit data for a key
   * 
   * @param {string} key - Rate limit key
   * @param {Object} data - Rate limit data
   */
  set(key, data) {
    this.store.set(key, data);
  }

  /**
   * Delete rate limit data for a key
   * 
   * @param {string} key - Rate limit key
   */
  delete(key) {
    this.store.delete(key);
  }

  /**
   * Cleanup expired entries every 10 minutes
   */
  cleanup() {
    setInterval(() => {
      const now = Date.now();
      for (const [key, data] of this.store.entries()) {
        if (now > data.resetTime) {
          this.store.delete(key);
        }
      }
    }, 10 * 60 * 1000); // 10 minutes
  }

  /**
   * Get store statistics
   * 
   * @returns {Object} - Store statistics
   */
  getStats() {
    return {
      totalKeys: this.store.size,
      entries: Array.from(this.store.entries()).slice(0, 10) // First 10 for debugging
    };
  }
}

// Global rate limit store instance
const rateLimitStore = new RateLimitStore();

/**
 * Rate limiting configurations for different endpoints
 */
export const RATE_LIMIT_CONFIGS = {
  // Authentication endpoints (strict limits)
  login: {
    windowMs: 15 * 60 * 1000,    // 15 minutes
    maxAttempts: 5,               // 5 attempts per window
    blockDuration: 30 * 60 * 1000, // 30 minutes block after limit
    message: 'Too many login attempts. Please try again later.'
  },

  register: {
    windowMs: 60 * 60 * 1000,     // 1 hour
    maxAttempts: 3,               // 3 registrations per hour
    blockDuration: 60 * 60 * 1000, // 1 hour block
    message: 'Too many registration attempts. Please try again later.'
  },

  passwordReset: {
    windowMs: 60 * 60 * 1000,     // 1 hour
    maxAttempts: 3,               // 3 reset attempts per hour
    blockDuration: 60 * 60 * 1000, // 1 hour block
    message: 'Too many password reset attempts. Please try again later.'
  },

  // API endpoints (more lenient)
  api: {
    windowMs: 60 * 1000,          // 1 minute
    maxAttempts: 60,              // 60 requests per minute
    blockDuration: 5 * 60 * 1000,  // 5 minutes block
    message: 'Too many API requests. Please slow down.'
  },

  // General endpoints
  general: {
    windowMs: 60 * 1000,          // 1 minute
    maxAttempts: 100,             // 100 requests per minute
    blockDuration: 60 * 1000,     // 1 minute block
    message: 'Too many requests. Please try again shortly.'
  }
};

/**
 * Check if request is rate limited
 * 
 * @param {string} key - Rate limit key
 * @param {Object} config - Rate limit configuration
 * @returns {Object} - Rate limit check result
 */
export function checkRateLimit(key, config) {
  const now = Date.now();
  const data = rateLimitStore.get(key);

  if (!data) {
    // First request - create new entry
    rateLimitStore.set(key, {
      attempts: 1,
      resetTime: now + config.windowMs,
      blockedUntil: null,
      firstAttempt: now
    });

    return {
      allowed: true,
      attempts: 1,
      maxAttempts: config.maxAttempts,
      resetTime: now + config.windowMs,
      blockedUntil: null
    };
  }

  // Check if currently blocked
  if (data.blockedUntil && now < data.blockedUntil) {
    return {
      allowed: false,
      attempts: data.attempts,
      maxAttempts: config.maxAttempts,
      resetTime: data.resetTime,
      blockedUntil: data.blockedUntil,
      message: config.message,
      retryAfter: Math.ceil((data.blockedUntil - now) / 1000)
    };
  }

  // Clear block if expired
  if (data.blockedUntil && now >= data.blockedUntil) {
    data.blockedUntil = null;
    data.attempts = 0;
    data.resetTime = now + config.windowMs;
    data.firstAttempt = now;
  }

  // Increment attempts
  data.attempts += 1;

  // Check if limit exceeded
  if (data.attempts > config.maxAttempts) {
    data.blockedUntil = now + config.blockDuration;
    
    rateLimitStore.set(key, data);

    return {
      allowed: false,
      attempts: data.attempts,
      maxAttempts: config.maxAttempts,
      resetTime: data.resetTime,
      blockedUntil: data.blockedUntil,
      message: config.message,
      retryAfter: Math.ceil(config.blockDuration / 1000)
    };
  }

  // Update store
  rateLimitStore.set(key, data);

  return {
    allowed: true,
    attempts: data.attempts,
    maxAttempts: config.maxAttempts,
    resetTime: data.resetTime,
    blockedUntil: null
  };
}

/**
 * Rate limit middleware for authentication endpoints
 * 
 * @param {string} type - Rate limit type ('login', 'register', etc.)
 * @returns {Function} - Middleware function
 */
export function createRateLimitMiddleware(type = 'general') {
  const config = RATE_LIMIT_CONFIGS[type] || RATE_LIMIT_CONFIGS.general;

  return async (request, context) => {
    try {
      // Extract client information
      const clientIP = getClientIP(request);
      const userAgent = request.headers.get('user-agent') || 'Unknown';
      
      // Create rate limit key
      const rateLimitKey = generateRateLimitKey(clientIP, type);

      // Check rate limit
      const rateLimitResult = checkRateLimit(rateLimitKey, config);

      if (!rateLimitResult.allowed) {
        // Log rate limit violation
        console.warn(`Rate limit exceeded for ${type}:`, {
          ip: clientIP,
          userAgent,
          attempts: rateLimitResult.attempts,
          blockedUntil: rateLimitResult.blockedUntil
        });

        // Return rate limit error
        return new Response(
          JSON.stringify({
            error: rateLimitResult.message,
            retryAfter: rateLimitResult.retryAfter
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': rateLimitResult.retryAfter?.toString() || '60',
              'X-RateLimit-Limit': config.maxAttempts.toString(),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': Math.ceil(rateLimitResult.blockedUntil / 1000).toString()
            }
          }
        );
      }

      // Add rate limit headers
      const remaining = Math.max(0, config.maxAttempts - rateLimitResult.attempts);
      
      // Store rate limit info in context for use in handlers
      context.rateLimitInfo = {
        type,
        key: rateLimitKey,
        attempts: rateLimitResult.attempts,
        remaining,
        resetTime: rateLimitResult.resetTime
      };

      return null; // Continue to next middleware/handler
    } catch (error) {
      console.error('Rate limiting error:', error);
      // Fail open - allow request if rate limiting fails
      return null;
    }
  };
}

/**
 * Extract client IP address from request
 * 
 * @param {Request} request - HTTP request
 * @returns {string} - Client IP address
 */
function getClientIP(request) {
  // Check various headers for IP address
  const headers = [
    'x-forwarded-for',
    'x-real-ip',
    'cf-connecting-ip', // Cloudflare
    'x-client-ip',
    'x-forwarded',
    'forwarded-for',
    'forwarded'
  ];

  for (const header of headers) {
    const value = request.headers.get(header);
    if (value) {
      // X-Forwarded-For can contain multiple IPs, take the first one
      const ip = value.split(',')[0].trim();
      if (validateIPAddress(ip)) {
        return ip;
      }
    }
  }

  // Fallback to connection remote address (may not be available in all environments)
  return 'unknown';
}

/**
 * Reset rate limit for a specific key (admin function)
 * 
 * @param {string} key - Rate limit key to reset
 */
export function resetRateLimit(key) {
  rateLimitStore.delete(key);
}

/**
 * Get rate limit statistics (for monitoring)
 * 
 * @returns {Object} - Rate limit statistics
 */
export function getRateLimitStats() {
  return rateLimitStore.getStats();
}

/**
 * Create rate limit response headers
 * 
 * @param {Object} rateLimitInfo - Rate limit information
 * @returns {Object} - Headers object
 */
export function createRateLimitHeaders(rateLimitInfo) {
  const config = RATE_LIMIT_CONFIGS[rateLimitInfo.type] || RATE_LIMIT_CONFIGS.general;
  
  return {
    'X-RateLimit-Limit': config.maxAttempts.toString(),
    'X-RateLimit-Remaining': rateLimitInfo.remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(rateLimitInfo.resetTime / 1000).toString()
  };
}