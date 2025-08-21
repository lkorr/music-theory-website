"use client";

import { Link } from "react-router";
import { CompactAuthButton } from "../../../components/auth/AuthButton.jsx";

export default function ChordProgressionsPage() {
  const levels = [
    {
      id: 1,
      title: 'Basic Progressions',
      description: 'Identify common 4-chord progressions in major and minor keys using roman numerals.',
      icon: '🎵',
      color: 'bg-gradient-to-br from-purple-500 to-pink-600',
      path: '/chord-recognition/chord-progressions/level1',
      difficulty: 'Beginner',
      features: ['Major & Minor Keys', '4-Chord Sequences', 'Roman Numerals', 'Common Progressions']
    },
    {
      id: 2,
      title: 'Progressions with Inversions',
      description: 'Identify chord progressions with first and second inversions, including slash chord notation.',
      icon: '🎶',
      color: 'bg-gradient-to-br from-blue-500 to-purple-600',
      path: '/chord-recognition/chord-progressions/level2',
      difficulty: 'Intermediate',
      features: ['First Inversions', 'Second Inversions', 'Slash Chord Notation', 'Bass Line Analysis']
    },
    {
      id: 3,
      title: 'Non-Diatonic & Modal Chords',
      description: 'Identify progressions with borrowed chords, augmented chords, and non-diatonic harmonies.',
      icon: '🎭',
      color: 'bg-gradient-to-br from-orange-500 to-red-600',
      path: '/chord-recognition/chord-progressions/level3',
      difficulty: 'Advanced',
      features: ['Borrowed Chords', 'Augmented Chords', 'Neapolitan Chords', 'Modal Interchange']
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e] p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header with Back Button and Auth */}
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/chord-recognition"
            className="inline-flex items-center px-4 py-2 bg-white/20 text-white hover:bg-white/30 transition-colors rounded-lg font-medium"
          >
            ← Back to Chord Recognition
          </Link>
          <CompactAuthButton />
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-24 h-24 rounded-full bg-purple-500 flex items-center justify-center mx-auto mb-8">
            <span className="text-4xl text-white">🎼</span>
          </div>
          
          <h1 className="text-5xl font-bold text-white mb-4">Chord Progressions</h1>
          <p className="text-xl text-white/70 max-w-3xl mx-auto">
            Master the art of identifying chord progressions using roman numeral analysis. 
            Learn to recognize common harmonic patterns in different keys.
          </p>
        </div>

        {/* Levels Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-8 max-w-4xl mx-auto mb-12">
          {levels.map((level) => (
            <Link
              key={level.id}
              to={level.path}
              className="block group"
            >
              <div className="bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-2xl p-8 transition-all duration-300 transform group-hover:scale-105 group-hover:bg-white/20">
                <div className="flex items-start justify-between mb-6">
                  <div className={`w-16 h-16 rounded-full ${level.color} flex items-center justify-center`}>
                    <span className="text-white text-2xl font-bold">{level.icon}</span>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-800">
                      {level.difficulty}
                    </span>
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-3">
                  Level {level.id}: {level.title}
                </h3>
                
                <p className="text-white/70 mb-6 leading-relaxed">
                  {level.description}
                </p>

                <div className="space-y-2 mb-6">
                  <h4 className="text-sm font-semibold text-white/80 mb-2">Features:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {level.features.map((feature, index) => (
                      <div key={index} className="flex items-center text-sm text-white/70">
                        <span className="w-1.5 h-1.5 bg-white/40 rounded-full mr-2"></span>
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center text-white font-semibold group-hover:text-white/80 transition-colors">
                  Start Level {level.id}
                  <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Coming Soon Section */}
        <div className="text-center">
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-semibold text-black mb-4">More Levels Coming Soon</h3>
            <p className="text-black/70 leading-relaxed mb-6">
              Future levels will include secondary dominants, modulations, jazz harmony, 
              and even more complex harmonic analysis.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-black/80">
              <div className="text-center">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold">4</span>
                </div>
                <p className="font-medium">Secondary Dominants</p>
                <p className="text-xs mt-1">V/V, V/vi progressions</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold">5</span>
                </div>
                <p className="font-medium">Jazz Progressions</p>
                <p className="text-xs mt-1">ii-V-I, circle of fifths</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold">6</span>
                </div>
                <p className="font-medium">Modulations</p>
                <p className="text-xs mt-1">Key changes and pivots</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}