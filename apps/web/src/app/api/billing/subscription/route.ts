/**
 * Subscription Management API Endpoint
 * 
 * SECURITY: This endpoint handles subscription data retrieval and management
 * with proper authentication and authorization.
 */

import { jwtVerify } from 'jose';
import { getUserByEmail, createAuditLog } from '../../../../lib/supabase';
import { PrismaClient } from '@prisma/client';
import { createRateLimitMiddleware } from '../../../../lib/rateLimit.js';

// Type definitions
interface JWTPayload {
  email: string;
  userId: string;
  [key: string]: any;
}

if (!process.env.AUTH_SECRET) {
  throw new Error('AUTH_SECRET environment variable is required for JWT signing');
}
const JWT_SECRET = new TextEncoder().encode(process.env.AUTH_SECRET);

const prisma = new PrismaClient();

/**
 * Get current user's subscription
 * 
 * @param request - HTTP request object
 * @returns HTTP response with subscription data
 */
export async function GET(request: Request): Promise<Response> {
  let clientIP = 'unknown';
  let userEmail = '';
  let userId = '';

  try {
    // Extract client information
    clientIP = getClientIP(request);

    // Apply rate limiting for billing endpoints
    const rateLimitResult = await applyRateLimit(request, 'billing');
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
          error: 'Invalid JWT token in subscription endpoint',
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

    // Get user from database and verify JWT payload integrity
    const user = await getUserByEmail(payload.email);
    if (!user || user.deleted_at) {
      await createAuditLog({
        action: 'SECURITY_ALERT',
        metadata: {
          error: 'JWT token references non-existent user',
          jwt_email: payload.email,
          jwt_user_id: payload.userId,
          ip_address: clientIP,
          endpoint: '/api/billing/subscription'
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
          error: 'JWT userId mismatch with database user',
          jwt_user_id: payload.userId,
          database_user_id: user.id,
          email: user.email,
          ip_address: clientIP,
          endpoint: '/api/billing/subscription'
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

    // Get subscription data
    const subscription = await prisma.subscription.findUnique({
      where: {
        userId: user.id
      },
      include: {
        invoices: {
          orderBy: {
            invoiceDate: 'desc'
          },
          take: 5 // Last 5 invoices
        }
      }
    });

    // If no subscription exists, return free plan info
    if (!subscription) {
      return new Response(
        JSON.stringify({
          subscription: null,
          plan: 'FREE',
          status: 'free',
          features: {
            practiceSessionsLimit: 10,
            levelsUnlocked: 3,
            advancedAnalytics: false,
            exportData: false
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
    }

    // Return subscription data
    return new Response(
      JSON.stringify({
        subscription: {
          id: subscription.id,
          plan: subscription.plan,
          status: subscription.status,
          amount: subscription.amount,
          currency: subscription.currency,
          interval: subscription.interval,
          currentPeriodStart: subscription.currentPeriodStart,
          currentPeriodEnd: subscription.currentPeriodEnd,
          trialEndsAt: subscription.trialEndsAt,
          cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
          createdAt: subscription.createdAt
        },
        recentInvoices: subscription.invoices.map(invoice => ({
          id: invoice.id,
          amount: invoice.amount,
          amountPaid: invoice.amountPaid,
          currency: invoice.currency,
          status: invoice.status,
          invoiceDate: invoice.invoiceDate,
          paidAt: invoice.paidAt,
          description: invoice.description
        }))
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...createSecurityHeaders()
        }
      }
    );

  } catch (error: any) {
    console.error('Subscription retrieval error:', error);

    // Log critical system error
    await createAuditLog({
      user_id: userId,
      action: 'SECURITY_ALERT',
      metadata: {
        error: 'System error in subscription endpoint',
        error_message: error.message,
        error_stack: error.stack,
        email: userEmail,
        ip_address: clientIP,
        endpoint: '/api/billing/subscription'
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
export async function POST(): Promise<Response> {
  return new Response(
    JSON.stringify({ error: 'Method not allowed' }),
    {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        'Allow': 'GET'
      }
    }
  );
}

export const PUT = POST;
export const DELETE = POST;
export const PATCH = POST;

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
      // Log rate limit violation for billing endpoints
      await createAuditLog({
        action: 'SECURITY_ALERT',
        metadata: {
          error: 'Rate limit exceeded on billing endpoint',
          rate_limit_type: type,
          ip_address: getClientIP(request),
          endpoint: '/api/billing/subscription'
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