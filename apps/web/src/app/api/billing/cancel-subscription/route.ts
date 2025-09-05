/**
 * Subscription Cancellation API Endpoint
 * 
 * SECURITY: This endpoint allows customers to cancel their subscriptions
 * with proper validation and comprehensive audit logging.
 */

import { jwtVerify } from 'jose';
import { getUserByEmail, createAuditLog } from '../../../../lib/supabase';
import { stripe } from '../../../../__create/stripe';
import { PrismaClient } from '@prisma/client';
import { createRateLimitMiddleware } from '../../../../lib/rateLimit.js';

const prisma = new PrismaClient();

// Type definitions
interface CancelSubscriptionRequest {
  cancel_immediately?: boolean;
  feedback?: string;
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
 * Cancel subscription
 * 
 * @param request - HTTP request object
 * @returns HTTP response with cancellation status
 */
export async function POST(request: Request): Promise<Response> {
  let clientIP = 'unknown';
  let userEmail = '';
  let userId = '';

  try {
    // Extract client information
    clientIP = getClientIP(request);

    // Apply rate limiting for cancellation attempts
    const rateLimitResult = await applyRateLimit(request, 'subscription_cancel');
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
          error: 'Invalid JWT token in subscription cancellation',
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
    let requestData: CancelSubscriptionRequest = {};
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
    const validationError = validateCancelRequest(requestData);
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
          error: 'JWT token references non-existent user in subscription cancellation',
          jwt_email: payload.email,
          jwt_user_id: payload.userId,
          ip_address: clientIP,
          endpoint: '/api/billing/cancel-subscription'
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
          error: 'JWT userId mismatch with database user in subscription cancellation',
          jwt_user_id: payload.userId,
          database_user_id: user.id,
          email: user.email,
          ip_address: clientIP,
          endpoint: '/api/billing/cancel-subscription'
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

    // Get user's subscription
    const subscription = await prisma.subscription.findUnique({
      where: {
        userId: user.id
      }
    });

    if (!subscription) {
      return new Response(
        JSON.stringify({ error: 'No active subscription found' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    if (!subscription.stripeSubscriptionId) {
      return new Response(
        JSON.stringify({ error: 'Invalid subscription state' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Check if subscription is already cancelled
    if (subscription.status === 'CANCELLED') {
      return new Response(
        JSON.stringify({ error: 'Subscription is already cancelled' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Cancel subscription in Stripe
    try {
      const canceledSubscription = requestData.cancel_immediately 
        ? await stripe.subscriptions.cancel(subscription.stripeSubscriptionId)
        : await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
            cancel_at_period_end: true
          });

      // Update subscription in database
      const updatedSubscription = await prisma.subscription.update({
        where: {
          id: subscription.id
        },
        data: {
          ...(requestData.cancel_immediately 
            ? {
                status: 'CANCELLED',
                cancelledAt: new Date(),
                endDate: new Date()
              }
            : {
                cancelAtPeriodEnd: true
              }
          ),
          updatedAt: new Date()
        }
      });

      // Log the cancellation
      await createAuditLog({
        user_id: user.id,
        action: 'SUBSCRIPTION_CANCELLED',
        metadata: {
          stripe_subscription_id: subscription.stripeSubscriptionId,
          cancel_immediately: requestData.cancel_immediately || false,
          cancel_at_period_end: !requestData.cancel_immediately,
          period_end: subscription.currentPeriodEnd,
          feedback: requestData.feedback || null,
          ip_address: clientIP
        },
        severity: 'INFO',
        category: 'billing'
      });

      return new Response(
        JSON.stringify({
          success: true,
          subscription: {
            id: updatedSubscription.id,
            status: updatedSubscription.status,
            cancel_at_period_end: updatedSubscription.cancelAtPeriodEnd,
            current_period_end: updatedSubscription.currentPeriodEnd,
            cancelled_at: updatedSubscription.cancelledAt,
            end_date: updatedSubscription.endDate
          },
          message: requestData.cancel_immediately 
            ? 'Subscription cancelled immediately'
            : 'Subscription will be cancelled at the end of the current billing period'
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
      console.error('Stripe subscription cancellation failed:', stripeError);

      // Log Stripe error
      await createAuditLog({
        user_id: user.id,
        action: 'SECURITY_ALERT',
        metadata: {
          error: 'Stripe subscription cancellation failed',
          stripe_error: stripeError.message,
          stripe_subscription_id: subscription.stripeSubscriptionId,
          ip_address: clientIP
        },
        severity: 'ERROR',
        category: 'billing'
      });

      return new Response(
        JSON.stringify({ 
          error: 'Failed to cancel subscription'
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

  } catch (error: any) {
    console.error('Subscription cancellation error:', error);

    // Log critical system error
    await createAuditLog({
      user_id: userId,
      action: 'SECURITY_ALERT',
      metadata: {
        error: 'System error in subscription cancellation',
        error_message: error.message,
        error_stack: error.stack,
        email: userEmail,
        ip_address: clientIP,
        endpoint: '/api/billing/cancel-subscription'
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
  } finally {
    await prisma.$disconnect();
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
 * Validate cancellation request data
 * 
 * @param data - Cancellation request data
 * @returns Validation error message or null
 */
function validateCancelRequest(data: CancelSubscriptionRequest): string | null {
  if (data && typeof data !== 'object') {
    return 'Invalid request data';
  }

  // Validate cancel_immediately flag if provided
  if (data.cancel_immediately !== undefined && typeof data.cancel_immediately !== 'boolean') {
    return 'cancel_immediately must be a boolean';
  }

  // Validate feedback if provided
  if (data.feedback !== undefined) {
    if (typeof data.feedback !== 'string') {
      return 'Feedback must be a string';
    }
    
    if (data.feedback.length > 1000) {
      return 'Feedback cannot exceed 1000 characters';
    }

    // Security: Check for dangerous patterns in feedback
    const dangerousPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/i,
      /data:/i,
      /vbscript:/i
    ];

    if (dangerousPatterns.some(pattern => pattern.test(data.feedback))) {
      return 'Feedback contains invalid content';
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
      // Log rate limit violation for cancellation endpoints
      await createAuditLog({
        action: 'SECURITY_ALERT',
        metadata: {
          error: 'Rate limit exceeded on subscription cancellation endpoint',
          rate_limit_type: type,
          ip_address: getClientIP(request),
          endpoint: '/api/billing/cancel-subscription'
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