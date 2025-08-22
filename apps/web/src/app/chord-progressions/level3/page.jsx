"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link } from "react-router";

// Music theory utilities for chord progressions with non-diatonic chords
const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Toggle for inversion labeling - set to false to disable inversion requirements
const REQUIRE_INVERSION_LABELING = false;

// Major and minor key signatures with correct scale notes
const keySignatures = {
  // Major keys - each key contains the 7 notes of its major scale
  'C': { type: 'major', notes: ['C', 'D', 'E', 'F', 'G', 'A', 'B'] },
  'G': { type: 'major', notes: ['G', 'A', 'B', 'C', 'D', 'E', 'F#'] },
  'D': { type: 'major', notes: ['D', 'E', 'F#', 'G', 'A', 'B', 'C#'] },
  'F': { type: 'major', notes: ['F', 'G', 'A', 'Bb', 'C', 'D', 'E'] },
  'Bb': { type: 'major', notes: ['Bb', 'C', 'D', 'Eb', 'F', 'G', 'A'] },
  'Eb': { type: 'major', notes: ['Eb', 'F', 'G', 'Ab', 'Bb', 'C', 'D'] },
  
  // Minor keys - each key contains the 7 notes of its natural minor scale
  'Am': { type: 'minor', notes: ['A', 'B', 'C', 'D', 'E', 'F', 'G'] },
  'Em': { type: 'minor', notes: ['E', 'F#', 'G', 'A', 'B', 'C', 'D'] },
  'Bm': { type: 'minor', notes: ['B', 'C#', 'D', 'E', 'F#', 'G', 'A'] },
  'Dm': { type: 'minor', notes: ['D', 'E', 'F', 'G', 'A', 'Bb', 'C'] },
  'Gm': { type: 'minor', notes: ['G', 'A', 'Bb', 'C', 'D', 'Eb', 'F'] },
  'Cm': { type: 'minor', notes: ['C', 'D', 'Eb', 'F', 'G', 'Ab', 'Bb'] }
};

// Roman numeral patterns for diatonic chords
const romanNumeralsDiatonic = {
  major: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'],
  minor: ['i', 'ii°', 'bIII', 'iv', 'v', 'bVI', 'bVII']
};

// Non-diatonic chord definitions
const nonDiatonicChords = {
  major: [
    { symbol: 'bII', rootOffset: 1, quality: 'major', description: 'Neapolitan', alternatives: ['N', 'N6'] },
    { symbol: 'bIII', rootOffset: 3, quality: 'major', description: 'Borrowed from parallel minor', alternatives: [] },
    { symbol: 'bVI', rootOffset: 8, quality: 'major', description: 'Borrowed from parallel minor', alternatives: [] },
    { symbol: 'bVII', rootOffset: 10, quality: 'major', description: 'Borrowed from parallel minor', alternatives: [] },
    { symbol: 'I+', rootOffset: 0, quality: 'augmented', description: 'Augmented tonic', alternatives: ['Iaug'] },
    { symbol: 'V+', rootOffset: 7, quality: 'augmented', description: 'Augmented dominant', alternatives: ['Vaug'] },
    { symbol: '#iv°', rootOffset: 6, quality: 'diminished', description: 'Augmented fourth diminished', alternatives: ['#ivdim'] },
    { symbol: 'ii/♭5', rootOffset: 2, quality: 'half-diminished', description: 'Half-diminished supertonic', alternatives: ['iid', 'iidim', 'ii°'] }
  ],
  minor: [
    { symbol: 'bII', rootOffset: 1, quality: 'major', description: 'Neapolitan', alternatives: ['N', 'N6'] },
    { symbol: 'III', rootOffset: 4, quality: 'major', description: 'Borrowed from parallel major', alternatives: [] },
    { symbol: 'VI', rootOffset: 9, quality: 'major', description: 'Borrowed from parallel major', alternatives: [] },
    { symbol: 'VII', rootOffset: 11, quality: 'major', description: 'Borrowed from parallel major', alternatives: [] },
    { symbol: 'i+', rootOffset: 0, quality: 'augmented', description: 'Augmented tonic', alternatives: ['iaug'] },
    { symbol: 'V+', rootOffset: 7, quality: 'augmented', description: 'Augmented dominant', alternatives: ['Vaug'] },
    { symbol: '#ii°', rootOffset: 3, quality: 'diminished', description: 'Augmented second diminished', alternatives: ['#iidim'] },
    { symbol: 'iv/♭5', rootOffset: 5, quality: 'half-diminished', description: 'Half-diminished subdominant', alternatives: ['ivd', 'ivdim', 'iv°'] }
  ]
};

