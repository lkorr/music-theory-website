"use client";

import { Link } from "react-router";
import { CompactAuthButton } from "../../components/auth/AuthButton.jsx";

export default function ChordRecognition2Page() {
  const recognitionCategories = [
    {
      id: 'basic-triads',
      title: 'Basic Triads',
      description: 'Major, Minor, Diminished, and Augmented triads',
      difficulty: 'Beginner',
      color: 'bg-green-500',
      available: true,
      levels: [
        {
          id: 'level1',
          title: 'Level 1: Basic Triads',
          description: 'Identify major, minor, diminished, and augmented triads',
          path: '/chord-recognition2/basic-triads/1'
        },
        {
          id: 'level2',
          title: 'Level 2: First Inversions',
          description: 'Basic triads with first inversions',
          path: '/chord-recognition2/basic-triads/2'
        },
        {
          id: 'level3',
          title: 'Level 3: All Inversions',
          description: 'Root position, first and second inversions',
          path: '/chord-recognition2/basic-triads/3'
        },
        {
          id: 'level4',
          title: 'Level 4: Open Voicings',
          description: 'Triads with wide spacing and octave doubling',
          path: '/chord-recognition2/basic-triads/4'
        }
      ]
    },
    {
      id: 'seventh-chords',
      title: 'Seventh Chords',
      description: '7th chords including major 7th, minor 7th, dominant 7th',
      difficulty: 'Intermediate',
      color: 'bg-blue-500',
      available: true,
      levels: [
        {
          id: 'level1',
          title: 'Level 1: Basic Seventh Chords',
          description: 'All 7th chord types in root position',
          path: '/chord-recognition2/seventh-chords/1'
        },
        {
          id: 'level2',
          title: 'Level 2: First Inversions',
          description: '7th chords with first inversion',
          path: '/chord-recognition2/seventh-chords/2'
        },
        {
          id: 'level3',
          title: 'Level 3: Second Inversions',
          description: '7th chords with second inversion',
          path: '/chord-recognition2/seventh-chords/3'
        },
        {
          id: 'level4',
          title: 'Level 4: Third Inversions',
          description: '7th chords with third inversion',
          path: '/chord-recognition2/seventh-chords/4'
        },
        {
          id: 'level5',
          title: 'Level 5: Open Voicings',
          description: '7th chords with open voicings',
          path: '/chord-recognition2/seventh-chords/5'
        }
      ]
    },
    {
      id: 'extended-chords',
      title: 'Extended Chords',
      description: '9th, 11th, and 13th chords with advanced extensions',
      difficulty: 'Advanced',
      color: 'bg-purple-500',
      available: true,
      levels: [
        {
          id: 'level1',
          title: 'Level 1: 9th Chords',
          description: 'Major 9th, minor 9th, dominant 9th',
          path: '/chord-recognition2/extended-chords/1'
        },
        {
          id: 'level2',
          title: 'Level 2: 11th Chords',
          description: 'Major 11th, minor 11th variations',
          path: '/chord-recognition2/extended-chords/2'
        },
        {
          id: 'level3',
          title: 'Level 3: 13th Chords',
          description: 'Major 13th, minor 13th variations',
          path: '/chord-recognition2/extended-chords/3'
        },
        {
          id: 'level4',
          title: 'Level 4: 9th Chord Inversions',
          description: '9th chords with inversions',
          path: '/chord-recognition2/extended-chords/4'
        },
        {
          id: 'level5',
          title: 'Level 5: 11th Chord Inversions',
          description: '11th chords with inversions',
          path: '/chord-recognition2/extended-chords/5'
        },
        {
          id: 'level6',
          title: 'Level 6: 13th Chord Inversions',
          description: '13th chords with inversions',
          path: '/chord-recognition2/extended-chords/6'
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e] relative">
      {/* Logo in absolute top-left corner */}
      <Link to="/" className="absolute top-2 left-2 z-50">
        <img src="/pailiaq-logo-small.png" alt="Logo" className="w-12 h-12" />
      </Link>
      
      <header className="bg-black/20 backdrop-blur-md border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4 ml-16">
            <Link to="/midi-training" className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
              <span className="text-white text-sm font-bold">←</span>
            </Link>
            <h1 className="text-xl font-bold text-white">
              Chord Recognition Training (New Architecture)
            </h1>
          </div>
          <CompactAuthButton />
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Learn to Recognize Chords
          </h2>
          <p className="text-xl text-white/70 max-w-3xl mx-auto">
            Master chord recognition through progressive difficulty levels. 
            Listen to chords and identify them by name to develop your ear training skills.
          </p>
          <div className="mt-4 bg-blue-600/20 border border-blue-500/50 rounded-xl p-4 max-w-2xl mx-auto">
            <p className="text-blue-300 text-sm">
              <strong>New Architecture:</strong> This is the refactored version using clean architecture patterns. 
              Same functionality, 95% less technical debt!
            </p>
          </div>
        </div>

        <div className="space-y-12">
          {recognitionCategories.map((category) => (
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
                          Start Training
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

        {/* Comparison Section */}
        <div className="mt-16 bg-white/10 backdrop-blur-sm rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">Architecture Comparison</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-red-600/20 border border-red-500/50 rounded-xl p-6">
              <h4 className="text-lg font-bold text-red-300 mb-3">Old Architecture</h4>
              <ul className="text-white/70 space-y-2 text-sm">
                <li>• 15+ individual level pages</li>
                <li>• 15+ levelUtils.js files</li>
                <li>• Massive code duplication</li>
                <li>• Hard to maintain consistency</li>
                <li>• Adding new levels = new folders + files</li>
                <li>• Scattered configuration</li>
              </ul>
            </div>
            <div className="bg-green-600/20 border border-green-500/50 rounded-xl p-6">
              <h4 className="text-lg font-bold text-green-300 mb-3">New Architecture</h4>
              <ul className="text-white/70 space-y-2 text-sm">
                <li>• 1 dynamic route handler</li>
                <li>• 1 universal component</li>
                <li>• Configuration-driven behavior</li>
                <li>• Consistent across all levels</li>
                <li>• Adding new levels = config entry only</li>
                <li>• Centralized configuration</li>
              </ul>
            </div>
          </div>
          <div className="text-center mt-6">
            <Link
              to="/chord-recognition"
              className="bg-white/20 hover:bg-white/30 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Compare with Original Version
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}