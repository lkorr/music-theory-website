/**
 * Authentication Configuration
 * 
 * SECURITY: This file validates required environment variables for authentication
 * and provides a centralized configuration for auth-related settings.
 */

// Type definitions
export interface AuthConfig {
  secret?: string;
  url: string;
  databaseUrl?: string;
  secureCookies: boolean;
  useMockAuth: boolean;
  session: {
    maxAge: number;
    updateAge: number;
  };
  allowedOrigins: string[];
  rateLimit: {
    windowMs: number;
    maxAttempts: number;
  };
}

// List of required environment variables for production
const requiredEnvVars: Record<string, string[]> = {
  production: [
    'AUTH_SECRET',
    'AUTH_URL',
    'DATABASE_URL',
  ],
  development: [
    // In development, we can use mock auth if configured
  ]
};

// Validate environment variables based on NODE_ENV
export function validateAuthEnvironment(): void {
  const env = process.env.NODE_ENV || 'development';
  const required = requiredEnvVars[env] || [];
  
  const missing: string[] = [];
  
  for (const varName of required) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }
  
  if (missing.length > 0 && env === 'production') {
    throw new Error(
      `SECURITY ERROR: Missing required environment variables for authentication:\n` +
      missing.map(v => `  - ${v}`).join('\n') +
      '\n\nThese variables are required for secure authentication in production.'
    );
  }
  
  if (missing.length > 0 && env === 'development') {
    console.warn(
      '⚠️  Missing environment variables:\n' +
      missing.map(v => `  - ${v}`).join('\n') +
      '\n\nUsing mock authentication for development.'
    );
  }
  
  // Validate AUTH_SECRET strength in production
  if (env === 'production' && process.env.AUTH_SECRET) {
    if (process.env.AUTH_SECRET.length < 32) {
      throw new Error(
        'SECURITY ERROR: AUTH_SECRET must be at least 32 characters long.\n' +
        'Generate a secure secret with: openssl rand -base64 32'
      );
    }
  }
  
  // Validate AUTH_URL format
  if (process.env.AUTH_URL && env === 'production') {
    if (!process.env.AUTH_URL.startsWith('https://')) {
      throw new Error(
        'SECURITY ERROR: AUTH_URL must use HTTPS in production.\n' +
        `Current value: ${process.env.AUTH_URL}`
      );
    }
  }
}

// Export configuration object
export const authConfig: AuthConfig = {
  // Auth secret for JWT signing
  secret: process.env.AUTH_SECRET,
  
  // Base URL for authentication
  url: process.env.AUTH_URL || (
    process.env.NODE_ENV === 'production' 
      ? 'https://your-domain.com' 
      : 'http://localhost:3000'
  ),
  
  // Database URL
  databaseUrl: process.env.DATABASE_URL,
  
  // Security settings
  secureCookies: process.env.NODE_ENV === 'production' || 
                 (process.env.AUTH_URL?.startsWith('https') ?? false),
  
  // Mock auth settings (development only)
  useMockAuth: process.env.NODE_ENV === 'development' && 
               process.env.USE_MOCK_AUTH === 'true',
  
  // Session configuration
  session: {
    maxAge: 30 * 60, // 30 minutes in seconds
    updateAge: 5 * 60, // Update session every 5 minutes
  },
  
  // CORS/Origin settings
  allowedOrigins: [
    process.env.WEB_URL || 'http://localhost:3000',
    process.env.MOBILE_URL || 'http://localhost:8081',
    process.env.EXPO_PUBLIC_PROXY_BASE_URL,
  ].filter(Boolean) as string[],
  
  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxAttempts: 5, // Max login attempts
  }
};

// Validate on import (fail fast in production)
if (typeof window === 'undefined') { // Only run on server
  try {
    validateAuthEnvironment();
  } catch (error: any) {
    console.error('🔒 Authentication Configuration Error:', error.message);
    if (process.env.NODE_ENV === 'production') {
      process.exit(1); // Exit in production if auth is misconfigured
    }
  }
}