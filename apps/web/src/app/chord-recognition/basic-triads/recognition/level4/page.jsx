"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router";
import { CompactAuthButton } from "../../../../../components/auth/AuthButton.jsx";
import { noteNames, chordTypes, getMidiNoteName, isBlackKey } from "../../shared/chordLogic.js";
import ChordPianoDisplay from "../../shared/ChordPianoDisplay.jsx";

// Generate open voicing chord with octave doubling and wide spacing
const generateOpenVoicingChord = (previousChord = null) => {
  const rootNotes = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]; // All 12 notes
  const chordTypeKeys = ['major', 'minor', 'diminished', 'augmented'];
  
  let rootNote, chordTypeKey, attempt = 0;
  
  // Prevent exact same chord appearing twice in a row
  do {
    rootNote = rootNotes[Math.floor(Math.random() * rootNotes.length)];
    chordTypeKey = chordTypeKeys[Math.floor(Math.random() * chordTypeKeys.length)];
    attempt++;
    
    // If we've tried many times, just accept any different combination
    if (attempt > 20) break;
    
  } while (previousChord && 
           previousChord.rootNote === rootNote && 
           previousChord.chordTypeKey === chordTypeKey);
  
  const chordType = chordTypes[chordTypeKey];
  
  // Generate base notes in middle register
  const baseOctave = 4;
  const baseNotes = chordType.intervals.map(interval => 
    (rootNote + interval) % 12 + (baseOctave * 12)
  );
  
  // Create open voicing with octave doubling and wide spacing
  const openVoicingNotes = [];
  
  // Strategy 1: Wide spacing (30% chance)
  if (Math.random() < 0.3) {
    // Spread notes across 2-3 octaves with gaps
    const lowOctave = 3;
    const midOctave = 4;
    const highOctave = 5;
    
    // Root in bass
    openVoicingNotes.push((rootNote % 12) + (lowOctave * 12));
    
    // Some chord tones in middle register
    const midNotes = chordType.intervals.slice(1).map(interval => 
      (rootNote + interval) % 12 + (midOctave * 12)
    );
    openVoicingNotes.push(...midNotes);
    
    // Possible octave doubling in higher register
    if (Math.random() < 0.5) {
      openVoicingNotes.push((rootNote % 12) + (highOctave * 12));
    }
  }
  // Strategy 2: Octave doubling (40% chance)
  else if (Math.random() < 0.4) {
    // Standard voicing with octave doubling
    openVoicingNotes.push(...baseNotes);
    
    // Add octave doubling of root or fifth
    const doublingTarget = Math.random() < 0.7 ? 0 : 2; // Root or fifth
    const doublingInterval = chordType.intervals[doublingTarget];
    const octaveDoubling = (rootNote + doublingInterval) % 12 + ((baseOctave + 1) * 12);
    openVoicingNotes.push(octaveDoubling);
  }
  // Strategy 3: Mixed open voicing (30% chance)
  else {
    // Lower notes
    const lowOctave = 3;
    openVoicingNotes.push((rootNote % 12) + (lowOctave * 12));
    
    // Middle notes - include all chord tones but spread them out
    chordType.intervals.slice(1).forEach(interval => {
      openVoicingNotes.push((rootNote + interval) % 12 + (baseOctave * 12));
    });
    
    // High register - add octave doubling of root or another chord tone
    const doublingInterval = chordType.intervals[Math.floor(Math.random() * chordType.intervals.length)];
    const highNote = (rootNote + doublingInterval) % 12 + ((baseOctave + 1) * 12);
    openVoicingNotes.push(highNote);
  }
  
  // Remove exact duplicates and sort, but ensure all chord tones are represented
  const uniqueNotes = [...new Set(openVoicingNotes)].sort((a, b) => a - b);
  
  // Verify all chord tones are present (check interval classes)
  const presentIntervalClasses = new Set(uniqueNotes.map(note => note % 12));
  const requiredIntervalClasses = new Set(chordType.intervals.map(interval => (rootNote + interval) % 12));
  
  // If any chord tone is missing, add it in a suitable octave
  for (const requiredInterval of chordType.intervals) {
    const requiredNote = (rootNote + requiredInterval) % 12;
    if (!presentIntervalClasses.has(requiredNote)) {
      // Add the missing note in the middle octave
      const missingNote = requiredNote + (baseOctave * 12);
      uniqueNotes.push(missingNote);
    }
  }
  
  // Sort again after potentially adding missing notes
  uniqueNotes.sort((a, b) => a - b);
  
  const expectedAnswer = noteNames[rootNote] + chordType.symbol;
  
  // Debug logging to verify all chord tones are present
  const finalIntervalClasses = uniqueNotes.map(note => note % 12);
  const expectedIntervalClasses = chordType.intervals.map(interval => (rootNote + interval) % 12);
  console.log('Open voicing debug:', {
    chord: expectedAnswer,
    expectedIntervals: expectedIntervalClasses,
    presentIntervals: finalIntervalClasses,
    allTonesPresent: expectedIntervalClasses.every(interval => finalIntervalClasses.includes(interval)),
    notes: uniqueNotes.map(note => getMidiNoteName(note))
  });
  
  return {
    notes: uniqueNotes,
    expectedAnswer: expectedAnswer,
    explanation: `${noteNames[rootNote]} ${chordType.name || 'Major'} (Open Voicing)`,
    rootNote: rootNote,
    chordTypeKey: chordTypeKey
  };
};

