"use client";

import { Link } from "react-router";

export default function ExtendedChordsPage() {
  const levels = [
    {
      id: 'level1',
      title: 'Level 1: 7th Chords',
      description: 'Identify 7th chords in root position only',
      difficulty: 'Advanced',
      color: 'bg-green-500',
      available: true
    },
    {
      id: 'level2',
      title: 'Level 2: 7th Chords with First Inversions',
      description: 'Root position and first inversions',
      difficulty: 'Advanced',
      color: 'bg-blue-500',
      available: true
    },
    {
      id: 'level3',
      title: 'Level 3: 7th Chords with Second Inversions',
      description: 'Root, first, and second inversions',
      difficulty: 'Expert',
      color: 'bg-purple-500',
      available: true
    },
    {
      id: 'level4',
      title: 'Level 4: 7th Chords All Inversions',
      description: 'All inversions including third inversions',
      difficulty: 'Expert',
      color: 'bg-orange-500',
      available: true
    },
    {
      id: 'level5',
      title: 'Level 5: Open Voicing 7th Chords',
      description: 'Wide spacing across multiple octaves',
      difficulty: 'Master',
      color: 'bg-red-500',
      available: true
    }
  ];

  const constructionLevels = [
    {
      id: 'level6',
      title: 'Level 6: Build 7th Chords',
      description: 'Construct 7th chords in root position',
      difficulty: 'Advanced',
      color: 'bg-emerald-500',
      available: true
    },
    {
      id: 'level7',
      title: 'Level 7: Build First Inversions',
      description: 'Construct 7th chords in root position and 1st inversion',
      difficulty: 'Expert',
      color: 'bg-teal-500',
      available: true
    },
    {
      id: 'level8',
      title: 'Level 8: Build All Inversions',
      description: 'Construct 7th chords in all inversions',
      difficulty: 'Master',
      color: 'bg-cyan-500',
      available: true
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9D6E8] to-[#D8D6F9]">
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/chord-recognition" className="w-8 h-8 rounded-full bg-black flex items-center justify-center hover:bg-gray-800 transition-colors">
              <span className="text-white text-sm font-bold">←</span>
            </Link>
            <h1 className="text-xl font-bold text-black">
              Extended Chords
            </h1>
          </div>
          <Link to="/" className="w-8 h-8 rounded-full bg-black flex items-center justify-center hover:bg-gray-800 transition-colors">
            <span className="text-white text-sm font-bold">♪</span>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-black mb-4">
            Choose Your Training Mode
          </h2>
          <p className="text-lg text-black/70 max-w-2xl mx-auto">
            Master 7th chord recognition and construction through progressive difficulty levels.
          </p>
        </div>

        {/* Chord Recognition Section */}
        <div className="mb-12">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-black mb-2">7th Chord Recognition</h3>
            <p className="text-black/70">Listen to 7th chords and identify what you hear</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {levels.map((level) => (
              <div key={level.id} className="relative">
                <Link
                  to={level.available ? `/chord-recognition/extended-chords/recognition/${level.id}` : '#'}
                  className={`block p-6 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                    level.available 
                      ? 'bg-white/30 backdrop-blur-sm border-2 border-white/20 hover:shadow-xl cursor-pointer' 
                      : 'bg-white/10 backdrop-blur-sm border-2 border-white/10 cursor-not-allowed opacity-60'
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
                        level.difficulty === 'Expert' ? 'bg-red-100 text-red-800' :
                        'bg-gray-800 text-yellow-400'
                      }`}>
                        {level.difficulty}
                      </span>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-black mb-3">
                    {level.title}
                  </h3>
                  
                  <p className="text-black/70 mb-4">
                    {level.description}
                  </p>
                  
                  {level.available && (
                    <div className="flex items-center text-black font-semibold">
                      Start Level
                      <span className="ml-2">→</span>
                    </div>
                  )}
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Chord Construction Section */}
        <div className="mb-12">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-black mb-2">7th Chord Construction</h3>
            <p className="text-black/70">Build 7th chords by placing notes on the piano roll</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {constructionLevels.map((level) => (
              <div key={level.id} className="relative">
                <Link
                  to={level.available ? `/chord-recognition/extended-chords/construction/${level.id}` : '#'}
                  className={`block p-6 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                    level.available 
                      ? 'bg-white/30 backdrop-blur-sm border-2 border-white/20 hover:shadow-xl cursor-pointer' 
                      : 'bg-white/10 backdrop-blur-sm border-2 border-white/10 cursor-not-allowed opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-full ${level.color} flex items-center justify-center`}>
                      <span className="text-white text-xl font-bold">🎹</span>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        level.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
                        level.difficulty === 'Intermediate' ? 'bg-blue-100 text-blue-800' :
                        level.difficulty === 'Advanced' ? 'bg-purple-100 text-purple-800' :
                        level.difficulty === 'Expert' ? 'bg-red-100 text-red-800' :
                        'bg-gray-800 text-yellow-400'
                      }`}>
                        {level.difficulty}
                      </span>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-black mb-3">
                    {level.title}
                  </h3>
                  
                  <p className="text-black/70 mb-4">
                    {level.description}
                  </p>
                  
                  {level.available && (
                    <div className="flex items-center text-black font-semibold">
                      Start Level
                      <span className="ml-2">→</span>
                    </div>
                  )}
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 text-center">
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
            <h3 className="text-xl font-bold text-black mb-4">Prerequisites</h3>
            <p className="text-black/70 mb-4">
              Before starting extended chords, make sure you've completed the Basic Triads training.
            </p>
            <Link
              to="/chord-recognition/basic-triads"
              className="inline-block px-6 py-3 bg-white text-black font-semibold rounded-xl hover:bg-gray-100 transition-colors border-2 border-black/10"
            >
              Review Basic Triads
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}