/**
 * Full Leaderboard Page
 * 
 * Comprehensive leaderboard view with filtering, pagination, and detailed statistics
 * for all chord recognition levels and categories.
 */

import type { ReactNode } from 'react';
import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router';
import { useAuth } from '../../components/auth/ProtectedRoute';
import { useStatistics } from '../core-training/chord-recognition/shared/hooks/useStatistics';

interface LeaderboardEntry {
  rankPosition: number;
  userName: string;
  bestAccuracy: number;
  bestTime: number;
  bestScore: number;
  totalAttempts: number;
  bestAchievedAt: string;
}

interface FilterOptions {
  moduleType: string;
  category: string;
  level: string;
}

// Module definitions based on dashboard structure
const MODULES = [
  { 
    id: 'chord-recognition', 
    name: 'Chord Recognition',
    categories: [
      { id: 'basic-triads', name: 'Basic Triads', levels: ['1', '2', '3', '4'] },
      { id: 'seventh-chords', name: 'Seventh Chords', levels: ['1', '2', '3', '4', '5'] },
      { id: 'extended-chords', name: 'Extended Chords', levels: ['1', '2', '3', '4', '5', '6'] },
    ]
  },
  { 
    id: 'chord-construction', 
    name: 'Chord Construction',
    categories: [
      { id: 'basic-triads', name: 'Basic Triads', levels: ['1', '2', '3', '4'] },
      { id: 'seventh-chords', name: 'Seventh Chords', levels: ['1', '2', '3', '4', '5'] },
      { id: 'extended-chords', name: 'Extended Chords', levels: ['1', '2', '3', '4', '5', '6'] },
    ]
  },
  { 
    id: 'chord-progressions', 
    name: 'Chord Progressions',
    categories: [
      { id: 'roman-numerals', name: 'Roman Numerals', levels: ['1', '2', '3', '4'] },
    ]
  },
  { 
    id: 'transcription', 
    name: 'Chord Transcription',
    categories: [
      { id: 'basic-triads', name: 'Basic Triads', levels: ['1', '2', '3', '4'] },
      { id: 'seventh-chords', name: 'Seventh Chords', levels: ['1', '2', '3', '4'] },
      { id: 'extended-chords', name: 'Extended Chords', levels: ['1', '2', '3', '4'] },
      { id: 'jazz-chords', name: 'Jazz Chords', levels: ['1', '2', '3', '4'] },
    ]
  },
  { 
    id: 'chord-progression-transcription', 
    name: 'Chord Progression Transcription',
    categories: [
      { id: 'major-progressions', name: 'Major Progressions', levels: ['1', '2', '3', '4'] },
    ]
  },
  { 
    id: 'counterpoint', 
    name: 'Counterpoint',
    categories: [
      { id: 'species', name: 'Species Counterpoint', levels: ['1', '2', '3', '4', '5'] },
    ]
  }
];

// Get categories for current module
const getCurrentModuleCategories = (moduleType: string) => {
  const module = MODULES.find(m => m.id === moduleType);
  return module ? module.categories : [];
};

