/**
 * CSRF Protection Utilities for Authentication Endpoints
 * 
 * Provides CSRF validation specifically for authentication routes
 * that don't have existing JWT sessions.
 */

import { validateCSRFToken, generateCSRFToken } from './csrf.js';
import { createAuditLog } from './supabase.js';

export interface CSRFValidationResult {
  valid: boolean;
  error?: string;
}

export interface AuditLogMetadata {
  error: string;
  ip_address: string;
  user_agent: string;
  endpoint: string;
  error_message?: string;
}

export interface AuditLogEntry {
  action: string;
  metadata: AuditLogMetadata;
  severity: 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL';
  category: string;
}

/**
 * Validate CSRF token for authentication endpoints
 * For endpoints like login/register that don't have existing sessions,
 * we use a temporary session ID from the client or IP address
 */
export async function validateAuthCSRF(
  request: Request, 
  clientIP: string
): Promise<CSRFValidationResult> {
  try {
    // Skip CSRF check for safe methods
    const method = request.method.toLowerCase();
    if (['get', 'head', 'options'].includes(method)) {
      return { valid: true };
    }

    // Skip in development with mock auth
    if (process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development') {
      return { valid: true };
    }

    // Check for CSRF token in header
    const csrfToken = request.headers.get('x-csrf-token');
    if (!csrfToken) {
      await createAuditLog({
        action: 'SECURITY_ALERT',
        metadata: {
          error: 'Missing CSRF token in authentication request',
          ip_address: clientIP,
          user_agent: request.headers.get('user-agent') || 'Unknown',
          endpoint: new URL(request.url).pathname
        },
        severity: 'WARN',
        category: 'security'
      });
      
      return { 
        valid: false, 
        error: 'CSRF token required' 
      };
    }

    // For auth endpoints, use a temporary session ID from client IP and user agent
    // This provides some CSRF protection while not requiring existing session
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const temporarySessionId = `auth_${clientIP}_${userAgent.slice(0, 50)}`;

    const isValid = validateCSRFToken(csrfToken, temporarySessionId);
    
    if (!isValid) {
      await createAuditLog({
        action: 'SECURITY_ALERT',
        metadata: {
          error: 'Invalid CSRF token in authentication request',
          ip_address: clientIP,
          user_agent: userAgent,
          endpoint: new URL(request.url).pathname
        },
        severity: 'WARN',
        category: 'security'
      });
      
      return { 
        valid: false, 
        error: 'Invalid or expired CSRF token' 
      };
    }

    return { valid: true };

  } catch (error) {
    console.error('Auth CSRF validation error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    await createAuditLog({
      action: 'SECURITY_ALERT',
      metadata: {
        error: 'CSRF validation system error',
        error_message: errorMessage,
        ip_address: clientIP,
        endpoint: new URL(request.url).pathname,
        user_agent: request.headers.get('user-agent') || 'unknown'
      },
      severity: 'ERROR',
      category: 'security'
    });
    
    // Fail secure - reject on error
    return { 
      valid: false, 
      error: 'CSRF validation failed' 
    };
  }
}

/**
 * Generate CSRF token for pre-authentication requests
 * Uses client IP and user agent as temporary session identifier
 */
export function generateAuthCSRFToken(
  clientIP: string, 
  userAgent: string = 'unknown'
): string {
  const temporarySessionId = `auth_${clientIP}_${userAgent.slice(0, 50)}`;
  return generateCSRFToken(temporarySessionId);
}

/**
 * Create CSRF error response
 */
export function createCSRFErrorResponse(
  message: string, 
  status: number = 403
): Response {
  return new Response(
    JSON.stringify({ 
      error: message,
      code: 'CSRF_VALIDATION_FAILED'
    }),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'Cache-Control': 'no-store, no-cache, must-revalidate, private'
      }
    }
  );
}