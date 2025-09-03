/**
 * Chord Progressions 2 Hub Page - Clean Architecture Version
 * 
 * This is the main landing page for the refactored chord progressions module.
 * It maintains identical functionality and UI to the original chord-progressions 
 * but uses dynamic routing and configuration-driven level management.
 * 
 * Key Improvements:
 * - Dynamic links point to new route structure (/chord-progressions/1, /2, etc.)
 * - Configuration-driven level information from levelConfigs.ts
 * - Clean separation of concerns
 * - Maintained identical visual design
 * - Easy to add new levels (just add to config)
 */

"use client";

import { Link } from "react-router";
import { getAllLevels } from "./data/levelConfigs";
import type { LevelConfig } from "./data/levelConfigs";

interface Level {
  id: string;
  title: string;
  description: string;
  path: string;
}

interface ProgressionCategory {
  id: string;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  color: string;
  available: boolean;
  levels: Level[];
}

export default function ChordProgressions2Page() {
  // Get all levels from configuration
  const allLevels = getAllLevels();
  
  // Map levels to categories (identical structure to original)
  const progressionCategories: ProgressionCategory[] = allLevels.map((levelConfig: LevelConfig) => {
    // Map each level config to a category
    const categoryInfo = {
      1: {
        id: 'basic-progressions',
        title: 'Basic Progressions',
        description: 'Common 4-chord progressions in major and minor keys',
        difficulty: 'Beginner' as const,
        color: 'bg-green-500'
      },
      2: {
        id: 'progressions-with-inversions',
        title: 'Progressions with Inversions',
        description: 'Chord progressions with first and second inversions',
        difficulty: 'Intermediate' as const,
        color: 'bg-yellow-500'
      },
      3: {
        id: 'non-diatonic-progressions',
        title: 'Non-Diatonic Chords',
        description: 'Borrowed chords, Neapolitan, and augmented chords',
        difficulty: 'Advanced' as const,
        color: 'bg-purple-500'
      },
      4: {
        id: 'non-diatonic-inversions',
        title: 'Non-Diatonic with Inversions',
        description: 'Advanced borrowed chords with inversion labeling',
        difficulty: 'Expert' as const,
        color: 'bg-indigo-500'
      }
    };

    const info = categoryInfo[levelConfig.level as keyof typeof categoryInfo];
    
    return {
      id: info.id,
      title: info.title,
      description: info.description,
      difficulty: info.difficulty,
      color: info.color,
      available: true,
      levels: [{
        id: levelConfig.id,
        title: levelConfig.title,
        description: levelConfig.description,
        path: `/chord-progressions/${levelConfig.level}`
      }]
    };
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e] relative">
      {/* Logo in absolute top-left corner */}
      <Link to="/" className="absolute top-2 left-2 z-50">
        <img src="/pailiaq-logo-small.png" alt="Logo" className="w-12 h-12" />
      </Link>
      
      <header className="bg-black/20 backdrop-blur-md border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4 ml-16">
            <Link to="/dashboard" className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
              <span className="text-white text-sm font-bold">←</span>
            </Link>
            <h1 className="text-xl font-bold text-white">
              Chord Progressions Training
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <div className="w-24 h-24 rounded-full bg-purple-500 flex items-center justify-center mx-auto mb-8">
            <span className="text-4xl text-white">🎼</span>
          </div>
          
          <h2 className="text-5xl font-bold text-white mb-6">
            Chord Progressions
          </h2>
          
          <p className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed mb-6">
            Master the art of identifying chord progressions using roman numeral analysis. 
            Learn to recognize common harmonic patterns in different keys and understand how chords move together to create musical phrases.
          </p>
          
          {/* Quick Navigation */}
          <div className="flex justify-center space-x-4">
            <Link
              to="/leaderboard?module=chord-progressions"
              className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
            >
              🏆 View Chord Progressions Leaderboard
            </Link>
          </div>
        </div>

        {/* Categories Grid - Now 4 categories */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-8 mb-16">
          {progressionCategories.map((category) => (
            <Link
              key={category.id}
              to={category.levels[0].path}
              className="block group"
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 transition-all duration-300 transform group-hover:scale-105 group-hover:bg-white/20">
                {/* Category Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className={`w-16 h-16 ${category.color} rounded-2xl flex items-center justify-center`}>
                    <span className="text-white text-2xl font-bold">🎼</span>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      category.difficulty === 'Beginner' ? 'bg-green-500/20 text-green-300' :
                      category.difficulty === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-300' :
                      category.difficulty === 'Advanced' ? 'bg-purple-500/20 text-purple-300' :
                      'bg-red-500/20 text-red-300'
                    }`}>
                      {category.difficulty}
                    </span>
                    {category.available && (
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full">
                        Available
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-4 group-hover:text-white/90 transition-colors">
                  {category.title}
                </h3>
                
                <p className="text-white/70 mb-6 leading-relaxed text-sm">
                  {category.description}
                </p>

                {/* Level Info */}
                <div className="text-white/60 text-sm leading-relaxed">
                  {category.levels[0].description}
                </div>

                <div className="mt-6 flex items-center text-white font-medium group-hover:text-white/80 transition-colors">
                  Start Level
                  <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Instructions Section */}
        <div className="mt-16 bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">
            How to Use Roman Numeral Analysis
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-bold">1</span>
              </div>
              <h4 className="text-white font-medium mb-2">Listen</h4>
              <p className="text-white/60 text-sm">Listen to the chord progression carefully</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-bold">2</span>
              </div>
              <h4 className="text-white font-medium mb-2">Identify Key</h4>
              <p className="text-white/60 text-sm">Determine if the progression is in major or minor</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-bold">3</span>
              </div>
              <h4 className="text-white font-medium mb-2">Analyze Chords</h4>
              <p className="text-white/60 text-sm">Use roman numerals (I, ii, V7, etc.) to label each chord</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-bold">4</span>
              </div>
              <h4 className="text-white font-medium mb-2">Submit</h4>
              <p className="text-white/60 text-sm">Enter your analysis and get instant feedback</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}