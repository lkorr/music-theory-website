/**
 * Shared Authentication Utilities for API Routes
 * 
 * This module provides reusable utilities for API route authentication,
 * validation, and error handling to eliminate code duplication.
 */

import { jwtVerify, SignJWT } from 'jose';
import { validateAuthCSRF, createCSRFErrorResponse } from './auth-csrf.js';
import { createRateLimitMiddleware } from './rateLimit.js';
import { applyAPISecurityHeaders } from './security-headers.js';
import { getClientIP } from './network-utils.js';
import { createAuditLog } from './supabase.js';
import { sanitizeUserAgent } from './validation.js';

// Type definitions
export interface AuthUser {
  id: string;
  email: string;
  role: string;
}

export interface AuthValidationResult {
  valid: boolean;
  user?: AuthUser;
  error?: string;
}

export interface ClientInfo {
  ip: string;
  userAgent: string;
}

export interface APIRequest extends Request {
  clientInfo?: ClientInfo;
  authUser?: AuthUser;
}

export interface ErrorContext {
  endpoint: string;
  clientInfo: ClientInfo;
  userId?: string;
  email?: string;
  userAgent?: string;
}

// JWT Configuration
if (!process.env.AUTH_SECRET) {
  throw new Error('AUTH_SECRET environment variable is required for JWT signing');
}
const JWT_SECRET = new TextEncoder().encode(process.env.AUTH_SECRET);

/**
 * Extract and sanitize client information from request
 */
export function getClientInfo(request: Request): ClientInfo {
  const ip = getClientIP(request);
  const userAgent = sanitizeUserAgent(request.headers.get('user-agent') || 'Unknown');
  
  return { ip, userAgent };
}

/**
 * Securely parse cookies from request header
 */
function parseSecureCookies(cookieHeader: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  
  // Validate cookie header format
  if (!cookieHeader || typeof cookieHeader !== 'string' || cookieHeader.length > 4096) {
    return cookies; // Return empty if invalid or too large
  }

  // Split and validate each cookie
  const cookiePairs = cookieHeader.split(';');
  
  for (const pair of cookiePairs) {
    const trimmed = pair.trim();
    
    // Skip empty or malformed pairs
    if (!trimmed || !trimmed.includes('=')) {
      continue;
    }

    const equalIndex = trimmed.indexOf('=');
    const name = trimmed.substring(0, equalIndex).trim();
    const value = trimmed.substring(equalIndex + 1).trim();

    // Validate cookie name and value
    if (isValidCookieName(name) && isValidCookieValue(value)) {
      cookies[name] = value;
    }
  }

  return cookies;
}

/**
 * Validate cookie name according to RFC 6265
 */
function isValidCookieName(name: string): boolean {
  // Cookie names should not be empty and contain only allowed characters
  if (!name || name.length > 255) return false;
  
  // Check for control characters, separators, and whitespace
  return !/[\x00-\x20\x22\x28\x29\x2C\x2F\x3A-\x40\x5B-\x5D\x7B\x7D\x7F]/.test(name);
}

/**
 * Validate cookie value according to RFC 6265
 */
function isValidCookieValue(value: string): boolean {
  // Cookie values can be empty but should not contain invalid characters
  if (value.length > 4096) return false; // Reasonable size limit
  
  // Check for control characters and quotes (unless properly quoted)
  if (value.startsWith('"') && value.endsWith('"') && value.length >= 2) {
    // Quoted cookie value - validate the content inside quotes
    const content = value.slice(1, -1);
    return !/[\x00-\x08\x0A-\x1F\x22\x7F]/.test(content);
  } else {
    // Unquoted cookie value
    return !/[\x00-\x20\x22\x2C\x3B\x5C\x7F]/.test(value);
  }
}

/**
 * Verify JWT token and extract user information
 */
