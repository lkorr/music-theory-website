"use client";

import { Link } from "react-router";
import { CompactAuthButton } from "../../components/auth/AuthButton.jsx";

export default function ChordRecognitionPage() {
  const difficultyLevels = [
    {
      id: 'basic-triads',
      title: 'Basic Triads',
      description: 'Major, Minor, Diminished, and Augmented triads',
      difficulty: 'Beginner',
      color: 'bg-green-500',
      available: true
    },
    {
      id: 'seventh-chords',
      title: '7th Chords',
      description: '7th chords including major 7th, minor 7th, dominant 7th',
      difficulty: 'Intermediate',
      color: 'bg-blue-500',
      available: true
    },
    {
      id: 'jazz-chords',
      title: 'Extended Chords',
      description: '9th, 11th, and 13th chords with extensions',
      difficulty: 'Advanced',
      color: 'bg-purple-500',
      available: true
    },
    {
      id: 'chord-progressions',
      title: 'Chord Progressions',
      description: 'Identify common chord progressions in context',
      difficulty: 'Expert',
      color: 'bg-red-500',
      available: true
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e]">
      <header className="bg-black/20 backdrop-blur-md border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/midi-training" className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
              <span className="text-white text-sm font-bold">←</span>
            </Link>
            <h1 className="text-xl font-bold text-white">
              MIDI Chord Recognition
            </h1>
          </div>
          <CompactAuthButton />
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Choose Your Challenge
          </h2>
          <p className="text-xl text-white/70 max-w-3xl mx-auto">
            Develop your chord recognition skills through progressive difficulty levels. 
            Start with basic triads and work your way up to complex jazz harmonies.
          </p>
        </div>

        {/* First row: Basic Triads, 7th Chords, Extended Chords */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-8">
          {difficultyLevels.slice(0, 3).map((level) => (
            <div key={level.id} className="relative">
              <Link
                to={level.available ? `/chord-recognition/${level.id}` : '#'}
                className={`block p-6 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                  level.available 
                    ? 'bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 cursor-pointer' 
                    : 'bg-white/5 backdrop-blur-sm border border-white/10 cursor-not-allowed opacity-60'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-full ${level.color} flex items-center justify-center`}>
                    <span className="text-white text-xl font-bold">♪</span>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      level.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
                      level.difficulty === 'Intermediate' ? 'bg-blue-100 text-blue-800' :
                      level.difficulty === 'Advanced' ? 'bg-purple-100 text-purple-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {level.difficulty}
                    </span>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-white mb-3">
                  {level.title}
                </h3>
                
                <p className="text-white/70 mb-4 text-sm">
                  {level.description}
                </p>
                
                {level.id !== 'basic-triads' && (
                  <div className="absolute top-4 right-4">
                    <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                      Preview
                    </span>
                  </div>
                )}
                
                {level.available && (
                  <div className="flex items-center text-white font-semibold text-sm">
                    Start Training
                    <span className="ml-2">→</span>
                  </div>
                )}
              </Link>
            </div>
          ))}
        </div>

        {/* Second row: Chord Progressions */}
        <div className="flex justify-center max-w-6xl mx-auto">
          <div className="w-full md:w-1/3">
            {difficultyLevels.slice(3).map((level) => (
              <div key={level.id} className="relative">
                <Link
                  to={level.available ? `/chord-recognition/${level.id}` : '#'}
                  className={`block p-6 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                    level.available 
                      ? 'bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 cursor-pointer' 
                      : 'bg-white/5 backdrop-blur-sm border border-white/10 cursor-not-allowed opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-full ${level.color} flex items-center justify-center`}>
                      <span className="text-white text-xl font-bold">♪</span>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        level.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
                        level.difficulty === 'Intermediate' ? 'bg-blue-100 text-blue-800' :
                        level.difficulty === 'Advanced' ? 'bg-purple-100 text-purple-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {level.difficulty}
                      </span>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-3">
                    {level.title}
                  </h3>
                  
                  <p className="text-white/70 mb-4 text-sm">
                    {level.description}
                  </p>
                  
                  {level.id !== 'basic-triads' && (
                    <div className="absolute top-4 right-4">
                      <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                        Preview
                      </span>
                    </div>
                  )}
                  
                  {level.available && (
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

        <div className="text-center mt-12">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold text-white mb-3">How it Works</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-white/80">
              <div className="text-center">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-white font-bold">1</span>
                </div>
                <p>Listen to or view the chord notes</p>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-white font-bold">2</span>
                </div>
                <p>Type the chord name</p>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-white font-bold">3</span>
                </div>
                <p>Get instant feedback</p>
              </div>
            </div>
          </div>
        </div>
      </main>

    </div>
  );
}