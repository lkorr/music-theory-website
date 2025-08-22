/**
 * Chord Progressions Level 2: Progressions with Inversions
 * Level-specific logic and configuration
 */

import { generateProgression, validateProgressionAnswer, keySignatures, romanNumerals } from '../../shared/theory/progressions/progressionLogic.js';
import { REQUIRE_INVERSION_LABELING } from '../../shared/theory/core/constants.js';

// Level 2 configuration
export const level2Config = {
  title: "Chord Progressions Level 2: Basic Inversions",
  description: "Identify chord progressions with basic inversions in major and minor keys",
  totalProblems: 15,
  passAccuracy: 85,
  passTime: 12,
  buttonColor: "bg-orange-600",
  buttonHoverColor: "bg-orange-700"
};

// Inversion symbols for slash chord notation  
const inversionSymbols = {
  first: '6',   // First inversion uses figured bass notation 6
  second: '64'  // Second inversion uses figured bass notation 6/4
};

// Common progressions with inversions for Level 2
// Scale degrees: 0=I, 1=ii, 2=iii, 3=IV, 4=V, 5=vi, 6=vii°
const level2Progressions = [
  [
    { degree: 0, inversion: 'root' },    // I
    { degree: 4, inversion: 'first' },   // V6
    { degree: 5, inversion: 'root' },    // vi
    { degree: 0, inversion: 'root' }     // I
  ],
  [
    { degree: 0, inversion: 'root' },    // I
    { degree: 3, inversion: 'first' },   // IV6  
    { degree: 4, inversion: 'root' },    // V
    { degree: 0, inversion: 'root' }     // I
  ],
  [
    { degree: 5, inversion: 'root' },    // vi
    { degree: 3, inversion: 'root' },    // IV
    { degree: 0, inversion: 'second' },  // I64
    { degree: 4, inversion: 'root' }     // V
  ],
  [
    { degree: 0, inversion: 'root' },    // I
    { degree: 1, inversion: 'first' },   // ii6
    { degree: 4, inversion: 'root' },    // V
    { degree: 0, inversion: 'root' }     // I
  ],
  [
    { degree: 0, inversion: 'first' },   // I6
    { degree: 4, inversion: 'root' },    // V
    { degree: 5, inversion: 'root' },    // vi
    { degree: 3, inversion: 'root' }     // IV
  ],
  [
    { degree: 3, inversion: 'root' },    // IV
    { degree: 0, inversion: 'second' },  // I64
    { degree: 4, inversion: 'root' },    // V
    { degree: 0, inversion: 'root' }     // I
  ]
];

/**
 * Convert note name to MIDI number (handles flats and sharps)
 */
const noteToMidi = (noteName, octave = 4) => {
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  
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

/**
 * Generate chord from scale degree with inversion in a given key
 */
const generateChordFromScaleDegreeWithInversion = (keySignature, chordInfo, octave = 4) => {
  const notes = keySignature.notes;
  const { degree, inversion } = chordInfo;
  
  // Build triad using scale degrees (root, third, fifth)
  const root = notes[degree];
  const third = notes[(degree + 2) % 7];
  const fifth = notes[(degree + 4) % 7];
  
  // Convert to MIDI numbers
  let rootMidi = noteToMidi(root, octave);
  let thirdMidi = noteToMidi(third, octave);
  let fifthMidi = noteToMidi(fifth, octave);
  
  // Ensure notes are in ascending order within the octave
  while (thirdMidi <= rootMidi) thirdMidi += 12;
  while (fifthMidi <= thirdMidi) fifthMidi += 12;
  
  // Apply inversion
  let chordNotes = [rootMidi, thirdMidi, fifthMidi];
  
  if (inversion === 'first') {
    // First inversion: move root up an octave
    chordNotes = [thirdMidi, fifthMidi, rootMidi + 12];
  } else if (inversion === 'second') {
    // Second inversion: move root and third up an octave
    chordNotes = [fifthMidi, rootMidi + 12, thirdMidi + 12];
  }
  
  // Keep chords in a reasonable range
  const minNote = Math.min(...chordNotes);
  if (minNote > 72) { // If too high, move down an octave
    chordNotes = chordNotes.map(note => note - 12);
  }
  
  return chordNotes;
};

/**
 * Get the display name for a Roman numeral with inversion
 */
const getRomanNumeralWithInversion = (key, chordInfo) => {
  const keyType = keySignatures[key]?.type || 'major';
  const baseRomanNumeral = romanNumerals[keyType][chordInfo.degree];
  
  if (chordInfo.inversion === 'root') {
    return baseRomanNumeral;
  } else if (chordInfo.inversion === 'first') {
    return `${baseRomanNumeral}${inversionSymbols.first}`;
  } else if (chordInfo.inversion === 'second') {
    return `${baseRomanNumeral}${inversionSymbols.second}`;
  }
  
  return baseRomanNumeral;
};

/**
 * Generate a Level 2 progression with inversions
 */
export const generateLevel2Progression = () => {
  const keys = Object.keys(keySignatures);
  const randomKey = keys[Math.floor(Math.random() * keys.length)];
  const keySignature = keySignatures[randomKey];
  
  // Select a random progression pattern
  const progressionIndex = Math.floor(Math.random() * level2Progressions.length);
  const progression = level2Progressions[progressionIndex];
  
  // Generate the chords with inversions
  const chords = progression.map(chordInfo => 
    generateChordFromScaleDegreeWithInversion(keySignature, chordInfo)
  );
  
  // Generate the answer (Roman numerals with inversions)
  const romanNumeralProgression = progression.map(chordInfo => 
    getRomanNumeralWithInversion(randomKey, chordInfo)
  );
  
  return {
    key: randomKey,
    chords,
    progression,
    answer: romanNumeralProgression.join(' - '),
    romanNumerals: romanNumeralProgression
  };
};

/**
 * Validate a Level 2 progression answer (with or without inversions based on config)
 */
export const validateLevel2Answer = (userAnswer, expectedAnswer) => {
  if (!REQUIRE_INVERSION_LABELING) {
    // If inversions not required, strip inversion markings from expected answer
    const expectedWithoutInversions = expectedAnswer
      .replace(/6/g, '')       // Remove figured bass 6
      .replace(/64/g, '')      // Remove figured bass 64
      .replace(/°6/g, '°')     // Handle diminished chords with inversions
      .replace(/°64/g, '°');
    
    return validateProgressionAnswer(userAnswer, expectedWithoutInversions);
  }
  
  return validateProgressionAnswer(userAnswer, expectedAnswer);
};