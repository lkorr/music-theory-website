"use client";

import { Link } from "react-router";

export default function BasicTriadsLevelsPage() {
  const levels = [
    {
      id: 'level1',
      title: 'Level 1: Basic Triads',
      description: 'Major, Minor, Diminished, and Augmented triads in root position',
      difficulty: 'Beginner',
      color: 'bg-green-500',
      available: true
    },
    {
      id: 'level2', 
      title: 'Level 2: First Inversions',
      description: 'Basic triads in root position and 1st inversion only',
      difficulty: 'Intermediate',
      color: 'bg-blue-500',
      available: true
    },
    {
      id: 'level3',
      title: 'Level 3: All Inversions',
      description: 'Root position, 1st inversion, and 2nd inversion (no augmented inversions)',
      difficulty: 'Advanced',
      color: 'bg-purple-500',
      available: true
    },
    {
      id: 'level4',
      title: 'Level 4: 7th Chords',
      description: 'Major7, Minor7, Dominant7, Diminished7, and Half-Diminished7 chords in root position',
      difficulty: 'Advanced',
      color: 'bg-orange-500',
      available: true
    },
    {
      id: 'level5',
      title: 'Level 5: 7th Chords with Inversions',
      description: 'All 7th chords including 1st, 2nd, and 3rd inversions',
      difficulty: 'Expert',
      color: 'bg-red-500',
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
              Chord Recognition Trainer
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
            Choose Your Level
          </h2>
          <p className="text-lg text-black/70 max-w-2xl mx-auto">
            Progress through increasing difficulty levels to master chord recognition.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {levels.map((level) => (
            <div key={level.id} className="relative">
              <Link
                to={level.available ? `/chord-recognition/basic-triads/${level.id}` : '#'}
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
                      'bg-red-100 text-red-800'
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
      </main>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Urbanist:wght@400;500;600;700;800@display=swap');
        * { font-family: 'Urbanist', sans-serif; }
        html { scroll-behavior: smooth; }
      `}</style>
    </div>
  );
}