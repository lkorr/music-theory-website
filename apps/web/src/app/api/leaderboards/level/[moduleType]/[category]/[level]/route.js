/**
 * Level-specific Leaderboard API
 * GET /api/leaderboards/level/[moduleType]/[category]/[level]
 * 
 * Retrieves leaderboard for a specific level.
 * Query parameters: limit, offset
 */

import { jwtVerify } from 'jose';
import { getLeaderboard } from '../../../../../../../lib/statistics';

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

export async function GET(request, { params }) {
  try {
    const { moduleType, category, level } = params;

    // Verify JWT token
    const authResult = await verifyJWT(request);
    
    // For now, require authentication - can be made public later if needed
    if (!authResult.valid || !authResult.user) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Parse query parameters
    const url = new URL(request.url);
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 200); // Max 200 results
    const offset = Math.max(parseInt(url.searchParams.get('offset') || '0'), 0);

    // Validate parameters
    if (!moduleType || !category || !level) {
      return new Response(
        JSON.stringify({ error: 'Module type, category, and level are required' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Get level-specific leaderboard from database
    const leaderboardData = await getLeaderboard(moduleType, category, level, limit, offset);

    // Transform data to match expected format
    const leaderboard = leaderboardData.map((entry) => ({
      rankPosition: entry.rank_position,
      userName: entry.user_name,
      bestAccuracy: entry.best_accuracy,
      bestTime: entry.best_time,
      bestScore: entry.best_score,
      totalAttempts: entry.total_attempts,
      bestAchievedAt: entry.best_achieved_at
    }));

    return new Response(
      JSON.stringify({
        success: true,
        level: {
          moduleType,
          category,
          level
        },
        leaderboard,
        pagination: {
          limit,
          offset,
          hasMore: leaderboard.length === limit
        }
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in level leaderboard API:', error);

    return new Response(
      JSON.stringify({ error: 'Failed to retrieve level leaderboard' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Method not allowed for other HTTP methods
export async function POST() {
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