export async function verifyAuthToken(request: Request): Promise<AuthValidationResult> {
  try {
    const cookieHeader = request.headers.get('cookie');
    if (!cookieHeader) {
      return { valid: false, error: 'No session found' };
    }

    const cookies = parseSecureCookies(cookieHeader);
    const token = cookies['auth-token'];
    
    if (!token) {
      return { valid: false, error: 'Authentication required' };
    }

    // Validate JWT token format before verification
    if (typeof token !== 'string' || token.length > 2048 || !/^[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+$/.test(token)) {
      return { valid: false, error: 'Invalid token format' };
    }

    const { payload } = await jwtVerify(token, JWT_SECRET, {
      issuer: 'midi-training-app',
      audience: 'midi-training-app-users'
    });

    // Strict validation of JWT payload
    if (!validateJWTPayload(payload)) {
      return { valid: false, error: 'Invalid token payload' };
    }

    return {
      valid: true,
      user: {
        id: payload.userId as string,
        email: payload.email as string,
        role: payload.role as string
      }
    };
  } catch (error) {
    // Log JWT verification errors for security monitoring
    console.warn('JWT verification failed:', error instanceof Error ? error.message : 'Unknown error');
    return { valid: false, error: 'Invalid session' };
  }
}

/**
 * Validate JWT payload structure and content
 */
function validateJWTPayload(payload: any): boolean {
  return (
    payload &&
    typeof payload === 'object' &&
    typeof payload.userId === 'string' &&
    typeof payload.email === 'string' &&
    typeof payload.role === 'string' &&
    payload.userId.length > 0 &&
    payload.userId.length <= 255 &&
    payload.email.length > 0 &&
    payload.email.length <= 255 &&
    payload.email.includes('@') &&
    payload.role.length > 0 &&
    payload.role.length <= 50 &&
    // Validate timestamp claims if present
    (!payload.iat || typeof payload.iat === 'number') &&
    (!payload.exp || typeof payload.exp === 'number') &&
    (!payload.nbf || typeof payload.nbf === 'number')
  );
}

/**
 * Generate JWT token for authenticated user
 */
export async function generateAuthToken(user: { id: string; email: string; role: string }): Promise<string> {
  try {
    const token = await new SignJWT({
      userId: user.id,
      email: user.email,
      role: user.role
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .setIssuer('midi-training-app')
      .setAudience('midi-training-app-users')
      .sign(JWT_SECRET);

    return token;
  } catch (error) {
    console.error('JWT generation error:', error);
    throw new Error('Failed to generate authentication token');
  }
}

/**
 * Apply rate limiting middleware to request
 */
export async function applyRateLimit(
  request: Request, 
  type: string,
  skipInDevelopment: boolean = true
): Promise<Response | null> {
  try {
    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    // Apply minimal rate limiting even in development to prevent abuse
    if (skipInDevelopment && useMockAuth && isDevelopment) {
      // Use relaxed rate limiting in development instead of completely bypassing
      const devRateLimitResult = await applyDevelopmentRateLimit(request, type);
      if (devRateLimitResult) {
        return devRateLimitResult;
      }
      return null;
    }

    const rateLimitMiddleware = createRateLimitMiddleware(type);
    const context = {};
    
    const result = await rateLimitMiddleware(request, context);
    
    if (result) {
      // Log rate limit exceeded
      const clientInfo = getClientInfo(request);
      await createAuditLog({
        action: 'SECURITY_ALERT',
        metadata: {
          error: 'Rate limit exceeded',
          endpoint: new URL(request.url).pathname,
          ip_address: clientInfo.ip,
          user_agent: clientInfo.userAgent,
          rate_limit_type: type
        },
        severity: 'WARN',
        category: 'security'
      });
      
      return result;
    }

    return null;
  } catch (error) {
    console.error('Rate limiting error:', error);
    return null; // Fail open
  }
}

/**
 * Apply relaxed rate limiting for development environments
 */
async function applyDevelopmentRateLimit(request: Request, type: string): Promise<Response | null> {
  const devLimits = {
    login: { maxRequests: 100, windowMs: 15 * 60 * 1000 }, // 100 requests per 15 minutes
    register: { maxRequests: 50, windowMs: 60 * 60 * 1000 }, // 50 requests per hour
    api: { maxRequests: 1000, windowMs: 60 * 1000 }, // 1000 requests per minute
    general: { maxRequests: 500, windowMs: 60 * 1000 } // 500 requests per minute
  };

  const limit = devLimits[type as keyof typeof devLimits] || devLimits.general;
  
  // Use a simple in-memory store for development rate limiting
  const key = `dev_${getClientIP(request)}:${type}`;
  const now = Date.now();
  
  // Clean up old entries periodically
  if (Math.random() < 0.1) { // 10% chance to clean up
    cleanupDevRateLimit();
  }

  const entry = devRateLimitStore.get(key);
  
  if (!entry) {
    devRateLimitStore.set(key, { count: 1, resetTime: now + limit.windowMs });
    return null;
  }

  if (now > entry.resetTime) {
    devRateLimitStore.set(key, { count: 1, resetTime: now + limit.windowMs });
    return null;
  }

  if (entry.count >= limit.maxRequests) {
    console.warn(`Development rate limit exceeded for ${key}`);
    return new Response(
      JSON.stringify({
        error: 'Rate limit exceeded (development mode)',
        code: 'SEC_002',
        retryAfter: Math.ceil((entry.resetTime - now) / 1000)
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': Math.ceil((entry.resetTime - now) / 1000).toString()
        }
      }
    );
  }

  entry.count++;
  return null;
}

// Simple in-memory store for development rate limiting
const devRateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Clean up expired development rate limit entries
 */
function cleanupDevRateLimit(): void {
  const now = Date.now();
  const entries = Array.from(devRateLimitStore.entries());
  for (const [key, entry] of entries) {
    if (now > entry.resetTime) {
      devRateLimitStore.delete(key);
    }
  }
}

/**
 * Validate CSRF token for authenticated requests
 */
export async function validateCSRFToken(request: Request): Promise<Response | null> {
  try {
    const clientInfo = getClientInfo(request);
    const csrfValidation = await validateAuthCSRF(request, clientInfo.ip);
    
    if (!csrfValidation.valid) {
      return createCSRFErrorResponse(csrfValidation.error || 'CSRF validation failed');
    }

    return null; // CSRF validation passed
  } catch (error) {
    console.error('CSRF validation error:', error);
    return createCSRFErrorResponse('CSRF validation failed');
  }
}

/**
 * Parse and validate JSON request body with size limits and timeout protection
 */
export async function parseJSONBody<T>(
  request: Request, 
  context: ErrorContext,
  options: {
    maxSize?: number;
    timeout?: number;
  } = {}
): Promise<{ data: T } | { error: Response }> {
  const { maxSize = 1024 * 1024, timeout = 10000 } = options; // 1MB default, 10s timeout

  try {
    // Check Content-Length header first
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > maxSize) {
      await createAuditLog({
        action: 'SECURITY_ALERT',
        metadata: {
          error: 'Request body too large',
          content_length: contentLength,
          max_size: maxSize,
          ip_address: context.clientInfo.ip,
          user_agent: context.clientInfo.userAgent,
          endpoint: context.endpoint
        },
        severity: 'WARN',
        category: 'security'
      });

      return {
        error: new Response(
          JSON.stringify({ 
            error: 'Request body too large',
            code: 'VAL_002',
            maxSize: maxSize 
          }),
          {
            status: 413,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      };
    }

    // Create timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), timeout);
    });

    // Parse JSON with timeout protection
    const parsePromise = parseJSONWithSizeLimit(request, maxSize);
    const data = await Promise.race([parsePromise, timeoutPromise]) as T;

    return { data };
  } catch (error) {
    let errorMessage = 'Invalid request format';
    let statusCode = 400;
    let errorCode = 'VAL_001';

    if (error instanceof Error) {
      if (error.message === 'Request timeout') {
        errorMessage = 'Request timeout';
        statusCode = 408;
        errorCode = 'SYS_002';
      } else if (error.message.includes('Body size limit exceeded')) {
        errorMessage = 'Request body too large';
        statusCode = 413;
        errorCode = 'VAL_002';
      }
    }

    await createAuditLog({
      action: 'SECURITY_ALERT',
      metadata: {
        error: errorMessage,
        error_details: error instanceof Error ? error.message : 'Unknown error',
        ip_address: context.clientInfo.ip,
        user_agent: context.clientInfo.userAgent,
        endpoint: context.endpoint,
        max_size: maxSize,
        timeout: timeout
      },
      severity: 'WARN',
      category: 'security'
    });

    return {
      error: new Response(
        JSON.stringify({ 
          error: errorMessage,
          code: errorCode,
          requestId: generateRequestId()
        }),
        {
          status: statusCode,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    };
  }
}

/**
 * Parse JSON with streaming size limit protection
 */
async function parseJSONWithSizeLimit<T>(request: Request, maxSize: number): Promise<T> {
  const reader = request.body?.getReader();
  if (!reader) {
    throw new Error('No request body');
  }

  let totalSize = 0;
  const chunks: Uint8Array[] = [];

  try {
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        break;
      }

      totalSize += value.length;
      if (totalSize > maxSize) {
        reader.cancel();
        throw new Error('Body size limit exceeded');
      }

      chunks.push(value);
    }

    // Combine chunks and decode
    const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const combined = new Uint8Array(totalLength);
    let offset = 0;
    
    for (const chunk of chunks) {
      combined.set(chunk, offset);
      offset += chunk.length;
    }

    const text = new TextDecoder('utf-8').decode(combined);
    return JSON.parse(text);
  } finally {
    reader.releaseLock();
  }
}

// Security error codes for consistent responses
const SECURITY_ERROR_CODES = {
  AUTHENTICATION_REQUIRED: 'AUTH_001',
  INVALID_CREDENTIALS: 'AUTH_002',
  ACCOUNT_LOCKED: 'AUTH_003',
  CSRF_VALIDATION_FAILED: 'SEC_001',
  RATE_LIMIT_EXCEEDED: 'SEC_002',
  VALIDATION_FAILED: 'VAL_001',
  INSUFFICIENT_PRIVILEGES: 'AUTH_004',
  SYSTEM_ERROR: 'SYS_001'
} as const;

/**
 * Sanitize error message based on environment and error type
 */
function sanitizeErrorMessage(error: string, status: number, isProduction: boolean): string {
  // In production, use generic messages for server errors to prevent information disclosure
  if (isProduction && status >= 500) {
    return 'Internal server error';
  }

  // Sanitize potentially sensitive information
  const sanitized = error
    .replace(/password/gi, '[REDACTED]')
    .replace(/token/gi, '[REDACTED]')
    .replace(/secret/gi, '[REDACTED]')
    .replace(/key/gi, '[REDACTED]')
    .replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, '[IP]') // Remove IP addresses
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL]'); // Remove email addresses

  return sanitized;
}

