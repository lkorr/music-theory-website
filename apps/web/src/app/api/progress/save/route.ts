/**
 * Save Game Session Progress API
 * POST /api/progress/save
 */

import {
  validateAuthenticatedRequest,
  createSuccessResponse,
  createErrorResponse,
  createMethodNotAllowedResponse,
  parseJSONBody,
  handleAPIError,
  type AuthUser,
  type ClientInfo
} from '../../../../lib/auth-api-utils.js';
import { validateGameSession, type GameSessionData } from '../../../../lib/validation-utils.js';
import { recordGameSession } from '../../../../lib/statistics.js';

// Types
interface ProgressSaveRequest extends Omit<GameSessionData, 'userId'> {
  // userId will be added from authentication
}

interface ProgressSaveResponse {
  success: boolean;
  sessionId: string;
  isPersonalBest: boolean;
  previousBest: {
    accuracy: number;
    time: number;
  } | null;
  newRank: number | null;
  message: string;
}

/**
 * Handle progress save request
 */
export async function POST(request: Request): Promise<Response> {
  const endpoint = '/api/progress/save';

  try {
    // Validate authentication with CSRF protection and rate limiting
    const authResult = await validateAuthenticatedRequest(request, {
      rateLimitType: 'api',
      requireCSRF: true,
      skipRateLimitInDev: true
    });

    if (!authResult.success) {
      // At this point, authResult has the error property
      return (authResult as { success: false; error: Response }).error;
    }

    // TypeScript knows success is true here
    const { user, clientInfo } = authResult;

    // Parse and validate request body
    const bodyResult = await parseJSONBody<ProgressSaveRequest>(request, { endpoint, clientInfo });
    if ('error' in bodyResult) {
      return bodyResult.error;
    }

    // Add user ID to session data
    const sessionDataWithUser = {
      ...bodyResult.data,
      userId: user.id
    };

    // Validate game session data
    const validation = validateGameSession(sessionDataWithUser);
    if (!validation.isValid) {
      return await createErrorResponse(
        'Invalid session data',
        400,
        { endpoint, clientInfo, userId: user.id },
        'PROGRESS_SAVE_FAILED',
        'INFO'
      );
    }

    // Record the game session
    let result: any;
    try {
      result = await recordGameSession(
        validation.sanitizedData as GameSessionData,
        clientInfo.ip,
        clientInfo.userAgent
      );
    } catch (error) {
      console.error('Error recording game session:', error);
      return await handleAPIError(error, { endpoint, clientInfo, userId: user.id });
    }

    // Create response data
    const responseData: ProgressSaveResponse = {
      success: true,
      sessionId: result.sessionId,
      isPersonalBest: result.isPersonalBest,
      previousBest: result.previousBestAccuracy ? {
        accuracy: result.previousBestAccuracy,
        time: result.previousBestTime
      } : null,
      newRank: result.newRankPosition,
      message: result.isPersonalBest ? 'New personal best achieved!' : 'Session recorded successfully'
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
export async function GET(): Promise<Response> {
  return createMethodNotAllowedResponse(['POST']);
}

export const PUT = GET;
export const DELETE = GET;
export const PATCH = GET;