// Common chord progressions with non-diatonic chords and mandatory inversions
// Each progression has 1-2 non-diatonic chords mixed with diatonic ones
// At least 2 chords must have inversions
const nonDiatonicProgressions = [
  // Major key progressions
  [
    { type: 'diatonic', degree: 0, inversion: 'root' },      // I
    { type: 'non-diatonic', index: 2, inversion: 'first' }, // bVI6
    { type: 'diatonic', degree: 3, inversion: 'second' },    // IV64
    { type: 'diatonic', degree: 4, inversion: 'root' }       // V
  ],
  [
    { type: 'diatonic', degree: 0, inversion: 'first' },     // I6
    { type: 'diatonic', degree: 4, inversion: 'root' },      // V
    { type: 'non-diatonic', index: 1, inversion: 'first' }, // bIII6
    { type: 'diatonic', degree: 3, inversion: 'root' }       // IV
  ],
  [
    { type: 'non-diatonic', index: 3, inversion: 'root' },  // bVII
    { type: 'diatonic', degree: 3, inversion: 'first' },     // IV6
    { type: 'diatonic', degree: 0, inversion: 'second' },    // I64
    { type: 'diatonic', degree: 4, inversion: 'root' }       // V
  ],
  [
    { type: 'diatonic', degree: 0, inversion: 'root' },      // I
    { type: 'non-diatonic', index: 4, inversion: 'root' },  // I+
    { type: 'diatonic', degree: 5, inversion: 'first' },     // vi6
    { type: 'diatonic', degree: 3, inversion: 'second' }     // IV64
  ],
  [
    { type: 'diatonic', degree: 5, inversion: 'first' },     // vi6
    { type: 'non-diatonic', index: 0, inversion: 'first' }, // bII6 (N6)
    { type: 'diatonic', degree: 4, inversion: 'root' },      // V
    { type: 'diatonic', degree: 0, inversion: 'root' }       // I
  ],
  [
    { type: 'diatonic', degree: 0, inversion: 'root' },      // I
    { type: 'non-diatonic', index: 7, inversion: 'first' }, // ii/♭5 6 (half-dim)
    { type: 'diatonic', degree: 4, inversion: 'second' },    // V64
    { type: 'diatonic', degree: 0, inversion: 'root' }       // I
  ]
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

// Generate chord from scale degree (diatonic)
const generateDiatonicChord = (keySignature, scaleDegree, octave = 3) => {
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

// Generate non-diatonic chord
const generateNonDiatonicChord = (keySignature, chordIndex, octave = 3) => {
  const chordDef = nonDiatonicChords[keySignature.type][chordIndex];
  const tonicNote = keySignature.notes[0];
  const tonicMidi = noteToMidi(tonicNote, octave);
  
  // Calculate root note based on offset from tonic
  const rootMidi = tonicMidi + chordDef.rootOffset;
  
  // Generate chord based on quality
  let thirdOffset, fifthOffset;
  
  switch (chordDef.quality) {
    case 'major':
      thirdOffset = 4; // Major third
      fifthOffset = 7; // Perfect fifth
      break;
    case 'minor':
      thirdOffset = 3; // Minor third
      fifthOffset = 7; // Perfect fifth
      break;
    case 'augmented':
      thirdOffset = 4; // Major third
      fifthOffset = 8; // Augmented fifth
      break;
    case 'diminished':
      thirdOffset = 3; // Minor third
      fifthOffset = 6; // Diminished fifth
      break;
    case 'half-diminished':
      thirdOffset = 3; // Minor third
      fifthOffset = 6; // Diminished fifth (same as diminished for triad)
      break;
    default:
      thirdOffset = 4;
      fifthOffset = 7;
  }
  
  const thirdMidi = rootMidi + thirdOffset;
  const fifthMidi = rootMidi + fifthOffset;
  
  // Keep chords in a reasonable range
  if (rootMidi > 72) { // If too high, move down an octave
    return [rootMidi - 12, thirdMidi - 12, fifthMidi - 12];
  }
  
  return [rootMidi, thirdMidi, fifthMidi];
};

// Apply inversion to a chord
const applyInversion = (chord, inversion) => {
  if (inversion === 'root') return chord;
  
  const [root, third, fifth] = chord;
  
  if (inversion === 'first') {
    // Move root up an octave
    return [third, fifth, root + 12];
  } else if (inversion === 'second') {
    // Move root and third up an octave
    return [fifth, root + 12, third + 12];
  }
  
  return chord;
};

// Generate chord from progression instruction with inversion
const generateChordFromProgression = (keySignature, instruction, octave = 3) => {
  let chord;
  if (instruction.type === 'diatonic') {
    chord = generateDiatonicChord(keySignature, instruction.degree, octave);
  } else {
    chord = generateNonDiatonicChord(keySignature, instruction.index, octave);
  }
  
  // Apply inversion if specified
  if (instruction.inversion) {
    chord = applyInversion(chord, instruction.inversion);
  }
  
  return chord;
};

// Generate a random non-diatonic progression with mandatory inversions
const generateRandomNonDiatonicProgression = (keyType) => {
  const progression = [];
  const nonDiatonicChordCount = Math.floor(Math.random() * 2) + 1; // 1 or 2 non-diatonic chords
  const totalChords = 4;
  const inversions = ['root', 'first', 'second'];
  
  // Choose positions for non-diatonic chords
  const nonDiatonicPositions = [];
  while (nonDiatonicPositions.length < nonDiatonicChordCount) {
    const pos = Math.floor(Math.random() * totalChords);
    if (!nonDiatonicPositions.includes(pos)) {
      nonDiatonicPositions.push(pos);
    }
  }
  
  // Choose positions for inversions (at least 2 chords must have inversions)
  const inversionPositions = [];
  while (inversionPositions.length < 2) {
    const pos = Math.floor(Math.random() * totalChords);
    if (!inversionPositions.includes(pos)) {
      inversionPositions.push(pos);
    }
  }
  
  // Randomly add more inversions (up to all 4 chords)
  for (let i = 0; i < totalChords; i++) {
    if (!inversionPositions.includes(i) && Math.random() < 0.4) {
      inversionPositions.push(i);
    }
  }
  
  // Fill progression
  for (let i = 0; i < totalChords; i++) {
    let chord;
    if (nonDiatonicPositions.includes(i)) {
      // Add non-diatonic chord
      const nonDiatonicIndex = Math.floor(Math.random() * nonDiatonicChords[keyType].length);
      chord = { type: 'non-diatonic', index: nonDiatonicIndex };
    } else {
      // Add diatonic chord
      const diatonicDegree = Math.floor(Math.random() * 7);
      chord = { type: 'diatonic', degree: diatonicDegree };
    }
    
    // Add inversion
    if (inversionPositions.includes(i)) {
      chord.inversion = inversions[Math.floor(Math.random() * inversions.length)];
    } else {
      chord.inversion = 'root';
    }
    
    progression.push(chord);
  }
  
  return progression;
};

// Helper function to get note name from MIDI number
const midiToNoteName = (midiNote) => {
  const noteNames = ["C","C# / Db","D","D# / Eb","E","F","F# / Gb","G","G# / Ab","A","A# / Bb","B"];
  const octave = Math.floor(midiNote / 12) - 1;
  const note = noteNames[midiNote % 12];
  return `${note}${octave}`;
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
    'Db': ['Db', 'C#'],
    'C#': ['Db', 'C#'],
    'Eb': ['Eb', 'D#'],
    'D#': ['Eb', 'D#'],
    'Gb': ['Gb', 'F#'],
    'F#': ['Gb', 'F#'],
    'Ab': ['Ab', 'G#'],
    'G#': ['Ab', 'G#']
  };
  
  const equivalents = enharmonicMap[tonicNote] || [tonicNote];
  return equivalents.includes(noteName);
};

// Generate a chord progression challenge with non-diatonic chords
const generateNonDiatonicChordProgression = (previousChallenge = null) => {
  const keys = Object.keys(keySignatures);
  const progressions = [...nonDiatonicProgressions];
  
  let selectedKey, progression, attempt = 0;
  const useRandomProgression = Math.random() < 0.3; // 30% chance for random progression
  
  // Prevent exact same challenge appearing twice in a row
  do {
    selectedKey = keys[Math.floor(Math.random() * keys.length)];
    
    if (useRandomProgression) {
      const keyData = keySignatures[selectedKey];
      progression = generateRandomNonDiatonicProgression(keyData.type);
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
  
  // Generate chords for each instruction in the progression (octave 3 instead of 4)
  const chords = progression.map(instruction => 
    generateChordFromProgression(keyData, instruction, 3)
  );
  
  // Generate the expected roman numeral answer
  const expectedAnswer = progression.map(instruction => {
    let baseSymbol;
    if (instruction.type === 'diatonic') {
      baseSymbol = romanNumeralsDiatonic[keyData.type][instruction.degree];
    } else {
      baseSymbol = nonDiatonicChords[keyData.type][instruction.index].symbol;
    }
    
    // Add inversion symbols only if inversion labeling is required
    if (REQUIRE_INVERSION_LABELING) {
      if (instruction.inversion === 'first') {
        baseSymbol += '6';
      } else if (instruction.inversion === 'second') {
        baseSymbol += '64';
      }
    }
    
    return baseSymbol;
  }).join(' ');
  
  console.log(`Generated non-diatonic progression in ${selectedKey}:`);
  progression.forEach((instruction, index) => {
    if (instruction.type === 'diatonic') {
      const chord = romanNumeralsDiatonic[keyData.type][instruction.degree];
      console.log(`  ${index + 1}. ${chord} (${chords[index].map(note => midiToNoteName(note)).join('-')})`);
    } else {
      const chord = nonDiatonicChords[keyData.type][instruction.index];
      console.log(`  ${index + 1}. ${chord.symbol} (${chord.description}) (${chords[index].map(note => midiToNoteName(note)).join('-')})`);
    }
  });
  console.log(`Expected answer: "${expectedAnswer}"`);
  
  return {
    key: selectedKey,
    chords,
    progression,
    expectedAnswer,
    keyData
  };
};

// Non-diatonic chord progressions piano roll component
function ChordProgressionDisplay({ chords, currentKey, keyData, progressionData, showLabels, setShowLabels }) {
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
      // Find the range of all notes in the progression
      const allNotes = chords.flat();
      const minNote = Math.min(...allNotes);
      const maxNote = Math.max(...allNotes);
      
      // Calculate the center of the note range
      const centerNote = (minNote + maxNote) / 2;
      
      // Calculate scroll position to center this range
      const notePosition = (highestNote - centerNote) * noteHeight;
      const scrollPosition = notePosition - (containerHeight / 2) + (noteHeight / 2);
      
      // Clamp scroll position to valid range
      const maxScroll = (totalNotes * noteHeight) - containerHeight;
      const clampedScroll = Math.max(0, Math.min(scrollPosition, maxScroll));
      
      // Scroll both containers with a small delay to ensure DOM is ready
      setTimeout(() => {
        if (pianoKeysRef.current && pianoRollRef.current) {
          pianoKeysRef.current.scrollTop = clampedScroll;
          pianoRollRef.current.scrollTop = clampedScroll;
        }
      }, 100);
    }
  }, [chords, highestNote, noteHeight, containerHeight, totalNotes]);
  
  return (
    <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 mb-8">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xl font-semibold text-black text-center flex-1">
          Non-Diatonic Chord Progression in {currentKey}
        </h3>
        <button
          onClick={() => setShowLabels(!showLabels)}
          className="w-10 h-10 rounded-lg bg-white/30 hover:bg-white/40 transition-colors flex items-center justify-center"
          title={showLabels ? "Hide note labels" : "Show note labels"}
        >
          {showLabels ? <EyeOff size={20} className="text-black" /> : <Eye size={20} className="text-black" />}
        </button>
      </div>
      <p className="text-sm text-black/70 mb-6 text-center">
        Listen to the four chords (including non-diatonic chords) and identify the progression
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
                        ? "text-xs text-white" 
                        : "text-xs text-black"
                    }`}>
                      {showLabels ? noteName : ''}
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
              
              {/* Beat markers */}
              <div className="absolute top-0 left-0 right-0 h-6 bg-gray-50 border-b border-gray-200 flex items-center text-xs text-gray-600">
                {chords.map((_, i) => (
                  <div key={`beat-${i}`} className="absolute flex items-center justify-center font-medium" style={{ left: `${i * beatWidth + 4}px`, width: `${beatWidth - 8}px` }}>
                    Beat {i + 1}
                  </div>
                ))}
              </div>
              
              {/* Note blocks for each chord */}
              {chords.map((chord, chordIndex) => (
                chord.map((midiNote, noteIndex) => {
                  const yPos = (highestNote - midiNote) * noteHeight;
                  
                  return (
                    <div
                      key={`chord-${chordIndex}-note-${noteIndex}`}
                      className="absolute bg-purple-500 border-purple-600 rounded-lg shadow-lg"
                      style={{
                        left: `${chordIndex * beatWidth + 20}px`,
                        top: `${yPos + 2}px`,
                        width: `${beatWidth - 40}px`,
                        height: `${noteHeight - 4}px`
                      }}
                    >
                    </div>
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

function ScoreDisplay({ correct, total, streak, currentTime, avgTime, isAnswered, totalProblems }) {
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
  const timeDisplay = currentTime > 0 ? `${currentTime.toFixed(1)}s` : '--';
  const avgTimeDisplay = avgTime > 0 ? `${avgTime.toFixed(1)}s` : '--';
  
  return (
    <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 mb-6">
      <h3 className="text-xl font-semibold text-black mb-4 text-center">Progress</h3>
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold text-black">{correct}</div>
          <div className="text-sm text-black/70">Correct</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-black">{total}</div>
          <div className="text-sm text-black/70">Total</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-green-600">{percentage}%</div>
          <div className="text-sm text-black/70">Accuracy</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-blue-600">{streak}</div>
          <div className="text-sm text-black/70">Streak</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-purple-600">{timeDisplay}</div>
          <div className="text-sm text-black/70">Current</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-orange-600">{avgTimeDisplay}</div>
          <div className="text-sm text-black/70">Average</div>
        </div>
      </div>
      {totalProblems && (
        <div className="mt-4 text-center">
          <div className="text-sm text-black/70">Progress: {total} / {totalProblems} exercises</div>
          <div className="w-full bg-black/20 rounded-full h-2 mt-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(total / totalProblems) * 100}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Level3Page() {
  const [currentChallenge, setCurrentChallenge] = useState(null);
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
  const [showLabels, setShowLabels] = useState(true);
  const totalProblems = 20; // Target number of exercises

  // Timer effect
  useEffect(() => {
    let interval;
    if (startTime && !isAnswered) {
      interval = setInterval(() => {
        setCurrentTime((Date.now() - startTime) / 1000);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [startTime, isAnswered]);

  const generateNewChallenge = useCallback(() => {
    const challenge = generateNonDiatonicChordProgression(currentChallenge);
    setCurrentChallenge(challenge);
    setUserAnswer('');
    setFeedback(null);
    setIsAnswered(false);
    setStartTime(Date.now());
    setCurrentTime(0);
    if (!hasStarted) setHasStarted(true);
  }, [currentChallenge, hasStarted]);

  const checkAnswer = useCallback(() => {
    if (!currentChallenge || userAnswer.trim() === '') return;

    const endTime = Date.now();
    const timeTaken = (endTime - startTime) / 1000;
    setCurrentTime(timeTaken);
    setIsAnswered(true);

    let normalizedUserAnswer = userAnswer.trim().replace(/\s+/g, ' ').toLowerCase();
    const normalizedExpectedAnswer = currentChallenge.expectedAnswer.toLowerCase();
    
    // If inversion labeling is disabled, strip inversion symbols from user input
    if (!REQUIRE_INVERSION_LABELING) {
      normalizedUserAnswer = normalizedUserAnswer.replace(/64|6/g, '').replace(/\s+/g, ' ').trim();
    }
    
    // Normalize diminished chord symbols in user input to match expected format
    normalizedUserAnswer = normalizedUserAnswer.replace(/viid\b/g, 'vii°');
    normalizedUserAnswer = normalizedUserAnswer.replace(/viidim\b/g, 'vii°');
    normalizedUserAnswer = normalizedUserAnswer.replace(/iid\b/g, 'ii°');
    normalizedUserAnswer = normalizedUserAnswer.replace(/iidim\b/g, 'ii°');
    normalizedUserAnswer = normalizedUserAnswer.replace(/id\b/g, 'i°');
    normalizedUserAnswer = normalizedUserAnswer.replace(/idim\b/g, 'i°');
    normalizedUserAnswer = normalizedUserAnswer.replace(/iiid\b/g, 'iii°');
    normalizedUserAnswer = normalizedUserAnswer.replace(/iiidim\b/g, 'iii°');
    normalizedUserAnswer = normalizedUserAnswer.replace(/ivd\b/g, 'iv°');
    normalizedUserAnswer = normalizedUserAnswer.replace(/ivdim\b/g, 'iv°');
    normalizedUserAnswer = normalizedUserAnswer.replace(/vd\b/g, 'v°');
    normalizedUserAnswer = normalizedUserAnswer.replace(/vdim\b/g, 'v°');
    normalizedUserAnswer = normalizedUserAnswer.replace(/vid\b/g, 'vi°');
    normalizedUserAnswer = normalizedUserAnswer.replace(/vidim\b/g, 'vi°');
    
    // Generate alternative notations for diminished and half-diminished chords
    const generateAlternativeNotations = (answer) => {
      const alternatives = [answer];
      
      // Handle diminished chord alternatives (vii°, ii°, etc.)
      alternatives.push(answer.replace(/vii°/g, 'viid'));
      alternatives.push(answer.replace(/vii°/g, 'viidim'));
      alternatives.push(answer.replace(/ii°/g, 'iid'));
      alternatives.push(answer.replace(/ii°/g, 'iidim'));
      alternatives.push(answer.replace(/i°/g, 'id'));
      alternatives.push(answer.replace(/i°/g, 'idim'));
      alternatives.push(answer.replace(/iii°/g, 'iiid'));
      alternatives.push(answer.replace(/iii°/g, 'iiidim'));
      alternatives.push(answer.replace(/iv°/g, 'ivd'));
      alternatives.push(answer.replace(/iv°/g, 'ivdim'));
      alternatives.push(answer.replace(/v°/g, 'vd'));
      alternatives.push(answer.replace(/v°/g, 'vdim'));
      alternatives.push(answer.replace(/vi°/g, 'vid'));
      alternatives.push(answer.replace(/vi°/g, 'vidim'));
      
      // Handle half-diminished chord alternatives
      alternatives.push(answer.replace(/ii\/♭5/g, 'iid'));
      alternatives.push(answer.replace(/ii\/♭5/g, 'iidim'));
      alternatives.push(answer.replace(/ii\/♭5/g, 'ii°'));
      alternatives.push(answer.replace(/iv\/♭5/g, 'ivd'));
      alternatives.push(answer.replace(/iv\/♭5/g, 'ivdim'));
      alternatives.push(answer.replace(/iv\/♭5/g, 'iv°'));
      
      // Only handle inversion alternatives if inversion labeling is required
      if (REQUIRE_INVERSION_LABELING) {
        alternatives.push(answer.replace(/ii\/♭56/g, 'iid6'));
        alternatives.push(answer.replace(/ii\/♭56/g, 'iidim6'));
        alternatives.push(answer.replace(/ii\/♭56/g, 'ii°6'));
        alternatives.push(answer.replace(/ii\/♭564/g, 'iid64'));
        alternatives.push(answer.replace(/ii\/♭564/g, 'iidim64'));
        alternatives.push(answer.replace(/ii\/♭564/g, 'ii°64'));
        
        alternatives.push(answer.replace(/iv\/♭56/g, 'ivd6'));
        alternatives.push(answer.replace(/iv\/♭56/g, 'ivdim6'));
        alternatives.push(answer.replace(/iv\/♭56/g, 'iv°6'));
        alternatives.push(answer.replace(/iv\/♭564/g, 'ivd64'));
        alternatives.push(answer.replace(/iv\/♭564/g, 'ivdim64'));
        alternatives.push(answer.replace(/iv\/♭564/g, 'iv°64'));
        
        // Handle diminished chord inversions
        alternatives.push(answer.replace(/vii°6/g, 'viid6'));
        alternatives.push(answer.replace(/vii°6/g, 'viidim6'));
        alternatives.push(answer.replace(/vii°64/g, 'viid64'));
        alternatives.push(answer.replace(/vii°64/g, 'viidim64'));
      }
      
      return [...new Set(alternatives)]; // Remove duplicates
    };
    
    // Check for various formatting possibilities
    const baseAnswers = generateAlternativeNotations(normalizedExpectedAnswer);
    const possibleAnswers = [];
    
    baseAnswers.forEach(answer => {
      possibleAnswers.push(answer);
      possibleAnswers.push(answer.replace(/\s+/g, '-'));
      possibleAnswers.push(answer.replace(/\s+/g, ''));
    });

    const isCorrect = possibleAnswers.includes(normalizedUserAnswer);

    const newScore = {
      correct: score.correct + (isCorrect ? 1 : 0),
      total: score.total + 1,
      streak: isCorrect ? score.streak + 1 : 0
    };

    const newTotalTime = totalTime + timeTaken;
    const newAvgTime = newTotalTime / newScore.total;

    setScore(newScore);
    setTotalTime(newTotalTime);
    setAvgTime(newAvgTime);

    setFeedback({
      isCorrect,
      expectedAnswer: currentChallenge.expectedAnswer,
      userAnswer: userAnswer.trim(),
      timeTaken: timeTaken.toFixed(1)
    });

    // Check if completed
    if (newScore.total >= totalProblems) {
      setIsCompleted(true);
    }
  }, [currentChallenge, userAnswer, startTime, score, totalTime, totalProblems]);

  const handleSubmit = (e) => {
    e.preventDefault();
    checkAnswer();
  };

  const resetProgress = () => {
    setScore({ correct: 0, total: 0, streak: 0 });
    setTotalTime(0);
    setAvgTime(0);
    setHasStarted(false);
    setIsCompleted(false);
    generateNewChallenge();
  };

  useEffect(() => {
    generateNewChallenge();
  }, []);

  if (isCompleted) {
    const percentage = Math.round((score.correct / score.total) * 100);
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e] p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <Link 
              to="/chord-progressions"
              className="inline-flex items-center text-black/70 hover:text-black mb-4 transition-colors"
            >
              ← Back to Chord Progressions
            </Link>
            <h1 className="text-4xl font-bold text-black mb-2">Level 3 Complete!</h1>
            <p className="text-xl text-black/80">Non-Diatonic and Modal Chords</p>
          </div>

          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-8 mb-6 text-center">
            <h2 className="text-3xl font-bold text-black mb-6">Congratulations!</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white/30 rounded-xl p-4">
                <div className="text-3xl font-bold text-green-600">{percentage}%</div>
                <div className="text-black/70">Final Accuracy</div>
              </div>
              <div className="bg-white/30 rounded-xl p-4">
                <div className="text-3xl font-bold text-blue-600">{score.correct}/{score.total}</div>
                <div className="text-black/70">Correct Answers</div>
              </div>
              <div className="bg-white/30 rounded-xl p-4">
                <div className="text-3xl font-bold text-purple-600">{avgTime.toFixed(1)}s</div>
                <div className="text-black/70">Average Time</div>
              </div>
            </div>
            <button 
              onClick={resetProgress}
              className="bg-black text-white px-8 py-3 rounded-xl hover:bg-gray-800 transition-colors font-semibold mr-4"
            >
              Try Again
            </button>
            <Link 
              to="/chord-progressions"
              className="bg-purple-600 text-white px-8 py-3 rounded-xl hover:bg-purple-700 transition-colors font-semibold inline-block"
            >
              Back to Levels
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e] p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <Link 
            to="/chord-progressions"
            className="inline-flex items-center text-black/70 hover:text-black mb-4 transition-colors"
          >
            ← Back to Chord Progressions
          </Link>
          <h1 className="text-4xl font-bold text-black mb-2">Chord Progressions - Level 3</h1>
          <p className="text-xl text-black/80 mb-4">Non-Diatonic and Modal Chords</p>
          <p className="text-sm text-black/60 max-w-2xl mx-auto">
            Identify chord progressions that include non-diatonic chords such as borrowed chords (bIII, bVI, bVII), 
            Neapolitan chords (bII), augmented chords (I+, V+), and diminished chords. Each progression contains 1-2 non-diatonic chords.
          </p>
        </div>

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
        {currentChallenge && (
          <ChordProgressionDisplay 
            chords={currentChallenge.chords}
            currentKey={currentChallenge.key}
            keyData={currentChallenge.keyData}
            progressionData={currentChallenge.progression}
            showLabels={showLabels}
            setShowLabels={setShowLabels}
          />
        )}

        {/* Answer Input */}
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 mb-6">
          <h3 className="text-xl font-semibold text-black mb-4 text-center">
            What is the roman numeral progression?
          </h3>
          <p className="text-sm text-black/70 mb-4 text-center">
            Enter four roman numerals including non-diatonic chords (e.g., "I bIII IV V" or "vi bII V I")<br/>
            <span className="text-xs text-black/60">Include symbols like bII, bIII, bVI, bVII for borrowed chords, I+ for augmented, etc.<br/>
            Diminished chords: vii°, viid, viidim are all accepted. Half-diminished: ii/♭5, iid, iidim, ii°. Inversion labeling not required.</span>
          </p>
          
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="e.g., I bVI IV V"
              className="flex-1 px-4 py-3 rounded-xl border border-white/30 bg-white/20 text-black placeholder-black/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={isAnswered}
            />
            <button
              type="submit"
              disabled={isAnswered || userAnswer.trim() === ''}
              className="px-8 py-3 bg-black text-white rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
            >
              Submit
            </button>
          </form>

          {feedback && (
            <div className={`mt-4 p-4 rounded-xl ${feedback.isCorrect ? 'bg-green-100 border border-green-300' : 'bg-red-100 border border-red-300'}`}>
              <div className={`font-semibold ${feedback.isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                {feedback.isCorrect ? '✓ Correct!' : '✗ Incorrect'}
              </div>
              <div className="text-gray-700">
                <div>Expected: {feedback.expectedAnswer}</div>
                <div>Your answer: {feedback.userAnswer}</div>
                <div>Time: {feedback.timeTaken}s</div>
              </div>
            </div>
          )}

          {isAnswered && (
            <div className="mt-4 text-center">
              <button
                onClick={generateNewChallenge}
                className="px-6 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-semibold"
              >
                Next Challenge
              </button>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-black mb-3">Instructions</h3>
          <ul className="text-black/80 space-y-2 text-sm">
            <li>• Listen to each 4-chord progression containing 1-2 non-diatonic chords</li>
            <li>• Identify both diatonic and non-diatonic chords using roman numeral analysis</li>
            <li>• Use standard symbols: bII (Neapolitan), bIII/bVI/bVII (borrowed), I+/V+ (augmented)</li>
            <li>• In major keys, borrowed chords come from the parallel minor</li>
            <li>• In minor keys, borrowed chords come from the parallel major</li>
            <li>• Enter your answer as space-separated roman numerals (e.g., "I bVI IV V")</li>
          </ul>
        </div>
      </div>
    </div>
  );
}