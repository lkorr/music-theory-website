/**
 * User Registration API Endpoint
 * 
 * SECURITY: This endpoint implements secure user registration with comprehensive
 * validation, rate limiting, and audit logging.
 */

import { validateRegistrationData } from '../../../../lib/validation-utils.js';
import { hashPassword, validatePasswordStrength } from '../../../../lib/password.js';
import { createUser } from '../../../../lib/supabase.js';
import {
  getClientInfo,
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
import { generateEmailToken } from '../../../../lib/email-tokens.js';
import { sendVerificationEmail } from '../../../../lib/email.js';

// Types
interface RegistrationRequest {
  email: string;
  password: string;
  name?: string;
  acceptTerms: boolean;
}

interface RegistrationResponse {
  success: boolean;
  message: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    created_at: string;
    emailVerified: boolean;
  };
  emailSent: boolean;
}

/**
 * Handle user registration
 */
export async function POST(request: Request): Promise<Response> {
  const startTime = Date.now();
  const endpoint = '/api/auth/register';

  try {
    // Extract client information for logging
    const clientInfo = getClientInfo(request);

    // Apply rate limiting (relaxed limits in development with mock auth)
    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    if (useMockAuth) {
      // Apply basic rate limiting even in development to prevent abuse
      const basicRateLimitResult = await applyRateLimit(request, 'register-dev', false);
      if (basicRateLimitResult) {
        return basicRateLimitResult;
      }
    } else {
      // Normal production rate limiting
      const rateLimitResult = await applyRateLimit(request, 'register');
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
    const bodyResult = await parseJSONBody<RegistrationRequest>(request, { endpoint, clientInfo });
    if ('error' in bodyResult) {
      return bodyResult.error;
    }

    // Validate and sanitize registration data
    const validation = validateRegistrationData(bodyResult.data);
    if (!validation.isValid) {
      return await createErrorResponse(
        'Validation failed',
        400,
        { endpoint, clientInfo, email: bodyResult.data.email },
        'USER_REGISTRATION_FAILED',
        'INFO'
      );
    }

    const { email, password, name } = validation.sanitizedData;

    // Additional password strength validation
    const passwordValidation = validatePasswordStrength(password!);
    if (!passwordValidation.isValid) {
      return await createErrorResponse(
        'Password does not meet security requirements',
        400,
        { endpoint, clientInfo, email },
        'USER_REGISTRATION_FAILED',
        'INFO'
      );
    }

    // Hash password with Argon2
    let hashedPassword: string;
    try {
      hashedPassword = await hashPassword(password!);
    } catch (error) {
      console.error('Password hashing error:', error);
      return await handleAPIError(error, { endpoint, clientInfo, email });
    }

    // Create user in database
    let newUser: any;
    try {
      newUser = await createUser({
        email: email!,
        password_hash: hashedPassword,
        name: name || undefined
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('already exists')) {
        return await createErrorResponse(
          'User with this email already exists',
          409,
          { endpoint, clientInfo, email },
          'USER_REGISTRATION_FAILED',
          'INFO'
        );
      }

      console.error('User creation error:', error);
      return await handleAPIError(error, { endpoint, clientInfo, email });
    }

    // Send email verification
    let emailSent = false;
    try {
      const verificationToken = generateEmailToken(newUser.email); // 2 hours expiry
      emailSent = await sendVerificationEmail({
        email: newUser.email,
        name: newUser.name || 'Music Learner',
        verificationToken
      });

      if (emailSent) {
        console.log(`Verification email sent to ${newUser.email}`);
      }
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      
      // Log email failure but don't fail registration
      await logSuccessfulAuth(
        'EMAIL_VERIFICATION_FAILED',
        { id: newUser.id, email: newUser.email, role: newUser.role },
        clientInfo,
        {
          error: emailError instanceof Error ? emailError.message : 'Unknown error'
        }
      );
    }

    // Log successful registration
    await logSuccessfulAuth(
      'USER_REGISTERED',
      { id: newUser.id, email: newUser.email, role: newUser.role },
      clientInfo,
      {
        response_time_ms: Date.now() - startTime,
        email_sent: emailSent
      }
    );

    // Create response data
    const responseData: RegistrationResponse = {
      success: true,
      message: emailSent 
        ? 'Registration successful! Please check your email to verify your account.' 
        : 'Registration successful! Email verification not sent - please contact support.',
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        created_at: newUser.created_at,
        emailVerified: false
      },
      emailSent: emailSent
    };

    return createSuccessResponse(responseData, 201);

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