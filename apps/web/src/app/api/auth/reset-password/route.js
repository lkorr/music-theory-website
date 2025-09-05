/**
 * Password Reset Confirmation API Endpoint
 * POST /api/auth/reset-password
 * 
 * Confirms password reset with token and sets new password
 */

import { getUserByEmail, updateUserPassword, createAuditLog } from '../../../../lib/supabase.js';
import { verifyPasswordResetToken } from '../../../../lib/email-tokens.js';
import { hashPassword, validatePasswordStrength } from '../../../../lib/password.js';
import { secureJsonResponse } from '../../../../lib/security-headers.js';
import { createRateLimitMiddleware } from '../../../../lib/rateLimit.js';
import { getClientIP } from '../../../../lib/network-utils.ts';
import { validateAuthCSRF, createCSRFErrorResponse } from '../../../../lib/auth-csrf.ts';

export async function POST(request) {
  const startTime = Date.now();
  let clientIP = 'unknown';
  let userAgent = 'unknown';

  try {
    // Extract client information for logging
    clientIP = getClientIP(request);
    userAgent = request.headers.get('user-agent') || 'Unknown';

    // Apply rate limiting
    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    if (useMockAuth) {
      // Basic rate limiting in development
      const basicRateLimitResult = await applyRateLimit(request, 'reset-password-dev', {
        maxRequests: 10,
        windowMs: 300000  // 5 minute window
      });
      if (basicRateLimitResult) {
        return basicRateLimitResult;
      }
    } else {
      // Production rate limiting
      const rateLimitResult = await applyRateLimit(request, 'reset-password');
      if (rateLimitResult) {
        return rateLimitResult;
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
          error: 'Invalid JSON in password reset confirmation',
          ip_address: clientIP,
          user_agent: userAgent,
          error_details: error.message
        },
        severity: 'WARN',
        category: 'security'
      });

      return secureJsonResponse({
        error: 'Invalid request format'
      }, { status: 400 });
    }

    const { token, email, password } = requestData;

    // Validate input
    if (!token || !email || !password) {
      return secureJsonResponse({
        error: 'Token, email, and password are required'
      }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return secureJsonResponse({
        error: 'Invalid email format'
      }, { status: 400 });
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      return secureJsonResponse({
        error: 'Password does not meet security requirements',
        details: passwordValidation.errors
      }, { status: 400 });
    }

    // Verify the password reset token
    const tokenValid = verifyPasswordResetToken(email, token);
    if (!tokenValid) {
      await createAuditLog({
        action: 'PASSWORD_RESET_INVALID_TOKEN',
        metadata: {
          email,
          ip_address: clientIP,
          user_agent: userAgent
        },
        severity: 'WARN',
        category: 'security'
      });

      return secureJsonResponse({
        error: 'Invalid or expired reset token'
      }, { status: 400 });
    }

    // Get user from database
    let user;
    try {
      user = await getUserByEmail(email);
    } catch (error) {
      console.error('Database error in password reset:', error);
      
      await createAuditLog({
        action: 'SECURITY_ALERT',
        metadata: {
          error: 'Database error during password reset',
          email,
          ip_address: clientIP,
          error_message: error.message
        },
        severity: 'ERROR',
        category: 'security'
      });

      return secureJsonResponse({
        error: 'Internal server error'
      }, { status: 500 });
    }

    if (!user) {
      await createAuditLog({
        action: 'PASSWORD_RESET_USER_NOT_FOUND',
        metadata: {
          email,
          ip_address: clientIP,
          user_agent: userAgent
        },
        severity: 'WARN',
        category: 'security'
      });

      return secureJsonResponse({
        error: 'User not found'
      }, { status: 404 });
    }

    // Hash the new password
    let hashedPassword;
    try {
      hashedPassword = await hashPassword(password);
    } catch (error) {
      console.error('Password hashing error:', error);
      
      await createAuditLog({
        user_id: user.id,
        action: 'SECURITY_ALERT',
        metadata: {
          error: 'Password hashing failed during reset',
          email,
          ip_address: clientIP
        },
        severity: 'ERROR',
        category: 'security'
      });

      return secureJsonResponse({
        error: 'Password reset failed. Please try again.'
      }, { status: 500 });
    }

    // Update user password
    try {
      await updateUserPassword(user.id, hashedPassword);
    } catch (error) {
      console.error('Password update error:', error);
      
      await createAuditLog({
        user_id: user.id,
        action: 'SECURITY_ALERT',
        metadata: {
          error: 'Password update failed',
          email,
          ip_address: clientIP,
          error_message: error.message
        },
        severity: 'ERROR',
        category: 'security'
      });

      return secureJsonResponse({
        error: 'Password reset failed. Please try again.'
      }, { status: 500 });
    }

    // Log successful password reset
    await createAuditLog({
      user_id: user.id,
      action: 'PASSWORD_RESET_COMPLETED',
      metadata: {
        email: user.email,
        ip_address: clientIP,
        user_agent: userAgent,
        response_time_ms: Date.now() - startTime
      },
      severity: 'INFO',
      category: 'auth'
    });

    return secureJsonResponse({
      success: true,
      message: 'Password has been reset successfully. You can now sign in with your new password.'
    });

  } catch (error) {
    console.error('Password reset endpoint error:', error);

    // Log critical system error
    await createAuditLog({
      action: 'SECURITY_ALERT',
      metadata: {
        error: 'Password reset system error',
        error_message: error.message,
        error_stack: error.stack,
        ip_address: clientIP,
        user_agent: userAgent,
        endpoint: '/api/auth/reset-password'
      },
      severity: 'CRITICAL',
      category: 'security'
    });

    return secureJsonResponse({
      error: 'Internal server error'
    }, { status: 500 });
  }
}

/**
 * Apply rate limiting to password reset endpoint
 */
async function applyRateLimit(request, type, options = null) {
  try {
    const rateLimitMiddleware = createRateLimitMiddleware(type, options);
    const context = {};
    
    const result = await rateLimitMiddleware(request, context);
    
    if (result) {
      return result; // Rate limit exceeded
    }

    return null; // Request allowed
  } catch (error) {
    console.error('Rate limiting error:', error);
    return null; // Fail open
  }
}

// Allow GET requests for password reset links from emails
export async function GET(request) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');
  const email = url.searchParams.get('email');

  if (!token || !email) {
    // Redirect to password reset page with error
    return Response.redirect(`${url.origin}/auth/reset-password?error=missing_params`);
  }

  // Redirect to password reset form with token and email
  return Response.redirect(`${url.origin}/auth/reset-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`);
}

/**
 * Handle unsupported HTTP methods
 */
export const PUT = () => secureJsonResponse({
  error: 'Method not allowed'
}, {
  status: 405,
  headers: { 'Allow': 'POST, GET' }
});

export const DELETE = PUT;
export const PATCH = PUT;