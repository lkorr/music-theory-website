/**
 * Stripe Webhook Handler
 * 
 * SECURITY: This endpoint handles Stripe webhooks with signature verification
 * and comprehensive audit logging for all subscription events.
 */

import { stripe, stripeConfig } from '../../../../__create/stripe';
import { createAuditLog } from '../../../../lib/supabase';
import { PrismaClient } from '@prisma/client';
import { createRateLimitMiddleware } from '../../../../lib/rateLimit.js';

const prisma = new PrismaClient();

// Security constants
const MAX_REQUEST_SIZE = 50 * 1024; // 50KB limit for webhook payloads
const WEBHOOK_TOLERANCE_SECONDS = 300; // 5 minutes tolerance for timestamps
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Stripe's webhook IP ranges (as of 2024)
const STRIPE_WEBHOOK_IPS = [
  '3.18.12.63',
  '3.130.192.231', 
  '13.235.14.237',
  '13.235.122.149',
  '18.211.135.69',
  '35.154.171.200',
  '52.15.183.38',
  '54.88.130.119',
  '54.88.130.237',
  '54.187.174.169',
  '54.187.205.235',
  '54.187.216.72'
];

// Security: Only require webhook secret if Stripe is configured
if (stripeConfig.isConfigured && (!STRIPE_WEBHOOK_SECRET || STRIPE_WEBHOOK_SECRET === 'STRIPE_NOT_CONFIGURED')) {
  console.warn('STRIPE_WEBHOOK_SECRET not configured - webhook signature verification will fail');
}

/**
 * Handle Stripe webhook events
 * 
 * @param request - HTTP request object
 * @returns HTTP response
 */
