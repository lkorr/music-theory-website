/**
 * Jazz/Extended Chords Level 4: 13th Chords and Alterations
 * 
 * 13th chords with various alterations in root position only
 */

import { Link } from "react-router";
import { useLevelState } from "../../../shared/hooks/useLevelState.js";
import { useLevelLogic } from "../../../shared/hooks/useLevelLogic.js";
import { getLevelConfig } from "../../shared/config/levelConfigs.js";
import { generateLevel4Chord, validateLevel4Answer } from "./level4Utils.js";
import { getMidiNoteName, isBlackKey, getChordNameWithEnharmonic } from "../../shared/chordLogic.js";
import ChordPianoDisplay from "../../../basic-triads/shared/ChordPianoDisplay.jsx";
import { CompactAuthButton } from "../../../../../components/auth/AuthButton.jsx";

export default function JazzLevel4Page() {
  // Get level configuration
  const config = getLevelConfig('level4');
  
  // Initialize shared state
  const state = useLevelState();
  
  // Initialize shared logic
  const logic = useLevelLogic(state, config, {
    generateChord: generateLevel4Chord,
    validateAnswer: validateLevel4Answer
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
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e] relative">
      {/* Logo in absolute top-left corner */}
      <Link to="/" className="absolute top-2 left-2 z-50">
        <img src="/pailiaq-logo-small.png" alt="Logo" className="w-12 h-12" />
      </Link>
        <header className="bg-black/20 backdrop-blur-md border-b border-white/10 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4 ml-16">
              <Link to="/chord-recognition" className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
                <span className="text-white text-sm font-bold">←</span>
              </Link>
              <h1 className="text-xl font-bold text-white">{config.name}</h1>
            </div>
            <CompactAuthButton />
          </div>
        </header>
        
        <main className="max-w-7xl mx-auto p-6">
          <div className="flex flex-col xl:flex-row gap-8 items-start justify-center min-h-[80vh]">
            {/* Main content */}
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-8 xl:w-1/3">
              <h2 className="text-3xl font-bold text-white mb-6">Ready to Start Level 4?</h2>
              <div className="text-lg text-white/80 mb-8 space-y-2">
                <p><strong>{config.totalProblems} problems</strong> to complete</p>
                <p>{config.description}</p>
                <p>Master the ultimate extended harmonies</p>
                <p>Need <strong>{config.passAccuracy}% accuracy</strong> to pass</p>
                <p>Average time must be under <strong>{config.passTime} seconds</strong></p>
              </div>
              <button
                onClick={startLevel}
                className={`px-12 py-4 ${config.buttonColor} text-white text-xl font-bold rounded-xl hover:${config.buttonHoverColor} transition-colors shadow-lg`}
              >
                Start Level 4
              </button>
            </div>

            {/* 13th Chord Examples */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 xl:w-2/3 max-h-[80vh] overflow-y-auto">
              <h3 className="text-2xl font-bold text-white mb-6 text-center">13th Chord Examples</h3>
              
              {/* Major 13th Example */}
              <div className="mb-8">
                <h4 className="text-lg font-bold text-white mb-4 text-center">Major 13th (Cmaj13)</h4>
                <div className="flex justify-center">
                  <div className="flex flex-col items-center">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2">
                      {(() => {
                        const midiNotes = [48, 52, 55, 59, 62, 65, 69]; // C3, E3, G3, B3, D4, F4, A4
                        const minNote = Math.min(...midiNotes);
                        const maxNote = Math.max(...midiNotes);
                        const low = minNote - 1;
                        const high = maxNote + 1;
                        const totalSemitones = high - low + 1;
                        const noteHeight = 6;
                        const containerHeight = totalSemitones * noteHeight;
                        return (
                          <div>
                            <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-1" style={{ width: '140px', height: `${containerHeight}px` }}>
                              <div className="flex h-full">
                                <div className="w-8 border-r border-gray-300 bg-white">
                                  {Array.from({ length: totalSemitones }, (_, j) => {
                                    const midiNote = high - j;
                                    const noteName = getMidiNoteName(midiNote);
                                    return (
                                      <div key={j} className="border-b border-gray-200 flex items-center justify-center text-xs" style={{ 
                                        height: `${noteHeight}px`,
                                        backgroundColor: isBlackKey(midiNote) ? '#6b7280' : '#ffffff',
                                        color: isBlackKey(midiNote) ? '#ffffff' : '#000000'
                                      }}>
                                        <span style={{ fontSize: '5px' }}>{noteName}</span>
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
                                      <div key={j} className="absolute rounded shadow-lg bg-pink-500" 
                                           style={{ left: '1px', top: `${position + 1}px`, width: '80px', height: `${noteHeight - 2}px` }}></div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                            <p className="text-xs text-white/70 text-center font-semibold">Root Position</p>
                            <p className="text-xs text-white/60 text-center">Cmaj13</p>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Dominant 13th Examples */}
              <div className="mb-8">
                <h4 className="text-lg font-bold text-white mb-4 text-center">Dominant 13th Variations</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Dom13 */}
                  <div className="flex flex-col items-center">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2">
                      {(() => {
                        const midiNotes = [48, 52, 55, 58, 62, 65, 69]; // C3, E3, G3, Bb3, D4, F4, A4
                        const minNote = Math.min(...midiNotes);
                        const maxNote = Math.max(...midiNotes);
                        const low = minNote - 1;
                        const high = maxNote + 1;
                        const totalSemitones = high - low + 1;
                        const noteHeight = 6;
                        const containerHeight = totalSemitones * noteHeight;
                        return (
                          <div>
                            <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-1" style={{ width: '120px', height: `${containerHeight}px` }}>
                              <div className="flex h-full">
                                <div className="w-6 border-r border-gray-300 bg-white">
                                  {Array.from({ length: totalSemitones }, (_, j) => {
                                    const midiNote = high - j;
                                    const noteName = getMidiNoteName(midiNote);
                                    return (
                                      <div key={j} className="border-b border-gray-200 flex items-center justify-center text-xs" style={{ 
                                        height: `${noteHeight}px`,
                                        backgroundColor: isBlackKey(midiNote) ? '#6b7280' : '#ffffff',
                                        color: isBlackKey(midiNote) ? '#ffffff' : '#000000'
                                      }}>
                                        <span style={{ fontSize: '4px' }}>{noteName}</span>
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
                                      <div key={j} className="absolute rounded shadow-lg bg-orange-500" 
                                           style={{ left: '1px', top: `${position + 1}px`, width: '60px', height: `${noteHeight - 2}px` }}></div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                            <p className="text-xs text-white/70 text-center font-semibold">C13</p>
                            <p className="text-xs text-white/60 text-center">Dominant</p>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Dom13b9 */}
                  <div className="flex flex-col items-center">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2">
                      {(() => {
                        const midiNotes = [48, 52, 55, 58, 61, 65, 69]; // C3, E3, G3, Bb3, Db4, F4, A4
                        const minNote = Math.min(...midiNotes);
                        const maxNote = Math.max(...midiNotes);
                        const low = minNote - 1;
                        const high = maxNote + 1;
                        const totalSemitones = high - low + 1;
                        const noteHeight = 6;
                        const containerHeight = totalSemitones * noteHeight;
                        return (
                          <div>
                            <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-1" style={{ width: '120px', height: `${containerHeight}px` }}>
                              <div className="flex h-full">
                                <div className="w-6 border-r border-gray-300 bg-white">
                                  {Array.from({ length: totalSemitones }, (_, j) => {
                                    const midiNote = high - j;
                                    const noteName = getMidiNoteName(midiNote);
                                    return (
                                      <div key={j} className="border-b border-gray-200 flex items-center justify-center text-xs" style={{ 
                                        height: `${noteHeight}px`,
                                        backgroundColor: isBlackKey(midiNote) ? '#6b7280' : '#ffffff',
                                        color: isBlackKey(midiNote) ? '#ffffff' : '#000000'
                                      }}>
                                        <span style={{ fontSize: '4px' }}>{noteName}</span>
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
                                      <div key={j} className="absolute rounded shadow-lg bg-red-500" 
                                           style={{ left: '1px', top: `${position + 1}px`, width: '60px', height: `${noteHeight - 2}px` }}></div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                            <p className="text-xs text-white/70 text-center font-semibold">C13♭9</p>
                            <p className="text-xs text-white/60 text-center">Altered</p>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Add Chord Examples */}
              <div className="mb-8">
                <h4 className="text-lg font-bold text-white mb-4 text-center">Add 13 Chords</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Add13 */}
                  <div className="flex flex-col items-center">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2">
                      {(() => {
                        const midiNotes = [48, 52, 55, 69]; // C3, E3, G3, A4
                        const minNote = Math.min(...midiNotes);
                        const maxNote = Math.max(...midiNotes);
                        const low = minNote - 1;
                        const high = maxNote + 1;
                        const totalSemitones = high - low + 1;
                        const noteHeight = 8;
                        const containerHeight = totalSemitones * noteHeight;
                        return (
                          <div>
                            <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-1" style={{ width: '100px', height: `${containerHeight}px` }}>
                              <div className="flex h-full">
                                <div className="w-6 border-r border-gray-300 bg-white">
                                  {Array.from({ length: totalSemitones }, (_, j) => {
                                    const midiNote = high - j;
                                    const noteName = getMidiNoteName(midiNote);
                                    return (
                                      <div key={j} className="border-b border-gray-200 flex items-center justify-center text-xs" style={{ 
                                        height: `${noteHeight}px`,
                                        backgroundColor: isBlackKey(midiNote) ? '#6b7280' : '#ffffff',
                                        color: isBlackKey(midiNote) ? '#ffffff' : '#000000'
                                      }}>
                                        <span style={{ fontSize: '5px' }}>{noteName}</span>
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
                                      <div key={j} className="absolute rounded shadow-lg bg-green-500" 
                                           style={{ left: '1px', top: `${position + 1}px`, width: '50px', height: `${noteHeight - 2}px` }}></div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                            <p className="text-xs text-white/70 text-center font-semibold">Cadd13</p>
                            <p className="text-xs text-white/60 text-center">No 7th</p>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Madd13 */}
                  <div className="flex flex-col items-center">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2">
                      {(() => {
                        const midiNotes = [48, 51, 55, 69]; // C3, Eb3, G3, A4
                        const minNote = Math.min(...midiNotes);
                        const maxNote = Math.max(...midiNotes);
                        const low = minNote - 1;
                        const high = maxNote + 1;
                        const totalSemitones = high - low + 1;
                        const noteHeight = 8;
                        const containerHeight = totalSemitones * noteHeight;
                        return (
                          <div>
                            <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-1" style={{ width: '100px', height: `${containerHeight}px` }}>
                              <div className="flex h-full">
                                <div className="w-6 border-r border-gray-300 bg-white">
                                  {Array.from({ length: totalSemitones }, (_, j) => {
                                    const midiNote = high - j;
                                    const noteName = getMidiNoteName(midiNote);
                                    return (
                                      <div key={j} className="border-b border-gray-200 flex items-center justify-center text-xs" style={{ 
                                        height: `${noteHeight}px`,
                                        backgroundColor: isBlackKey(midiNote) ? '#6b7280' : '#ffffff',
                                        color: isBlackKey(midiNote) ? '#ffffff' : '#000000'
                                      }}>
                                        <span style={{ fontSize: '5px' }}>{noteName}</span>
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
                                      <div key={j} className="absolute rounded shadow-lg bg-teal-500" 
                                           style={{ left: '1px', top: `${position + 1}px`, width: '50px', height: `${noteHeight - 2}px` }}></div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                            <p className="text-xs text-white/70 text-center font-semibold">Cmadd13</p>
                            <p className="text-xs text-white/60 text-center">Minor add</p>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Chord Theory Summary */}
              <div className="bg-white/10 rounded-lg p-4">
                <h4 className="text-lg font-bold text-white mb-3 text-center">13th Chord Theory</h4>
                <div className="text-sm text-white/80 space-y-2">
                  <p>• <strong>13th Chords:</strong> The ultimate extended harmony with all extensions (9th, 11th, 13th)</p>
                  <p>• <strong>Alterations:</strong> ♭9, ♯9, ♯11, ♭5 create sophisticated jazz colors</p>
                  <p>• <strong>Add Chords:</strong> Simple triads with added 13th (6th), no intermediate extensions</p>
                  <p>• <strong>Voicing:</strong> Often omit the 5th and/or 11th to avoid muddy sound</p>
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
    const passed = levelResult.passed;
    const accuracy = Math.round((levelResult.correctAnswers / config.totalProblems) * 100);
    const avgTime = (levelResult.totalTime / config.totalProblems).toFixed(2);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e] flex items-center justify-center">
        <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-12 max-w-2xl">
          <h2 className={`text-4xl font-bold mb-6 ${passed ? 'text-green-600' : 'text-red-600'}`}>
            {passed ? '🎉 Level Passed!' : '❌ Level Failed'}
          </h2>
          
          <div className="space-y-4 mb-8">
            <p className="text-2xl text-white">
              Score: {levelResult.correctAnswers}/{config.totalProblems}
            </p>
            <p className="text-xl text-white/80">
              Accuracy: {accuracy}% {accuracy >= config.passAccuracy ? '✓' : `(Need ${config.passAccuracy}%)`}
            </p>
            <p className="text-xl text-white/80">
              Avg Time: {avgTime}s {avgTime <= config.passTime ? '✓' : `(Need ${config.passTime}s)`}
            </p>
          </div>
          
          <div className="flex gap-4 justify-center">
            <Link
              to="/chord-recognition"
              className="px-6 py-3 bg-white/20 text-white font-semibold rounded-xl hover:bg-white/30 transition-colors"
            >
              Back to Levels
            </Link>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-pink-500 text-white font-semibold rounded-xl hover:bg-pink-600 transition-colors"
            >
              Try Again
            </button>
            <div className="px-6 py-3 bg-green-600/50 text-white font-semibold rounded-xl">
              🏆 All Levels Complete!
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Main game screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e] relative">
      {/* Logo in absolute top-left corner */}
      <Link to="/" className="absolute top-2 left-2 z-50">
        <img src="/pailiaq-logo-small.png" alt="Logo" className="w-12 h-12" />
      </Link>
      <header className="bg-black/20 backdrop-blur-md border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4 ml-16">
            <Link to="/chord-recognition" className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
              <span className="text-white text-sm font-bold">←</span>
            </Link>
            <h1 className="text-xl font-bold text-white">
              {config.name} - Problem {score.total}/{config.totalProblems}
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
                Identify this 13th chord
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
                  placeholder="Enter chord name (e.g., Cmaj13, C13♭9, Cadd13)"
                  className="w-full px-4 py-3 text-lg rounded-lg border-2 border-white/30 focus:border-pink-400 focus:outline-none bg-white/10 text-white placeholder-white/50"
                  readOnly={feedback && feedback.show}
                />
                
                <button
                  onClick={feedback && feedback.show && !feedback.isCorrect ? nextChord : handleSubmit}
                  disabled={!canSubmit && !(feedback && feedback.show && !feedback.isCorrect)}
                  className={`w-full py-3 px-6 font-semibold rounded-lg transition-colors ${
                    (canSubmit || (feedback && feedback.show && !feedback.isCorrect))
                      ? 'bg-pink-500 text-white hover:bg-pink-600'
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
                      <p>The correct answer was: {getChordNameWithEnharmonic(feedback.correctAnswer)}</p>
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
              
              <div className="mt-6 pt-6 border-t border-white/10">
                <h4 className="font-semibold text-white mb-2">Accepted Notations:</h4>
                <div className="text-sm text-white/70 space-y-1">
                  <p>• Cmaj13, CM13 (Major 13th)</p>
                  <p>• Cm13, Cmin13 (Minor 13th)</p>
                  <p>• C13, Cdom13 (Dominant 13th)</p>
                  <p>• Cmaj13#11 (Major 13 sharp 11)</p>
                  <p>• C13#11 (Dom 13 sharp 11)</p>
                  <p>• C13♭9 (Dom 13 flat 9)</p>
                  <p>• C13♯9 (Dom 13 sharp 9)</p>
                  <p>• Cadd13, Cadd6 (Add 13)</p>
                  <p>• Cmadd13, Cmadd6 (Minor add 13)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}