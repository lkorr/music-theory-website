/**
 * Universal Chord Recognition Game Component
 * 
 * This component handles ALL chord recognition levels through configuration-driven behavior.
 * Replaces 15+ individual level implementations with a single universal component.
 * 
 * Features:
 * - Configuration-driven chord generation and validation
 * - Support for all chord types (triads, 7ths, 9ths, 11ths, 13ths)
 * - Support for all inversion types
 * - Configurable themes and UI
 * - Shared state and logic hooks
 * - Identical functionality to original levels
 */

import type { ReactNode } from "react";
import { useEffect } from "react";
import { Link } from "react-router";
import { useAuth } from "../../../../components/auth/ProtectedRoute";
import { useLevelState } from "./hooks/useLevelState.js";
import { useLevelLogic } from "./hooks/useLevelLogic.js";
import { generateChord } from "./theory/chordGeneration.js";
import { validateAnswer } from "./theory/chordValidation.js";
import ChordPianoDisplay from "./components/ChordPianoDisplay.jsx";
import ScoreDisplay from "./components/ScoreDisplay.jsx";
import MiniPianoRoll from "./components/MiniPianoRoll.jsx";
import LeaderboardComponent from "./components/LeaderboardComponent.tsx";
import { CHORD_EXAMPLES } from "../data/chordExamples.js";
import { CompactAuthButton } from "../../../../components/auth/AuthButton.tsx";

interface MidiRange {
  lowest: number;
  highest: number;
}

interface LevelDisplay {
  midiRange?: MidiRange;
}

interface LevelConfig {
  id: string;
  title: string;
  description: string;
  category: string;
  level: number;
  totalProblems: number;
  passAccuracy: number;
  passTime: number;
  progressColor: string;
  buttonColor: string;
  buttonHoverColor: string;
  display?: LevelDisplay;
}

interface ChordExample {
  name: string;
  midiNotes: number[];
}

interface ChordExampleData {
  examples: ChordExample[];
}

interface UniversalChordRecognitionGameProps {
  levelConfig: LevelConfig;
}

/**
 * Universal Chord Recognition Game
 * @param levelConfig - Complete level configuration object
 * @returns The game component
 */
