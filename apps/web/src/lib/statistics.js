/**
 * Statistics Database Utilities
 * 
 * SECURITY: Server-side only utilities for recording and retrieving user statistics
 * with comprehensive validation and anti-cheat measures.
 */

import { supabaseAdmin } from './supabase.js';
import { createAuditLog } from './supabase.js';
import crypto from 'crypto';

// Check if mock auth is enabled (development only)
const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';

/**
 * Generate a secure session token for anti-cheat protection
 */
export function generateSessionToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Record a game session and update user statistics
 * @param {Object} sessionData - Complete session data
 * @param {string} ipAddress - User's IP address for security
 * @param {string} userAgent - User's browser info for security
 * @returns {Promise<Object>} Session result with personal best info
 */
export async function recordGameSession(sessionData, ipAddress, userAgent) {
  const {
    userId,
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
  } = sessionData;

  // Validate required fields
  if (!userId || !sessionToken || !moduleType || !category || !level) {
    throw new Error('Missing required session data');
  }

  // Validate performance data
  if (accuracy < 0 || accuracy > 100) {
    throw new Error('Invalid accuracy value');
  }

  if (avgTime <= 0 || totalTime <= 0) {
    throw new Error('Invalid time values');
  }

  if (correctAnswers > problemsSolved) {
    throw new Error('Correct answers cannot exceed problems solved');
  }

  // Mock mode for development
  if (useMockAuth) {
    console.log(`Mock recordGameSession: ${moduleType}/${category}/${level} - ${accuracy}% in ${avgTime}s`);
    return {
      sessionId: 'mock-session-' + Date.now(),
      isPersonalBest: Math.random() > 0.5, // Random for testing
      previousBestAccuracy: accuracy - Math.random() * 10,
      previousBestTime: avgTime + Math.random() * 2,
      newRankPosition: Math.floor(Math.random() * 50) + 1
    };
  }

  try {
    // Use the database function to record session and update statistics
    const { data, error } = await supabaseAdmin.rpc('record_game_session', {
      p_user_id: userId,
      p_session_token: sessionToken,
      p_module_type: moduleType,
      p_category: category,
      p_level: level,
      p_accuracy: accuracy,
      p_avg_time: avgTime,
      p_total_time: totalTime,
      p_problems_solved: problemsSolved,
      p_correct_answers: correctAnswers,
      p_best_streak: bestStreak,
      p_completed: completed,
      p_passed: passed,
      p_start_time: startTime,
      p_end_time: endTime,
      p_ip_address: ipAddress,
      p_user_agent: userAgent
    });

    if (error) {
      console.error('Database error in recordGameSession:', error);
      throw new Error('Failed to record game session');
    }

    const result = data[0]; // RPC returns array

    // Create audit log for important events
    if (result.is_personal_best) {
      await createAuditLog({
        user_id: userId,
        action: 'PERSONAL_BEST_ACHIEVED',
        entity: 'GameSession',
        entity_id: result.session_id,
        metadata: {
          module_type: moduleType,
          category,
          level,
          accuracy,
          avg_time: avgTime,
          previous_accuracy: result.previous_best_accuracy,
          previous_time: result.previous_best_time,
          new_rank: result.new_rank_position
        },
        ip_address: ipAddress,
        user_agent: userAgent,
        category: 'statistics'
      });
    }

    return {
      sessionId: result.session_id,
      isPersonalBest: result.is_personal_best,
      previousBestAccuracy: result.previous_best_accuracy,
      previousBestTime: result.previous_best_time,
      newRankPosition: result.new_rank_position
    };

  } catch (error) {
    console.error('Error recording game session:', error);
    throw error;
  }
}

/**
 * Get user's personal statistics for a specific level or all levels
 * @param {string} userId - User ID
 * @param {string} moduleType - Optional: filter by module type
 * @param {string} category - Optional: filter by category
 * @param {string} level - Optional: filter by specific level
 * @returns {Promise<Array>} User statistics
 */
