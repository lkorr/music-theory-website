/**
 * CSRF Token Generation API
 * GET /api/csrf
 * 
 * Generates and returns a CSRF token for the current session.
 * This token must be included in X-CSRF-Token header for state-changing requests.
 */

import {
  verifyAuthToken,
  createSuccessResponse,
  createErrorResponse,
  createMethodNotAllowedResponse,
  getClientInfo,
  applyRateLimit,
  handleAPIError
} from '../../../lib/auth-api-utils.js';
import { generateCSRFToken } from '../../../lib/csrf.js';

// Types
interface CSRFTokenResponse {
  success: boolean;
  csrfToken: string;
}

interface CSRFErrorResponse {
  success: false;
  error: string;
}

/**
 * Generate CSRF token for authenticated session
 */
export async function GET(request: Request): Promise<Response> {
  const endpoint = '/api/csrf';
  
  try {
    const clientInfo = getClientInfo(request);

    // Apply rate limiting
    const rateLimitResult = await applyRateLimit(request, 'api', false);
    if (rateLimitResult) {
      return rateLimitResult;
    }

    // Verify authentication
    const authResult = await verifyAuthToken(request);
    if (!authResult.valid || !authResult.user) {
      const errorData: CSRFErrorResponse = {
        success: false,
        error: authResult.error || 'Authentication required'
      };
      
      return createSuccessResponse(errorData, 401);
    }

    // Generate CSRF token using user ID as session identifier
    const csrfToken = generateCSRFToken(authResult.user.id);

    const responseData: CSRFTokenResponse = {
      success: true,
      csrfToken
    };
    
    return createSuccessResponse(responseData);

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
export async function POST(): Promise<Response> {
  return createMethodNotAllowedResponse(['GET']);
}

export const PUT = POST;
export const DELETE = POST;
export const PATCH = POST;