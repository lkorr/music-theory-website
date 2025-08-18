"use client";

import { Link } from "react-router";

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
      id: 'extended-chords',
      title: 'Extended Chords',
      description: '7th chords, 9th chords, and more complex harmonies',
      difficulty: 'Intermediate',
      color: 'bg-blue-500',
      available: true
    },
    {
      id: 'jazz-chords',
      title: 'Jazz Chords',
      description: 'Complex jazz harmonies and chord substitutions',
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
    <div className="min-h-screen bg-gradient-to-br from-[#F9D6E8] to-[#D8D6F9]">
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/midi-training" className="w-8 h-8 rounded-full bg-black flex items-center justify-center hover:bg-gray-800 transition-colors">
              <span className="text-white text-sm font-bold">←</span>
            </Link>
            <h1 className="text-xl font-bold text-black">
              MIDI Chord Recognition
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-black mb-4">
            Choose Your Challenge
          </h2>
          <p className="text-xl text-black/70 max-w-3xl mx-auto">
            Develop your chord recognition skills through progressive difficulty levels. 
            Start with basic triads and work your way up to complex jazz harmonies.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {difficultyLevels.map((level) => (
            <div key={level.id} className="relative">
              <Link
                to={level.available ? `/chord-recognition/${level.id}` : '#'}
                className={`block p-8 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
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
                
                <h3 className="text-2xl font-bold text-black mb-3">
                  {level.title}
                </h3>
                
                <p className="text-black/70 mb-4">
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
                  <div className="flex items-center text-black font-semibold">
                    Start Training
                    <span className="ml-2">→</span>
                  </div>
                )}
              </Link>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold text-black mb-3">How it Works</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-black/80">
              <div className="text-center">
                <div className="w-8 h-8 bg-black/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-black font-bold">1</span>
                </div>
                <p>Listen to or view the chord notes</p>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 bg-black/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-black font-bold">2</span>
                </div>
                <p>Type the chord name</p>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 bg-black/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-black font-bold">3</span>
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