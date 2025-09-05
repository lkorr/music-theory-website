/**
 * Invoice Retrieval API Endpoint
 * 
 * SECURITY: This endpoint allows customers to retrieve their billing invoices
 * with proper authentication and authorization checks.
 */

import { jwtVerify } from 'jose';
import { getUserByEmail, createAuditLog } from '../../../../lib/supabase';
import { PrismaClient } from '@prisma/client';
import { createRateLimitMiddleware } from '../../../../lib/rateLimit.js';

const prisma = new PrismaClient();

// Type definitions
interface JWTPayload {
  email: string;
  userId: string;
  [key: string]: any;
}

interface InvoiceQuery {
  limit?: string;
  offset?: string;
  status?: string;
}

if (!process.env.AUTH_SECRET) {
  throw new Error('AUTH_SECRET environment variable is required for JWT signing');
}
const JWT_SECRET = new TextEncoder().encode(process.env.AUTH_SECRET);

/**
 * Get user's invoices
 * 
 * @param request - HTTP request object
 * @returns HTTP response with invoice data
 */
export async function GET(request: Request): Promise<Response> {
  let clientIP = 'unknown';
  let userEmail = '';
  let userId = '';

  try {
    // Extract client information
    clientIP = getClientIP(request);

    // Apply rate limiting for invoice retrieval
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
          error: 'Invalid JWT token in invoice retrieval',
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

    // Parse query parameters
    const url = new URL(request.url);
    const queryParams: InvoiceQuery = {
      limit: url.searchParams.get('limit') || undefined,
      offset: url.searchParams.get('offset') || undefined,
      status: url.searchParams.get('status') || undefined
    };

    // Validate query parameters
    const validationError = validateInvoiceQuery(queryParams);
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
          error: 'JWT token references non-existent user in invoice retrieval',
          jwt_email: payload.email,
          jwt_user_id: payload.userId,
          ip_address: clientIP,
          endpoint: '/api/billing/invoices'
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
          error: 'JWT userId mismatch with database user in invoice retrieval',
          jwt_user_id: payload.userId,
          database_user_id: user.id,
          email: user.email,
          ip_address: clientIP,
          endpoint: '/api/billing/invoices'
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

    // Parse and validate query parameters
    const limit = queryParams.limit ? parseInt(queryParams.limit) : 25;
    const offset = queryParams.offset ? parseInt(queryParams.offset) : 0;
    
    // Build query filters
    const whereClause: any = {
      userId: user.id
    };

    if (queryParams.status) {
      whereClause.status = queryParams.status.toUpperCase();
    }

    // Get invoices with pagination
    const [invoices, totalCount] = await Promise.all([
      prisma.invoice.findMany({
        where: whereClause,
        orderBy: {
          invoiceDate: 'desc'
        },
        skip: offset,
        take: limit,
        select: {
          id: true,
          stripeInvoiceId: true,
          number: true,
          description: true,
          amount: true,
          amountPaid: true,
          currency: true,
          status: true,
          invoiceDate: true,
          dueDate: true,
          paidAt: true,
          periodStart: true,
          periodEnd: true,
          invoicePdf: true,
          receiptUrl: true,
          createdAt: true,
          subscription: {
            select: {
              plan: true,
              interval: true
            }
          }
        }
      }),
      prisma.invoice.count({
        where: whereClause
      })
    ]);

    // Log invoice access
    await createAuditLog({
      user_id: user.id,
      action: 'SUBSCRIPTION_UPDATED',
      metadata: {
        event: 'invoices_retrieved',
        count: invoices.length,
        total_count: totalCount,
        filters: queryParams,
        ip_address: clientIP
      },
      severity: 'INFO',
      category: 'billing'
    });

    // Return invoice data
    return new Response(
      JSON.stringify({
        success: true,
        invoices: invoices.map(invoice => ({
          id: invoice.id,
          stripe_invoice_id: invoice.stripeInvoiceId,
          number: invoice.number,
          description: invoice.description,
          amount: invoice.amount,
          amount_paid: invoice.amountPaid,
          currency: invoice.currency,
          status: invoice.status,
          invoice_date: invoice.invoiceDate,
          due_date: invoice.dueDate,
          paid_at: invoice.paidAt,
          period_start: invoice.periodStart,
          period_end: invoice.periodEnd,
          invoice_pdf: invoice.invoicePdf,
          receipt_url: invoice.receiptUrl,
          created_at: invoice.createdAt,
          subscription: invoice.subscription ? {
            plan: invoice.subscription.plan,
            interval: invoice.subscription.interval
          } : null
        })),
        pagination: {
          total: totalCount,
          limit: limit,
          offset: offset,
          has_more: offset + invoices.length < totalCount
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

  } catch (error: any) {
    console.error('Invoice retrieval error:', error);

    // Log critical system error
    await createAuditLog({
      user_id: userId,
      action: 'SECURITY_ALERT',
      metadata: {
        error: 'System error in invoice retrieval',
        error_message: error.message,
        error_stack: error.stack,
        email: userEmail,
        ip_address: clientIP,
        endpoint: '/api/billing/invoices'
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
 * Validate invoice query parameters
 * 
 * @param query - Query parameters
 * @returns Validation error message or null
 */
function validateInvoiceQuery(query: InvoiceQuery): string | null {
  // Validate limit
  if (query.limit !== undefined) {
    const limit = parseInt(query.limit);
    if (isNaN(limit) || limit < 1 || limit > 100) {
      return 'Limit must be a number between 1 and 100';
    }
  }

  // Validate offset
  if (query.offset !== undefined) {
    const offset = parseInt(query.offset);
    if (isNaN(offset) || offset < 0) {
      return 'Offset must be a non-negative number';
    }
  }

  // Validate status
  if (query.status !== undefined) {
    const validStatuses = ['PAID', 'PENDING', 'FAILED', 'REFUNDED'];
    if (!validStatuses.includes(query.status.toUpperCase())) {
      return `Status must be one of: ${validStatuses.join(', ')}`;
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
      // Log rate limit violation for billing endpoints
      await createAuditLog({
        action: 'SECURITY_ALERT',
        metadata: {
          error: 'Rate limit exceeded on invoice retrieval endpoint',
          rate_limit_type: type,
          ip_address: getClientIP(request),
          endpoint: '/api/billing/invoices'
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