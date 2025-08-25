"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link } from "react-router";

// Music theory utilities for chord progressions
const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Major and minor key signatures with correct scale notes
const keySignatures = {
  // Major keys - each key contains the 7 notes of its major scale
  'C': { type: 'major', notes: ['C', 'D', 'E', 'F', 'G', 'A', 'B'] },
  'G': { type: 'major', notes: ['G', 'A', 'B', 'C', 'D', 'E', 'F# / Gb'] },
  'D': { type: 'major', notes: ['D', 'E', 'F# / Gb', 'G', 'A', 'B', 'C# / Db'] },
  'A': { type: 'major', notes: ['A', 'B', 'C# / Db', 'D', 'E', 'F# / Gb', 'G# / Ab'] },
  'E': { type: 'major', notes: ['E', 'F# / Gb', 'G# / Ab', 'A', 'B', 'C# / Db', 'D# / Eb'] },
  'B': { type: 'major', notes: ['B', 'C# / Db', 'D# / Eb', 'E', 'F# / Gb', 'G# / Ab', 'A# / Bb'] },
  'F#': { type: 'major', notes: ['F# / Gb', 'G# / Ab', 'A# / Bb', 'B', 'C# / Db', 'D# / Eb', 'E# / F'] },
  'C#': { type: 'major', notes: ['C# / Db', 'D# / Eb', 'E# / F', 'F# / Gb', 'G# / Ab', 'A# / Bb', 'B# / C'] },
  'F': { type: 'major', notes: ['F', 'G', 'A', 'Bb', 'C', 'D', 'E'] },
  'Bb': { type: 'major', notes: ['A# / Bb', 'C', 'D', 'D# / Eb', 'F', 'G', 'A'] },
  'Eb': { type: 'major', notes: ['D# / Eb', 'F', 'G', 'G# / Ab', 'A# / Bb', 'C', 'D'] },
  'Ab': { type: 'major', notes: ['G# / Ab', 'A# / Bb', 'C', 'C# / Db', 'D# / Eb', 'F', 'G'] },
  'Db': { type: 'major', notes: ['C# / Db', 'D# / Eb', 'F', 'F# / Gb', 'G# / Ab', 'A# / Bb', 'C'] },
  'Gb': { type: 'major', notes: ['F# / Gb', 'G# / Ab', 'A# / Bb', 'B / Cb', 'C# / Db', 'D# / Eb', 'F'] },
  'Cb': { type: 'major', notes: ['B / Cb', 'C# / Db', 'D# / Eb', 'E / Fb', 'F# / Gb', 'G# / Ab', 'A# / Bb'] },
  
  // Minor keys - each key contains the 7 notes of its natural minor scale
  'Am': { type: 'minor', notes: ['A', 'B', 'C', 'D', 'E', 'F', 'G'] },
  'Em': { type: 'minor', notes: ['E', 'F# / Gb', 'G', 'A', 'B', 'C', 'D'] },
  'Bm': { type: 'minor', notes: ['B', 'C# / Db', 'D', 'E', 'F# / Gb', 'G', 'A'] },
  'F#m': { type: 'minor', notes: ['F# / Gb', 'G# / Ab', 'A', 'B', 'C# / Db', 'D', 'E'] },
  'C#m': { type: 'minor', notes: ['C# / Db', 'D# / Eb', 'E', 'F# / Gb', 'G# / Ab', 'A', 'B'] },
  'G#m': { type: 'minor', notes: ['G# / Ab', 'A# / Bb', 'B', 'C# / Db', 'D# / Eb', 'E', 'F# / Gb'] },
  'D#m': { type: 'minor', notes: ['D# / Eb', 'E# / F', 'F# / Gb', 'G# / Ab', 'A# / Bb', 'B', 'C# / Db'] },
  'A#m': { type: 'minor', notes: ['A# / Bb', 'B# / C', 'C# / Db', 'D# / Eb', 'E# / F', 'F# / Gb', 'G# / Ab'] },
  'Dm': { type: 'minor', notes: ['D', 'E', 'F', 'G', 'A', 'A# / Bb', 'C'] },
  'Gm': { type: 'minor', notes: ['G', 'A', 'A# / Bb', 'C', 'D', 'D# / Eb', 'F'] },
  'Cm': { type: 'minor', notes: ['C', 'D', 'D# / Eb', 'F', 'G', 'G# / Ab', 'A# / Bb'] },
  'Fm': { type: 'minor', notes: ['F', 'G', 'G# / Ab', 'A# / Bb', 'C', 'C# / Db', 'D# / Eb'] },
  'Bbm': { type: 'minor', notes: ['A# / Bb', 'C', 'C# / Db', 'D# / Eb', 'F', 'F# / Gb', 'G# / Ab'] },
  'Ebm': { type: 'minor', notes: ['D# / Eb', 'F', 'F# / Gb', 'G# / Ab', 'A# / Bb', 'B / Cb', 'C# / Db'] },
  'Abm': { type: 'minor', notes: ['G# / Ab', 'A# / Bb', 'B / Cb', 'C# / Db', 'D# / Eb', 'E / Fb', 'F# / Gb'] }
};

