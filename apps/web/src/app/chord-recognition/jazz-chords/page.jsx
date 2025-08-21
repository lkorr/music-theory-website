"use client";

import { Link } from "react-router";
import { CompactAuthButton } from "../../../components/auth/AuthButton.jsx";

export default function JazzChordsPage() {
  const recognitionLevels = [
    {
      id: 'level1',
      title: 'Level 1: 9th Chords',
      description: 'Major 9th, Minor 9th, Dominant 9th, and altered 9ths (root position)',
      difficulty: 'Advanced',
      color: 'bg-purple-500',
      available: true
    },
    {
      id: 'level2',
      title: 'Level 2: 9th Chord Inversions',
      description: 'All inversions of 9th chords (root, 1st, 2nd, 3rd, 4th)',
      difficulty: 'Expert',
      color: 'bg-purple-600',
      available: true
    },
    {
      id: 'level3',
      title: 'Level 3: 11th Chords',
      description: '11th chords with natural and sharp 11 (root position)',
      difficulty: 'Expert',
      color: 'bg-indigo-500',
      available: true
    },
    {
      id: 'level4',
      title: 'Level 4: 13th Chords',
      description: '13th chords with alterations and add chords (root position)',
      difficulty: 'Expert',
      color: 'bg-pink-500',
      available: true
    }
  ];

  const constructionLevels = [
    {
      id: 'level1',
      title: 'Level 1: Build 9th Chords',
      description: 'Construct Major 9th, Minor 9th, Dominant 9th, Dom7♭9, and Add9',
      difficulty: 'Advanced',
      color: 'bg-purple-500',
      available: true
    },
    {
      id: 'level2',
      title: 'Level 2: Build 11th Chords',
      description: 'Construct Major 11th, Minor 11th, Dom 11th, Maj7♯11, and Dom7♯11',
      difficulty: 'Expert',
      color: 'bg-indigo-500',
      available: true
    },
    {
      id: 'level3',
      title: 'Level 3: Build 13th Chords',
      description: 'Construct Major 13th, Minor 13th, Dom 13th, Dom13♭9, and Add13',
      difficulty: 'Expert',
      color: 'bg-pink-500',
      available: true
    },
    {
      id: 'level4',
      title: 'Level 4: All Extended + Inversions',
      description: 'Master challenge: all extended chords in root position and inversions',
      difficulty: 'Master',
      color: 'bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500',
      available: true
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e]">
      <header className="bg-black/20 backdrop-blur-md border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/chord-recognition" className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
              <span className="text-white text-sm font-bold">←</span>
            </Link>
            <h1 className="text-xl font-bold text-white">
              Extended Chords Training
            </h1>
          </div>
          <CompactAuthButton />
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Extended Chords Training
          </h2>
          <p className="text-xl text-white/70 max-w-3xl mx-auto">
            Master 9th, 11th, and 13th chords with various alterations. 
            These extended harmonies are essential for jazz, fusion, and modern music.
          </p>
        </div>

        {/* Chord Recognition Section */}
        <div className="mb-12">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-white mb-2">Extended Chord Recognition</h3>
            <p className="text-white/70">Listen to extended chords and identify what you hear</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {recognitionLevels.map((level) => (
              <div key={level.id} className="relative">
                <Link
                  to={level.available ? `/chord-recognition/jazz-chords/recognition/${level.id}` : '#'}
                  className={`block p-6 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                    level.available 
                      ? 'bg-white/10 backdrop-blur-sm border-2 border-white/20 hover:bg-white/20 cursor-pointer' 
                      : 'bg-white/5 backdrop-blur-sm border-2 border-white/10 cursor-not-allowed opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-full ${level.color} flex items-center justify-center`}>
                      <span className="text-white text-xl font-bold">♪</span>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        level.difficulty === 'Advanced' ? 'bg-purple-100 text-purple-800' :
                        level.difficulty === 'Expert' ? 'bg-red-100 text-red-800' :
                        'bg-gray-800 text-yellow-400'
                      }`}>
                        {level.difficulty}
                      </span>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-3">
                    {level.title}
                  </h3>
                  
                  <p className="text-white/70 text-sm mb-4">
                    {level.description}
                  </p>
                  
                  {level.available && (
                    <div className="flex items-center text-white font-semibold text-sm">
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
            <h3 className="text-2xl font-bold text-white mb-2">Extended Chord Construction</h3>
            <p className="text-white/70">Build extended chords by placing notes on the piano roll</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {constructionLevels.map((level) => (
              <div key={level.id} className="relative">
                <Link
                  to={level.available ? `/chord-recognition/jazz-chords/construction/${level.id}` : '#'}
                  className={`block p-6 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                    level.available 
                      ? 'bg-white/10 backdrop-blur-sm border-2 border-white/20 hover:bg-white/20 cursor-pointer' 
                      : 'bg-white/5 backdrop-blur-sm border-2 border-white/10 cursor-not-allowed opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center`}
                         style={level.id === 'level4' ? {background: 'linear-gradient(to right, rgb(168 85 247), rgb(99 102 241), rgb(236 72 153))'} : {}}>
                      {level.id !== 'level4' && <div className={`w-12 h-12 rounded-full ${level.color} flex items-center justify-center`}>
                        <span className="text-white text-xl font-bold">🎹</span>
                      </div>}
                      {level.id === 'level4' && <span className="text-white text-xl font-bold">🎹</span>}
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        level.difficulty === 'Advanced' ? 'bg-purple-100 text-purple-800' :
                        level.difficulty === 'Expert' ? 'bg-red-100 text-red-800' :
                        'bg-gray-800 text-yellow-400'
                      }`}>
                        {level.difficulty}
                      </span>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-3">
                    {level.title}
                  </h3>
                  
                  <p className="text-white/70 text-sm mb-4">
                    {level.description}
                  </p>
                  
                  {level.available && (
                    <div className="flex items-center text-white font-semibold text-sm">
                      Start Level
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
            <h3 className="text-xl font-semibold text-white mb-3">About Extended Chords</h3>
            <div className="text-sm text-white/80 space-y-2 text-left">
              <p>• <strong>9th Chords:</strong> Add color and tension with the 9th interval (major or minor 2nd an octave up)</p>
              <p>• <strong>11th Chords:</strong> Include the perfect or augmented 4th an octave up for suspended qualities</p>
              <p>• <strong>13th Chords:</strong> The ultimate extensions with the 6th interval an octave up</p>
              <p>• <strong>Alterations:</strong> Learn flat and sharp variations (♭9, ♯9, ♯11, ♭13) for jazz voicings</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}