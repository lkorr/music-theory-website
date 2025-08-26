/**
 * Chord Progressions Level 2: Progressions with Inversions
 * Level-specific logic and configuration
 */

import { generateProgression, validateProgressionAnswer, keySignatures, romanNumerals, REQUIRE_INVERSION_LABELING } from '../shared/progressionLogic';

// Type definitions
export interface ChordInfo {
  degree: number;
  inversion: 'root' | 'first' | 'second';
}

export interface KeySignature {
  type: 'major' | 'minor';
  notes: string[];
}

export interface LevelConfig {
  title: string;
  description: string;
  totalProblems: number;
  passAccuracy: number;
  passTime: number;
  buttonColor: string;
  buttonHoverColor: string;
}

export interface ChordProgression {
  key: string;
  chords: number[][];
  progression: ChordInfo[];
  answer: string;
  romanNumerals: string[];
}

// Level 2 configuration
export const level2Config: LevelConfig = {
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
// Each progression has at least 2 inversions
const level2Progressions: ChordInfo[][] = [
  [
    { degree: 0, inversion: 'first' },   // I6
    { degree: 4, inversion: 'first' },   // V6
    { degree: 5, inversion: 'root' },    // vi
    { degree: 3, inversion: 'root' }     // IV
  ],
  [
    { degree: 0, inversion: 'root' },    // I
    { degree: 3, inversion: 'first' },   // IV6  
    { degree: 4, inversion: 'second' },  // V64
    { degree: 0, inversion: 'root' }     // I
  ],
  [
    { degree: 5, inversion: 'first' },   // vi6
    { degree: 3, inversion: 'root' },    // IV
    { degree: 0, inversion: 'second' },  // I64
    { degree: 4, inversion: 'root' }     // V
  ],
  [
    { degree: 0, inversion: 'root' },    // I
    { degree: 1, inversion: 'first' },   // ii6
    { degree: 4, inversion: 'first' },   // V6
    { degree: 0, inversion: 'root' }     // I
  ],
  [
    { degree: 0, inversion: 'first' },   // I6
    { degree: 4, inversion: 'root' },    // V
    { degree: 5, inversion: 'first' },   // vi6
    { degree: 3, inversion: 'root' }     // IV
  ],
  [
    { degree: 3, inversion: 'first' },   // IV6
    { degree: 0, inversion: 'second' },  // I64
    { degree: 4, inversion: 'root' },    // V
    { degree: 0, inversion: 'root' }     // I
  ],
  [
    { degree: 1, inversion: 'first' },   // ii6
    { degree: 4, inversion: 'second' },  // V64
    { degree: 0, inversion: 'root' },    // I
    { degree: 5, inversion: 'root' }     // vi
  ],
  [
    { degree: 0, inversion: 'root' },    // I
    { degree: 5, inversion: 'first' },   // vi6
    { degree: 1, inversion: 'first' },   // ii6
    { degree: 4, inversion: 'root' }     // V
  ]
];

/**
 * Convert note name to MIDI number (handles flats, sharps, and enharmonic equivalents)
 */
const noteToMidi = (noteName: string, octave: number = 4): number => {
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  
  // Handle enharmonic equivalents (e.g., "F# / Gb")
  if (noteName.includes(' / ')) {
    noteName = noteName.split(' / ')[0]; // Use the first note name (sharp version)
  }
  
  // Handle flat and sharp notes
  let noteIndex: number;
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
 * Uses proper chord qualities and interval calculations
 */
const generateChordFromScaleDegreeWithInversion = (keySignature: KeySignature, chordInfo: ChordInfo, octave: number = 4): number[] => {
  const { degree, inversion } = chordInfo;
  const keyType = keySignature.type;
  
  // Get the root note from the scale
  const rootNote = keySignature.notes[degree];
  
  // Handle enharmonic equivalents (e.g., "F# / Gb")
  let cleanRootNote = rootNote;
  if (rootNote.includes(' / ')) {
    cleanRootNote = rootNote.split(' / ')[0]; // Use the first note name (sharp version)
  }
  
  // Convert root to MIDI
  const rootMidi = noteToMidi(cleanRootNote, octave);
  
  // Define chord qualities for each scale degree
  const chordQualities = {
    major: [
      'major',     // I
      'minor',     // ii
      'minor',     // iii
      'major',     // IV
      'major',     // V
      'minor',     // vi
      'diminished' // vii°
    ],
    minor: [
      'minor',     // i
      'diminished',// ii°
      'major',     // bIII
      'minor',     // iv
      'minor',     // v
      'major',     // bVI
      'major'      // bVII
    ]
  };
  
  const quality = chordQualities[keyType][degree];
  
  // Build chord based on quality using proper intervals
  let thirdMidi: number, fifthMidi: number;
  
  switch (quality) {
    case 'major':
      thirdMidi = rootMidi + 4; // Major third
      fifthMidi = rootMidi + 7; // Perfect fifth
      break;
    case 'minor':
      thirdMidi = rootMidi + 3; // Minor third
      fifthMidi = rootMidi + 7; // Perfect fifth
      break;
    case 'diminished':
      thirdMidi = rootMidi + 3; // Minor third
      fifthMidi = rootMidi + 6; // Diminished fifth
      break;
    default:
      thirdMidi = rootMidi + 4; // Default to major
      fifthMidi = rootMidi + 7;
  }
  
  // Apply inversion
  let chordNotes = [rootMidi, thirdMidi, fifthMidi];
  
  if (inversion === 'first') {
    // First inversion: third in bass
    chordNotes = [thirdMidi, fifthMidi, rootMidi + 12];
  } else if (inversion === 'second') {
    // Second inversion: fifth in bass
    chordNotes = [fifthMidi, rootMidi + 12, thirdMidi + 12];
  }
  
  // Keep chords in a reasonable range (C4-C6)
  const minNote = Math.min(...chordNotes);
  const maxNote = Math.max(...chordNotes);
  
  if (minNote > 72) { // If too high, move down an octave
    chordNotes = chordNotes.map(note => Math.round(note - 12));
  } else if (maxNote < 60) { // If too low, move up an octave
    chordNotes = chordNotes.map(note => Math.round(note + 12));
  }
  
  // Ensure all notes are integers
  return chordNotes.map(note => Math.round(note));
};

/**
 * Get the display name for a Roman numeral with inversion
 */
const getRomanNumeralWithInversion = (key: string, chordInfo: ChordInfo): string => {
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
export const generateLevel2Progression = (): ChordProgression => {
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
  
  // Generate the answer (Roman numerals with or without inversions based on config)
  const romanNumeralProgression = progression.map(chordInfo => 
    getRomanNumeralWithInversion(randomKey, chordInfo)
  );
  
  // If inversion labeling is not required, strip inversions from the displayed answer
  let displayAnswer = romanNumeralProgression.join(' - ');
  if (!REQUIRE_INVERSION_LABELING) {
    displayAnswer = displayAnswer
      .replace(/6/g, '')       // Remove figured bass 6
      .replace(/64/g, '')      // Remove figured bass 64
      .replace(/°6/g, '°')     // Handle diminished chords with inversions
      .replace(/°64/g, '°');
  }
  
  return {
    key: randomKey,
    chords,
    progression,
    answer: displayAnswer,
    romanNumerals: romanNumeralProgression
  };
};

/**
 * Validate a Level 2 progression answer (with or without inversions based on config)
 */
export const validateLevel2Answer = (userAnswer: string, expectedAnswer: string): boolean => {
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