/**
 * Universal Chord Constructor - Refactored with Clean Architecture
 * 
 * This is the main orchestrator component for chord construction exercises.
 * It has been refactored from a 973-line monolith into a modular, maintainable architecture.
 * 
 * Key Improvements:
 * - Reduced from 973 lines to ~300 lines
 * - Modular component architecture
 * - Custom hooks for state management
 * - Theme-based styling system
 * - Configuration-driven behavior
 * 
 * Components:
 * - PianoRoll: Interactive note placement interface
 * - ScoreDisplay: Progress and performance metrics
 * - TaskDisplay: Chord task and feedback display
 * 
 * Hooks:
 * - useChordConstruction: Game logic and state
 * - useTimer: Timer functionality
 */

import { useEffect } from 'react';
import { Link } from 'react-router';
import PianoRoll from './components/PianoRoll.jsx';
import ScoreDisplay from './components/ScoreDisplay.jsx';
import TaskDisplay from './components/TaskDisplay.jsx';
import useChordConstruction from './hooks/useChordConstruction.js';
import useTimer from './hooks/useTimer.js';
import { getThemeFromLevelConfig } from './utils/themes.js';
import { getMidiNoteName } from "../../chord-recognition/basic-triads/shared/chordLogic.js";

export default function UniversalChordConstructor({ levelConfig }) {
  // Get theme for this level
  const theme = getThemeFromLevelConfig(levelConfig);
  
  // Game logic hook
  const {
    hasStarted,
    isCompleted,
    currentTask,
    placedNotes,
    feedback,
    isAnswered,
    showSolution,
    score,
    levelResult,
    startLevel,
    nextTask,
    handleNoteToggle,
    submitAnswer,
    clearAllNotes,
    resetLevel,
    setShowSolution
  } = useChordConstruction(levelConfig);
  
  // Timer hook
  const {
    currentTime,
    avgTime,
    startTimer,
    stopTimer,
    resetCurrentTimer,
    resetAllTimers
  } = useTimer();

  /**
   * Handle level start
   */
  const handleStartLevel = () => {
    startLevel();
    startTimer();
  };

  /**
   * Handle moving to next task
   */
  const handleNextTask = () => {
    nextTask();
    startTimer();
  };

  /**
   * Handle answer submission
   */
  const handleSubmit = () => {
    const result = submitAnswer(stopTimer);
    
    // Auto-advance to next task after delay
    if (result && score.total < levelConfig.totalProblems) {
      setTimeout(() => {
        handleNextTask();
      }, result.isCorrect ? 1500 : 3000); // Shorter delay for correct answers
    }
  };

  /**
   * Handle level reset
   */
  const handleResetLevel = () => {
    resetLevel();
    resetAllTimers();
  };

  /**
   * Auto-start timer when task changes
   */
  useEffect(() => {
    if (currentTask && hasStarted && !isCompleted) {
      resetCurrentTimer();
      startTimer();
    }
  }, [currentTask]);

  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================

  /**
   * Start Screen
   */
  if (!hasStarted) {
    return (
      <div className={`min-h-screen ${theme.background} relative`}>
        {/* Logo */}
        <Link to="/" className="absolute top-2 left-2 z-50">
          <img src="/pailiaq-logo-small.png" alt="Logo" className="w-12 h-12" />
        </Link>

        {/* Header */}
        <header className="bg-black/20 backdrop-blur-md border-b border-white/10 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4 ml-16">
              <Link to="/chord-construction2" className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
                <span className="text-white text-sm font-bold">←</span>
              </Link>
              <h1 className="text-xl font-bold text-white">
                {levelConfig.title}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                levelConfig.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
                levelConfig.difficulty === 'Intermediate' ? 'bg-blue-100 text-blue-800' :
                levelConfig.difficulty === 'Advanced' ? 'bg-purple-100 text-purple-800' :
                'bg-red-100 text-red-800'
              }`}>
                {levelConfig.difficulty}
              </div>
            </div>
          </div>
        </header>

        {/* Start Screen Content */}
        <main className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center max-w-2xl">
            <div className="text-6xl mb-6">🎹</div>
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Build Chords?</h2>
            <p className="text-lg text-white/80 mb-6 leading-relaxed">
              {levelConfig.description}
            </p>
            
            {/* Available Chord Types */}
            <div className="bg-white/10 rounded-xl p-4 mb-4">
              <h3 className="text-white font-semibold mb-3">Available Chord Types</h3>
              <div className="flex flex-wrap gap-2 justify-center">
                {levelConfig.chordGeneration.chordTypes.map((chordType, index) => (
                  <span 
                    key={index}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${theme.primary} text-white`}
                  >
                    {chordType === 'major' ? 'Major' :
                     chordType === 'minor' ? 'Minor' :
                     chordType === 'diminished' ? 'Diminished' :
                     chordType === 'augmented' ? 'Augmented' :
                     chordType === 'major7' ? 'Major 7th' :
                     chordType === 'minor7' ? 'Minor 7th' :
                     chordType === 'dominant7' ? 'Dominant 7th' :
                     chordType === 'diminished7' ? 'Diminished 7th' :
                     chordType === 'halfDiminished7' ? 'Half Dim 7th' :
                     chordType === 'minor7b5' ? 'Minor 7♭5' :
                     chordType === 'maj9' ? 'Major 9th' :
                     chordType === 'min9' ? 'Minor 9th' :
                     chordType === 'dom9' ? 'Dominant 9th' :
                     chordType === 'maj11' ? 'Major 11th' :
                     chordType === 'min11' ? 'Minor 11th' :
                     chordType === 'maj13' ? 'Major 13th' :
                     chordType === 'min13' ? 'Minor 13th' :
                     chordType}
                  </span>
                ))}
              </div>
              {/* Inversion info */}
              {levelConfig.chordGeneration.allowInversions && (
                <div className="mt-3 text-center">
                  <span className="text-white/70 text-sm">
                    {levelConfig.chordGeneration.requireSpecificInversion === 'first' 
                      ? 'Includes first inversions'
                      : levelConfig.chordGeneration.requireSpecificInversion 
                        ? `Focus: ${levelConfig.chordGeneration.requireSpecificInversion} inversions`
                        : 'Includes all inversions (root, 1st, 2nd)'
                    }
                  </span>
                </div>
              )}
            </div>
            
            {/* Level Requirements */}
            <div className="bg-white/10 rounded-xl p-4 mb-8">
              <h3 className="text-white font-semibold mb-3">Level Requirements</h3>
              <div className="text-sm text-white/70 space-y-1">
                <p>• Complete {levelConfig.totalProblems} problems</p>
                <p>• Achieve {levelConfig.passAccuracy}% accuracy</p>
                <p>• Average time ≤ {levelConfig.passTime}s per problem</p>
              </div>
            </div>
            
            <button
              onClick={handleStartLevel}
              className={`px-12 py-4 text-white text-xl font-bold rounded-xl transition-colors shadow-lg ${theme.buttons.primary}`}
            >
              Start Building
            </button>
          </div>
        </main>
      </div>
    );
  }

  /**
   * Level Completed Screen
   */
  if (isCompleted) {
    const passed = levelResult?.passed || false;
    
    return (
      <div className={`min-h-screen ${theme.background} relative`}>
        {/* Logo */}
        <Link to="/" className="absolute top-2 left-2 z-50">
          <img src="/pailiaq-logo-small.png" alt="Logo" className="w-12 h-12" />
        </Link>

        <main className="flex items-center justify-center min-h-screen">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center max-w-2xl">
            <div className="text-6xl mb-6">{passed ? '🎉' : '💪'}</div>
            <h2 className="text-3xl font-bold text-white mb-4">
              {passed ? 'Level Complete!' : 'Keep Practicing!'}
            </h2>
            <p className="text-lg text-white/80 mb-8">
              {passed 
                ? 'Excellent chord construction! You\'ve mastered this level.'
                : 'You\'re making good progress. Try again to improve your score.'
              }
            </p>
            
            {/* Results */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-white/10 rounded-xl p-4">
                <div className={`text-2xl font-bold ${
                  levelResult.accuracy >= levelConfig.passAccuracy ? 'text-green-400' : 'text-red-400'
                }`}>
                  {levelResult.accuracy}%
                </div>
                <div className="text-white/70">Accuracy (need ≥{levelConfig.passAccuracy}%)</div>
              </div>
              <div className="bg-white/10 rounded-xl p-4">
                <div className={`text-2xl font-bold ${
                  avgTime <= levelConfig.passTime ? 'text-green-400' : 'text-red-400'
                }`}>
                  {avgTime.toFixed(1)}s
                </div>
                <div className="text-white/70">Avg Time (need ≤{levelConfig.passTime}s)</div>
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="flex gap-4 justify-center">
              <button
                onClick={handleResetLevel}
                className={`px-6 py-3 text-white font-semibold rounded-xl transition-colors ${theme.buttons.primary}`}
              >
                Try Again
              </button>
              <Link
                to={levelConfig.backPath}
                className="px-6 py-3 bg-white/20 text-white font-semibold rounded-xl hover:bg-white/30 transition-colors"
              >
                Back to Levels
              </Link>
              {passed && levelConfig.nextLevelPath && (
                <Link
                  to={levelConfig.nextLevelPath}
                  className={`px-6 py-3 text-white font-semibold rounded-xl transition-colors ${theme.buttons.success || theme.buttons.primary}`}
                >
                  Next Level →
                </Link>
              )}
            </div>
          </div>
        </main>
      </div>
    );
  }

  /**
   * Game Screen
   */
  return (
    <div className={`min-h-screen ${theme.background}`}>
      {/* Logo */}
      <Link to="/" className="absolute top-2 left-2 z-50">
        <img src="/pailiaq-logo-small.png" alt="Logo" className="w-12 h-12" />
      </Link>

      {/* Header */}
      <header className="bg-black/20 backdrop-blur-md border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4 ml-16">
            <Link to={levelConfig.backPath} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
              <span className="text-white text-sm font-bold">←</span>
            </Link>
            <h1 className="text-xl font-bold text-white">
              {levelConfig.title} - Problem {score.total + 1}/{levelConfig.totalProblems}
            </h1>
          </div>
          <div className="flex items-center space-x-6">
            <div className="text-white font-semibold">
              Score: {score.correct}/{score.total}
            </div>
            <div className="text-white font-semibold">
              Time: {currentTime.toFixed(1)}s
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="max-w-7xl mx-auto px-6 pt-4">
        <div className="w-full bg-white/10 rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all duration-300 ${theme.progressBar}`}
            style={{ width: `${(score.total / levelConfig.totalProblems) * 100}%` }}
          />
        </div>
      </div>

      <main className="max-w-7xl mx-auto p-6">
        <div className="flex flex-col xl:flex-row gap-8 items-start">
          {/* Main content */}
          <div className="flex-1">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6 text-center">
                Build this chord
              </h2>
              
              {/* Piano Roll */}
              <PianoRoll
                placedNotes={placedNotes}
                onNoteToggle={handleNoteToggle}
                currentTask={currentTask}
                showSolution={showSolution}
                feedback={feedback}
                theme={theme}
              />
              
              {/* Target chord information */}
              {currentTask && (
                <div className="text-center mb-6">
                  <div className={`text-3xl font-bold mb-2 ${theme.text}`}>
                    {currentTask.chordName}
                  </div>
                  <p className="text-white/70">
                    {currentTask.description}
                  </p>
                </div>
              )}

              {/* Action buttons and feedback */}
              <div className="space-y-4">
                <div className="flex justify-center gap-4">
                  <button
                    onClick={clearAllNotes}
                    className={`px-6 py-3 text-white font-semibold rounded-xl transition-colors ${theme.buttons.secondary}`}
                    disabled={isAnswered}
                  >
                    Clear All
                  </button>
                  
                  <button
                    onClick={handleSubmit}
                    disabled={isAnswered || placedNotes.length === 0}
                    className={`px-8 py-3 text-white font-semibold rounded-xl disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors ${theme.buttons.primary}`}
                  >
                    Check Chord
                  </button>
                </div>
                
                {/* Feedback display */}
                {feedback && (
                  <div className={`p-4 rounded-lg border ${
                    feedback.isCorrect 
                      ? theme.feedback.correct 
                      : theme.feedback.incorrect
                  }`}>
                    <p className="font-semibold text-center">
                      {feedback.isCorrect ? (
                        <span className="text-green-300">✓ Perfect!</span>
                      ) : (
                        <span className="text-red-300">✗ Not quite right</span>
                      )}
                    </p>
                    
                    {/* Detailed feedback for incorrect answers */}
                    {!feedback.isCorrect && feedback.expectedNotes && feedback.placedNotes && (
                      <div className="mt-3 text-sm space-y-1">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                          <span className="text-white/70">Expected:</span>
                          <span className="text-green-300 font-mono">
                            {feedback.expectedNotes.map(note => getMidiNoteName(note)).join(', ')}
                          </span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                          <span className="text-white/70">You placed:</span>
                          <span className="text-red-300 font-mono">
                            {feedback.placedNotes.map(note => getMidiNoteName(note)).join(', ')}
                          </span>
                        </div>
                        
                        {/* Additional helpful feedback */}
                        {feedback.expectedNotes.length !== feedback.placedNotes.length && (
                          <p className="text-yellow-300 text-center mt-2">
                            💡 You need exactly {feedback.expectedNotes.length} notes for this chord
                          </p>
                        )}
                      </div>
                    )}
                    
                    {/* Success message */}
                    {feedback.isCorrect && (
                      <p className="mt-2 text-green-200 text-center">
                        Excellent chord construction! 🎉
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="xl:w-80">
            <ScoreDisplay
              correct={score.correct}
              total={score.total}
              streak={score.streak}
              currentTime={currentTime}
              avgTime={avgTime}
              isAnswered={isAnswered}
              totalProblems={levelConfig.totalProblems}
              theme={theme}
            />
            
            {/* Instructions panel */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mt-4">
              <h3 className="text-xl font-bold text-white mb-4">Instructions</h3>
              <div className="text-sm text-white/70 space-y-1">
                <p>• Click notes on the piano roll</p>
                <p>• Build the requested chord</p>
                <p>• Green notes = correct placement</p>
                <p>• Red notes = incorrect placement</p>
                {!isAnswered && (
                  <button
                    onClick={() => setShowSolution(!showSolution)}
                    className="mt-4 px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-sm rounded-lg transition-colors"
                  >
                    {showSolution ? 'Hide' : 'Show'} Solution
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}