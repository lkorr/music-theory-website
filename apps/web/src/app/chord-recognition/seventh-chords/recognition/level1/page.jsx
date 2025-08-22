/**
 * Extended Chords Level 1: 7th Chords with Inversions
 * 
 * Refactored to use shared level system following the same pattern as basic triads
 */

import { Link } from "react-router";
import { useLevelState } from "../../../shared/hooks/useLevelState.js";
import { useLevelLogic } from "../../../shared/hooks/useLevelLogic.js";
import { getLevelConfig } from "../../shared/config/levelConfigs.js";
import { generateLevel1Chord, validateLevel1Answer } from "./level1Utils.js";
import { getMidiNoteName, isBlackKey } from "../../shared/chordLogic.js";
import ChordPianoDisplay from "../../../basic-triads/shared/ChordPianoDisplay.jsx";
import { CompactAuthButton } from "../../../../../components/auth/AuthButton.jsx";

export default function ExtendedLevel1Page() {
  // Get level configuration
  const config = getLevelConfig('level1');
  
  // Initialize shared state
  const state = useLevelState();
  
  // Initialize shared logic
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
              <h2 className="text-3xl font-bold text-white mb-6">Ready to Start Level 1?</h2>
              <div className="text-lg text-white/80 mb-8 space-y-2">
                <p><strong>{config.totalProblems} problems</strong> to complete</p>
                <p>{config.description}</p>
                <p>Root position only - no inversions</p>
                <p>Need <strong>{config.passAccuracy}% accuracy</strong> to pass</p>
                <p>Average time must be under <strong>{config.passTime} seconds</strong></p>
              </div>
              <button
                onClick={startLevel}
                className={`px-12 py-4 ${config.buttonColor} text-white text-xl font-bold rounded-xl hover:${config.buttonHoverColor} transition-colors shadow-lg`}
              >
                Start Level 1
              </button>
            </div>

            {/* 7th Chord Types Legend */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 xl:w-2/3 max-h-[80vh] overflow-y-auto">
              <h3 className="text-2xl font-bold text-white mb-6 text-center">7th Chord Types (Root Position)</h3>
              
              {/* Major 7th Root Position */}
              <div className="mb-8">
                <h4 className="text-lg font-bold text-white mb-4 text-center">Major 7th (Cmaj7)</h4>
                <div className="grid grid-cols-1 lg:grid-cols-1 gap-3 max-w-md mx-auto">
                  {[
                    { name: 'Root Position', notation: 'Cmaj7', midiNotes: [60, 64, 67, 71] }, // C4, E4, G4, B4
                  ].map((chord, i) => {
                    // Use dynamic range: 1 note below lowest, 1 note above highest
                    const minNote = Math.min(...chord.midiNotes);
                    const maxNote = Math.max(...chord.midiNotes);
                    const low = minNote - 1;
                    const high = maxNote + 1;
                    const totalSemitones = high - low + 1;
                    
                    return (
                      <div key={i} className="bg-white/10 rounded-lg p-3">
                        <h5 className="font-bold text-white mb-2 text-sm text-center">{chord.name}</h5>
                        <div className="flex justify-center mb-2">
                          <div className="bg-white rounded shadow-lg overflow-hidden" style={{ width: '140px', height: `${Math.max(80, totalSemitones * 8)}px` }}>
                            <div className="flex h-full">
                              <div className="w-10 border-r border-gray-300 bg-white">
                                {Array.from({ length: totalSemitones }, (_, j) => {
                                  const midiNote = high - j;
                                  const noteName = getMidiNoteName(midiNote);
                                  return (
                                    <div key={j} className="border-b border-gray-200 flex items-center justify-end pr-1 text-xs" style={{ 
                                      height: '8px',
                                      backgroundColor: isBlackKey(midiNote) ? '#6b7280' : '#ffffff',
                                      color: isBlackKey(midiNote) ? '#ffffff' : '#000000'
                                    }}>
                                      <span className="text-xs" style={{ fontSize: '7px' }}>{noteName}</span>
                                    </div>
                                  );
                                })}
                              </div>
                              <div className="flex-1 bg-gradient-to-r from-gray-50 to-gray-100 relative">
                                {Array.from({ length: totalSemitones }, (_, j) => (
                                  <div key={j} className="absolute left-0 right-0 border-b border-gray-200" style={{ top: `${j * 8}px` }} />
                                ))}
                                {chord.midiNotes.map((midiNote, j) => {
                                  const position = (high - midiNote) * 8;
                                  const isCNote = (midiNote % 12 === 0); // C note is red
                                  return (
                                    <div key={j} className={`absolute rounded shadow-lg ${isCNote ? 'bg-red-500' : 'bg-blue-500'}`} 
                                         style={{ left: '4px', top: `${position + 1}px`, width: '80px', height: '6px' }}></div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-white/70 text-center">{chord.notation}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Minor 7th Root Position */}
              <div className="mb-8">
                <h4 className="text-lg font-bold text-white mb-4 text-center">Minor 7th (Cm7)</h4>
                <div className="grid grid-cols-1 lg:grid-cols-1 gap-3 max-w-md mx-auto">
                  {[
                    { name: 'Root Position', notation: 'Cm7', midiNotes: [60, 63, 67, 70] }, // C4, Eb4, G4, Bb4
                  ].map((chord, i) => {
                    const minNote = Math.min(...chord.midiNotes);
                    const maxNote = Math.max(...chord.midiNotes);
                    const low = minNote - 1;
                    const high = maxNote + 1;
                    const totalSemitones = high - low + 1;
                    
                    return (
                      <div key={i} className="bg-white/10 rounded-lg p-3">
                        <h5 className="font-bold text-white mb-2 text-sm text-center">{chord.name}</h5>
                        <div className="flex justify-center mb-2">
                          <div className="bg-white rounded shadow-lg overflow-hidden" style={{ width: '140px', height: `${Math.max(80, totalSemitones * 8)}px` }}>
                            <div className="flex h-full">
                              <div className="w-10 border-r border-gray-300 bg-white">
                                {Array.from({ length: totalSemitones }, (_, j) => {
                                  const midiNote = high - j;
                                  const noteName = getMidiNoteName(midiNote);
                                  return (
                                    <div key={j} className="border-b border-gray-200 flex items-center justify-end pr-1 text-xs" style={{ 
                                      height: '8px',
                                      backgroundColor: isBlackKey(midiNote) ? '#6b7280' : '#ffffff',
                                      color: isBlackKey(midiNote) ? '#ffffff' : '#000000'
                                    }}>
                                      <span className="text-xs" style={{ fontSize: '7px' }}>{noteName}</span>
                                    </div>
                                  );
                                })}
                              </div>
                              <div className="flex-1 bg-gradient-to-r from-gray-50 to-gray-100 relative">
                                {Array.from({ length: totalSemitones }, (_, j) => (
                                  <div key={j} className="absolute left-0 right-0 border-b border-gray-200" style={{ top: `${j * 8}px` }} />
                                ))}
                                {chord.midiNotes.map((midiNote, j) => {
                                  const position = (high - midiNote) * 8;
                                  const isCNote = (midiNote % 12 === 0);
                                  return (
                                    <div key={j} className={`absolute rounded shadow-lg ${isCNote ? 'bg-red-500' : 'bg-blue-500'}`} 
                                         style={{ left: '4px', top: `${position + 1}px`, width: '80px', height: '6px' }}></div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-white/70 text-center">{chord.notation}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Dominant 7th Root Position */}
              <div className="mb-8">
                <h4 className="text-lg font-bold text-white mb-4 text-center">Dominant 7th (C7)</h4>
                <div className="grid grid-cols-1 lg:grid-cols-1 gap-3 max-w-md mx-auto">
                  {[
                    { name: 'Root Position', notation: 'C7', midiNotes: [60, 64, 67, 70] }, // C4, E4, G4, Bb4
                  ].map((chord, i) => {
                    const minNote = Math.min(...chord.midiNotes);
                    const maxNote = Math.max(...chord.midiNotes);
                    const low = minNote - 1;
                    const high = maxNote + 1;
                    const totalSemitones = high - low + 1;
                    
                    return (
                      <div key={i} className="bg-white/10 rounded-lg p-3">
                        <h5 className="font-bold text-white mb-2 text-sm text-center">{chord.name}</h5>
                        <div className="flex justify-center mb-2">
                          <div className="bg-white rounded shadow-lg overflow-hidden" style={{ width: '140px', height: `${Math.max(80, totalSemitones * 8)}px` }}>
                            <div className="flex h-full">
                              <div className="w-10 border-r border-gray-300 bg-white">
                                {Array.from({ length: totalSemitones }, (_, j) => {
                                  const midiNote = high - j;
                                  const noteName = getMidiNoteName(midiNote);
                                  return (
                                    <div key={j} className="border-b border-gray-200 flex items-center justify-end pr-1 text-xs" style={{ 
                                      height: '8px',
                                      backgroundColor: isBlackKey(midiNote) ? '#6b7280' : '#ffffff',
                                      color: isBlackKey(midiNote) ? '#ffffff' : '#000000'
                                    }}>
                                      <span className="text-xs" style={{ fontSize: '7px' }}>{noteName}</span>
                                    </div>
                                  );
                                })}
                              </div>
                              <div className="flex-1 bg-gradient-to-r from-gray-50 to-gray-100 relative">
                                {Array.from({ length: totalSemitones }, (_, j) => (
                                  <div key={j} className="absolute left-0 right-0 border-b border-gray-200" style={{ top: `${j * 8}px` }} />
                                ))}
                                {chord.midiNotes.map((midiNote, j) => {
                                  const position = (high - midiNote) * 8;
                                  const isCNote = (midiNote % 12 === 0);
                                  return (
                                    <div key={j} className={`absolute rounded shadow-lg ${isCNote ? 'bg-red-500' : 'bg-blue-500'}`} 
                                         style={{ left: '4px', top: `${position + 1}px`, width: '80px', height: '6px' }}></div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-white/70 text-center">{chord.notation}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Diminished 7th Root Position */}
              <div className="mb-8">
                <h4 className="text-lg font-bold text-white mb-4 text-center">Diminished 7th (Cdim7)</h4>
                <div className="grid grid-cols-1 lg:grid-cols-1 gap-3 max-w-md mx-auto">
                  {[
                    { name: 'Root Position', notation: 'Cdim7', midiNotes: [60, 63, 66, 69] }, // C4, Eb4, Gb4, A4
                  ].map((chord, i) => {
                    const minNote = Math.min(...chord.midiNotes);
                    const maxNote = Math.max(...chord.midiNotes);
                    const low = minNote - 1;
                    const high = maxNote + 1;
                    const totalSemitones = high - low + 1;
                    
                    return (
                      <div key={i} className="bg-white/10 rounded-lg p-3">
                        <h5 className="font-bold text-white mb-2 text-sm text-center">{chord.name}</h5>
                        <div className="flex justify-center mb-2">
                          <div className="bg-white rounded shadow-lg overflow-hidden" style={{ width: '140px', height: `${Math.max(80, totalSemitones * 8)}px` }}>
                            <div className="flex h-full">
                              <div className="w-10 border-r border-gray-300 bg-white">
                                {Array.from({ length: totalSemitones }, (_, j) => {
                                  const midiNote = high - j;
                                  const noteName = getMidiNoteName(midiNote);
                                  return (
                                    <div key={j} className="border-b border-gray-200 flex items-center justify-end pr-1 text-xs" style={{ 
                                      height: '8px',
                                      backgroundColor: isBlackKey(midiNote) ? '#6b7280' : '#ffffff',
                                      color: isBlackKey(midiNote) ? '#ffffff' : '#000000'
                                    }}>
                                      <span className="text-xs" style={{ fontSize: '7px' }}>{noteName}</span>
                                    </div>
                                  );
                                })}
                              </div>
                              <div className="flex-1 bg-gradient-to-r from-gray-50 to-gray-100 relative">
                                {Array.from({ length: totalSemitones }, (_, j) => (
                                  <div key={j} className="absolute left-0 right-0 border-b border-gray-200" style={{ top: `${j * 8}px` }} />
                                ))}
                                {chord.midiNotes.map((midiNote, j) => {
                                  const position = (high - midiNote) * 8;
                                  const isCNote = (midiNote % 12 === 0);
                                  return (
                                    <div key={j} className={`absolute rounded shadow-lg ${isCNote ? 'bg-red-500' : 'bg-blue-500'}`} 
                                         style={{ left: '4px', top: `${position + 1}px`, width: '80px', height: '6px' }}></div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-white/70 text-center">{chord.notation}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Half Diminished 7th Root Position */}
              <div className="mb-6">
                <h4 className="text-lg font-bold text-white mb-4 text-center">Half Diminished 7th (Cm7♭5)</h4>
                <div className="grid grid-cols-1 lg:grid-cols-1 gap-3 max-w-md mx-auto">
                  {[
                    { name: 'Root Position', notation: 'Cm7♭5', midiNotes: [60, 63, 66, 70] }, // C4, Eb4, Gb4, Bb4
                  ].map((chord, i) => {
                    const minNote = Math.min(...chord.midiNotes);
                    const maxNote = Math.max(...chord.midiNotes);
                    const low = minNote - 1;
                    const high = maxNote + 1;
                    const totalSemitones = high - low + 1;
                    
                    return (
                      <div key={i} className="bg-white/10 rounded-lg p-3">
                        <h5 className="font-bold text-white mb-2 text-sm text-center">{chord.name}</h5>
                        <div className="flex justify-center mb-2">
                          <div className="bg-white rounded shadow-lg overflow-hidden" style={{ width: '140px', height: `${Math.max(80, totalSemitones * 8)}px` }}>
                            <div className="flex h-full">
                              <div className="w-10 border-r border-gray-300 bg-white">
                                {Array.from({ length: totalSemitones }, (_, j) => {
                                  const midiNote = high - j;
                                  const noteName = getMidiNoteName(midiNote);
                                  return (
                                    <div key={j} className="border-b border-gray-200 flex items-center justify-end pr-1 text-xs" style={{ 
                                      height: '8px',
                                      backgroundColor: isBlackKey(midiNote) ? '#6b7280' : '#ffffff',
                                      color: isBlackKey(midiNote) ? '#ffffff' : '#000000'
                                    }}>
                                      <span className="text-xs" style={{ fontSize: '7px' }}>{noteName}</span>
                                    </div>
                                  );
                                })}
                              </div>
                              <div className="flex-1 bg-gradient-to-r from-gray-50 to-gray-100 relative">
                                {Array.from({ length: totalSemitones }, (_, j) => (
                                  <div key={j} className="absolute left-0 right-0 border-b border-gray-200" style={{ top: `${j * 8}px` }} />
                                ))}
                                {chord.midiNotes.map((midiNote, j) => {
                                  const position = (high - midiNote) * 8;
                                  const isCNote = (midiNote % 12 === 0);
                                  return (
                                    <div key={j} className={`absolute rounded shadow-lg ${isCNote ? 'bg-red-500' : 'bg-blue-500'}`} 
                                         style={{ left: '4px', top: `${position + 1}px`, width: '80px', height: '6px' }}></div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-white/70 text-center">{chord.notation}</p>
                      </div>
                    );
                  })}
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
                to="/chord-recognition/seventh-chords/recognition/level2"
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
              to="/chord-recognition"
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
              Time: {currentTime.toFixed(1)}s
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
                Identify this 7th chord
              </h2>
              
              {/* Piano Display */}
              {currentChord && (
                <div className="mb-8">
                  <ChordPianoDisplay 
                    notes={currentChord.notes} 
                    showLabels={showLabels}
                    setShowLabels={(value) => state.setShowLabels(value)}
                    noteBlockColor="bg-blue-500"
                    noteBorderColor="border-blue-600"
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
                  placeholder="Enter 7th chord name (e.g., Cmaj7, Dm7, G7, Fdim7, Cm7♭5)"
                  className="w-full px-4 py-3 text-lg rounded-lg border-2 border-black/20 focus:border-blue-600 focus:outline-none bg-white/50"
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
                  <span className="font-semibold text-white">{avgTime}s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Progress:</span>
                  <span className="font-semibold text-white">
                    {score.total}/{config.totalProblems}
                  </span>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-black/10">
                <h4 className="font-semibold text-white mb-2">7th Chord Types:</h4>
                <div className="text-sm text-white/70 space-y-1">
                  <p>• <strong>Major 7th:</strong> Cmaj7, CM7, CΔ7</p>
                  <p>• <strong>Minor 7th:</strong> Cm7, Cmin7, C-7</p>
                  <p>• <strong>Dominant 7th:</strong> C7, Cdom7</p>
                  <p>• <strong>Half Diminished:</strong> Cm7♭5, Cø7</p>
                  <p>• <strong>Diminished 7th:</strong> Cdim7, C°7</p>
                </div>
                
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}