export async function getUserStatistics(userId, moduleType = null, category = null, level = null) {
  if (!userId) {
    throw new Error('User ID is required');
  }

  // Mock mode for development
  if (useMockAuth) {
    console.log(`Mock getUserStatistics: ${userId}`);
    return [
      {
        module_type: 'chord-recognition',
        category: 'basic-triads',
        level: 'level1',
        best_accuracy: 95.0,
        best_time: 3.2,
        best_score: 28,
        total_attempts: 12,
        best_achieved_at: new Date().toISOString(),
        rank_position: 5
      }
    ];
  }

  try {
    // First get the user statistics
    let query = supabaseAdmin
      .from('user_statistics')
      .select('*')
      .eq('user_id', userId);

    // Apply filters if provided
    if (moduleType) query = query.eq('module_type', moduleType);
    if (category) query = query.eq('category', category);
    if (level) query = query.eq('level', level);

    query = query.order('best_achieved_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error('Database error in getUserStatistics:', error);
      throw new Error('Failed to retrieve user statistics');
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Get all rank positions for this user in a single query
    let rankQuery = supabaseAdmin
      .from('leaderboard_cache')
      .select('module_type, category, level, rank_position')
      .eq('user_id', userId);

    // Apply same filters to rank query
    if (moduleType) rankQuery = rankQuery.eq('module_type', moduleType);
    if (category) rankQuery = rankQuery.eq('category', category);
    if (level) rankQuery = rankQuery.eq('level', level);

    const { data: rankData, error: rankError } = await rankQuery;

    if (rankError) {
      console.error('Database error in getUserStatistics (ranks):', rankError);
      // Don't throw error for ranks, just continue without rank data
    }

    // Create a lookup map for rank positions
    const rankMap = {};
    (rankData || []).forEach(rank => {
      const key = `${rank.module_type}-${rank.category}-${rank.level}`;
      rankMap[key] = rank.rank_position;
    });

    // Combine statistics with rank positions
    const statsWithRanks = data.map(stat => {
      const key = `${stat.module_type}-${stat.category}-${stat.level}`;
      return {
        ...stat,
        rank_position: rankMap[key] || null
      };
    });

    return statsWithRanks;

  } catch (error) {
    console.error('Error getting user statistics:', error);
    throw error;
  }
}

/**
 * Get leaderboard for a specific level
 * @param {string} moduleType - Module type (e.g., 'chord-recognition')
 * @param {string} category - Category (e.g., 'basic-triads')
 * @param {string} level - Level (e.g., 'level1')
 * @param {number} limit - Number of results to return (default: 50)
 * @param {number} offset - Offset for pagination (default: 0)
 * @returns {Promise<Array>} Leaderboard data
 */
export async function getLeaderboard(moduleType, category, level, limit = 50, offset = 0) {
  if (!moduleType || !category || !level) {
    throw new Error('Module type, category, and level are required');
  }

  // Mock mode for development
  if (useMockAuth) {
    console.log(`Mock getLeaderboard: ${moduleType}/${category}/${level}`);
    return Array.from({ length: Math.min(limit, 10) }, (_, i) => ({
      rank_position: i + 1 + offset,
      user_name: `User ${i + 1 + offset}`,
      best_accuracy: Math.max(70, 100 - Math.random() * 30),
      best_time: 2 + Math.random() * 8,
      total_attempts: Math.floor(Math.random() * 50) + 1,
      best_achieved_at: new Date(Date.now() - Math.random() * 86400000 * 30).toISOString()
    }));
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('leaderboard_cache')
      .select(`
        rank_position,
        user_name,
        best_accuracy,
        best_time,
        best_score,
        total_attempts,
        best_achieved_at
      `)
      .eq('module_type', moduleType)
      .eq('category', category)
      .eq('level', level)
      .order('rank_position', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Database error in getLeaderboard:', error);
      throw new Error('Failed to retrieve leaderboard');
    }

    return data || [];

  } catch (error) {
    console.error('Error getting leaderboard:', error);
    throw error;
  }
}

/**
 * Get global leaderboard across all levels
 * @param {string} moduleType - Optional: filter by module type
 * @param {number} limit - Number of results to return (default: 100)
 * @param {number} offset - Offset for pagination (default: 0)
 * @returns {Promise<Array>} Global leaderboard data
 */
export async function getGlobalLeaderboard(moduleType = null, limit = 100, offset = 0) {
  // Mock mode for development
  if (useMockAuth) {
    console.log(`Mock getGlobalLeaderboard: ${moduleType}`);
    return Array.from({ length: Math.min(limit, 20) }, (_, i) => ({
      global_rank: i + 1 + offset,
      user_name: `GlobalUser ${i + 1 + offset}`,
      module_type: 'chord-recognition',
      category: 'basic-triads',
      level: `level${(i % 5) + 1}`,
      best_accuracy: Math.max(80, 100 - Math.random() * 20),
      best_time: 1.5 + Math.random() * 6,
      best_achieved_at: new Date(Date.now() - Math.random() * 86400000 * 30).toISOString()
    }));
  }

  try {
    let query = supabaseAdmin
      .from('leaderboard_cache')
      .select(`
        global_rank,
        user_name,
        module_type,
        category,
        level,
        best_accuracy,
        best_time,
        best_score,
        best_achieved_at
      `)
      .order('global_rank', { ascending: true })
      .range(offset, offset + limit - 1);

    if (moduleType) {
      query = query.eq('module_type', moduleType);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Database error in getGlobalLeaderboard:', error);
      throw new Error('Failed to retrieve global leaderboard');
    }

    return data || [];

  } catch (error) {
    console.error('Error getting global leaderboard:', error);
    throw error;
  }
}

/**
 * Get user's rank position for a specific level
 * @param {string} userId - User ID
 * @param {string} moduleType - Module type
 * @param {string} category - Category
 * @param {string} level - Level
 * @returns {Promise<Object|null>} User's rank info or null if not found
 */
export async function getUserRank(userId, moduleType, category, level) {
  if (!userId || !moduleType || !category || !level) {
    throw new Error('All parameters are required');
  }

  // Mock mode for development
  if (useMockAuth) {
    console.log(`Mock getUserRank: ${userId} for ${moduleType}/${category}/${level}`);
    return {
      rank_position: Math.floor(Math.random() * 100) + 1,
      total_users: Math.floor(Math.random() * 500) + 100,
      percentile: Math.floor(Math.random() * 100) + 1
    };
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('leaderboard_cache')
      .select('rank_position, global_rank')
      .eq('user_id', userId)
      .eq('module_type', moduleType)
      .eq('category', category)
      .eq('level', level)
      .single();

    if (error && error.code !== 'PGRST116') { // Not found is OK
      console.error('Database error in getUserRank:', error);
      throw new Error('Failed to retrieve user rank');
    }

    if (!data) {
      return null; // User hasn't played this level yet
    }

    // Get total number of users for this level to calculate percentile
    const { count } = await supabaseAdmin
      .from('leaderboard_cache')
      .select('*', { count: 'exact', head: true })
      .eq('module_type', moduleType)
      .eq('category', category)
      .eq('level', level);

    const percentile = count ? Math.ceil(((count - data.rank_position + 1) / count) * 100) : 0;

    return {
      rank_position: data.rank_position,
      global_rank: data.global_rank,
      total_users: count || 0,
      percentile
    };

  } catch (error) {
    console.error('Error getting user rank:', error);
    throw error;
  }
}

/**
 * Refresh the leaderboard cache (should be called periodically)
 * @returns {Promise<boolean>} Success status
 */
export async function refreshLeaderboardCache() {
  if (useMockAuth) {
    console.log('Mock refreshLeaderboardCache');
    return true;
  }

  try {
    const { error } = await supabaseAdmin.rpc('refresh_leaderboard_cache');
    
    if (error) {
      console.error('Error refreshing leaderboard cache:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error refreshing leaderboard cache:', error);
    return false;
  }
}