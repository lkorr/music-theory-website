/**
 * Security Headers Middleware
 * 
 * Provides comprehensive security headers for enhanced protection against
 * XSS, clickjacking, MIME sniffing, and other web vulnerabilities.
 */

import crypto from 'crypto';

/**
 * Generate a cryptographically secure nonce
 * @returns {string} Random nonce
 */
export function generateNonce() {
  return crypto.randomBytes(16).toString('base64');
}

/**
 * Generate Content Security Policy header value
 * @param {boolean} isDevelopment - Whether running in development mode
 * @param {string} nonce - Optional nonce for inline scripts/styles
 * @returns {string} CSP header value
 */
function generateCSP(isDevelopment = false, nonce = null) {
  const policies = {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      isDevelopment ? "'unsafe-eval'" : '', // Only allow eval in development
      isDevelopment ? "'unsafe-inline'" : '', // Only allow inline scripts in dev
      nonce ? `'nonce-${nonce}'` : '', // Dynamic nonce for inline scripts
      'https://cdn.jsdelivr.net', // For CDN libraries
      'https://unpkg.com' // For package CDN
    ].filter(Boolean),
    'style-src': [
      "'self'",
      "'unsafe-inline'", // Required for Tailwind/CSS-in-JS
      'https://fonts.googleapis.com'
    ],
    'font-src': [
      "'self'",
      'https://fonts.gstatic.com'
    ],
    'img-src': [
      "'self'",
      'data:', // For base64 encoded images
      'https:', // Allow HTTPS images
      'blob:' // For generated images
    ],
    'media-src': [
      "'self'",
      'https:'
    ],
    'connect-src': [
      "'self'",
      isDevelopment ? 'ws://localhost:*' : '', // WebSocket for HMR in dev
      isDevelopment ? 'http://localhost:*' : '', // Dev server connections
      'https://api.youtube.com', // YouTube API
      'https://mailchimp.com',   // Mailchimp API
      'https://*.mailchimp.com', // Mailchimp domains
      'https://maps.googleapis.com', // Google Maps API
      'https://*.supabase.co'    // Supabase API
    ].filter(Boolean),
    'frame-src': [
      "'none'" // Prevent framing
    ],
    'object-src': [
      "'none'" // Prevent object/embed
    ],
    'base-uri': [
      "'self'"
    ],
    'form-action': [
      "'self'"
    ],
    'frame-ancestors': [
      "'none'" // Prevent clickjacking
    ],
    'upgrade-insecure-requests': [], // Upgrade HTTP to HTTPS
    'block-all-mixed-content': [],   // Block mixed content
    'report-uri': isDevelopment ? [] : ['/api/security/csp-violation-report']
  };

  return Object.entries(policies)
    .map(([directive, sources]) => {
      if (sources.length === 0) {
        return directive;
      }
      return `${directive} ${sources.join(' ')}`;
    })
    .join('; ');
}

/**
 * Apply comprehensive security headers to response
 * @param {Response} response - HTTP response object
 * @param {object} options - Security options
 * @returns {Response} Response with security headers
 */
export function applySecurityHeaders(response, options = {}) {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  const securityHeaders = {
    // Content Security Policy
    'Content-Security-Policy': generateCSP(isDevelopment, options.nonce),
    
    // XSS Protection
    'X-XSS-Protection': '1; mode=block',
    
    // Content Type Options
    'X-Content-Type-Options': 'nosniff',
    
    // Frame Options (backup for CSP frame-ancestors)
    'X-Frame-Options': 'DENY',
    
    // Referrer Policy
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    
    // Permissions Policy (formerly Feature Policy)
    'Permissions-Policy': [
      'camera=()',
      'microphone=()',
      'geolocation=(self)',
      'payment=()',
      'usb=()',
      'magnetometer=()',
      'accelerometer=()',
      'gyroscope=()'
    ].join(', '),
    
    // Strict Transport Security (HTTPS only)
    ...(process.env.NODE_ENV === 'production' ? {
      'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload'
    } : {}),
    
    // DNS Prefetch Control
    'X-DNS-Prefetch-Control': 'off',
    
    // Download Options (IE only but good practice)
    'X-Download-Options': 'noopen',
    
    // Cross-Domain Policies
    'X-Permitted-Cross-Domain-Policies': 'none',
    
    // Cache Control for security-sensitive responses
    ...(options.noCache ? {
      'Cache-Control': 'no-store, no-cache, must-revalidate, private',
      'Pragma': 'no-cache',
      'Expires': '0'
    } : {})
  };

  // Apply headers to response
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

/**
 * Create a security-enhanced response
 * @param {any} body - Response body
 * @param {object} init - Response init options
 * @param {object} securityOptions - Security-specific options
 * @returns {Response} Secure response
 */
export function createSecureResponse(body, init = {}, securityOptions = {}) {
  const response = new Response(body, init);
  return applySecurityHeaders(response, securityOptions);
}

/**
 * Security headers for API responses
 * @param {Response} response - API response
 * @returns {Response} Response with API security headers
 */
export function applyAPISecurityHeaders(response) {
  return applySecurityHeaders(response, {
    noCache: true // API responses should not be cached
  });
}

/**
 * Secure Response.json() replacement that includes security headers
 * @param {any} data - JSON data to return
 * @param {ResponseInit} init - Response init options
 * @param {object} securityOptions - Security-specific options
 * @returns {Response} Secure JSON response
 */
export function secureJsonResponse(data, init = {}, securityOptions = {}) {
  const response = Response.json(data, init);
  return applyAPISecurityHeaders(response);
}

/**
 * Enhanced CORS validation for API endpoints
 * @param {Request} request - HTTP request
 * @param {string[]} allowedOrigins - Allowed origins list
 * @returns {boolean} True if origin is allowed
 */
export function isValidOrigin(request, allowedOrigins = []) {
  const origin = request.headers.get('origin');
  
  if (!origin) {
    // Allow requests without origin (same-origin requests)
    return true;
  }
  
  // In development, be more permissive
  if (process.env.NODE_ENV === 'development') {
    return origin.startsWith('http://localhost:') || 
           origin.startsWith('http://127.0.0.1:') ||
           allowedOrigins.includes(origin);
  }
  
  // In production, be strict
  return allowedOrigins.includes(origin);
}

/**
 * Apply CORS headers with validation
 * @param {Response} response - HTTP response
 * @param {Request} request - HTTP request
 * @param {string[]} allowedOrigins - Allowed origins
 * @returns {Response} Response with CORS headers
 */
export function applyCORSHeaders(response, request, allowedOrigins = []) {
  const origin = request.headers.get('origin');
  
  if (isValidOrigin(request, allowedOrigins)) {
    if (origin) {
      response.headers.set('Access-Control-Allow-Origin', origin);
    }
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    response.headers.set('Access-Control-Max-Age', '86400'); // 24 hours
  }
  
  return response;
}