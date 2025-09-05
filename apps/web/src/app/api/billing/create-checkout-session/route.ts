/**
 * Stripe Checkout Session Creation API Endpoint
 * 
 * SECURITY: This endpoint creates secure Stripe checkout sessions
 * with proper validation and audit logging.
 */

import { jwtVerify } from 'jose';
import { getUserByEmail, createAuditLog } from '../../../../lib/supabase';
import { stripe, stripeConfig } from '../../../../__create/stripe';
import { createRateLimitMiddleware } from '../../../../lib/rateLimit.js';

// Type definitions
interface CreateCheckoutRequest {
  plan_id: string;
  success_url?: string;
  cancel_url?: string;
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

// Subscription plan configurations
const SUBSCRIPTION_PLANS = {
  'pro_monthly': {
    name: 'Pro Monthly',
    price_id: process.env.STRIPE_PRO_MONTHLY_PRICE_ID,
    amount: 999, // $9.99 in cents
    interval: 'month'
  },
  'premium_yearly': {
    name: 'Premium Yearly',
    price_id: process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID,
    amount: 9999, // $99.99 in cents
    interval: 'year'
  }
} as const;

// Security: Validate that all price IDs are configured
const validateSubscriptionPlans = (): boolean => {
  for (const [planId, config] of Object.entries(SUBSCRIPTION_PLANS)) {
    if (!config.price_id || config.price_id === 'STRIPE_NOT_CONFIGURED') {
      console.warn(`Subscription plan ${planId} not configured - price_id missing`);
      return false;
    }
  }
  return true;
};

/**
 * Create Stripe checkout session
 * 
 * @param request - HTTP request object
 * @returns HTTP response with checkout URL
 */
export async function POST(request: Request): Promise<Response> {
  let clientIP = 'unknown';
  let userEmail = '';
  let userId = '';

  try {
    // Extract client information
    clientIP = getClientIP(request);

    // Security: Check if billing is enabled via feature flag
    if (process.env.ENABLE_BILLING !== 'true') {
      await createAuditLog({
        action: 'SECURITY_ALERT',
        metadata: {
          error: 'Billing attempt made but billing is disabled',
          ip_address: clientIP,
          endpoint: '/api/billing/create-checkout-session'
        },
        severity: 'WARN',
        category: 'security'
      });

      return new Response(
        JSON.stringify({ error: 'Billing is currently disabled' }),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Security: Check if Stripe is properly configured
    if (!stripeConfig.isConfigured) {
      await createAuditLog({
        action: 'SECURITY_ALERT',
        metadata: {
          error: 'Checkout attempted but Stripe not configured',
          ip_address: clientIP,
          endpoint: '/api/billing/create-checkout-session'
        },
        severity: 'ERROR',
        category: 'security'
      });

      return new Response(
        JSON.stringify({ error: 'Payment system is not available' }),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Security: Validate subscription plan configuration
    if (!validateSubscriptionPlans()) {
      await createAuditLog({
        action: 'SECURITY_ALERT',
        metadata: {
          error: 'Checkout attempted but subscription plans not configured',
          ip_address: clientIP,
          endpoint: '/api/billing/create-checkout-session'
        },
        severity: 'ERROR',
        category: 'security'
      });

      return new Response(
        JSON.stringify({ error: 'Payment plans are not available' }),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Apply rate limiting for checkout attempts (stricter limit)
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
          error: 'Invalid JWT token in checkout session creation',
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
    let requestData: CreateCheckoutRequest;
    try {
      requestData = await request.json();
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
    const validationError = validateCheckoutRequest(requestData);
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
          error: 'JWT token references non-existent user in checkout creation',
          jwt_email: payload.email,
          jwt_user_id: payload.userId,
          ip_address: clientIP,
          endpoint: '/api/billing/create-checkout-session'
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
          error: 'JWT userId mismatch with database user in checkout creation',
          jwt_user_id: payload.userId,
          database_user_id: user.id,
          email: user.email,
          ip_address: clientIP,
          endpoint: '/api/billing/create-checkout-session'
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

    const plan = SUBSCRIPTION_PLANS[requestData.plan_id as keyof typeof SUBSCRIPTION_PLANS];
    
    // Create Stripe customer if not exists (this would typically be stored in the database)
    let stripeCustomerId = user.stripe_customer_id; // Assuming this field exists
    
    if (!stripeCustomerId) {
      // In a real implementation, you'd create the customer in Stripe and store the ID
      // For now, we'll use the user email as customer reference
      stripeCustomerId = `customer_${user.id}`;
    }

    // Determine URLs
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const successUrl = requestData.success_url || `${baseUrl}/account/billing?success=true`;
    const cancelUrl = requestData.cancel_url || `${baseUrl}/account/billing?canceled=true`;

    // Create checkout session using the existing Stripe client
    try {
      const checkoutSession = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
          {
            price: plan.price_id,
            quantity: 1,
          },
        ],
        customer_email: user.email,
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          user_id: user.id,
          plan_id: requestData.plan_id,
        },
        subscription_data: {
          metadata: {
            user_id: user.id,
            plan_id: requestData.plan_id,
          },
        },
        // Allow promotion codes
        allow_promotion_codes: true,
        // Collect customer address for tax calculation
        billing_address_collection: 'auto',
      });

      // Log the checkout session creation
      await createAuditLog({
        user_id: user.id,
        action: 'SUBSCRIPTION_CREATED',
        metadata: {
          plan_id: requestData.plan_id,
          plan_name: plan.name,
          amount: plan.amount,
          stripe_session_id: checkoutSession.id,
          ip_address: clientIP
        },
        severity: 'INFO',
        category: 'billing'
      });

      return new Response(
        JSON.stringify({
          success: true,
          checkout_url: checkoutSession.url,
          session_id: checkoutSession.id
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
      console.error('Stripe checkout session creation failed:', stripeError);

      // Log Stripe error
      await createAuditLog({
        user_id: user.id,
        action: 'SECURITY_ALERT',
        metadata: {
          error: 'Stripe checkout session creation failed',
          stripe_error: stripeError.message,
          plan_id: requestData.plan_id,
          ip_address: clientIP
        },
        severity: 'ERROR',
        category: 'billing'
      });

      return new Response(
        JSON.stringify({ 
          error: 'Failed to create checkout session'
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

  } catch (error: any) {
    console.error('Checkout session creation error:', error);

    // Log critical system error
    await createAuditLog({
      user_id: userId,
      action: 'SECURITY_ALERT',
      metadata: {
        error: 'System error in checkout session creation',
        error_message: error.message,
        error_stack: error.stack,
        email: userEmail,
        ip_address: clientIP,
        endpoint: '/api/billing/create-checkout-session'
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
 * Validate checkout request data with comprehensive security checks
 * 
 * @param data - Checkout request data
 * @returns Validation error message or null
 */
function validateCheckoutRequest(data: CreateCheckoutRequest): string | null {
  if (!data || typeof data !== 'object') {
    return 'Invalid request data';
  }

  // Validate plan_id
  if (!data.plan_id || typeof data.plan_id !== 'string') {
    return 'Plan ID is required and must be a string';
  }

  const trimmedPlanId = data.plan_id.trim();
  if (trimmedPlanId.length === 0) {
    return 'Plan ID cannot be empty';
  }

  // Security: Check for malicious patterns
  const dangerousPatterns = [
    /[<>\"\'&]/,          // HTML/script injection characters
    /javascript:/i,       // JavaScript protocol
    /data:/i,            // Data URLs
    /vbscript:/i,        // VBScript
    /%[0-9a-f]{2}/i,     // URL encoding
    /\\x[0-9a-f]{2}/i,   // Hex encoding
    /[\x00-\x1f\x7f]/,   // Control characters
    /\.\./,              // Path traversal
  ];

  if (dangerousPatterns.some(pattern => pattern.test(trimmedPlanId))) {
    return 'Plan ID contains invalid characters';
  }

  // Validate against allowed plan IDs
  if (!SUBSCRIPTION_PLANS[trimmedPlanId as keyof typeof SUBSCRIPTION_PLANS]) {
    return 'Invalid plan ID';
  }

  // Validate success_url if provided
  if (data.success_url !== undefined) {
    if (typeof data.success_url !== 'string') {
      return 'Success URL must be a string';
    }
    
    const trimmedUrl = data.success_url.trim();
    if (trimmedUrl.length > 0) {
      try {
        const url = new URL(trimmedUrl);
        // Only allow HTTPS URLs (or HTTP for localhost in development)
        if (url.protocol !== 'https:' && !(url.protocol === 'http:' && url.hostname === 'localhost')) {
          return 'Success URL must use HTTPS';
        }
      } catch {
        return 'Invalid success URL format';
      }
    }
  }

  // Validate cancel_url if provided
  if (data.cancel_url !== undefined) {
    if (typeof data.cancel_url !== 'string') {
      return 'Cancel URL must be a string';
    }
    
    const trimmedUrl = data.cancel_url.trim();
    if (trimmedUrl.length > 0) {
      try {
        const url = new URL(trimmedUrl);
        // Only allow HTTPS URLs (or HTTP for localhost in development)
        if (url.protocol !== 'https:' && !(url.protocol === 'http:' && url.hostname === 'localhost')) {
          return 'Cancel URL must use HTTPS';
        }
      } catch {
        return 'Invalid cancel URL format';
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
      // Log rate limit violation for checkout endpoints
      await createAuditLog({
        action: 'SECURITY_ALERT',
        metadata: {
          error: 'Rate limit exceeded on checkout endpoint',
          rate_limit_type: type,
          ip_address: getClientIP(request),
          endpoint: '/api/billing/create-checkout-session'
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