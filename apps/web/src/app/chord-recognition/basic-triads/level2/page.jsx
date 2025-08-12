"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router";

// Music theory utilities
const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const chordTypes = {
  major: { name: '', intervals: [0, 4, 7], symbol: '' },
  minor: { name: 'Minor', intervals: [0, 3, 7], symbol: 'm' },
  diminished: { name: 'Diminished', intervals: [0, 3, 6], symbol: 'dim' },
  augmented: { name: 'Augmented', intervals: [0, 4, 8], symbol: 'aug' }
};

const inversionTypes = {
  root: { name: 'Root Position', intervalOrder: [0, 1, 2] },
  first: { name: '1st Inversion', intervalOrder: [1, 2, 0] },
  second: { name: '2nd Inversion', intervalOrder: [2, 0, 1] }
};

// Helper functions
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

// Piano roll display component for chord recognition
function ChordPianoDisplay({ notes }) {
  const pianoKeysRef = useRef(null);
  const pianoRollRef = useRef(null);
  const noteHeight = 18;
  // Show full range from C1 to C6 (MIDI 24-84) for scrolling
  const lowestNote = 24;  // C1
  const highestNote = 84; // C6
  const totalNotes = highestNote - lowestNote + 1; // 61 notes total
  const containerHeight = 600; // Fixed container height for scrolling (50% bigger)
  
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
                    className={`border-b border-gray-200 flex items-center justify-end pr-3 ${
                      isBlackKey(midiNote) 
                        ? "bg-gray-800"
                        : "bg-white text-gray-700"
                    }`} 
                    style={{ height: `${noteHeight}px` }}
                  >
                    <span className={`${
                      isBlackKey(midiNote) 
                        ? "text-xs text-gray-400" 
                        : "text-xs text-gray-700"
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
}

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

export default function Level2Page() {
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
  const PASS_ACCURACY = 90; // 90%
  const PASS_TIME = 5; // 5 seconds

  // Generate a random chord with inversion in a random octave within the display range
  const generateChord = useCallback(() => {
    const roots = ['C', 'D', 'E', 'F', 'G', 'A', 'B']; // Natural notes only
    
    const root = roots[Math.floor(Math.random() * roots.length)];
    
    // For Level 2: only root position and first inversion
    // Exclude augmented chords from inversions (they're confusing for beginners)
    let chordType, inversion;
    
    if (Math.random() < 0.5) {
      // 50% chance of root position (any chord type)
      const chordTypeKeys = Object.keys(chordTypes);
      chordType = chordTypeKeys[Math.floor(Math.random() * chordTypeKeys.length)];
      inversion = 'root';
    } else {
      // 50% chance of first inversion (exclude augmented)
      const nonAugmentedChords = ['major', 'minor', 'diminished'];
      chordType = nonAugmentedChords[Math.floor(Math.random() * nonAugmentedChords.length)];
      inversion = 'first';
    }
    
    // Choose a random octave from 2, 3, or 4 (C2=36, C3=48, C4=60)
    const possibleOctaves = [36, 48, 60]; // C2, C3, C4
    const baseOctave = possibleOctaves[Math.floor(Math.random() * possibleOctaves.length)];
    
    // Build the chord from the chosen root and octave
    const rootNoteNumber = noteNames.indexOf(root);
    const baseRoot = rootNoteNumber + baseOctave;
    const intervals = chordTypes[chordType].intervals;
    
    // Apply inversion - reorder the intervals according to inversion type
    const inversionOrder = inversionTypes[inversion].intervalOrder;
    const reorderedIntervals = inversionOrder.map(index => intervals[index]);
    
    // Create notes with proper voicing for inversion
    let notes = [];
    
    // For inversions, we need to ensure proper octave spacing
    for (let i = 0; i < reorderedIntervals.length; i++) {
      if (i === 0) {
        // First note uses the reordered interval from base root
        notes.push(baseRoot + reorderedIntervals[i]);
      } else {
        // Subsequent notes: add interval and ensure ascending order
        let nextNote = baseRoot + reorderedIntervals[i];
        // If this note would be lower than the previous note, move it up an octave
        while (nextNote <= notes[notes.length - 1]) {
          nextNote += 12;
        }
        notes.push(nextNote);
      }
    }
    
    // Ensure all notes are within C1 (24) to C6 (84) range
    const minNote = 24; // C1
    const maxNote = 84; // C6
    
    // If any note is too high, transpose the entire chord down
    while (Math.max(...notes) > maxNote) {
      notes = notes.map(note => note - 12);
    }
    
    // If any note is too low, transpose the entire chord up
    while (Math.min(...notes) < minNote) {
      notes = notes.map(note => note + 12);
    }
    
    // Create expected answer based on chord and inversion
    let expectedAnswer;
    
    // Special case for augmented chords - inversions are equivalent to other augmented chords
    if (chordType === 'augmented') {
      if (inversion === 'first') {
        // 1st inversion of augmented chord = augmented chord starting on the 3rd
        const thirdIndex = (noteNames.indexOf(root) + 4) % 12; // Major third up
        const newRoot = noteNames[thirdIndex];
        expectedAnswer = newRoot + chordTypes[chordType].symbol;
      } else if (inversion === 'second') {
        // 2nd inversion of augmented chord = augmented chord starting on the 5th
        const fifthIndex = (noteNames.indexOf(root) + 8) % 12; // Augmented fifth up
        const newRoot = noteNames[fifthIndex];
        expectedAnswer = newRoot + chordTypes[chordType].symbol;
      } else {
        // Root position
        expectedAnswer = root + chordTypes[chordType].symbol;
      }
    } else {
      // Normal chord inversion notation for major, minor, diminished
      expectedAnswer = root + chordTypes[chordType].symbol;
      if (inversion === 'first') {
        expectedAnswer += '/1';
      } else if (inversion === 'second') {
        expectedAnswer += '/2';
      }
    }
    
    return {
      root,
      chordType,
      inversion,
      notes,
      expectedAnswer,
      intervals: reorderedIntervals
    };
  }, []);

  const startLevel = () => {
    setHasStarted(true);
    setCurrentChord(generateChord());
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
    setCurrentChord(generateChord());
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

  // Validate answer with inversion support
  const validateAnswer = (answer, expectedAnswer) => {
    const normalizeAnswer = (str) => str.toLowerCase().replace(/\s+/g, '');
    
    const normalized = normalizeAnswer(answer);
    const expectedNormalized = normalizeAnswer(expectedAnswer);
    
    // Extract root note, chord type, and inversion from expected answer
    const parts = expectedAnswer.split('/');
    const chordPart = parts[0]; // e.g., "C", "Cm", "Cdim"
    const inversionPart = parts[1] || null; // e.g., "1", "2", or null for root
    
    const rootNote = chordPart.match(/^[A-G][#b]?/)?.[0] || '';
    const chordTypePart = chordPart.replace(rootNote, '').toLowerCase();
    
    // Generate all acceptable formats for this chord and inversion
    const acceptableAnswers = new Set();
    
    // Add the exact expected answer
    acceptableAnswers.add(expectedNormalized);
    
    // Helper function to add inversion variations
    const addInversionVariations = (baseChord) => {
      if (inversionPart === '1') {
        acceptableAnswers.add(normalizeAnswer(baseChord + '/1'));
        acceptableAnswers.add(normalizeAnswer(baseChord + '/first'));
        acceptableAnswers.add(normalizeAnswer(baseChord + ' first inversion'));
        acceptableAnswers.add(normalizeAnswer(baseChord + ' 1st inversion'));
      } else if (inversionPart === '2') {
        acceptableAnswers.add(normalizeAnswer(baseChord + '/2'));
        acceptableAnswers.add(normalizeAnswer(baseChord + '/second'));
        acceptableAnswers.add(normalizeAnswer(baseChord + ' second inversion'));
        acceptableAnswers.add(normalizeAnswer(baseChord + ' 2nd inversion'));
      } else {
        // Root position - add root position variations
        acceptableAnswers.add(normalizeAnswer(baseChord));
        acceptableAnswers.add(normalizeAnswer(baseChord + ' root'));
        acceptableAnswers.add(normalizeAnswer(baseChord + ' root position'));
      }
    };
    
    // Major chord variations
    if (chordTypePart === '' || chordTypePart === 'maj' || chordTypePart === 'major') {
      addInversionVariations(rootNote); // Just "C"
      addInversionVariations(rootNote + 'maj'); // "Cmaj"
      addInversionVariations(rootNote + 'major'); // "Cmajor"
      addInversionVariations(rootNote + 'M'); // "CM"
    }
    
    // Minor chord variations  
    if (chordTypePart === 'm' || chordTypePart === 'min' || chordTypePart === 'minor') {
      addInversionVariations(rootNote + 'm'); // "Cm"
      addInversionVariations(rootNote + 'min'); // "Cmin"
      addInversionVariations(rootNote + 'minor'); // "Cminor"
    }
    
    // Diminished chord variations
    if (chordTypePart === 'dim' || chordTypePart === 'diminished') {
      addInversionVariations(rootNote + 'dim'); // "Cdim"
      addInversionVariations(rootNote + 'diminished'); // "Cdiminished"
      addInversionVariations(rootNote + '°'); // "C°"
    }
    
    // Augmented chord variations
    if (chordTypePart === 'aug' || chordTypePart === 'augmented') {
      addInversionVariations(rootNote + 'aug'); // "Caug"
      addInversionVariations(rootNote + 'augmented'); // "Caugmented"
      addInversionVariations(rootNote + '+'); // "C+"
      
      // For augmented chords, also accept enharmonic equivalents
      // Since augmented chords are symmetrical, each inversion = different root aug chord
      if (!inversionPart) {
        // Root position - also accept the other two equivalent augmented chords
        const rootIndex = noteNames.indexOf(rootNote);
        if (rootIndex !== -1) {
          const thirdRoot = noteNames[(rootIndex + 4) % 12]; // Major third up
          const fifthRoot = noteNames[(rootIndex + 8) % 12]; // Augmented fifth up
          
          // Accept these as equivalent
          acceptableAnswers.add(normalizeAnswer(thirdRoot + 'aug'));
          acceptableAnswers.add(normalizeAnswer(thirdRoot + 'augmented'));
          acceptableAnswers.add(normalizeAnswer(thirdRoot + '+'));
          acceptableAnswers.add(normalizeAnswer(fifthRoot + 'aug'));
          acceptableAnswers.add(normalizeAnswer(fifthRoot + 'augmented'));
          acceptableAnswers.add(normalizeAnswer(fifthRoot + '+'));
        }
      }
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
                Level 2: Triads with Inversions
              </h1>
            </div>
            <Link to="/" className="w-8 h-8 rounded-full bg-black flex items-center justify-center hover:bg-gray-800 transition-colors">
              <span className="text-white text-sm font-bold">♪</span>
            </Link>
          </div>
        </header>
        
        <main className="max-w-2xl mx-auto p-6 flex items-center justify-center min-h-[80vh]">
          <div className="text-center bg-white/20 backdrop-blur-sm rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-black mb-6">Ready to Start Level 2?</h2>
            <div className="text-lg text-black/80 mb-8 space-y-2">
              <p><strong>{TOTAL_PROBLEMS} problems</strong> to complete</p>
              <p>Identify basic triads in root position and 1st inversion</p>
              <p>Need <strong>{PASS_ACCURACY}% accuracy</strong> to pass</p>
              <p>Average time must be under <strong>{PASS_TIME} seconds</strong></p>
            </div>
            <button
              onClick={startLevel}
              className="px-12 py-4 bg-blue-500 text-white text-xl font-bold rounded-xl hover:bg-blue-600 transition-colors shadow-lg"
            >
              Start Level 2
            </button>
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
                Level 2: Complete!
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
                  to="/chord-recognition/basic-triads/level3"
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
              Level 2: Triads with Inversions
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
            What chord is this?
          </h2>
          <p className="text-black/70 mb-6">
            Type the chord name with inversion (e.g., C/1, Dm/first, F, Gdim)
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
          <h3 className="text-lg font-semibold text-black mb-4">Level 2: First Inversions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
            <div className="text-center p-3 bg-white/20 rounded-xl">
              <div className="font-bold text-black mb-1">Root Position</div>
              <div className="text-black/70">C, Dm, Fdim, Gaug</div>
            </div>
            <div className="text-center p-3 bg-white/20 rounded-xl">
              <div className="font-bold text-black mb-1">1st Inversion</div>
              <div className="text-black/70">C/1, Dm/first (no augmented)</div>
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