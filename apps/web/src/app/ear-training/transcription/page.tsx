"use client";

import { Link } from "react-router";

// Type definitions for transcription system
interface TranscriptionLevel {
  id: string;
  title: string;
  description: string;
  path: string;
  available?: boolean;
}

interface TranscriptionCategory {
  id: string;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  color: string;
  available: boolean;
  levels: TranscriptionLevel[];
}

/**
 * Transcription Hub Page
 * 
 * Structured identically to chord-recognition page for consistency.
 * Each level corresponds directly to the chord recognition levels but for transcription.
 */
export default function TranscriptionHub() {
  const transcriptionCategories: TranscriptionCategory[] = [
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
          title: 'Level 1: Root Position Triads',
          description: 'Transcribe major and minor triads in root position',
          path: '/ear-training/transcription/basic-triads/1'
        },
        {
          id: 'level2',
          title: 'Level 2: First Inversions',
          description: 'Transcribe triads with first inversion',
          path: '/ear-training/transcription/basic-triads/2'
        },
        {
          id: 'level3',
          title: 'Level 3: All Inversions',
          description: 'Transcribe root, first, and second inversions',
          path: '/ear-training/transcription/basic-triads/3'
        },
        {
          id: 'level4',
          title: 'Level 4: Triads + Sus Chords',
          description: 'All triads, sus chords, and quartal harmony with inversions',
          path: '/ear-training/transcription/basic-triads/4'
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
          path: '/ear-training/transcription/seventh-chords/1'
        },
        {
          id: 'level2',
          title: 'Level 2: First Inversions',
          description: '7th chords with first inversion',
          path: '/ear-training/transcription/seventh-chords/2'
        },
        {
          id: 'level3',
          title: 'Level 3: First and Second Inversions',
          description: '7th chords with first and second inversions',
          path: '/ear-training/transcription/seventh-chords/3'
        },
        {
          id: 'level4',
          title: 'Level 4: All Inversions',
          description: '7th chords with all inversions',
          path: '/ear-training/transcription/seventh-chords/4'
        },
        {
          id: 'level5',
          title: 'Level 5: Mixed Triads and 7th Chords',
          description: 'Both triads and 7th chords with all inversions',
          path: '/ear-training/transcription/seventh-chords/5'
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
          path: '/ear-training/transcription/extended-chords/1'
        },
        {
          id: 'level2',
          title: 'Level 2: 11th Chords',
          description: 'Major 11th, minor 11th variations',
          path: '/ear-training/transcription/extended-chords/2'
        },
        {
          id: 'level3',
          title: 'Level 3: 13th Chords',
          description: 'Major 13th, minor 13th variations',
          path: '/ear-training/transcription/extended-chords/3'
        },
        {
          id: 'level4',
          title: 'Level 4: 9th Chord Inversions',
          description: '9th chords with all inversions',
          path: '/ear-training/transcription/extended-chords/4'
        },
        {
          id: 'level5',
          title: 'Level 5: 11th Chord Inversions',
          description: '11th chords with all inversions',
          path: '/ear-training/transcription/extended-chords/5'
        },
        {
          id: 'level6',
          title: 'Level 6: 13th Chord Inversions',
          description: '13th chords with all inversions',
          path: '/ear-training/transcription/extended-chords/6'
        },
        {
          id: 'level7',
          title: 'Level 7: All Chord Types',
          description: 'Master level: All triads, sus, 7th, and extended chords',
          path: '/ear-training/transcription/extended-chords/7'
        }
      ]
    }
  ];

  const getDifficultyColor = (difficulty: TranscriptionCategory['difficulty']): string => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-green-100 text-green-800';
      case 'Intermediate':
        return 'bg-blue-100 text-blue-800';
      case 'Advanced':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-red-100 text-red-800';
    }
  };

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
              Chord Transcription Training
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">🎧</div>
          <h2 className="text-4xl font-bold text-white mb-4">
            Transcription & Ear Training
          </h2>
          <p className="text-xl text-white/80 mb-6 max-w-3xl mx-auto">
            Develop your musical ear by transcribing chords from audio. 
            Listen to chord progressions and reconstruct them on the piano roll.
            Perfect for musicians wanting to improve their ear training skills.
          </p>
          
          {/* Quick Navigation */}
          <div className="flex justify-center space-x-4 mb-6">
            <Link
              to="/leaderboard?module=transcription"
              className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
            >
              🏆 View Transcription Leaderboard
            </Link>
          </div>
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <div className="px-4 py-2 bg-blue-500/20 backdrop-blur-md rounded-full text-blue-200 text-sm border border-blue-500/30">
              🎵 Audio-Based Learning
            </div>
            <div className="px-4 py-2 bg-green-500/20 backdrop-blur-md rounded-full text-green-200 text-sm border border-green-500/30">
              🎹 Interactive Piano Roll
            </div>
            <div className="px-4 py-2 bg-purple-500/20 backdrop-blur-md rounded-full text-purple-200 text-sm border border-purple-500/30">
              🎧 Real-Time Feedback
            </div>
            <div className="px-4 py-2 bg-orange-500/20 backdrop-blur-md rounded-full text-orange-200 text-sm border border-orange-500/30">
              📈 Progressive Difficulty
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8 max-w-4xl mx-auto">
          <h3 className="text-xl font-semibold text-white mb-4 text-center">How It Works</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-3">🎵</div>
              <h4 className="font-semibold text-white mb-2">1. Listen</h4>
              <p className="text-white/70 text-sm">Click the "Play Chord" button to hear the chord you need to transcribe</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">🎹</div>
              <h4 className="font-semibold text-white mb-2">2. Construct</h4>
              <p className="text-white/70 text-sm">Place the notes you hear on the interactive piano roll by clicking</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">✅</div>
              <h4 className="font-semibold text-white mb-2">3. Check</h4>
              <p className="text-white/70 text-sm">Submit your answer to get instant feedback and see the correct notes</p>
            </div>
          </div>
        </div>

        <div className="space-y-12">
          {transcriptionCategories.map((category) => (
            <div key={category.id} className="relative">
              {/* Category Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-full ${category.color} flex items-center justify-center`}>
                    <span className="text-white text-xl font-bold">🎧</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">{category.title}</h3>
                    <p className="text-white/70">{category.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(category.difficulty)}`}>
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

        {/* Additional Tips */}
        <div className="mt-12 bg-gradient-to-br from-yellow-600/20 to-yellow-800/20 border border-yellow-500/30 backdrop-blur-sm rounded-2xl p-6 max-w-4xl mx-auto">
          <h3 className="text-xl font-semibold text-yellow-200 mb-4 flex items-center">
            <span className="text-2xl mr-2">💡</span>
            Pro Tips for Transcription Training
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-yellow-100/90">
            <div>
              <h4 className="font-semibold mb-2">🎧 Audio Setup</h4>
              <ul className="text-sm space-y-1 text-yellow-100/80">
                <li>• Use headphones for better audio clarity</li>
                <li>• Adjust volume to comfortable level</li>
                <li>• Replay chords as many times as needed</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">🎹 Transcription Strategy</h4>
              <ul className="text-sm space-y-1 text-yellow-100/80">
                <li>• Start with the bass note (lowest pitch)</li>
                <li>• Listen for chord quality (major/minor)</li>
                <li>• Practice interval recognition</li>
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
            to="/ear-training/chord-progression-transcription"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
          >
            Try Chord Progressions →
          </Link>
        </div>
      </main>
    </div>
  );
}