/**
 * User Dashboard Page
 * 
 * SECURITY: This page is protected and requires authentication.
 * Users can view their profile, practice progress, and account settings.
 */

import { useState } from 'react';
import { Link } from 'react-router';
import ProtectedRoute, { useAuth } from '../../components/auth/ProtectedRoute';
import { logout } from '../../lib/auth.js';

interface TrainingArea {
  title: string;
  description: string;
  icon: string;
  link: string;
  levels: number;
}

function DashboardContent(): React.ReactNode {
  const { user } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async (): Promise<void> => {
    setIsLoggingOut(true);
    try {
      await logout();
      // Navigation will be handled by auth state change
    } catch (error) {
      console.error('Logout error:', error);
      setIsLoggingOut(false);
    }
  };

  const coreTrainingAreas: TrainingArea[] = [
    {
      title: 'Chord Recognition',
      description: 'Learn major, minor, diminished, and augmented triads',
      icon: '🎵',
      link: '/chord-recognition',
      levels: 7
    },
    {
      title: 'Chord Construction',
      description: 'Learn to build chords by placing notes on the piano roll',
      icon: '🎹',
      link: '/chord-construction',
      levels: 9
    },
    {
      title: 'Chord Progressions',
      description: 'Roman numeral analysis and harmonic progressions',
      icon: '🎼',
      link: '/chord-progressions',
      levels: 3
    },
    {
      title: 'Counterpoint',
      description: 'Species counterpoint and voice leading',
      icon: '🎶',
      link: '/counterpoint',
      levels: 5
    }
  ];

  const earTrainingAreas: TrainingArea[] = [
    {
      title: 'Chord Transcription',
      description: 'Develop ear training by transcribing chords from audio',
      icon: '🎧',
      link: '/transcription',
      levels: 16
    },
    {
      title: 'Chord Progression Transcription',
      description: 'Transcribe complete 4-chord progressions using piano roll',
      icon: '🎼',
      link: '/chord-progression-transcription',
      levels: 4
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e] relative">
      {/* Logo in absolute top-left corner */}
      <Link to="/" className="absolute top-2 left-2 z-50">
        <img src="/pailiaq-logo-small.png" alt="Logo" className="w-12 h-12" />
      </Link>
      
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 ml-16">
              <Link to="/" className="text-2xl font-bold text-white">
                🎹 MIDI Training
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-white/70 text-sm">
                Welcome, <span className="text-white font-medium">{user?.name || user?.email}</span>
              </div>
              
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-300 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoggingOut ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-300/30 border-t-red-300 mr-2"></div>
                    Signing out...
                  </div>
                ) : (
                  'Sign Out'
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Your Music Training Dashboard
          </h1>
          <p className="text-white/70 text-lg">
            Continue your journey in music theory and ear training
          </p>
        </div>

        {/* Training Areas */}
        <div className="mb-12">
          <div className="space-y-8">
            {/* Core Training Areas */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Core Training</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {coreTrainingAreas.map((area, index) => (
                  <Link
                    key={index}
                    to={area.link}
                    className="group block"
                  >
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 transition-all duration-300 transform group-hover:scale-105 group-hover:bg-white/20">
                      <div className="flex items-start justify-between mb-4">
                        <div className="text-4xl">{area.icon}</div>
                        <div className="text-white/60 text-sm">
                          {area.levels} levels
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-bold text-white mb-2">
                        {area.title}
                      </h3>
                      
                      <p className="text-white/70 text-sm mb-4">
                        {area.description}
                      </p>
                      
                      <div className="flex items-center text-blue-400 font-medium">
                        Start Training
                        <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Ear Training Areas */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Ear Training</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {earTrainingAreas.map((area, index) => (
                  <Link
                    key={index}
                    to={area.link}
                    className="group block"
                  >
                    <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 border border-purple-500/30 backdrop-blur-md rounded-2xl p-6 transition-all duration-300 transform group-hover:scale-105 group-hover:bg-purple-500/20">
                      <div className="flex items-start justify-between mb-4">
                        <div className="text-4xl">{area.icon}</div>
                        <div className="text-purple-200/80 text-sm">
                          {area.levels} levels
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-bold text-white mb-2">
                        {area.title}
                      </h3>
                      
                      <p className="text-white/70 text-sm mb-4">
                        {area.description}
                      </p>
                      
                      <div className="flex items-center text-purple-300 font-medium">
                        Start Training
                        <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Quick Start</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/chord-recognition/basic-triads/recognition/level1"
              className="bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg p-4 text-center transition-colors group"
            >
              <div className="text-2xl mb-2">🎵</div>
              <h3 className="text-white font-medium mb-1">Beginner Practice</h3>
              <p className="text-white/60 text-sm">Start with basic triads</p>
            </Link>
            
            <Link
              to="/counterpoint"
              className="bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 rounded-lg p-4 text-center transition-colors group"
            >
              <div className="text-2xl mb-2">🎹</div>
              <h3 className="text-white font-medium mb-1">Composition</h3>
              <p className="text-white/60 text-sm">Try counterpoint exercises</p>
            </Link>
            
            <Link
              to="/midi-training"
              className="bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 rounded-lg p-4 text-center transition-colors group"
            >
              <div className="text-2xl mb-2">🎛️</div>
              <h3 className="text-white font-medium mb-1">MIDI Training</h3>
              <p className="text-white/60 text-sm">General exercises</p>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function DashboardPage(): React.ReactNode {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}