// Roman numeral patterns for major and minor keys
// Minor keys use flat notation relative to major scale of same tonic
const romanNumerals = {
  major: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'],
  minor: ['i', 'ii°', 'bIII', 'iv', 'v', 'bVI', 'bVII']
};

// Common chord progressions (indices correspond to scale degrees)
// Scale degrees: 0=I, 1=ii, 2=iii, 3=IV, 4=V, 5=vi, 6=vii°
const commonProgressions = [
  [0, 4, 5, 0], // I-V-vi-I or i-v-VI-i
  [0, 5, 3, 4], // I-vi-IV-V or i-VI-iv-v
  [0, 3, 4, 0], // I-IV-V-I or i-iv-v-i
  [0, 1, 4, 0], // I-ii-V-I or i-ii°-v-i
  [0, 4, 1, 4], // I-V-ii-V or i-v-ii°-v
  [5, 3, 0, 4], // vi-IV-I-V or VI-iv-i-v
  [0, 6, 3, 4], // I-vii°-IV-V or i-VII-iv-v
  [0, 3, 5, 4], // I-IV-vi-V or i-iv-VI-v
  [0, 2, 3, 0], // I-iii-IV-I or i-III-iv-i
  [2, 5, 3, 4], // iii-vi-IV-V or III-VI-iv-v
  [0, 2, 5, 4], // I-iii-vi-V or i-III-VI-v
  [1, 4, 0, 3], // ii-V-I-IV or ii°-v-i-iv
  [6, 0, 3, 4], // vii°-I-IV-V or VII-i-iv-v
  [0, 6, 1, 4], // I-vii°-ii-V or i-VII-ii°-v
  [2, 6, 0, 4], // iii-vii°-I-V or III-VII-i-v
  [0, 1, 2, 4]  // I-ii-iii-V or i-ii°-III-v
];

// Helper functions
const getMidiNoteName = (midiNote) => {
  const noteNames = ["C","C# / Db","D","D# / Eb","E","F","F# / Gb","G","G# / Ab","A","A# / Bb","B"];
  const octave = Math.floor(midiNote / 12) - 1;
  const note = noteNames[midiNote % 12];
  return `${note}${octave}`;
};

const isBlackKey = (midiNote) => {
  const noteInOctave = midiNote % 12;
  return [1, 3, 6, 8, 10].includes(noteInOctave);
};

// Convert note name to MIDI number (handles flats, sharps, and enharmonic equivalents)
const noteToMidi = (noteName, octave = 4) => {
  // Handle enharmonic equivalents (e.g., "F# / Gb")
  if (noteName.includes(' / ')) {
    noteName = noteName.split(' / ')[0]; // Use the first note name (sharp version)
  }
  
  // Handle flat and sharp notes
  let noteIndex;
  if (noteName.includes('b')) {
    const baseName = noteName[0];
    const baseIndex = noteNames.indexOf(baseName);
    noteIndex = (baseIndex - 1 + 12) % 12; // Flat = one semitone down
  } else if (noteName.includes('#')) {
    const baseName = noteName[0];
    const baseIndex = noteNames.indexOf(baseName);
    noteIndex = (baseIndex + 1) % 12; // Sharp = one semitone up
  } else {
    noteIndex = noteNames.indexOf(noteName);
  }
  
  return noteIndex + (octave + 1) * 12;
};

