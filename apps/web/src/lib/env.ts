/**
 * Environment Variable Validation
 * 
 * SECURITY: This file validates required environment variables on startup
 * to prevent runtime errors and ensure proper configuration.
 */

// Type definitions
export interface EnvironmentConfig {
  nodeEnv: string;
  isDevelopment: boolean;
  isProduction: boolean;
  webUrl: string;
  mobileUrl: string;
  authSecret?: string;
  databaseUrl?: string;
  useMockAuth: boolean;
  corsOrigins: string[];
}

/**
 * Required environment variables for authentication
 */
const REQUIRED_ENV_VARS: Record<string, string> = {
  AUTH_SECRET: 'JWT signing secret key',
  DATABASE_URL: 'Database connection string'
};

/**
 * Optional environment variables with defaults
 */
const OPTIONAL_ENV_VARS: Record<string, string> = {
  NODE_ENV: 'development',
  WEB_URL: 'http://localhost:3000',
  MOBILE_URL: 'http://localhost:8081'
};

/**
 * Validate environment variables on startup
 * 
 * @throws Error - If required environment variables are missing
 */
export function validateEnvironment(): void {
  const missing: string[] = [];
  const warnings: string[] = [];

  // Check required variables
  for (const [key, description] of Object.entries(REQUIRED_ENV_VARS)) {
    if (!process.env[key]) {
      missing.push(`${key} - ${description}`);
    } else if (key === 'AUTH_SECRET' && process.env[key]!.length < 32) {
      warnings.push(`${key} should be at least 32 characters for security`);
    }
  }

  // Set defaults for optional variables
  for (const [key, defaultValue] of Object.entries(OPTIONAL_ENV_VARS)) {
    if (!process.env[key]) {
      process.env[key] = defaultValue;
      console.log(`Environment: Set ${key} to default value: ${defaultValue}`);
    }
  }

  // Report warnings
  if (warnings.length > 0) {
    console.warn('Environment warnings:');
    warnings.forEach(warning => console.warn(`  - ${warning}`));
  }

  // Throw error for missing required variables
  if (missing.length > 0) {
    const error = new Error(
      `Missing required environment variables:\n${missing.map(m => `  - ${m}`).join('\n')}\n\nPlease check your .env file.`
    );
    error.name = 'EnvironmentError';
    throw error;
  }

  // Log successful validation in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Environment validation passed ✓');
  }
}

/**
 * Get environment-specific configuration
 * 
 * @returns Environment configuration
 */
export function getConfig(): EnvironmentConfig {
  return {
    nodeEnv: process.env.NODE_ENV || 'development',
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
    
    // URLs
    webUrl: process.env.WEB_URL || 'http://localhost:3000',
    mobileUrl: process.env.MOBILE_URL || 'http://localhost:8081',
    
    // Authentication
    authSecret: process.env.AUTH_SECRET,
    
    // Database
    databaseUrl: process.env.DATABASE_URL,
    
    // Features
    useMockAuth: process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development',
    
    // Security
    corsOrigins: [
      process.env.WEB_URL || 'http://localhost:3000',
      process.env.MOBILE_URL || 'http://localhost:8081'
    ].filter(Boolean)
  };
}

/**
 * Check if running in secure context (HTTPS or localhost)
 * 
 * @returns True if secure context
 */
export function isSecureContext(): boolean {
  const config = getConfig();
  
  if (config.isDevelopment) {
    return true; // Allow insecure contexts in development
  }
  
  // In production, require HTTPS
  return config.webUrl.startsWith('https://');
}

/**
 * Validate security configuration
 * 
 * @throws Error - If security requirements not met
 */
export function validateSecurity(): void {
  const config = getConfig();
  const issues: string[] = [];

  // Check HTTPS in production
  if (config.isProduction && !isSecureContext()) {
    issues.push('HTTPS is required in production');
  }

  // Check auth secret strength
  if (config.authSecret && config.authSecret.length < 32) {
    issues.push('AUTH_SECRET should be at least 32 characters');
  }

  // Check for development settings in production
  if (config.isProduction && config.useMockAuth) {
    issues.push('Mock authentication should not be enabled in production');
  }

  if (issues.length > 0) {
    const error = new Error(
      `Security validation failed:\n${issues.map(issue => `  - ${issue}`).join('\n')}`
    );
    error.name = 'SecurityError';
    throw error;
  }
}

// Auto-validate on import in Node.js environment
if (typeof window === 'undefined' && typeof process !== 'undefined') {
  try {
    validateEnvironment();
    validateSecurity();
  } catch (error: any) {
    console.error(`Configuration Error: ${error.message}`);
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
}