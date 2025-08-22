"use client";

// UNIVERSAL CONTROLLER IMPLEMENTATION - Level 6 First Inversions
import { UniversalChordConstructor } from "../../shared/UniversalChordConstructor.jsx";
import { LEVEL_CONFIGS } from "../../data/levelConfigs.js";

// Original implementation kept for fallback
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import { Eye, EyeOff } from "lucide-react";
import { noteNames, chordTypes, inversionTypes, getMidiNoteName, isBlackKey } from "../../../chord-recognition/basic-triads/shared/chordLogic.js";

// Feature flag for Universal Controller (set to true to enable)
const USE_UNIVERSAL_CONTROLLER = true; // Change to false to use original implementation

// Generate random chord construction task with inversions
const generateConstructionTask = (previousTask = null) => {
  const roots = ['C', 'D', 'E', 'F', 'G', 'A', 'B']; // Natural notes only
  
  let root, chordType, inversion, attempt = 0;
  
  // Prevent exact same task appearing twice in a row
  do {
    root = roots[Math.floor(Math.random() * roots.length)];
    
    // Level 6: Root position and first inversion (no augmented inversions)
    if (Math.random() < 0.5) {
      // 50% chance of root position (any chord type)
      const chordTypeKeys = ['major', 'minor', 'diminished', 'augmented'];
      chordType = chordTypeKeys[Math.floor(Math.random() * chordTypeKeys.length)];
      inversion = 'root';
    } else {
      // 50% chance of first inversion (exclude augmented)
      const nonAugmentedChords = ['major', 'minor', 'diminished'];
      chordType = nonAugmentedChords[Math.floor(Math.random() * nonAugmentedChords.length)];
      inversion = 'first';
    }
    
    attempt++;
    
    // If we've tried many times, just accept any different combination
    if (attempt > 20) break;
    
  } while (previousTask && 
           previousTask.root === root && 
           previousTask.chordType === chordType &&
           previousTask.inversion === inversion);
  
  // Choose octave (C3=48, C4=60, C5=72)
  const baseOctaves = [48, 60]; // C3, C4 (avoid C5 for inversions)
  const baseOctave = baseOctaves[Math.floor(Math.random() * baseOctaves.length)];
  
  const rootNoteNumber = noteNames.indexOf(root);
  const baseRoot = rootNoteNumber + baseOctave;
  const intervals = chordTypes[chordType].intervals;
  
  let expectedNotes;
  let inversionDescription;
  
  if (inversion === 'root') {
    // Root position
    expectedNotes = intervals.map(interval => baseRoot + interval);
    inversionDescription = '';
  } else {
    // First inversion - reorder intervals
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
    inversionDescription = ' in 1st inversion';
  }
  
  // Ensure notes are within piano range
  const validNotes = expectedNotes.filter(note => note >= 36 && note <= 84); // C2 to C6
  
  // Create chord name with inversion using slash chord notation
  let chordName = root + chordTypes[chordType].symbol;
  if (inversion === 'first') {
    // Calculate bass note for slash notation (3rd of the chord)
    const intervals = chordTypes[chordType].intervals;
    const rootIndex = noteNames.indexOf(root);
    const bassInterval = intervals[1]; // First inversion has 3rd in bass
    const bassNote = noteNames[(rootIndex + bassInterval) % 12];
    chordName += `/${bassNote}`;
  }
  
  return {
    root,
    chordType,
    inversion,
    chordName,
    description: `${root} ${chordTypes[chordType].name}${inversionDescription}`,
    expectedNotes: validNotes,
    baseOctave
  };
};

