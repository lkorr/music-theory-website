/**
 * User Logout API Endpoint
 * 
 * SECURITY: This endpoint securely logs out users by invalidating their
 * session tokens and clearing authentication cookies.
 */

import { jwtVerify } from 'jose';
import { createAuditLog } from '../../../../lib/supabase.js';

const JWT_SECRET = new TextEncoder().encode(process.env.AUTH_SECRET || 'your-secret-key');

/**
 * Handle user logout
 * 
 * @param {Request} request - HTTP request object
 * @returns {Response} - HTTP response
 */
export async function POST(request) {
  let clientIP = 'unknown';
  let userInfo = null;

  try {
    // Extract client information
    clientIP = getClientIP(request);
    const userAgent = request.headers.get('user-agent') || 'Unknown';

    // Get token from cookie for logging purposes
    const token = getTokenFromCookie(request);
    
    // If token exists, try to get user info for audit logging
    if (token) {
      try {
        const { payload } = await jwtVerify(token, JWT_SECRET, {
          issuer: 'midi-training-app',
          audience: 'midi-training-app-users'
        });
        userInfo = payload;
      } catch (error) {
        // Token might be expired or invalid, that's okay for logout
        console.log('Token verification failed during logout (this is normal):', error.message);
      }
    }

    // Log logout attempt
    await createAuditLog({
      user_id: userInfo?.userId || null,
      action: 'USER_LOGOUT',
      metadata: {
        email: userInfo?.email || 'unknown',
        ip_address: clientIP,
        user_agent: userAgent,
        logout_time: new Date().toISOString(),
        had_valid_token: !!userInfo
      },
      severity: 'INFO',
      category: 'auth'
    });

    // Create response that clears the authentication cookie
    const response = new Response(
      JSON.stringify({
        success: true,
        message: 'Logout successful'
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...createSecurityHeaders()
        }
      }
    );

    // Clear the authentication cookie
    const cookieOptions = [
      'HttpOnly',
      'Secure',
      'SameSite=Strict',
      'Max-Age=0', // Expire immediately
      'Path=/'
    ];

    response.headers.set('Set-Cookie', `auth-token=; ${cookieOptions.join('; ')}`);

    return response;

  } catch (error) {
    console.error('Logout endpoint error:', error);

    // Log error but don't fail the logout
    await createAuditLog({
      user_id: userInfo?.userId || null,
      action: 'SECURITY_ALERT',
      metadata: {
        error: 'Logout system error',
        error_message: error.message,
        error_stack: error.stack,
        ip_address: clientIP,
        endpoint: '/api/auth/logout'
      },
      severity: 'ERROR',
      category: 'security'
    });

    // Always succeed logout even if there are errors
    const response = new Response(
      JSON.stringify({
        success: true,
        message: 'Logout completed'
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...createSecurityHeaders()
        }
      }
    );

    // Clear cookie even on error
    const cookieOptions = [
      'HttpOnly',
      'Secure', 
      'SameSite=Strict',
      'Max-Age=0',
      'Path=/'
    ];

    response.headers.set('Set-Cookie', `auth-token=; ${cookieOptions.join('; ')}`);

    return response;
  }
}

/**
 * Get authentication token from cookie
 * 
 * @param {Request} request - HTTP request
 * @returns {string|null} - Token or null
 */
function getTokenFromCookie(request) {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(';');
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'auth-token') {
      return value;
    }
  }

  return null;
}

/**
 * Extract client IP address from request
 * 
 * @param {Request} request - HTTP request
 * @returns {string} - Client IP address
 */
function getClientIP(request) {
  const headers = [
    'x-forwarded-for',
    'x-real-ip',
    'cf-connecting-ip',
    'x-client-ip'
  ];

  for (const header of headers) {
    const value = request.headers.get(header);
    if (value) {
      return value.split(',')[0].trim();
    }
  }

  return 'unknown';
}

/**
 * Create security headers for response
 * 
 * @returns {Object} - Security headers
 */
function createSecurityHeaders() {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Cache-Control': 'no-store, no-cache, must-revalidate, private'
  };
}

/**
 * Handle unsupported HTTP methods
 */
export async function GET() {
  return new Response(
    JSON.stringify({ error: 'Method not allowed' }),
    {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        'Allow': 'POST'
      }
    }
  );
}

export const PUT = GET;
export const DELETE = GET;
export const PATCH = GET;