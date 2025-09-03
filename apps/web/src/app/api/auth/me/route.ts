/**
 * Get Current User API Endpoint
 * 
 * SECURITY: This endpoint verifies JWT tokens and returns current user data
 * for authenticated sessions.
 */

import { jwtVerify } from 'jose';
import { getUserByEmail, createAuditLog } from '../../../../lib/supabase';
// React Router v7 uses standard Request/Response instead of Next.js

// Type definitions
interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
  last_login_at?: string;
  created_at: string;
  deleted_at?: string;
}

interface JWTPayload {
  email: string;
  userId: string;
  [key: string]: any;
}

if (!process.env.AUTH_SECRET) {
  throw new Error('AUTH_SECRET environment variable is required for JWT signing');
}
const JWT_SECRET = new TextEncoder().encode(process.env.AUTH_SECRET);

/**
 * Get current user information
 * 
 * @param request - HTTP request object
 * @returns HTTP response with user data
 */
export async function GET(request: Request): Promise<Response> {
  let clientIP = 'unknown';
  let userEmail = '';

  try {
    // Extract client information
    clientIP = getClientIP(request);

    // Get token from cookie
    const token = getTokenFromCookie(request);
    if (!token) {
      return new Response(
        JSON.stringify({ error: 'No authentication token found' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Verify JWT token
    let payload: JWTPayload;
    try {
      const { payload: tokenPayload } = await jwtVerify(token, JWT_SECRET, {
        issuer: 'midi-training-app',
        audience: 'midi-training-app-users'
      });
      payload = tokenPayload as JWTPayload;
    } catch (error: any) {
      await createAuditLog({
        action: 'SECURITY_ALERT',
        metadata: {
          error: 'Invalid JWT token in /me endpoint',
          ip_address: clientIP,
          error_message: error.message
        },
        severity: 'WARN',
        category: 'security'
      });

      return new Response(
        JSON.stringify({ error: 'Invalid authentication token' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    userEmail = payload.email;

    // Get fresh user data from database
    let user: User;
    try {
      user = await getUserByEmail(payload.email);
    } catch (error: any) {
      console.error('Database error in /me endpoint:', error);
      
      await createAuditLog({
        user_id: payload.userId,
        action: 'SECURITY_ALERT',
        metadata: {
          error: 'Database error in /me endpoint',
          email: payload.email,
          ip_address: clientIP,
          error_message: error.message
        },
        severity: 'ERROR',
        category: 'security'
      });

      return new Response(
        JSON.stringify({ error: 'Unable to fetch user data' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Check if user still exists and is not deleted
    if (!user || user.deleted_at) {
      await createAuditLog({
        user_id: payload.userId,
        action: 'SECURITY_ALERT',
        metadata: {
          error: 'Token valid but user deleted or not found',
          email: payload.email,
          ip_address: clientIP,
          user_deleted: user?.deleted_at || 'not_found'
        },
        severity: 'WARN',
        category: 'security'
      });

      return new Response(
        JSON.stringify({ error: 'User account not found' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Return user data (exclude sensitive information)
    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          last_login_at: user.last_login_at,
          created_at: user.created_at
        }
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...createSecurityHeaders()
        }
      }
    );

  } catch (error: any) {
    console.error('Get user endpoint error:', error);

    // Log critical system error
    await createAuditLog({
      action: 'SECURITY_ALERT',
      metadata: {
        error: 'System error in /me endpoint',
        error_message: error.message,
        error_stack: error.stack,
        email: userEmail,
        ip_address: clientIP,
        endpoint: '/api/auth/me'
      },
      severity: 'CRITICAL',
      category: 'security'
    });

    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * Get authentication token from cookie
 * 
 * @param request - HTTP request
 * @returns Token or null
 */
function getTokenFromCookie(request: Request): string | null {
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
 * @param request - HTTP request
 * @returns Client IP address
 */
function getClientIP(request: Request): string {
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
 * @returns Security headers
 */
function createSecurityHeaders(): Record<string, string> {
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
export async function POST(): Promise<Response> {
  return new Response(
    JSON.stringify({ error: 'Method not allowed' }),
    {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        'Allow': 'GET'
      }
    }
  );
}

export const PUT = POST;
export const DELETE = POST;
export const PATCH = POST;