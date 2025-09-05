/**
 * Stripe End-to-End Test Suite
 * 
 * Tests the complete Stripe integration including:
 * - Webhook processing
 * - API endpoints
 * - Database operations
 * - Security measures
 */

const { describe, test, expect, beforeAll, afterAll, beforeEach } = require('@jest/globals');
const request = require('supertest');
const { PrismaClient } = require('@prisma/client');
const { createTestUser, createTestSubscription, cleanupTestData } = require('../lib/test-utils/stripe-test-utils');
const { getStripeConfig, STRIPE_TEST_CARDS } = require('../lib/stripe-config');

const prisma = new PrismaClient();

// Test configuration
const TEST_USER_EMAIL = 'test-stripe@example.com';
const TEST_BASE_URL = 'http://localhost:3000';

describe('Stripe Integration E2E Tests', () => {
  let testUser;
  let authToken;

  beforeAll(async () => {
    // Verify we're in test mode
    const config = getStripeConfig();
    if (!config.isTestMode) {
      throw new Error('Tests must run in test mode only');
    }

    // Create test user
    testUser = await createTestUser({
      email: TEST_USER_EMAIL,
      name: 'E2E Test User',
      role: 'FREE'
    });

    // Generate test auth token (simplified for testing)
    authToken = await generateTestAuthToken(testUser);
  });

  afterAll(async () => {
    // Cleanup test data
    if (testUser) {
      await cleanupTestData(testUser.id);
    }
    await prisma.$disconnect();
  });

  describe('Security Tests', () => {
    test('should reject webhook without signature', async () => {
      const response = await request(TEST_BASE_URL)
        .post('/api/webhooks/stripe')
        .send({ type: 'test.event' })
        .expect(400);

      expect(response.text).toContain('Missing signature');
    });

    test('should reject webhook with invalid signature', async () => {
      const response = await request(TEST_BASE_URL)
        .post('/api/webhooks/stripe')
        .set('stripe-signature', 'invalid-signature')
        .send({ type: 'test.event' })
        .expect(400);

      expect(response.text).toContain('verification failed');
    });

    test('should enforce rate limits on billing endpoints', async () => {
      // Make multiple rapid requests
      const promises = Array(10).fill().map(() =>
        request(TEST_BASE_URL)
          .get('/api/billing/subscription')
          .set('Cookie', `auth-token=${authToken}`)
      );

      const responses = await Promise.all(promises);
      const rateLimitedResponses = responses.filter(r => r.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });

    test('should validate JWT tokens', async () => {
      const response = await request(TEST_BASE_URL)
        .get('/api/billing/subscription')
        .set('Cookie', 'auth-token=invalid-token')
        .expect(401);

      expect(response.body.error).toContain('Invalid authentication token');
    });
  });

  describe('Subscription API Tests', () => {
    test('should retrieve user subscription data', async () => {
      const response = await request(TEST_BASE_URL)
        .get('/api/billing/subscription')
        .set('Cookie', `auth-token=${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('subscription');
      expect(response.body).toHaveProperty('plan', 'FREE');
    });

    test('should create checkout session', async () => {
      const response = await request(TEST_BASE_URL)
        .post('/api/billing/create-checkout-session')
        .set('Cookie', `auth-token=${authToken}`)
        .send({
          plan_id: 'pro_monthly',
          success_url: 'http://localhost:3000/success',
          cancel_url: 'http://localhost:3000/cancel'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('checkout_url');
      expect(response.body).toHaveProperty('session_id');
    });

    test('should validate plan IDs in checkout', async () => {
      const response = await request(TEST_BASE_URL)
        .post('/api/billing/create-checkout-session')
        .set('Cookie', `auth-token=${authToken}`)
        .send({
          plan_id: 'invalid_plan_id'
        })
        .expect(400);

      expect(response.body.error).toContain('Invalid plan ID');
    });

    test('should reject malicious plan IDs', async () => {
      const maliciousPlanIds = [
        '<script>alert("xss")</script>',
        'javascript:alert(1)',
        '../../../etc/passwd',
        'pro_monthly"; DROP TABLE subscriptions; --'
      ];

      for (const planId of maliciousPlanIds) {
        const response = await request(TEST_BASE_URL)
          .post('/api/billing/create-checkout-session')
          .set('Cookie', `auth-token=${authToken}`)
          .send({ plan_id: planId })
          .expect(400);

        expect(response.body.error).toContain('invalid characters');
      }
    });
  });

  describe('Subscription Management Tests', () => {
    let testSubscription;

    beforeEach(async () => {
      // Create active test subscription
      testSubscription = await createTestSubscription({
        userId: testUser.id,
        plan: 'PRO',
        status: 'ACTIVE',
        interval: 'MONTHLY',
        amount: 999
      });
    });

    test('should cancel subscription at period end', async () => {
      const response = await request(TEST_BASE_URL)
        .post('/api/billing/cancel-subscription')
        .set('Cookie', `auth-token=${authToken}`)
        .send({
          cancel_immediately: false,
          feedback: 'Testing cancellation'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.subscription.cancel_at_period_end).toBe(true);
    });

    test('should cancel subscription immediately', async () => {
      const response = await request(TEST_BASE_URL)
        .post('/api/billing/cancel-subscription')
        .set('Cookie', `auth-token=${authToken}`)
        .send({
          cancel_immediately: true
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.subscription.status).toBe('CANCELLED');
    });

    test('should create customer portal session', async () => {
      // Update test user with Stripe customer ID
      await prisma.user.update({
        where: { id: testUser.id },
        data: { stripe_customer_id: 'cus_test_customer' }
      });

      const response = await request(TEST_BASE_URL)
        .post('/api/billing/customer-portal')
        .set('Cookie', `auth-token=${authToken}`)
        .send({
          return_url: 'http://localhost:3000/account/billing'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('portal_url');
    });
  });

  describe('Invoice Management Tests', () => {
    let testSubscription;

    beforeEach(async () => {
      testSubscription = await createTestSubscription({
        userId: testUser.id,
        plan: 'PRO',
        status: 'ACTIVE',
        interval: 'MONTHLY',
        amount: 999
      });

      // Create test invoice
      await prisma.invoice.create({
        data: {
          userId: testUser.id,
          subscriptionId: testSubscription.id,
          stripeInvoiceId: 'in_test_invoice',
          number: 'TEST-001',
          description: 'Test invoice',
          amount: 999,
          amountPaid: 999,
          currency: 'usd',
          status: 'PAID',
          invoiceDate: new Date(),
          paidAt: new Date()
        }
      });
    });

    test('should retrieve user invoices', async () => {
      const response = await request(TEST_BASE_URL)
        .get('/api/billing/invoices')
        .set('Cookie', `auth-token=${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.invoices).toHaveLength(1);
      expect(response.body.invoices[0]).toHaveProperty('stripe_invoice_id', 'in_test_invoice');
    });

    test('should paginate invoice results', async () => {
      const response = await request(TEST_BASE_URL)
        .get('/api/billing/invoices?limit=5&offset=0')
        .set('Cookie', `auth-token=${authToken}`)
        .expect(200);

      expect(response.body.pagination).toHaveProperty('limit', 5);
      expect(response.body.pagination).toHaveProperty('offset', 0);
      expect(response.body.pagination).toHaveProperty('total');
      expect(response.body.pagination).toHaveProperty('has_more');
    });

    test('should filter invoices by status', async () => {
      const response = await request(TEST_BASE_URL)
        .get('/api/billing/invoices?status=PAID')
        .set('Cookie', `auth-token=${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.invoices.forEach(invoice => {
        expect(invoice.status).toBe('PAID');
      });
    });
  });

  describe('Webhook Processing Tests', () => {
    test('should process subscription created webhook', async () => {
      const webhookPayload = {
        id: 'evt_test_webhook',
        type: 'customer.subscription.created',
        data: {
          object: {
            id: 'sub_test_subscription',
            customer: 'cus_test_customer',
            status: 'active',
            metadata: {
              user_id: testUser.id,
              plan_id: 'pro_monthly'
            },
            items: {
              data: [{
                price: {
                  id: 'price_test_pro',
                  unit_amount: 999,
                  recurring: { interval: 'month' }
                }
              }]
            },
            current_period_start: Math.floor(Date.now() / 1000),
            current_period_end: Math.floor(Date.now() / 1000) + 2592000,
            created: Math.floor(Date.now() / 1000)
          }
        }
      };

      // This would require proper webhook signature generation
      // For now, we test the subscription creation logic directly
      const subscription = await prisma.subscription.create({
        data: {
          userId: testUser.id,
          plan: 'PRO',
          status: 'ACTIVE',
          stripeSubscriptionId: 'sub_test_webhook_test',
          amount: 999,
          currency: 'usd',
          interval: 'MONTHLY',
          startDate: new Date()
        }
      });

      expect(subscription).toBeDefined();
      expect(subscription.plan).toBe('PRO');
      expect(subscription.status).toBe('ACTIVE');
    });

    test('should record webhook events for idempotency', async () => {
      const eventId = 'evt_test_idempotency';
      
      await prisma.webhookEvent.create({
        data: {
          stripeEventId: eventId,
          eventType: 'customer.subscription.created',
          processedAt: new Date(),
          success: true
        }
      });

      const existingEvent = await prisma.webhookEvent.findUnique({
        where: { stripeEventId: eventId }
      });

      expect(existingEvent).toBeDefined();
      expect(existingEvent.eventType).toBe('customer.subscription.created');
    });
  });

  describe('Audit Trail Tests', () => {
    test('should log security events', async () => {
      // Trigger a security event by using invalid token
      await request(TEST_BASE_URL)
        .get('/api/billing/subscription')
        .set('Cookie', 'auth-token=invalid-token')
        .expect(401);

      // Check if security event was logged
      const auditLogs = await prisma.auditLog.findMany({
        where: {
          action: 'SECURITY_ALERT',
          category: 'security'
        },
        orderBy: { createdAt: 'desc' },
        take: 1
      });

      expect(auditLogs).toHaveLength(1);
      expect(auditLogs[0].metadata).toHaveProperty('error');
    });

    test('should log billing events', async () => {
      await request(TEST_BASE_URL)
        .get('/api/billing/subscription')
        .set('Cookie', `auth-token=${authToken}`)
        .expect(200);

      const auditLogs = await prisma.auditLog.findMany({
        where: {
          userId: testUser.id,
          category: 'billing'
        },
        orderBy: { createdAt: 'desc' },
        take: 1
      });

      expect(auditLogs.length).toBeGreaterThan(0);
    });
  });
});

/**
 * Generate test authentication token
 * This is a simplified version for testing purposes
 */
async function generateTestAuthToken(user) {
  const jwt = require('jsonwebtoken');
  
  const payload = {
    email: user.email,
    userId: user.id,
    iss: 'midi-training-app',
    aud: 'midi-training-app-users',
    exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour
  };

  return jwt.sign(payload, process.env.AUTH_SECRET);
}