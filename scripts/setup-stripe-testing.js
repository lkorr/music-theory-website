#!/usr/bin/env node

/**
 * Stripe Testing Setup Script
 * 
 * This script helps set up end-to-end Stripe testing environment including:
 * - Webhook endpoint forwarding with Stripe CLI
 * - Test data seeding
 * - Environment validation
 * - Test scenario generation
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bright: '\x1b[1m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function error(message) {
  log(`❌ ${message}`, colors.red);
}

function success(message) {
  log(`✅ ${message}`, colors.green);
}

function warn(message) {
  log(`⚠️  ${message}`, colors.yellow);
}

function info(message) {
  log(`ℹ️  ${message}`, colors.blue);
}

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(`${colors.cyan}${prompt}${colors.reset}`, resolve);
  });
}

class StripeTestingSetup {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
    this.webAppPath = path.resolve(this.projectRoot, 'apps', 'web');
    this.envPath = path.resolve(this.webAppPath, '.env.local');
  }

  async run() {
    try {
      log(`${colors.bright}🔧 Stripe Testing Environment Setup${colors.reset}\n`);
      
      await this.validatePrerequisites();
      await this.checkEnvironmentVariables();
      await this.setupWebhookEndpoint();
      await this.seedTestData();
      await this.runTestValidation();
      await this.displayTestingInstructions();
      
      success('Setup completed successfully!');
    } catch (error) {
      error(`Setup failed: ${error.message}`);
      process.exit(1);
    } finally {
      rl.close();
    }
  }

  async validatePrerequisites() {
    info('Validating prerequisites...');

    // Check if Stripe CLI is installed
    try {
      const stripeVersion = execSync('stripe --version', { encoding: 'utf-8' }).trim();
      success(`Stripe CLI found: ${stripeVersion}`);
    } catch (error) {
      error('Stripe CLI not found. Please install it from: https://stripe.com/docs/stripe-cli');
      throw new Error('Stripe CLI required');
    }

    // Check if logged into Stripe CLI
    try {
      execSync('stripe config --list', { encoding: 'utf-8' });
      success('Stripe CLI is configured');
    } catch (error) {
      error('Please login to Stripe CLI first: stripe login');
      throw new Error('Stripe CLI authentication required');
    }

    // Check Node.js version
    const nodeVersion = process.version;
    if (parseInt(nodeVersion.split('.')[0].substring(1)) < 18) {
      error(`Node.js 18+ required. Current version: ${nodeVersion}`);
      throw new Error('Node.js version too old');
    }
    success(`Node.js version: ${nodeVersion}`);
  }

  async checkEnvironmentVariables() {
    info('Checking environment variables...');

    const requiredVars = {
      'STRIPE_PUBLIC_KEY': 'pk_test_',
      'STRIPE_SECRET_KEY': 'sk_test_',
      'DATABASE_URL': '',
      'AUTH_SECRET': ''
    };

    const envExists = fs.existsSync(this.envPath);
    let envContent = '';
    
    if (envExists) {
      envContent = fs.readFileSync(this.envPath, 'utf-8');
    }

    const missingVars = [];
    const wrongKeyTypes = [];

    for (const [varName, expectedPrefix] of Object.entries(requiredVars)) {
      const envVar = this.getEnvVar(envContent, varName);
      
      if (!envVar) {
        missingVars.push(varName);
      } else if (expectedPrefix && !envVar.startsWith(expectedPrefix)) {
        wrongKeyTypes.push(varName);
      }
    }

    if (missingVars.length > 0) {
      warn(`Missing environment variables: ${missingVars.join(', ')}`);
      const createEnv = await question('Create .env.local with template values? (y/n): ');
      
      if (createEnv.toLowerCase() === 'y') {
        await this.createEnvTemplate();
        warn('Please fill in the environment variables in .env.local and run this script again');
        process.exit(0);
      }
    }

    if (wrongKeyTypes.length > 0) {
      error(`Please use test keys for: ${wrongKeyTypes.join(', ')}`);
      error('Test keys should start with pk_test_ and sk_test_');
      throw new Error('Invalid Stripe keys');
    }

    success('Environment variables validated');
  }

  getEnvVar(envContent, varName) {
    const match = envContent.match(new RegExp(`^${varName}=(.*)$`, 'm'));
    return match ? match[1].replace(/["']/g, '') : process.env[varName];
  }

  async createEnvTemplate() {
    const template = `# Auto-generated environment template for Stripe testing

# Authentication
AUTH_SECRET=your-32-character-minimum-secret-key-here
DATABASE_URL=your-database-url-here

# Stripe Test Configuration
STRIPE_PUBLIC_KEY=pk_test_your-stripe-test-public-key
STRIPE_SECRET_KEY=sk_test_your-stripe-test-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
STRIPE_TEST_MODE=true

# Stripe Price IDs (create these in Stripe dashboard)
STRIPE_PRO_MONTHLY_PRICE_ID=price_test_pro_monthly
STRIPE_PREMIUM_YEARLY_PRICE_ID=price_test_premium_yearly

# Application URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000
`;

    fs.writeFileSync(this.envPath, template);
    success('.env.local template created');
  }

  async setupWebhookEndpoint() {
    info('Setting up webhook endpoint...');

    const useWebhooks = await question('Set up webhook forwarding with Stripe CLI? (y/n): ');
    
    if (useWebhooks.toLowerCase() === 'y') {
      const webhookUrl = await question('Local webhook URL (default: http://localhost:3000/api/webhooks/stripe): ');
      const url = webhookUrl || 'http://localhost:3000/api/webhooks/stripe';
      
      info('Setting up webhook forwarding...');
      info('This will run in the background. Press Ctrl+C to stop.');
      
      const webhookProcess = spawn('stripe', [
        'listen',
        '--forward-to', url,
        '--events', 'customer.subscription.created,customer.subscription.updated,customer.subscription.deleted,invoice.payment_succeeded,invoice.payment_failed'
      ], {
        stdio: 'pipe'
      });

      webhookProcess.stdout.on('data', (data) => {
        const output = data.toString();
        if (output.includes('whsec_')) {
          const secret = output.match(/whsec_[a-zA-Z0-9]+/)[0];
          info(`Webhook secret: ${secret}`);
          info('Add this to your .env.local file as STRIPE_WEBHOOK_SECRET');
        }
        console.log(output);
      });

      webhookProcess.stderr.on('data', (data) => {
        console.error(data.toString());
      });

      // Keep the process running
      await new Promise((resolve) => {
        setTimeout(() => {
          info('Webhook forwarding is running...');
          webhookProcess.kill('SIGINT');
          resolve();
        }, 5000);
      });
    }
  }

  async seedTestData() {
    const seedData = await question('Create test data for development? (y/n): ');
    
    if (seedData.toLowerCase() === 'y') {
      info('Creating test data...');
      
      try {
        // Run the test data seeding
        const seedScript = `
const { createTestUser, createTestSubscription, createTestInvoice } = require('./apps/web/src/lib/test-utils/stripe-test-utils');

async function seedTestData() {
  try {
    // Create test user
    const testUser = await createTestUser({
      email: 'test@example.com',
      name: 'Test User',
      role: 'FREE'
    });
    
    // Create test subscription
    const testSubscription = await createTestSubscription({
      userId: testUser.id,
      plan: 'PRO',
      status: 'ACTIVE',
      interval: 'MONTHLY',
      amount: 999
    });
    
    // Create test invoice
    await createTestInvoice({
      userId: testUser.id,
      subscriptionId: testSubscription.id,
      amount: 999,
      status: 'PAID',
      description: 'Pro Monthly Subscription'
    });
    
    console.log('Test data created successfully');
  } catch (error) {
    console.error('Failed to create test data:', error);
  }
}

seedTestData();
`;
        
        fs.writeFileSync('temp-seed.js', seedScript);
        execSync('node temp-seed.js', { cwd: this.projectRoot });
        fs.unlinkSync('temp-seed.js');
        
        success('Test data created');
      } catch (error) {
        warn(`Could not create test data: ${error.message}`);
      }
    }
  }

  async runTestValidation() {
    info('Running test validation...');
    
    try {
      // Basic environment validation
      const validationScript = `
const { validateTestEnvironment, getTestEnvironmentInfo } = require('./apps/web/src/lib/test-utils/stripe-test-utils');

async function validate() {
  try {
    await validateTestEnvironment();
    const info = getTestEnvironmentInfo();
    console.log('Test Environment Info:', JSON.stringify(info, null, 2));
  } catch (error) {
    console.error('Validation failed:', error.message);
    process.exit(1);
  }
}

validate();
`;
      
      fs.writeFileSync('temp-validate.js', validationScript);
      execSync('node temp-validate.js', { cwd: this.projectRoot });
      fs.unlinkSync('temp-validate.js');
      
      success('Test environment validation passed');
    } catch (error) {
      warn(`Test validation failed: ${error.message}`);
    }
  }

  displayTestingInstructions() {
    log(`\n${colors.bright}🎯 Testing Instructions${colors.reset}`);
    log('='.repeat(50));
    
    log(`\n${colors.green}1. Start your development server:${colors.reset}`);
    log('   npm run dev');
    
    log(`\n${colors.green}2. Test payment flows:${colors.reset}`);
    log('   • Use test card: 4242424242424242 (success)');
    log('   • Use test card: 4000000000000002 (declined)');
    log('   • Use test card: 4000002500003155 (requires 3D Secure)');
    
    log(`\n${colors.green}3. Test webhook events:${colors.reset}`);
    log('   stripe trigger customer.subscription.created');
    log('   stripe trigger invoice.payment_succeeded');
    log('   stripe trigger invoice.payment_failed');
    
    log(`\n${colors.green}4. Monitor webhook processing:${colors.reset}`);
    log('   • Check your application logs');
    log('   • Review database for webhook_events table');
    log('   • Check audit_logs table for security events');
    
    log(`\n${colors.green}5. Test API endpoints:${colors.reset}`);
    log('   • GET /api/billing/subscription');
    log('   • POST /api/billing/create-checkout-session');
    log('   • POST /api/billing/cancel-subscription');
    log('   • POST /api/billing/customer-portal');
    log('   • GET /api/billing/invoices');
    
    log(`\n${colors.yellow}Important Notes:${colors.reset}`);
    log('• All test payments use Stripe test mode - no real money');
    log('• Test data is prefixed with "test-" for easy identification');
    log('• Use cleanup scripts to remove test data when done');
    log('• Never use test keys in production environment');
    
    log(`\n${colors.cyan}Useful Commands:${colors.reset}`);
    log('• Clean test data: node scripts/cleanup-test-data.js');
    log('• Generate test scenarios: node scripts/generate-test-scenarios.js');
    log('• Validate environment: node scripts/validate-stripe-config.js');
  }
}

// Run the setup
const setup = new StripeTestingSetup();
setup.run().catch(error => {
  console.error('Setup failed:', error);
  process.exit(1);
});