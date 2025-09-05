/**
 * User Profile Management API Endpoint
 * 
 * SECURITY: This endpoint handles user profile updates with proper validation
 * and authentication checks.
 */

import { jwtVerify } from 'jose';
import { getUserByEmail, updateUser, createAuditLog } from '../../../../lib/supabase';
import { createRateLimitMiddleware } from '../../../../lib/rateLimit.js';

// Type definitions
interface UpdateProfileRequest {
  name?: string;
  email?: string;
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
 * Update user profile information
 * 
 * @param request - HTTP request object
 * @returns HTTP response with update result
 */
export async function PUT(request: Request): Promise<Response> {
  let clientIP = 'unknown';
  let userEmail = '';
  let userId = '';

  try {
    // Extract client information
    clientIP = getClientIP(request);

    // Apply rate limiting for profile updates
    const rateLimitResult = await applyRateLimit(request, 'api');
    if (rateLimitResult) {
      return rateLimitResult;
    }

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
          error: 'Invalid JWT token in profile update',
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
    userId = payload.userId;

    // Parse request body
    let updateData: UpdateProfileRequest;
    try {
      updateData = await request.json();
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate input data
    const validationError = validateProfileUpdate(updateData);
    if (validationError) {
      return new Response(
        JSON.stringify({ error: validationError }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Get current user data and verify JWT payload integrity
    const currentUser = await getUserByEmail(payload.email);
    if (!currentUser || currentUser.deleted_at) {
      await createAuditLog({
        action: 'SECURITY_ALERT',
        metadata: {
          error: 'JWT token references non-existent user in profile update',
          jwt_email: payload.email,
          jwt_user_id: payload.userId,
          ip_address: clientIP,
          endpoint: '/api/user/profile'
        },
        severity: 'WARN',
        category: 'security'
      });

      return new Response(
        JSON.stringify({ error: 'User not found' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Additional security check: verify JWT userId matches database user.id
    if (payload.userId !== currentUser.id) {
      await createAuditLog({
        action: 'SECURITY_ALERT',
        metadata: {
          error: 'JWT userId mismatch with database user in profile update',
          jwt_user_id: payload.userId,
          database_user_id: currentUser.id,
          email: currentUser.email,
          ip_address: clientIP,
          endpoint: '/api/user/profile'
        },
        severity: 'ERROR',
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

    // Prepare update data
    const updates: any = {};
    
    if (updateData.name && updateData.name.trim() !== currentUser.name) {
      updates.name = updateData.name.trim();
    }

    if (updateData.email && updateData.email.toLowerCase() !== currentUser.email) {
      // Check if new email is already in use
      const existingUser = await getUserByEmail(updateData.email.toLowerCase());
      if (existingUser && existingUser.id !== currentUser.id) {
        return new Response(
          JSON.stringify({ error: 'Email address is already in use' }),
          {
            status: 409,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
      updates.email = updateData.email.toLowerCase().trim();
      // TODO: In production, this should trigger email verification
    }

    // If no changes, return success
    if (Object.keys(updates).length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'No changes detected',
          user: {
            id: currentUser.id,
            email: currentUser.email,
            name: currentUser.name,
            role: currentUser.role
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
    }

    // Update user in database
    const updatedUser = await updateUser(currentUser.id, updates);

    // Log the profile update
    await createAuditLog({
      user_id: currentUser.id,
      action: 'PROFILE_UPDATED',
      metadata: {
        updated_fields: Object.keys(updates),
        ip_address: clientIP,
        old_email: currentUser.email,
        new_email: updates.email || currentUser.email
      },
      severity: 'INFO',
      category: 'account'
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Profile updated successfully',
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          role: updatedUser.role,
          last_login_at: updatedUser.last_login_at,
          created_at: updatedUser.created_at
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
    console.error('Profile update error:', error);

    // Log critical system error
    await createAuditLog({
      user_id: userId,
      action: 'SECURITY_ALERT',
      metadata: {
        error: 'System error in profile update',
        error_message: error.message,
        error_stack: error.stack,
        email: userEmail,
        ip_address: clientIP,
        endpoint: '/api/user/profile'
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
 * Validate profile update data with comprehensive security checks
 * 
 * @param data - Profile update data
 * @returns Validation error message or null
 */
function validateProfileUpdate(data: UpdateProfileRequest): string | null {
  if (!data || typeof data !== 'object') {
    return 'Invalid request data';
  }

  if (data.name !== undefined) {
    if (typeof data.name !== 'string') {
      return 'Name must be a string';
    }
    
    const trimmedName = data.name.trim();
    if (trimmedName.length === 0) {
      return 'Name cannot be empty';
    }
    if (trimmedName.length > 100) {
      return 'Name must be less than 100 characters';
    }
    
    // Security: Check for malicious patterns in name
    const dangerousPatterns = [
      /[<>\"\'&]/,          // HTML/script injection characters
      /javascript:/i,       // JavaScript protocol
      /data:/i,            // Data URLs
      /vbscript:/i,        // VBScript
      /on\w+=/i,           // Event handlers (onclick, onload, etc.)
      /%[0-9a-f]{2}/i,     // URL encoding
      /\\x[0-9a-f]{2}/i,   // Hex encoding
      /[\x00-\x1f\x7f]/,   // Control characters
    ];
    
    if (dangerousPatterns.some(pattern => pattern.test(trimmedName))) {
      return 'Name contains invalid characters';
    }
    
    // Additional validation: Only allow letters, spaces, hyphens, apostrophes
    const namePattern = /^[a-zA-Z\s\-'\.]+$/;
    if (!namePattern.test(trimmedName)) {
      return 'Name can only contain letters, spaces, hyphens, and apostrophes';
    }
  }

  if (data.email !== undefined) {
    if (typeof data.email !== 'string') {
      return 'Email must be a string';
    }
    if (!isValidEmail(data.email.trim())) {
      return 'Invalid email address format';
    }
    if (data.email.trim().length > 255) {
      return 'Email must be less than 255 characters';
    }
  }

  return null;
}

/**
 * Validate email format with comprehensive checks
 * 
 * @param email - Email address to validate
 * @returns True if valid email format
 */
function isValidEmail(email: string): boolean {
  // Basic format check
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  if (!emailRegex.test(email)) {
    return false;
  }
  
  // Additional security checks
  const parts = email.split('@');
  if (parts.length !== 2) {
    return false;
  }
  
  const [localPart, domain] = parts;
  
  // Local part validation
  if (localPart.length === 0 || localPart.length > 64) {
    return false;
  }
  
  // Domain validation
  if (domain.length === 0 || domain.length > 253) {
    return false;
  }
  
  // Prevent common injection attempts
  const dangerousPatterns = [
    /[<>\"\']/,           // HTML/script injection
    /javascript:/i,       // JavaScript protocol
    /data:/i,            // Data URLs
    /vbscript:/i,        // VBScript
    /\\.\\./,            // Path traversal
    /%[0-9a-f]{2}/i,     // URL encoding
    /\\x[0-9a-f]{2}/i,   // Hex encoding
  ];
  
  return !dangerousPatterns.some(pattern => pattern.test(email));
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
export async function GET(): Promise<Response> {
  return new Response(
    JSON.stringify({ error: 'Method not allowed' }),
    {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        'Allow': 'PUT'
      }
    }
  );
}

export const POST = GET;
export const DELETE = GET;
export const PATCH = GET;

/**
 * Apply rate limiting to request
 * 
 * @param request - HTTP request 
 * @param type - Rate limit type
 * @returns Response if rate limited, null otherwise
 */
async function applyRateLimit(request: Request, type: string): Promise<Response | null> {
  try {
    const rateLimitMiddleware = createRateLimitMiddleware(type);
    const context = {};
    
    const result = await rateLimitMiddleware(request, context);
    
    if (result) {
      // Log rate limit violation for profile updates
      await createAuditLog({
        action: 'SECURITY_ALERT',
        metadata: {
          error: 'Rate limit exceeded on profile update endpoint',
          rate_limit_type: type,
          ip_address: getClientIP(request),
          endpoint: '/api/user/profile'
        },
        severity: 'WARN',
        category: 'security'
      });
    }
    
    return result;
  } catch (error: any) {
    console.error('Rate limiting error:', error);
    // Don't block request on rate limit errors
    return null;
  }
}