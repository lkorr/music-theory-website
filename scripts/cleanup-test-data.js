#!/usr/bin/env node

/**
 * Test Data Cleanup Script
 * 
 * Safely removes all test data from the database including:
 * - Test users (prefixed with 'test-')
 * - Test subscriptions and invoices
 * - Test webhook events
 * - Test audit logs
 */

const { PrismaClient } = require('@prisma/client');
const readline = require('readline');

const prisma = new PrismaClient();
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

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

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(`${colors.blue}${prompt}${colors.reset}`, resolve);
  });
}

async function getTestDataStats() {
  try {
    const stats = await Promise.all([
      prisma.user.count({ where: { id: { startsWith: 'test-' } } }),
      prisma.subscription.count({ where: { user: { id: { startsWith: 'test-' } } } }),
      prisma.invoice.count({ where: { user: { id: { startsWith: 'test-' } } } }),
      prisma.webhookEvent.count({ where: { stripeEventId: { startsWith: 'evt_test_' } } }),
      prisma.auditLog.count({ where: { userId: { startsWith: 'test-' } } })
    ]);

    return {
      users: stats[0],
      subscriptions: stats[1],
      invoices: stats[2],
      webhookEvents: stats[3],
      auditLogs: stats[4],
      total: stats.reduce((sum, count) => sum + count, 0)
    };
  } catch (error) {
    throw new Error(`Failed to get test data stats: ${error.message}`);
  }
}

async function cleanupTestData(options = {}) {
  const { userId, confirmEach } = options;

  try {
    let whereClause;
    if (userId) {
      whereClause = { userId: userId };
    } else {
      whereClause = { user: { id: { startsWith: 'test-' } } };
    }

    log('🗑️  Starting test data cleanup...', colors.yellow);

    // Clean up in correct order due to foreign key constraints
    log('Removing test invoices...', colors.blue);
    const invoiceResult = await prisma.invoice.deleteMany({ where: whereClause });
    log(`✅ Deleted ${invoiceResult.count} test invoices`, colors.green);

    log('Removing test subscriptions...', colors.blue);
    const subscriptionResult = await prisma.subscription.deleteMany({ where: whereClause });
    log(`✅ Deleted ${subscriptionResult.count} test subscriptions`, colors.green);

    log('Removing test audit logs...', colors.blue);
    const auditLogResult = await prisma.auditLog.deleteMany({ 
      where: { userId: userId || { startsWith: 'test-' } } 
    });
    log(`✅ Deleted ${auditLogResult.count} test audit logs`, colors.green);

    if (userId) {
      log('Removing specific test user...', colors.blue);
      await prisma.user.delete({ where: { id: userId } });
      log('✅ Deleted test user', colors.green);
    } else {
      log('Removing all test users...', colors.blue);
      const userResult = await prisma.user.deleteMany({ 
        where: { id: { startsWith: 'test-' } } 
      });
      log(`✅ Deleted ${userResult.count} test users`, colors.green);
    }

    // Clean up test webhook events
    log('Removing test webhook events...', colors.blue);
    const webhookResult = await prisma.webhookEvent.deleteMany({
      where: {
        stripeEventId: {
          startsWith: 'evt_test_'
        }
      }
    });
    log(`✅ Deleted ${webhookResult.count} test webhook events`, colors.green);

    log('🎉 Test data cleanup completed successfully!', colors.green);
    return true;

  } catch (error) {
    log(`❌ Cleanup failed: ${error.message}`, colors.red);
    throw error;
  }
}

async function main() {
  try {
    log(`${colors.bright}🧹 Test Data Cleanup Tool${colors.reset}\n`);

    // Check if we're in test mode
    if (process.env.NODE_ENV === 'production' && process.env.STRIPE_TEST_MODE !== 'true') {
      log('⚠️  Warning: Not running in test mode!', colors.yellow);
      const proceed = await question('Are you sure you want to proceed? (y/n): ');
      if (proceed.toLowerCase() !== 'y') {
        log('Cleanup cancelled.', colors.yellow);
        process.exit(0);
      }
    }

    // Get current test data statistics
    log('📊 Analyzing test data...', colors.blue);
    const stats = await getTestDataStats();
    
    if (stats.total === 0) {
      log('✨ No test data found to cleanup.', colors.green);
      process.exit(0);
    }

    log('\n📈 Test Data Statistics:', colors.yellow);
    log(`   Users: ${stats.users}`);
    log(`   Subscriptions: ${stats.subscriptions}`);
    log(`   Invoices: ${stats.invoices}`);
    log(`   Webhook Events: ${stats.webhookEvents}`);
    log(`   Audit Logs: ${stats.auditLogs}`);
    log(`   Total Records: ${stats.total}\n`);

    // Ask for confirmation
    const confirm = await question('Do you want to delete all this test data? (y/n): ');
    if (confirm.toLowerCase() !== 'y') {
      log('Cleanup cancelled.', colors.yellow);
      process.exit(0);
    }

    // Perform cleanup
    await cleanupTestData();

    // Verify cleanup
    log('\n🔍 Verifying cleanup...', colors.blue);
    const finalStats = await getTestDataStats();
    if (finalStats.total === 0) {
      log('✅ All test data successfully removed!', colors.green);
    } else {
      log(`⚠️  ${finalStats.total} records remaining`, colors.yellow);
    }

  } catch (error) {
    log(`❌ Error: ${error.message}`, colors.red);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    rl.close();
  }
}

// Handle command line arguments
const args = process.argv.slice(2);
if (args.includes('--help')) {
  console.log(`
Test Data Cleanup Tool

Usage:
  node cleanup-test-data.js [options]

Options:
  --user <userId>    Clean up specific test user only
  --force           Skip confirmation prompts
  --help            Show this help message

Examples:
  node cleanup-test-data.js                    # Clean all test data
  node cleanup-test-data.js --user test-123    # Clean specific user
  node cleanup-test-data.js --force            # Skip confirmations
`);
  process.exit(0);
}

// Run the cleanup
main().catch(error => {
  console.error('Cleanup failed:', error);
  process.exit(1);
});