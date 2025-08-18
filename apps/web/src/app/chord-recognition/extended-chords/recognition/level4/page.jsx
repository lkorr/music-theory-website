/**
 * Extended Chords Level 4: 7th Chords with All Inversions
 * 
 * Refactored to use shared level system following the same pattern as basic triads
 */

import { Link } from "react-router";
import { useLevelState } from "../../../shared/hooks/useLevelState.js";
import { useLevelLogic } from "../../../shared/hooks/useLevelLogic.js";
import { getLevelConfig } from "../../shared/config/levelConfigs.js";
import { generateLevel4Chord, validateLevel4Answer } from "./level4Utils.js";
import { getMidiNoteName, isBlackKey } from "../../shared/chordLogic.js";
import ChordPianoDisplay from "../../../basic-triads/shared/ChordPianoDisplay.jsx";
import ScoreDisplay from "../../shared/ScoreDisplay.jsx";

export default function ExtendedLevel4Page() {
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
    canSubmit
  } = logic;
  
  // Start screen (when level hasn't been started yet)
  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F9D6E8] to-[#D8D6F9]">
        <header className="bg-white/10 backdrop-blur-md border-b border-white/20 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/chord-recognition/extended-chords" className="w-8 h-8 rounded-full bg-black flex items-center justify-center hover:bg-gray-800 transition-colors">
                <span className="text-white text-sm font-bold">←</span>
              </Link>
              <h1 className="text-xl font-bold text-black">{config.name}</h1>
            </div>
            <Link to="/" className="w-8 h-8 rounded-full bg-black flex items-center justify-center hover:bg-gray-800 transition-colors">
              <span className="text-white text-sm font-bold">♪</span>
            </Link>
          </div>
        </header>
        
        <main className="max-w-7xl mx-auto p-6">
          <div className="flex flex-col xl:flex-row gap-8 items-start justify-center min-h-[80vh]">
            {/* Main content */}
            <div className="text-center bg-white/20 backdrop-blur-sm rounded-2xl p-8 xl:w-1/3">
              <h2 className="text-3xl font-bold text-black mb-6">Ready to Start Level 4?</h2>
              <div className="text-lg text-black/80 mb-8 space-y-2">
                <p><strong>{config.totalProblems} problems</strong> to complete</p>
                <p>{config.description}</p>
                <p>Root, 1st, 2nd, and 3rd inversions</p>
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

            {/* Complete 7th Chord Inversions Legend */}
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 xl:w-2/3 max-h-[80vh] overflow-y-auto">
              <h3 className="text-2xl font-bold text-black mb-6 text-center">7th Chords - All Inversions</h3>
              
              {/* Major 7th Complete Example */}
              <div className="mb-6">
                <h4 className="text-lg font-bold text-black mb-3 text-center">Major 7th (Cmaj7)</h4>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                  {[
                    { name: 'Root', notation: 'Cmaj7', midiNotes: [60, 64, 67, 71] },
                    { name: '1st Inv', notation: 'Cmaj7/1', midiNotes: [64, 67, 71, 72] },
                    { name: '2nd Inv', notation: 'Cmaj7/2', midiNotes: [67, 71, 72, 76] },
                    { name: '3rd Inv', notation: 'Cmaj7/3', midiNotes: [71, 72, 76, 79] }
                  ].map((chord, i) => {
                    const minNote = Math.min(...chord.midiNotes);
                    const maxNote = Math.max(...chord.midiNotes);
                    const low = minNote - 1;
                    const high = maxNote + 1;
                    const totalSemitones = high - low + 1;
                    
                    return (
                      <div key={i} className="bg-white/30 rounded-lg p-2">
                        <h5 className="font-bold text-black mb-1 text-xs text-center">{chord.name}</h5>
                        <div className="flex justify-center mb-1">
                          <div className="bg-white rounded shadow-lg overflow-hidden" style={{ width: '100px', height: `${Math.max(60, totalSemitones * 5)}px` }}>
                            <div className="flex h-full">
                              <div className="w-8 border-r border-gray-300 bg-white">
                                {Array.from({ length: totalSemitones }, (_, j) => {
                                  const midiNote = high - j;
                                  const noteName = getMidiNoteName(midiNote);
                                  return (
                                    <div key={j} className="border-b border-gray-200 flex items-center justify-end pr-1 text-xs" style={{ 
                                      height: '5px',
                                      backgroundColor: isBlackKey(midiNote) ? '#6b7280' : '#ffffff',
                                      color: isBlackKey(midiNote) ? '#ffffff' : '#000000'
                                    }}>
                                      <span className="text-xs" style={{ fontSize: '4px' }}>{noteName}</span>
                                    </div>
                                  );
                                })}
                              </div>
                              <div className="flex-1 bg-gradient-to-r from-gray-50 to-gray-100 relative">
                                {Array.from({ length: totalSemitones }, (_, j) => (
                                  <div key={j} className="absolute left-0 right-0 border-b border-gray-200" style={{ top: `${j * 5}px` }} />
                                ))}
                                {chord.midiNotes.map((midiNote, j) => {
                                  const position = (high - midiNote) * 5;
                                  const isCNote = (midiNote % 12 === 0);
                                  return (
                                    <div key={j} className={`absolute rounded shadow-lg ${isCNote ? 'bg-red-500' : 'bg-blue-500'}`} 
                                         style={{ left: '2px', top: `${position + 1}px`, width: '60px', height: '3px' }}></div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-black/70 text-center" style={{ fontSize: '9px' }}>{chord.notation}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Minor 7th Complete Example */}
              <div className="mb-4">
                <h4 className="text-lg font-bold text-black mb-3 text-center">Minor 7th (Cm7)</h4>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                  {[
                    { name: 'Root', notation: 'Cm7', midiNotes: [60, 63, 67, 70] },
                    { name: '1st Inv', notation: 'Cm7/1', midiNotes: [63, 67, 70, 72] },
                    { name: '2nd Inv', notation: 'Cm7/2', midiNotes: [67, 70, 72, 75] },
                    { name: '3rd Inv', notation: 'Cm7/3', midiNotes: [70, 72, 75, 79] }
                  ].map((chord, i) => {
                    const minNote = Math.min(...chord.midiNotes);
                    const maxNote = Math.max(...chord.midiNotes);
                    const low = minNote - 1;
                    const high = maxNote + 1;
                    const totalSemitones = high - low + 1;
                    
                    return (
                      <div key={i} className="bg-white/30 rounded-lg p-2">
                        <h5 className="font-bold text-black mb-1 text-xs text-center">{chord.name}</h5>
                        <div className="flex justify-center mb-1">
                          <div className="bg-white rounded shadow-lg overflow-hidden" style={{ width: '100px', height: `${Math.max(60, totalSemitones * 5)}px` }}>
                            <div className="flex h-full">
                              <div className="w-8 border-r border-gray-300 bg-white">
                                {Array.from({ length: totalSemitones }, (_, j) => {
                                  const midiNote = high - j;
                                  const noteName = getMidiNoteName(midiNote);
                                  return (
                                    <div key={j} className="border-b border-gray-200 flex items-center justify-end pr-1 text-xs" style={{ 
                                      height: '5px',
                                      backgroundColor: isBlackKey(midiNote) ? '#6b7280' : '#ffffff',
                                      color: isBlackKey(midiNote) ? '#ffffff' : '#000000'
                                    }}>
                                      <span className="text-xs" style={{ fontSize: '4px' }}>{noteName}</span>
                                    </div>
                                  );
                                })}
                              </div>
                              <div className="flex-1 bg-gradient-to-r from-gray-50 to-gray-100 relative">
                                {Array.from({ length: totalSemitones }, (_, j) => (
                                  <div key={j} className="absolute left-0 right-0 border-b border-gray-200" style={{ top: `${j * 5}px` }} />
                                ))}
                                {chord.midiNotes.map((midiNote, j) => {
                                  const position = (high - midiNote) * 5;
                                  const isCNote = (midiNote % 12 === 0);
                                  return (
                                    <div key={j} className={`absolute rounded shadow-lg ${isCNote ? 'bg-red-500' : 'bg-blue-500'}`} 
                                         style={{ left: '2px', top: `${position + 1}px`, width: '60px', height: '3px' }}></div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-black/70 text-center" style={{ fontSize: '9px' }}>{chord.notation}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Dominant 7th Complete Example */}
              <div className="mb-4">
                <h4 className="text-lg font-bold text-black mb-3 text-center">Dominant 7th (C7)</h4>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                  {[
                    { name: 'Root', notation: 'C7', midiNotes: [60, 64, 67, 70] },
                    { name: '1st Inv', notation: 'C7/1', midiNotes: [64, 67, 70, 72] },
                    { name: '2nd Inv', notation: 'C7/2', midiNotes: [67, 70, 72, 76] },
                    { name: '3rd Inv', notation: 'C7/3', midiNotes: [70, 72, 76, 79] }
                  ].map((chord, i) => {
                    const minNote = Math.min(...chord.midiNotes);
                    const maxNote = Math.max(...chord.midiNotes);
                    const low = minNote - 1;
                    const high = maxNote + 1;
                    const totalSemitones = high - low + 1;
                    
                    return (
                      <div key={i} className="bg-white/30 rounded-lg p-2">
                        <h5 className="font-bold text-black mb-1 text-xs text-center">{chord.name}</h5>
                        <div className="flex justify-center mb-1">
                          <div className="bg-white rounded shadow-lg overflow-hidden" style={{ width: '100px', height: `${Math.max(60, totalSemitones * 5)}px` }}>
                            <div className="flex h-full">
                              <div className="w-8 border-r border-gray-300 bg-white">
                                {Array.from({ length: totalSemitones }, (_, j) => {
                                  const midiNote = high - j;
                                  const noteName = getMidiNoteName(midiNote);
                                  return (
                                    <div key={j} className="border-b border-gray-200 flex items-center justify-end pr-1 text-xs" style={{ 
                                      height: '5px',
                                      backgroundColor: isBlackKey(midiNote) ? '#6b7280' : '#ffffff',
                                      color: isBlackKey(midiNote) ? '#ffffff' : '#000000'
                                    }}>
                                      <span className="text-xs" style={{ fontSize: '4px' }}>{noteName}</span>
                                    </div>
                                  );
                                })}
                              </div>
                              <div className="flex-1 bg-gradient-to-r from-gray-50 to-gray-100 relative">
                                {Array.from({ length: totalSemitones }, (_, j) => (
                                  <div key={j} className="absolute left-0 right-0 border-b border-gray-200" style={{ top: `${j * 5}px` }} />
                                ))}
                                {chord.midiNotes.map((midiNote, j) => {
                                  const position = (high - midiNote) * 5;
                                  const isCNote = (midiNote % 12 === 0);
                                  return (
                                    <div key={j} className={`absolute rounded shadow-lg ${isCNote ? 'bg-red-500' : 'bg-blue-500'}`} 
                                         style={{ left: '2px', top: `${position + 1}px`, width: '60px', height: '3px' }}></div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-black/70 text-center" style={{ fontSize: '9px' }}>{chord.notation}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Diminished 7th Complete Example */}
              <div className="mb-4">
                <h4 className="text-lg font-bold text-black mb-3 text-center">Diminished 7th (Cdim7)</h4>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                  {[
                    { name: 'Root', notation: 'Cdim7', midiNotes: [60, 63, 66, 69] },
                    { name: '1st Inv', notation: 'Cdim7/1', midiNotes: [63, 66, 69, 72] },
                    { name: '2nd Inv', notation: 'Cdim7/2', midiNotes: [66, 69, 72, 75] },
                    { name: '3rd Inv', notation: 'Cdim7/3', midiNotes: [69, 72, 75, 78] }
                  ].map((chord, i) => {
                    const minNote = Math.min(...chord.midiNotes);
                    const maxNote = Math.max(...chord.midiNotes);
                    const low = minNote - 1;
                    const high = maxNote + 1;
                    const totalSemitones = high - low + 1;
                    
                    return (
                      <div key={i} className="bg-white/30 rounded-lg p-2">
                        <h5 className="font-bold text-black mb-1 text-xs text-center">{chord.name}</h5>
                        <div className="flex justify-center mb-1">
                          <div className="bg-white rounded shadow-lg overflow-hidden" style={{ width: '100px', height: `${Math.max(60, totalSemitones * 5)}px` }}>
                            <div className="flex h-full">
                              <div className="w-8 border-r border-gray-300 bg-white">
                                {Array.from({ length: totalSemitones }, (_, j) => {
                                  const midiNote = high - j;
                                  const noteName = getMidiNoteName(midiNote);
                                  return (
                                    <div key={j} className="border-b border-gray-200 flex items-center justify-end pr-1 text-xs" style={{ 
                                      height: '5px',
                                      backgroundColor: isBlackKey(midiNote) ? '#6b7280' : '#ffffff',
                                      color: isBlackKey(midiNote) ? '#ffffff' : '#000000'
                                    }}>
                                      <span className="text-xs" style={{ fontSize: '4px' }}>{noteName}</span>
                                    </div>
                                  );
                                })}
                              </div>
                              <div className="flex-1 bg-gradient-to-r from-gray-50 to-gray-100 relative">
                                {Array.from({ length: totalSemitones }, (_, j) => (
                                  <div key={j} className="absolute left-0 right-0 border-b border-gray-200" style={{ top: `${j * 5}px` }} />
                                ))}
                                {chord.midiNotes.map((midiNote, j) => {
                                  const position = (high - midiNote) * 5;
                                  const isCNote = (midiNote % 12 === 0);
                                  return (
                                    <div key={j} className={`absolute rounded shadow-lg ${isCNote ? 'bg-red-500' : 'bg-blue-500'}`} 
                                         style={{ left: '2px', top: `${position + 1}px`, width: '60px', height: '3px' }}></div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-black/70 text-center" style={{ fontSize: '9px' }}>{chord.notation}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Half Diminished 7th Complete Example */}
              <div className="mb-2">
                <h4 className="text-lg font-bold text-black mb-3 text-center">Half Diminished 7th (Cm7♭5)</h4>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                  {[
                    { name: 'Root', notation: 'Cm7♭5', midiNotes: [60, 63, 66, 70] },
                    { name: '1st Inv', notation: 'Cm7♭5/1', midiNotes: [63, 66, 70, 72] },
                    { name: '2nd Inv', notation: 'Cm7♭5/2', midiNotes: [66, 70, 72, 75] },
                    { name: '3rd Inv', notation: 'Cm7♭5/3', midiNotes: [70, 72, 75, 78] }
                  ].map((chord, i) => {
                    const minNote = Math.min(...chord.midiNotes);
                    const maxNote = Math.max(...chord.midiNotes);
                    const low = minNote - 1;
                    const high = maxNote + 1;
                    const totalSemitones = high - low + 1;
                    
                    return (
                      <div key={i} className="bg-white/30 rounded-lg p-2">
                        <h5 className="font-bold text-black mb-1 text-xs text-center">{chord.name}</h5>
                        <div className="flex justify-center mb-1">
                          <div className="bg-white rounded shadow-lg overflow-hidden" style={{ width: '100px', height: `${Math.max(60, totalSemitones * 5)}px` }}>
                            <div className="flex h-full">
                              <div className="w-8 border-r border-gray-300 bg-white">
                                {Array.from({ length: totalSemitones }, (_, j) => {
                                  const midiNote = high - j;
                                  const noteName = getMidiNoteName(midiNote);
                                  return (
                                    <div key={j} className="border-b border-gray-200 flex items-center justify-end pr-1 text-xs" style={{ 
                                      height: '5px',
                                      backgroundColor: isBlackKey(midiNote) ? '#6b7280' : '#ffffff',
                                      color: isBlackKey(midiNote) ? '#ffffff' : '#000000'
                                    }}>
                                      <span className="text-xs" style={{ fontSize: '4px' }}>{noteName}</span>
                                    </div>
                                  );
                                })}
                              </div>
                              <div className="flex-1 bg-gradient-to-r from-gray-50 to-gray-100 relative">
                                {Array.from({ length: totalSemitones }, (_, j) => (
                                  <div key={j} className="absolute left-0 right-0 border-b border-gray-200" style={{ top: `${j * 5}px` }} />
                                ))}
                                {chord.midiNotes.map((midiNote, j) => {
                                  const position = (high - midiNote) * 5;
                                  const isCNote = (midiNote % 12 === 0);
                                  return (
                                    <div key={j} className={`absolute rounded shadow-lg ${isCNote ? 'bg-red-500' : 'bg-blue-500'}`} 
                                         style={{ left: '2px', top: `${position + 1}px`, width: '60px', height: '3px' }}></div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-black/70 text-center" style={{ fontSize: '9px' }}>{chord.notation}</p>
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
      <div className="min-h-screen bg-gradient-to-br from-[#F9D6E8] to-[#D8D6F9] flex items-center justify-center p-6">
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-8 max-w-md w-full text-center">
          <h2 className="text-3xl font-bold text-black mb-6">
            Level {levelResult.passed ? 'Completed!' : 'Failed'}
          </h2>
          
          <div className="space-y-4 mb-8">
            <div className="flex justify-between">
              <span className="text-black/70">Accuracy:</span>
              <span className={`font-bold ${levelResult.accuracy >= config.passAccuracy ? 'text-green-600' : 'text-red-600'}`}>
                {levelResult.accuracy.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-black/70">Average Time:</span>
              <span className={`font-bold ${levelResult.avgTime <= config.passTime ? 'text-green-600' : 'text-red-600'}`}>
                {levelResult.avgTime.toFixed(1)}s
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-black/70">Score:</span>
              <span className="font-bold text-black">
                {levelResult.score.correct}/{levelResult.score.total}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {levelResult.passed && (
              <Link 
                to="/chord-recognition/extended-chords/recognition/level5"
                className={`block px-6 py-3 ${config.buttonColor} text-white font-semibold rounded-xl hover:${config.buttonHoverColor} transition-colors`}
              >
                Next Level (Open Voicings)
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
              to="/chord-recognition/extended-chords"
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
    <div className="min-h-screen bg-gradient-to-br from-[#F9D6E8] to-[#D8D6F9]">
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/chord-recognition/extended-chords" className="w-8 h-8 rounded-full bg-black flex items-center justify-center hover:bg-gray-800 transition-colors">
              <span className="text-white text-sm font-bold">←</span>
            </Link>
            <h1 className="text-xl font-bold text-black">{config.name}</h1>
          </div>
          <Link to="/" className="w-8 h-8 rounded-full bg-black flex items-center justify-center hover:bg-gray-800 transition-colors">
            <span className="text-white text-sm font-bold">♪</span>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        <ScoreDisplay 
          {...score} 
          currentTime={currentTime} 
          avgTime={avgTime} 
          isAnswered={state.isAnswered} 
          totalProblems={config.totalProblems} 
          progressColor={config.progressColor} 
        />
        
        <ChordPianoDisplay 
          notes={currentChord?.notes || []} 
          showLabels={showLabels} 
          setShowLabels={state.setShowLabels} 
          noteBlockColor="bg-blue-500"
          noteBorderColor="border-blue-600"
        />

        {/* Question section */}
        <div className="mt-6 text-center mb-8">
          <h2 className="text-2xl font-bold text-black mb-4">What 7th chord is this?</h2>
          <p className="text-black/70 mb-6">
            Type the 7th chord name with inversion (e.g., Cmaj7, Dm7/1, Dm7/F, G7/2, G7/D, Fdim7/3, Fdim7/A, Cm7♭5/1)
          </p>
        </div>

        {/* Input section */}
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-8 mb-6">
          <div className="max-w-md mx-auto">
            <input
              ref={inputRef}
              type="text"
              value={userAnswer}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Enter 7th chord name..."
              disabled={state.isAnswered}
              className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none text-center bg-white disabled:bg-gray-100"
            />
            
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={`w-full mt-4 px-6 py-3 text-lg font-semibold rounded-xl transition-colors ${
                canSubmit
                  ? `${config.buttonColor} hover:${config.buttonHoverColor} text-white`
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Submit Answer
            </button>
          </div>
        </div>

        {/* Feedback section */}
        {feedback && (
          <div className={`bg-white/20 backdrop-blur-sm rounded-2xl p-6 text-center ${
            feedback.isCorrect ? 'border-2 border-green-500' : 'border-2 border-red-500'
          }`}>
            <div className={`text-2xl font-bold mb-2 ${
              feedback.isCorrect ? 'text-green-600' : 'text-red-600'
            }`}>
              {feedback.isCorrect ? '✓ Correct!' : '✗ Incorrect'}
            </div>
            
            <div className="text-black/80 space-y-1">
              <p>Your answer: <span className="font-semibold">{feedback.userAnswer}</span></p>
              <p>Correct answer: <span className="font-semibold">{feedback.correctAnswer}</span></p>
              <p>Time: <span className="font-semibold">{feedback.timeTaken.toFixed(1)}s</span></p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}