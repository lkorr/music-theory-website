"use client";

import { useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import { Eye, EyeOff } from "lucide-react";
import { noteNames, chordTypes, extendedChordTypes, inversionTypes, getMidiNoteName, isBlackKey } from "../../chord-recognition/basic-triads/shared/chordLogic.js";

// Universal Theme Configuration
const THEMES = {
  emerald: {
    background: "bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e]",
    primary: "bg-emerald-500",
    secondary: "bg-emerald-600", 
    accent: "border-emerald-300",
    text: "text-emerald-100",
    pianoRoll: {
      placedNotes: "bg-blue-500 border-blue-600",
      correctNotes: "bg-green-500 border-green-600",
      incorrectNotes: "bg-red-500 border-red-600"
    },
    progressBar: "bg-emerald-500",
    buttons: {
      primary: "bg-emerald-500 hover:bg-emerald-600",
      secondary: "bg-gray-500 hover:bg-gray-600"
    }
  },
  teal: {
    background: "bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e]",
    primary: "bg-teal-500",
    secondary: "bg-teal-600", 
    accent: "border-teal-300",
    text: "text-teal-100",
    pianoRoll: {
      placedNotes: "bg-teal-500 border-teal-600",
      correctNotes: "bg-green-500 border-green-600",
      incorrectNotes: "bg-red-500 border-red-600"
    },
    progressBar: "bg-teal-500",
    buttons: {
      primary: "bg-teal-500 hover:bg-teal-600",
      secondary: "bg-gray-500 hover:bg-gray-600"
    }
  },
  cyan: {
    background: "bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e]",
    primary: "bg-cyan-500",
    secondary: "bg-cyan-600", 
    accent: "border-cyan-300",
    text: "text-cyan-100",
    pianoRoll: {
      placedNotes: "bg-cyan-500 border-cyan-600",
      correctNotes: "bg-green-500 border-green-600",
      incorrectNotes: "bg-red-500 border-red-600"
    },
    progressBar: "bg-cyan-500",
    buttons: {
      primary: "bg-cyan-500 hover:bg-cyan-600",
      secondary: "bg-gray-500 hover:bg-gray-600"
    }
  },
  purple: {
    background: "bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e]",
    primary: "bg-purple-500",
    secondary: "bg-purple-600", 
    accent: "border-purple-300",
    text: "text-purple-100",
    pianoRoll: {
      placedNotes: "bg-purple-500 border-purple-600",
      correctNotes: "bg-green-500 border-green-600",
      incorrectNotes: "bg-red-500 border-red-600"
    },
    progressBar: "bg-purple-500",
    buttons: {
      primary: "bg-purple-500 hover:bg-purple-600",
      secondary: "bg-gray-500 hover:bg-gray-600"
    }
  }
};

// Universal Piano Roll Component - Single Implementation for ALL Levels
function UniversalPianoRoll({ 
  placedNotes, 
  onNoteToggle, 
  currentTask, 
  showSolution, 
  feedback, 
  showLabels, 
  setShowLabels,
  theme
}) {
  const pianoKeysRef = useRef(null);
  const pianoRollRef = useRef(null);
  const noteHeight = 20;
  const lowestNote = 36;  // C2
  const highestNote = 84; // C6
  const totalNotes = highestNote - lowestNote + 1;
  const containerHeight = 600;
  
  // Auto-scroll to center around middle C
  useEffect(() => {
    if (pianoKeysRef.current && pianoRollRef.current) {
      const middleC = 60; // C4
      const notePosition = (highestNote - middleC) * noteHeight;
      const scrollPosition = notePosition - (containerHeight / 2);
      const clampedScroll = Math.max(0, Math.min(scrollPosition, (totalNotes * noteHeight) - containerHeight));
      
      pianoKeysRef.current.scrollTop = clampedScroll;
      pianoRollRef.current.scrollTop = clampedScroll;
    }
  }, []);
  
  const handleNoteClick = (midiNote) => {
    onNoteToggle(midiNote);
  };
  
  // Helper function to check if a note belongs to the current chord (any octave)
  const isNoteInChord = (midiNote) => {
    if (!currentTask) return false;
    const semitone = midiNote % 12;
    const rootSemitone = noteNames.indexOf(currentTask.root);
    
    // Determine which chord types object to use
    const isExtendedChord = ['major7', 'minor7', 'dominant7', 'diminished7', 'halfDiminished7', 'minor7b5', 'maj9', 'min9', 'dom9'].includes(currentTask.chordType);
    const chordTypesObj = isExtendedChord ? extendedChordTypes : chordTypes;
    
    const expectedSemitones = chordTypesObj[currentTask.chordType].intervals.map(interval => 
      (rootSemitone + interval) % 12
    );
    return expectedSemitones.includes(semitone);
  };
  
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white text-center flex-1">Interactive Piano Roll</h3>
        <button
          onClick={() => setShowLabels(!showLabels)}
          className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/40 transition-colors flex items-center justify-center"
          title={showLabels ? "Hide note labels" : "Show note labels"}
        >
          {showLabels ? <EyeOff size={20} className="text-white" /> : <Eye size={20} className="text-white" />}
        </button>
      </div>
      <p className="text-center text-white/70 mb-4">Click on the piano roll to place notes</p>
      
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mx-auto" style={{ width: '600px', height: `${containerHeight}px` }}>
        <div className="flex">
          {/* Piano keys on the left */}
          <div ref={pianoKeysRef} className="w-24 flex-shrink-0 border-r-2 border-gray-300 bg-white overflow-y-hidden" style={{ height: `${containerHeight}px` }}>
            <div style={{ height: `${totalNotes * noteHeight}px` }}>
              {Array.from({ length: totalNotes }, (_, i) => {
                const midiNote = highestNote - i;
                const noteName = getMidiNoteName(midiNote);
                return (
                  <div 
                    key={midiNote} 
                    className="border-b border-gray-200 flex items-center justify-end pr-3"
                    style={{ 
                      height: `${noteHeight}px`,
                      backgroundColor: isBlackKey(midiNote) ? '#6b7280' : '#ffffff',
                      color: isBlackKey(midiNote) ? '#ffffff' : '#000000'
                    }}
                  >
                    <span className={`${
                      isBlackKey(midiNote) ? "text-white" : "text-gray-900"
                    } ${showLabels ? 'opacity-100' : 'opacity-0'}`} style={{
                      fontSize: '12px'
                    }}>
                      {noteName}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Note placement area */}
          <div ref={pianoRollRef} className="flex-1 bg-gradient-to-r from-gray-50 to-gray-100 overflow-y-auto cursor-pointer" style={{ height: `${containerHeight}px` }} onScroll={(e) => { 
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
                    className={`absolute left-0 right-0 hover:bg-gray-200 ${
                      isBlackKey(midiNote) ? "border-b border-gray-300" : "border-b border-gray-200"
                    }`}
                    style={{ top: `${i * noteHeight}px`, height: `${noteHeight}px` }}
                    onClick={() => handleNoteClick(midiNote)}
                  />
                );
              })}
              
              {/* Placed notes */}
              {placedNotes.map((midiNote, index) => {
                const yPos = (highestNote - midiNote) * noteHeight;
                const isCorrect = isNoteInChord(midiNote);
                
                // Determine note color based on feedback state and theme
                let noteColorClass;
                if (feedback && feedback.isCorrect !== undefined) {
                  // After submission
                  if (feedback.isCorrect) {
                    noteColorClass = theme.pianoRoll.correctNotes;
                  } else {
                    noteColorClass = isCorrect 
                      ? theme.pianoRoll.correctNotes
                      : theme.pianoRoll.incorrectNotes;
                  }
                } else {
                  // While placing - use theme color
                  noteColorClass = theme.pianoRoll.placedNotes;
                }
                
                return (
                  <div
                    key={`placed-${index}`}
                    className={`absolute rounded-lg shadow-lg cursor-pointer hover:opacity-80 ${noteColorClass}`}
                    style={{
                      left: '20px',
                      top: `${yPos + 2}px`,
                      width: '400px',
                      height: `${noteHeight - 4}px`
                    }}
                    onClick={() => handleNoteClick(midiNote)}
                  >
                  </div>
                );
              })}
              
              {/* Solution notes (when showing solution) */}
              {showSolution && currentTask && currentTask.expectedNotes && currentTask.expectedNotes.map((midiNote, index) => {
                if (placedNotes.includes(midiNote)) return null; // Don't show if already placed
                
                const yPos = (highestNote - midiNote) * noteHeight;
                
                return (
                  <div
                    key={`solution-${index}`}
                    className="absolute bg-blue-400 border-blue-500 rounded-lg shadow-lg opacity-70"
                    style={{
                      left: '20px',
                      top: `${yPos + 2}px`,
                      width: '400px',
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

// Universal Score Display - Single Implementation for ALL Levels  
function UniversalScoreDisplay({ correct, total, streak, currentTime, avgTime, isAnswered, totalProblems, theme }) {
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
  const progress = Math.round((total / totalProblems) * 100);
  
  return (
    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mb-6">
      <div className="mb-4">
        <div className="flex justify-between text-sm text-white/70 mb-2">
          <span>Progress: {total}/{totalProblems}</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${theme.progressBar}`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
      
      <div className="grid grid-cols-5 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold text-white">
            {currentTime.toFixed(1)}s
          </div>
          <div className="text-sm text-white/70">Current Time</div>
        </div>
        <div>
          <div className={`text-2xl font-bold ${
            avgTime > 0 && avgTime <= 8 ? 'text-green-600' : avgTime > 8 ? 'text-red-600' : 'text-white'
          }`}>
            {avgTime > 0 ? avgTime.toFixed(1) : '0.0'}s
          </div>
          <div className="text-sm text-white/70">Average Time</div>
        </div>
        <div>
          <div className={`text-2xl font-bold ${
            accuracy >= 85 ? 'text-green-600' : accuracy >= 70 ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {accuracy}%
          </div>
          <div className="text-sm text-white/70">Accuracy</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-white">
            {correct}
          </div>
          <div className="text-sm text-white/70">Correct</div>
        </div>
        <div>
          <div className={`text-2xl font-bold ${
            streak >= 5 ? 'text-green-600' : streak >= 3 ? 'text-yellow-600' : 'text-white'
          }`}>
            {streak}
          </div>
          <div className="text-sm text-white/70">Streak</div>
        </div>
      </div>
    </div>
  );
}

// Universal Chord Constructor - SINGLE CONTROLLER FOR ALL LEVELS
export function UniversalChordConstructor({ levelConfig }) {
  // Get theme for this level
  const theme = THEMES[levelConfig.theme] || THEMES.emerald;
  
  // Universal state management (same for all levels)
  const [currentTask, setCurrentTask] = useState(null);
  const [placedNotes, setPlacedNotes] = useState([]);
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
  const [showSolution, setShowSolution] = useState(false);
  const [showLabels, setShowLabels] = useState(true);
  const timerRef = useRef(null);
  
  // Universal configuration
  const TOTAL_PROBLEMS = levelConfig.totalProblems || 20;
  const PASS_ACCURACY = levelConfig.passRequirements.accuracy || 85;
  const PASS_TIME = levelConfig.passRequirements.time || 10;

  // Generate task based on level configuration
  const generateConstructionTask = (previousTask = null) => {
    const roots = ['C', 'D', 'E', 'F', 'G', 'A', 'B']; // Natural notes only
    const availableChordTypes = levelConfig.chordTypes || ['major', 'minor', 'diminished', 'augmented'];
    
    let root, chordTypeKey, inversion, attempt = 0;
    
    // Prevent exact same task appearing twice in a row
    do {
      root = roots[Math.floor(Math.random() * roots.length)];
      chordTypeKey = availableChordTypes[Math.floor(Math.random() * availableChordTypes.length)];
      
      // Handle inversion logic based on level configuration
      const inversionRules = levelConfig.inversionRules;
      if (!inversionRules.allowInversions) {
        // Level 5: Root position only
        inversion = 'root';
      } else if (inversionRules.requireSpecificInversion === 'first') {
        // Level 6: Mix of root and first inversion (exclude augmented for inversions)
        if (Math.random() < 0.5) {
          // 50% chance of root position (any chord type)
          inversion = 'root';
        } else {
          // 50% chance of first inversion (exclude augmented)
          if (chordTypeKey === 'augmented') {
            const nonAugmentedChords = ['major', 'minor', 'diminished'];
            chordTypeKey = nonAugmentedChords[Math.floor(Math.random() * nonAugmentedChords.length)];
          }
          inversion = 'first';
        }
      } else if (inversionRules.allowInversions && !inversionRules.requireSpecificInversion) {
        // Level 7: All inversions (exclude augmented for inversions)
        const inversionChoice = Math.random();
        if (inversionChoice < 0.33) {
          // 33% chance of root position (any chord type)
          inversion = 'root';
        } else if (inversionChoice < 0.67) {
          // 33% chance of first inversion (exclude augmented)
          if (chordTypeKey === 'augmented') {
            const nonAugmentedChords = ['major', 'minor', 'diminished'];
            chordTypeKey = nonAugmentedChords[Math.floor(Math.random() * nonAugmentedChords.length)];
          }
          inversion = 'first';
        } else {
          // 33% chance of second inversion (exclude augmented)
          if (chordTypeKey === 'augmented') {
            const nonAugmentedChords = ['major', 'minor', 'diminished'];
            chordTypeKey = nonAugmentedChords[Math.floor(Math.random() * nonAugmentedChords.length)];
          }
          inversion = 'second';
        }
      } else {
        // Default fallback
        inversion = 'root';
      }
      
      attempt++;
      
      // If we've tried many times, just accept any different combination
      if (attempt > 20) break;
      
    } while (previousTask && 
             previousTask.root === root && 
             previousTask.chordType === chordTypeKey &&
             previousTask.inversion === inversion);
    
    // Determine which chord types object to use based on chord type
    const isExtendedChord = ['major7', 'minor7', 'dominant7', 'diminished7', 'halfDiminished7', 'minor7b5', 'maj9', 'min9', 'dom9', 'maj11', 'min11', 'maj13', 'min13'].includes(chordTypeKey);
    const chordTypesObj = isExtendedChord ? extendedChordTypes : chordTypes;
    const chordType = chordTypesObj[chordTypeKey];
    
    // Choose octave (C3=48, C4=60) - avoid C5 for inversions
    const baseOctaves = inversion === 'root' ? [48, 60, 72] : [48, 60]; // C3, C4 (C5 only for root)
    const baseOctave = baseOctaves[Math.floor(Math.random() * baseOctaves.length)];
    
    const rootNoteNumber = noteNames.indexOf(root);
    const baseRoot = rootNoteNumber + baseOctave;
    const intervals = chordType.intervals;
    
    let expectedNotes;
    let inversionDescription;
    let chordName = root + chordType.symbol;
    
    if (inversion === 'root') {
      // Root position
      expectedNotes = intervals.map(interval => baseRoot + interval);
      inversionDescription = '';
    } else {
      // Apply inversion - reorder intervals
      const inversionOrder = inversionTypes[inversion].intervalOrder;
      const reorderedIntervals = inversionOrder.map(index => intervals[index]);
      
      // Create notes with proper voicing for inversion
      expectedNotes = [];
      
      for (let i = 0; i < reorderedIntervals.length; i++) {
        if (i === 0) {
          expectedNotes.push(baseRoot + reorderedIntervals[i]);
        } else {
          let nextNote = baseRoot + reorderedIntervals[i];
          // Ensure ascending order
          while (nextNote <= expectedNotes[expectedNotes.length - 1]) {
            nextNote += 12;
          }
          expectedNotes.push(nextNote);
        }
      }
      
      // Create chord name with slash notation for inversions
      if (inversion === 'first') {
        inversionDescription = ' in 1st inversion';
        // Calculate bass note for slash notation (3rd of the chord)
        const rootIndex = noteNames.indexOf(root);
        const bassInterval = intervals[1]; // First inversion has 3rd in bass
        const bassNote = noteNames[(rootIndex + bassInterval) % 12];
        chordName += `/${bassNote}`;
      } else if (inversion === 'second') {
        inversionDescription = ' in 2nd inversion';
        // Calculate bass note for slash notation (5th of the chord)
        const rootIndex = noteNames.indexOf(root);
        const bassInterval = intervals[2]; // Second inversion has 5th in bass
        const bassNote = noteNames[(rootIndex + bassInterval) % 12];
        chordName += `/${bassNote}`;
      }
    }
    
    // Ensure notes are within piano range
    const validNotes = expectedNotes.filter(note => note >= 36 && note <= 84); // C2 to C6
    
    return {
      root,
      chordType: chordTypeKey,
      inversion,
      chordName,
      description: `${root} ${chordType.name}${inversionDescription}`,
      expectedNotes: validNotes,
      baseOctave
    };
  };

  // Universal validation (adapts to level requirements)
  const validateChord = () => {
    if (!currentTask || placedNotes.length === 0) return false;
    
    // Determine which chord types object to use
    const isExtendedChord = ['major7', 'minor7', 'dominant7', 'diminished7', 'halfDiminished7', 'minor7b5', 'maj9', 'min9', 'dom9'].includes(currentTask.chordType);
    const chordTypesObj = isExtendedChord ? extendedChordTypes : chordTypes;
    
    // Check correct number of notes
    const expectedNoteCount = chordTypesObj[currentTask.chordType].intervals.length;
    if (placedNotes.length !== expectedNoteCount) return false;
    
    const sortedPlacedNotes = [...placedNotes].sort((a, b) => a - b);
    const placedSemitones = sortedPlacedNotes.map(note => note % 12);
    
    // Get the expected chord structure for the inversion
    const baseIntervals = chordTypesObj[currentTask.chordType].intervals;
    let expectedSemitonePattern;
    
    if (!currentTask.inversion || currentTask.inversion === 'root') {
      // Root position: use base intervals from root note
      const rootSemitone = noteNames.indexOf(currentTask.root) % 12;
      expectedSemitonePattern = baseIntervals.map(interval => (rootSemitone + interval) % 12);
    } else if (currentTask.inversion === 'first') {
      // First inversion: third is in bass
      const rootSemitone = noteNames.indexOf(currentTask.root) % 12;
      const thirdSemitone = (rootSemitone + baseIntervals[1]) % 12; // Third in bass
      const fifthSemitone = (rootSemitone + baseIntervals[2]) % 12; // Fifth
      const octaveRootSemitone = rootSemitone; // Root on top
      expectedSemitonePattern = [thirdSemitone, fifthSemitone, octaveRootSemitone];
    } else if (currentTask.inversion === 'second') {
      // Second inversion: fifth is in bass
      const rootSemitone = noteNames.indexOf(currentTask.root) % 12;
      const fifthSemitone = (rootSemitone + baseIntervals[2]) % 12; // Fifth in bass
      const octaveRootSemitone = rootSemitone; // Root
      const thirdSemitone = (rootSemitone + baseIntervals[1]) % 12; // Third on top
      expectedSemitonePattern = [fifthSemitone, octaveRootSemitone, thirdSemitone];
    }
    
    // Sort both patterns for comparison (handles any octave)
    const sortedExpected = [...expectedSemitonePattern].sort((a, b) => a - b);
    const sortedPlaced = [...placedSemitones].sort((a, b) => a - b);
    
    // For inversion validation, we also need to check the bass note
    if (currentTask.inversion === 'first') {
      // First inversion: bass note should be the third of the chord
      const expectedBass = (noteNames.indexOf(currentTask.root) + baseIntervals[1]) % 12;
      const actualBass = placedSemitones[0]; // Lowest note
      
      // Check both: correct pitches AND correct bass note
      return sortedExpected.length === sortedPlaced.length &&
             sortedExpected.every((semitone, index) => semitone === sortedPlaced[index]) &&
             expectedBass === actualBass;
    } else if (currentTask.inversion === 'second') {
      // Second inversion: bass note should be the fifth of the chord
      const expectedBass = (noteNames.indexOf(currentTask.root) + baseIntervals[2]) % 12;
      const actualBass = placedSemitones[0]; // Lowest note
      
      return sortedExpected.length === sortedPlaced.length &&
             sortedExpected.every((semitone, index) => semitone === sortedPlaced[index]) &&
             expectedBass === actualBass;
    } else {
      // Root position: bass note should be the root
      const expectedBass = noteNames.indexOf(currentTask.root) % 12;
      const actualBass = placedSemitones[0]; // Lowest note
      
      return sortedExpected.length === sortedPlaced.length &&
             sortedExpected.every((semitone, index) => semitone === sortedPlaced[index]) &&
             expectedBass === actualBass;
    }
  };

  // Universal level start
  const startLevel = () => {
    setHasStarted(true);
    const task = generateConstructionTask(currentTask);
    setCurrentTask(task);
    const now = Date.now();
    setStartTime(now);
    setCurrentTime(0);
  };

  // Universal next task
  const nextTask = () => {
    const task = generateConstructionTask(currentTask);
    setCurrentTask(task);
    setPlacedNotes([]);
    setFeedback(null);
    setIsAnswered(false);
    setShowSolution(false);
    const now = Date.now();
    setStartTime(now);
    setCurrentTime(0);
  };

  // Universal timer
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

  // Universal note toggle
  const handleNoteToggle = (midiNote) => {
    if (isAnswered) return;
    
    setPlacedNotes(prev => {
      if (prev.includes(midiNote)) {
        return prev.filter(note => note !== midiNote);
      } else {
        return [...prev, midiNote].sort((a, b) => a - b);
      }
    });
  };

  // Universal submit handler
  const handleSubmit = () => {
    if (!currentTask || !startTime) return;
    
    const endTime = Date.now();
    const timeTaken = (endTime - startTime) / 1000;
    
    const isCorrect = validateChord();
    
    setFeedback({
      isCorrect,
      timeTaken: timeTaken,
      expectedNotes: currentTask.expectedNotes,
      placedNotes: [...placedNotes]
    });
    
    if (!isCorrect) {
      setShowSolution(true);
    }
    
    setScore(prev => {
      const newTotal = prev.total + 1;
      const newTotalTime = totalTime + timeTaken;
      const newAvgTime = newTotalTime / newTotal;
      
      setTotalTime(newTotalTime);
      setAvgTime(newAvgTime);
      
      const newCorrect = prev.correct + (isCorrect ? 1 : 0);
      const newStreak = isCorrect ? prev.streak + 1 : 0;
      
      // Check if level is completed
      if (newTotal >= TOTAL_PROBLEMS) {
        const finalAccuracy = (newCorrect / newTotal) * 100;
        const passed = finalAccuracy >= PASS_ACCURACY && newAvgTime <= PASS_TIME;
        
        setLevelResult({
          passed,
          accuracy: finalAccuracy,
          avgTime: newAvgTime,
          totalCorrect: newCorrect,
          totalQuestions: newTotal
        });
        setIsCompleted(true);
      }
      
      return {
        correct: newCorrect,
        total: newTotal,
        streak: newStreak
      };
    });
    
    setIsAnswered(true);
    
    // Auto-advance to next task after delay
    const delay = isCorrect ? 1500 : 4000;
    setTimeout(() => {
      if (score.total + 1 < TOTAL_PROBLEMS) {
        nextTask();
      }
    }, delay);
  };

  // Universal Start Screen
  if (!hasStarted) {
    return (
      <div className={`min-h-screen ${theme.background}`}>
        <header className="bg-black/20 backdrop-blur-md border-b border-white/10 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/chord-construction" className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
                <span className="text-white text-sm font-bold">←</span>
              </Link>
              <h1 className="text-xl font-bold text-white">
                {levelConfig.title}
              </h1>
            </div>
            <Link to="/" className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
              <span className="text-white text-sm font-bold">♪</span>
            </Link>
          </div>
        </header>
        
        <main className="max-w-6xl mx-auto p-6">
          <div className="flex flex-col lg:flex-row gap-8 items-start justify-center min-h-[80vh]">
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-8 lg:w-1/2">
              <h2 className="text-3xl font-bold text-white mb-6">Ready to Start {levelConfig.title}?</h2>
              <div className="text-lg text-white/80 mb-8 space-y-2">
                <p><strong>{TOTAL_PROBLEMS} problems</strong> to complete</p>
                <p>Build <strong>{levelConfig.description || 'chords'}</strong> by placing notes on the piano roll</p>
                <p>Need <strong>{PASS_ACCURACY}% accuracy</strong> to pass</p>
                <p>Average time must be under <strong>{PASS_TIME} seconds</strong></p>
              </div>
              <button
                onClick={startLevel}
                className={`px-12 py-4 text-white text-xl font-bold rounded-xl transition-colors shadow-lg ${theme.buttons.primary}`}
              >
                Start {levelConfig.title}
              </button>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 lg:w-1/2">
              <h3 className="text-2xl font-bold text-white mb-6 text-center">How to Build Chords</h3>
              <div className="space-y-4 text-white/80">
                <div className="bg-white/10 rounded-xl p-4">
                  <h4 className="font-bold mb-2">Instructions</h4>
                  <p className="text-sm">You'll be asked to build specific chords. Click on the piano roll to place the correct notes.</p>
                </div>
                
                <div className="bg-white/10 rounded-xl p-4">
                  <h4 className="font-bold mb-2">Available Chord Types</h4>
                  <ul className="text-sm space-y-1">
                    {levelConfig.chordTypes.map(type => {
                      // Determine which chord types object to use
                      const isExtendedChord = ['major7', 'minor7', 'dominant7', 'diminished7', 'halfDiminished7', 'minor7b5', 'maj9', 'min9', 'dom9'].includes(type);
                      const chordTypesObj = isExtendedChord ? extendedChordTypes : chordTypes;
                      const chordInfo = chordTypesObj[type];
                      return (
                        <li key={type}>• <strong>{chordInfo.name}:</strong> {chordInfo.description || 'Basic chord structure'}</li>
                      );
                    })}
                  </ul>
                </div>
                
                <div className="bg-white/10 rounded-xl p-4">
                  <h4 className="font-bold mb-2">Visual Feedback</h4>
                  <p className="text-sm">Green notes = correct placement, Red notes = incorrect placement.</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }
  
  // Universal Completion Screen
  if (isCompleted && levelResult) {
    return (
      <div className={`min-h-screen ${theme.background}`}>
        <header className="bg-black/20 backdrop-blur-md border-b border-white/10 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/chord-construction" className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
                <span className="text-white text-sm font-bold">←</span>
              </Link>
              <h1 className="text-xl font-bold text-white">
                {levelConfig.title}: Complete!
              </h1>
            </div>
            <Link to="/" className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
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
                <div className="text-white/70">Accuracy (need {PASS_ACCURACY}%)</div>
              </div>
              <div className="text-center">
                <div className={`text-3xl font-bold ${
                  levelResult.avgTime <= PASS_TIME ? 'text-green-600' : 'text-red-600'
                }`}>
                  {levelResult.avgTime.toFixed(1)}s
                </div>
                <div className="text-white/70">Avg Time (need ≤{PASS_TIME}s)</div>
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
                  setCurrentTask(null);
                  setFeedback(null);
                  setPlacedNotes([]);
                }}
                className={`px-6 py-3 text-white font-semibold rounded-xl transition-colors ${theme.buttons.primary}`}
              >
                Try Again
              </button>
              <Link
                to="/chord-construction"
                className="px-6 py-3 bg-white/20 text-white font-semibold rounded-xl hover:bg-white/30 transition-colors"
              >
                Back to Levels
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }
  
  if (!currentTask) {
    return <div>Loading...</div>;
  }

  // Universal Game Screen - SINGLE IMPLEMENTATION FOR ALL LEVELS
  return (
    <div className={`min-h-screen ${theme.background}`}>
      <header className="bg-black/20 backdrop-blur-md border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/chord-construction" className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
              <span className="text-white text-sm font-bold">←</span>
            </Link>
            <h1 className="text-xl font-bold text-white">
              {levelConfig.title} - Problem {score.total + 1}/{TOTAL_PROBLEMS}
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
        {/* Universal Progress bar */}
        <div className="mb-8">
          <div className="w-full bg-white/10 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-300 ${theme.progressBar}`}
              style={{ width: `${(score.total / TOTAL_PROBLEMS) * 100}%` }}
            />
          </div>
        </div>

        <div className="flex flex-col xl:flex-row gap-8 items-start">
          {/* Main content */}
          <div className="flex-1">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6 text-center">
                Build this chord
              </h2>
              
              {/* Universal Piano Display */}
              <UniversalPianoRoll 
                placedNotes={placedNotes}
                onNoteToggle={handleNoteToggle}
                currentTask={currentTask}
                showSolution={showSolution}
                feedback={feedback}
                showLabels={showLabels}
                setShowLabels={setShowLabels}
                theme={theme}
              />
              
              {/* Target chord info */}
              <div className="text-center mb-6">
                <div className={`text-3xl font-bold mb-2 ${theme.text}`}>{currentTask.chordName}</div>
                <p className="text-white/70">{currentTask.description}</p>
              </div>

              {/* Input area */}
              <div className="space-y-4">
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => setPlacedNotes([])}
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
                
                {/* Feedback */}
                {feedback && (
                  <div className={`p-4 rounded-lg ${
                    feedback.isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    <p className="font-semibold">
                      {feedback.isCorrect ? '✓ Perfect!' : '✗ Not quite right'}
                    </p>
                    {!feedback.isCorrect && (
                      <div className="mt-2">
                        <p>Expected notes: {feedback.expectedNotes.map(note => getMidiNoteName(note)).join(', ')}</p>
                        <p>Your notes: {feedback.placedNotes.map(note => getMidiNoteName(note)).join(', ')}</p>
                      </div>
                    )}
                    {feedback.isCorrect && (
                      <p className="mt-2">Excellent chord construction!</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Universal Stats sidebar */}
          <div className="xl:w-80">
            <UniversalScoreDisplay
              correct={score.correct}
              total={score.total}
              streak={score.streak}
              currentTime={currentTime}
              avgTime={avgTime}
              isAnswered={isAnswered}
              totalProblems={TOTAL_PROBLEMS}
              theme={theme}
            />
            
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mt-4">
              <h3 className="text-xl font-bold text-white mb-4">Instructions</h3>
              <div className="text-sm text-white/70 space-y-1">
                <p>• Click notes on the piano roll</p>
                <p>• Build the requested chord</p>
                <p>• Green notes = correct placement</p>
                <p>• Red notes = incorrect placement</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}