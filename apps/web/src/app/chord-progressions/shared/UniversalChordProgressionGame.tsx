/**
 * Universal Chord Progression Game Component
 * 
 * This single component handles ALL chord progression levels through configuration.
 * Replaces the need for 4+ individual level components with one universal handler.
 * 
 * Features:
 * - Configuration-driven level behavior
 * - Identical functionality to original chord-progressions
 * - Clean architecture with separated concerns
 * - Full audio playback with volume control
 * - Auto-advance and smart feedback timing
 */

"use client";

import { Link } from "react-router";
import { useLevelState } from "./hooks/useLevelState";
import { useLevelLogic } from "./hooks/useLevelLogic";
import ProgressionDisplay from "./components/ProgressionDisplay";
import LeaderboardComponent from "./components/LeaderboardComponent";
import { CompactAuthButton } from "../../../components/auth/AuthButton";
import { useAuth } from "../../../components/auth/ProtectedRoute";
import type { LevelConfig } from "../data/levelConfigs";

interface UniversalChordProgressionGameProps {
  levelConfig: LevelConfig;
}

export default function UniversalChordProgressionGame({ 
  levelConfig 
}: UniversalChordProgressionGameProps): React.ReactNode {
  
  // State management
  const state = useLevelState(levelConfig);
  
  // Game logic
  const logic = useLevelLogic(state as any, levelConfig);
  
  // Auth state
  const authState = useAuth();
  const user = authState.user;
  
  // Start screen
  if (!state.hasStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e] relative">
        <Link to="/" className="absolute top-2 left-2 z-50">
          <img src="/pailiaq-logo-small.png" alt="Logo" className="w-12 h-12" />
        </Link>
        
        <header className="bg-black/20 backdrop-blur-md border-b border-white/10 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4 ml-16">
              <Link to={levelConfig.backPath} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                <span className="text-white text-sm font-bold">←</span>
              </Link>
              <h1 className="text-xl font-bold text-white">{levelConfig.title}</h1>
            </div>
            <CompactAuthButton />
          </div>
        </header>
        
        <main className="max-w-7xl mx-auto p-6">
          <div className="flex flex-col xl:flex-row gap-6 items-start justify-center min-h-[80vh]">
            {/* Main content */}
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-8 xl:w-1/3 w-full">
              <h2 className="text-3xl font-bold text-white mb-6">Ready to Start {levelConfig.title}?</h2>
              <div className="text-lg text-white/70 mb-8 space-y-2">
                <p><strong>{levelConfig.totalProblems} problems</strong> to complete</p>
                <p>{levelConfig.longDescription}</p>
                <p>Need <strong>{levelConfig.passAccuracy}% accuracy</strong> to pass</p>
                <p>Average time must be under <strong>{levelConfig.passTime} seconds</strong></p>
              </div>
              <button
                onClick={logic.startLevel}
                className={`px-12 py-4 ${levelConfig.buttonColor} text-white text-xl font-bold rounded-xl hover:${levelConfig.buttonHoverColor} transition-colors shadow-lg`}
              >
                Start {levelConfig.title}
              </button>
            </div>

            {/* Level-specific information */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 xl:w-1/3 w-full">
              <h3 className="text-2xl font-bold text-white mb-6 text-center">What You'll Practice</h3>
              <div className="space-y-4 text-white/80">
                
                {levelConfig.level === 1 && (
                  <>
                    <div className="bg-white/10 rounded-xl p-4">
                      <h4 className="font-bold text-white mb-2">I - V - vi - IV</h4>
                      <p className="text-sm">The most popular progression in Western music. Found in countless songs across all genres.</p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4">
                      <h4 className="font-bold text-white mb-2">vi - IV - I - V</h4>
                      <p className="text-sm">A variation starting on the relative minor. Creates a melancholy-to-uplifting feeling.</p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4">
                      <h4 className="font-bold text-white mb-2">Basic Keys</h4>
                      <p className="text-sm">Practice in <strong>C major</strong> and <strong>A minor</strong> to build foundational skills.</p>
                    </div>
                  </>
                )}

                {levelConfig.level === 2 && (
                  <>
                    <div className="bg-white/10 rounded-xl p-4">
                      <h4 className="font-bold text-white mb-2">First Inversions</h4>
                      <p className="text-sm">Learn to identify chords like <strong>V6</strong> and <strong>IV6</strong> with inverted bass notes.</p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4">
                      <h4 className="font-bold text-white mb-2">Slash Chord Notation</h4>
                      <p className="text-sm">Practice both Roman numeral and slash chord notation like <strong>C/E</strong>.</p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4">
                      <h4 className="font-bold text-white mb-2">More Keys</h4>
                      <p className="text-sm">Expand to <strong>G, Em, F, and Dm</strong> for greater musical variety.</p>
                    </div>
                  </>
                )}

                {levelConfig.level === 3 && (
                  <>
                    <div className="bg-white/10 rounded-xl p-4">
                      <h4 className="font-bold text-white mb-2">Borrowed Chords</h4>
                      <p className="text-sm">Explore <strong>bVII</strong> and <strong>bVI</strong> chords borrowed from parallel minor modes.</p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4">
                      <h4 className="font-bold text-white mb-2">Neapolitan Sixth</h4>
                      <p className="text-sm">Master the distinctive sound of the <strong>bII</strong> chord in classical harmony.</p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4">
                      <h4 className="font-bold text-white mb-2">Chromatic Movement</h4>
                      <p className="text-sm">Learn progressions with smooth chromatic bass lines and voice leading.</p>
                    </div>
                  </>
                )}

                {levelConfig.level === 4 && (
                  <>
                    <div className="bg-white/10 rounded-xl p-4">
                      <h4 className="font-bold text-white mb-2">Advanced Harmony</h4>
                      <p className="text-sm">Combine borrowed chords with inversions for complex harmonic analysis.</p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4">
                      <h4 className="font-bold text-white mb-2">Multiple Inversions</h4>
                      <p className="text-sm">Analyze progressions with <strong>bVII6</strong>, <strong>bVI6</strong>, and other inverted non-diatonic chords.</p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4">
                      <h4 className="font-bold text-white mb-2">Expert Challenge</h4>
                      <p className="text-sm">The ultimate test of harmonic analysis skills with sophisticated classical and contemporary progressions.</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Leaderboard */}
            {user && (
              <div className="xl:w-1/3 w-full">
                <LeaderboardComponent
                  moduleType="chord-progressions"
                  category={levelConfig.category}
                  level={levelConfig.level.toString()}
                  limit={5}
                  showUserStats={true}
                  compact={true}
                />
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  // Completion screen
  if (state.isCompleted && state.levelResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e] flex items-center justify-center p-6">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-md w-full text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Level {state.levelResult.passed ? 'Completed!' : 'Failed'}
          </h2>
          
          <div className="space-y-4 mb-8">
            <div className="flex justify-between">
              <span className="text-white/70">Accuracy:</span>
              <span className={`font-bold ${state.levelResult.accuracy >= levelConfig.passAccuracy ? 'text-green-400' : 'text-red-400'}`}>
                {state.levelResult.accuracy.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Average Time:</span>
              <span className={`font-bold ${state.levelResult.avgTime <= levelConfig.passTime ? 'text-green-400' : 'text-red-400'}`}>
                {state.levelResult.avgTime.toFixed(1)}s
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Score:</span>
              <span className="font-bold text-white">
                {state.levelResult.score.correct}/{state.levelResult.score.total}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {state.levelResult.passed && levelConfig.nextLevelPath && (
              <Link 
                to={levelConfig.nextLevelPath}
                className={`block px-6 py-3 ${levelConfig.buttonColor} text-white font-semibold rounded-xl hover:${levelConfig.buttonHoverColor} transition-colors`}
              >
                Next Level
              </Link>
            )}
            
            <button
              onClick={logic.startLevel}
              className="block w-full px-6 py-3 bg-gray-600 text-white font-semibold rounded-xl hover:bg-gray-700 transition-colors"
            >
              Retry Level
            </button>
            
            <Link
              to={levelConfig.backPath}
              className="block px-6 py-3 bg-white/20 text-white font-semibold rounded-xl hover:bg-white/30 transition-colors"
            >
              Back to Hub
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Main game screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e] relative">
      <Link to="/" className="absolute top-2 left-2 z-50">
        <img src="/pailiaq-logo-small.png" alt="Logo" className="w-12 h-12" />
      </Link>
      
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-md border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4 ml-16">
            <Link to="/chord-progressions" className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
              <span className="text-white text-sm font-bold">←</span>
            </Link>
            <h1 className="text-xl font-bold text-white">
              {levelConfig.title} - Problem {state.score.total + 1}/{levelConfig.totalProblems}
            </h1>
          </div>
          <div className="flex items-center space-x-6">
            <div className="text-white font-semibold">
              Score: {state.score.correct}/{state.score.total}
            </div>
            <div className="text-white font-semibold">
              Time: {state.currentTime.toFixed(0)}s
            </div>
            <CompactAuthButton />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="w-full bg-white/10 rounded-full h-3">
            <div 
              className="bg-blue-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${(state.score.total / levelConfig.totalProblems) * 100}%` }}
            />
          </div>
        </div>
        
        <div className="flex flex-col xl:flex-row gap-8 items-start">
          {/* Main content */}
          <div className="flex-1">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6 text-center">
                Identify this chord progression
              </h2>
              
              {/* Piano Roll Display */}
              <ProgressionDisplay
                progression={state.currentProgression}
                feedback={state.feedback}
                isPlaying={state.isPlaying}
                volume={state.volume}
                progressionNumber={state.currentProblemIndex + 1}
                totalProblems={levelConfig.totalProblems}
                onPlay={logic.playProgression}
                onVolumeChange={logic.handleVolumeChange}
                theme={levelConfig.theme}
              />
              
              {/* Input area */}
              <div className="space-y-4">
                <input
                  ref={state.inputRef}
                  type="text"
                  value={state.userAnswer}
                  onChange={logic.handleInputChange}
                  onKeyPress={logic.handleKeyPress}
                  placeholder="Enter roman numerals (e.g., I - V - vi - IV)"
                  className="w-full px-4 py-3 text-lg rounded-lg border-2 border-white/30 focus:border-blue-400 focus:outline-none bg-white/10 text-white placeholder-white/50"
                  readOnly={state.feedback?.show || false}
                />
                
                <button
                  onClick={state.feedback && state.feedback.show && !state.feedback.isCorrect ? logic.nextProgression : logic.submitAnswer}
                  disabled={!logic.canSubmit && !(state.feedback && state.feedback.show && !state.feedback.isCorrect)}
                  className={`w-full py-3 px-6 font-semibold rounded-lg transition-colors ${
                    (logic.canSubmit || (state.feedback && state.feedback.show && !state.feedback.isCorrect))
                      ? `${levelConfig.buttonColor} text-white hover:${levelConfig.buttonHoverColor}`
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {state.feedback && state.feedback.show && !state.feedback.isCorrect 
                    ? 'Press Enter to Continue' 
                    : 'Submit Answer'}
                </button>
                
                {/* Feedback */}
                {state.feedback && state.feedback.show && (
                  <div className={`p-4 rounded-lg ${
                    state.feedback.isCorrect ? 'bg-green-600/20 text-green-300' : 'bg-red-600/20 text-red-300'
                  }`}>
                    <p className="font-semibold">
                      {state.feedback.isCorrect ? '✓ Correct!' : '✗ Incorrect'}
                    </p>
                    {!state.feedback.isCorrect && (
                      <p>The correct answer was: {state.feedback.expectedAnswer}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Stats sidebar */}
          <div className="xl:w-80">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-white/70">Accuracy:</span>
                  <span className="font-semibold text-white">
                    {state.score.total > 0 
                      ? Math.round((state.score.correct / state.score.total) * 100) 
                      : 0}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Avg Time:</span>
                  <span className="font-semibold text-white">{state.avgTime.toFixed(2)}s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Progress:</span>
                  <span className="font-semibold text-white">
                    {state.score.total}/{levelConfig.totalProblems}
                  </span>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-white/10">
                <h4 className="font-semibold text-white mb-2">Roman Numerals:</h4>
                <div className="text-sm text-white/70 space-y-1">
                  <p><strong>Major keys:</strong></p>
                  <p>I, ii, iii, IV, V, vi, vii°</p>
                  <p><strong>Minor keys:</strong></p>
                  <p>i, ii°, bIII, iv, v, bVI, bVII</p>
                  <p><strong>Format:</strong> Use dashes</p>
                  <p>Example: I - V - vi - IV</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}