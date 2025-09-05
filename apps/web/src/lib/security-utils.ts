/**
 * Consolidated Security Utilities
 * 
 * This module provides a unified interface for all security-related utilities
 * including headers, CSRF protection, IP handling, and security middleware.
 */

// Re-export existing security utilities
export * from './security-headers.js';
export * from './network-utils.js';
export * from './csrf.js';
export * from './auth-csrf.js';
export * from './rateLimit.js';

// Import for additional utilities
import { applyAPISecurityHeaders, generateNonce, isValidOrigin } from './security-headers.js';
import { getClientIP, parseUserAgent, sanitizeIPForLogging } from './network-utils.js';
import { generateCSRFToken, validateCSRFToken } from './csrf.js';
import { checkRateLimit, RATE_LIMIT_CONFIGS } from './rateLimit.js';
import { createAuditLog } from './supabase.js';

// Type definitions for security utilities
export interface SecurityValidationResult {
  valid: boolean;
  error?: string;
  details?: Record<string, any>;
}

export interface SecurityContext {
  ip: string;
  userAgent: string;
  origin?: string;
  method: string;
  endpoint: string;
  userId?: string;
}

export interface SecurityMiddlewareOptions {
  requireCSRF?: boolean;
  rateLimitType?: string;
  allowedOrigins?: string[];
  skipInDevelopment?: boolean;
  logSecurityEvents?: boolean;
}

export interface SecurityAuditEvent {
  action: string;
  severity: 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL';
  category: 'security' | 'auth' | 'api';
  metadata: Record<string, any>;
  userId?: string;
}

/**
 * Extract comprehensive security context from request
 */
export function getSecurityContext(request: Request): SecurityContext {
  const ip = getClientIP(request);
  const userAgent = parseUserAgent(request.headers.get('user-agent')).sanitized;
  const origin = request.headers.get('origin') || undefined;
  const method = request.method.toUpperCase();
  const endpoint = new URL(request.url).pathname;

  return {
    ip,
    userAgent,
    origin,
    method,
    endpoint
  };
}

/**
 * Comprehensive security validation for API requests
 */
export async function validateRequestSecurity(
  request: Request,
  options: SecurityMiddlewareOptions = {}
): Promise<SecurityValidationResult> {
  const {
    requireCSRF = false,
    rateLimitType = 'api',
    allowedOrigins = [],
    skipInDevelopment = true,
    logSecurityEvents = true
  } = options;

  const context = getSecurityContext(request);
  const isDevelopment = process.env.NODE_ENV === 'development' && skipInDevelopment;

  try {
    // 1. Origin validation (if CORS is required)
    if (allowedOrigins.length > 0 && !isValidOrigin(request, allowedOrigins)) {
      if (logSecurityEvents) {
        await logSecurityEvent({
          action: 'SECURITY_VIOLATION',
          severity: 'WARN',
          category: 'security',
          metadata: {
            violation_type: 'invalid_origin',
            origin: context.origin,
            allowed_origins: allowedOrigins,
            endpoint: context.endpoint,
            ip: sanitizeIPForLogging(context.ip)
          }
        });
      }

      return {
        valid: false,
        error: 'Invalid origin',
        details: { violationType: 'invalid_origin' }
      };
    }

    // 2. Rate limiting
    if (rateLimitType && !isDevelopment) {
      const rateLimitKey = `${sanitizeIPForLogging(context.ip)}:${rateLimitType}`;
      const config = RATE_LIMIT_CONFIGS[rateLimitType] || RATE_LIMIT_CONFIGS.general;
      const rateLimitResult = checkRateLimit(rateLimitKey, config);

      if (!rateLimitResult.allowed) {
        if (logSecurityEvents) {
          await logSecurityEvent({
            action: 'SECURITY_VIOLATION',
            severity: 'WARN',
            category: 'security',
            metadata: {
              violation_type: 'rate_limit_exceeded',
              rate_limit_type: rateLimitType,
              attempts: rateLimitResult.attempts,
              blocked_until: rateLimitResult.blockedUntil,
              endpoint: context.endpoint,
              ip: sanitizeIPForLogging(context.ip)
            }
          });
        }

        return {
          valid: false,
          error: rateLimitResult.message || 'Rate limit exceeded',
          details: {
            violationType: 'rate_limit_exceeded',
            retryAfter: rateLimitResult.retryAfter
          }
        };
      }
    }

    // 3. CSRF validation (for state-changing requests)
    if (requireCSRF && !['GET', 'HEAD', 'OPTIONS'].includes(context.method)) {
      const csrfToken = request.headers.get('x-csrf-token');
      if (!csrfToken) {
        if (logSecurityEvents) {
          await logSecurityEvent({
            action: 'SECURITY_VIOLATION',
            severity: 'WARN',
            category: 'security',
            metadata: {
              violation_type: 'missing_csrf_token',
              endpoint: context.endpoint,
              method: context.method,
              ip: sanitizeIPForLogging(context.ip)
            }
          });
        }

        return {
          valid: false,
          error: 'CSRF token required',
          details: { violationType: 'missing_csrf_token' }
        };
      }

      // Note: For full CSRF validation, we'd need session ID from JWT
      // This is a simplified check - actual implementation should extract sessionId from JWT
    }

    return { valid: true };

  } catch (error) {
    console.error('Security validation error:', error);
    
    if (logSecurityEvents) {
      await logSecurityEvent({
        action: 'SECURITY_ALERT',
        severity: 'ERROR',
        category: 'security',
        metadata: {
          error: 'Security validation system error',
          error_message: error instanceof Error ? error.message : 'Unknown error',
          endpoint: context.endpoint,
          ip: sanitizeIPForLogging(context.ip)
        }
      });
    }

    return {
      valid: false,
      error: 'Security validation failed',
      details: { violationType: 'system_error' }
    };
  }
}