// Generate chord from scale degree
const generateChordFromScaleDegree = (keySignature, scaleDegree, octave = 4) => {
  const notes = keySignature.notes;
  
  // Build triad using scale degrees (root, third, fifth)
  const root = notes[scaleDegree];
  const third = notes[(scaleDegree + 2) % 7];
  const fifth = notes[(scaleDegree + 4) % 7];
  
  // Convert to MIDI numbers
  const rootMidi = noteToMidi(root, octave);
  let thirdMidi = noteToMidi(third, octave);
  let fifthMidi = noteToMidi(fifth, octave);
  
  // Ensure notes are in ascending order within the octave
  while (thirdMidi <= rootMidi) thirdMidi += 12;
  while (fifthMidi <= thirdMidi) fifthMidi += 12;
  
  // Keep chords in a reasonable range
  if (rootMidi > 72) { // If too high, move down an octave
    return [rootMidi - 12, thirdMidi - 12, fifthMidi - 12];
  }
  
  return [rootMidi, thirdMidi, fifthMidi];
};

// Helper function to check if a MIDI note is the tonic
const isTonicNote = (midiNote, keySignature) => {
  const noteNames = ["C","C# / Db","D","D# / Eb","E","F","F# / Gb","G","G# / Ab","A","A# / Bb","B"];
  const noteName = noteNames[midiNote % 12];
  
  // Get the tonic note from the key
  let tonicNote;
  if (keySignature.key.endsWith('m')) {
    // Minor key - remove 'm' suffix
    tonicNote = keySignature.key.slice(0, -1);
  } else {
    // Major key
    tonicNote = keySignature.key;
  }
  
  // Handle enharmonic equivalents
  const enharmonicMap = {
    'Bb': ['Bb', 'A#'],
    'A#': ['Bb', 'A#'], 
    'Eb': ['Eb', 'D#'],
    'D#': ['Eb', 'D#'],
    'Ab': ['Ab', 'G#'],
    'G#': ['Ab', 'G#'],
    'Db': ['Db', 'C#'],
    'C#': ['Db', 'C#'],
    'Gb': ['Gb', 'F#'],
    'F#': ['Gb', 'F#']
  };
  
  const equivalents = enharmonicMap[tonicNote] || [tonicNote];
  return equivalents.includes(noteName);
};

