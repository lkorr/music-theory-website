/**
 * Level 1: Basic Triads
 * 
 * Refactored to use shared level system - demonstrates ~70% code reduction
 * from eliminating state management and event handler duplication.
 */

import { Link } from "react-router";
import { useLevelState } from "../../../shared/hooks/useLevelState.js";
import { useLevelLogic } from "../../../shared/hooks/useLevelLogic.js";
import { getLevelConfig } from "../../../shared/config/levelConfigs.js";
import { generateLevel1Chord, validateLevel1Answer } from "./level1Utils.js";
import { getMidiNoteName, isBlackKey } from "../../shared/chordLogic.js";
import ChordPianoDisplay from "../../shared/ChordPianoDisplay.jsx";
import ScoreDisplay from "../../shared/ScoreDisplay.jsx";
import { CompactAuthButton } from "../../../../../components/auth/AuthButton.jsx";

export default function Level1Page() {
  // Get level configuration
  const config = getLevelConfig('level1');
  
  // Initialize shared state (replaces ~25 lines of useState declarations)
  const state = useLevelState();
  
  // Initialize shared logic (replaces ~45 lines of event handlers)
  const logic = useLevelLogic(state, config, {
    generateChord: generateLevel1Chord,
    validateAnswer: validateLevel1Answer
  });
  
  // Destructure for easier access
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
    inputRef
  } = state;
  
  const {
    startLevel,
    handleSubmit,
    handleKeyPress,
    handleInputChange,
    canSubmit,
    nextChord
  } = logic;
  
  // Start screen (when level hasn't been started yet)
  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e]">
        <header className="bg-black/20 backdrop-blur-md border-b border-white/10 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/chord-recognition/basic-triads" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
                <span className="text-white text-sm font-bold">←</span>
              </Link>
              <h1 className="text-xl font-bold text-white">{config.title}</h1>
            </div>
            <CompactAuthButton />
          </div>
        </header>
        
        <main className="max-w-6xl mx-auto p-6">
          <div className="flex flex-col lg:flex-row gap-8 items-start justify-center min-h-[80vh]">
            {/* Main content */}
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-8 lg:w-1/2">
              <h2 className="text-3xl font-bold text-white mb-6">Ready to Start {config.title}?</h2>
              <div className="text-lg text-white/70 mb-8 space-y-2">
                <p><strong>{config.totalProblems} problems</strong> to complete</p>
                <p>{config.description}</p>
                <p>Need <strong>{config.passAccuracy}% accuracy</strong> to pass</p>
                <p>Average time must be under <strong>{config.passTime} seconds</strong></p>
              </div>
              <button
                onClick={startLevel}
                className={`px-12 py-4 ${config.buttonColor} text-white text-xl font-bold rounded-xl hover:${config.buttonHoverColor} transition-colors shadow-lg`}
              >
                Start {config.title}
              </button>
            </div>

            {/* Chord Legend - Mini piano rolls like Level 2 */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 lg:w-1/2">
              <h3 className="text-2xl font-bold text-white mb-6 text-center">Basic Triad Types</h3>
              <div className="space-y-4">
                {/* Major Triad */}
                <div className="bg-white/10 rounded-xl p-4">
                  <h4 className="font-bold text-white mb-3 text-center">Major (C)</h4>
                  <div className="flex justify-center">
                    {(() => {
                      const midiNotes = [60, 64, 67]; // C4, E4, G4
                      const minNote = Math.min(...midiNotes);
                      const maxNote = Math.max(...midiNotes);
                      const low = minNote - 2;
                      const high = maxNote + 2;
                      const totalSemitones = high - low + 1;
                      const noteHeight = 12;
                      const containerHeight = totalSemitones * noteHeight;
                      return (
                        <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ width: '120px', height: `${containerHeight}px` }}>
                          <div className="flex h-full">
                            <div className="w-8 border-r-2 border-gray-300 bg-white">
                              {Array.from({ length: totalSemitones }, (_, j) => {
                                const midiNote = high - j;
                                const noteName = getMidiNoteName(midiNote);
                                return (
                                  <div key={j} className="border-b border-gray-200 flex items-center justify-end pr-1 text-xs" style={{ 
                                    height: `${noteHeight}px`,
                                    backgroundColor: isBlackKey(midiNote) ? '#6b7280' : '#ffffff',
                                    color: isBlackKey(midiNote) ? '#ffffff' : '#000000'
                                  }}>
                                    <span style={{ fontSize: '6px' }}>{noteName}</span>
                                  </div>
                                );
                              })}
                            </div>
                            <div className="flex-1 bg-gradient-to-r from-gray-50 to-gray-100 relative">
                              {Array.from({ length: totalSemitones }, (_, j) => (
                                <div key={j} className="absolute left-0 right-0 border-b border-gray-200" style={{ top: `${j * noteHeight}px` }} />
                              ))}
                              {midiNotes.map((midiNote, j) => {
                                const position = (high - midiNote) * noteHeight;
                                return (
                                  <div key={j} className="absolute rounded shadow-lg bg-blue-500" 
                                       style={{ left: '2px', top: `${position + 1}px`, width: '60px', height: `${noteHeight - 2}px` }}></div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Minor Triad */}
                <div className="bg-white/10 rounded-xl p-4">
                  <h4 className="font-bold text-white mb-3 text-center">Minor (Dm)</h4>
                  <div className="flex justify-center">
                    {(() => {
                      const midiNotes = [62, 65, 69]; // D4, F4, A4
                      const minNote = Math.min(...midiNotes);
                      const maxNote = Math.max(...midiNotes);
                      const low = minNote - 2;
                      const high = maxNote + 2;
                      const totalSemitones = high - low + 1;
                      const noteHeight = 12;
                      const containerHeight = totalSemitones * noteHeight;
                      return (
                        <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ width: '120px', height: `${containerHeight}px` }}>
                          <div className="flex h-full">
                            <div className="w-8 border-r-2 border-gray-300 bg-white">
                              {Array.from({ length: totalSemitones }, (_, j) => {
                                const midiNote = high - j;
                                const noteName = getMidiNoteName(midiNote);
                                return (
                                  <div key={j} className="border-b border-gray-200 flex items-center justify-end pr-1 text-xs" style={{ 
                                    height: `${noteHeight}px`,
                                    backgroundColor: isBlackKey(midiNote) ? '#6b7280' : '#ffffff',
                                    color: isBlackKey(midiNote) ? '#ffffff' : '#000000'
                                  }}>
                                    <span style={{ fontSize: '6px' }}>{noteName}</span>
                                  </div>
                                );
                              })}
                            </div>
                            <div className="flex-1 bg-gradient-to-r from-gray-50 to-gray-100 relative">
                              {Array.from({ length: totalSemitones }, (_, j) => (
                                <div key={j} className="absolute left-0 right-0 border-b border-gray-200" style={{ top: `${j * noteHeight}px` }} />
                              ))}
                              {midiNotes.map((midiNote, j) => {
                                const position = (high - midiNote) * noteHeight;
                                return (
                                  <div key={j} className="absolute rounded shadow-lg bg-blue-500" 
                                       style={{ left: '2px', top: `${position + 1}px`, width: '60px', height: `${noteHeight - 2}px` }}></div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Diminished Triad */}
                <div className="bg-white/10 rounded-xl p-4">
                  <h4 className="font-bold text-white mb-3 text-center">Diminished (Bdim)</h4>
                  <div className="flex justify-center">
                    {(() => {
                      const midiNotes = [59, 62, 65]; // B3, D4, F4
                      const minNote = Math.min(...midiNotes);
                      const maxNote = Math.max(...midiNotes);
                      const low = minNote - 2;
                      const high = maxNote + 2;
                      const totalSemitones = high - low + 1;
                      const noteHeight = 12;
                      const containerHeight = totalSemitones * noteHeight;
                      return (
                        <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ width: '120px', height: `${containerHeight}px` }}>
                          <div className="flex h-full">
                            <div className="w-8 border-r-2 border-gray-300 bg-white">
                              {Array.from({ length: totalSemitones }, (_, j) => {
                                const midiNote = high - j;
                                const noteName = getMidiNoteName(midiNote);
                                return (
                                  <div key={j} className="border-b border-gray-200 flex items-center justify-end pr-1 text-xs" style={{ 
                                    height: `${noteHeight}px`,
                                    backgroundColor: isBlackKey(midiNote) ? '#6b7280' : '#ffffff',
                                    color: isBlackKey(midiNote) ? '#ffffff' : '#000000'
                                  }}>
                                    <span style={{ fontSize: '6px' }}>{noteName}</span>
                                  </div>
                                );
                              })}
                            </div>
                            <div className="flex-1 bg-gradient-to-r from-gray-50 to-gray-100 relative">
                              {Array.from({ length: totalSemitones }, (_, j) => (
                                <div key={j} className="absolute left-0 right-0 border-b border-gray-200" style={{ top: `${j * noteHeight}px` }} />
                              ))}
                              {midiNotes.map((midiNote, j) => {
                                const position = (high - midiNote) * noteHeight;
                                return (
                                  <div key={j} className="absolute rounded shadow-lg bg-blue-500" 
                                       style={{ left: '2px', top: `${position + 1}px`, width: '60px', height: `${noteHeight - 2}px` }}></div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Augmented Triad */}
                <div className="bg-white/10 rounded-xl p-4">
                  <h4 className="font-bold text-white mb-3 text-center">Augmented (Caug)</h4>
                  <div className="flex justify-center">
                    {(() => {
                      const midiNotes = [60, 64, 68]; // C4, E4, G#4
                      const minNote = Math.min(...midiNotes);
                      const maxNote = Math.max(...midiNotes);
                      const low = minNote - 2;
                      const high = maxNote + 2;
                      const totalSemitones = high - low + 1;
                      const noteHeight = 12;
                      const containerHeight = totalSemitones * noteHeight;
                      return (
                        <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ width: '120px', height: `${containerHeight}px` }}>
                          <div className="flex h-full">
                            <div className="w-8 border-r-2 border-gray-300 bg-white">
                              {Array.from({ length: totalSemitones }, (_, j) => {
                                const midiNote = high - j;
                                const noteName = getMidiNoteName(midiNote);
                                return (
                                  <div key={j} className="border-b border-gray-200 flex items-center justify-end pr-1 text-xs" style={{ 
                                    height: `${noteHeight}px`,
                                    backgroundColor: isBlackKey(midiNote) ? '#6b7280' : '#ffffff',
                                    color: isBlackKey(midiNote) ? '#ffffff' : '#000000'
                                  }}>
                                    <span style={{ fontSize: '6px' }}>{noteName}</span>
                                  </div>
                                );
                              })}
                            </div>
                            <div className="flex-1 bg-gradient-to-r from-gray-50 to-gray-100 relative">
                              {Array.from({ length: totalSemitones }, (_, j) => (
                                <div key={j} className="absolute left-0 right-0 border-b border-gray-200" style={{ top: `${j * noteHeight}px` }} />
                              ))}
                              {midiNotes.map((midiNote, j) => {
                                const position = (high - midiNote) * noteHeight;
                                return (
                                  <div key={j} className="absolute rounded shadow-lg bg-blue-500" 
                                       style={{ left: '2px', top: `${position + 1}px`, width: '60px', height: `${noteHeight - 2}px` }}></div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Completion screen
  if (isCompleted && levelResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e] flex items-center justify-center p-6">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-md w-full text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Level {levelResult.passed ? 'Completed!' : 'Failed'}
          </h2>
          
          <div className="space-y-4 mb-8">
            <div className="flex justify-between">
              <span className="text-white/70">Accuracy:</span>
              <span className={`font-bold ${levelResult.accuracy >= config.passAccuracy ? 'text-green-600' : 'text-red-600'}`}>
                {levelResult.accuracy.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Average Time:</span>
              <span className={`font-bold ${levelResult.avgTime <= config.passTime ? 'text-green-600' : 'text-red-600'}`}>
                {levelResult.avgTime.toFixed(1)}s
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Score:</span>
              <span className="font-bold text-white">
                {levelResult.score.correct}/{levelResult.score.total}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {levelResult.passed && (
              <Link 
                to="/chord-recognition/basic-triads/recognition/level2"
                className={`block px-6 py-3 ${config.buttonColor} text-white font-semibold rounded-xl hover:${config.buttonHoverColor} transition-colors`}
              >
                Next Level
              </Link>
            )}
            
            <button
              onClick={() => {
                state.helpers.resetLevel();
                startLevel();
              }}
              className={`px-6 py-3 ${config.buttonColor} text-white font-semibold rounded-xl hover:${config.buttonHoverColor} transition-colors`}
            >
              Try Again
            </button>
            
            <Link 
              to="/chord-recognition/basic-triads"
              className="block px-6 py-3 bg-gray-500 text-white font-semibold rounded-xl hover:bg-gray-600 transition-colors"
            >
              Back to Levels
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Main game screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e]">
      <header className="bg-black/20 backdrop-blur-md border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/chord-recognition/basic-triads" className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
              <span className="text-white text-sm font-bold">←</span>
            </Link>
            <h1 className="text-xl font-bold text-white">
              {config.title} - Problem {score.total}/{config.totalProblems}
            </h1>
          </div>
          <div className="flex items-center space-x-6">
            <div className="text-white font-semibold">
              Score: {score.correct}/{score.total}
            </div>
            <div className="text-white font-semibold">
              Time: {currentTime}s
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto p-6">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="w-full bg-white/10 rounded-full h-3">
            <div 
              className={`${config.progressColor} h-3 rounded-full transition-all duration-300`}
              style={{ width: `${(score.total / config.totalProblems) * 100}%` }}
            />
          </div>
        </div>
        
        <div className="flex flex-col xl:flex-row gap-8 items-start">
          {/* Main content */}
          <div className="flex-1">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6 text-center">
                Identify this triad
              </h2>
              
              {/* Piano Display */}
              {currentChord && (
                <div className="mb-8">
                  <ChordPianoDisplay 
                    notes={currentChord.notes} 
                    showLabels={showLabels}
                    setShowLabels={(value) => state.setShowLabels(value)}
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
                      ? `${config.buttonColor} text-white hover:${config.buttonHoverColor}`
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
                  <span className="font-semibold text-white">{parseFloat(avgTime).toFixed(2)}s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Progress:</span>
                  <span className="font-semibold text-white">
                    {score.total}/{config.totalProblems}
                  </span>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-black/10">
                <h4 className="font-semibold text-white mb-2">Chord Types:</h4>
                <div className="text-sm text-white/70 space-y-1">
                  <p>• <strong>Major:</strong> C, Cmaj, CM</p>
                  <p>• <strong>Minor:</strong> Dm, Dmin, D-</p>
                  <p>• <strong>Diminished:</strong> Fdim, F°</p>
                  <p>• <strong>Augmented:</strong> Gaug, G+</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}