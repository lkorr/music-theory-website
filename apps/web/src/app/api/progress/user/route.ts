/**
 * Get User Progress API
 * GET /api/progress/user
 * 
 * Retrieves user's personal statistics across all levels or filtered by module/category.
 * Query parameters: moduleType, category, level
 */

import { Response } from 'react-router';
import { getUserStatistics } from '../../../../lib/statistics.js';
import { verifyJWT } from '../../../../lib/auth.ts';

export async function GET(request: Request) {
  try {
    // Verify JWT token and get user
    const authResult = await verifyJWT(request);
    if (!authResult.valid || !authResult.user) {
      return Response.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = authResult.user;
    
    // Parse query parameters
    const url = new URL(request.url);
    const moduleType = url.searchParams.get('moduleType');
    const category = url.searchParams.get('category');
    const level = url.searchParams.get('level');

    // Get user statistics
    const statistics = await getUserStatistics(user.id, moduleType, category, level);

    // Transform data for frontend consumption
    const responseData = statistics.map(stat => ({
      moduleType: stat.module_type,
      category: stat.category,
      level: stat.level,
      bestAccuracy: Number(stat.best_accuracy),
      bestTime: Number(stat.best_time),
      bestScore: stat.best_score,
      totalAttempts: stat.total_attempts,
      bestStreak: stat.best_streak,
      firstPlayedAt: stat.first_played_at,
      lastPlayedAt: stat.last_played_at,
      bestAchievedAt: stat.best_achieved_at,
      rankPosition: stat.rank_position
    }));

    return Response.json({
      success: true,
      statistics: responseData
    });

  } catch (error) {
    console.error('Error in user progress API:', error);

    return Response.json(
      { error: 'Failed to retrieve user progress' },
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