/**
 * Create secure response with all security headers applied
 */
export function createSecureAPIResponse<T>(
  data: T,
  status: number = 200,
  options: {
    headers?: Record<string, string>;
    nonce?: string;
    cors?: {
      origin?: string;
      credentials?: boolean;
      methods?: string[];
    };
  } = {}
): Response {
  const response = new Response(
    JSON.stringify(data),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    }
  );

  // Apply security headers
  const secureResponse = applyAPISecurityHeaders(response);

  // Apply CORS if specified
  if (options.cors) {
    if (options.cors.origin) {
      secureResponse.headers.set('Access-Control-Allow-Origin', options.cors.origin);
    }
    if (options.cors.credentials) {
      secureResponse.headers.set('Access-Control-Allow-Credentials', 'true');
    }
    if (options.cors.methods) {
      secureResponse.headers.set('Access-Control-Allow-Methods', options.cors.methods.join(', '));
    }
  }

  return secureResponse;
}

/**
 * Create secure error response with proper logging
 */
export async function createSecureErrorResponse(
  error: string,
  status: number,
  context: SecurityContext,
  options: {
    logEvent?: boolean;
    auditAction?: string;
    auditSeverity?: 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL';
    hideDetails?: boolean;
  } = {}
): Promise<Response> {
  const {
    logEvent = true,
    auditAction = 'API_ERROR',
    auditSeverity = 'ERROR',
    hideDetails = false
  } = options;

  if (logEvent) {
    await logSecurityEvent({
      action: auditAction,
      severity: auditSeverity,
      category: 'api',
      metadata: {
        error: hideDetails ? 'Error occurred' : error,
        status_code: status,
        endpoint: context.endpoint,
        method: context.method,
        ip: sanitizeIPForLogging(context.ip),
        user_agent: context.userAgent
      },
      userId: context.userId
    });
  }

  const responseData = {
    error: hideDetails && status >= 500 ? 'Internal server error' : error,
    ...(status === 429 ? { retryAfter: 60 } : {}), // Add retry after for rate limits
    timestamp: new Date().toISOString(),
    requestId: generateRequestId()
  };

  return createSecureAPIResponse(responseData, status);
}

/**
 * Security event logging with proper audit trail
 */
export async function logSecurityEvent(event: SecurityAuditEvent): Promise<void> {
  try {
    await createAuditLog({
      user_id: event.userId,
      action: event.action,
      metadata: {
        ...event.metadata,
        timestamp: new Date().toISOString(),
        security_event: true
      },
      severity: event.severity,
      category: event.category
    });
  } catch (error) {
    console.error('Failed to log security event:', error);
    // Don't throw - security logging failure shouldn't break the request
  }
}