export default function UniversalChordRecognitionGame({ levelConfig }: UniversalChordRecognitionGameProps): ReactNode {
  // Initialize auth and user
  const authState = useAuth();
  const user = authState.user;
  
  // Initialize shared state management
  const state = useLevelState();
  
  // Initialize shared game logic with configuration-driven functions
  const logic = useLevelLogic(state, levelConfig, {
    generateChord: (previousChord: any) => generateChord(levelConfig, previousChord),
    validateAnswer: (answer: string, expected: any) => validateAnswer(answer, expected, levelConfig)
  });
  
  // Destructure state for cleaner access
  const {
    currentChord,
    userAnswer,
    feedback,
    score,
    currentTime,
    avgTime,
    showLabels,
    hasStarted,
    isCompleted,
    levelResult,
    inputRef,
    setShowLabels,
    statistics
  } = state;
  
  const {
    startLevel,
    handleSubmit,
    handleKeyPress,
    handleInputChange,
    canSubmit,
    nextChord,
    restartLevel
  } = logic;
  
  // Extract theme colors from config
  const { progressColor, buttonColor, buttonHoverColor } = levelConfig;
  
  // Display range for piano (can be configured per level)
  const midiRange: MidiRange = levelConfig.display?.midiRange || { lowest: 24, highest: 96 };
  
  // Determine level navigation paths
  const category = levelConfig.category;
  const level = levelConfig.level;
  const nextLevel = level + 1;
  const prevLevel = level - 1;
  
  // Build navigation URLs
  const backUrl = `/core-training/chord-recognition`;
  const categoryUrl = `/core-training/chord-recognition`; // Could be extended for category pages
  const nextLevelUrl = `/core-training/chord-recognition/${category}/${nextLevel}`;
  const prevLevelUrl = prevLevel > 0 ? `/core-training/chord-recognition/${category}/${prevLevel}` : null;
  
  // Note: Statistics and leaderboard loading is now handled by LeaderboardComponent
  // to avoid duplicate requests and improve performance
  
  if (!hasStarted) {
    // Level start screen
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e]">
        {/* Logo in top-left */}
        <Link to="/" className="absolute top-2 left-2 z-50">
          <img src="/pailiaq-logo-small.png" alt="Logo" className="w-12 h-12" />
        </Link>
        
        <header className="bg-black/20 backdrop-blur-md border-b border-white/10 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4 ml-16">
              <Link 
                to={backUrl} 
                className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <span className="text-white text-sm font-bold">←</span>
              </Link>
              <h1 className="text-xl font-bold text-white">
                {levelConfig.title}
              </h1>
            </div>
            <CompactAuthButton />
          </div>
        </header>
        
        <main className="max-w-4xl mx-auto p-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center">
            <h2 className="text-4xl font-bold text-white mb-4">
              {levelConfig.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} Level {levelConfig.level}
            </h2>
            <h3 className="text-2xl font-semibold text-white/80 mb-6">
              {levelConfig.title}
            </h3>
            <p className="text-lg text-white/70 mb-8 leading-relaxed max-w-2xl mx-auto">
              {levelConfig.description}
            </p>
            
            {/* Visual chord examples (skip for open voicings) */}
            {(CHORD_EXAMPLES as Record<string, ChordExampleData>)[levelConfig.id] && levelConfig.id !== 'basic-triads-4' && (
              <div className="mb-8">
                <h4 className="text-xl font-semibold text-white mb-4">New Chords You'll Identify:</h4>
                {/* Custom layout for seventh chords levels with first 3 in first row, last 2 in second row */}
                {levelConfig.category === 'seventh-chords' ? (
                  <div className="mb-6">
                    {/* First row - first 3 chords */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      {(CHORD_EXAMPLES as Record<string, ChordExampleData>)[levelConfig.id].examples.slice(0, 3).map((example, idx) => (
                        <div key={idx} className="bg-white/10 rounded-lg p-4 text-center">
                          <div className="text-sm font-semibold text-white mb-2">{example.name}</div>
                          <div className="flex justify-center">
                            <MiniPianoRoll 
                              midiNotes={example.midiNotes} 
                              width={100} 
                              noteHeight={10}
                              showRoot={false}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Second row - last 2 chords */}
                    {(CHORD_EXAMPLES as Record<string, ChordExampleData>)[levelConfig.id].examples.length > 3 && (
                      <div className="grid grid-cols-2 gap-4 justify-center max-w-md mx-auto">
                        {(CHORD_EXAMPLES as Record<string, ChordExampleData>)[levelConfig.id].examples.slice(3).map((example, idx) => (
                          <div key={idx + 3} className="bg-white/10 rounded-lg p-4 text-center">
                            <div className="text-sm font-semibold text-white mb-2">{example.name}</div>
                            <div className="flex justify-center">
                              <MiniPianoRoll 
                                midiNotes={example.midiNotes} 
                                width={100} 
                                noteHeight={10}
                                showRoot={false}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : levelConfig.category === 'extended-chords' ? (
                  /* Custom scrollable layout for extended chords - 4 per row, multiple rows */
                  <div className="mb-6">
                    <div className="max-h-80 overflow-y-auto space-y-4 px-2">
                      {/* Group examples into rows of 4 */}
                      {Array.from({ length: Math.ceil((CHORD_EXAMPLES as Record<string, ChordExampleData>)[levelConfig.id].examples.length / 4) }, (_, rowIdx) => (
                        <div key={rowIdx} className="grid grid-cols-4 gap-4">
                          {(CHORD_EXAMPLES as Record<string, ChordExampleData>)[levelConfig.id].examples
                            .slice(rowIdx * 4, (rowIdx + 1) * 4)
                            .map((example, idx) => (
                              <div key={rowIdx * 4 + idx} className="bg-white/10 rounded-lg p-3 text-center">
                                <div className="text-xs font-semibold text-white mb-2 truncate" title={example.name}>
                                  {example.name}
                                </div>
                                <div className="flex justify-center">
                                  <MiniPianoRoll 
                                    midiNotes={example.midiNotes} 
                                    width={80} 
                                    noteHeight={8}
                                    showRoot={false}
                                  />
                                </div>
                              </div>
                            ))}
                        </div>
                      ))}
                    </div>
                    {/* Scroll indicator */}
                    <div className="text-center text-white/50 text-xs mt-2">
                      {(CHORD_EXAMPLES as Record<string, ChordExampleData>)[levelConfig.id].examples.length > 4 && '↓ Scroll to see more chord types ↓'}
                    </div>
                  </div>
                ) : (
                  /* Default layout for other categories */
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {(CHORD_EXAMPLES as Record<string, ChordExampleData>)[levelConfig.id].examples.map((example, idx) => (
                      <div key={idx} className="bg-white/10 rounded-lg p-4 text-center">
                        <div className="text-sm font-semibold text-white mb-2">{example.name}</div>
                        <div className="flex justify-center">
                          <MiniPianoRoll 
                            midiNotes={example.midiNotes} 
                            width={100} 
                            noteHeight={10}
                            showRoot={false}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Level requirements */}
              <div>
                <h4 className="text-xl font-semibold text-white mb-4">Level Requirements</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white/10 rounded-xl p-4">
                    <div className="text-2xl font-bold text-white">{levelConfig.totalProblems}</div>
                    <div className="text-white/70">Problems</div>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4">
                    <div className="text-2xl font-bold text-white">{levelConfig.passAccuracy}%</div>
                    <div className="text-white/70">Pass Accuracy</div>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4">
                    <div className="text-2xl font-bold text-white">{levelConfig.passTime}s</div>
                    <div className="text-white/70">Target Time</div>
                  </div>
                </div>
                
                {/* Start Level Button */}
                <button
                  onClick={startLevel}
                  className={`w-full mt-6 ${buttonColor} hover:${buttonHoverColor} text-white font-bold py-4 px-8 rounded-lg text-xl transition-colors duration-200`}
                >
                  Start Level
                </button>
              </div>
              
              {/* Leaderboard Preview */}
              <div>
                <LeaderboardComponent 
                  moduleType="chord-recognition"
                  category={category}
                  level={level.toString()}
                  limit={5}
                  showUserStats={true}
                  compact={true}
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }
  
  if (isCompleted && levelResult) {
    // Level completion screen
    const passed = levelResult.passed;
    const canAdvance = passed; // Only allow advance if passed
    const lastResult = statistics.lastResult;
    const isPersonalBest = lastResult && lastResult.isPersonalBest;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e]">
        {/* Logo in top-left */}
        <Link to="/" className="absolute top-2 left-2 z-50">
          <img src="/pailiaq-logo-small.png" alt="Logo" className="w-12 h-12" />
        </Link>
        
        <header className="bg-black/20 backdrop-blur-md border-b border-white/10 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4 ml-16">
              <Link 
                to={backUrl} 
                className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <span className="text-white text-sm font-bold">←</span>
              </Link>
              <h1 className="text-xl font-bold text-white">
                {levelConfig.title} - {passed ? 'Complete!' : 'Try Again'}
              </h1>
            </div>
            <CompactAuthButton />
          </div>
        </header>
        
        <main className="max-w-4xl mx-auto p-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center">
            <div className={`text-6xl font-bold mb-6 ${passed ? 'text-green-400' : 'text-red-400'}`}>
              {passed ? (isPersonalBest ? '🏆 New Record!' : '🎉 Success!') : '📚 Keep Practicing'}
            </div>
            
            <h2 className="text-3xl font-bold text-white mb-4">
              {passed ? (isPersonalBest ? 'Personal Best Achieved!' : 'Level Complete!') : 'Level Not Passed'}
            </h2>
            
            {/* Personal Best Notification */}
            {isPersonalBest && passed && (
              <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg p-4 mb-6">
                <div className="text-lg font-semibold text-yellow-200 mb-2">
                  🥇 Congratulations on your new personal best!
                </div>
                {lastResult.previousBest && (
                  <div className="text-sm text-yellow-300/80">
                    Previous best: {lastResult.previousBest.accuracy.toFixed(1)}% in {lastResult.previousBest.time.toFixed(1)}s
                  </div>
                )}
                {lastResult.newRank && (
                  <div className="text-sm text-yellow-300/80">
                    Your new rank: #{lastResult.newRank}
                  </div>
                )}
              </div>
            )}
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white/10 rounded-xl p-4">
                <div className="text-2xl font-bold text-white">{levelResult.accuracy.toFixed(1)}%</div>
                <div className="text-white/70">Accuracy</div>
                <div className="text-sm text-white/50">Need: {levelConfig.passAccuracy}%</div>
              </div>
              <div className="bg-white/10 rounded-xl p-4">
                <div className="text-2xl font-bold text-white">{levelResult.avgTime.toFixed(1)}s</div>
                <div className="text-white/70">Avg Time</div>
                <div className="text-sm text-white/50">Target: {levelConfig.passTime}s</div>
              </div>
              <div className="bg-white/10 rounded-xl p-4">
                <div className="text-2xl font-bold text-white">{levelResult.score.correct}</div>
                <div className="text-white/70">Correct</div>
              </div>
              <div className="bg-white/10 rounded-xl p-4">
                <div className="text-2xl font-bold text-white">{levelResult.score.streak}</div>
                <div className="text-white/70">Best Streak</div>
              </div>
            </div>
            
            {/* Leaderboard */}
            {user && levelConfig.category && levelConfig.level && (
              <div className="mb-8">
                <LeaderboardComponent
                  moduleType="chord-recognition"
                  category={levelConfig.category}
                  level={levelConfig.level.toString()}
                  limit={10}
                  showUserStats={false}
                  compact={false}
                />
              </div>
            )}
            
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={restartLevel}
                className={`${buttonColor} hover:${buttonHoverColor} text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200`}
              >
                Try Again
              </button>
              
              {canAdvance && nextLevel && (
                <Link
                  to={nextLevelUrl}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  Next Level
                </Link>
              )}
              
              <Link
                to={backUrl}
                className="bg-white/20 hover:bg-white/30 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200"
              >
                Back to Hub
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }
  
  // Main game screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e]">
      {/* Logo in top-left */}
      <Link to="/" className="absolute top-2 left-2 z-50">
        <img src="/pailiaq-logo-small.png" alt="Logo" className="w-12 h-12" />
      </Link>
      
      <header className="bg-black/20 backdrop-blur-md border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4 ml-16">
            <Link 
              to={backUrl} 
              className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
            >
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
      
      <main className="max-w-7xl mx-auto p-6">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="w-full bg-white/10 rounded-full h-3">
            <div 
              className={`${progressColor} h-3 rounded-full transition-all duration-300`}
              style={{ width: `${(score.total / levelConfig.totalProblems) * 100}%` }}
            />
          </div>
        </div>
        
        <div className="flex flex-col xl:flex-row gap-8 items-start">
          {/* Main content */}
          <div className="flex-1">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6 text-center">
                {levelConfig.category === 'basic-triads' && 'Identify this triad'}
                {levelConfig.category === 'seventh-chords' && 'Identify this 7th chord'}
                {levelConfig.category === 'extended-chords' && levelConfig.level === 1 && 'Identify this 9th chord'}
                {levelConfig.category === 'extended-chords' && levelConfig.level === 2 && 'Identify this 11th chord'}
                {levelConfig.category === 'extended-chords' && levelConfig.level === 3 && 'Identify this 13th chord'}
                {levelConfig.category === 'extended-chords' && levelConfig.level > 3 && 'Identify this extended chord'}
              </h2>
              
              {/* Piano Display */}
              {currentChord && (
                <div className="mb-8">
                  <ChordPianoDisplay
                    notes={currentChord.notes}
                    showLabels={showLabels}
                    setShowLabels={setShowLabels}
                    noteBlockColor={buttonColor}
                    noteBorderColor={buttonColor.replace('bg-', 'border-').replace('500', '600')}
                    lowestMidi={midiRange.lowest}
                    highestMidi={midiRange.highest}
                  />
                </div>
              )}
              
              {/* Input area */}
              <div className="space-y-4">
                <input
                  ref={inputRef}
                  type="text"
                  value={userAnswer}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter chord name (e.g., C, Dm, Gaug, Fdim)"
                  className="w-full px-4 py-3 text-lg rounded-lg border-2 border-white/30 focus:border-blue-400 focus:outline-none bg-white/10 text-white placeholder-white/50"
                  readOnly={feedback && feedback.show}
                />
                
                <button
                  onClick={feedback && feedback.show && !feedback.isCorrect ? nextChord : handleSubmit}
                  disabled={!canSubmit && !(feedback && feedback.show && !feedback.isCorrect)}
                  className={`w-full py-3 px-6 font-semibold rounded-lg transition-colors ${
                    (canSubmit || (feedback && feedback.show && !feedback.isCorrect))
                      ? `${buttonColor} text-white hover:${buttonHoverColor}`
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {feedback && feedback.show && !feedback.isCorrect 
                    ? 'Press Enter to Continue' 
                    : 'Submit Answer'}
                </button>
                
                {/* Feedback */}
                {feedback && feedback.show && (
                  <div className={`p-4 rounded-lg ${
                    feedback.isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    <p className="font-semibold">
                      {feedback.isCorrect ? '✓ Correct!' : '✗ Incorrect'}
                    </p>
                    {!feedback.isCorrect && (
                      <p>The correct answer was: {feedback.correctAnswer}</p>
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
                    {score.total > 0 
                      ? Math.round((score.correct / score.total) * 100) 
                      : 0}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Avg Time:</span>
                  <span className="font-semibold text-white">{avgTime.toFixed(2)}s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Progress:</span>
                  <span className="font-semibold text-white">
                    {score.total}/{levelConfig.totalProblems}
                  </span>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-white/10">
                <h4 className="font-semibold text-white mb-2">Chord Types:</h4>
                <div className="text-sm text-white/70 space-y-1">
                  {levelConfig.category === 'basic-triads' && (
                    <>
                      <p>• <strong>Major:</strong> C, Cmaj, CM</p>
                      <p>• <strong>Minor:</strong> Dm, Dmin, D-</p>
                      <p>• <strong>Diminished:</strong> Fdim, F°</p>
                      <p>• <strong>Augmented:</strong> Gaug, G+</p>
                    </>
                  )}
                  {levelConfig.category === 'seventh-chords' && (
                    <>
                      <p>• <strong>Major 7:</strong> Cmaj7, CM7</p>
                      <p>• <strong>Minor 7:</strong> Dm7, Dmin7</p>
                      <p>• <strong>Dominant 7:</strong> G7, Gdom7</p>
                      <p>• <strong>Diminished 7:</strong> Fdim7, F°7</p>
                      <p>• <strong>Half Dim 7:</strong> Fm7b5, Fø7</p>
                    </>
                  )}
                  {levelConfig.category === 'extended-chords' && levelConfig.level === 1 && (
                    <>
                      <p>• <strong>Major 9th:</strong> Cmaj9, CM9, CΔ9</p>
                      <p>• <strong>Minor 9th:</strong> Dm9, Dmin9, D-9</p>
                      <p>• <strong>Dominant 9th:</strong> G9, Gdom9</p>
                      <p>• <strong>Dom 7b9:</strong> G7b9, G7♭9</p>
                      <p>• <strong>Dom 7#9:</strong> G7#9, G7♯9</p>
                      <p>• <strong>Minor 7b9:</strong> Dm7b9, Dm7♭9</p>
                      <p>• <strong>Add 9:</strong> Cadd9, C(add9)</p>
                      <p>• <strong>Minor Add 9:</strong> Dmadd9, Dm(add9)</p>
                      <p>• <strong>Dim 7 Add 9:</strong> Bdim7add9, B°7add9</p>
                      <p>• <strong>Dim 7b9:</strong> Bdim7b9, B°7♭9</p>
                      <p>• <strong>Half Dim 9:</strong> Bø9, Bm7b5add9</p>
                      <p>• <strong>Half Dimb9:</strong> Bø7b9, Bm7b5b9</p>
                    </>
                  )}
                  {levelConfig.category === 'extended-chords' && levelConfig.level === 2 && (
                    <>
                      <p>• <strong>Major 11th:</strong> Cmaj11, CM11, CΔ11</p>
                      <p>• <strong>Minor 11th:</strong> Cm11, Cmin11, C-11</p>
                      <p>• <strong>Dominant 11th:</strong> C11, Cdom11</p>
                      <p>• <strong>Major 7#11:</strong> Cmaj7#11, CM7#11</p>
                      <p>• <strong>Dom 7#11:</strong> C7#11, Cdom7#11</p>
                      <p>• <strong>Minor 7#11:</strong> Cm7#11, Cmin7#11</p>
                      <p>• <strong>Add 11:</strong> Cadd11, C(add11)</p>
                      <p>• <strong>Minor Add 11:</strong> Cmadd11, Cm(add11)</p>
                      <p>• <strong>Dom 11b9:</strong> C11b9, C11♭9</p>
                      <p>• <strong>Dom 11#9:</strong> C11#9, C11♯9</p>
                      <p>• <strong>Min 11b9:</strong> Cm11b9, Cm11♭9</p>
                    </>
                  )}
                  {levelConfig.category === 'extended-chords' && levelConfig.level === 3 && (
                    <>
                      <p>• <strong>Major 13th:</strong> Cmaj13, CM13, CΔ13</p>
                      <p>• <strong>Minor 13th:</strong> Cm13, Cmin13, C-13</p>
                      <p>• <strong>Dominant 13th:</strong> C13, Cdom13</p>
                      <p>• <strong>Major 13#11:</strong> Cmaj13#11, CM13#11</p>
                      <p>• <strong>Dom 13#11:</strong> C13#11, Cdom13#11</p>
                      <p>• <strong>Dom 13b9:</strong> C13b9, Cdom13b9</p>
                      <p>• <strong>Dom 13#9:</strong> C13#9, Cdom13#9</p>
                      <p>• <strong>Add 13:</strong> Cadd13, C(add13)</p>
                      <p>• <strong>Minor Add 13:</strong> Cmadd13, Cm(add13)</p>
                      <p>• <strong>Dom 13#11b9:</strong> C13#11b9, Cdom13#11b9</p>
                      <p>• <strong>Dom 13#11#9:</strong> C13#11#9, Cdom13#11#9</p>
                      <p>• <strong>Min 13#11:</strong> Cm13#11, Cmin13#11</p>
                      <p>• <strong>Min 13b9:</strong> Cm13b9, Cmin13b9</p>
                    </>
                  )}
                  {levelConfig.category === 'extended-chords' && levelConfig.level >= 4 && (
                    <>
                      <p>• <strong>Extended Inversions:</strong> Complex harmonic structures</p>
                      <p>• <strong>9th Inversions:</strong> Cmaj9/E, Cmaj9/G, etc.</p>
                      <p>• <strong>11th Inversions:</strong> Cmaj11/G, etc.</p>
                      <p>• <strong>13th Inversions:</strong> Advanced voicings</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}