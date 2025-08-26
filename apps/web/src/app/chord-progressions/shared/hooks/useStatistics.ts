/**
 * Statistics Hook for Chord Progressions
 * 
 * Handles saving game session statistics to the server and managing
 * personal bests and leaderboard data for the UI.
 */

import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../../../../components/auth/ProtectedRoute';

/**
 * Wrapper to add timeout to fetch requests
 */
function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number = 3000): Promise<Response> {
  return Promise.race([
    fetch(url, options),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Request timeout after ${timeoutMs}ms`)), timeoutMs)
    )
  ]);
}

interface SessionData {
  moduleType: string;
  category: string;
  level: string;
  accuracy: number;
  avgTime: number;
  totalTime: number;
  problemsSolved: number;
  correctAnswers: number;
  bestStreak: number;
  completed: boolean;
  passed: boolean;
  startTime: string;
  endTime: string;
  sessionToken: string;
}

interface StatisticsResult {
  success: boolean;
  sessionId?: string;
  isPersonalBest?: boolean;
  previousBest?: {
    accuracy: number;
    time: number;
  };
  newRank?: number;
  message?: string;
  error?: string;
}

interface UserLevelStats {
  hasPlayed: boolean;
  statistics?: {
    moduleType: string;
    category: string;
    level: string;
    bestAccuracy: number;
    bestTime: number;
    bestScore: number;
    totalAttempts: number;
    bestStreak: number;
    firstPlayedAt: string;
    lastPlayedAt: string;
    bestAchievedAt: string;
  };
  rank?: {
    position: number;
    totalUsers: number;
    percentile: number;
    globalRank: number;
  };
}

interface LeaderboardEntry {
  rankPosition: number;
  userName: string;
  bestAccuracy: number;
  bestTime: number;
  bestScore: number;
  totalAttempts: number;
  bestAchievedAt: string;
}

export interface StatisticsHook {
  // State
  isSaving: boolean;
  isLoadingStats: boolean;
  isLoadingLeaderboard: boolean;
  userStats: UserLevelStats | null;
  leaderboard: LeaderboardEntry[];
  lastResult: StatisticsResult | null;
  
  // Actions
  saveSession: (sessionData: SessionData) => Promise<StatisticsResult>;
  loadUserStats: (moduleType: string, category: string, level: string) => Promise<void>;
  loadLeaderboard: (moduleType: string, category: string, level: string, limit?: number) => Promise<void>;
  generateSessionToken: () => string;
  clearLastResult: () => void;
}

/**
 * Generate a unique session token for anti-cheat protection
 */
function generateSessionToken(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Custom hook for managing statistics and leaderboard data
 */
export const useStatistics = (): StatisticsHook => {
  const authState = useAuth();
  const user = authState.user;
  
  // State management
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false);
  const [userStats, setUserStats] = useState<UserLevelStats | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [lastResult, setLastResult] = useState<StatisticsResult | null>(null);
  
  /**
   * Save a completed game session to the server
   */
  const saveSession = useCallback(async (sessionData: SessionData): Promise<StatisticsResult> => {
    console.log('🎯 saveSession called with data:', sessionData);
    
    if (!user) {
      console.log('❌ No user found for statistics save');
      return {
        success: false,
        error: 'User must be authenticated to save statistics'
      };
    }
    
    console.log('✅ User found for statistics save:', user.email);
    setIsSaving(true);
    setLastResult(null);
    
    try {
      console.log('📤 Sending request to /api/progress/save');
      const response = await fetchWithTimeout('/api/progress/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sessionData),
        credentials: 'include', // Include cookies for JWT
      }, 5000); // 5 second timeout for save operations
      
      const result = await response.json();
      console.log('📥 Server response:', { status: response.status, result });
      
      if (!response.ok) {
        console.log('❌ Server error:', result);
        throw new Error(result.error || 'Failed to save session');
      }
      
      console.log('✅ Session saved successfully:', result);
      
      const statisticsResult: StatisticsResult = {
        success: true,
        sessionId: result.sessionId,
        isPersonalBest: result.isPersonalBest,
        previousBest: result.previousBest,
        newRank: result.newRank,
        message: result.message
      };
      
      setLastResult(statisticsResult);
      
      // If this was a personal best, reload user stats and leaderboard
      if (result.isPersonalBest) {
        await loadUserStats(sessionData.moduleType, sessionData.category, sessionData.level);
        await loadLeaderboard(sessionData.moduleType, sessionData.category, sessionData.level);
      }
      
      return statisticsResult;
      
    } catch (error) {
      console.error('Error saving session:', error);
      const errorResult: StatisticsResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
      setLastResult(errorResult);
      return errorResult;
      
    } finally {
      setIsSaving(false);
    }
  }, [user]);
  
  /**
   * Load user's personal statistics for a specific level
   */
  const loadUserStats = useCallback(async (moduleType: string, category: string, level: string): Promise<void> => {
    if (!user) {
      setUserStats(null);
      return;
    }
    
    setIsLoadingStats(true);
    
    try {
      const response = await fetchWithTimeout(
        `/api/progress/level/${moduleType}/${category}/${level}`,
        {
          credentials: 'include',
        },
        3000 // 3 second timeout
      );
      
      if (!response.ok) {
        throw new Error('Failed to load user statistics');
      }
      
      const result = await response.json();
      
      if (result.success) {
        setUserStats({
          hasPlayed: result.hasPlayed,
          statistics: result.statistics,
          rank: result.rank
        });
      }
      
    } catch (error) {
      console.error('Error loading user statistics:', error);
      setUserStats(null);
    } finally {
      setIsLoadingStats(false);
    }
  }, [user]);
  
  /**
   * Load leaderboard for a specific level
   */
  const loadLeaderboard = useCallback(async (
    moduleType: string, 
    category: string, 
    level: string, 
    limit: number = 10
  ): Promise<void> => {
    if (!user) {
      setLeaderboard([]);
      return;
    }
    
    setIsLoadingLeaderboard(true);
    
    try {
      const response = await fetchWithTimeout(
        `/api/leaderboards/level/${moduleType}/${category}/${level}?limit=${limit}`,
        {
          credentials: 'include',
        },
        3000 // 3 second timeout
      );
      
      if (!response.ok) {
        throw new Error('Failed to load leaderboard');
      }
      
      const result = await response.json();
      
      if (result.success) {
        setLeaderboard(result.leaderboard || []);
      }
      
    } catch (error) {
      console.error('Error loading leaderboard:', error);
      setLeaderboard([]);
    } finally {
      setIsLoadingLeaderboard(false);
    }
  }, [user]);
  
  /**
   * Clear the last result (useful for dismissing notifications)
   */
  const clearLastResult = useCallback(() => {
    setLastResult(null);
  }, []);
  
  // Clear statistics when user logs out
  useEffect(() => {
    if (!user) {
      setUserStats(null);
      setLeaderboard([]);
      setLastResult(null);
      // Reset loading states when user logs out
      setIsLoadingStats(false);
      setIsLoadingLeaderboard(false);
      setIsSaving(false);
    }
  }, [user]);
  
  return {
    // State
    isSaving,
    isLoadingStats,
    isLoadingLeaderboard,
    userStats,
    leaderboard,
    lastResult,
    
    // Actions
    saveSession,
    loadUserStats,
    loadLeaderboard,
    generateSessionToken,
    clearLastResult
  };
};