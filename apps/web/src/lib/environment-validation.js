/**
 * Environment Validation Utilities
 * 
 * Provides comprehensive validation of environment configuration
 * to prevent security misconfigurations in production.
 */

/**
 * Validate production environment security settings
 * @throws {Error} If production environment has security issues
 */
export function validateProductionSecurity() {
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (!isProduction) {
    return; // Skip validation for non-production environments
  }

  console.log('🔒 Running production security validation...');

  const errors = [];
  const warnings = [];

  // Critical: AUTH_SECRET must be set and strong
  if (!process.env.AUTH_SECRET) {
    errors.push('AUTH_SECRET is required in production');
  } else if (process.env.AUTH_SECRET.length < 32) {
    errors.push('AUTH_SECRET must be at least 32 characters in production');
  } else if (process.env.AUTH_SECRET.includes('your-secret') || 
             process.env.AUTH_SECRET.includes('default') ||
             process.env.AUTH_SECRET === 'test') {
    errors.push('AUTH_SECRET appears to be a default/test value');
  }

  // Critical: Mock auth must be disabled
  if (process.env.USE_MOCK_AUTH === 'true') {
    errors.push('Mock authentication must be disabled in production (USE_MOCK_AUTH=false)');
  }

  // Critical: Database URL must be set
  if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('localhost')) {
    errors.push('Production DATABASE_URL must be configured and not use localhost');
  }

  // Critical: HTTPS enforcement
  if (!process.env.AUTH_URL || !process.env.AUTH_URL.startsWith('https://')) {
    errors.push('AUTH_URL must use HTTPS in production');
  }

  // Warning: Development settings
  if (process.env.RATE_LIMIT_ENABLED === 'false') {
    warnings.push('Rate limiting is disabled - consider enabling for production');
  }

  if (process.env.AUDIT_LOGGING === 'false') {
    warnings.push('Audit logging is disabled - recommended to enable for production');
  }

  // Critical: API keys should be set
  const requiredAPIKeys = [
    'SUPABASE_SERVICE_ROLE_KEY',
    'NEXT_PUBLIC_SUPABASE_URL'
  ];

  requiredAPIKeys.forEach(key => {
    if (!process.env[key] || 
        process.env[key].includes('your-') || 
        process.env[key].includes('localhost')) {
      errors.push(`${key} must be properly configured for production`);
    }
  });

  // Log warnings
  if (warnings.length > 0) {
    console.warn('⚠️  Production Security Warnings:');
    warnings.forEach(warning => console.warn(`   - ${warning}`));
  }

  // Throw on errors
  if (errors.length > 0) {
    console.error('❌ Production Security Errors:');
    errors.forEach(error => console.error(`   - ${error}`));
    throw new Error(`Production security validation failed: ${errors.length} critical issues found`);
  }

  console.log('✅ Production security validation passed');
}

/**
 * Validate development environment setup
 * @throws {Error} If development setup is invalid
 */
export function validateDevelopmentSecurity() {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (!isDevelopment) {
    return; // Skip validation for non-development environments
  }

  console.log('🛠️  Running development security validation...');

  const warnings = [];

  // Warn if using production-like settings in development
  if (process.env.USE_MOCK_AUTH === 'false' && !process.env.DATABASE_URL) {
    warnings.push('Mock auth is disabled but no DATABASE_URL set - authentication may fail');
  }

  // Warn if critical secrets are missing (even in development)
  if (!process.env.AUTH_SECRET) {
    warnings.push('AUTH_SECRET is not set - using fallback (not recommended even in dev)');
  }

  // Log warnings
  if (warnings.length > 0) {
    console.warn('⚠️  Development Setup Warnings:');
    warnings.forEach(warning => console.warn(`   - ${warning}`));
  }

  console.log('✅ Development security validation completed');
}

/**
 * Check if mock authentication is safely enabled
 * @returns {boolean} True if mock auth is safely enabled
 */
export function isMockAuthSafelyEnabled() {
  // Mock auth is only safe if:
  // 1. Explicitly enabled via environment variable
  // 2. Running in development mode
  // 3. Not in a production-like environment
  
  const isDevelopment = process.env.NODE_ENV === 'development';
  const mockAuthEnabled = process.env.USE_MOCK_AUTH === 'true';
  const isProductionLike = process.env.AUTH_URL?.startsWith('https://') && 
                          !process.env.AUTH_URL.includes('localhost') &&
                          !process.env.AUTH_URL.includes('127.0.0.1');

  if (mockAuthEnabled && !isDevelopment) {
    console.error('❌ Mock authentication cannot be enabled outside development mode');
    return false;
  }

  if (mockAuthEnabled && isProductionLike) {
    console.error('❌ Mock authentication cannot be enabled with production URLs');
    return false;
  }

  return isDevelopment && mockAuthEnabled;
}

/**
 * Initialize environment validation based on NODE_ENV
 */
export function initializeEnvironmentValidation() {
  try {
    if (process.env.NODE_ENV === 'production') {
      validateProductionSecurity();
    } else if (process.env.NODE_ENV === 'development') {
      validateDevelopmentSecurity();
    }
  } catch (error) {
    console.error('Environment validation failed:', error.message);
    // In production, fail fast to prevent insecure deployments
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
}