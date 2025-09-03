/**
 * Get Level-specific Progress API
 * GET /api/progress/level/[moduleType]/[category]/[level]
 * 
 * Retrieves user's personal statistics for a specific level including rank position.
 */

import { jwtVerify } from 'jose';
import { getUserStatistics, getUserRank } from '../../../../../../../lib/statistics';

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

    // Get user statistics for this specific level
    const userStats = await getUserStatistics(user.id, moduleType, category, level);
    const userRank = await getUserRank(user.id, moduleType, category, level);

    // Check if user has played this level
    const hasPlayed = userStats && userStats.length > 0;

    let responseData = {
      hasPlayed,
      statistics: null,
      rank: null
    };

    if (hasPlayed) {
      const stats = userStats[0]; // Should only be one result for specific level
      responseData.statistics = {
        moduleType: stats.module_type,
        category: stats.category,
        level: stats.level,
        bestAccuracy: stats.best_accuracy,
        bestTime: stats.best_time,
        bestScore: stats.best_score,
        totalAttempts: stats.total_attempts,
        bestStreak: stats.best_streak,
        firstPlayedAt: stats.first_played_at,
        lastPlayedAt: stats.last_played_at,
        bestAchievedAt: stats.best_achieved_at
      };

      if (userRank) {
        responseData.rank = {
          position: userRank.rank_position,
          totalUsers: userRank.total_users,
          percentile: userRank.percentile,
          globalRank: userRank.global_rank
        };
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        ...responseData
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in level progress API:', error);

    return new Response(
      JSON.stringify({ error: 'Failed to retrieve level progress' }),
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