/**
 * Get appropriate error code for common error types
 */
function getErrorCode(error: string, auditAction: string): string {
  const lowerError = error.toLowerCase();
  const lowerAction = auditAction.toLowerCase();

  if (lowerAction.includes('authentication') || lowerError.includes('authentication required')) {
    return SECURITY_ERROR_CODES.AUTHENTICATION_REQUIRED;
  }
  if (lowerError.includes('invalid') && (lowerError.includes('email') || lowerError.includes('password'))) {
    return SECURITY_ERROR_CODES.INVALID_CREDENTIALS;
  }
  if (lowerError.includes('locked')) {
    return SECURITY_ERROR_CODES.ACCOUNT_LOCKED;
  }
  if (lowerError.includes('csrf')) {
    return SECURITY_ERROR_CODES.CSRF_VALIDATION_FAILED;
  }
  if (lowerError.includes('rate limit')) {
    return SECURITY_ERROR_CODES.RATE_LIMIT_EXCEEDED;
  }
  if (lowerError.includes('validation')) {
    return SECURITY_ERROR_CODES.VALIDATION_FAILED;
  }

  return SECURITY_ERROR_CODES.SYSTEM_ERROR;
}

/**
 * Create standardized error responses with audit logging
 */
export async function createErrorResponse(
  error: string,
  status: number,
  context: ErrorContext,
  auditAction: string = 'API_ERROR',
  auditSeverity: 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL' = 'ERROR'
): Promise<Response> {
  const isProduction = process.env.NODE_ENV === 'production';
  const sanitizedError = sanitizeErrorMessage(error, status, isProduction);
  const errorCode = getErrorCode(error, auditAction);

  // Generate request ID for error tracking
  const requestId = generateRequestId();

  // Log the error with full details (internal logging)
  await createAuditLog({
    user_id: context.userId,
    action: auditAction,
    metadata: {
      error: error, // Log original error internally
      sanitized_error: sanitizedError,
      error_code: errorCode,
      request_id: requestId,
      endpoint: context.endpoint,
      ip_address: context.clientInfo.ip,
      user_agent: context.clientInfo.userAgent,
      email: context.email,
      status_code: status
    },
    severity: auditSeverity,
    category: 'api'
  });

  // Return sanitized error to client
  const responseBody = {
    error: sanitizedError,
    code: errorCode,
    requestId: requestId,
    timestamp: new Date().toISOString()
  };

  return new Response(
    JSON.stringify(responseBody),
    {
      status,
      headers: { 
        'Content-Type': 'application/json',
        'X-Request-ID': requestId,
        'Cache-Control': 'no-store, no-cache, must-revalidate, private'
      }
    }
  );
}

