# Stripe Payment Testing Guide

This guide provides comprehensive instructions for testing the Stripe payment integration safely without spending real money.

## 🎯 Overview

The application includes a complete Stripe payment system with:
- Secure webhook processing with OWASP compliance
- Comprehensive audit logging
- End-to-end payment flow testing
- Test environment isolation
- Automated test data management

## 🔧 Setup

### Prerequisites

1. **Stripe CLI** - Install from [https://stripe.com/docs/stripe-cli](https://stripe.com/docs/stripe-cli)
2. **Node.js 18+** - Required for the application
3. **PostgreSQL** - Database for storing payment data
4. **Stripe Test Account** - Create at [https://dashboard.stripe.com](https://dashboard.stripe.com)

### Environment Configuration

1. **Copy Environment Template**
   ```bash
   cp apps/web/.env.example apps/web/.env.local
   ```

2. **Configure Stripe Test Keys**
   ```bash
   # Stripe Test Configuration (NEVER use live keys in development)
   STRIPE_PUBLIC_KEY=pk_test_your_stripe_test_public_key
   STRIPE_SECRET_KEY=sk_test_your_stripe_test_secret_key
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
   STRIPE_TEST_MODE=true
   
   # Create these products/prices in Stripe Dashboard
   STRIPE_PRO_MONTHLY_PRICE_ID=price_test_pro_monthly
   STRIPE_PREMIUM_YEARLY_PRICE_ID=price_test_premium_yearly
   ```

3. **Run Setup Script**
   ```bash
   node scripts/setup-stripe-testing.js
   ```

## 🃏 Test Cards

### Successful Payments
```javascript
// Standard success card
4242424242424242

// Visa Debit
4000056655665556

// Mastercard
5555555555554444

// American Express  
378282246310005
```

### Payment Failures
```javascript
// Generic decline
4000000000000002

// Insufficient funds
4000000000009995

// Lost card
4000000000009987

// Stolen card
4000000000009979

// Expired card
4000000000000069

// Incorrect CVC
4000000000000127
```

### Special Scenarios
```javascript
// Requires 3D Secure authentication
4000002500003155

// Disputes/chargebacks
4000000000000259
```

## 🔄 Payment Flow Testing

### 1. Subscription Creation

**Test Successful Subscription:**
```bash
# 1. Navigate to subscription page
# 2. Select Pro Monthly plan
# 3. Use test card: 4242424242424242
# 4. Complete checkout
# 5. Verify subscription in dashboard
```

**Expected Behavior:**
- ✅ Checkout session created
- ✅ Payment succeeds
- ✅ Webhook `customer.subscription.created` processed
- ✅ User subscription status updated to ACTIVE
- ✅ Invoice created and marked as PAID

**Test Failed Payment:**
```bash
# 1. Navigate to subscription page
# 2. Select plan
# 3. Use test card: 4000000000000002
# 4. Attempt checkout
# 5. Verify error handling
```

**Expected Behavior:**
- ✅ Checkout session created
- ❌ Payment fails with decline error
- ✅ User remains on FREE plan
- ✅ Error logged in audit system

### 2. Subscription Management

**Test Customer Portal:**
```bash
curl -X POST http://localhost:3000/api/billing/customer-portal \
  -H "Content-Type: application/json" \
  -H "Cookie: auth-token=YOUR_JWT_TOKEN" \
  -d '{"return_url": "http://localhost:3000/account/billing"}'
```

**Test Subscription Cancellation:**
```bash
curl -X POST http://localhost:3000/api/billing/cancel-subscription \
  -H "Content-Type: application/json" \
  -H "Cookie: auth-token=YOUR_JWT_TOKEN" \
  -d '{"cancel_immediately": false, "feedback": "Testing cancellation"}'
```

### 3. Invoice Retrieval

**Get User Invoices:**
```bash
curl -X GET "http://localhost:3000/api/billing/invoices?limit=10&offset=0" \
  -H "Cookie: auth-token=YOUR_JWT_TOKEN"
```

## 🔗 Webhook Testing

### Setup Webhook Forwarding

1. **Start Stripe CLI Forwarding:**
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

2. **Copy Webhook Secret:**
   ```bash
   # Add the webhook secret to your .env.local
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_from_cli
   ```

### Test Webhook Events

**Trigger Test Events:**
```bash
# Subscription created
stripe trigger customer.subscription.created

# Payment succeeded
stripe trigger invoice.payment_succeeded

# Payment failed
stripe trigger invoice.payment_failed

# Subscription cancelled
stripe trigger customer.subscription.deleted
```

**Verify Webhook Processing:**
1. Check application logs for webhook processing
2. Verify `webhook_events` table for deduplication
3. Check `audit_logs` for security events
4. Confirm database updates for subscriptions/invoices

## 🔒 Security Testing

### Test Security Features

1. **IP Allowlist (Production Only):**
   - Webhooks from unauthorized IPs are blocked
   - Only Stripe's IP ranges are allowed

2. **Signature Verification:**
   - Invalid signatures are rejected
   - Expired signatures (>5 minutes) are rejected

3. **Idempotency:**
   - Duplicate webhook events are ignored
   - Prevents double-processing of payments

4. **Rate Limiting:**
   - Checkout sessions limited per IP
   - Webhook endpoints have separate limits
   - Customer portal access is rate-limited

5. **Input Validation:**
   - Plan IDs validated against allowed values
   - URLs validated for HTTPS (production)
   - XSS protection on all inputs

### Audit Trail Verification

Check audit logs for security events:
```sql
SELECT * FROM audit_logs 
WHERE category = 'security' 
ORDER BY created_at DESC 
LIMIT 10;
```

Expected security events:
- `SECURITY_ALERT` for invalid tokens
- `SECURITY_ALERT` for rate limit violations
- `SUBSCRIPTION_CREATED` for new subscriptions
- `SUBSCRIPTION_CANCELLED` for cancellations

## 🧪 Test Data Management

### Create Test Data

**Create Test User:**
```javascript
const { createTestUser } = require('./apps/web/src/lib/test-utils/stripe-test-utils');

const testUser = await createTestUser({
  email: 'test@example.com',
  name: 'Test User',
  role: 'FREE'
});
```

**Create Test Subscription:**
```javascript
const { createTestSubscription } = require('./apps/web/src/lib/test-utils/stripe-test-utils');

const testSubscription = await createTestSubscription({
  userId: testUser.id,
  plan: 'PRO',
  status: 'ACTIVE',
  interval: 'MONTHLY',
  amount: 999
});
```

### Cleanup Test Data

```bash
# Clean all test data
node scripts/cleanup-test-data.js

# Clean specific test user
node scripts/cleanup-test-data.js --user test-123

# Force cleanup without confirmation
node scripts/cleanup-test-data.js --force
```

## 📊 Test Scenarios

### End-to-End Test Suite

```javascript
const testScenarios = [
  {
    name: 'Successful Subscription Creation',
    testCard: '4242424242424242',
    expectedOutcome: 'success'
  },
  {
    name: 'Failed Payment - Declined Card', 
    testCard: '4000000000000002',
    expectedOutcome: 'failure'
  },
  {
    name: '3D Secure Authentication',
    testCard: '4000002500003155',
    expectedOutcome: 'requires_action'
  },
  {
    name: 'Subscription Cancellation',
    testCard: '4242424242424242',
    expectedOutcome: 'success'
  }
];
```

### Running Test Scenarios

1. **Manual Testing:**
   - Use test cards in browser checkout
   - Verify expected outcomes
   - Check webhook processing
   - Validate database state

2. **Automated Testing:**
   ```bash
   # Run test suite (when implemented)
   npm run test:stripe
   ```

## 🚨 Important Notes

### Security Warnings
- **NEVER use live Stripe keys in development**
- **NEVER commit API keys to version control**  
- **ALWAYS use test mode for development/staging**
- **ALWAYS validate webhook signatures in production**

### Test Mode Indicators
- Test keys start with `pk_test_` and `sk_test_`
- Test webhook events start with `evt_test_`
- Test customers start with `cus_test_`
- Test subscriptions start with `sub_test_`

### Production Checklist
- [ ] Use live Stripe keys (`pk_live_`, `sk_live_`)
- [ ] Set `STRIPE_TEST_MODE=false`
- [ ] Configure production webhook endpoint
- [ ] Enable IP allowlist for webhooks
- [ ] Set up monitoring and alerting
- [ ] Test with small amounts first
- [ ] Have rollback plan ready

## 🔍 Troubleshooting

### Common Issues

**Webhook Signature Verification Failed:**
```
Solution: Check webhook secret matches Stripe CLI output
```

**Test Card Declined:**
```
Solution: Ensure using correct test card numbers
```

**Database Connection Error:**
```
Solution: Verify DATABASE_URL and database is running
```

**Rate Limit Exceeded:**
```
Solution: Wait for rate limit reset or adjust limits
```

### Debug Mode

Enable detailed logging:
```bash
DEBUG=stripe:* npm run dev
```

### Health Checks

```bash
# Check Stripe configuration
node scripts/validate-stripe-config.js

# Check test environment
curl http://localhost:3000/api/health/stripe
```

## 📞 Support

For issues with this testing setup:
1. Check the troubleshooting section above
2. Review Stripe documentation: [https://stripe.com/docs](https://stripe.com/docs)
3. Check application logs for detailed error messages
4. Use Stripe CLI for webhook debugging

---

**Remember: All testing should be done in test mode with test data only. Never use real payment methods or live API keys during development.**