// Chord progressions piano roll component
function ChordProgressionDisplay({ chords, currentKey, keyData, showLabels, setShowLabels }) {
  const pianoKeysRef = useRef(null);
  const pianoRollRef = useRef(null);
  const noteHeight = 18;
  const lowestNote = 24;  // C1
  const highestNote = 84; // C6
  const totalNotes = highestNote - lowestNote + 1;
  const containerHeight = 600;
  const beatWidth = 120; // Width for each beat/chord
  
  // Auto-scroll to center the progression
  useEffect(() => {
    if (chords.length > 0 && pianoKeysRef.current && pianoRollRef.current) {
      // Find the middle range of all chords
      const allNotes = chords.flat();
      if (allNotes.length > 0) {
        const sortedNotes = [...allNotes].sort((a, b) => b - a);
        const middleNote = sortedNotes[Math.floor(sortedNotes.length / 2)];
        
        const notePosition = (highestNote - middleNote) * noteHeight;
        const scrollPosition = notePosition - (containerHeight / 2) + (noteHeight / 2);
        const maxScroll = (totalNotes * noteHeight) - containerHeight;
        const clampedScroll = Math.max(0, Math.min(scrollPosition, maxScroll));
        
        pianoKeysRef.current.scrollTop = clampedScroll;
        pianoRollRef.current.scrollTop = clampedScroll;
      }
    }
  }, [chords, highestNote, noteHeight, containerHeight, totalNotes]);
  
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xl font-semibold text-white text-center flex-1">
          Chord Progression in {currentKey}
        </h3>
        <button
          onClick={() => setShowLabels(!showLabels)}
          className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/40 transition-colors flex items-center justify-center"
          title={showLabels ? "Hide note labels" : "Show note labels"}
        >
          {showLabels ? <EyeOff size={20} className="text-white" /> : <Eye size={20} className="text-white" />}
        </button>
      </div>
      <p className="text-sm text-white/70 mb-6 text-center">
        Listen to the four chords and identify the roman numeral progression
      </p>
      
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mx-auto" style={{ width: '620px', height: `${containerHeight}px` }}>
        <div className="flex">
          {/* Piano keys on the left */}
          <div ref={pianoKeysRef} className="w-24 flex-shrink-0 border-r-2 border-gray-300 bg-white overflow-y-hidden" style={{ height: `${containerHeight}px` }}>
            <div style={{ height: `${totalNotes * noteHeight}px` }}>
              {Array.from({ length: totalNotes }, (_, i) => {
                const midiNote = highestNote - i;
                const noteName = getMidiNoteName(midiNote);
                const isTonic = isTonicNote(midiNote, { key: currentKey });
                
                return (
                  <div 
                    key={midiNote} 
                    className="border-b border-gray-200 flex items-center justify-end pr-3"
                    style={{ 
                      height: `${noteHeight}px`,
                      backgroundColor: isTonic 
                        ? '#22c55e' // Green for tonic notes
                        : isBlackKey(midiNote) ? '#6b7280' : '#ffffff',
                      color: isTonic || isBlackKey(midiNote) ? '#ffffff' : '#000000'
                    }}
                  >
                    <span className={`${
                      isTonic || isBlackKey(midiNote) 
                        ? "text-xs text-white font-semibold" 
                        : "text-xs text-white"
                    }`}>
                      {showLabels ? noteName : ''}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Note visualization area with beat divisions */}
          <div ref={pianoRollRef} className="flex-1 bg-gradient-to-r from-gray-50 to-gray-100 overflow-y-auto" 
               style={{ height: `${containerHeight}px`, width: `${beatWidth * 4}px` }}
               onScroll={(e) => { 
                 if (pianoKeysRef.current) {
                   pianoKeysRef.current.scrollTop = e.target.scrollTop;
                 }
               }}>
            <div className="relative h-full" style={{ width: `${beatWidth * 4}px` }}>
              {/* Beat dividers */}
              {[1, 2, 3].map(beat => (
                <div 
                  key={`beat-${beat}`}
                  className="absolute top-0 bottom-0 border-l-2 border-gray-400"
                  style={{ left: `${beat * beatWidth}px` }}
                />
              ))}
              
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
              
              {/* Chord blocks for each beat */}
              {chords.map((chord, chordIndex) => (
                chord.map((midiNote, noteIndex) => {
                  const yPos = (highestNote - midiNote) * noteHeight;
                  const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500'];
                  
                  return (
                    <div
                      key={`chord-${chordIndex}-note-${noteIndex}`}
                      className={`absolute ${colors[chordIndex]} border-2 border-opacity-80 rounded-lg shadow-lg`}
                      style={{
                        left: `${chordIndex * beatWidth + 10}px`,
                        top: `${yPos + 2}px`,
                        width: `${beatWidth - 20}px`,
                        height: `${noteHeight - 4}px`
                      }}
                    />
                  );
                })
              ))}
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
      <div className="mb-4">
        <div className="flex justify-between text-sm text-white/70 mb-2">
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
            accuracy >= 90 ? 'text-green-600' : accuracy >= 70 ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {accuracy}%
          </div>
          <div className="text-sm text-white/70">Accuracy</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-white">{correct}/{total}</div>
          <div className="text-sm text-white/70">Correct</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-white">{streak}</div>
          <div className="text-sm text-white/70">Streak</div>
        </div>
      </div>
    </div>
  );
}

// Helper function to get note name from MIDI number
const midiToNoteName = (midiNote) => {
  const noteNames = ["C","C# / Db","D","D# / Eb","E","F","F# / Gb","G","G# / Ab","A","A# / Bb","B"];
  const octave = Math.floor(midiNote / 12) - 1;
  const note = noteNames[midiNote % 12];
  return `${note}${octave}`;
};

// Generate a random chord progression using all scale degrees
const generateRandomProgression = () => {
  // Generate 4 unique random scale degrees (0-6 for all 7 scale degrees)
  const availableDegrees = [0, 1, 2, 3, 4, 5, 6];
  const progression = [];
  
  // Select 4 unique scale degrees
  while (progression.length < 4) {
    const randomDegree = availableDegrees[Math.floor(Math.random() * availableDegrees.length)];
    if (!progression.includes(randomDegree)) {
      progression.push(randomDegree);
    }
  }
  
  return progression;
};

// Generate a chord progression challenge with duplicate prevention
const generateChordProgression = (previousChallenge = null) => {
  const keys = Object.keys(keySignatures);
  const progressions = [...commonProgressions];
  
  let selectedKey, progression, attempt = 0;
  const useRandomProgression = Math.random() < 0.3; // 30% chance for random progression
  
  // Prevent exact same challenge appearing twice in a row
  do {
    selectedKey = keys[Math.floor(Math.random() * keys.length)];
    
    if (useRandomProgression) {
      progression = generateRandomProgression();
    } else {
      progression = progressions[Math.floor(Math.random() * progressions.length)];
    }
    
    attempt++;
    
    // If we've tried many times, just accept any different combination
    if (attempt > 20) break;
    
  } while (previousChallenge && 
           previousChallenge.key === selectedKey && 
           JSON.stringify(previousChallenge.progression) === JSON.stringify(progression));
  
  const keyData = keySignatures[selectedKey];
  
  // Generate chords for each degree in the progression
  const chords = progression.map(degree => 
    generateChordFromScaleDegree(keyData, degree, 4)
  );
  
  // Generate the expected roman numeral answer
  const romanPattern = romanNumerals[keyData.type];
  const expectedAnswer = progression.map(degree => romanPattern[degree]).join(' ');
  
  // Debug logging to verify correctness
  console.log(`Generated progression in ${selectedKey}:`);
  progression.forEach((degree, index) => {
    const chord = chords[index];
    const chordNotes = chord.map(midi => midiToNoteName(midi));
    const scaleDegreeNote = keyData.notes[degree];
    console.log(`  ${romanPattern[degree]} (${scaleDegreeNote}): ${chordNotes.join('-')}`);
  });
  
  return {
    key: selectedKey,
    keyData,
    progression,
    chords,
    expectedAnswer
  };
};

// Validate roman numeral answer
const validateRomanAnswer = (userAnswer, expectedAnswer) => {
  const normalize = (str) => str.toLowerCase().replace(/[^a-z0-9°b]/g, '');
  
  const userNormalized = normalize(userAnswer);
  const expectedNormalized = normalize(expectedAnswer);
  
  // Create variations for diminished symbols and flat notation
  const createVariations = (text) => {
    const variations = [text];
    
    // Replace ° with different diminished representations
    if (text.includes('°')) {
      variations.push(text.replace(/°/g, 'dim'));
      variations.push(text.replace(/°/g, 'd'));
      variations.push(text.replace(/°/g, 'o'));
    }
    
    // Create flat notation alternatives
    // Allow users to type "flat" instead of "b"
    if (text.includes('flat')) {
      variations.push(text.replace(/flat/g, 'b'));
    }
    if (text.includes('b')) {
      variations.push(text.replace(/b/g, 'flat'));
    }
    
    return variations;
  };
  
  // Also check for common spacing variations
  const spacingVariations = [
    expectedAnswer,
    expectedAnswer.replace(/\s+/g, '-'),
    expectedAnswer.replace(/\s+/g, '')
  ];
  
  // Combine all variations
  const allVariations = [];
  spacingVariations.forEach(variation => {
    allVariations.push(...createVariations(variation));
  });
  
  return allVariations.some(variation => normalize(variation) === userNormalized);
};

// Main component
export default function ChordProgressionsLevel1() {
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0, streak: 0 });
  const [startTime, setStartTime] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [avgTime, setAvgTime] = useState(0);
  const [showLabels, setShowLabels] = useState(true);
  const [times, setTimes] = useState([]);
  
  const totalProblems = 20;

  // Generate new challenge
  const generateNewChallenge = useCallback(() => {
    setCurrentChallenge(prevChallenge => {
      const challenge = generateChordProgression(prevChallenge);
      setUserAnswer('');
      setFeedback('');
      setIsAnswered(false);
      setStartTime(Date.now());
      setCurrentTime(0);
      return challenge;
    });
  }, []);

  // Timer effect
  useEffect(() => {
    if (startTime && !isAnswered) {
      const interval = setInterval(() => {
        setCurrentTime((Date.now() - startTime) / 1000);
      }, 100);
      return () => clearInterval(interval);
    }
  }, [startTime, isAnswered]);

  // Initialize first challenge
  useEffect(() => {
    generateNewChallenge();
  }, [generateNewChallenge]);

  // Handle answer submission
  const handleSubmit = () => {
    if (!currentChallenge || isAnswered) return;
    
    const responseTime = (Date.now() - startTime) / 1000;
    const isCorrect = validateRomanAnswer(userAnswer, currentChallenge.expectedAnswer);
    
    setIsAnswered(true);
    
    if (isCorrect) {
      setFeedback('✅ Correct! Well done!');
      setScore(prev => ({
        correct: prev.correct + 1,
        total: prev.total + 1,
        streak: prev.streak + 1
      }));
    } else {
      setFeedback(`❌ Incorrect. The correct answer is: ${currentChallenge.expectedAnswer}`);
      setScore(prev => ({
        correct: prev.correct,
        total: prev.total + 1,
        streak: 0
      }));
    }
    
    // Update timing statistics
    const newTimes = [...times, responseTime];
    setTimes(newTimes);
    setAvgTime(newTimes.reduce((a, b) => a + b, 0) / newTimes.length);
  };

  // Handle next question
  const handleNext = () => {
    if (score.total >= totalProblems) {
      // Challenge completed
      return;
    }
    generateNewChallenge();
  };

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (isAnswered) {
        handleNext();
      } else {
        handleSubmit();
      }
    }
  };

  if (!currentChallenge) {
    return <div>Loading...</div>;
  }

  if (score.total >= totalProblems) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e] flex items-center justify-center">
        <div className="text-center max-w-2xl mx-auto p-8">
          <div className="w-24 h-24 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-8">
            <span className="text-4xl text-white">🎉</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-6">Level 1 Complete!</h1>
          <p className="text-xl text-white/70 mb-4">
            Final Score: {score.correct}/{score.total} ({Math.round((score.correct/score.total)*100)}%)
          </p>
          <p className="text-lg text-white/70 mb-8">
            Average Time: {avgTime.toFixed(1)}s
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600 transition-colors"
            >
              Try Again
            </button>
            <Link
              to="/chord-progressions"
              className="px-6 py-3 bg-white/20 text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors"
            >
              Back to Levels
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e] p-6">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            to="/chord-progressions"
            className="inline-flex items-center px-4 py-2 bg-white/20/20 text-white hover:bg-white/20/30 transition-colors rounded-lg font-medium"
          >
            ← Back to Chord Progressions
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Level 1: Basic Progressions</h1>
          <p className="text-lg text-white/70">
            Identify the roman numeral progression for each 4-chord sequence
          </p>
        </div>

        {/* Score Display */}
        <ScoreDisplay 
          correct={score.correct}
          total={score.total}
          streak={score.streak}
          currentTime={currentTime}
          avgTime={avgTime}
          isAnswered={isAnswered}
          totalProblems={totalProblems}
        />

        {/* Piano Roll Display */}
        <ChordProgressionDisplay 
          chords={currentChallenge.chords}
          currentKey={currentChallenge.key}
          keyData={currentChallenge.keyData}
          showLabels={showLabels}
          setShowLabels={setShowLabels}
        />

        {/* Answer Input */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6">
          <h3 className="text-xl font-semibold text-white mb-4 text-center">
            What is the roman numeral progression?
          </h3>
          <p className="text-sm text-white/70 mb-4 text-center">
            Enter four roman numerals separated by spaces (e.g., "I V vi IV" or "i iv bVI bVII")<br/>
            <span className="text-xs text-white/60">For diminished: use °, dim, d, or o. In minor keys, use flat notation (bIII, bVI, bVII)</span>
          </p>
          
          <div className="flex gap-4 max-w-2xl mx-auto">
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="e.g., I V vi IV or i iv bVI bVII"
              className="flex-1 px-4 py-3 text-lg rounded-xl border border-gray-300 focus:border-blue-500 focus:outline-none"
              disabled={isAnswered}
            />
            {!isAnswered ? (
              <button
                onClick={handleSubmit}
                className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50"
                disabled={!userAnswer.trim()}
              >
                Submit
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-6 py-3 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 transition-colors"
              >
                Next →
              </button>
            )}
          </div>
          
          {feedback && (
            <div className="mt-4 text-center">
              <p className="text-lg font-semibold text-white">{feedback}</p>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
          <h4 className="font-semibold text-white mb-2">Instructions:</h4>
          <ul className="text-sm text-white/70 space-y-1">
            <li>• Listen to the four chords played in sequence</li>
            <li>• Identify the roman numeral for each chord in the given key</li>
            <li>• Major keys use: I, ii, iii, IV, V, vi, vii°</li>
            <li>• Minor keys use: i, ii°, bIII, iv, v, bVI, bVII (flat notation relative to major)</li>
            <li>• Separate roman numerals with spaces</li>
          </ul>
        </div>
      </div>
    </div>
  );
}