/**
 * Generate unique request ID for error correlation
 */
function generateRequestId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 15);
  return `req_${timestamp}_${randomPart}`;
}

/**
 * Create secure authentication cookie
 */
export function createAuthCookie(token: string): string {
  const cookieOptions = [
    'HttpOnly',
    // Only set Secure flag in production (HTTPS)
    ...(process.env.NODE_ENV === 'production' ? ['Secure'] : []),
    'SameSite=Strict',
    `Max-Age=${7 * 24 * 60 * 60}`, // 7 days
    'Path=/'
  ];

  return `auth-token=${token}; ${cookieOptions.join('; ')}`;
}

/**
 * Create success response with security headers
 */
export function createSuccessResponse<T>(
  data: T,
  status: number = 200,
  additionalHeaders: Record<string, string> = {}
): Response {
  const response = new Response(
    JSON.stringify(data),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
        ...additionalHeaders
      }
    }
  );

  return applyAPISecurityHeaders(response);
}

/**
 * Handle method not allowed responses
 */
export function createMethodNotAllowedResponse(allowedMethods: string[] = ['POST']): Response {
  return new Response(
    JSON.stringify({ error: 'Method not allowed' }),
    {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        'Allow': allowedMethods.join(', ')
      }
    }
  );
}

/**
 * Comprehensive authentication and security middleware with atomic validation
 * 
 * This function combines all common authentication checks atomically:
 * - Rate limiting
 * - CSRF validation (integrated with JWT verification)
 * - JWT verification
 * - Client info extraction
 */