export async function POST(request: Request): Promise<Response> {
  let eventType = 'unknown';
  let customerId = '';
  let subscriptionId = '';
  let eventId = '';
  let clientIP = 'unknown';

  try {
    // Extract client IP for security logging
    clientIP = getClientIP(request);

    // Security: Check if Stripe is configured
    if (!stripeConfig.isConfigured) {
      await createAuditLog({
        action: 'SECURITY_ALERT',
        metadata: {
          error: 'Webhook received but Stripe not configured',
          ip_address: clientIP,
          endpoint: '/api/webhooks/stripe'
        },
        severity: 'WARN',
        category: 'security'
      });

      return new Response('Stripe not configured', { status: 503 });
    }

    // Security: Enforce request size limit
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > MAX_REQUEST_SIZE) {
      await createAuditLog({
        action: 'SECURITY_ALERT',
        metadata: {
          error: 'Webhook request exceeds size limit',
          content_length: contentLength,
          max_allowed: MAX_REQUEST_SIZE,
          ip_address: clientIP,
          endpoint: '/api/webhooks/stripe'
        },
        severity: 'WARN',
        category: 'security'
      });

      return new Response('Request too large', { status: 413 });
    }

    // Security: IP allowlist check (only in production)
    if (NODE_ENV === 'production' && !isStripeIP(clientIP)) {
      await createAuditLog({
        action: 'SECURITY_ALERT',
        metadata: {
          error: 'Webhook request from unauthorized IP',
          ip_address: clientIP,
          endpoint: '/api/webhooks/stripe'
        },
        severity: 'ERROR',
        category: 'security'
      });

      return new Response('Unauthorized', { status: 403 });
    }

    // Apply webhook-specific rate limiting
    const rateLimitResult = await applyWebhookRateLimit(request);
    if (rateLimitResult) {
      return rateLimitResult;
    }

    // Get raw body for signature verification
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      await createAuditLog({
        action: 'SECURITY_ALERT',
        metadata: {
          error: 'Missing Stripe signature in webhook',
          ip_address: clientIP,
          endpoint: '/api/webhooks/stripe'
        },
        severity: 'WARN',
        category: 'security'
      });

      return new Response('Missing signature', { status: 400 });
    }

    // Verify webhook signature using Stripe's secure verification
    let event: Stripe.Event;
    try {
      event = Stripe.webhooks.constructEvent(
        body,
        signature,
        STRIPE_WEBHOOK_SECRET,
        WEBHOOK_TOLERANCE_SECONDS
      );
      
      eventType = event.type;
      eventId = event.id;
      
      // Extract customer and subscription IDs for logging
      if ((event.data.object as any).customer) {
        customerId = (event.data.object as any).customer;
      }
      if ((event.data.object as any).id && event.type.includes('subscription')) {
        subscriptionId = (event.data.object as any).id;
      }
      
    } catch (error: any) {
      await createAuditLog({
        action: 'SECURITY_ALERT',
        metadata: {
          error: 'Failed Stripe webhook signature verification',
          signature_present: !!signature,
          error_message: error.message,
          ip_address: clientIP,
          endpoint: '/api/webhooks/stripe',
          attempted_event_type: 'unknown'
        },
        severity: 'ERROR',
        category: 'security'
      });

      return new Response('Webhook signature verification failed', { status: 400 });
    }

    // Security: Check for duplicate webhook events (idempotency)
    const existingEvent = await checkWebhookIdempotency(eventId);
    if (existingEvent) {
      await createAuditLog({
        action: 'SUBSCRIPTION_UPDATED',
        metadata: {
          event: 'duplicate_webhook_ignored',
          webhook_event_id: eventId,
          webhook_event_type: eventType,
          ip_address: clientIP,
          first_processed_at: existingEvent.processedAt
        },
        severity: 'INFO',
        category: 'billing'
      });

      // Return success for duplicate events to avoid retry loops
      return new Response('Event already processed', { status: 200 });
    }

    // Record this webhook event for idempotency
    await recordWebhookEvent(eventId, eventType);

    // Log webhook received
    await createAuditLog({
      action: 'SUBSCRIPTION_UPDATED',
      metadata: {
        webhook_event_type: eventType,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        event_id: eventId,
        ip_address: clientIP
      },
      severity: 'INFO',
      category: 'billing'
    });

    // Handle different event types
    switch (event.type) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;
        
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
        
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
        
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object);
        break;
        
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object);
        break;
        
      case 'customer.created':
        await handleCustomerCreated(event.data.object);
        break;
        
      case 'payment_method.attached':
        await handlePaymentMethodAttached(event.data.object);
        break;
        
      default:
        console.log(`Unhandled webhook event type: ${event.type}`);
        // Log unhandled events for potential future implementation
        await createAuditLog({
          action: 'SUBSCRIPTION_UPDATED',
          metadata: {
            webhook_event_type: eventType,
            status: 'unhandled',
            stripe_customer_id: customerId,
            event_id: event.id
          },
          severity: 'INFO',
          category: 'billing'
        });
        break;
    }

    return new Response('Webhook processed successfully', { status: 200 });

  } catch (error: any) {
    console.error('Stripe webhook processing error:', error);

    // Log critical webhook processing error
    await createAuditLog({
      action: 'SECURITY_ALERT',
      metadata: {
        error: 'Critical error processing Stripe webhook',
        webhook_event_type: eventType,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        error_message: error.message,
        error_stack: error.stack,
        endpoint: '/api/webhooks/stripe'
      },
      severity: 'CRITICAL',
      category: 'security'
    });

    return new Response('Webhook processing failed', { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Handle subscription created event
 */
async function handleSubscriptionCreated(subscription: any) {
  try {
    const userId = subscription.metadata?.user_id;
    const planId = subscription.metadata?.plan_id;

    if (!userId) {
      console.error('No user_id in subscription metadata');
      return;
    }

    // Map Stripe subscription to our database
    const subscriptionPlan = mapStripePlanToDatabase(planId);
    const subscriptionStatus = mapStripeStatusToDatabase(subscription.status);

    await prisma.subscription.upsert({
      where: {
        userId: userId
      },
      update: {
        status: subscriptionStatus,
        plan: subscriptionPlan,
        stripeSubscriptionId: subscription.id,
        stripePriceId: subscription.items.data[0]?.price?.id,
        amount: subscription.items.data[0]?.price?.unit_amount,
        currency: subscription.currency,
        interval: subscription.items.data[0]?.price?.recurring?.interval === 'month' ? 'MONTHLY' : 'YEARLY',
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        trialEndsAt: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        updatedAt: new Date()
      },
      create: {
        userId: userId,
        plan: subscriptionPlan,
        status: subscriptionStatus,
        stripeCustomerId: subscription.customer,
        stripeSubscriptionId: subscription.id,
        stripePriceId: subscription.items.data[0]?.price?.id,
        amount: subscription.items.data[0]?.price?.unit_amount,
        currency: subscription.currency,
        interval: subscription.items.data[0]?.price?.recurring?.interval === 'month' ? 'MONTHLY' : 'YEARLY',
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        startDate: new Date(subscription.created * 1000),
        trialEndsAt: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
        cancelAtPeriodEnd: subscription.cancel_at_period_end
      }
    });

    await createAuditLog({
      user_id: userId,
      action: 'SUBSCRIPTION_CREATED',
      metadata: {
        stripe_subscription_id: subscription.id,
        plan: subscriptionPlan,
        status: subscriptionStatus,
        amount: subscription.items.data[0]?.price?.unit_amount,
        webhook_source: true
      },
      severity: 'INFO',
      category: 'billing'
    });

  } catch (error: any) {
    console.error('Error handling subscription created:', error);
    throw error;
  }
}

/**
 * Handle subscription updated event
 */
async function handleSubscriptionUpdated(subscription: any) {
  try {
    const userId = subscription.metadata?.user_id;
    
    if (!userId) {
      console.error('No user_id in subscription metadata');
      return;
    }

    const subscriptionStatus = mapStripeStatusToDatabase(subscription.status);

    await prisma.subscription.update({
      where: {
        stripeSubscriptionId: subscription.id
      },
      data: {
        status: subscriptionStatus,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        cancelledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
        updatedAt: new Date()
      }
    });

    await createAuditLog({
      user_id: userId,
      action: 'SUBSCRIPTION_UPDATED',
      metadata: {
        stripe_subscription_id: subscription.id,
        new_status: subscriptionStatus,
        cancel_at_period_end: subscription.cancel_at_period_end,
        webhook_source: true
      },
      severity: 'INFO',
      category: 'billing'
    });

  } catch (error: any) {
    console.error('Error handling subscription updated:', error);
    throw error;
  }
}

/**
 * Handle subscription deleted event
 */
async function handleSubscriptionDeleted(subscription: any) {
  try {
    const userId = subscription.metadata?.user_id;
    
    if (!userId) {
      console.error('No user_id in subscription metadata');
      return;
    }

    await prisma.subscription.update({
      where: {
        stripeSubscriptionId: subscription.id
      },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        endDate: new Date(),
        updatedAt: new Date()
      }
    });

    await createAuditLog({
      user_id: userId,
      action: 'SUBSCRIPTION_CANCELLED',
      metadata: {
        stripe_subscription_id: subscription.id,
        cancellation_reason: 'stripe_webhook',
        webhook_source: true
      },
      severity: 'INFO',
      category: 'billing'
    });

  } catch (error: any) {
    console.error('Error handling subscription deleted:', error);
    throw error;
  }
}

/**
 * Handle invoice payment succeeded
 */
async function handleInvoicePaymentSucceeded(invoice: any) {
  try {
    const userId = invoice.subscription_metadata?.user_id || invoice.metadata?.user_id;
    
    if (!userId) {
      console.error('No user_id in invoice metadata');
      return;
    }

    // Find subscription if it exists
    const subscription = await prisma.subscription.findFirst({
      where: {
        stripeSubscriptionId: invoice.subscription
      }
    });

    await prisma.invoice.upsert({
      where: {
        stripeInvoiceId: invoice.id
      },
      update: {
        status: 'PAID',
        amountPaid: invoice.amount_paid,
        paidAt: new Date(invoice.status_transitions?.paid_at * 1000),
        updatedAt: new Date()
      },
      create: {
        userId: userId,
        subscriptionId: subscription?.id,
        stripeInvoiceId: invoice.id,
        number: invoice.number,
        description: invoice.description || 'Subscription payment',
        amount: invoice.amount_due,
        amountPaid: invoice.amount_paid,
        currency: invoice.currency,
        status: 'PAID',
        invoiceDate: new Date(invoice.created * 1000),
        paidAt: new Date(invoice.status_transitions?.paid_at * 1000),
        invoicePdf: invoice.invoice_pdf,
        receiptUrl: invoice.receipt_number_url,
        periodStart: invoice.period_start ? new Date(invoice.period_start * 1000) : null,
        periodEnd: invoice.period_end ? new Date(invoice.period_end * 1000) : null
      }
    });

    await createAuditLog({
      user_id: userId,
      action: 'SUBSCRIPTION_UPDATED',
      metadata: {
        event: 'payment_succeeded',
        stripe_invoice_id: invoice.id,
        amount: invoice.amount_paid,
        currency: invoice.currency,
        webhook_source: true
      },
      severity: 'INFO',
      category: 'billing'
    });

  } catch (error: any) {
    console.error('Error handling invoice payment succeeded:', error);
    throw error;
  }
}

/**
 * Handle invoice payment failed
 */
async function handleInvoicePaymentFailed(invoice: any) {
  try {
    const userId = invoice.subscription_metadata?.user_id || invoice.metadata?.user_id;
    
    if (!userId) {
      console.error('No user_id in invoice metadata');
      return;
    }

    await createAuditLog({
      user_id: userId,
      action: 'SECURITY_ALERT',
      metadata: {
        event: 'payment_failed',
        stripe_invoice_id: invoice.id,
        amount: invoice.amount_due,
        currency: invoice.currency,
        attempt_count: invoice.attempt_count,
        webhook_source: true
      },
      severity: 'WARN',
      category: 'billing'
    });

    // Update subscription status if payment fails multiple times
    if (invoice.attempt_count >= 3) {
      await prisma.subscription.updateMany({
        where: {
          stripeSubscriptionId: invoice.subscription
        },
        data: {
          status: 'PAST_DUE',
          updatedAt: new Date()
        }
      });
    }

  } catch (error: any) {
    console.error('Error handling invoice payment failed:', error);
    throw error;
  }
}

/**
 * Handle customer created
 */
async function handleCustomerCreated(customer: any) {
  await createAuditLog({
    action: 'SUBSCRIPTION_UPDATED',
    metadata: {
      event: 'customer_created',
      stripe_customer_id: customer.id,
      email: customer.email,
      webhook_source: true
    },
    severity: 'INFO',
    category: 'billing'
  });
}

/**
 * Handle payment method attached
 */
async function handlePaymentMethodAttached(paymentMethod: any) {
  try {
    // This would typically update the user's payment methods
    await createAuditLog({
      action: 'SUBSCRIPTION_UPDATED',
      metadata: {
        event: 'payment_method_attached',
        stripe_payment_method_id: paymentMethod.id,
        stripe_customer_id: paymentMethod.customer,
        type: paymentMethod.type,
        webhook_source: true
      },
      severity: 'INFO',
      category: 'billing'
    });

  } catch (error: any) {
    console.error('Error handling payment method attached:', error);
    throw error;
  }
}

/**
 * Map Stripe plan ID to database enum
 */
function mapStripePlanToDatabase(planId: string) {
  switch (planId) {
    case 'pro_monthly':
      return 'PRO';
    case 'premium_yearly':
      return 'PREMIUM';
    default:
      return 'FREE';
  }
}

/**
 * Map Stripe subscription status to database enum
 */
function mapStripeStatusToDatabase(status: string) {
  switch (status) {
    case 'active':
      return 'ACTIVE';
    case 'past_due':
      return 'PAST_DUE';
    case 'canceled':
    case 'cancelled':
      return 'CANCELLED';
    case 'incomplete':
    case 'incomplete_expired':
      return 'INCOMPLETE';
    case 'trialing':
      return 'TRIAL';
    default:
      return 'INCOMPLETE';
  }
}

/**
 * Handle unsupported HTTP methods
 */
export async function GET(): Promise<Response> {
  return new Response('Method not allowed', { status: 405 });
}

export const PUT = GET;
export const DELETE = GET;
export const PATCH = GET;

/**
 * Extract client IP address from request headers
 * 
 * @param request - HTTP request
 * @returns Client IP address
 */
function getClientIP(request: Request): string {
  const headers = [
    'x-forwarded-for',
    'x-real-ip', 
    'cf-connecting-ip',
    'x-client-ip',
    'x-cluster-client-ip'
  ];

  for (const header of headers) {
    const value = request.headers.get(header);
    if (value) {
      // Take first IP if comma-separated list
      const ip = value.split(',')[0].trim();
      if (ip && ip !== 'unknown') {
        return ip;
      }
    }
  }

  return 'unknown';
}

/**
 * Check if IP address is from Stripe's webhook servers
 * 
 * @param ip - IP address to check
 * @returns True if IP is authorized
 */
function isStripeIP(ip: string): boolean {
  if (ip === 'unknown') return false;
  
  // Allow localhost for development
  if (NODE_ENV !== 'production' && (ip === '127.0.0.1' || ip === '::1')) {
    return true;
  }
  
  return STRIPE_WEBHOOK_IPS.includes(ip);
}

/**
 * Apply webhook-specific rate limiting
 * 
 * @param request - HTTP request
 * @returns Response if rate limited, null otherwise
 */
async function applyWebhookRateLimit(request: Request): Promise<Response | null> {
  try {
    const rateLimitMiddleware = createRateLimitMiddleware('webhook');
    const context = {};
    
    const result = await rateLimitMiddleware(request, context);
    
    if (result) {
      await createAuditLog({
        action: 'SECURITY_ALERT',
        metadata: {
          error: 'Webhook rate limit exceeded',
          ip_address: getClientIP(request),
          endpoint: '/api/webhooks/stripe'
        },
        severity: 'WARN',
        category: 'security'
      });
    }
    
    return result;
  } catch (error: any) {
    console.error('Webhook rate limiting error:', error);
    // Don't block webhooks on rate limit errors
    return null;
  }
}

/**
 * Check if webhook event has already been processed (idempotency)
 * 
 * @param eventId - Stripe event ID
 * @returns Existing event record if found
 */
async function checkWebhookIdempotency(eventId: string) {
  try {
    return await prisma.webhookEvent.findUnique({
      where: { stripeEventId: eventId },
      select: { id: true, processedAt: true }
    });
  } catch (error: any) {
    // If table doesn't exist yet, assume event is new
    console.warn('Webhook idempotency check failed:', error.message);
    return null;
  }
}

/**
 * Record webhook event for idempotency tracking
 * 
 * @param eventId - Stripe event ID
 * @param eventType - Stripe event type
 */
async function recordWebhookEvent(eventId: string, eventType: string): Promise<void> {
  try {
    await prisma.webhookEvent.create({
      data: {
        stripeEventId: eventId,
        eventType: eventType,
        processedAt: new Date()
      }
    });
  } catch (error: any) {
    // Log error but don't fail webhook processing
    console.error('Failed to record webhook event:', error.message);
  }
}