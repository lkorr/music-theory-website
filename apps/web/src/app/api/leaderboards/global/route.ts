/**
 * Global Leaderboard API
 * GET /api/leaderboards/global
 * 
 * Retrieves global leaderboard across all levels or filtered by module type.
 * Query parameters: moduleType, limit, offset
 */

import { Response } from 'react-router';
import { getGlobalLeaderboard } from '../../../../lib/statistics.js';
import { verifyJWT } from '../../../../lib/auth.ts';

export async function GET(request: Request) {
  try {
    // Verify JWT token (leaderboards might be public, but authentication helps with rate limiting)
    const authResult = await verifyJWT(request);
    
    // For now, require authentication - can be made public later if needed
    if (!authResult.valid || !authResult.user) {
      return Response.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse query parameters
    const url = new URL(request.url);
    const moduleType = url.searchParams.get('moduleType');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '100'), 500); // Max 500 results
    const offset = Math.max(parseInt(url.searchParams.get('offset') || '0'), 0);

    // Get global leaderboard
    const leaderboard = await getGlobalLeaderboard(moduleType, limit, offset);

    // Transform data for frontend consumption
    const responseData = leaderboard.map(entry => ({
      globalRank: entry.global_rank,
      userName: entry.user_name,
      moduleType: entry.module_type,
      category: entry.category,
      level: entry.level,
      bestAccuracy: Number(entry.best_accuracy),
      bestTime: Number(entry.best_time),
      bestScore: entry.best_score,
      bestAchievedAt: entry.best_achieved_at
    }));

    return Response.json({
      success: true,
      leaderboard: responseData,
      pagination: {
        limit,
        offset,
        hasMore: responseData.length === limit // If we got full limit, there might be more
      }
    });

  } catch (error) {
    console.error('Error in global leaderboard API:', error);

    return Response.json(
      { error: 'Failed to retrieve global leaderboard' },
      { status: 500 }
    );
  }
}

// Method not allowed for other HTTP methods
export async function POST() {
  return Response.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}