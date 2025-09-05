/**
 * Forgot Password API Endpoint
 * POST /api/auth/forgot-password
 * 
 * Initiates password reset process by sending reset email
 */

import { getUserByEmail, createAuditLog } from '../../../../lib/supabase.js';
import { generatePasswordResetToken } from '../../../../lib/email-tokens.js';
import { sendPasswordResetEmail } from '../../../../lib/email.ts';
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

    // Apply rate limiting (stricter for password reset)
    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    if (useMockAuth) {
      // Basic rate limiting in development
      const basicRateLimitResult = await applyRateLimit(request, 'forgot-password-dev', {
        maxRequests: 5, // Lower limit for security
        windowMs: 300000  // 5 minute window
      });
      if (basicRateLimitResult) {
        return basicRateLimitResult;
      }
    } else {
      // Production rate limiting
      const rateLimitResult = await applyRateLimit(request, 'forgot-password');
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
          error: 'Invalid JSON in password reset request',
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

    const { email } = requestData;

    // Validate email
    if (!email || typeof email !== 'string') {
      return secureJsonResponse({
        error: 'Email is required'
      }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return secureJsonResponse({
        error: 'Invalid email format'
      }, { status: 400 });
    }

    // Always return success response for security (don't reveal if email exists)
    // But only send email if user exists
    let user;
    let emailSent = false;
    let processingError = null;

    try {
      user = await getUserByEmail(email);
    } catch (error) {
      console.error('Database error in forgot password:', error);
      
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

    // Constant-time processing: always perform operations even if user doesn't exist
    if (user) {
      try {
        // Generate password reset token
        const resetToken = generatePasswordResetToken(user.email, 1); // 1 hour expiry

        // Send password reset email
        await sendPasswordResetEmail({
          email: user.email,
          name: user.name || 'Music Learner',
          resetToken
        });

        emailSent = true;

        // Log successful password reset request
        await createAuditLog({
          user_id: user.id,
          action: 'PASSWORD_RESET_REQUESTED',
          metadata: {
            email: user.email,
            ip_address: clientIP,
            user_agent: userAgent,
            response_time_ms: Date.now() - startTime
          },
          severity: 'INFO',
          category: 'auth'
        });

        console.log(`Password reset email sent to ${user.email}`);
      } catch (emailError) {
        console.error('Failed to send password reset email:', emailError);
        
        await createAuditLog({
          user_id: user.id,
          action: 'PASSWORD_RESET_EMAIL_FAILED',
          metadata: {
            email: user.email,
            error: emailError.message,
            ip_address: clientIP
          },
          severity: 'WARN',
          category: 'email'
        });

        processingError = 'Failed to send reset email. Please try again.';
      }
    } else {
      // Log attempt to reset password for non-existent user
      await createAuditLog({
        action: 'PASSWORD_RESET_NONEXISTENT_USER',
        metadata: {
          email,
          ip_address: clientIP,
          user_agent: userAgent
        },
        severity: 'WARN',
        category: 'security'
      });

      // Simulate processing time to prevent timing attacks
      await new Promise(resolve => setTimeout(resolve, Math.random() * 200 + 100));
    }

    // If there was an error sending email, return error
    if (processingError) {
      return secureJsonResponse({
        error: processingError
      }, { status: 500 });
    }

    // Always return success response (don't reveal if user exists)
    return secureJsonResponse({
      success: true,
      message: 'If an account with that email exists, we have sent password reset instructions.'
    });

  } catch (error) {
    console.error('Forgot password endpoint error:', error);

    // Log critical system error
    await createAuditLog({
      action: 'SECURITY_ALERT',
      metadata: {
        error: 'Password reset system error',
        error_message: error.message,
        error_stack: error.stack,
        ip_address: clientIP,
        user_agent: userAgent,
        endpoint: '/api/auth/forgot-password'
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

/**
 * Handle unsupported HTTP methods
 */
export async function GET() {
  return secureJsonResponse({
    error: 'Method not allowed'
  }, {
    status: 405,
    headers: { 'Allow': 'POST' }
  });
}

export const PUT = GET;
export const DELETE = GET;
export const PATCH = GET;