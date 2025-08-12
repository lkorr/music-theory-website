"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router";
import { generateChord, validateAnswer, levelConfigs } from "../shared/chordLogic.js";

// Import shared components
const ChordPianoDisplay = ({ notes }) => {
  const pianoKeysRef = useRef(null);
  const pianoRollRef = useRef(null);
  const noteHeight = 18;
  // Show full range from C1 to C6 (MIDI 24-84) for scrolling
  const lowestNote = 24;  // C1
  const highestNote = 84; // C6
  const totalNotes = highestNote - lowestNote + 1; // 61 notes total
  const containerHeight = 600; // Fixed container height for scrolling (50% bigger)
  
  const getMidiNoteName = (midiNote) => {
    const noteNames = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
    const octave = Math.floor(midiNote / 12) - 1;
    const note = noteNames[midiNote % 12];
    return `${note}${octave}`;
  };

  const isBlackKey = (midiNote) => {
    const noteInOctave = midiNote % 12;
    return [1, 3, 6, 8, 10].includes(noteInOctave);
  };
  
  // Auto-scroll to center the chord when notes change (with random offset)
  useEffect(() => {
    if (notes.length > 0 && pianoKeysRef.current && pianoRollRef.current) {
      // Find the middle note of the chord
      const sortedNotes = [...notes].sort((a, b) => b - a); // Sort high to low
      const middleNote = sortedNotes[Math.floor(sortedNotes.length / 2)];
      
      // Calculate the position of the middle note
      const notePosition = (highestNote - middleNote) * noteHeight;
      
      // Add random offset (±20% of container height for variety)
      const maxOffset = containerHeight * 0.2;
      const randomOffset = (Math.random() - 0.5) * 2 * maxOffset;
      
      // Calculate scroll position to center the middle note with random offset
      const scrollPosition = notePosition - (containerHeight / 2) + (noteHeight / 2) + randomOffset;
      
      // Clamp scroll position to valid range
      const maxScroll = (totalNotes * noteHeight) - containerHeight;
      const clampedScroll = Math.max(0, Math.min(scrollPosition, maxScroll));
      
      // Scroll both containers
      pianoKeysRef.current.scrollTop = clampedScroll;
      pianoRollRef.current.scrollTop = clampedScroll;
    }
  }, [notes, highestNote, noteHeight, containerHeight, totalNotes]);
  
  return (
    <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 mb-8">
      <h3 className="text-xl font-semibold text-black mb-6 text-center">Chord Notes</h3>
      
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mx-auto" style={{ width: '550px', height: `${containerHeight}px` }}>
        <div className="flex">
          {/* Piano keys on the left */}
          <div ref={pianoKeysRef} className="w-24 flex-shrink-0 border-r-2 border-gray-300 bg-white overflow-y-hidden" style={{ height: `${containerHeight}px` }}>
            <div style={{ height: `${totalNotes * noteHeight}px` }}>
              {Array.from({ length: totalNotes }, (_, i) => {
                // Display notes from highest to lowest
                const midiNote = highestNote - i;
                const noteName = getMidiNoteName(midiNote);
                return (
                  <div 
                    key={midiNote} 
                    className={`border-b border-gray-200 flex items-center justify-end pr-3 text-xs ${
                      isBlackKey(midiNote) 
                        ? "bg-gray-800 text-white"
                        : "bg-white text-gray-700"
                    }`} 
                    style={{ height: `${noteHeight}px` }}
                  >
                    <span className={`text-xs ${
                      isBlackKey(midiNote) ? "text-gray-400" : ""
                    }`}>
                      {noteName}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Note visualization area */}
          <div ref={pianoRollRef} className="flex-1 bg-gradient-to-r from-gray-50 to-gray-100 overflow-y-auto" style={{ height: `${containerHeight}px` }} onScroll={(e) => { 
                // Sync scroll with piano keys
                if (pianoKeysRef.current) {
                  pianoKeysRef.current.scrollTop = e.target.scrollTop;
                }
              }}>
            <div className="relative h-full">
              {/* Grid lines */}
              {Array.from({ length: totalNotes }, (_, i) => {
                const midiNote = highestNote - i;
                return (
                  <div 
                    key={`line-${i}`} 
                    className={`absolute left-0 right-0 ${
                      isBlackKey(midiNote) ? "border-b border-gray-300" : "border-b border-gray-200"
                    }`}
                    style={{ top: `${i * noteHeight}px` }} 
                  />
                );
              })}
              
              {/* Note blocks */}
              {notes.map((midiNote, index) => {
                // Calculate position: how many steps down from the highest note
                const yPos = (highestNote - midiNote) * noteHeight;
                
                return (
                  <div
                    key={`note-${index}`}
                    className="absolute bg-blue-500 border-blue-600 rounded-lg shadow-lg"
                    style={{
                      left: '20px',
                      top: `${yPos + 2}px`,
                      width: '380px',
                      height: `${noteHeight - 4}px`
                    }}
                  >
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Score display component
function ScoreDisplay({ correct, total, streak, currentTime, avgTime, isAnswered, totalProblems }) {
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
  const progress = Math.round((total / totalProblems) * 100);
  
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-6">
      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-black/70 mb-2">
          <span>Progress: {total}/{totalProblems}</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
      
      <div className="grid grid-cols-5 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold text-black">
            {currentTime.toFixed(1)}s
          </div>
          <div className="text-sm text-black/70">Current Time</div>
        </div>
        <div>
          <div className={`text-2xl font-bold ${
            avgTime > 0 && avgTime <= 5 ? 'text-green-600' : avgTime > 5 ? 'text-red-600' : 'text-black'
          }`}>
            {avgTime > 0 ? avgTime.toFixed(1) : '0.0'}s
          </div>
          <div className="text-sm text-black/70">Average Time</div>
        </div>
        <div>
          <div className={`text-2xl font-bold ${
            accuracy >= 90 ? 'text-green-600' : accuracy >= 70 ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {accuracy}%
          </div>
          <div className="text-sm text-black/70">Accuracy</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-black">{correct}/{total}</div>
          <div className="text-sm text-black/70">Correct</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-black">{streak}</div>
          <div className="text-sm text-black/70">Streak</div>
        </div>
      </div>
    </div>
  );
}

export default function Level4Page() {
  const [currentChord, setCurrentChord] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState({ correct: 0, total: 0, streak: 0 });
  const [isAnswered, setIsAnswered] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [avgTime, setAvgTime] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [levelResult, setLevelResult] = useState(null);
  const inputRef = useRef(null);
  const timerRef = useRef(null);
  
  const TOTAL_PROBLEMS = 30;
  const PASS_ACCURACY = 85; // 85% for 7th chords
  const PASS_TIME = 8; // 8 seconds for 7th chords

  const startLevel = () => {
    setHasStarted(true);
    setCurrentChord(generateChord(levelConfigs.level4));
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
    setCurrentChord(generateChord(levelConfigs.level4));
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

  // Real-time timer update
  useEffect(() => {
    if (startTime && !isAnswered) {
      timerRef.current = setInterval(() => {
        setCurrentTime((Date.now() - startTime) / 1000);
      }, 100);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [startTime, isAnswered]);

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
    const currentTotal = score.total + 1; // Use the new total value
    setTimeout(() => {
      if (currentTotal < TOTAL_PROBLEMS) {
        nextChord();
      }
    }, delay);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isAnswered) {
      handleSubmit();
    }
  };

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
                Level 4: 7th Chords
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
              <h2 className="text-3xl font-bold text-black mb-6">Ready to Start Level 4?</h2>
              <div className="text-lg text-black/80 mb-8 space-y-2">
                <p><strong>{TOTAL_PROBLEMS} problems</strong> to complete</p>
                <p>Identify 7th chords in root position</p>
                <p>Types: Major7, Minor7, Dominant7, Diminished7, Half-Diminished7</p>
                <p>Need <strong>{PASS_ACCURACY}% accuracy</strong> to pass</p>
                <p>Average time must be under <strong>{PASS_TIME} seconds</strong></p>
              </div>
              <button
                onClick={startLevel}
                className="px-12 py-4 bg-green-500 text-white text-xl font-bold rounded-xl hover:bg-green-600 transition-colors shadow-lg"
              >
                Start Level 4
              </button>
            </div>

            {/* Chord Legend */}
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 lg:w-1/2">
              <h3 className="text-2xl font-bold text-black mb-6 text-center">7th Chord Types</h3>
              <div className="space-y-4">
                {/* Major 7th */}
                <div className="bg-white/30 rounded-xl p-4">
                  <h4 className="font-bold text-black mb-3">Major 7th (Cmaj7)</h4>
                  <div className="flex justify-center">
                    {(() => {
                      const midiNotes = [60, 64, 67, 71]; // C4, E4, G4, B4
                      const minNote = Math.min(...midiNotes);
                      const maxNote = Math.max(...midiNotes);
                      const low = minNote - 1;
                      const high = maxNote + 1;
                      const totalSemitones = high - low + 1;
                      const getMidiNoteName = (midi) => {
                        const notes = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
                        const octave = Math.floor(midi / 12) - 1;
                        return notes[midi % 12] + octave;
                      };
                      const isBlackKey = (midi) => [1, 3, 6, 8, 10].includes(midi % 12);
                      
                      return (
                        <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ width: '200px', height: `${Math.max(80, totalSemitones * 12)}px` }}>
                          <div className="flex h-full">
                            <div className="w-16 border-r-2 border-gray-300 bg-white">
                              {Array.from({ length: totalSemitones }, (_, j) => {
                                const midiNote = high - j;
                                const noteName = getMidiNoteName(midiNote);
                                return (
                                  <div key={j} className={`border-b border-gray-200 flex items-center justify-end pr-2 text-xs ${
                                    isBlackKey(midiNote) ? "bg-gray-800 text-white" : "bg-white text-gray-700"
                                  }`} style={{ height: '12px' }}>
                                    <span className="text-xs">{noteName}</span>
                                  </div>
                                );
                              })}
                            </div>
                            <div className="flex-1 bg-gradient-to-r from-gray-50 to-gray-100 relative">
                              {Array.from({ length: totalSemitones }, (_, j) => (
                                <div key={j} className="absolute left-0 right-0 border-b border-gray-200" style={{ top: `${j * 12}px` }} />
                              ))}
                              {midiNotes.map((midiNote, j) => {
                                const position = (high - midiNote) * 12;
                                const isCNote = (midiNote % 12 === 0);
                                return (
                                  <div key={j} className={`absolute rounded shadow-lg ${isCNote ? 'bg-red-500' : 'bg-blue-500'}`} 
                                       style={{ left: '8px', top: `${position + 1}px`, width: '110px', height: '10px' }}></div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                  <p className="text-xs text-black/70 text-center mt-2">Root + Major 3rd + Perfect 5th + Major 7th</p>
                </div>

                {/* Minor 7th */}
                <div className="bg-white/30 rounded-xl p-4">
                  <h4 className="font-bold text-black mb-3">Minor 7th (Cm7)</h4>
                  <div className="flex justify-center">
                    {(() => {
                      const midiNotes = [60, 63, 67, 70]; // C4, Eb4, G4, Bb4
                      const minNote = Math.min(...midiNotes);
                      const maxNote = Math.max(...midiNotes);
                      const low = minNote - 1;
                      const high = maxNote + 1;
                      const totalSemitones = high - low + 1;
                      const getMidiNoteName = (midi) => {
                        const notes = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
                        const octave = Math.floor(midi / 12) - 1;
                        return notes[midi % 12] + octave;
                      };
                      const isBlackKey = (midi) => [1, 3, 6, 8, 10].includes(midi % 12);
                      
                      return (
                        <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ width: '200px', height: `${Math.max(80, totalSemitones * 12)}px` }}>
                          <div className="flex h-full">
                            <div className="w-16 border-r-2 border-gray-300 bg-white">
                              {Array.from({ length: totalSemitones }, (_, j) => {
                                const midiNote = high - j;
                                const noteName = getMidiNoteName(midiNote);
                                return (
                                  <div key={j} className={`border-b border-gray-200 flex items-center justify-end pr-2 text-xs ${
                                    isBlackKey(midiNote) ? "bg-gray-800 text-white" : "bg-white text-gray-700"
                                  }`} style={{ height: '12px' }}>
                                    <span className="text-xs">{noteName}</span>
                                  </div>
                                );
                              })}
                            </div>
                            <div className="flex-1 bg-gradient-to-r from-gray-50 to-gray-100 relative">
                              {Array.from({ length: totalSemitones }, (_, j) => (
                                <div key={j} className="absolute left-0 right-0 border-b border-gray-200" style={{ top: `${j * 12}px` }} />
                              ))}
                              {midiNotes.map((midiNote, j) => {
                                const position = (high - midiNote) * 12;
                                const isCNote = (midiNote % 12 === 0);
                                return (
                                  <div key={j} className={`absolute rounded shadow-lg ${isCNote ? 'bg-red-500' : 'bg-blue-500'}`} 
                                       style={{ left: '8px', top: `${position + 1}px`, width: '110px', height: '10px' }}></div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                  <p className="text-xs text-black/70 text-center mt-2">Root + Minor 3rd + Perfect 5th + Minor 7th</p>
                </div>

                {/* Dominant 7th */}
                <div className="bg-white/30 rounded-xl p-4">
                  <h4 className="font-bold text-black mb-3">Dominant 7th (C7)</h4>
                  <div className="flex justify-center">
                    {(() => {
                      const midiNotes = [60, 64, 67, 70]; // C4, E4, G4, Bb4
                      const minNote = Math.min(...midiNotes);
                      const maxNote = Math.max(...midiNotes);
                      const low = minNote - 1;
                      const high = maxNote + 1;
                      const totalSemitones = high - low + 1;
                      const getMidiNoteName = (midi) => {
                        const notes = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
                        const octave = Math.floor(midi / 12) - 1;
                        return notes[midi % 12] + octave;
                      };
                      const isBlackKey = (midi) => [1, 3, 6, 8, 10].includes(midi % 12);
                      
                      return (
                        <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ width: '200px', height: `${Math.max(80, totalSemitones * 12)}px` }}>
                          <div className="flex h-full">
                            <div className="w-16 border-r-2 border-gray-300 bg-white">
                              {Array.from({ length: totalSemitones }, (_, j) => {
                                const midiNote = high - j;
                                const noteName = getMidiNoteName(midiNote);
                                return (
                                  <div key={j} className={`border-b border-gray-200 flex items-center justify-end pr-2 text-xs ${
                                    isBlackKey(midiNote) ? "bg-gray-800 text-white" : "bg-white text-gray-700"
                                  }`} style={{ height: '12px' }}>
                                    <span className="text-xs">{noteName}</span>
                                  </div>
                                );
                              })}
                            </div>
                            <div className="flex-1 bg-gradient-to-r from-gray-50 to-gray-100 relative">
                              {Array.from({ length: totalSemitones }, (_, j) => (
                                <div key={j} className="absolute left-0 right-0 border-b border-gray-200" style={{ top: `${j * 12}px` }} />
                              ))}
                              {midiNotes.map((midiNote, j) => {
                                const position = (high - midiNote) * 12;
                                const isCNote = (midiNote % 12 === 0);
                                return (
                                  <div key={j} className={`absolute rounded shadow-lg ${isCNote ? 'bg-red-500' : 'bg-blue-500'}`} 
                                       style={{ left: '8px', top: `${position + 1}px`, width: '110px', height: '10px' }}></div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                  <p className="text-xs text-black/70 text-center mt-2">Root + Major 3rd + Perfect 5th + Minor 7th</p>
                </div>

                {/* Diminished 7th */}
                <div className="bg-white/30 rounded-xl p-4">
                  <h4 className="font-bold text-black mb-3">Diminished 7th (Cdim7)</h4>
                  <div className="flex justify-center">
                    {(() => {
                      const midiNotes = [60, 63, 66, 69]; // C4, Eb4, Gb4, A4
                      const minNote = Math.min(...midiNotes);
                      const maxNote = Math.max(...midiNotes);
                      const low = minNote - 1;
                      const high = maxNote + 1;
                      const totalSemitones = high - low + 1;
                      const getMidiNoteName = (midi) => {
                        const notes = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
                        const octave = Math.floor(midi / 12) - 1;
                        return notes[midi % 12] + octave;
                      };
                      const isBlackKey = (midi) => [1, 3, 6, 8, 10].includes(midi % 12);
                      
                      return (
                        <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ width: '200px', height: `${Math.max(80, totalSemitones * 12)}px` }}>
                          <div className="flex h-full">
                            <div className="w-16 border-r-2 border-gray-300 bg-white">
                              {Array.from({ length: totalSemitones }, (_, j) => {
                                const midiNote = high - j;
                                const noteName = getMidiNoteName(midiNote);
                                return (
                                  <div key={j} className={`border-b border-gray-200 flex items-center justify-end pr-2 text-xs ${
                                    isBlackKey(midiNote) ? "bg-gray-800 text-white" : "bg-white text-gray-700"
                                  }`} style={{ height: '12px' }}>
                                    <span className="text-xs">{noteName}</span>
                                  </div>
                                );
                              })}
                            </div>
                            <div className="flex-1 bg-gradient-to-r from-gray-50 to-gray-100 relative">
                              {Array.from({ length: totalSemitones }, (_, j) => (
                                <div key={j} className="absolute left-0 right-0 border-b border-gray-200" style={{ top: `${j * 12}px` }} />
                              ))}
                              {midiNotes.map((midiNote, j) => {
                                const position = (high - midiNote) * 12;
                                const isCNote = (midiNote % 12 === 0);
                                return (
                                  <div key={j} className={`absolute rounded shadow-lg ${isCNote ? 'bg-red-500' : 'bg-blue-500'}`} 
                                       style={{ left: '8px', top: `${position + 1}px`, width: '110px', height: '10px' }}></div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                  <p className="text-xs text-black/70 text-center mt-2">Root + Minor 3rd + Dim 5th + Dim 7th</p>
                </div>

                {/* Half Diminished 7th */}
                <div className="bg-white/30 rounded-xl p-4">
                  <h4 className="font-bold text-black mb-3">Half Diminished 7th (Cm7♭5)</h4>
                  <div className="flex justify-center">
                    {(() => {
                      const midiNotes = [60, 63, 66, 70]; // C4, Eb4, Gb4, Bb4
                      const minNote = Math.min(...midiNotes);
                      const maxNote = Math.max(...midiNotes);
                      const low = minNote - 1;
                      const high = maxNote + 1;
                      const totalSemitones = high - low + 1;
                      const getMidiNoteName = (midi) => {
                        const notes = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
                        const octave = Math.floor(midi / 12) - 1;
                        return notes[midi % 12] + octave;
                      };
                      const isBlackKey = (midi) => [1, 3, 6, 8, 10].includes(midi % 12);
                      
                      return (
                        <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ width: '200px', height: `${Math.max(80, totalSemitones * 12)}px` }}>
                          <div className="flex h-full">
                            <div className="w-16 border-r-2 border-gray-300 bg-white">
                              {Array.from({ length: totalSemitones }, (_, j) => {
                                const midiNote = high - j;
                                const noteName = getMidiNoteName(midiNote);
                                return (
                                  <div key={j} className={`border-b border-gray-200 flex items-center justify-end pr-2 text-xs ${
                                    isBlackKey(midiNote) ? "bg-gray-800 text-white" : "bg-white text-gray-700"
                                  }`} style={{ height: '12px' }}>
                                    <span className="text-xs">{noteName}</span>
                                  </div>
                                );
                              })}
                            </div>
                            <div className="flex-1 bg-gradient-to-r from-gray-50 to-gray-100 relative">
                              {Array.from({ length: totalSemitones }, (_, j) => (
                                <div key={j} className="absolute left-0 right-0 border-b border-gray-200" style={{ top: `${j * 12}px` }} />
                              ))}
                              {midiNotes.map((midiNote, j) => {
                                const position = (high - midiNote) * 12;
                                const isCNote = (midiNote % 12 === 0);
                                return (
                                  <div key={j} className={`absolute rounded shadow-lg ${isCNote ? 'bg-red-500' : 'bg-blue-500'}`} 
                                       style={{ left: '8px', top: `${position + 1}px`, width: '110px', height: '10px' }}></div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                  <p className="text-xs text-black/70 text-center mt-2">Root + Minor 3rd + Dim 5th + Minor 7th</p>
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
                Level 4: Complete!
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
                  to="/chord-recognition/basic-triads/level5"
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
              Level 4: 7th Chords
            </h1>
          </div>
          <Link to="/" className="w-8 h-8 rounded-full bg-black flex items-center justify-center hover:bg-gray-800 transition-colors">
            <span className="text-white text-sm font-bold">♪</span>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        <ScoreDisplay {...score} currentTime={currentTime} avgTime={avgTime} isAnswered={isAnswered} totalProblems={TOTAL_PROBLEMS} />
        
        <ChordPianoDisplay notes={currentChord.notes} />

        {/* Question section */}
        <div className="mt-6 text-center mb-8">
          <h2 className="text-2xl font-bold text-black mb-4">
            What 7th chord is this?
          </h2>
          <p className="text-black/70 mb-6">
            Type the 7th chord name (e.g., Cmaj7, Dm7, G7, Fdim7, Em7b5)
          </p>
          
          {/* Input and button */}
          <div className="max-w-md mx-auto mb-6">
            <input
              ref={inputRef}
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter 7th chord name..."
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
          <h3 className="text-lg font-semibold text-black mb-4">Level 4: 7th Chords</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm">
            <div className="text-center p-3 bg-white/20 rounded-xl">
              <div className="font-bold text-black mb-1">Major 7th</div>
              <div className="text-black/70">Cmaj7, M7</div>
            </div>
            <div className="text-center p-3 bg-white/20 rounded-xl">
              <div className="font-bold text-black mb-1">Minor 7th</div>
              <div className="text-black/70">Cm7, m7</div>
            </div>
            <div className="text-center p-3 bg-white/20 rounded-xl">
              <div className="font-bold text-black mb-1">Dominant 7th</div>
              <div className="text-black/70">C7</div>
            </div>
            <div className="text-center p-3 bg-white/20 rounded-xl">
              <div className="font-bold text-black mb-1">Diminished 7th</div>
              <div className="text-black/70">Cdim7, °7</div>
            </div>
            <div className="text-center p-3 bg-white/20 rounded-xl">
              <div className="font-bold text-black mb-1">Half Dim 7th</div>
              <div className="text-black/70">Cm7b5, ø7</div>
            </div>
          </div>
        </div>
      </main>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Urbanist:wght@400;500;600;700;800@display=swap');
        * { font-family: 'Urbanist', sans-serif; }
        html { scroll-behavior: smooth; }
      `}</style>
    </div>
  );
}