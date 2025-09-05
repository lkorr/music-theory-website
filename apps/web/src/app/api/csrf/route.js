/**
 * CSRF Token Generation API
 * GET /api/csrf
 * 
 * Generates and returns a CSRF token for the current session.
 * This token must be included in X-CSRF-Token header for state-changing requests.
 */

import { generateCSRFToken } from '../../../lib/csrf.js';
import { jwtVerify } from 'jose';
import { applyAPISecurityHeaders } from '../../../lib/security-headers.js';
import { createRateLimitMiddleware } from '../../../lib/rateLimit.js';

if (!process.env.AUTH_SECRET) {
  throw new Error('AUTH_SECRET environment variable is required for JWT signing');
}
const JWT_SECRET = new TextEncoder().encode(process.env.AUTH_SECRET);

/**
 * Generate CSRF token for authenticated session
 */
export async function GET(request) {
  try {
    // Apply rate limiting
    const rateLimitMiddleware = createRateLimitMiddleware('api');
    const rateLimitResult = await rateLimitMiddleware(request, {});
    if (rateLimitResult) {
      return rateLimitResult;
    }

    // Get session ID from JWT token
    const cookieHeader = request.headers.get('cookie');
    if (!cookieHeader) {
      const response = new Response(JSON.stringify({
        success: false,
        error: 'No session found'
      }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return applyAPISecurityHeaders(response);
    }

    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [name, value] = cookie.trim().split('=');
      acc[name] = value;
      return acc;
    }, {});

    const token = cookies['auth-token'];
    if (!token) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Authentication required'
      }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'X-Content-Type-Options': 'nosniff'
        }
      });
    }

    // Verify JWT and extract session info
    let payload;
    try {
      const { payload: jwtPayload } = await jwtVerify(token, JWT_SECRET);
      payload = jwtPayload;
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid session'
      }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'X-Content-Type-Options': 'nosniff'
        }
      });
    }

    // Generate CSRF token using user ID as session identifier
    const csrfToken = generateCSRFToken(payload.userId);

    const response = new Response(JSON.stringify({
      success: true,
      csrfToken
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    return applyAPISecurityHeaders(response);

  } catch (error) {
    console.error('CSRF token generation error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'X-Content-Type-Options': 'nosniff'
      }
    });
  }
}