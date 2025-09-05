/**
 * Stripe Test Utilities
 * 
 * Utility functions for testing Stripe payment flows without spending money.
 * Includes test data creation, webhook simulation, and payment flow testing.
 */

import { PrismaClient } from '@prisma/client';
import { createAuditLog } from '../supabase';
import { getStripeConfig, STRIPE_TEST_CARDS, isTestMode } from '../stripe-config';

const prisma = new PrismaClient();

/**
 * Test user creation interface
 */
interface TestUser {
  email: string;
  name: string;
  role?: 'FREE' | 'PRO' | 'PREMIUM';
}

/**
 * Test subscription data interface
 */
interface TestSubscription {
  userId: string;
  plan: 'PRO' | 'PREMIUM';
  status: 'ACTIVE' | 'TRIAL' | 'PAST_DUE' | 'CANCELLED';
  interval: 'MONTHLY' | 'YEARLY';
  amount: number;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

/**
 * Test invoice data interface
 */
interface TestInvoice {
  userId: string;
  subscriptionId: string;
  amount: number;
  status: 'PAID' | 'PENDING' | 'FAILED';
  description: string;
}

/**
 * Create test user for payment testing
 * 
 * @param userData - Test user data
 * @returns Created user
 */
export async function createTestUser(userData: TestUser) {
  if (!isTestMode()) {
    throw new Error('Test user creation is only allowed in test mode');
  }

  try {
    const testUser = await prisma.user.create({
      data: {
        email: userData.email,
        name: userData.name,
        role: userData.role || 'FREE',
        emailVerified: new Date(),
        // Add test- prefix to identify test users
        id: `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }
    });

    await createAuditLog({
      user_id: testUser.id,
      action: 'USER_REGISTERED',
      metadata: {
        test_user: true,
        email: testUser.email,
        role: testUser.role
      },
      severity: 'INFO',
      category: 'auth'
    });

    return testUser;
  } catch (error) {
    console.error('Failed to create test user:', error);
    throw error;
  }
}

/**
 * Create test subscription
 * 
 * @param subscriptionData - Test subscription data
 * @returns Created subscription
 */
export async function createTestSubscription(subscriptionData: TestSubscription) {
  if (!isTestMode()) {
    throw new Error('Test subscription creation is only allowed in test mode');
  }

  try {
    const config = getStripeConfig();
    const stripePriceId = subscriptionData.plan === 'PRO' 
      ? config.priceIds.proMonthly
      : config.priceIds.premiumYearly;

    const testSubscription = await prisma.subscription.create({
      data: {
        userId: subscriptionData.userId,
        plan: subscriptionData.plan,
        status: subscriptionData.status,
        interval: subscriptionData.interval,
        amount: subscriptionData.amount,
        currency: 'usd',
        stripeCustomerId: subscriptionData.stripeCustomerId || `cus_test_${Date.now()}`,
        stripeSubscriptionId: subscriptionData.stripeSubscriptionId || `sub_test_${Date.now()}`,
        stripePriceId: stripePriceId,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + (subscriptionData.interval === 'MONTHLY' ? 30 : 365) * 24 * 60 * 60 * 1000),
        startDate: new Date(),
        trialEndsAt: subscriptionData.status === 'TRIAL' ? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) : null
      }
    });

    await createAuditLog({
      user_id: subscriptionData.userId,
      action: 'SUBSCRIPTION_CREATED',
      metadata: {
        test_subscription: true,
        plan: subscriptionData.plan,
        status: subscriptionData.status,
        stripe_subscription_id: testSubscription.stripeSubscriptionId
      },
      severity: 'INFO',
      category: 'billing'
    });

    return testSubscription;
  } catch (error) {
    console.error('Failed to create test subscription:', error);
    throw error;
  }
}

/**
 * Create test invoice
 * 
 * @param invoiceData - Test invoice data
 * @returns Created invoice
 */
export async function createTestInvoice(invoiceData: TestInvoice) {
  if (!isTestMode()) {
    throw new Error('Test invoice creation is only allowed in test mode');
  }

  try {
    const testInvoice = await prisma.invoice.create({
      data: {
        userId: invoiceData.userId,
        subscriptionId: invoiceData.subscriptionId,
        stripeInvoiceId: `in_test_${Date.now()}`,
        number: `TEST-${Date.now()}`,
        description: invoiceData.description,
        amount: invoiceData.amount,
        amountPaid: invoiceData.status === 'PAID' ? invoiceData.amount : 0,
        currency: 'usd',
        status: invoiceData.status,
        invoiceDate: new Date(),
        paidAt: invoiceData.status === 'PAID' ? new Date() : null,
        periodStart: new Date(),
        periodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    });

    await createAuditLog({
      user_id: invoiceData.userId,
      action: 'SUBSCRIPTION_UPDATED',
      metadata: {
        event: 'test_invoice_created',
        test_invoice: true,
        stripe_invoice_id: testInvoice.stripeInvoiceId,
        amount: invoiceData.amount,
        status: invoiceData.status
      },
      severity: 'INFO',
      category: 'billing'
    });

    return testInvoice;
  } catch (error) {
    console.error('Failed to create test invoice:', error);
    throw error;
  }
}

/**
 * Simulate webhook event processing
 * 
 * @param eventType - Stripe event type
 * @param eventData - Event data
 * @returns Simulation result
 */
export async function simulateWebhookEvent(eventType: string, eventData: any) {
  if (!isTestMode()) {
    throw new Error('Webhook simulation is only allowed in test mode');
  }

  try {
    // Create test webhook event record
    const testEventId = `evt_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await prisma.webhookEvent.create({
      data: {
        stripeEventId: testEventId,
        eventType: eventType,
        processedAt: new Date(),
        processingTime: Math.floor(Math.random() * 1000) + 100, // Simulate processing time
        success: true
      }
    });

    await createAuditLog({
      action: 'SUBSCRIPTION_UPDATED',
      metadata: {
        event: 'webhook_simulation',
        test_webhook: true,
        webhook_event_type: eventType,
        webhook_event_id: testEventId,
        event_data: eventData
      },
      severity: 'INFO',
      category: 'billing'
    });

    return {
      success: true,
      eventId: testEventId,
      eventType: eventType,
      processedAt: new Date()
    };
  } catch (error) {
    console.error('Failed to simulate webhook event:', error);
    throw error;
  }
}

/**
 * Generate test payment scenarios
 * 
 * @returns Array of test scenarios
 */
export function generateTestScenarios() {
  if (!isTestMode()) {
    throw new Error('Test scenarios are only available in test mode');
  }

  return [
    {
      name: 'Successful Subscription Creation',
      description: 'Test successful subscription creation with valid payment method',
      testCard: STRIPE_TEST_CARDS.VISA_SUCCESS,
      expectedOutcome: 'success',
      steps: [
        'Create checkout session',
        'Use test card 4242424242424242',
        'Complete payment',
        'Verify subscription created',
        'Check webhook processing'
      ]
    },
    {
      name: 'Failed Payment - Declined Card',
      description: 'Test subscription creation with declined payment method',
      testCard: STRIPE_TEST_CARDS.CARD_DECLINED,
      expectedOutcome: 'failure',
      steps: [
        'Create checkout session',
        'Use test card 4000000000000002',
        'Attempt payment',
        'Verify payment declined',
        'Check error handling'
      ]
    },
    {
      name: 'Subscription Cancellation',
      description: 'Test subscription cancellation flow',
      testCard: STRIPE_TEST_CARDS.VISA_SUCCESS,
      expectedOutcome: 'success',
      steps: [
        'Create active subscription',
        'Call cancellation endpoint',
        'Verify subscription cancelled',
        'Check webhook processing'
      ]
    },
    {
      name: '3D Secure Authentication',
      description: 'Test payment requiring 3D Secure authentication',
      testCard: STRIPE_TEST_CARDS.REQUIRE_AUTHENTICATION,
      expectedOutcome: 'requires_action',
      steps: [
        'Create checkout session',
        'Use test card 4000002500003155',
        'Trigger 3D Secure flow',
        'Complete authentication',
        'Verify payment succeeded'
      ]
    },
    {
      name: 'Insufficient Funds',
      description: 'Test payment failure due to insufficient funds',
      testCard: STRIPE_TEST_CARDS.INSUFFICIENT_FUNDS,
      expectedOutcome: 'failure',
      steps: [
        'Create checkout session',
        'Use test card 4000000000009995',
        'Attempt payment',
        'Verify insufficient funds error',
        'Check retry logic'
      ]
    }
  ];
}

/**
 * Clean up test data
 * 
 * @param testUserId - Test user ID to clean up
 */
export async function cleanupTestData(testUserId?: string) {
  if (!isTestMode()) {
    throw new Error('Test data cleanup is only allowed in test mode');
  }

  try {
    const whereClause = testUserId 
      ? { userId: testUserId }
      : { user: { id: { startsWith: 'test-' } } };

    // Clean up in correct order due to foreign key constraints
    await prisma.invoice.deleteMany({ where: whereClause });
    await prisma.subscription.deleteMany({ where: whereClause });
    await prisma.auditLog.deleteMany({ where: { userId: testUserId || { startsWith: 'test-' } } });
    
    if (testUserId) {
      await prisma.user.delete({ where: { id: testUserId } });
    } else {
      await prisma.user.deleteMany({ where: { id: { startsWith: 'test-' } } });
    }

    // Clean up test webhook events
    await prisma.webhookEvent.deleteMany({
      where: {
        stripeEventId: {
          startsWith: 'evt_test_'
        }
      }
    });

    console.log('Test data cleanup completed');
  } catch (error) {
    console.error('Failed to cleanup test data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Get test environment status
 * 
 * @returns Test environment information
 */
export function getTestEnvironmentInfo() {
  const config = getStripeConfig();
  
  return {
    isTestMode: config.isTestMode,
    nodeEnv: process.env.NODE_ENV,
    stripePublicKey: config.publicKey.substr(0, 12) + '...',
    hasTestCards: Object.keys(STRIPE_TEST_CARDS).length > 0,
    availableScenarios: generateTestScenarios().length,
    databaseUrl: process.env.DATABASE_URL?.includes('localhost') || 
                  process.env.DATABASE_URL?.includes('127.0.0.1') ? 'local' : 'remote'
  };
}

/**
 * Validate test environment setup
 * 
 * @throws Error if test environment is not properly configured
 */
export async function validateTestEnvironment() {
  if (!isTestMode()) {
    throw new Error('Not running in test mode');
  }

  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    
    // Check required environment variables
    const requiredEnvVars = [
      'AUTH_SECRET',
      'DATABASE_URL',
      'STRIPE_PUBLIC_KEY',
      'STRIPE_SECRET_KEY',
      'STRIPE_WEBHOOK_SECRET'
    ];
    
    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        throw new Error(`Missing required environment variable: ${envVar}`);
      }
    }
    
    console.log('✅ Test environment validation passed');
    return true;
  } catch (error) {
    console.error('❌ Test environment validation failed:', error);
    throw error;
  }
}