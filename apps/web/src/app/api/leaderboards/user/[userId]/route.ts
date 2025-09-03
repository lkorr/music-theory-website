/**
 * User-specific Rank API
 * GET /api/leaderboards/user/[userId]
 * 
 * Retrieves user's ranking information across levels.
 * Query parameters: moduleType, category, level
 */

import { Response } from 'react-router';
import { getUserRank } from '../../../../../lib/statistics.js';
import { verifyJWT } from '../../../../../lib/auth.ts';
import { secureJsonResponse } from '../../../../../lib/security-headers.js';

interface RouteParams {
  params: {
    userId: string;
  };
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { userId } = params;

    // Verify JWT token and ensure user can only access their own data or has admin privileges
    const authResult = await verifyJWT(request);
    
    if (!authResult.valid || !authResult.user) {
      return secureJsonResponse(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Security check: users can only access their own rank data
    // (unless they have admin privileges - could be added later)
    if (authResult.user.id !== userId) {
      return secureJsonResponse(
        { error: 'Access denied. You can only view your own ranking data.' },
        { status: 403 }
      );
    }

    // Parse query parameters
    const url = new URL(request.url);
    const moduleType = url.searchParams.get('moduleType');
    const category = url.searchParams.get('category');
    const level = url.searchParams.get('level');

    // Validate required parameters for specific rank lookup
    if (!moduleType || !category || !level) {
      return secureJsonResponse(
        { error: 'Module type, category, and level are required for rank lookup' },
        { status: 400 }
      );
    }

    // Get user's rank for the specific level
    const userRank = await getUserRank(userId, moduleType, category, level);

    if (!userRank) {
      return secureJsonResponse({
        success: true,
        hasRank: false,
        message: 'User has not played this level yet'
      });
    }

    return secureJsonResponse({
      success: true,
      hasRank: true,
      rank: {
        position: userRank.rank_position,
        globalRank: userRank.global_rank,
        totalUsers: userRank.total_users,
        percentile: userRank.percentile,
        level: {
          moduleType,
          category,
          level
        }
      }
    });

  } catch (error) {
    console.error('Error in user rank API:', error);

    return secureJsonResponse(
      { error: 'Failed to retrieve user ranking' },
      { status: 500 }
    );
  }
}

// Method not allowed for other HTTP methods
export async function POST() {
  return secureJsonResponse(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}