export default function FullLeaderboardPage(): ReactNode {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const authState = useAuth();
  const user = authState.user;
  const statistics = useStatistics();

  // Filter state
  const [filters, setFilters] = useState<FilterOptions>({
    moduleType: searchParams.get('module') || 'chord-recognition',
    category: searchParams.get('category') || 'basic-triads',
    level: searchParams.get('level') || '1'
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load leaderboard data when filters change
  useEffect(() => {
    if (!user) return;
    
    const loadLeaderboard = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Load more entries for full leaderboard
        await Promise.all([
          statistics.loadLeaderboard(
            filters.moduleType,
            filters.category,
            filters.level,
            itemsPerPage
          ),
          statistics.loadUserStats(
            filters.moduleType,
            filters.category,
            filters.level
          )
        ]);
      } catch (err) {
        setError('Failed to load leaderboard data');
        console.error('Leaderboard loading error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadLeaderboard();
  }, [filters, user, itemsPerPage]);

  // Update URL when filters change
  const updateFilters = (newFilters: Partial<FilterOptions>) => {
    let updatedFilters = { ...filters, ...newFilters };
    
    // If module changes, reset category and level to first available options
    if (newFilters.moduleType && newFilters.moduleType !== filters.moduleType) {
      const moduleCategories = getCurrentModuleCategories(newFilters.moduleType);
      if (moduleCategories.length > 0) {
        updatedFilters.category = moduleCategories[0].id;
        updatedFilters.level = moduleCategories[0].levels[0];
      }
    }
    
    // If category changes, reset level to first available option
    if (newFilters.category && newFilters.category !== filters.category) {
      const moduleCategories = getCurrentModuleCategories(updatedFilters.moduleType);
      const selectedCategory = moduleCategories.find(c => c.id === newFilters.category);
      if (selectedCategory && selectedCategory.levels.length > 0) {
        updatedFilters.level = selectedCategory.levels[0];
      }
    }
    
    setFilters(updatedFilters);
    
    // Reset to first page when filters change
    setCurrentPage(1);
    
    // Update URL without page reload
    const params = new URLSearchParams();
    params.set('module', updatedFilters.moduleType);
    params.set('category', updatedFilters.category);
    params.set('level', updatedFilters.level);
    navigate(`/leaderboard?${params.toString()}`, { replace: true });
  };

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

  const getRankBadgeColor = (position: number) => {
    if (position <= 3) return 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30';
    if (position <= 10) return 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30';
    return 'bg-white/5 hover:bg-white/10';
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">🏆 Global Leaderboard</h1>
          <p className="text-white/70 mb-6">Sign in to view rankings and compete with other players</p>
          <Link
            to="/auth/login"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign In to View Leaderboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e]">
      {/* Logo */}
      <Link to="/" className="absolute top-4 left-4 z-50">
        <img src="/pailiaq-logo-small.png" alt="Logo" className="w-12 h-12" />
      </Link>

      {/* Header */}
      <header className="bg-black/20 backdrop-blur-md border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4 ml-16">
            <Link 
              to="/" 
              className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <span className="text-white text-sm font-bold">←</span>
            </Link>
            <h1 className="text-2xl font-bold text-white">🏆 Global Leaderboard</h1>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        {/* Filter Controls */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">Filter Rankings</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Module Filter */}
            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">
                Module
              </label>
              <select
                value={filters.moduleType}
                onChange={(e) => updateFilters({ moduleType: e.target.value })}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {MODULES.map(module => (
                  <option key={module.id} value={module.id} className="bg-gray-800">
                    {module.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => updateFilters({ category: e.target.value })}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {getCurrentModuleCategories(filters.moduleType).map(category => (
                  <option key={category.id} value={category.id} className="bg-gray-800">
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Level Filter */}
            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">
                Level
              </label>
              <select
                value={filters.level}
                onChange={(e) => updateFilters({ level: e.target.value })}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {getCurrentModuleCategories(filters.moduleType).find(c => c.id === filters.category)?.levels.map(level => (
                  <option key={level} value={level} className="bg-gray-800">
                    Level {level}
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Actions */}
            <div className="flex items-end">
              <Link
                to={`/${filters.moduleType}/${filters.category}/${filters.level}`}
                className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors text-center"
              >
                Play This Level
              </Link>
            </div>
          </div>
        </div>

        {/* Current Selection Info */}
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-white">
            {MODULES.find(m => m.id === filters.moduleType)?.name} - {getCurrentModuleCategories(filters.moduleType).find(c => c.id === filters.category)?.name} - Level {filters.level}
          </h3>
          <p className="text-white/70">
            Showing top {statistics.leaderboard.length} players
          </p>
        </div>

        {/* User's Personal Stats */}
        {statistics.userStats && statistics.userStats.hasPlayed && (
          <div className="bg-blue-500/20 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-blue-500/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-blue-200">Your Performance</h3>
              {statistics.userStats.rank && (
                <div className="text-blue-300 font-semibold">
                  Rank #{statistics.userStats.rank.position} 
                  <span className="text-sm text-blue-400 ml-2">
                    ({statistics.userStats.rank.percentile}th percentile)
                  </span>
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-300">
                  {statistics.userStats.statistics!.bestAccuracy.toFixed(1)}%
                </div>
                <div className="text-blue-400/70">Best Accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-300">
                  {statistics.userStats.statistics!.bestTime.toFixed(1)}s
                </div>
                <div className="text-blue-400/70">Best Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-300">
                  {statistics.userStats.statistics!.bestScore}
                </div>
                <div className="text-blue-400/70">Best Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-300">
                  {statistics.userStats.statistics!.totalAttempts}
                </div>
                <div className="text-blue-400/70">Total Attempts</div>
              </div>
            </div>
          </div>
        )}

        {/* Encourage user to play if they haven't */}
        {statistics.userStats && !statistics.userStats.hasPlayed && (
          <div className="bg-green-500/20 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-green-500/30">
            <div className="text-center">
              <div className="text-4xl mb-3">🎯</div>
              <h3 className="text-xl font-bold text-green-200 mb-2">Ready to Join the Rankings?</h3>
              <p className="text-green-300/70 mb-4">
                Complete this level to see where you rank among other players!
              </p>
              <Link
                to={`/${filters.moduleType}/${filters.category}/${filters.level}`}
                className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                Play Now →
              </Link>
            </div>
          </div>
        )}

        {/* Leaderboard */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
          {error && (
            <div className="text-center py-8">
              <p className="text-red-400 mb-2">⚠️ {error}</p>
              <button
                onClick={() => window.location.reload()}
                className="text-blue-300 hover:text-blue-200 underline"
              >
                Try Again
              </button>
            </div>
          )}

          {isLoading || statistics.isLoadingLeaderboard ? (
            <div className="space-y-3">
              {Array.from({ length: 10 }).map((_, index) => (
                <div
                  key={`loading-${index}`}
                  className="flex items-center justify-between p-4 rounded-lg bg-white/5 animate-pulse"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-white/20 rounded"></div>
                    <div>
                      <div className="w-32 h-5 bg-white/20 rounded mb-2"></div>
                      <div className="w-24 h-3 bg-white/10 rounded"></div>
                    </div>
                  </div>
                  <div className="flex space-x-6">
                    <div>
                      <div className="w-16 h-5 bg-white/20 rounded mb-1"></div>
                      <div className="w-12 h-3 bg-white/10 rounded"></div>
                    </div>
                    <div>
                      <div className="w-12 h-5 bg-white/20 rounded mb-1"></div>
                      <div className="w-16 h-3 bg-white/10 rounded"></div>
                    </div>
                    <div>
                      <div className="w-8 h-5 bg-white/20 rounded mb-1"></div>
                      <div className="w-12 h-3 bg-white/10 rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : statistics.leaderboard.length > 0 ? (
            <div className="space-y-2">
              {statistics.leaderboard.map((entry, index) => (
                <div
                  key={`${entry.rankPosition}-${entry.userName}`}
                  className={`flex items-center justify-between p-4 rounded-lg transition-colors ${getRankBadgeColor(entry.rankPosition)}`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`font-bold text-2xl min-w-[3rem] text-center ${entry.rankPosition <= 3 ? 'text-yellow-300' : 'text-white/70'}`}>
                      {getRankEmoji(entry.rankPosition)}
                    </div>
                    <div>
                      <div className="font-semibold text-white text-lg">
                        {entry.userName}
                      </div>
                      <div className="text-sm text-white/50">
                        {formatDate(entry.bestAchievedAt)} • {entry.totalAttempts} attempts
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-8 text-right">
                    <div>
                      <div className="font-bold text-green-300 text-lg">
                        {entry.bestAccuracy.toFixed(1)}%
                      </div>
                      <div className="text-xs text-white/50">Accuracy</div>
                    </div>
                    <div>
                      <div className="font-bold text-blue-300 text-lg">
                        {entry.bestTime.toFixed(1)}s
                      </div>
                      <div className="text-xs text-white/50">Avg Time</div>
                    </div>
                    <div>
                      <div className="font-bold text-purple-300 text-lg">
                        {entry.bestScore}
                      </div>
                      <div className="text-xs text-white/50">Score</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-xl font-bold text-white mb-2">No Rankings Yet</h3>
              <p className="text-white/70 mb-6">
                Be the first to complete {getCurrentModuleCategories(filters.moduleType).find(c => c.id === filters.category)?.name} Level {filters.level}!
              </p>
              <Link
                to={`/${filters.moduleType}/${filters.category}/${filters.level}`}
                className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Start Playing →
              </Link>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-center mt-8">
          <Link
            to={`/${filters.moduleType}`}
            className="px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
          >
            ← Back to Levels
          </Link>
        </div>
      </main>
    </div>
  );
}