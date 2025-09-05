/**
 * Stripe Customer Portal Session Creation API Endpoint
 * 
 * SECURITY: This endpoint creates secure Stripe customer portal sessions
 * for customers to manage their billing, subscriptions, and payment methods.
 */

import { jwtVerify } from 'jose';
import { getUserByEmail, createAuditLog } from '../../../../lib/supabase';
import { stripe } from '../../../../__create/stripe';
import { createRateLimitMiddleware } from '../../../../lib/rateLimit.js';

// Type definitions
interface CreatePortalSessionRequest {
  return_url?: string;
}

interface JWTPayload {
  email: string;
  userId: string;
  [key: string]: any;
}

if (!process.env.AUTH_SECRET) {
  throw new Error('AUTH_SECRET environment variable is required for JWT signing');
}
const JWT_SECRET = new TextEncoder().encode(process.env.AUTH_SECRET);

/**
 * Create Stripe customer portal session
 * 
 * @param request - HTTP request object
 * @returns HTTP response with portal URL
 */
export async function POST(request: Request): Promise<Response> {
  let clientIP = 'unknown';
  let userEmail = '';
  let userId = '';

  try {
    // Extract client information
    clientIP = getClientIP(request);

    // Apply rate limiting for customer portal attempts
    const rateLimitResult = await applyRateLimit(request, 'customer_portal');
    if (rateLimitResult) {
      return rateLimitResult;
    }

    // Get token from cookie
    const token = getTokenFromCookie(request);
    if (!token) {
      return new Response(
        JSON.stringify({ error: 'No authentication token found' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Verify JWT token
    let payload: JWTPayload;
    try {
      const { payload: tokenPayload } = await jwtVerify(token, JWT_SECRET, {
        issuer: 'midi-training-app',
        audience: 'midi-training-app-users'
      });
      payload = tokenPayload as JWTPayload;
    } catch (error: any) {
      await createAuditLog({
        action: 'SECURITY_ALERT',
        metadata: {
          error: 'Invalid JWT token in customer portal session creation',
          ip_address: clientIP,
          error_message: error.message
        },
        severity: 'WARN',
        category: 'security'
      });

      return new Response(
        JSON.stringify({ error: 'Invalid authentication token' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    userEmail = payload.email;
    userId = payload.userId;

    // Parse request body
    let requestData: CreatePortalSessionRequest = {};
    try {
      const body = await request.text();
      if (body.trim()) {
        requestData = JSON.parse(body);
      }
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate request data
    const validationError = validatePortalRequest(requestData);
    if (validationError) {
      return new Response(
        JSON.stringify({ error: validationError }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Get user from database and verify JWT payload integrity
    const user = await getUserByEmail(payload.email);
    if (!user || user.deleted_at) {
      await createAuditLog({
        action: 'SECURITY_ALERT',
        metadata: {
          error: 'JWT token references non-existent user in portal session creation',
          jwt_email: payload.email,
          jwt_user_id: payload.userId,
          ip_address: clientIP,
          endpoint: '/api/billing/customer-portal'
        },
        severity: 'WARN',
        category: 'security'
      });

      return new Response(
        JSON.stringify({ error: 'User not found' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Additional security check: verify JWT userId matches database user.id
    if (payload.userId !== user.id) {
      await createAuditLog({
        action: 'SECURITY_ALERT',
        metadata: {
          error: 'JWT userId mismatch with database user in portal session creation',
          jwt_user_id: payload.userId,
          database_user_id: user.id,
          email: user.email,
          ip_address: clientIP,
          endpoint: '/api/billing/customer-portal'
        },
        severity: 'ERROR',
        category: 'security'
      });

      return new Response(
        JSON.stringify({ error: 'Invalid authentication token' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Check if user has a Stripe customer ID
    if (!user.stripe_customer_id) {
      return new Response(
        JSON.stringify({ error: 'No billing account found. Please create a subscription first.' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Determine return URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const returnUrl = requestData.return_url || `${baseUrl}/account/billing`;

    // Create customer portal session
    try {
      const portalSession = await stripe.billingPortal.sessions.create({
        customer: user.stripe_customer_id,
        return_url: returnUrl,
      });

      // Log the portal session creation
      await createAuditLog({
        user_id: user.id,
        action: 'SUBSCRIPTION_UPDATED',
        metadata: {
          event: 'customer_portal_session_created',
          stripe_customer_id: user.stripe_customer_id,
          portal_session_id: portalSession.id,
          return_url: returnUrl,
          ip_address: clientIP
        },
        severity: 'INFO',
        category: 'billing'
      });

      return new Response(
        JSON.stringify({
          success: true,
          portal_url: portalSession.url
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...createSecurityHeaders()
          }
        }
      );

    } catch (stripeError: any) {
      console.error('Stripe customer portal session creation failed:', stripeError);

      // Log Stripe error
      await createAuditLog({
        user_id: user.id,
        action: 'SECURITY_ALERT',
        metadata: {
          error: 'Stripe customer portal session creation failed',
          stripe_error: stripeError.message,
          stripe_customer_id: user.stripe_customer_id,
          ip_address: clientIP
        },
        severity: 'ERROR',
        category: 'billing'
      });

      return new Response(
        JSON.stringify({ 
          error: 'Failed to create customer portal session'
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

  } catch (error: any) {
    console.error('Customer portal session creation error:', error);

    // Log critical system error
    await createAuditLog({
      user_id: userId,
      action: 'SECURITY_ALERT',
      metadata: {
        error: 'System error in customer portal session creation',
        error_message: error.message,
        error_stack: error.stack,
        email: userEmail,
        ip_address: clientIP,
        endpoint: '/api/billing/customer-portal'
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
 * Get authentication token from cookie
 * 
 * @param request - HTTP request
 * @returns Token or null
 */
function getTokenFromCookie(request: Request): string | null {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(';');
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'auth-token') {
      return value;
    }
  }

  return null;
}

/**
 * Extract client IP address from request
 * 
 * @param request - HTTP request
 * @returns Client IP address
 */
function getClientIP(request: Request): string {
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
 * @returns Security headers
 */
function createSecurityHeaders(): Record<string, string> {
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
export async function GET(): Promise<Response> {
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

/**
 * Validate portal session request data
 * 
 * @param data - Portal session request data
 * @returns Validation error message or null
 */
function validatePortalRequest(data: CreatePortalSessionRequest): string | null {
  if (data && typeof data !== 'object') {
    return 'Invalid request data';
  }

  // Validate return_url if provided
  if (data.return_url !== undefined) {
    if (typeof data.return_url !== 'string') {
      return 'Return URL must be a string';
    }
    
    const trimmedUrl = data.return_url.trim();
    if (trimmedUrl.length > 0) {
      try {
        const url = new URL(trimmedUrl);
        // Only allow HTTPS URLs (or HTTP for localhost in development)
        if (url.protocol !== 'https:' && !(url.protocol === 'http:' && url.hostname === 'localhost')) {
          return 'Return URL must use HTTPS';
        }
      } catch {
        return 'Invalid return URL format';
      }
    }
  }

  return null;
}

/**
 * Apply rate limiting to request
 * 
 * @param request - HTTP request 
 * @param type - Rate limit type
 * @returns Response if rate limited, null otherwise
 */
async function applyRateLimit(request: Request, type: string): Promise<Response | null> {
  try {
    const rateLimitMiddleware = createRateLimitMiddleware(type);
    const context = {};
    
    const result = await rateLimitMiddleware(request, context);
    
    if (result) {
      // Log rate limit violation for portal endpoints
      await createAuditLog({
        action: 'SECURITY_ALERT',
        metadata: {
          error: 'Rate limit exceeded on customer portal endpoint',
          rate_limit_type: type,
          ip_address: getClientIP(request),
          endpoint: '/api/billing/customer-portal'
        },
        severity: 'WARN',
        category: 'security'
      });
    }
    
    return result;
  } catch (error: any) {
    console.error('Rate limiting error:', error);
    // Don't block request on rate limit errors
    return null;
  }
}