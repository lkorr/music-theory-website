/**
 * User Registration API Endpoint
 * 
 * SECURITY: This endpoint implements secure user registration with comprehensive
 * validation, rate limiting, and audit logging.
 */

import { validateRegistrationData } from '../../../../lib/validation.js';
import { hashPassword, validatePasswordStrength } from '../../../../lib/password.js';
import { createUser, createAuditLog } from '../../../../lib/supabase.js';
import { createRateLimitMiddleware, createRateLimitHeaders } from '../../../../lib/rateLimit.js';
import { validateAuthCSRF, createCSRFErrorResponse } from '../../../../lib/auth-csrf.ts';
import { getClientIP } from '../../../../lib/network-utils.ts';

/**
 * Handle user registration
 * 
 * @param {Request} request - HTTP request object
 * @returns {Response} - HTTP response
 */
export async function POST(request) {
  const startTime = Date.now();
  let clientIP = 'unknown';
  let userAgent = 'unknown';

  try {
    // Extract client information for logging
    clientIP = getClientIP(request);
    userAgent = request.headers.get('user-agent') || 'Unknown';

    // Apply rate limiting (skip in development with mock auth)
    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    if (!useMockAuth) {
      const rateLimitResult = await applyRateLimit(request, 'register');
      if (rateLimitResult) {
        return rateLimitResult; // Rate limit exceeded
      }
    }

    // Validate CSRF token
    const csrfValidation = await validateAuthCSRF(request, clientIP);
    if (!csrfValidation.valid) {
      return createCSRFErrorResponse(csrfValidation.error || 'CSRF validation failed');
    }

    // Parse request body
    let requestData;
    try {
      requestData = await request.json();
    } catch (error) {
      
      await createAuditLog({
        action: 'SECURITY_ALERT',
        metadata: {
          error: 'Invalid JSON in registration request',
          ip_address: clientIP,
          user_agent: userAgent,
          error_details: error.message
        },
        severity: 'WARN',
        category: 'security'
      });

      return new Response(
        JSON.stringify({ error: 'Invalid request format' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate and sanitize registration data
    const validation = validateRegistrationData(requestData);
    if (!validation.isValid) {
      await createAuditLog({
        action: 'USER_REGISTRATION_FAILED',
        metadata: {
          reason: 'validation_failed',
          errors: validation.errors,
          ip_address: clientIP
        },
        severity: 'INFO',
        category: 'auth'
      });

      return new Response(
        JSON.stringify({
          error: 'Validation failed',
          details: validation.errors
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const { email, password, name } = validation.sanitizedData;

    // Additional password strength validation
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      await createAuditLog({
        action: 'USER_REGISTRATION_FAILED',
        metadata: {
          reason: 'weak_password',
          email,
          errors: passwordValidation.errors,
          ip_address: clientIP
        },
        severity: 'INFO',
        category: 'auth'
      });

      return new Response(
        JSON.stringify({
          error: 'Password does not meet security requirements',
          details: passwordValidation.errors
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Hash password with Argon2
    let hashedPassword;
    try {
      hashedPassword = await hashPassword(password);
    } catch (error) {
      console.error('Password hashing error:', error);
      
      await createAuditLog({
        action: 'SECURITY_ALERT',
        metadata: {
          error: 'Password hashing failed',
          email,
          ip_address: clientIP
        },
        severity: 'ERROR',
        category: 'security'
      });

      return new Response(
        JSON.stringify({ error: 'Registration failed. Please try again.' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Create user in database
    let newUser;
    try {
      newUser = await createUser({
        email,
        password_hash: hashedPassword,
        name
      });
    } catch (error) {
      if (error.message.includes('already exists')) {
        // User already exists
        await createAuditLog({
          action: 'USER_REGISTRATION_FAILED',
          metadata: {
            reason: 'user_exists',
            email,
            ip_address: clientIP
          },
          severity: 'INFO',
          category: 'auth'
        });

        return new Response(
          JSON.stringify({ error: 'User with this email already exists' }),
          {
            status: 409,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }

      console.error('User creation error:', error);
      
      await createAuditLog({
        action: 'SECURITY_ALERT',
        metadata: {
          error: 'User creation failed',
          email,
          ip_address: clientIP,
          error_message: error.message
        },
        severity: 'ERROR',
        category: 'security'
      });

      return new Response(
        JSON.stringify({ error: 'Registration failed. Please try again.' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Log successful registration
    await createAuditLog({
      user_id: newUser.id,
      action: 'USER_REGISTERED',
      metadata: {
        email: newUser.email,
        name: newUser.name,
        ip_address: clientIP,
        user_agent: userAgent,
        registration_time: new Date().toISOString(),
        response_time_ms: Date.now() - startTime
      },
      severity: 'INFO',
      category: 'auth'
    });

    // Return success response (exclude sensitive data)
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Registration successful',
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
          created_at: newUser.created_at
        }
      }),
      {
        status: 201,
        headers: {
          'Content-Type': 'application/json',
          ...createSecurityHeaders()
        }
      }
    );

  } catch (error) {
    console.error('Registration endpoint error:', error);

    // Log critical system error
    await createAuditLog({
      action: 'SECURITY_ALERT',
      metadata: {
        error: 'Registration system error',
        error_message: error.message,
        error_stack: error.stack,
        ip_address: clientIP,
        user_agent: userAgent,
        endpoint: '/api/auth/register'
      },
      severity: 'CRITICAL',
      category: 'security'
    });

    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * Apply rate limiting to registration endpoint
 * 
 * @param {Request} request - HTTP request
 * @param {string} type - Rate limit type
 * @returns {Response|null} - Rate limit response or null if allowed
 */
async function applyRateLimit(request, type) {
  try {
    const rateLimitMiddleware = createRateLimitMiddleware(type);
    const context = {};
    
    const result = await rateLimitMiddleware(request, context);
    
    if (result) {
      // Rate limit exceeded
      return result;
    }

    return null; // Request allowed
  } catch (error) {
    console.error('Rate limiting error:', error);
    // Fail open - allow request if rate limiting fails
    return null;
  }
}


/**
 * Create security headers for response
 * 
 * @returns {Object} - Security headers
 */
function createSecurityHeaders() {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Cache-Control': 'no-store, no-cache, must-revalidate, private'
  };
}

/**
 * Handle unsupported HTTP methods
 */
export async function GET() {
  return new Response(
    JSON.stringify({ error: 'Method not allowed' }),
    {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        'Allow': 'POST'
      }
    }
  );
}

export const PUT = GET;
export const DELETE = GET;
export const PATCH = GET;