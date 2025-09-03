/**
 * Save Game Session Progress API
 * POST /api/progress/save
 */

import { jwtVerify } from 'jose';
import { recordGameSession } from '../../../../lib/statistics';
import { validateCSRFHeader } from '../../../../lib/csrf.js';

if (!process.env.AUTH_SECRET) {
  throw new Error('AUTH_SECRET environment variable is required for JWT signing');
}
const JWT_SECRET = new TextEncoder().encode(process.env.AUTH_SECRET);

/**
 * Verify JWT token and get user
 */
async function verifyJWT(request) {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return { valid: false };

  const cookies = cookieHeader.split(';');
  let token = null;
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'auth-token') {
      token = value;
      break;
    }
  }
  
  if (!token) return { valid: false };
  
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      issuer: 'midi-training-app',
      audience: 'midi-training-app-users'
    });
    
    return { valid: true, user: { email: payload.email, id: payload.userId } };
  } catch (error) {
    return { valid: false };
  }
}

export async function POST(request) {
  try {
    // Verify JWT token and get user
    const authResult = await verifyJWT(request);
    if (!authResult.valid || !authResult.user) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const user = authResult.user;
    
    // Validate CSRF token for additional security
    if (!validateCSRFHeader(request, user.id)) {
      return new Response(
        JSON.stringify({ error: 'CSRF token validation failed' }),
        { 
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    const body = await request.json();
    
    // Validate required session data
    const {
      moduleType,
      category,
      level,
      accuracy,
      avgTime,
      totalTime,
      problemsSolved,
      correctAnswers,
      bestStreak,
      completed,
      passed,
      startTime,
      endTime,
      sessionToken
    } = body;

    if (!moduleType || !category || !level || !sessionToken) {
      return new Response(
        JSON.stringify({ error: 'Missing required session data' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Get client IP and user agent for security
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               '127.0.0.1'; // Default to localhost for development
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Record the game session
    const sessionData = {
      userId: user.id,
      sessionToken,
      moduleType,
      category,
      level,
      accuracy,
      avgTime,
      totalTime,
      problemsSolved,
      correctAnswers,
      bestStreak,
      completed,
      passed,
      startTime,
      endTime
    };

    const result = await recordGameSession(sessionData, ip, userAgent);
    
    return new Response(
      JSON.stringify({
        success: true,
        sessionId: result.sessionId,
        isPersonalBest: result.isPersonalBest,
        previousBest: result.previousBestAccuracy ? {
          accuracy: result.previousBestAccuracy,
          time: result.previousBestTime
        } : null,
        newRank: result.newRankPosition,
        message: result.isPersonalBest ? 'New personal best achieved!' : 'Session recorded successfully'
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error saving session:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to save session',
        details: error.message 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Method not allowed for other HTTP methods
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