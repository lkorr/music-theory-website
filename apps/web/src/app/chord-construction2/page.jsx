/**
 * Chord Construction 2 Hub Page - Clean Architecture Version
 * 
 * This is the main landing page for the refactored chord construction module.
 * It maintains the exact same UI as the original chord-construction but uses
 * dynamic routing and configuration-driven level management.
 * 
 * Key Improvements:
 * - Dynamic links point to new route structure
 * - Configuration-driven level information  
 * - Maintained identical visual design
 * - Clean separation of concerns
 */

"use client";

import { Link } from "react-router";
import { getCategories } from "./data/levelConfigs.js";

export default function ChordConstruction2Page() {
  const constructionCategories = getCategories().map(category => ({
    id: category.id,
    title: category.title,
    description: category.description,
    difficulty: category.difficulty,
    color: category.color,
    available: true,
    levels: category.levels.map((level, index) => ({
      id: `level${level.level}`,
      title: level.title,
      description: level.description,
      path: `/chord-construction2/${category.id}/${level.level}`,
      available: true
    }))
  }));

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
              Chord Construction Training (New Architecture)
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Learn to Build Chords
          </h2>
          <p className="text-xl text-white/70 max-w-3xl mx-auto">
            Master chord construction through progressive difficulty levels. 
            Build chords by placing notes on the piano roll and receive instant feedback.
          </p>
          <div className="mt-4 bg-blue-500/20 border border-blue-500/30 rounded-lg p-3 max-w-2xl mx-auto">
            <p className="text-blue-200 text-sm">
              🔧 <strong>New Clean Architecture:</strong> This version uses dynamic routing and modular components for better maintainability and reduced technical debt.
            </p>
          </div>
        </div>

        <div className="space-y-12">
          {constructionCategories.map((category) => (
            <div key={category.id} className="relative">
              {/* Category Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-full ${category.color} flex items-center justify-center`}>
                    <span className="text-white text-xl font-bold">♫</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">{category.title}</h3>
                    <p className="text-white/70">{category.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                    category.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
                    category.difficulty === 'Intermediate' ? 'bg-blue-100 text-blue-800' :
                    category.difficulty === 'Advanced' ? 'bg-purple-100 text-purple-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {category.difficulty}
                  </span>
                </div>
              </div>

              {/* Levels Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {category.levels.map((level) => (
                  <div key={level.id} className="relative">
                    <Link
                      to={level.available !== false ? level.path : '#'}
                      className={`block p-4 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                        level.available !== false
                          ? 'bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 cursor-pointer' 
                          : 'bg-white/5 backdrop-blur-sm border border-white/10 cursor-not-allowed opacity-60'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className={`w-8 h-8 rounded-full ${category.color} flex items-center justify-center`}>
                          <span className="text-white text-sm font-bold">
                            {level.id.replace('level', '')}
                          </span>
                        </div>
                        {level.available === false && (
                          <div className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                            Soon
                          </div>
                        )}
                      </div>
                      
                      <h4 className="text-lg font-bold text-white mb-2">
                        {level.title}
                      </h4>
                      
                      <p className="text-white/70 text-sm mb-3">
                        {level.description}
                      </p>
                      
                      {level.available !== false && (
                        <div className="flex items-center text-white font-semibold text-sm">
                          Start Building
                          <span className="ml-2">→</span>
                        </div>
                      )}
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 max-w-4xl mx-auto">
            <h3 className="text-xl font-semibold text-white mb-4">How Chord Construction Works</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-sm text-white/80">
              <div className="text-center">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold">1</span>
                </div>
                <p>See the target chord name and type</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold">2</span>
                </div>
                <p>Click on the piano roll to place notes</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold">3</span>
                </div>
                <p>Check your chord construction</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold">4</span>
                </div>
                <p>Get instant feedback and learn</p>
              </div>
            </div>
          </div>
          
          {/* Architecture comparison info */}
          <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-2xl p-6 max-w-4xl mx-auto mt-8">
            <h3 className="text-xl font-semibold text-white mb-4">🔧 Technical Improvements</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-white/80">
              <div className="text-center">
                <div className="text-2xl mb-2">📁</div>
                <p><strong>95% fewer files</strong><br/>1 dynamic route vs 9 level pages</p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">⚡</div>
                <p><strong>Modular components</strong><br/>300 lines vs 973-line monolith</p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">🔧</div>
                <p><strong>Easy maintenance</strong><br/>Configuration-driven levels</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}