// Interactive Piano Roll Component (same as Level 5)
function InteractivePianoRoll({ placedNotes, onNoteToggle, currentTask, showSolution, feedback, showLabels, setShowLabels }) {
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
    const expectedSemitones = chordTypes[currentTask.chordType].intervals.map(interval => 
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
                
                // Determine note color based on feedback state
                let noteColorClass;
                if (feedback && feedback.isCorrect !== undefined) {
                  // After submission - show green for correct, red for incorrect
                  if (feedback.isCorrect) {
                    noteColorClass = 'bg-green-500 border-green-600';
                  } else {
                    noteColorClass = isCorrect 
                      ? 'bg-green-500 border-green-600' 
                      : 'bg-red-500 border-red-600';
                  }
                } else {
                  // While placing - show blue for all notes
                  noteColorClass = 'bg-blue-500 border-blue-600';
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
                if (placedNotes.includes(midiNote)) return null;
                
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

// Score display component (same as Level 5)
function ScoreDisplay({ correct, total, streak, currentTime, avgTime, isAnswered, totalProblems }) {
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
  const progress = Math.round((total / totalProblems) * 100);
  
  return (
    <div className="bg-white/20/20 backdrop-blur-sm rounded-xl p-4 mb-6">
      <div className="mb-4">
        <div className="flex justify-between text-sm text-white/70 mb-2">
          <span>Progress: {total}/{totalProblems}</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-teal-500 h-2 rounded-full transition-all duration-300" 
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
            avgTime > 0 && avgTime <= 10 ? 'text-green-600' : avgTime > 10 ? 'text-red-600' : 'text-white'
          }`}>
            {avgTime > 0 ? avgTime.toFixed(1) : '0.0'}s
          </div>
          <div className="text-sm text-white/70">Average Time</div>
        </div>
        <div>
          <div className={`text-2xl font-bold ${
            accuracy >= 80 ? 'text-green-600' : accuracy >= 65 ? 'text-yellow-600' : 'text-red-600'
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

// Original implementation renamed for fallback
function OriginalLevel6Construction() {
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
  
  const TOTAL_PROBLEMS = 25;
  const PASS_ACCURACY = 80; // 80%
  const PASS_TIME = 12; // 12 seconds

  const startLevel = () => {
    setHasStarted(true);
    const task = generateConstructionTask(currentTask);
    setCurrentTask(task);
    const now = Date.now();
    setStartTime(now);
    setCurrentTime(0);
  };

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

  const validateChord = () => {
    if (!currentTask || placedNotes.length === 0) return false;
    
    // For Level 6: Need exactly 3 notes for triads
    if (placedNotes.length !== 3) return false;
    
    const sortedPlacedNotes = [...placedNotes].sort((a, b) => a - b);
    
    // Convert MIDI notes to semitone classes (0-11) while preserving order
    const placedSemitones = sortedPlacedNotes.map(note => note % 12);
    
    // Get the expected chord structure for the inversion
    const baseIntervals = chordTypes[currentTask.chordType].intervals; // [0, 4, 7] for major
    let expectedSemitonePattern;
    
    if (currentTask.inversion === 'root') {
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
    }
    
    // Sort both patterns for comparison (handles any octave)
    const sortedExpected = [...expectedSemitonePattern].sort((a, b) => a - b);
    const sortedPlaced = [...placedSemitones].sort((a, b) => a - b);
    
    // For the inversion shape to be correct, we also need to check the bass note
    if (currentTask.inversion === 'first') {
      // First inversion: bass note should be the third of the chord
      const expectedBass = (noteNames.indexOf(currentTask.root) + baseIntervals[1]) % 12;
      const actualBass = placedSemitones[0]; // Lowest note
      
      // Check both: correct pitches AND correct bass note
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

  // Start screen
  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e] relative">
      {/* Logo in absolute top-left corner */}
      <Link to="/" className="absolute top-2 left-2 z-50">
        <img src="/pailiaq-logo-small.png" alt="Logo" className="w-12 h-12" />
      </Link>
        <header className="bg-white/20/20 backdrop-blur-md border-b border-white/10 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4 ml-16">
              <Link to="/chord-construction" className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
                <span className="text-white text-sm font-bold">←</span>
              </Link>
              <h1 className="text-xl font-bold text-white">
                Level 6: Build First Inversions
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
              <h2 className="text-3xl font-bold text-white mb-6">Ready to Start Level 6?</h2>
              <div className="text-lg text-white/80 mb-8 space-y-2">
                <p><strong>{TOTAL_PROBLEMS} problems</strong> to complete</p>
                <p>Build triads in <strong>root position and 1st inversion</strong></p>
                <p>Need <strong>{PASS_ACCURACY}% accuracy</strong> to pass</p>
                <p>Average time must be under <strong>{PASS_TIME} seconds</strong></p>
              </div>
              <button
                onClick={startLevel}
                className="px-12 py-4 bg-teal-500 text-white text-xl font-bold rounded-xl hover:bg-teal-600 transition-colors shadow-lg"
              >
                Start Level 6
              </button>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 lg:w-1/2">
              <h3 className="text-2xl font-bold text-white mb-6 text-center">Understanding Inversions</h3>
              <div className="space-y-4 text-white/80">
                <div className="bg-white/10 rounded-xl p-4">
                  <h4 className="font-bold mb-2">Root Position</h4>
                  <p className="text-sm">Root note at the bottom. Example: C major = C, E, G</p>
                </div>
                
                <div className="bg-white/10 rounded-xl p-4">
                  <h4 className="font-bold mb-2">1st Inversion</h4>
                  <p className="text-sm">Third at the bottom. Example: C major/1 = E, G, C</p>
                </div>
                
                <div className="bg-white/10 rounded-xl p-4">
                  <h4 className="font-bold mb-2">Notation</h4>
                  <ul className="text-sm space-y-1">
                    <li>• <strong>C</strong> = C major root position</li>
                    <li>• <strong>C/1</strong> = C major 1st inversion</li>
                    <li>• <strong>Dm/1</strong> = D minor 1st inversion</li>
                  </ul>
                </div>
                
                <div className="bg-white/10 rounded-xl p-4">
                  <h4 className="font-bold mb-2">Tips</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Listen for the lowest note first</li>
                    <li>• Notes may span multiple octaves</li>
                    <li>• Focus on chord quality (major/minor)</li>
                  </ul>
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
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e] relative">
      {/* Logo in absolute top-left corner */}
      <Link to="/" className="absolute top-2 left-2 z-50">
        <img src="/pailiaq-logo-small.png" alt="Logo" className="w-12 h-12" />
      </Link>
        <header className="bg-white/20/20 backdrop-blur-md border-b border-white/10 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4 ml-16">
              <Link to="/chord-construction" className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
                <span className="text-white text-sm font-bold">←</span>
              </Link>
              <h1 className="text-xl font-bold text-white">
                Level 6: Complete!
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
                className="px-6 py-3 bg-teal-500 text-white font-semibold rounded-xl hover:bg-teal-600 transition-colors"
              >
                Try Again
              </button>
              <Link
                to="/chord-construction"
                className="px-6 py-3 bg-white/20 text-white font-semibold rounded-xl hover:bg-white/30 transition-colors"
              >
                Back to Levels
              </Link>
              {levelResult.passed && (
                <Link
                  to="/chord-construction/basic-triads/level7"
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
  
  if (!currentTask) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e] relative">
      {/* Logo in absolute top-left corner */}
      <Link to="/" className="absolute top-2 left-2 z-50">
        <img src="/pailiaq-logo-small.png" alt="Logo" className="w-12 h-12" />
      </Link>
      <header className="bg-black/20 backdrop-blur-md border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4 ml-16">
            <Link to="/chord-construction" className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
              <span className="text-white text-sm font-bold">←</span>
            </Link>
            <h1 className="text-xl font-bold text-white">
              Level 6: Build First Inversions - Problem {score.total}/{TOTAL_PROBLEMS}
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
              className="bg-teal-500 h-3 rounded-full transition-all duration-300"
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
              
              {/* Piano Display */}
              <InteractivePianoRoll 
                placedNotes={placedNotes}
                onNoteToggle={handleNoteToggle}
                currentTask={currentTask}
                showSolution={showSolution}
                feedback={feedback}
                showLabels={showLabels}
                setShowLabels={setShowLabels}
              />
              
              {/* Target chord info */}
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-teal-600 mb-2">{currentTask.chordName}</div>
                <p className="text-white/70">{currentTask.description}</p>
              </div>

              {/* Input area */}
              <div className="space-y-4">
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => setPlacedNotes([])}
                    className="px-6 py-3 bg-gray-500 text-white font-semibold rounded-xl hover:bg-gray-600 transition-colors"
                    disabled={isAnswered}
                  >
                    Clear All
                  </button>
                  
                  <button
                    onClick={handleSubmit}
                    disabled={isAnswered || placedNotes.length === 0}
                    className="px-8 py-3 bg-teal-500 text-white font-semibold rounded-xl hover:bg-teal-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
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
                      <p className="mt-2">Excellent inversion construction!</p>
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
                  <span className="font-semibold text-white">{avgTime.toFixed(1)}s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Progress:</span>
                  <span className="font-semibold text-white">
                    {score.total}/{TOTAL_PROBLEMS}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Streak:</span>
                  <span className="font-semibold text-white">{score.streak}</span>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-white/20">
                <h4 className="font-semibold text-white mb-2">Inversion Types:</h4>
                <div className="text-sm text-white/70 space-y-1">
                  <p>• <strong>Root:</strong> C, Dm, Fdim</p>
                  <p>• <strong>1st Inv:</strong> C/1, Dm/1, Fdim/1</p>
                  <p>• <strong>Slash:</strong> C/E, Dm/F, F°/Ab</p>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-white/20">
                <h4 className="font-semibold text-white mb-2">Instructions:</h4>
                <div className="text-sm text-white/70 space-y-1">
                  <p>• Click notes on the piano roll</p>
                  <p>• Build the requested chord</p>
                  <p>• Green notes = correct placement</p>
                  <p>• Red notes = incorrect placement</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// ===== MAIN COMPONENT - USES FEATURE FLAG =====
export default function Level6Construction() {
  if (USE_UNIVERSAL_CONTROLLER) {
    // Use the new Universal Controller - SINGLE SOURCE OF TRUTH FOR UI
    return (
      <UniversalChordConstructor 
        levelConfig={LEVEL_CONFIGS["basic-triads-level6"]} 
      />
    );
  } else {
    // Fallback to original implementation
    return <OriginalLevel6Construction />;
  }
}