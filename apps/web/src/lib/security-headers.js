/**
 * Security Headers Middleware
 * 
 * Provides comprehensive security headers for enhanced protection against
 * XSS, clickjacking, MIME sniffing, and other web vulnerabilities.
 */

/**
 * Generate Content Security Policy header value
 * @param {boolean} isDevelopment - Whether running in development mode
 * @returns {string} CSP header value
 */
function generateCSP(isDevelopment = false) {
  const policies = {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      "'unsafe-eval'", // Required for React development
      isDevelopment ? "'unsafe-inline'" : '', // Only allow inline scripts in dev
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
    'block-all-mixed-content': []   // Block mixed content
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
    'Content-Security-Policy': generateCSP(isDevelopment),
    
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
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
    } : {}),
    
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