export async function validateAuthenticatedRequest(
  request: Request,
  options: {
    rateLimitType?: string;
    requireCSRF?: boolean;
    skipRateLimitInDev?: boolean;
  } = {}
): Promise<
  | { success: true; user: AuthUser; clientInfo: ClientInfo; csrfToken?: string }
  | { success: false; error: Response }
> {
  const {
    rateLimitType = 'api',
    requireCSRF = true,
    skipRateLimitInDev = true
  } = options;

  try {
    const clientInfo = getClientInfo(request);
    const endpoint = new URL(request.url).pathname;

    // Apply rate limiting
    if (rateLimitType) {
      const rateLimitResult = await applyRateLimit(request, rateLimitType, skipRateLimitInDev);
      if (rateLimitResult) {
        return { success: false, error: rateLimitResult };
      }
    }

    // Perform atomic JWT + CSRF validation
    const authResult = await validateJWTAndCSRF(request, requireCSRF);
    if (!authResult.success) {
      const errorMessage = (authResult as { success: false; error: string }).error || 'Authentication failed';
      const errorResponse = await createErrorResponse(
        errorMessage,
        401,
        { endpoint, clientInfo },
        'AUTHENTICATION_FAILED',
        'WARN'
      );
      return { success: false, error: errorResponse };
    }

    return {
      success: true,
      user: authResult.user,
      clientInfo,
      csrfToken: authResult.csrfToken
    };
  } catch (error) {
    console.error('Authentication middleware error:', error);
    
    const errorResponse = new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        code: 'SYS_001',
        requestId: generateRequestId()
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );

    return { success: false, error: errorResponse };
  }
}

/**
 * Atomic JWT and CSRF validation to prevent race conditions
 */
async function validateJWTAndCSRF(
  request: Request,
  requireCSRF: boolean
): Promise<
  | { success: true; user: AuthUser; csrfToken?: string }
  | { success: false; error: string }
