/**
 * Chord Progressions Logic - Standalone Version
 * Contains Roman numeral analysis, key signatures, and progression-specific utilities
 * Self-contained version that doesn't rely on external imports
 */

// Standard note names in chromatic order
const noteNames: readonly string[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Type definitions for music theory
export type KeyType = 'major' | 'minor';

export interface KeySignature {
  type: KeyType;
  notes: string[];
}

export interface KeySignatures {
  [key: string]: KeySignature;
}

export interface RomanNumerals {
  major: readonly string[];
  minor: readonly string[];
}

export type ChordQuality = 'major' | 'minor' | 'diminished';

export interface ProgressionData {
  key: string;
  chords: number[][];
  progression: number[];
  answer: string;
  romanNumerals: string[];
}

export interface ValidationParams {
  key: string;
}

// Major and minor key signatures with correct scale notes
export const keySignatures: KeySignatures = {
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
  'Abm': { type: 'minor', notes: ['G# / Ab', 'A# / Bb', 'B / Cb', 'C# / Db', 'D# / Eb', 'E / Fb', 'F# / Gb'] },
  'Gbm': { type: 'minor', notes: ['F# / Gb', 'G# / Ab', 'A', 'B', 'C# / Db', 'D', 'E'] }
};

// Roman numeral patterns for major and minor keys
export const romanNumerals: RomanNumerals = {
  major: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'],
  minor: ['i', 'ii°', 'bIII', 'iv', 'v', 'bVI', 'bVII']
};

// Common chord progressions (indices correspond to scale degrees)
// Scale degrees: 0=I, 1=ii, 2=iii, 3=IV, 4=V, 5=vi, 6=vii°
export const commonProgressions: readonly (readonly number[])[] = [
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

/**
 * Convert note name to MIDI number (handles flats, sharps, and enharmonic equivalents)
 */
export const noteToMidi = (noteName: string, octave: number = 4): number => {
  // Handle enharmonic equivalents (e.g., "F# / Gb")
  let processedNoteName = noteName;
  if (noteName.includes(' / ')) {
    processedNoteName = noteName.split(' / ')[0]; // Use the first note name (sharp version)
  }
  
  // Handle flat and sharp notes
  let noteIndex: number;
  if (processedNoteName.includes('b')) {
    const baseName = processedNoteName[0];
    const baseIndex = noteNames.indexOf(baseName);
    noteIndex = (baseIndex - 1 + 12) % 12; // Flat = one semitone down
  } else if (processedNoteName.includes('#')) {
    const baseName = processedNoteName[0];
    const baseIndex = noteNames.indexOf(baseName);
    noteIndex = (baseIndex + 1) % 12; // Sharp = one semitone up
  } else {
    noteIndex = noteNames.indexOf(processedNoteName);
  }
  
  return noteIndex + (octave + 1) * 12;
};

/**
 * Generate chord from scale degree in a given key with correct chord qualities
 */
export const generateChordFromScaleDegree = (keySignature: KeySignature, scaleDegree: number, octave: number = 4): number[] => {
  const notes = keySignature.notes;
  const keyType = keySignature.type;
  
  // Get the root note
  const root = notes[scaleDegree];
  const rootMidi = noteToMidi(root, octave);
  
  // Define chord qualities for each scale degree
  const chordQualities: Record<KeyType, ChordQuality[]> = {
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
      'minor',     // v (can be major in harmonic minor, but using natural minor)
      'major',     // bVI
      'major'      // bVII
    ]
  };
  
  const quality = chordQualities[keyType][scaleDegree];
  
  // Build chord based on quality
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
  
  // Keep chords in a reasonable range
  if (rootMidi > 72) { // If too high, move down an octave
    return [Math.round(rootMidi - 12), Math.round(thirdMidi - 12), Math.round(fifthMidi - 12)];
  }
  
  return [Math.round(rootMidi), Math.round(thirdMidi), Math.round(fifthMidi)];
};

/**
 * Check if a MIDI note is the tonic of the key
 */
export const isTonicNote = (midiNote: number, params: ValidationParams): boolean => {
  const noteNamesWithEnharmonics = [
    "C","C# / Db","D","D# / Eb","E","F","F# / Gb","G","G# / Ab","A","A# / Bb","B"
  ];
  const noteName = noteNamesWithEnharmonics[midiNote % 12];
  
  // Get the tonic note from the key
  let tonicNote: string;
  if (params.key.endsWith('m')) {
    // Minor key - remove 'm' suffix
    tonicNote = params.key.slice(0, -1);
  } else {
    // Major key
    tonicNote = params.key;
  }
  
  // Handle enharmonic equivalents
  if (noteName.includes(' / ')) {
    const [sharp, flat] = noteName.split(' / ');
    return sharp === tonicNote || flat === tonicNote || 
           sharp === tonicNote + '#' || flat === tonicNote + 'b';
  }
  
  return noteName === tonicNote || 
         noteName === tonicNote + '#' || 
         noteName === tonicNote + 'b';
};

/**
 * Get the display name for a Roman numeral in a progression
 */
export const getRomanNumeral = (key: string, scaleDegree: number): string => {
  const keyType = keySignatures[key]?.type || 'major';
  return romanNumerals[keyType][scaleDegree];
};

/**
 * Generate a random chord progression
 */
export const generateProgression = (key: string): ProgressionData => {
  const keySignature = keySignatures[key];
  if (!keySignature) {
    throw new Error(`Invalid key: ${key}`);
  }
  
  // Select a random progression pattern
  const progressionIndex = Math.floor(Math.random() * commonProgressions.length);
  const progression = [...commonProgressions[progressionIndex]];
  
  // Generate the chords
  const chords = progression.map(degree => 
    generateChordFromScaleDegree(keySignature, degree)
  );
  
  // Generate the answer (Roman numerals)
  const romanNumeralProgression = progression.map(degree => 
    getRomanNumeral(key, degree)
  );
  
  return {
    key,
    chords,
    progression,
    answer: romanNumeralProgression.join(' - '),
    romanNumerals: romanNumeralProgression
  };
};

/**
 * Validate a Roman numeral progression answer
 */
export const validateProgressionAnswer = (userAnswer: string, expectedAnswer: string): boolean => {
  // Normalize the answers for comparison
  const normalize = (str: string): string => str
    .toLowerCase()
    .replace(/\s+/g, '')           // Remove all spaces
    .replace(/[–—]/g, '-')         // Handle different dash types  
    .replace(/°/g, 'o')            // Handle diminished symbol variations
    .replace(/dim/g, 'o')          // Handle "dim" as diminished
    .replace(/([iv]+)d\b/g, '$1o') // Handle "d" suffix as diminished (e.g., "iid" -> "iio")
    .replace(/♭/g, 'b')            // Handle flat symbol variations
    .replace(/♯/g, '#')            // Handle sharp symbol variations
    .replace(/-/g, '');            // Remove dashes for comparison
  
  return normalize(userAnswer) === normalize(expectedAnswer);
};

// REQUIRE_INVERSION_LABELING constant
export const REQUIRE_INVERSION_LABELING = false;