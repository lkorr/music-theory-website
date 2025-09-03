/**
 * User Login API Endpoint
 * 
 * SECURITY: This endpoint implements secure user authentication with comprehensive
 * validation, rate limiting, and audit logging.
 */

import { validateLoginData } from '../../../../lib/validation.js';
import { verifyPassword } from '../../../../lib/password.js';
import { getUserByEmail, updateLoginTracking, createAuditLog, isAccountLocked } from '../../../../lib/supabase.js';
import { createRateLimitMiddleware } from '../../../../lib/rateLimit.js';
import { SignJWT } from 'jose';

if (!process.env.AUTH_SECRET) {
  throw new Error('AUTH_SECRET environment variable is required for JWT signing');
}
const JWT_SECRET = new TextEncoder().encode(process.env.AUTH_SECRET);

/**
 * Handle user login
 * 
 * @param {Request} request - HTTP request object
 * @returns {Response} - HTTP response
 */
export async function POST(request) {
  const startTime = Date.now();
  let clientIP = 'unknown';
  let userAgent = 'unknown';
  let email = '';

  try {
    // Extract client information for logging
    clientIP = getClientIP(request);
    userAgent = request.headers.get('user-agent') || 'Unknown';

    // Apply rate limiting (stricter for login) - skip in development with mock auth
    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    if (!useMockAuth) {
      const rateLimitResult = await applyRateLimit(request, 'login');
      if (rateLimitResult) {
        return rateLimitResult;
      }
    }

    // Parse request body
    let requestData;
    try {
      requestData = await request.json();
    } catch (error) {
      await createAuditLog({
        action: 'SECURITY_ALERT',
        metadata: {
          error: 'Invalid JSON in login request',
          ip_address: clientIP,
          user_agent: userAgent
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

    // Validate and sanitize login data
    const validation = validateLoginData(requestData);
    if (!validation.isValid) {
      await createAuditLog({
        action: 'USER_LOGIN_FAILED',
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

    email = validation.sanitizedData.email;
    const { password } = validation.sanitizedData;

    // Get user from database
    let user;
    try {
      user = await getUserByEmail(email);
    } catch (error) {
      console.error('Database error during login:', error);
      
      await createAuditLog({
        action: 'SECURITY_ALERT',
        metadata: {
          error: 'Database error during user lookup',
          email,
          ip_address: clientIP,
          error_message: error.message
        },
        severity: 'ERROR',
        category: 'security'
      });

      return new Response(
        JSON.stringify({ error: 'Login failed. Please try again.' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Check if user exists and account is not deleted
    if (!user || user.deleted_at) {
      await createAuditLog({
        user_id: user?.id,
        action: 'USER_LOGIN_FAILED',
        metadata: {
          reason: user ? 'account_deleted' : 'user_not_found',
          email,
          ip_address: clientIP,
          user_agent: userAgent
        },
        severity: 'WARN',
        category: 'auth'
      });

      // Generic error message for security (don't reveal if user exists)
      return new Response(
        JSON.stringify({ error: 'Invalid email or password' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Check if account is locked (skip in development with mock auth)
    if (!useMockAuth) {
      try {
        const accountLocked = await isAccountLocked(user.id);
        if (accountLocked) {
          await createAuditLog({
            user_id: user.id,
            action: 'USER_LOGIN_FAILED',
            metadata: {
              reason: 'account_locked',
              email,
              ip_address: clientIP,
              user_agent: userAgent
            },
            severity: 'WARN',
            category: 'auth'
          });

          return new Response(
            JSON.stringify({ error: 'Account temporarily locked due to too many failed login attempts. Please try again later.' }),
            {
              status: 423, // Locked status code
              headers: { 'Content-Type': 'application/json' }
            }
          );
        }
      } catch (error) {
        console.error('Account lock check error:', error);
        // Continue with login if lock check fails
      }
    }

    // Verify password
    let passwordValid;
    try {
      passwordValid = await verifyPassword(user.password, password);
    } catch (error) {
      console.error('Password verification error:', error);
      
      await createAuditLog({
        user_id: user.id,
        action: 'SECURITY_ALERT',
        metadata: {
          error: 'Password verification failed',
          email,
          ip_address: clientIP
        },
        severity: 'ERROR',
        category: 'security'
      });

      return new Response(
        JSON.stringify({ error: 'Login failed. Please try again.' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    if (!passwordValid) {
      // Update failed login tracking (skip in development with mock auth)
      if (!useMockAuth) {
        try {
          await updateLoginTracking(user.id, clientIP, false);
        } catch (error) {
          console.error('Failed login tracking error:', error);
        }
      }

      await createAuditLog({
        user_id: user.id,
        action: 'USER_LOGIN_FAILED',
        metadata: {
          reason: 'invalid_password',
          email,
          ip_address: clientIP,
          user_agent: userAgent
        },
        severity: 'WARN',
        category: 'auth'
      });

      return new Response(
        JSON.stringify({ error: 'Invalid email or password' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Generate JWT token
    let token;
    try {
      token = await new SignJWT({
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
    } catch (error) {
      console.error('JWT generation error:', error);
      
      await createAuditLog({
        user_id: user.id,
        action: 'SECURITY_ALERT',
        metadata: {
          error: 'JWT generation failed',
          email,
          ip_address: clientIP
        },
        severity: 'ERROR',
        category: 'security'
      });

      return new Response(
        JSON.stringify({ error: 'Login failed. Please try again.' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Update login tracking
    try {
      await updateLoginTracking(user.id, clientIP, true);
    } catch (error) {
      console.error('Login tracking update error:', error);
      // Don't fail login for tracking errors, just log them
    }

    // Log successful login
    await createAuditLog({
      user_id: user.id,
      action: 'USER_LOGIN_SUCCESS',
      metadata: {
        email: user.email,
        ip_address: clientIP,
        user_agent: userAgent,
        login_time: new Date().toISOString(),
        response_time_ms: Date.now() - startTime
      },
      severity: 'INFO',
      category: 'auth'
    });

    // Create secure cookie and return response
    const response = new Response(
      JSON.stringify({
        success: true,
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          last_login: user.last_login
        }
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...createSecurityHeaders()
        }
      }
    );

    // Set secure HTTP-only cookie
    const cookieOptions = [
      'HttpOnly',
      // Only set Secure flag in production (HTTPS)
      ...(process.env.NODE_ENV === 'production' ? ['Secure'] : []),
      'SameSite=Lax',
      `Max-Age=${7 * 24 * 60 * 60}`, // 7 days
      'Path=/'
    ];

    response.headers.set('Set-Cookie', `auth-token=${token}; ${cookieOptions.join('; ')}`);

    return response;

  } catch (error) {
    console.error('Login endpoint error:', error);

    // Log critical system error
    await createAuditLog({
      action: 'SECURITY_ALERT',
      metadata: {
        error: 'Login system error',
        error_message: error.message,
        error_stack: error.stack,
        email,
        ip_address: clientIP,
        user_agent: userAgent,
        endpoint: '/api/auth/login'
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
 * Apply rate limiting to login endpoint
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
      // Log rate limit exceeded
      await createAuditLog({
        action: 'SECURITY_ALERT',
        metadata: {
          error: 'Rate limit exceeded',
          endpoint: '/api/auth/login',
          ip_address: getClientIP(request),
          user_agent: request.headers.get('user-agent') || 'Unknown'
        },
        severity: 'WARN',
        category: 'security'
      });
      
      return result;
    }

    return null;
  } catch (error) {
    console.error('Rate limiting error:', error);
    return null;
  }
}

/**
 * Extract client IP address from request
 * 
 * @param {Request} request - HTTP request
 * @returns {string} - Client IP address
 */
function getClientIP(request) {
  const headers = [
    'x-forwarded-for',
    'x-real-ip',
    'cf-connecting-ip',
    'x-client-ip'
  ];

  for (const header of headers) {
    const value = request.headers.get(header);
    if (value) {
      return value.split(',')[0].trim();
    }
  }

  return 'unknown';
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