> {
  try {
    // Extract cookies and headers atomically
    const cookieHeader = request.headers.get('cookie');
    const csrfHeader = request.headers.get('x-csrf-token');
    
    if (!cookieHeader) {
      return { success: false, error: 'No session found' };
    }

    const cookies = parseSecureCookies(cookieHeader);
    const token = cookies['auth-token'];
    
    if (!token) {
      return { success: false, error: 'Authentication required' };
    }

    // Validate JWT token format
    if (typeof token !== 'string' || token.length > 2048 || 
        !/^[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+$/.test(token)) {
      return { success: false, error: 'Invalid token format' };
    }

    // Verify JWT token
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      issuer: 'midi-training-app',
      audience: 'midi-training-app-users'
    });

    // Strict validation of JWT payload
    if (!validateJWTPayload(payload)) {
      return { success: false, error: 'Invalid token payload' };
    }

    const user: AuthUser = {
      id: payload.userId as string,
      email: payload.email as string,
      role: payload.role as string
    };

    // Validate CSRF token if required (using the user ID from JWT)
    if (requireCSRF && !['GET', 'HEAD', 'OPTIONS'].includes(request.method.toUpperCase())) {
      if (!csrfHeader) {
        return { success: false, error: 'CSRF token required' };
      }

      // Import CSRF validation function
      const { validateCSRFToken: validateCSRFTokenInternal } = await import('./csrf.js');
      
      // Validate CSRF token against the user session
      const csrfValid = validateCSRFTokenInternal(csrfHeader, user.id);
      if (!csrfValid) {
        return { success: false, error: 'Invalid CSRF token' };
      }

      return {
        success: true,
        user,
        csrfToken: csrfHeader
      };
    }

    return {
      success: true,
      user
    };
  } catch (error) {
    console.warn('JWT/CSRF validation failed:', error instanceof Error ? error.message : 'Unknown error');
    return { success: false, error: 'Invalid session' };
  }
}

/**
 * Log successful authentication events
 */
export async function logSuccessfulAuth(
  action: string,
  user: AuthUser,
  clientInfo: ClientInfo,
  metadata: Record<string, any> = {}
): Promise<void> {
  await createAuditLog({
    user_id: user.id,
    action,
    metadata: {
      email: user.email,
      ip_address: clientInfo.ip,
      user_agent: clientInfo.userAgent,
      timestamp: new Date().toISOString(),
      ...metadata
    },
    severity: 'INFO',
    category: 'auth'
  });
}

/**
 * Enhanced security event logging with threat detection
 */
export async function logSecurityEvent(
  event: {
    action: string;
    severity: 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL';
    category: 'security' | 'auth' | 'api';
    metadata: Record<string, any>;
    userId?: string;
    clientInfo: ClientInfo;
  }
): Promise<void> {
  const enhancedMetadata = {
    ...event.metadata,
    timestamp: new Date().toISOString(),
    request_id: generateRequestId(),
    ip_address: event.clientInfo.ip,
    user_agent: event.clientInfo.userAgent,
    // Add threat indicators
    threat_score: calculateThreatScore(event),
    session_context: {
      is_suspicious: isSuspiciousActivity(event),
      risk_factors: identifyRiskFactors(event)
    }
  };

  await createAuditLog({
    user_id: event.userId,
    action: event.action,
    metadata: enhancedMetadata,
    severity: event.severity,
    category: event.category
  });

  // Additional alerting for high-severity events
  if (event.severity === 'CRITICAL' || enhancedMetadata.threat_score >= 8) {
    console.error(`HIGH SEVERITY SECURITY EVENT: ${event.action}`, {
      threat_score: enhancedMetadata.threat_score,
      ip: event.clientInfo.ip,
      metadata: event.metadata
    });
  }
}

/**
 * Calculate threat score based on activity patterns
 */
