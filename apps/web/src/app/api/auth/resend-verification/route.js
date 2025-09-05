/**
 * Resend Email Verification API Endpoint
 * POST /api/auth/resend-verification
 * 
 * Resends email verification to users who haven't verified yet
 */

import { getUserByEmail, createAuditLog } from '../../../../lib/supabase.js';
import { generateEmailToken, hasValidEmailToken } from '../../../../lib/email-tokens.js';
import { sendVerificationEmail } from '../../../../lib/email.ts';
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

    // Apply strict rate limiting for resend verification
    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    if (useMockAuth) {
      // Basic rate limiting in development
      const basicRateLimitResult = await applyRateLimit(request, 'resend-verification-dev', {
        maxRequests: 3, // Very limited in development
        windowMs: 300000  // 5 minute window
      });
      if (basicRateLimitResult) {
        return basicRateLimitResult;
      }
    } else {
      // Production rate limiting
      const rateLimitResult = await applyRateLimit(request, 'resend-verification');
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
          error: 'Invalid JSON in resend verification request',
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

    // Get user from database
    let user;
    try {
      user = await getUserByEmail(email);
    } catch (error) {
      console.error('Database error in resend verification:', error);
      
      await createAuditLog({
        action: 'SECURITY_ALERT',
        metadata: {
          error: 'Database error during resend verification',
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
      // Don't reveal that user doesn't exist
      await createAuditLog({
        action: 'RESEND_VERIFICATION_NONEXISTENT_USER',
        metadata: {
          email,
          ip_address: clientIP,
          user_agent: userAgent
        },
        severity: 'WARN',
        category: 'security'
      });

      return secureJsonResponse({
        success: true,
        message: 'If your email is in our system and not yet verified, we have sent a verification email.'
      });
    }

    // Check if user is already verified
    if (user.email_verified) {
      await createAuditLog({
        user_id: user.id,
        action: 'RESEND_VERIFICATION_ALREADY_VERIFIED',
        metadata: {
          email: user.email,
          ip_address: clientIP,
          user_agent: userAgent
        },
        severity: 'INFO',
        category: 'auth'
      });

      return secureJsonResponse({
        error: 'Email is already verified'
      }, { status: 400 });
    }

    // Check if there's already a valid token (prevent spam)
    if (hasValidEmailToken(user.email)) {
      await createAuditLog({
        user_id: user.id,
        action: 'RESEND_VERIFICATION_TOKEN_EXISTS',
        metadata: {
          email: user.email,
          ip_address: clientIP,
          user_agent: userAgent
        },
        severity: 'INFO',
        category: 'auth'
      });

      return secureJsonResponse({
        error: 'A verification email was already sent recently. Please check your email or wait before requesting another.'
      }, { status: 429 });
    }

    // Generate new verification token
    let verificationToken;
    try {
      verificationToken = generateEmailToken(user.email); // 2 hours expiry
    } catch (error) {
      console.error('Token generation error:', error);
      
      await createAuditLog({
        user_id: user.id,
        action: 'SECURITY_ALERT',
        metadata: {
          error: 'Token generation failed',
          email: user.email,
          ip_address: clientIP
        },
        severity: 'ERROR',
        category: 'security'
      });

      return secureJsonResponse({
        error: 'Failed to generate verification token'
      }, { status: 500 });
    }

    // Send verification email
    try {
      await sendVerificationEmail({
        email: user.email,
        name: user.name || 'Music Learner',
        verificationToken
      });

      // Log successful resend
      await createAuditLog({
        user_id: user.id,
        action: 'VERIFICATION_EMAIL_RESENT',
        metadata: {
          email: user.email,
          ip_address: clientIP,
          user_agent: userAgent,
          response_time_ms: Date.now() - startTime
        },
        severity: 'INFO',
        category: 'auth'
      });

      console.log(`Verification email resent to ${user.email}`);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      
      await createAuditLog({
        user_id: user.id,
        action: 'VERIFICATION_EMAIL_RESEND_FAILED',
        metadata: {
          email: user.email,
          error: emailError.message,
          ip_address: clientIP
        },
        severity: 'WARN',
        category: 'email'
      });

      return secureJsonResponse({
        error: 'Failed to send verification email. Please try again later.'
      }, { status: 500 });
    }

    return secureJsonResponse({
      success: true,
      message: 'Verification email sent! Please check your inbox and spam folder.'
    });

  } catch (error) {
    console.error('Resend verification endpoint error:', error);

    // Log critical system error
    await createAuditLog({
      action: 'SECURITY_ALERT',
      metadata: {
        error: 'Resend verification system error',
        error_message: error.message,
        error_stack: error.stack,
        ip_address: clientIP,
        user_agent: userAgent,
        endpoint: '/api/auth/resend-verification'
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
 * Apply rate limiting to resend verification endpoint
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