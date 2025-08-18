/**
 * Level 2: Triads with First Inversions
 * 
 * Refactored to use shared level system
 */

import { Link } from "react-router";
import { useLevelState } from "../../../shared/hooks/useLevelState.js";
import { useLevelLogic } from "../../../shared/hooks/useLevelLogic.js";
import { getLevelConfig } from "../../../shared/config/levelConfigs.js";
import { generateLevel2Chord, validateLevel2Answer } from "./level2Utils.js";
import { getMidiNoteName, isBlackKey } from "../../shared/chordLogic.js";
import ChordPianoDisplay from "../../shared/ChordPianoDisplay.jsx";
import ScoreDisplay from "../../shared/ScoreDisplay.jsx";

export default function Level2Page() {
  // Get level configuration
  const config = getLevelConfig('level2');
  
  // Initialize shared state
  const state = useLevelState();
  
  // Initialize shared logic
  const logic = useLevelLogic(state, config, {
    generateChord: generateLevel2Chord,
    validateAnswer: validateLevel2Answer
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
      <div className="min-h-screen bg-gradient-to-br from-[#E8F9F6] to-[#CAE9FF]">
        <header className="bg-white/10 backdrop-blur-md border-b border-white/20 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/chord-recognition/basic-triads" className="w-8 h-8 rounded-full bg-black flex items-center justify-center hover:bg-gray-800 transition-colors">
                <span className="text-white text-sm font-bold">←</span>
              </Link>
              <h1 className="text-xl font-bold text-black">{config.title}</h1>
            </div>
            <Link to="/" className="w-8 h-8 rounded-full bg-black flex items-center justify-center hover:bg-gray-800 transition-colors">
              <span className="text-white text-sm font-bold">♪</span>
            </Link>
          </div>
        </header>
        
        <main className="max-w-6xl mx-auto p-6">
          <div className="flex flex-col lg:flex-row gap-8 items-start justify-center min-h-[80vh]">
            {/* Main content */}
            <div className="text-center bg-white/20 backdrop-blur-sm rounded-2xl p-8 lg:w-1/2">
              <h2 className="text-3xl font-bold text-black mb-6">Ready to Start Level 2?</h2>
              <div className="text-lg text-black/80 mb-8 space-y-2">
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

            {/* Chord Legend with Inversions */}
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 lg:w-1/2">
              <h3 className="text-2xl font-bold text-black mb-6 text-center">First Inversions</h3>
              <div className="space-y-4">
                {/* Major Triad Row */}
                <div className="bg-white/30 rounded-xl p-4">
                  <h4 className="font-bold text-black mb-3 text-center">Major Triads</h4>
                  <div className="flex justify-center gap-4">
                    {/* Root Position */}
                    <div className="text-center">
                      <div className="mb-2">
                        {(() => {
                          const midiNotes = [60, 64, 67]; // C4, E4, G4
                          const minNote = Math.min(...midiNotes);
                          const maxNote = Math.max(...midiNotes);
                          const low = minNote - 1;
                          const high = maxNote + 1;
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
                                    const isCNote = (midiNote % 12 === 0);
                                    return (
                                      <div key={j} className={`absolute rounded shadow-lg ${isCNote ? 'bg-red-500' : 'bg-blue-500'}`} 
                                           style={{ left: '2px', top: `${position + 1}px`, width: '60px', height: `${noteHeight - 2}px` }}></div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                      <p className="text-xs text-black/70">C (Root)</p>
                    </div>
                    {/* First Inversion */}
                    <div className="text-center">
                      <div className="mb-2">
                        {(() => {
                          const midiNotes = [64, 67, 72]; // E4, G4, C5
                          const minNote = Math.min(...midiNotes);
                          const maxNote = Math.max(...midiNotes);
                          const low = minNote - 1;
                          const high = maxNote + 1;
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
                                    const isCNote = (midiNote % 12 === 0);
                                    return (
                                      <div key={j} className={`absolute rounded shadow-lg ${isCNote ? 'bg-red-500' : 'bg-blue-500'}`} 
                                           style={{ left: '2px', top: `${position + 1}px`, width: '60px', height: `${noteHeight - 2}px` }}></div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                      <p className="text-xs text-black/70">C/1 (1st inv)</p>
                    </div>
                  </div>
                </div>
                {/* Minor Triad Row */}
                <div className="bg-white/30 rounded-xl p-4">
                  <h4 className="font-bold text-black mb-3 text-center">Minor Triads</h4>
                  <div className="flex justify-center gap-4">
                    {/* Root Position */}
                    <div className="text-center">
                      <div className="mb-2">
                        {(() => {
                          const midiNotes = [62, 65, 69]; // D4, F4, A4
                          const minNote = Math.min(...midiNotes);
                          const maxNote = Math.max(...midiNotes);
                          const low = minNote - 1;
                          const high = maxNote + 1;
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
                                    const isDNote = (midiNote % 12 === 2);
                                    return (
                                      <div key={j} className={`absolute rounded shadow-lg ${isDNote ? 'bg-red-500' : 'bg-blue-500'}`} 
                                           style={{ left: '2px', top: `${position + 1}px`, width: '60px', height: `${noteHeight - 2}px` }}></div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                      <p className="text-xs text-black/70">Dm (Root)</p>
                    </div>
                    {/* First Inversion */}
                    <div className="text-center">
                      <div className="mb-2">
                        {(() => {
                          const midiNotes = [65, 69, 74]; // F4, A4, D5
                          const minNote = Math.min(...midiNotes);
                          const maxNote = Math.max(...midiNotes);
                          const low = minNote - 1;
                          const high = maxNote + 1;
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
                                    const isDNote = (midiNote % 12 === 2);
                                    return (
                                      <div key={j} className={`absolute rounded shadow-lg ${isDNote ? 'bg-red-500' : 'bg-blue-500'}`} 
                                           style={{ left: '2px', top: `${position + 1}px`, width: '60px', height: `${noteHeight - 2}px` }}></div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                      <p className="text-xs text-black/70">Dm/1 (1st inv)</p>
                    </div>
                  </div>
                </div>
                {/* Diminished Triad Row */}
                <div className="bg-white/30 rounded-xl p-4">
                  <h4 className="font-bold text-black mb-3 text-center">Diminished Triads</h4>
                  <div className="flex justify-center gap-4">
                    {/* Root Position */}
                    <div className="text-center">
                      <div className="mb-2">
                        {(() => {
                          const midiNotes = [59, 62, 65]; // B3, D4, F4
                          const minNote = Math.min(...midiNotes);
                          const maxNote = Math.max(...midiNotes);
                          const low = minNote - 1;
                          const high = maxNote + 1;
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
                                    const isBNote = (midiNote % 12 === 11);
                                    return (
                                      <div key={j} className={`absolute rounded shadow-lg ${isBNote ? 'bg-red-500' : 'bg-blue-500'}`} 
                                           style={{ left: '2px', top: `${position + 1}px`, width: '60px', height: `${noteHeight - 2}px` }}></div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                      <p className="text-xs text-black/70">Bdim (Root)</p>
                    </div>
                    {/* First Inversion */}
                    <div className="text-center">
                      <div className="mb-2">
                        {(() => {
                          const midiNotes = [62, 65, 71]; // D4, F4, B4
                          const minNote = Math.min(...midiNotes);
                          const maxNote = Math.max(...midiNotes);
                          const low = minNote - 1;
                          const high = maxNote + 1;
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
                                    const isBNote = (midiNote % 12 === 11);
                                    return (
                                      <div key={j} className={`absolute rounded shadow-lg ${isBNote ? 'bg-red-500' : 'bg-blue-500'}`} 
                                           style={{ left: '2px', top: `${position + 1}px`, width: '60px', height: `${noteHeight - 2}px` }}></div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                      <p className="text-xs text-black/70">Bdim/1 (1st inv)</p>
                    </div>
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
      <div className="min-h-screen bg-gradient-to-br from-[#E8F9F6] to-[#CAE9FF] flex items-center justify-center p-6">
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
                to="/chord-recognition/basic-triads/recognition/level3"
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
    <div className="min-h-screen bg-gradient-to-br from-[#E8F9F6] to-[#CAE9FF]">
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/chord-recognition/basic-triads" className="w-8 h-8 rounded-full bg-black flex items-center justify-center hover:bg-gray-800 transition-colors">
              <span className="text-white text-sm font-bold">←</span>
            </Link>
            <h1 className="text-xl font-bold text-black">{config.title}</h1>
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
          <h2 className="text-2xl font-bold text-black mb-4">What chord is this?</h2>
          <p className="text-black/70 mb-6">
            Include inversions (e.g., C/1 for first inversion, Dm for root position)
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
              placeholder="Enter chord name..."
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