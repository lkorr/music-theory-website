/**
 * Next.js Middleware for CSRF Protection
 * 
 * Provides comprehensive CSRF protection using the existing csrf.js implementation
 * following OWASP synchronizer token pattern guidelines.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { validateCSRFHeader } from './src/lib/csrf.js';
import { getAuthFromCookie, getClientIP } from './src/lib/auth-utils.js';

/**
 * CSRF protection middleware
 * Validates CSRF tokens for all state-changing requests
 */
export async function middleware(request: NextRequest) {
  console.log(`Middleware called for: ${request.method} ${request.nextUrl.pathname}`);
  
  // CSRF protection now re-enabled
  const { pathname, method } = request.nextUrl;

  // Skip CSRF protection for safe methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    return NextResponse.next();
  }

  // Skip CSRF protection for webhook endpoints (they use signature validation)
  if (pathname.startsWith('/api/webhooks/')) {
    return NextResponse.next();
  }

  // Skip CSRF protection for public endpoints that don't require authentication
  const publicEndpoints = [
    '/api/newsletter/subscribe', // Public newsletter signup
    '/api/test', // Test endpoint
    '/api/blog/rss', // RSS feed
  ];

  if (publicEndpoints.some(endpoint => pathname === endpoint)) {
    return NextResponse.next();
  }

  // For API routes, validate CSRF token
  if (pathname.startsWith('/api/')) {
    try {
      // Get user session for CSRF validation
      const user = await getAuthFromCookie(request);
      
      if (!user) {
        return new Response(
          JSON.stringify({ 
            error: 'Authentication required',
            code: 'AUTH_REQUIRED'
          }),
          { 
            status: 401, 
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }

      // Validate CSRF token using existing implementation
      const isValidCSRF = validateCSRFHeader(request, user.id);
      
      if (!isValidCSRF) {
        const clientIP = getClientIP(request);
        console.warn(`CSRF validation failed for ${method} ${pathname} - User: ${user.id}, IP: ${clientIP}`);
        
        return new Response(
          JSON.stringify({ 
            error: 'CSRF validation failed. Please refresh the page and try again.',
            code: 'CSRF_VALIDATION_FAILED'
          }),
          { 
            status: 403, 
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }

      // Log successful CSRF validation in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`✓ CSRF validation passed for ${method} ${pathname}`);
      }

    } catch (error) {
      console.error('CSRF middleware error:', error);
      
      return new Response(
        JSON.stringify({ 
          error: 'Security validation failed',
          code: 'SECURITY_ERROR'
        }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  }

  return NextResponse.next();
}

/**
 * Configure middleware to run on API routes
 * Excludes static files and Next.js internal routes
 */
export const config = {
  matcher: [
    // Match API routes
    '/api/:path*',
    // Match pages that might have forms (optional)
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)',
  ],
};