function calculateThreatScore(event: { action: string; metadata: Record<string, any>; clientInfo: ClientInfo }): number {
  let score = 0;

  // Base scores by event type
  const eventScores: Record<string, number> = {
    'SECURITY_ALERT': 5,
    'AUTHENTICATION_FAILED': 3,
    'USER_LOGIN_FAILED': 3,
    'CSRF_VALIDATION_FAILED': 6,
    'RATE_LIMIT_EXCEEDED': 4,
    'INVALID_TOKEN_FORMAT': 7,
    'SUSPICIOUS_REQUEST': 8,
    'BRUTE_FORCE_ATTEMPT': 9
  };

  score += eventScores[event.action] || 1;

  // User agent analysis
  const userAgent = event.clientInfo.userAgent.toLowerCase();
  if (userAgent.includes('bot') || userAgent.includes('crawler') || userAgent.includes('scan')) {
    score += 3;
  }
  if (userAgent === 'unknown' || userAgent.length < 10) {
    score += 2;
  }

  // Request patterns
  if (event.metadata.error_message?.includes('injection') || 
      event.metadata.error_message?.includes('script') ||
      event.metadata.error_message?.includes('xss')) {
    score += 5;
  }

  // Rate limiting violations
  if (event.action === 'RATE_LIMIT_EXCEEDED') {
    const attempts = event.metadata.attempts || 0;
    if (attempts > 100) score += 3;
    if (attempts > 500) score += 5;
  }

  return Math.min(score, 10); // Cap at 10
}

/**
 * Identify suspicious activity patterns
 */
function isSuspiciousActivity(event: { action: string; metadata: Record<string, any> }): boolean {
  const suspiciousPatterns = [
    'SQL_INJECTION_ATTEMPT',
    'XSS_ATTEMPT',
    'DIRECTORY_TRAVERSAL',
    'COMMAND_INJECTION',
    'BRUTE_FORCE_ATTEMPT'
  ];

  if (suspiciousPatterns.includes(event.action)) {
    return true;
  }

  // Check for suspicious content in metadata
  const suspiciousContent = JSON.stringify(event.metadata).toLowerCase();
  const suspiciousKeywords = [
    'union select', 'drop table', '<script>', 'javascript:', 'eval(',
    '../', '..\\', 'cmd.exe', '/bin/sh', 'whoami'
  ];

  return suspiciousKeywords.some(keyword => suspiciousContent.includes(keyword));
}

/**
 * Identify risk factors in the request
 */
function identifyRiskFactors(event: { action: string; metadata: Record<string, any>; clientInfo: ClientInfo }): string[] {
  const riskFactors: string[] = [];

  // IP-based risks
  if (event.clientInfo.ip === 'unknown') {
    riskFactors.push('unknown_ip');
  }

  // User agent risks
  const userAgent = event.clientInfo.userAgent;
  if (userAgent.includes('bot') || userAgent.includes('crawler')) {
    riskFactors.push('automated_client');
  }
  if (userAgent === 'unknown' || userAgent.length < 10) {
    riskFactors.push('suspicious_user_agent');
  }

  // Request size risks
  if (event.metadata.content_length && parseInt(event.metadata.content_length) > 1024 * 1024) {
    riskFactors.push('large_request_body');
  }

  // Error pattern risks
  if (event.action.includes('FAILED') && event.metadata.attempts > 10) {
    riskFactors.push('multiple_failures');
  }

  return riskFactors;
}

/**
 * Universal error handler for API routes with enhanced security logging
 */
export async function handleAPIError(
  error: unknown,
  context: ErrorContext,
  defaultMessage: string = 'Internal server error'
): Promise<Response> {
  console.error(`API Error in ${context.endpoint}:`, error);

  // Enhanced security logging
  await logSecurityEvent({
    action: 'SECURITY_ALERT',
    severity: 'CRITICAL',
    category: 'security',
    metadata: {
      error: 'API system error',
      error_message: error instanceof Error ? error.message : 'Unknown error',
      error_stack: error instanceof Error ? error.stack : undefined,
      error_type: error?.constructor?.name || 'Unknown',
      endpoint: context.endpoint,
      user_id: context.userId,
      email: context.email
    },
    userId: context.userId,
    clientInfo: context.clientInfo
  });

  const requestId = generateRequestId();

  return new Response(
    JSON.stringify({ 
      error: defaultMessage,
      code: 'SYS_001',
      requestId: requestId
    }),
    {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'X-Request-ID': requestId
      }
    }
  );
}