/**
 * Generate unique request ID for correlation
 */
export function generateRequestId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 15);
  return `req_${timestamp}_${randomPart}`;
}

/**
 * Security headers factory for different response types
 */
export class SecurityHeaders {
  private static baseHeaders = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  };

  static forAPI(): Record<string, string> {
    return {
      ...this.baseHeaders,
      'Cache-Control': 'no-store, no-cache, must-revalidate, private',
      'Pragma': 'no-cache'
    };
  }

  static forStaticAssets(): Record<string, string> {
    return {
      ...this.baseHeaders,
      'Cache-Control': 'public, max-age=31536000, immutable'
    };
  }

  static forPages(nonce?: string): Record<string, string> {
    return {
      ...this.baseHeaders,
      'Content-Security-Policy': this.generatePageCSP(nonce),
      ...(process.env.NODE_ENV === 'production' ? {
        'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload'
      } : {})
    };
  }

  private static generatePageCSP(nonce?: string): string {
    const isDev = process.env.NODE_ENV === 'development';
    
    return [
      "default-src 'self'",
      `script-src 'self' ${nonce ? `'nonce-${nonce}'` : ''} ${isDev ? "'unsafe-eval' 'unsafe-inline'" : ''}`,
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https:",
      "connect-src 'self' https://*.supabase.co",
      "frame-src 'none'",
      "object-src 'none'",
      "base-uri 'self'"
    ].filter(Boolean).join('; ');
  }
}

/**
 * Security middleware wrapper for API routes
 */
export async function withSecurity<T>(
  handler: (request: Request, context: SecurityContext) => Promise<T>,
  options: SecurityMiddlewareOptions = {}
): Promise<(request: Request) => Promise<Response>> {
  return async (request: Request): Promise<Response> => {
    try {
      const context = getSecurityContext(request);

      // Apply security validation
      const securityResult = await validateRequestSecurity(request, options);
      if (!securityResult.valid) {
        return await createSecureErrorResponse(
          securityResult.error || 'Security validation failed',
          securityResult.details?.violationType === 'rate_limit_exceeded' ? 429 : 403,
          context,
          {
            auditAction: 'SECURITY_VIOLATION',
            auditSeverity: 'WARN'
          }
        );
      }

      // Execute the handler
      const result = await handler(request, context);

      // If result is already a Response, return it with security headers
      if (result instanceof Response) {
        return applyAPISecurityHeaders(result);
      }

      // Otherwise, create a secure response
      return createSecureAPIResponse(result);

    } catch (error) {
      console.error('Security middleware error:', error);
      
      const context = getSecurityContext(request);
      return await createSecureErrorResponse(
        'Internal server error',
        500,
        context,
        {
          auditAction: 'SECURITY_ALERT',
          auditSeverity: 'CRITICAL',
          hideDetails: true
        }
      );
    }
  };
}

/**
 * Input sanitization utilities
 */
export class SecuritySanitizer {
  /**
   * Sanitize HTML input to prevent XSS
   */
  static sanitizeHTML(input: string): string {
    return input
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
      .trim();
  }

  /**
   * Sanitize SQL input to prevent injection
   */
  static sanitizeSQL(input: string): string {
    return input
      .replace(/[';\\]/g, '')
      .replace(/--/g, '')
      .replace(/\/\*/g, '')
      .replace(/\*\//g, '')
      .trim();
  }

  /**
   * Sanitize file path to prevent directory traversal
   */
  static sanitizeFilePath(path: string): string {
    return path
      .replace(/\.\./g, '')
      .replace(/[<>:|*?]/g, '')
      .replace(/^\/+/, '')
      .replace(/\/+/g, '/')
      .trim();
  }
}

// Export security constants
export const SECURITY_CONSTANTS = {
  CSRF_TOKEN_MAX_AGE: 60 * 60 * 1000, // 1 hour
  REQUEST_ID_LENGTH: 20,
  MAX_USER_AGENT_LENGTH: 500,
  MAX_IP_LOG_RETENTION: 30 * 24 * 60 * 60 * 1000, // 30 days
  DEFAULT_RATE_LIMIT: 100,
  SECURITY_HEADER_MAX_AGE: 31536000 // 1 year
} as const;