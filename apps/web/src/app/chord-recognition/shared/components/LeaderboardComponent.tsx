/**
 * Leaderboard Component
 * 
 * Displays leaderboard rankings for chord recognition levels with personal bests
 * and competitive rankings. Shows top performers with accuracy and time metrics.
 */

import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { useAuth } from '../../../../components/auth/ProtectedRoute';
import { useStatistics } from '../hooks/useStatistics';

interface LeaderboardEntry {
  rankPosition: number;
  userName: string;
  bestAccuracy: number;
  bestTime: number;
  bestScore: number;
  totalAttempts: number;
  bestAchievedAt: string;
}

interface UserStats {
  hasPlayed: boolean;
  statistics?: {
    bestAccuracy: number;
    bestTime: number;
    bestScore: number;
    totalAttempts: number;
    bestAchievedAt: string;
  };
  rank?: {
    position: number;
    totalUsers: number;
    percentile: number;
  };
}

interface LeaderboardComponentProps {
  moduleType: string;
  category: string;
  level: string;
  limit?: number;
  showUserStats?: boolean;
  compact?: boolean;
}

export default function LeaderboardComponent({
  moduleType,
  category,
  level,
  limit = 10,
  showUserStats = true,
  compact = false
}: LeaderboardComponentProps): ReactNode {
  const authState = useAuth();
  const user = authState.user;
  const statistics = useStatistics();
  const [error, setError] = useState<string | null>(null);

  // Load leaderboard and user stats
  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        return;
      }

      console.log('LeaderboardComponent: Loading data for', moduleType, category, level);
      setError(null);

      try {
        // Load both leaderboard and user stats
        await Promise.all([
          statistics.loadLeaderboard(moduleType, category, level, limit),
          showUserStats ? statistics.loadUserStats(moduleType, category, level) : Promise.resolve()
        ]);
        console.log('LeaderboardComponent: Data loaded successfully');
      } catch (error) {
        console.error('Error loading leaderboard data:', error);
        setError('Failed to load leaderboard data');
      }
    };

    loadData();
  }, [moduleType, category, level, limit, showUserStats, user]);

  if (!user) {
    return (
      <div className={`bg-white/10 rounded-lg p-4 text-center ${compact ? '' : 'backdrop-blur-sm'}`}>
        <p className="text-white/70">Sign in to view leaderboard</p>
      </div>
    );
  }

  // Show leaderboard with loading states for individual sections instead of blocking the entire component

  if (error) {
    return (
      <div className={`bg-white/10 rounded-lg p-4 text-center ${compact ? '' : 'backdrop-blur-sm'}`}>
        <p className="text-red-400 mb-2">⚠️ Unable to load leaderboard</p>
        <p className="text-white/70 text-sm">{error}</p>
      </div>
    );
  }

  // Always render the leaderboard container, show loading states for individual sections

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return 'Today';
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getRankEmoji = (position: number) => {
    switch (position) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${position}`;
    }
  };

  return (
    <div className={`bg-white/10 rounded-lg ${compact ? 'p-3' : 'p-6'} ${compact ? '' : 'backdrop-blur-sm'}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`font-bold text-white ${compact ? 'text-lg' : 'text-xl'}`}>
          🏆 Leaderboard
        </h3>
        {!compact && (
          <div className="text-sm text-white/70">
            Top {Math.min(limit, statistics.leaderboard.length)} players
          </div>
        )}
      </div>

      {/* User's personal best (if available and not in compact mode) */}
      {showUserStats && statistics.userStats && statistics.userStats.hasPlayed && !compact && (
        <div className="mb-4 p-3 bg-blue-500/20 rounded-lg border border-blue-500/30">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-blue-200">Your Best Score</h4>
            {statistics.userStats.rank && (
              <div className="text-sm text-blue-300">
                Rank #{statistics.userStats.rank.position} ({statistics.userStats.rank.percentile}th percentile)
              </div>
            )}
          </div>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div>
              <div className="text-blue-300 font-medium">
                {statistics.userStats.statistics!.bestAccuracy.toFixed(1)}%
              </div>
              <div className="text-blue-400/70">Accuracy</div>
            </div>
            <div>
              <div className="text-blue-300 font-medium">
                {statistics.userStats.statistics!.bestTime.toFixed(1)}s
              </div>
              <div className="text-blue-400/70">Avg Time</div>
            </div>
            <div>
              <div className="text-blue-300 font-medium">
                {statistics.userStats.statistics!.totalAttempts}
              </div>
              <div className="text-blue-400/70">Attempts</div>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard entries */}
      <div className="space-y-2">
        {statistics.isLoadingLeaderboard ? (
          // Show loading placeholders
          Array.from({ length: Math.min(limit, 5) }).map((_, index) => (
            <div
              key={`loading-${index}`}
              className="flex items-center justify-between p-3 rounded-lg bg-white/5 animate-pulse"
            >
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-white/20 rounded"></div>
                <div>
                  <div className="w-20 h-4 bg-white/20 rounded mb-1"></div>
                  {!compact && <div className="w-32 h-3 bg-white/10 rounded"></div>}
                </div>
              </div>
              <div className="flex space-x-4 text-right">
                <div>
                  <div className="w-12 h-4 bg-white/20 rounded mb-1"></div>
                  {!compact && <div className="w-16 h-3 bg-white/10 rounded"></div>}
                </div>
                <div>
                  <div className="w-10 h-4 bg-white/20 rounded mb-1"></div>
                  {!compact && <div className="w-12 h-3 bg-white/10 rounded"></div>}
                </div>
              </div>
            </div>
          ))
        ) : statistics.leaderboard.length > 0 ? (
          // Show actual leaderboard data
          statistics.leaderboard.map((entry, index) => (
            <div
              key={`${entry.rankPosition}-${entry.userName}`}
              className={`flex items-center justify-between p-3 rounded-lg transition-colors
                ${entry.rankPosition <= 3 
                  ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30' 
                  : 'bg-white/5 hover:bg-white/10'
                }
              `}
            >
              <div className="flex items-center space-x-3">
                <div className={`font-bold ${compact ? 'text-sm' : 'text-lg'} 
                  ${entry.rankPosition <= 3 ? 'text-yellow-300' : 'text-white/70'}`}>
                  {getRankEmoji(entry.rankPosition)}
                </div>
                <div>
                  <div className={`font-semibold text-white ${compact ? 'text-sm' : ''}`}>
                    {entry.userName}
                  </div>
                  {!compact && (
                    <div className="text-xs text-white/50">
                      {formatDate(entry.bestAchievedAt)} • {entry.totalAttempts} attempts
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex space-x-4 text-right">
                <div>
                  <div className={`font-semibold text-green-300 ${compact ? 'text-sm' : ''}`}>
                    {entry.bestAccuracy.toFixed(1)}%
                  </div>
                  {!compact && <div className="text-xs text-white/50">Accuracy</div>}
                </div>
                <div>
                  <div className={`font-semibold text-blue-300 ${compact ? 'text-sm' : ''}`}>
                    {entry.bestTime.toFixed(1)}s
                  </div>
                  {!compact && <div className="text-xs text-white/50">Avg Time</div>}
                </div>
              </div>
            </div>
          ))
        ) : (
          // Show empty state
          <div className="p-4 text-center">
            <p className="text-white/70">No leaderboard data yet.</p>
            <p className="text-white/50 text-sm">Be the first to complete this level!</p>
          </div>
        )}
      </div>

      {/* Show if user didn't play this level yet */}
      {showUserStats && statistics.userStats && !statistics.userStats.hasPlayed && !compact && (
        <div className="mt-4 p-3 bg-white/10 rounded-lg text-center">
          <p className="text-white/70 text-sm">
            Complete this level to see your ranking!
          </p>
        </div>
      )}

      {/* Compact mode: show view full leaderboard link */}
      {compact && (
        <div className="mt-3 text-center">
          <Link
            to={`/leaderboard?module=${moduleType}&category=${category}&level=${level}`}
            className="text-blue-300 hover:text-blue-200 text-xs transition-colors underline"
          >
            View Full Leaderboard →
          </Link>
        </div>
      )}
    </div>
  );
}