// Score display component
function ScoreDisplay({ correct, total, streak, currentTime, avgTime, isAnswered, totalProblems }) {
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
  const progress = Math.round((total / totalProblems) * 100);
  
  return (
    <div className="bg-black/20 backdrop-blur-sm rounded-xl p-4 mb-6">
      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-white/70 mb-2">
          <span>Progress: {total}/{totalProblems}</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-orange-500 h-2 rounded-full transition-all duration-300" 
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

// Validate user's answer against expected answer
const validateAnswer = (userAnswer, expectedAnswer) => {
  const normalizeAnswer = (answer) => {
    return answer.toLowerCase()
      .replace(/\s+/g, '')
      .replace(/♯/g, '#')
      .replace(/♭/g, 'b')
      .replace(/°/g, 'dim')
      .replace(/∘/g, 'dim')
      .replace(/\+/g, 'aug');
  };

  const normalized = normalizeAnswer(userAnswer);
  const expected = normalizeAnswer(expectedAnswer);
  
  // Create a set of acceptable answers
  const acceptableAnswers = new Set();
  
  // Parse the expected answer to get root note and chord type
  const match = expected.match(/^([a-g][#b]?)(.*)$/i);
  if (!match) return false;
  
  const [, rootNote, chordTypePart] = match;
  
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
    
    // For augmented chords, also accept the other two enharmonically equivalent augmented chords
    // Since augmented chords are symmetrical (all major thirds), each "inversion" = different root aug chord
    const rootIndex = noteNames.findIndex(note => note.toLowerCase() === rootNote.toLowerCase());
    if (rootIndex !== -1) {
      // Third of the augmented chord (major third up)
      const thirdIndex = (rootIndex + 4) % 12;
      const thirdRoot = noteNames[thirdIndex];
      acceptableAnswers.add(normalizeAnswer(thirdRoot + 'aug'));
      acceptableAnswers.add(normalizeAnswer(thirdRoot + 'augmented'));
      acceptableAnswers.add(normalizeAnswer(thirdRoot + '+'));
      
      // Fifth of the augmented chord (augmented fifth up)
      const fifthIndex = (rootIndex + 8) % 12;
      const fifthRoot = noteNames[fifthIndex];
      acceptableAnswers.add(normalizeAnswer(fifthRoot + 'aug'));
      acceptableAnswers.add(normalizeAnswer(fifthRoot + 'augmented'));
      acceptableAnswers.add(normalizeAnswer(fifthRoot + '+'));
    }
  }
  
  return acceptableAnswers.has(normalized);
};

export default function Level4OpenVoicings() {
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
  const PASS_ACCURACY = 75; // 75% for open voicings
  const PASS_TIME = 12; // 12 seconds for open voicings

  const startLevel = () => {
    setHasStarted(true);
    const chord = generateOpenVoicingChord(currentChord);
    console.log('Generated open voicing chord:', chord);
    setCurrentChord(chord);
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
    const chord = generateOpenVoicingChord(currentChord);
    console.log('Next open voicing chord generated:', chord);
    setCurrentChord(chord);
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
    
    // Auto-advance to next chord after delay
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
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e]">
        <header className="bg-black/20 backdrop-blur-md border-b border-white/10 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/chord-recognition/basic-triads" className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
                <span className="text-white text-sm font-bold">←</span>
              </Link>
              <h1 className="text-xl font-bold text-white">
                Level 4: Open Voicings
              </h1>
            </div>
            <CompactAuthButton />
          </div>
        </header>
        
        <main className="max-w-6xl mx-auto p-6">
          <div className="flex flex-col lg:flex-row gap-8 items-start justify-center min-h-[80vh]">
            {/* Main content */}
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-8 lg:w-1/2">
              <h2 className="text-3xl font-bold text-white mb-6">Ready to Start Level 4?</h2>
              <div className="text-lg text-white/80 mb-8 space-y-2">
                <p><strong>{TOTAL_PROBLEMS} problems</strong> to complete</p>
                <p>Identify triads in <strong>open voicings</strong> with octave doubling and wide spacing</p>
                <p>Need <strong>{PASS_ACCURACY}% accuracy</strong> to pass</p>
                <p>Average time must be under <strong>{PASS_TIME} seconds</strong></p>
              </div>
              <button
                onClick={startLevel}
                className="px-12 py-4 bg-orange-500 text-white text-xl font-bold rounded-xl hover:bg-orange-600 transition-colors shadow-lg"
              >
                Start Level 4
              </button>
            </div>

            {/* Open Voicing Examples */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 lg:w-1/2">
              <h3 className="text-2xl font-bold text-white mb-6 text-center">Open Voicing Examples</h3>
              <div className="space-y-4 text-white/80">
                <div className="bg-white/10 rounded-xl p-4">
                  <h4 className="font-bold mb-2">What are Open Voicings?</h4>
                  <p className="text-sm">Open voicings spread chord tones across multiple octaves with gaps between notes, creating a fuller, more resonant sound than close voicings.</p>
                </div>
                
                <div className="bg-white/10 rounded-xl p-4">
                  <h4 className="font-bold mb-2">Features You'll Encounter:</h4>
                  <ul className="text-sm space-y-1">
                    <li>• <strong>Wide spacing:</strong> Notes spread across 2-3 octaves</li>
                    <li>• <strong>Octave doubling:</strong> Same note in different octaves</li>
                    <li>• <strong>Root in bass:</strong> Often with higher chord tones</li>
                    <li>• <strong>Missing notes:</strong> Some chord tones may be omitted</li>
                  </ul>
                </div>
                
                <div className="bg-white/10 rounded-xl p-4">
                  <h4 className="font-bold mb-2">Tips for Success:</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Focus on the <strong>lowest note</strong> (usually the root)</li>
                    <li>• Identify the <strong>chord quality</strong> (major, minor, dim, aug)</li>
                    <li>• Don't be distracted by <strong>octave doublings</strong></li>
                    <li>• Listen for the overall <strong>harmonic color</strong></li>
                  </ul>
                </div>
                
                <div className="bg-white/10 rounded-xl p-4">
                  <h4 className="font-bold mb-2">Example:</h4>
                  <p className="text-sm">C major open voicing might have: C3, E4, G4, C5 - same chord as close voicing C4-E4-G4, but with wider spacing and octave doubling.</p>
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
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e]">
        <header className="bg-black/20 backdrop-blur-md border-b border-white/10 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/chord-recognition/basic-triads" className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
                <span className="text-white text-sm font-bold">←</span>
              </Link>
              <h1 className="text-xl font-bold text-white">
                Level 4: Complete!
              </h1>
            </div>
            <CompactAuthButton />
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
                  setCurrentChord(null);
                  setFeedback(null);
                }}
                className="px-6 py-3 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-colors"
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
                  to="/chord-recognition/seventh-chords"
                  className="px-6 py-3 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 transition-colors"
                >
                  Continue to Extended Chords
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
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e]">
      <header className="bg-black/20 backdrop-blur-md border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/chord-recognition/basic-triads" className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
              <span className="text-white text-sm font-bold">←</span>
            </Link>
            <h1 className="text-xl font-bold text-white">
              Level 4: Open Voicings - Problem {score.total + 1}/{TOTAL_PROBLEMS}
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
              className="bg-orange-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${(score.total / TOTAL_PROBLEMS) * 100}%` }}
            />
          </div>
        </div>
        
        <div className="flex flex-col xl:flex-row gap-8 items-start">
          {/* Main content */}
          <div className="flex-1">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6 text-center">
                Identify this open voicing chord
              </h2>
              
              {/* Piano Display */}
              <div className="mb-8">
                <ChordPianoDisplay 
                  notes={currentChord.notes} 
                  showLabels={showLabels} 
                  setShowLabels={setShowLabels}
                  noteBlockColor="bg-orange-500"
                  noteBorderColor="border-orange-600"
                  title=""
                  showLabelToggle={false}
                  lowestMidi={24}
                  highestMidi={96}
                />
              </div>
              
              {/* Input area */}
              <div className="space-y-4">
                <input
                  ref={inputRef}
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter chord name (e.g., C, Dm, F#dim, Aaug)"
                  className="w-full px-4 py-3 text-lg rounded-lg border-2 border-white/30 focus:border-orange-400 focus:outline-none bg-white/10 text-white placeholder-white/50"
                  disabled={isAnswered}
                />
                
                <button
                  onClick={handleSubmit}
                  disabled={isAnswered || !userAnswer.trim()}
                  className="w-full py-3 px-6 font-semibold rounded-lg transition-colors bg-orange-500 text-white hover:bg-orange-600 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
                >
                  Submit Answer
                </button>
                
                {/* Feedback */}
                {feedback && (
                  <div className={`p-4 rounded-lg ${
                    feedback.isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    <p className="font-semibold">
                      {feedback.isCorrect ? '✓ Correct!' : '✗ Incorrect'}
                    </p>
                    {!feedback.isCorrect && (
                      <p>The correct answer was: {feedback.correctAnswer}</p>
                    )}
                    <p className="text-sm mt-1">Time: {feedback.timeTaken.toFixed(1)}s</p>
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
                  <span className="font-semibold text-white">{avgTime.toFixed(2)}s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Progress:</span>
                  <span className="font-semibold text-white">
                    {score.total}/{TOTAL_PROBLEMS}
                  </span>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-black/10">
                <h4 className="font-semibold text-white mb-2">Open Voicings:</h4>
                <div className="text-sm text-white/70 space-y-1">
                  <p>• <strong>Wide spacing:</strong> Notes spread across octaves</p>
                  <p>• <strong>Octave doubling:</strong> Same notes in different octaves</p>
                  <p>• <strong>Non-consecutive:</strong> Notes not stacked in thirds</p>
                </div>
                
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}