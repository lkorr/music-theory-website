/**
 * User Login API Endpoint
 * 
 * SECURITY: This endpoint implements secure user authentication with comprehensive
 * validation, rate limiting, and audit logging.
 */

import { validateLoginData } from '../../../../lib/validation-utils.js';
import { verifyPassword } from '../../../../lib/password.js';
import { getUserByEmail, updateLoginTracking, isAccountLocked } from '../../../../lib/supabase.js';
import {
  getClientInfo,
  generateAuthToken,
  createAuthCookie,
  createSuccessResponse,
  createErrorResponse,
  createMethodNotAllowedResponse,
  parseJSONBody,
  handleAPIError,
  logSuccessfulAuth,
  applyRateLimit,
  validateCSRFToken,
  type ClientInfo
} from '../../../../lib/auth-api-utils.js';

// Types
interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  message: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    last_login: string | null;
  };
}

/**
 * Handle user login
 */
export async function POST(request: Request): Promise<Response> {
  const startTime = Date.now();
  const endpoint = '/api/auth/login';
  
  try {
    // Extract client information for logging
    const clientInfo = getClientInfo(request);

    // Apply rate limiting (stricter for login) - skip in development with mock auth
    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    if (!useMockAuth) {
      const rateLimitResult = await applyRateLimit(request, 'login');
      if (rateLimitResult) {
        return rateLimitResult;
      }
    }

    // Validate CSRF token
    const csrfResult = await validateCSRFToken(request);
    if (csrfResult) {
      return csrfResult;
    }

    // Parse and validate request body
    const bodyResult = await parseJSONBody<LoginRequest>(request, { endpoint, clientInfo });
    if ('error' in bodyResult) {
      return bodyResult.error;
    }

    // Validate and sanitize login data
    const validation = validateLoginData(bodyResult.data);
    if (!validation.isValid) {
      return await createErrorResponse(
        'Validation failed',
        400,
        { endpoint, clientInfo, email: bodyResult.data.email },
        'USER_LOGIN_FAILED',
        'INFO'
      );
    }

    const { email, password } = validation.sanitizedData;

    // Get user from database
    let user: any;
    try {
      user = await getUserByEmail(email!);
    } catch (error) {
      console.error('Database error during login:', error);
      return await handleAPIError(error, { endpoint, clientInfo, email });
    }

    // Check if user exists and account is not deleted
    if (!user || user.deleted_at) {
      return await createErrorResponse(
        'Invalid email or password',
        401,
        { endpoint, clientInfo, userId: user?.id, email },
        'USER_LOGIN_FAILED',
        'WARN'
      );
    }

    // Check if account is locked (skip in development with mock auth)
    if (!useMockAuth) {
      try {
        const accountLocked = await isAccountLocked(user.id);
        if (accountLocked) {
          return await createErrorResponse(
            'Account temporarily locked due to too many failed login attempts. Please try again later.',
            423, // Locked status code
            { endpoint, clientInfo, userId: user.id, email },
            'USER_LOGIN_FAILED',
            'WARN'
          );
        }
      } catch (error) {
        console.error('Account lock check error:', error);
        // Continue with login if lock check fails
      }
    }

    // Verify password
    let passwordValid: boolean;
    try {
      passwordValid = await verifyPassword(user.password, password!);
    } catch (error) {
      console.error('Password verification error:', error);
      return await handleAPIError(error, { endpoint, clientInfo, userId: user.id, email });
    }

    if (!passwordValid) {
      // Update failed login tracking (skip in development with mock auth)
      if (!useMockAuth) {
        try {
          await updateLoginTracking(user.id, clientInfo.ip, false);
        } catch (error) {
          console.error('Failed login tracking error:', error);
        }
      }

      return await createErrorResponse(
        'Invalid email or password',
        401,
        { endpoint, clientInfo, userId: user.id, email },
        'USER_LOGIN_FAILED',
        'WARN'
      );
    }

    // Generate JWT token
    let token: string;
    try {
      token = await generateAuthToken({
        id: user.id,
        email: user.email,
        role: user.role
      });
    } catch (error) {
      console.error('JWT generation error:', error);
      return await handleAPIError(error, { endpoint, clientInfo, userId: user.id, email });
    }

    // Update login tracking
    try {
      await updateLoginTracking(user.id, clientInfo.ip, true);
    } catch (error) {
      console.error('Login tracking update error:', error);
      // Don't fail login for tracking errors, just log them
    }

    // Log successful login
    await logSuccessfulAuth(
      'USER_LOGIN_SUCCESS',
      { id: user.id, email: user.email, role: user.role },
      clientInfo,
      {
        response_time_ms: Date.now() - startTime
      }
    );

    // Create response data
    const responseData: LoginResponse = {
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        last_login: user.last_login
      }
    };

    // Create secure response with auth cookie
    const response = createSuccessResponse(responseData);
    
    // Set secure HTTP-only cookie
    response.headers.set('Set-Cookie', createAuthCookie(token));

    return response;

  } catch (error) {
    return await handleAPIError(error, { 
      endpoint, 
      clientInfo: { ip: 'unknown', userAgent: 'unknown' }
    });
  }
}

/**
 * Handle unsupported HTTP methods
 */
export async function GET(): Promise<Response> {
  return createMethodNotAllowedResponse(['POST']);
}

export const PUT = GET;
export const DELETE = GET;
export const PATCH = GET;