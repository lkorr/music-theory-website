"use client";

import { Link } from "react-router";

interface ProgressionLevel {
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
  levels: ProgressionLevel[];
}

/**
 * Chord Progression Transcription Hub Page
 * 
 * Combines the transcription training approach with chord progression analysis.
 * Users listen to 4-chord progressions and transcribe them using the piano roll interface.
 */
export default function ChordProgressionTranscriptionHub(): JSX.Element {
  const progressionCategories: ProgressionCategory[] = [
    {
      id: 'basic-progressions',
      title: 'Basic Progressions',
      description: 'Transcribe common 4-chord progressions in major and minor keys',
      difficulty: 'Beginner',
      color: 'bg-green-500',
      available: true,
      levels: [
        {
          id: 'level1',
          title: 'Level 1: Basic 4-Chord Progressions',
          description: 'Listen to and transcribe common progressions like I-V-vi-IV using piano roll',
          path: '/chord-progression-transcription/level1'
        }
      ]
    },
    {
      id: 'progressions-with-inversions',
      title: 'Progressions with Inversions',
      description: 'Transcribe chord progressions including first and second inversions',
      difficulty: 'Intermediate',
      color: 'bg-yellow-500',
      available: true,
      levels: [
        {
          id: 'level2',
          title: 'Level 2: Progressions with Inversions',
          description: 'Transcribe progressions with inverted chords for smooth voice leading',
          path: '/chord-progression-transcription/level2'
        }
      ]
    },
    {
      id: 'non-diatonic-progressions',
      title: 'Non-Diatonic Progressions',
      description: 'Advanced progressions with borrowed chords and modal interchange',
      difficulty: 'Advanced',
      color: 'bg-purple-500',
      available: true,
      levels: [
        {
          id: 'level3',
          title: 'Level 3: Non-Diatonic Progressions',
          description: 'Transcribe progressions with borrowed chords and chromatic harmony',
          path: '/chord-progression-transcription/level3'
        }
      ]
    },
    {
      id: 'complex-progressions',
      title: 'Complex Progressions',
      description: 'Expert-level progressions with advanced harmonic techniques',
      difficulty: 'Expert',
      color: 'bg-indigo-500',
      available: true,
      levels: [
        {
          id: 'level4',
          title: 'Level 4: Complex Harmonic Progressions',
          description: 'Master transcription of sophisticated chord progressions with multiple techniques',
          path: '/chord-progression-transcription/level4'
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
            <Link to="/dashboard" className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
              <span className="text-white text-sm font-bold">←</span>
            </Link>
            <h1 className="text-xl font-bold text-white">
              Chord Progression Transcription
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">🎼</div>
          <h2 className="text-4xl font-bold text-white mb-4">
            Progression Transcription Training
          </h2>
          <p className="text-xl text-white/80 mb-6 max-w-3xl mx-auto">
            Develop advanced ear training by listening to complete chord progressions and 
            transcribing them note-by-note using the piano roll. Perfect for understanding 
            harmonic movement and voice leading in musical contexts.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <div className="px-4 py-2 bg-blue-500/20 backdrop-blur-md rounded-full text-blue-200 text-sm border border-blue-500/30">
              🎵 4-Chord Progressions
            </div>
            <div className="px-4 py-2 bg-green-500/20 backdrop-blur-md rounded-full text-green-200 text-sm border border-green-500/30">
              🎹 Piano Roll Transcription
            </div>
            <div className="px-4 py-2 bg-purple-500/20 backdrop-blur-md rounded-full text-purple-200 text-sm border border-purple-500/30">
              🎧 Advanced Ear Training
            </div>
            <div className="px-4 py-2 bg-orange-500/20 backdrop-blur-md rounded-full text-orange-200 text-sm border border-orange-500/30">
              📈 Harmonic Analysis
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8 max-w-4xl mx-auto">
          <h3 className="text-xl font-semibold text-white mb-4 text-center">How Progression Transcription Works</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-3">🎵</div>
              <h4 className="font-semibold text-white mb-2">1. Listen</h4>
              <p className="text-white/70 text-sm">Play the 4-chord progression to hear the complete harmonic sequence</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">🎹</div>
              <h4 className="font-semibold text-white mb-2">2. Transcribe</h4>
              <p className="text-white/70 text-sm">Place all notes for each chord on the piano roll across 4 beats</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">✅</div>
              <h4 className="font-semibold text-white mb-2">3. Validate</h4>
              <p className="text-white/70 text-sm">Check your transcription against the actual progression</p>
            </div>
          </div>
        </div>

        {/* Categories Grid */}
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
                  Start Transcribing
                  <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Advanced Tips */}
        <div className="bg-gradient-to-br from-yellow-600/20 to-yellow-800/20 border border-yellow-500/30 backdrop-blur-sm rounded-2xl p-6 max-w-4xl mx-auto">
          <h3 className="text-xl font-semibold text-yellow-200 mb-4 flex items-center">
            <span className="text-2xl mr-2">💡</span>
            Pro Tips for Progression Transcription
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-yellow-100/90">
            <div>
              <h4 className="font-semibold mb-2">🎧 Listening Strategy</h4>
              <ul className="text-sm space-y-1 text-yellow-100/80">
                <li>• Focus on bass line movement first</li>
                <li>• Identify chord changes and timing</li>
                <li>• Listen for voice leading between chords</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">🎹 Transcription Tips</h4>
              <ul className="text-sm space-y-1 text-yellow-100/80">
                <li>• Start with root notes of each chord</li>
                <li>• Add chord tones systematically</li>
                <li>• Use replay button liberally</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex justify-center mt-8 space-x-4">
          <Link
            to="/dashboard"
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-xl transition-colors"
          >
            ← Back to Dashboard
          </Link>
          <Link
            to="/transcription"
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors"
          >
            Single Chord Transcription →
          </Link>
        </div>
      </main>
    </div>
  );
}