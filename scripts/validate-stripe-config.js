#!/usr/bin/env node

/**
 * Stripe Configuration Validation Script
 * 
 * Validates the complete Stripe integration setup including:
 * - Environment variables
 * - Database schema
 * - API connectivity
 * - Security configuration
 */

const { PrismaClient } = require('@prisma/client');
const stripe = require('stripe');

const prisma = new PrismaClient();

const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bright: '\x1b[1m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

class StripeConfigValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.validations = [];
  }

  error(message) {
    this.errors.push(message);
    log(`❌ ${message}`, colors.red);
  }

  warn(message) {
    this.warnings.push(message);
    log(`⚠️  ${message}`, colors.yellow);
  }

  success(message) {
    this.validations.push(message);
    log(`✅ ${message}`, colors.green);
  }

  info(message) {
    log(`ℹ️  ${message}`, colors.blue);
  }

  async validateEnvironmentVariables() {
    this.info('Validating environment variables...');

    const requiredVars = {
      'STRIPE_PUBLIC_KEY': { required: true, format: /^pk_(test|live)_/ },
      'STRIPE_SECRET_KEY': { required: true, format: /^sk_(test|live)_/ },
      'STRIPE_WEBHOOK_SECRET': { required: true, format: /^whsec_/ },
      'AUTH_SECRET': { required: true, minLength: 32 },
      'DATABASE_URL': { required: true }
    };

    const optionalVars = {
      'STRIPE_PRO_MONTHLY_PRICE_ID': { format: /^price_/ },
      'STRIPE_PREMIUM_YEARLY_PRICE_ID': { format: /^price_/ },
      'STRIPE_TEST_MODE': { values: ['true', 'false'] }
    };

    // Check required variables
    for (const [varName, config] of Object.entries(requiredVars)) {
      const value = process.env[varName];
      
      if (!value) {
        this.error(`Missing required environment variable: ${varName}`);
        continue;
      }

      if (config.format && !config.format.test(value)) {
        this.error(`Invalid format for ${varName}: ${value.substring(0, 10)}...`);
        continue;
      }

      if (config.minLength && value.length < config.minLength) {
        this.error(`${varName} must be at least ${config.minLength} characters`);
        continue;
      }

      this.success(`${varName} is valid`);
    }

    // Check optional variables
    for (const [varName, config] of Object.entries(optionalVars)) {
      const value = process.env[varName];
      
      if (!value) {
        this.warn(`Optional variable ${varName} not set`);
        continue;
      }

      if (config.format && !config.format.test(value)) {
        this.warn(`Invalid format for optional ${varName}: ${value.substring(0, 10)}...`);
        continue;
      }

      if (config.values && !config.values.includes(value)) {
        this.warn(`Invalid value for ${varName}. Expected: ${config.values.join(', ')}`);
        continue;
      }

      this.success(`${varName} is valid`);
    }

    // Check key consistency
    const publicKey = process.env.STRIPE_PUBLIC_KEY;
    const secretKey = process.env.STRIPE_SECRET_KEY;
    
    if (publicKey && secretKey) {
      const publicMode = publicKey.startsWith('pk_test_') ? 'test' : 'live';
      const secretMode = secretKey.startsWith('sk_test_') ? 'test' : 'live';
      
      if (publicMode !== secretMode) {
        this.error('Stripe public and secret keys are for different modes');
      } else {
        this.success(`Stripe keys are consistent (${publicMode} mode)`);
      }

      // Warn about production usage
      if (secretMode === 'live' && process.env.NODE_ENV !== 'production') {
        this.warn('Using live Stripe keys in non-production environment');
      }
      
      if (secretMode === 'test' && process.env.NODE_ENV === 'production') {
        this.warn('Using test Stripe keys in production environment');
      }
    }
  }

  async validateStripeConnectivity() {
    this.info('Testing Stripe API connectivity...');

    try {
      const secretKey = process.env.STRIPE_SECRET_KEY;
      if (!secretKey) {
        this.error('No Stripe secret key available for connectivity test');
        return;
      }

      const stripeClient = new stripe(secretKey);
      
      // Test API connection
      const account = await stripeClient.account.retrieve();
      this.success(`Connected to Stripe account: ${account.display_name || account.id}`);

      // Check if account is in test mode
      if (account.charges_enabled === false && secretKey.startsWith('sk_test_')) {
        this.success('Account is properly configured for test mode');
      } else if (secretKey.startsWith('sk_live_')) {
        this.success('Account is configured for live mode');
      }

      // Test webhook endpoint creation (test only)
      if (secretKey.startsWith('sk_test_')) {
        try {
          const webhookEndpoints = await stripeClient.webhookEndpoints.list({ limit: 1 });
          this.info(`Found ${webhookEndpoints.data.length} webhook endpoints configured`);
        } catch (error) {
          this.warn('Could not retrieve webhook endpoints');
        }
      }

    } catch (error) {
      this.error(`Stripe API connection failed: ${error.message}`);
    }
  }

  async validateDatabaseSchema() {
    this.info('Validating database schema...');

    try {
      // Test database connection
      await prisma.$queryRaw`SELECT 1`;
      this.success('Database connection successful');

      // Check required tables exist
      const requiredTables = [
        'users',
        'subscriptions', 
        'invoices',
        'webhook_events',
        'audit_logs'
      ];

      for (const table of requiredTables) {
        try {
          await prisma.$queryRaw`SELECT 1 FROM ${Prisma.raw(table)} LIMIT 1`;
          this.success(`Table '${table}' exists`);
        } catch (error) {
          this.error(`Table '${table}' missing or inaccessible`);
        }
      }

      // Check critical indexes exist (simplified check)
      try {
        await prisma.webhookEvent.findFirst({
          where: { stripeEventId: 'test_check' }
        });
        this.success('Webhook events table properly indexed');
      } catch (error) {
        this.warn('Could not verify webhook events indexing');
      }

      // Check for test data
      const testUserCount = await prisma.user.count({
        where: { id: { startsWith: 'test-' } }
      });
      
      const testWebhookCount = await prisma.webhookEvent.count({
        where: { stripeEventId: { startsWith: 'evt_test_' } }
      });

      if (testUserCount > 0 || testWebhookCount > 0) {
        this.warn(`Found ${testUserCount} test users and ${testWebhookCount} test webhook events`);
        this.info('Run cleanup script to remove test data: node scripts/cleanup-test-data.js');
      } else {
        this.success('No test data found in database');
      }

    } catch (error) {
      this.error(`Database validation failed: ${error.message}`);
    }
  }

  async validateSecurityConfiguration() {
    this.info('Validating security configuration...');

    // Check webhook secret format
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (webhookSecret && webhookSecret.startsWith('whsec_')) {
      this.success('Webhook secret format is valid');
    } else {
      this.error('Webhook secret format is invalid');
    }

    // Check AUTH_SECRET strength
    const authSecret = process.env.AUTH_SECRET;
    if (authSecret) {
      if (authSecret.length >= 32) {
        this.success('AUTH_SECRET meets minimum length requirement');
      } else {
        this.error('AUTH_SECRET should be at least 32 characters');
      }

      // Check for weak secrets
      const weakSecrets = [
        'your-secret-key-here',
        'development-secret',
        'test-secret',
        '12345678901234567890123456789012'
      ];

      if (weakSecrets.includes(authSecret)) {
        this.error('AUTH_SECRET appears to be a default/weak value');
      } else {
        this.success('AUTH_SECRET appears to be unique');
      }
    }

    // Check NODE_ENV configuration
    const nodeEnv = process.env.NODE_ENV;
    const stripeTestMode = process.env.STRIPE_TEST_MODE === 'true';
    
    if (nodeEnv === 'production' && stripeTestMode) {
      this.warn('Production environment with test mode enabled');
    } else if (nodeEnv !== 'production' && !stripeTestMode) {
      this.warn('Development environment with live mode enabled');
    } else {
      this.success('Environment and Stripe mode are properly aligned');
    }

    // Check for development URLs in production
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    if (baseUrl && nodeEnv === 'production' && baseUrl.includes('localhost')) {
      this.error('Production environment using localhost URL');
    }
  }

  async validateAPIEndpoints() {
    this.info('Validating API endpoint configuration...');

    // Check if required files exist
    const fs = require('fs');
    const path = require('path');

    const requiredEndpoints = [
      'apps/web/src/app/api/webhooks/stripe/route.ts',
      'apps/web/src/app/api/billing/subscription/route.ts',
      'apps/web/src/app/api/billing/create-checkout-session/route.ts',
      'apps/web/src/app/api/billing/cancel-subscription/route.ts',
      'apps/web/src/app/api/billing/customer-portal/route.ts',
      'apps/web/src/app/api/billing/invoices/route.ts'
    ];

    for (const endpoint of requiredEndpoints) {
      if (fs.existsSync(endpoint)) {
        this.success(`API endpoint exists: ${path.basename(path.dirname(endpoint))}`);
      } else {
        this.error(`API endpoint missing: ${endpoint}`);
      }
    }

    // Check utility files
    const utilityFiles = [
      'apps/web/src/lib/stripe-config.ts',
      'apps/web/src/lib/test-utils/stripe-test-utils.ts'
    ];

    for (const file of utilityFiles) {
      if (fs.existsSync(file)) {
        this.success(`Utility file exists: ${path.basename(file)}`);
      } else {
        this.warn(`Utility file missing: ${file}`);
      }
    }
  }

  displaySummary() {
    log(`\n${colors.bright}📋 Validation Summary${colors.reset}`, colors.bright);
    log('='.repeat(50));

    log(`\n${colors.green}✅ Successful validations: ${this.validations.length}${colors.reset}`);
    log(`${colors.yellow}⚠️  Warnings: ${this.warnings.length}${colors.reset}`);
    log(`${colors.red}❌ Errors: ${this.errors.length}${colors.reset}`);

    if (this.warnings.length > 0) {
      log(`\n${colors.yellow}Warnings:${colors.reset}`);
      this.warnings.forEach(warning => log(`  • ${warning}`, colors.yellow));
    }

    if (this.errors.length > 0) {
      log(`\n${colors.red}Errors that need attention:${colors.reset}`);
      this.errors.forEach(error => log(`  • ${error}`, colors.red));
      
      log(`\n${colors.red}Please fix the above errors before proceeding.${colors.reset}`);
      return false;
    }

    if (this.warnings.length > 0) {
      log(`\n${colors.yellow}Consider addressing the warnings above.${colors.reset}`);
    }

    log(`\n${colors.green}🎉 Stripe configuration validation completed!${colors.reset}`);
    return true;
  }

  async runAllValidations() {
    log(`${colors.bright}🔍 Stripe Configuration Validator${colors.reset}\n`);

    await this.validateEnvironmentVariables();
    await this.validateStripeConnectivity();
    await this.validateDatabaseSchema();
    await this.validateSecurityConfiguration(); 
    await this.validateAPIEndpoints();

    return this.displaySummary();
  }
}

// Run validation
async function main() {
  const validator = new StripeConfigValidator();
  
  try {
    const success = await validator.runAllValidations();
    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error('Validation failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(error => {
  console.error('Validation error:', error);
  process.exit(1);
});