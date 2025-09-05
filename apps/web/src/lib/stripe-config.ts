/**
 * Stripe Configuration Manager
 * 
 * Manages Stripe configuration for different environments (test/production)
 * with proper security measures and environment detection.
 */

const NODE_ENV = process.env.NODE_ENV || 'development';
const STRIPE_TEST_MODE = process.env.STRIPE_TEST_MODE === 'true';

/**
 * Stripe configuration interface
 */
interface StripeConfig {
  publicKey: string;
  secretKey: string;
  webhookSecret: string;
  isTestMode: boolean;
  priceIds: {
    proMonthly: string;
    premiumYearly: string;
  };
}

/**
 * Get Stripe configuration based on environment
 * 
 * @returns Stripe configuration object
 */
export function getStripeConfig(): StripeConfig {
  const isProduction = NODE_ENV === 'production' && !STRIPE_TEST_MODE;
  
  if (isProduction) {
    // Production configuration
    const publicKey = process.env.STRIPE_PUBLIC_KEY_LIVE || process.env.STRIPE_PUBLIC_KEY;
    const secretKey = process.env.STRIPE_SECRET_KEY_LIVE || process.env.STRIPE_SECRET_KEY;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET_LIVE || process.env.STRIPE_WEBHOOK_SECRET;
    
    if (!publicKey || !secretKey || !webhookSecret) {
      throw new Error('Missing required Stripe configuration for production environment');
    }
    
    return {
      publicKey,
      secretKey,
      webhookSecret,
      isTestMode: false,
      priceIds: {
        proMonthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || '',
        premiumYearly: process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID || ''
      }
    };
  } else {
    // Test/development configuration
    const publicKey = process.env.STRIPE_PUBLIC_KEY;
    const secretKey = process.env.STRIPE_SECRET_KEY;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    if (!publicKey || !secretKey || !webhookSecret) {
      throw new Error('Missing required Stripe test configuration');
    }
    
    // Validate that we're using test keys
    if (!publicKey.startsWith('pk_test_')) {
      console.warn('WARNING: Using non-test public key in non-production environment');
    }
    
    if (!secretKey.startsWith('sk_test_')) {
      console.warn('WARNING: Using non-test secret key in non-production environment');
    }
    
    return {
      publicKey,
      secretKey,
      webhookSecret,
      isTestMode: true,
      priceIds: {
        proMonthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || 'price_test_pro_monthly',
        premiumYearly: process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID || 'price_test_premium_yearly'
      }
    };
  }
}

/**
 * Test card numbers for different scenarios
 */
export const STRIPE_TEST_CARDS = {
  // Successful payments
  VISA_SUCCESS: '4242424242424242',
  VISA_DEBIT: '4000056655665556',
  MASTERCARD: '5555555555554444',
  AMEX: '378282246310005',
  
  // Failed payments
  CARD_DECLINED: '4000000000000002',
  INSUFFICIENT_FUNDS: '4000000000009995',
  LOST_CARD: '4000000000009987',
  STOLEN_CARD: '4000000000009979',
  EXPIRED_CARD: '4000000000000069',
  INCORRECT_CVC: '4000000000000127',
  PROCESSING_ERROR: '4000000000000119',
  
  // Special cases
  REQUIRE_AUTHENTICATION: '4000002500003155', // 3D Secure
  CHARGE_DISPUTE: '4000000000000259',
  
  // International cards
  BRAZIL: '4000000760000002',
  CANADA: '4000001240000000',
  MEXICO: '4000004840000008',
  
  // Currency-specific
  EUR: '4000000000000038',
  GBP: '4000008260000000',
  JPY: '4000000000000036'
} as const;

/**
 * Get test card for specific scenario
 * 
 * @param scenario - Test scenario name
 * @returns Card number or null if not found
 */
export function getTestCard(scenario: keyof typeof STRIPE_TEST_CARDS): string {
  return STRIPE_TEST_CARDS[scenario];
}

/**
 * Test webhooks events that can be triggered in test mode
 */
export const TEST_WEBHOOK_EVENTS = [
  'customer.subscription.created',
  'customer.subscription.updated', 
  'customer.subscription.deleted',
  'customer.subscription.trial_will_end',
  'invoice.payment_succeeded',
  'invoice.payment_failed',
  'invoice.upcoming',
  'customer.created',
  'customer.updated',
  'payment_method.attached',
  'payment_method.detached',
  'charge.dispute.created'
] as const;

/**
 * Stripe CLI command generator for webhook testing
 * 
 * @param event - Event type to trigger
 * @param additionalFlags - Additional CLI flags
 * @returns Stripe CLI command
 */
export function generateStripeCliCommand(
  event: typeof TEST_WEBHOOK_EVENTS[number], 
  additionalFlags: string[] = []
): string {
  const config = getStripeConfig();
  const baseCommand = `stripe trigger ${event}`;
  const flags = [
    ...additionalFlags,
    '--api-key', config.secretKey
  ].join(' ');
  
  return `${baseCommand} ${flags}`;
}

/**
 * Check if current environment is using test mode
 * 
 * @returns True if in test mode
 */
export function isTestMode(): boolean {
  const config = getStripeConfig();
  return config.isTestMode;
}

/**
 * Validate Stripe environment configuration
 * 
 * @throws Error if configuration is invalid
 */
export function validateStripeConfig(): void {
  try {
    const config = getStripeConfig();
    
    // Check key format
    if (config.isTestMode) {
      if (!config.publicKey.startsWith('pk_test_')) {
        throw new Error('Invalid test public key format');
      }
      if (!config.secretKey.startsWith('sk_test_')) {
        throw new Error('Invalid test secret key format');
      }
    } else {
      if (!config.publicKey.startsWith('pk_live_')) {
        throw new Error('Invalid live public key format');
      }
      if (!config.secretKey.startsWith('sk_live_')) {
        throw new Error('Invalid live secret key format');
      }
    }
    
    // Check webhook secret format
    if (!config.webhookSecret.startsWith('whsec_')) {
      throw new Error('Invalid webhook secret format');
    }
    
    // Check price IDs
    if (!config.priceIds.proMonthly) {
      throw new Error('Missing pro monthly price ID');
    }
    if (!config.priceIds.premiumYearly) {
      throw new Error('Missing premium yearly price ID');
    }
    
    console.log(`Stripe configuration validated for ${config.isTestMode ? 'test' : 'live'} mode`);
    
  } catch (error) {
    console.error('Stripe configuration validation failed:', error);
    throw error;
  }
}

/**
 * Environment-specific Stripe initialization warnings
 */
export function logEnvironmentWarnings(): void {
  const config = getStripeConfig();
  
  if (NODE_ENV === 'production' && config.isTestMode) {
    console.warn('⚠️  WARNING: Running in production with Stripe test mode enabled!');
  }
  
  if (NODE_ENV !== 'production' && !config.isTestMode) {
    console.warn('⚠️  WARNING: Running in development with Stripe live mode enabled!');
  }
  
  if (config.isTestMode) {
    console.log('🔧 Stripe running in test mode - safe for development');
  } else {
    console.log('💰 Stripe running in live mode - real payments will be processed');
  }
}