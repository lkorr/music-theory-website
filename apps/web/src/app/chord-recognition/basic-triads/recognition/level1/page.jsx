import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router";
import { noteNames, chordTypes } from "../../shared/chordLogic.js";
import { useTimer, createHandleKeyPress } from "../../shared/levelHooks.js";
import ChordPianoDisplay from "../../shared/ChordPianoDisplay.jsx";
import ScoreDisplay from "../../shared/ScoreDisplay.jsx";



export default function Level1Page() {
  const [currentChord, setCurrentChord] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState({ correct: 0, total: 0, streak: 0 });
  const [isAnswered, setIsAnswered] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [avgTime, setAvgTime] = useState(0);
  const [showLabels, setShowLabels] = useState(true);
  const [totalTime, setTotalTime] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [levelResult, setLevelResult] = useState(null);
  const inputRef = useRef(null);
  const timerRef = useRef(null);
  
  const TOTAL_PROBLEMS = 30;
  const PASS_ACCURACY = 90; // 90%
  const PASS_TIME = 5; // 5 seconds

  // Generate a random chord with duplicate prevention
  const generateChord = useCallback((previousChord = null) => {
    const roots = ['C', 'D', 'E', 'F', 'G', 'A', 'B']; // Natural notes only
    const chordTypeKeys = ['major', 'minor', 'diminished', 'augmented'];
    
    let root, chordType, attempt = 0;
    
    // Prevent exact same chord appearing twice in a row
    do {
      root = roots[Math.floor(Math.random() * roots.length)];
      chordType = chordTypeKeys[Math.floor(Math.random() * chordTypeKeys.length)];
      attempt++;
      
      // If we've tried many times, just accept any different combination
      if (attempt > 20) break;
      
    } while (previousChord && 
             previousChord.root === root && 
             previousChord.chordType === chordType);
    
    // Choose a random octave from 2, 3, or 4 (C2=36, C3=48, C4=60)
    const possibleOctaves = [36, 48, 60]; // C2, C3, C4
    const baseOctave = possibleOctaves[Math.floor(Math.random() * possibleOctaves.length)];
    
    // Build the chord from the chosen root and octave
    const rootNoteNumber = noteNames.indexOf(root);
    const baseRoot = rootNoteNumber + baseOctave;
    const intervals = chordTypes[chordType].intervals;
    const notes = intervals.map(interval => baseRoot + interval);
    
    const expectedAnswer = root + chordTypes[chordType].symbol;
    
    return {
      root,
      chordType,
      notes,
      expectedAnswer,
      intervals
    };
  }, []);

  const startLevel = () => {
    setHasStarted(true);
    setCurrentChord(generateChord(currentChord));
    // Start timer for first problem
    const now = Date.now();
    setStartTime(now);
    setCurrentTime(0);
    // Focus the input after a brief delay
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  };

  const nextChord = () => {
    setCurrentChord(generateChord(currentChord));
    setUserAnswer('');
    setFeedback(null);
    setIsAnswered(false);
    // Start timer for new problem
    const now = Date.now();
    setStartTime(now);
    setCurrentTime(0);
    // Focus the input after a brief delay to ensure DOM is updated
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 50);
  };

  // Don't auto-start anymore - wait for start button
  
  // Real-time timer update
  useTimer(startTime, isAnswered, setCurrentTime, timerRef);

  // Validate answer
  const validateAnswer = (answer, expectedAnswer) => {
    const normalizeAnswer = (str) => str.toLowerCase().replace(/\s+/g, '');
    
    const normalized = normalizeAnswer(answer);
    const expectedNormalized = normalizeAnswer(expectedAnswer);
    
    // Extract root note and chord type from expected answer
    const rootNote = expectedAnswer.match(/^[A-G][#b]?/)?.[0] || '';
    const chordTypePart = expectedAnswer.replace(rootNote, '').toLowerCase();
    
    // Generate all acceptable formats for this chord
    const acceptableAnswers = new Set();
    
    // Add the exact expected answer
    acceptableAnswers.add(expectedNormalized);
    
    // Major chord variations
    if (chordTypePart === '' || chordTypePart === 'maj' || chordTypePart === 'major') {
      acceptableAnswers.add(normalizeAnswer(rootNote)); // Just "C"
      acceptableAnswers.add(normalizeAnswer(rootNote + 'maj')); // "Cmaj"
      acceptableAnswers.add(normalizeAnswer(rootNote + 'major')); // "Cmajor"
      acceptableAnswers.add(normalizeAnswer(rootNote + 'M')); // "CM"
    }
    
    // Minor chord variations  
    if (chordTypePart === 'm' || chordTypePart === 'min' || chordTypePart === 'minor') {
      acceptableAnswers.add(normalizeAnswer(rootNote + 'm')); // "Cm"
      acceptableAnswers.add(normalizeAnswer(rootNote + 'min')); // "Cmin"
      acceptableAnswers.add(normalizeAnswer(rootNote + 'minor')); // "Cminor"
    }
    
    // Diminished chord variations
    if (chordTypePart === 'dim' || chordTypePart === 'diminished') {
      acceptableAnswers.add(normalizeAnswer(rootNote + 'dim')); // "Cdim"
      acceptableAnswers.add(normalizeAnswer(rootNote + 'diminished')); // "Cdiminished"
      acceptableAnswers.add(normalizeAnswer(rootNote + '°')); // "C°"
    }
    
    // Augmented chord variations
    if (chordTypePart === 'aug' || chordTypePart === 'augmented') {
      acceptableAnswers.add(normalizeAnswer(rootNote + 'aug')); // "Caug"
      acceptableAnswers.add(normalizeAnswer(rootNote + 'augmented')); // "Caugmented"
      acceptableAnswers.add(normalizeAnswer(rootNote + '+')); // "C+"
    }
    
    return acceptableAnswers.has(normalized);
  };

  const handleSubmit = () => {
    if (!currentChord || !userAnswer.trim() || !startTime) return;
    
    // Calculate time taken for this problem
    const endTime = Date.now();
    const timeTaken = (endTime - startTime) / 1000; // Convert to seconds
    
    const isCorrect = validateAnswer(userAnswer, currentChord.expectedAnswer);
    
    setFeedback({
      isCorrect,
      correctAnswer: currentChord.expectedAnswer,
      userAnswer: userAnswer.trim(),
      timeTaken: timeTaken
    });
    
    setScore(prev => {
      const newTotal = prev.total + 1;
      const newTotalTime = totalTime + timeTaken;
      setTotalTime(newTotalTime);
      setAvgTime(newTotalTime / newTotal);
      
      const newScore = {
        correct: prev.correct + (isCorrect ? 1 : 0),
        total: newTotal,
        streak: isCorrect ? prev.streak + 1 : 0
      };
      
      // Check if level is completed
      if (newTotal >= TOTAL_PROBLEMS) {
        const finalAccuracy = (newScore.correct / newTotal) * 100;
        const finalAvgTime = newTotalTime / newTotal;
        const passed = finalAccuracy >= PASS_ACCURACY && finalAvgTime <= PASS_TIME;
        
        setLevelResult({
          passed,
          accuracy: finalAccuracy,
          avgTime: finalAvgTime,
          score: newScore
        });
        setIsCompleted(true);
      }
      
      return newScore;
    });
    
    setIsAnswered(true);
    
    // Auto-advance: 0.5 seconds if correct, 4 seconds if incorrect
    const delay = isCorrect ? 500 : 4000;
    setTimeout(() => {
      if (score.total + 1 < TOTAL_PROBLEMS) {
        nextChord();
      }
    }, delay);
  };

  const handleKeyPress = createHandleKeyPress(handleSubmit, isAnswered);

  // Start screen
  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F9D6E8] to-[#D8D6F9]">
        <header className="bg-white/10 backdrop-blur-md border-b border-white/20 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/chord-recognition/basic-triads" className="w-8 h-8 rounded-full bg-black flex items-center justify-center hover:bg-gray-800 transition-colors">
                <span className="text-white text-sm font-bold">←</span>
              </Link>
              <h1 className="text-xl font-bold text-black">
                Level 1: Basic Triads
              </h1>
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
              <h2 className="text-3xl font-bold text-black mb-6">Ready to Start Level 1?</h2>
              <div className="text-lg text-black/80 mb-8 space-y-2">
                <p><strong>{TOTAL_PROBLEMS} problems</strong> to complete</p>
                <p>Identify basic triads (Major, Minor, Diminished, Augmented)</p>
                <p>Need <strong>{PASS_ACCURACY}% accuracy</strong> to pass</p>
                <p>Average time must be under <strong>{PASS_TIME} seconds</strong></p>
              </div>
              <button
                onClick={startLevel}
                className="px-12 py-4 bg-green-500 text-white text-xl font-bold rounded-xl hover:bg-green-600 transition-colors shadow-lg"
              >
                Start Level 1
              </button>
            </div>

            {/* Chord Legend */}
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 lg:w-1/2">
              <h3 className="text-2xl font-bold text-black mb-6 text-center">Basic Triad Types</h3>
              <div className="space-y-4">
                {/* Major Triad */}
                <div className="bg-white/30 rounded-xl p-4">
                  <h4 className="font-bold text-black mb-3">Major (C)</h4>
                  <div className="flex justify-center">
                    {(() => {
                      const midiNotes = [60, 64, 67]; // C4, E4, G4
                      const minNote = Math.min(...midiNotes);
                      const maxNote = Math.max(...midiNotes);
                      const low = minNote - 1;
                      const high = maxNote + 1;
                      const totalSemitones = high - low + 1;
                      const getMidiNoteName = (midi) => {
                        const notes = ["C","C# / Db","D","D# / Eb","E","F","F# / Gb","G","G# / Ab","A","A# / Bb","B"];
                        const octave = Math.floor(midi / 12) - 1;
                        return notes[midi % 12] + octave;
                      };
                      const isBlackKey = (midi) => [1, 3, 6, 8, 10].includes(midi % 12);
                      
                      return (
                        <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ width: '160px', height: `${Math.max(60, totalSemitones * 10)}px` }}>
                          <div className="flex h-full">
                            <div className="w-12 border-r-2 border-gray-300 bg-white">
                              {Array.from({ length: totalSemitones }, (_, j) => {
                                const midiNote = high - j;
                                const noteName = getMidiNoteName(midiNote);
                                return (
                                  <div key={j} className="border-b border-gray-200 flex items-center justify-end pr-1 text-xs" style={{ 
                                    height: '10px',
                                    backgroundColor: isBlackKey(midiNote) ? '#6b7280' : '#ffffff',
                                    color: isBlackKey(midiNote) ? '#ffffff' : '#000000'
                                  }}>
                                    <span className="text-xs" style={{ fontSize: '8px' }}>{noteName}</span>
                                  </div>
                                );
                              })}
                            </div>
                            <div className="flex-1 bg-gradient-to-r from-gray-50 to-gray-100 relative">
                              {Array.from({ length: totalSemitones }, (_, j) => (
                                <div key={j} className="absolute left-0 right-0 border-b border-gray-200" style={{ top: `${j * 10}px` }} />
                              ))}
                              {midiNotes.map((midiNote, j) => {
                                const position = (high - midiNote) * 10;
                                const isCNote = (midiNote % 12 === 0);
                                return (
                                  <div key={j} className={`absolute rounded shadow-lg ${isCNote ? 'bg-red-500' : 'bg-blue-500'}`} 
                                       style={{ left: '4px', top: `${position + 1}px`, width: '80px', height: '8px' }}></div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                  <p className="text-xs text-black/70 text-center mt-2">Root + Major 3rd + Perfect 5th</p>
                </div>

                {/* Minor Triad */}
                <div className="bg-white/30 rounded-xl p-4">
                  <h4 className="font-bold text-black mb-3">Minor (Cm)</h4>
                  <div className="flex justify-center">
                    {(() => {
                      const midiNotes = [60, 63, 67]; // C4, Eb4, G4
                      const minNote = Math.min(...midiNotes);
                      const maxNote = Math.max(...midiNotes);
                      const low = minNote - 1;
                      const high = maxNote + 1;
                      const totalSemitones = high - low + 1;
                      const getMidiNoteName = (midi) => {
                        const notes = ["C","C# / Db","D","D# / Eb","E","F","F# / Gb","G","G# / Ab","A","A# / Bb","B"];
                        const octave = Math.floor(midi / 12) - 1;
                        return notes[midi % 12] + octave;
                      };
                      const isBlackKey = (midi) => [1, 3, 6, 8, 10].includes(midi % 12);
                      
                      return (
                        <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ width: '160px', height: `${Math.max(60, totalSemitones * 10)}px` }}>
                          <div className="flex h-full">
                            <div className="w-12 border-r-2 border-gray-300 bg-white">
                              {Array.from({ length: totalSemitones }, (_, j) => {
                                const midiNote = high - j;
                                const noteName = getMidiNoteName(midiNote);
                                return (
                                  <div key={j} className="border-b border-gray-200 flex items-center justify-end pr-1 text-xs" style={{ 
                                    height: '10px',
                                    backgroundColor: isBlackKey(midiNote) ? '#6b7280' : '#ffffff',
                                    color: isBlackKey(midiNote) ? '#ffffff' : '#000000'
                                  }}>
                                    <span className="text-xs" style={{ fontSize: '8px' }}>{noteName}</span>
                                  </div>
                                );
                              })}
                            </div>
                            <div className="flex-1 bg-gradient-to-r from-gray-50 to-gray-100 relative">
                              {Array.from({ length: totalSemitones }, (_, j) => (
                                <div key={j} className="absolute left-0 right-0 border-b border-gray-200" style={{ top: `${j * 10}px` }} />
                              ))}
                              {midiNotes.map((midiNote, j) => {
                                const position = (high - midiNote) * 10;
                                const isCNote = (midiNote % 12 === 0);
                                return (
                                  <div key={j} className={`absolute rounded shadow-lg ${isCNote ? 'bg-red-500' : 'bg-blue-500'}`} 
                                       style={{ left: '4px', top: `${position + 1}px`, width: '80px', height: '8px' }}></div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                  <p className="text-xs text-black/70 text-center mt-2">Root + Minor 3rd + Perfect 5th</p>
                </div>

                {/* Diminished Triad */}
                <div className="bg-white/30 rounded-xl p-4">
                  <h4 className="font-bold text-black mb-3">Diminished (Cdim)</h4>
                  <div className="flex justify-center">
                    {(() => {
                      const midiNotes = [60, 63, 66]; // C4, Eb4, Gb4
                      const minNote = Math.min(...midiNotes);
                      const maxNote = Math.max(...midiNotes);
                      const low = minNote - 1;
                      const high = maxNote + 1;
                      const totalSemitones = high - low + 1;
                      const getMidiNoteName = (midi) => {
                        const notes = ["C","C# / Db","D","D# / Eb","E","F","F# / Gb","G","G# / Ab","A","A# / Bb","B"];
                        const octave = Math.floor(midi / 12) - 1;
                        return notes[midi % 12] + octave;
                      };
                      const isBlackKey = (midi) => [1, 3, 6, 8, 10].includes(midi % 12);
                      
                      return (
                        <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ width: '160px', height: `${Math.max(60, totalSemitones * 10)}px` }}>
                          <div className="flex h-full">
                            <div className="w-12 border-r-2 border-gray-300 bg-white">
                              {Array.from({ length: totalSemitones }, (_, j) => {
                                const midiNote = high - j;
                                const noteName = getMidiNoteName(midiNote);
                                return (
                                  <div key={j} className="border-b border-gray-200 flex items-center justify-end pr-1 text-xs" style={{ 
                                    height: '10px',
                                    backgroundColor: isBlackKey(midiNote) ? '#6b7280' : '#ffffff',
                                    color: isBlackKey(midiNote) ? '#ffffff' : '#000000'
                                  }}>
                                    <span className="text-xs" style={{ fontSize: '8px' }}>{noteName}</span>
                                  </div>
                                );
                              })}
                            </div>
                            <div className="flex-1 bg-gradient-to-r from-gray-50 to-gray-100 relative">
                              {Array.from({ length: totalSemitones }, (_, j) => (
                                <div key={j} className="absolute left-0 right-0 border-b border-gray-200" style={{ top: `${j * 10}px` }} />
                              ))}
                              {midiNotes.map((midiNote, j) => {
                                const position = (high - midiNote) * 10;
                                const isCNote = (midiNote % 12 === 0);
                                return (
                                  <div key={j} className={`absolute rounded shadow-lg ${isCNote ? 'bg-red-500' : 'bg-blue-500'}`} 
                                       style={{ left: '4px', top: `${position + 1}px`, width: '80px', height: '8px' }}></div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                  <p className="text-xs text-black/70 text-center mt-2">Root + Minor 3rd + Diminished 5th</p>
                </div>

                {/* Augmented Triad */}
                <div className="bg-white/30 rounded-xl p-4">
                  <h4 className="font-bold text-black mb-3">Augmented (Caug)</h4>
                  <div className="flex justify-center">
                    {(() => {
                      const midiNotes = [60, 64, 68]; // C4, E4, G#4
                      const minNote = Math.min(...midiNotes);
                      const maxNote = Math.max(...midiNotes);
                      const low = minNote - 1;
                      const high = maxNote + 1;
                      const totalSemitones = high - low + 1;
                      const getMidiNoteName = (midi) => {
                        const notes = ["C","C# / Db","D","D# / Eb","E","F","F# / Gb","G","G# / Ab","A","A# / Bb","B"];
                        const octave = Math.floor(midi / 12) - 1;
                        return notes[midi % 12] + octave;
                      };
                      const isBlackKey = (midi) => [1, 3, 6, 8, 10].includes(midi % 12);
                      
                      return (
                        <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ width: '160px', height: `${Math.max(60, totalSemitones * 10)}px` }}>
                          <div className="flex h-full">
                            <div className="w-12 border-r-2 border-gray-300 bg-white">
                              {Array.from({ length: totalSemitones }, (_, j) => {
                                const midiNote = high - j;
                                const noteName = getMidiNoteName(midiNote);
                                return (
                                  <div key={j} className="border-b border-gray-200 flex items-center justify-end pr-1 text-xs" style={{ 
                                    height: '10px',
                                    backgroundColor: isBlackKey(midiNote) ? '#6b7280' : '#ffffff',
                                    color: isBlackKey(midiNote) ? '#ffffff' : '#000000'
                                  }}>
                                    <span className="text-xs" style={{ fontSize: '8px' }}>{noteName}</span>
                                  </div>
                                );
                              })}
                            </div>
                            <div className="flex-1 bg-gradient-to-r from-gray-50 to-gray-100 relative">
                              {Array.from({ length: totalSemitones }, (_, j) => (
                                <div key={j} className="absolute left-0 right-0 border-b border-gray-200" style={{ top: `${j * 10}px` }} />
                              ))}
                              {midiNotes.map((midiNote, j) => {
                                const position = (high - midiNote) * 10;
                                const isCNote = (midiNote % 12 === 0);
                                return (
                                  <div key={j} className={`absolute rounded shadow-lg ${isCNote ? 'bg-red-500' : 'bg-blue-500'}`} 
                                       style={{ left: '4px', top: `${position + 1}px`, width: '80px', height: '8px' }}></div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                  <p className="text-xs text-black/70 text-center mt-2">Root + Major 3rd + Augmented 5th</p>
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
      <div className="min-h-screen bg-gradient-to-br from-[#F9D6E8] to-[#D8D6F9]">
        <header className="bg-white/10 backdrop-blur-md border-b border-white/20 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/chord-recognition/basic-triads" className="w-8 h-8 rounded-full bg-black flex items-center justify-center hover:bg-gray-800 transition-colors">
                <span className="text-white text-sm font-bold">←</span>
              </Link>
              <h1 className="text-xl font-bold text-black">
                Level 1: Complete!
              </h1>
            </div>
            <Link to="/" className="w-8 h-8 rounded-full bg-black flex items-center justify-center hover:bg-gray-800 transition-colors">
              <span className="text-white text-sm font-bold">♪</span>
            </Link>
          </div>
        </header>
        
        <main className="max-w-2xl mx-auto p-6 flex items-center justify-center min-h-[80vh]">
          <div className={`text-center backdrop-blur-sm rounded-2xl p-8 ${
            levelResult.passed 
              ? 'bg-green-100/80 border-2 border-green-300' 
              : 'bg-red-100/80 border-2 border-red-300'
          }`}>
            <div className={`text-4xl font-bold mb-6 ${
              levelResult.passed ? 'text-green-800' : 'text-red-800'
            }`}>
              {levelResult.passed ? 'Level Passed!' : 'Level Failed'}
            </div>
            
            <div className="grid grid-cols-2 gap-6 mb-8 text-lg">
              <div className="text-center">
                <div className={`text-3xl font-bold ${
                  levelResult.accuracy >= PASS_ACCURACY ? 'text-green-600' : 'text-red-600'
                }`}>
                  {levelResult.accuracy.toFixed(1)}%
                </div>
                <div className="text-black/70">Accuracy (need {PASS_ACCURACY}%)</div>
              </div>
              <div className="text-center">
                <div className={`text-3xl font-bold ${
                  levelResult.avgTime <= PASS_TIME ? 'text-green-600' : 'text-red-600'
                }`}>
                  {levelResult.avgTime.toFixed(1)}s
                </div>
                <div className="text-black/70">Avg Time (need ≤{PASS_TIME}s)</div>
              </div>
            </div>
            
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => {
                  setHasStarted(false);
                  setIsCompleted(false);
                  setLevelResult(null);
                  setScore({ correct: 0, total: 0, streak: 0 });
                  setTotalTime(0);
                  setAvgTime(0);
                  setCurrentChord(null);
                  setFeedback(null);
                }}
                className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600 transition-colors"
              >
                Try Again
              </button>
              <Link
                to="/chord-recognition/basic-triads"
                className="px-6 py-3 bg-black text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors"
              >
                Back to Levels
              </Link>
              {levelResult.passed && (
                <Link
                  to="/chord-recognition/basic-triads/recognition/level2"
                  className="px-6 py-3 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 transition-colors"
                >
                  Next Level
                </Link>
              )}
            </div>
          </div>
        </main>
      </div>
    );
  }
  
  if (!currentChord) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9D6E8] to-[#D8D6F9]">
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/chord-recognition/basic-triads" className="w-8 h-8 rounded-full bg-black flex items-center justify-center hover:bg-gray-800 transition-colors">
              <span className="text-white text-sm font-bold">←</span>
            </Link>
            <h1 className="text-xl font-bold text-black">
              Level 1: Basic Triads
            </h1>
          </div>
          <Link to="/" className="w-8 h-8 rounded-full bg-black flex items-center justify-center hover:bg-gray-800 transition-colors">
            <span className="text-white text-sm font-bold">♪</span>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        <ScoreDisplay {...score} currentTime={currentTime} avgTime={avgTime} isAnswered={isAnswered} totalProblems={TOTAL_PROBLEMS} />
        
        <ChordPianoDisplay notes={currentChord.notes} showLabels={showLabels} setShowLabels={setShowLabels} />

        {/* Question section */}
        <div className="mt-6 text-center mb-8">
          <h2 className="text-2xl font-bold text-black mb-4">
            What chord is this?
          </h2>
          <p className="text-black/70 mb-6">
            Type the chord name (e.g., C, Cmaj, CM for major; Dm, Dmin for minor; Fdim, Gaug)
          </p>
          
          {/* Input and button */}
          <div className="max-w-md mx-auto mb-6">
            <input
              ref={inputRef}
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter chord name..."
              className="w-full px-4 py-3 text-lg text-center bg-white/30 backdrop-blur-sm border-2 border-white/20 rounded-xl focus:outline-none focus:border-black/40 text-black placeholder-black/50 mb-4"
              disabled={isAnswered}
            />
            
            {!isAnswered && (
              <button
                onClick={handleSubmit}
                disabled={!userAnswer.trim()}
                className="px-8 py-3 bg-black text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Check Answer
              </button>
            )}
          </div>
        </div>

        {feedback && (
          <div className={`max-w-md mx-auto p-6 rounded-2xl text-center mb-6 ${
            feedback.isCorrect 
              ? 'bg-green-100/80 border-2 border-green-300' 
              : 'bg-red-100/80 border-2 border-red-300'
          }`}>
            <div className={`text-2xl font-bold mb-2 ${
              feedback.isCorrect ? 'text-green-800' : 'text-red-800'
            }`}>
              {feedback.isCorrect ? 'Correct!' : 'Not quite...'}
            </div>
            
            {!feedback.isCorrect && (
              <>
                <div className="text-red-700 mb-2">
                  Your answer: <strong>{feedback.userAnswer}</strong>
                </div>
                <div className="text-red-700">
                  Correct answer: <strong>{feedback.correctAnswer}</strong>
                </div>
              </>
            )}
            
            <div className={`text-sm mt-2 ${
              feedback.isCorrect ? 'text-green-700' : 'text-red-700'
            }`}>
              {feedback.timeTaken?.toFixed(1)}s
            </div>
            
            {feedback.isCorrect && score.streak > 1 && (
              <div className="text-green-700">
                {score.streak} in a row! Keep it up!
              </div>
            )}
          </div>
        )}

        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mt-12">
          <h3 className="text-lg font-semibold text-black mb-4">Level 1: Basic Triads</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center p-3 bg-white/20 rounded-xl">
              <div className="font-bold text-black mb-1">Major</div>
              <div className="text-black/70">C, D, E, F, G, A, B</div>
            </div>
            <div className="text-center p-3 bg-white/20 rounded-xl">
              <div className="font-bold text-black mb-1">Minor</div>
              <div className="text-black/70">Cm, Dm, Em, etc.</div>
            </div>
            <div className="text-center p-3 bg-white/20 rounded-xl">
              <div className="font-bold text-black mb-1">Diminished</div>
              <div className="text-black/70">Cdim, Ddim, etc.</div>
            </div>
            <div className="text-center p-3 bg-white/20 rounded-xl">
              <div className="font-bold text-black mb-1">Augmented</div>
              <div className="text-black/70">Caug, Daug, etc.</div>
            </div>
          </div>
        </div>
      </main>

    </div>
  );
}