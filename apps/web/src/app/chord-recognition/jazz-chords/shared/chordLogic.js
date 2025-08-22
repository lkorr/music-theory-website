/**
 * Jazz/Extended Chords Logic
 * 
 * Contains 9th, 11th, and 13th chord definitions and utilities for extended chord recognition
 */

// Import from shared theory modules
import { noteNames, getMidiNoteNameWithEnharmonics, isBlackKey } from '../../shared/theory/core/notes.js';
import { extendedChordTypes, inversionTypes } from '../../shared/theory/core/constants.js';

// Re-export for backward compatibility
export { noteNames, isBlackKey };

// Wrapper for getMidiNoteName to maintain compatibility
export const getMidiNoteName = (midiNote) => {
  return getMidiNoteNameWithEnharmonics(midiNote);
};

// 9th chord types with intervals (semitones from root)
export const ninthChordTypes = {
  maj9: {
    name: 'Major 9th',
    symbol: 'maj9',
    intervals: [0, 4, 7, 11, 14], // Root, Major 3rd, Perfect 5th, Major 7th, Major 9th
    acceptedNotations: ['maj9', 'M9', 'ma9', 'Maj9', 'MA9']
  },
  min9: {
    name: 'Minor 9th',
    symbol: 'm9',
    intervals: [0, 3, 7, 10, 14], // Root, Minor 3rd, Perfect 5th, Minor 7th, Major 9th
    acceptedNotations: ['m9', 'min9', 'mi9', 'Min9', '-9']
  },
  dom9: {
    name: 'Dominant 9th',
    symbol: '9',
    intervals: [0, 4, 7, 10, 14], // Root, Major 3rd, Perfect 5th, Minor 7th, Major 9th
    acceptedNotations: ['9', 'dom9', 'Dom9', '7/9']
  },
  dom7b9: {
    name: 'Dominant 7th ♭9',
    symbol: '7♭9',
    intervals: [0, 4, 7, 10, 13], // Root, Major 3rd, Perfect 5th, Minor 7th, Minor 9th
    acceptedNotations: ['7b9', '7♭9', 'dom7b9', '7-9']
  },
  dom7sharp9: {
    name: 'Dominant 7th ♯9',
    symbol: '7♯9',
    intervals: [0, 4, 7, 10, 15], // Root, Major 3rd, Perfect 5th, Minor 7th, Augmented 9th
    acceptedNotations: ['7#9', '7♯9', 'dom7#9', '7+9']
  },
  min7b9: {
    name: 'Minor 7th ♭9',
    symbol: 'm7♭9',
    intervals: [0, 3, 7, 10, 13], // Root, Minor 3rd, Perfect 5th, Minor 7th, Minor 9th
    acceptedNotations: ['m7b9', 'm7♭9', 'min7b9', 'm7-9']
  },
  minMaj9: {
    name: 'Minor Major 9th',
    symbol: 'mMaj9',
    intervals: [0, 3, 7, 11, 14], // Root, Minor 3rd, Perfect 5th, Major 7th, Major 9th
    acceptedNotations: ['mMaj9', 'mM9', 'minMaj9', 'm(maj9)']
  },
  add9: {
    name: 'Add 9',
    symbol: 'add9',
    intervals: [0, 4, 7, 14], // Root, Major 3rd, Perfect 5th, Major 9th (no 7th)
    acceptedNotations: ['add9', 'add2', '(add9)', '(add2)', 'majadd9', 'majadd2']
  },
  madd9: {
    name: 'Minor Add 9',
    symbol: 'madd9',
    intervals: [0, 3, 7, 14], // Root, Minor 3rd, Perfect 5th, Major 9th (no 7th)
    acceptedNotations: ['madd9', 'madd2', 'm(add9)', 'm(add2)', 'minadd9', 'minadd2', 'minoradd9', 'minoradd2']
  },
  dim9: {
    name: 'Diminished 9th',
    symbol: 'dim9',
    intervals: [0, 3, 6, 9, 14], // Root, Minor 3rd, Diminished 5th, Diminished 7th, Major 9th
    acceptedNotations: ['dim9', '°9', 'o9']
  },
  halfDim9: {
    name: 'Half Diminished 9th',
    symbol: 'm7♭5(9)',
    intervals: [0, 3, 6, 10, 14], // Root, Minor 3rd, Diminished 5th, Minor 7th, Major 9th
    acceptedNotations: ['m7b5(9)', 'm7♭5(9)', 'ø9', 'halfDim9', 'm7b5add9']
  },
  dim7add9: {
    name: 'Diminished 7th Add 9',
    symbol: 'dim7(add9)',
    intervals: [0, 3, 6, 9, 14], // Root, Minor 3rd, Diminished 5th, Diminished 7th, Major 9th
    acceptedNotations: ['dim7add9', 'dim7(add9)', '°7add9', '°7(add9)', 'o7add9', 'o7(add9)']
  },
  dim7b9: {
    name: 'Diminished 7th ♭9',
    symbol: 'dim7♭9',
    intervals: [0, 3, 6, 9, 13], // Root, Minor 3rd, Diminished 5th, Diminished 7th, Minor 9th
    acceptedNotations: ['dim7b9', 'dim7♭9', '°7b9', '°7♭9', 'o7b9', 'o7♭9', 'dim7addb9']
  },
  halfDimb9: {
    name: 'Half Diminished ♭9',
    symbol: 'm7♭5♭9',
    intervals: [0, 3, 6, 10, 13], // Root, Minor 3rd, Diminished 5th, Minor 7th, Minor 9th
    acceptedNotations: ['m7b5b9', 'm7♭5♭9', 'øb9', 'ø♭9', 'halfDimb9', 'm7b5addb9']
  }
};

// 9th chord inversion types (5 inversions: root, 1st, 2nd, 3rd, 4th)
export const ninthInversionTypes = {
  root: {
    name: 'Root Position',
    symbol: '',
    intervalOrder: [0, 1, 2, 3, 4] // Root, 3rd, 5th, 7th, 9th
  },
  first: {
    name: '1st Inversion',
    symbol: '/1',
    intervalOrder: [1, 2, 3, 4, 0] // 3rd, 5th, 7th, 9th, Root
  },
  second: {
    name: '2nd Inversion',
    symbol: '/2',
    intervalOrder: [2, 3, 4, 0, 1] // 5th, 7th, 9th, Root, 3rd
  },
  third: {
    name: '3rd Inversion',
    symbol: '/3',
    intervalOrder: [3, 4, 0, 1, 2] // 7th, 9th, Root, 3rd, 5th
  },
  fourth: {
    name: '4th Inversion',
    symbol: '/4',
    intervalOrder: [4, 0, 1, 2, 3] // 9th, Root, 3rd, 5th, 7th
  }
};

// 11th chord types with intervals (semitones from root)
export const eleventhChordTypes = {
  maj11: {
    name: 'Major 11th',
    symbol: 'maj11',
    intervals: [0, 4, 7, 11, 14, 17], // Root, Major 3rd, Perfect 5th, Major 7th, Major 9th, Perfect 11th
    acceptedNotations: ['maj11', 'M11', 'ma11', 'Maj11', 'MA11']
  },
  min11: {
    name: 'Minor 11th',
    symbol: 'm11',
    intervals: [0, 3, 7, 10, 14, 17], // Root, Minor 3rd, Perfect 5th, Minor 7th, Major 9th, Perfect 11th
    acceptedNotations: ['m11', 'min11', 'mi11', 'Min11', '-11']
  },
  dom11: {
    name: 'Dominant 11th',
    symbol: '11',
    intervals: [0, 4, 7, 10, 14, 17], // Root, Major 3rd, Perfect 5th, Minor 7th, Major 9th, Perfect 11th
    acceptedNotations: ['11', 'dom11', 'Dom11', '7/11']
  },
  sus4: {
    name: 'Suspended 4th',
    symbol: 'sus4',
    intervals: [0, 5, 7], // Root, Perfect 4th, Perfect 5th (no 3rd)
    acceptedNotations: ['sus4', 'sus', 'suspended', 'Sus4', 'SUS4']
  },
  sus2: {
    name: 'Suspended 2nd',
    symbol: 'sus2',
    intervals: [0, 2, 7], // Root, Major 2nd, Perfect 5th (no 3rd)
    acceptedNotations: ['sus2', 'Sus2', 'SUS2']
  },
  maj7sharp11: {
    name: 'Major 7th ♯11',
    symbol: 'maj7♯11',
    intervals: [0, 4, 7, 11, 18], // Root, Major 3rd, Perfect 5th, Major 7th, Augmented 11th
    acceptedNotations: ['maj7#11', 'maj7♯11', 'M7#11', 'M7♯11', 'maj7+11']
  },
  dom7sharp11: {
    name: 'Dominant 7th ♯11',
    symbol: '7♯11',
    intervals: [0, 4, 7, 10, 18], // Root, Major 3rd, Perfect 5th, Minor 7th, Augmented 11th
    acceptedNotations: ['7#11', '7♯11', 'dom7#11', '7+11']
  },
  min7sharp11: {
    name: 'Minor 7th ♯11',
    symbol: 'm7♯11',
    intervals: [0, 3, 7, 10, 18], // Root, Minor 3rd, Perfect 5th, Minor 7th, Augmented 11th
    acceptedNotations: ['m7#11', 'm7♯11', 'min7#11', 'm7+11']
  },
  sus4add9: {
    name: 'Suspended 4th Add 9',
    symbol: 'sus4(add9)',
    intervals: [0, 5, 7, 14], // Root, Perfect 4th, Perfect 5th, Major 9th
    acceptedNotations: ['sus4add9', 'sus4(add9)', 'susadd9', 'sus(add9)', 'sus4add2', 'sus4(add2)']
  },
  sus2add9: {
    name: 'Suspended 2nd Add 9',
    symbol: 'sus2(add9)',
    intervals: [0, 2, 7, 14], // Root, Major 2nd, Perfect 5th, Major 9th
    acceptedNotations: ['sus2add9', 'sus2(add9)', 'sus2add2', 'sus2(add2)']
  }
};

// 11th chord inversion types (varies by chord - sus chords have 3 notes, extended 11ths have 6)
export const eleventhInversionTypes = {
  root: {
    name: 'Root Position',
    symbol: '',
    intervalOrder: [0, 1, 2, 3, 4, 5] // Adjusted based on chord length
  },
  first: {
    name: '1st Inversion',
    symbol: '/1',
    intervalOrder: [1, 2, 3, 4, 5, 0]
  },
  second: {
    name: '2nd Inversion',
    symbol: '/2',
    intervalOrder: [2, 3, 4, 5, 0, 1]
  },
  third: {
    name: '3rd Inversion',
    symbol: '/3',
    intervalOrder: [3, 4, 5, 0, 1, 2]
  },
  fourth: {
    name: '4th Inversion',
    symbol: '/4',
    intervalOrder: [4, 5, 0, 1, 2, 3]
  },
  fifth: {
    name: '5th Inversion',
    symbol: '/5',
    intervalOrder: [5, 0, 1, 2, 3, 4]
  }
};

// 13th chord types with intervals (semitones from root)
export const thirteenthChordTypes = {
  maj13: {
    name: 'Major 13th',
    symbol: 'maj13',
    intervals: [0, 4, 7, 11, 14, 17, 21], // Root, Major 3rd, Perfect 5th, Major 7th, Major 9th, Perfect 11th, Major 13th
    acceptedNotations: ['maj13', 'M13', 'ma13', 'Maj13', 'MA13']
  },
  min13: {
    name: 'Minor 13th',
    symbol: 'm13',
    intervals: [0, 3, 7, 10, 14, 17, 21], // Root, Minor 3rd, Perfect 5th, Minor 7th, Major 9th, Perfect 11th, Major 13th
    acceptedNotations: ['m13', 'min13', 'mi13', 'Min13', '-13']
  },
  dom13: {
    name: 'Dominant 13th',
    symbol: '13',
    intervals: [0, 4, 7, 10, 14, 17, 21], // Root, Major 3rd, Perfect 5th, Minor 7th, Major 9th, Perfect 11th, Major 13th
    acceptedNotations: ['13', 'dom13', 'Dom13', '7/13']
  },
  maj13sharp11: {
    name: 'Major 13th ♯11',
    symbol: 'maj13♯11',
    intervals: [0, 4, 7, 11, 14, 18, 21], // Root, Major 3rd, Perfect 5th, Major 7th, Major 9th, Augmented 11th, Major 13th
    acceptedNotations: ['maj13#11', 'maj13♯11', 'M13#11', 'M13♯11', 'maj13+11']
  },
  dom13sharp11: {
    name: 'Dominant 13th ♯11',
    symbol: '13♯11',
    intervals: [0, 4, 7, 10, 14, 18, 21], // Root, Major 3rd, Perfect 5th, Minor 7th, Major 9th, Augmented 11th, Major 13th
    acceptedNotations: ['13#11', '13♯11', 'dom13#11', '13+11']
  },
  min13sharp11: {
    name: 'Minor 13th ♯11',
    symbol: 'm13♯11',
    intervals: [0, 3, 7, 10, 14, 18, 21], // Root, Minor 3rd, Perfect 5th, Minor 7th, Major 9th, Augmented 11th, Major 13th
    acceptedNotations: ['m13#11', 'm13♯11', 'min13#11', 'm13+11']
  },
  dom13b9: {
    name: 'Dominant 13th ♭9',
    symbol: '13♭9',
    intervals: [0, 4, 7, 10, 13, 17, 21], // Root, Major 3rd, Perfect 5th, Minor 7th, Minor 9th, Perfect 11th, Major 13th
    acceptedNotations: ['13b9', '13♭9', 'dom13b9', '13-9']
  },
  dom13sharp9: {
    name: 'Dominant 13th ♯9',
    symbol: '13♯9',
    intervals: [0, 4, 7, 10, 15, 17, 21], // Root, Major 3rd, Perfect 5th, Minor 7th, Augmented 9th, Perfect 11th, Major 13th
    acceptedNotations: ['13#9', '13♯9', 'dom13#9', '13+9']
  },
  dom13b5: {
    name: 'Dominant 13th ♭5',
    symbol: '13♭5',
    intervals: [0, 4, 6, 10, 14, 17, 21], // Root, Major 3rd, Diminished 5th, Minor 7th, Major 9th, Perfect 11th, Major 13th
    acceptedNotations: ['13b5', '13♭5', 'dom13b5', '13-5']
  },
  add13: {
    name: 'Add 13',
    symbol: 'add13',
    intervals: [0, 4, 7, 21], // Root, Major 3rd, Perfect 5th, Major 13th (no 7th, 9th, 11th)
    acceptedNotations: ['add13', 'add6', '(add13)', '(add6)', 'majadd13', 'majadd6']
  },
  madd13: {
    name: 'Minor Add 13',
    symbol: 'madd13',
    intervals: [0, 3, 7, 21], // Root, Minor 3rd, Perfect 5th, Major 13th (no 7th, 9th, 11th)
    acceptedNotations: ['madd13', 'madd6', 'm(add13)', 'm(add6)', 'minadd13', 'minadd6']
  }
};

// 13th chord inversion types (varies by chord - add chords have 4 notes, full 13ths have 7)
export const thirteenthInversionTypes = {
  root: {
    name: 'Root Position',
    symbol: '',
    intervalOrder: [0, 1, 2, 3, 4, 5, 6] // Adjusted based on chord length
  },
  first: {
    name: '1st Inversion',
    symbol: '/1',
    intervalOrder: [1, 2, 3, 4, 5, 6, 0]
  },
  second: {
    name: '2nd Inversion',
    symbol: '/2',
    intervalOrder: [2, 3, 4, 5, 6, 0, 1]
  },
  third: {
    name: '3rd Inversion',
    symbol: '/3',
    intervalOrder: [3, 4, 5, 6, 0, 1, 2]
  },
  fourth: {
    name: '4th Inversion',
    symbol: '/4',
    intervalOrder: [4, 5, 6, 0, 1, 2, 3]
  },
  fifth: {
    name: '5th Inversion',
    symbol: '/5',
    intervalOrder: [5, 6, 0, 1, 2, 3, 4]
  },
  sixth: {
    name: '6th Inversion',
    symbol: '/6',
    intervalOrder: [6, 0, 1, 2, 3, 4, 5]
  }
};

// Jazz chord level configurations
export const jazzLevelConfigs = {
  level1: {
    name: 'Level 1: 9th Chords',
    description: 'Identify 9th chords in root position only',
    totalProblems: 30,
    passAccuracy: 85,
    passTime: 8,
    buttonColor: 'bg-purple-500',
    buttonHoverColor: 'bg-purple-600',
    progressColor: 'bg-purple-500',
    roots: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], // All chromatic notes
    chordTypes: ['maj9', 'min9', 'dom9', 'dom7b9', 'dom7sharp9', 'min7b9', 'add9', 'madd9', 'dim7add9', 'dim7b9', 'halfDim9', 'halfDimb9'],
    inversions: ['root'], // Root position only for 9th chords
    requireInversionLabeling: false,
    octaveRange: [3, 4], // C3 to C4 range
    autoAdvance: {
      correctDelay: 1500,   // 1.5 seconds for correct answers
      incorrectDelay: 3000  // 3 seconds for incorrect answers to read feedback
    }
  },
  level2: {
    name: 'Level 2: 9th Chord Inversions',
    description: 'Identify all inversions of 9th chords (root, 1st, 2nd, 3rd, 4th)',
    totalProblems: 40,
    passAccuracy: 80,
    passTime: 12,
    buttonColor: 'bg-purple-600',
    buttonHoverColor: 'bg-purple-700',
    progressColor: 'bg-purple-600',
    roots: [0, 2, 4, 5, 7, 9, 11], // Natural notes only for inversions (C, D, E, F, G, A, B)
    chordTypes: ['maj9', 'min9', 'dom9'], // Start with basic 9th chords for inversions
    inversions: ['root', 'first', 'second', 'third', 'fourth'], // All 5 inversions
    requireInversionLabeling: true,
    octaveRange: [3, 5], // Wider range needed for inversions
    autoAdvance: {
      correctDelay: 2000,   // 2 seconds for correct answers 
      incorrectDelay: 4000  // 4 seconds for incorrect answers to read feedback
    }
  },
  level3: {
    name: 'Level 3: 11th Chords',
    description: 'Identify 11th chords in root position only',
    totalProblems: 35,
    passAccuracy: 75,
    passTime: 10,
    buttonColor: 'bg-indigo-500',
    buttonHoverColor: 'bg-indigo-600',
    progressColor: 'bg-indigo-500',
    roots: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], // All chromatic notes
    chordTypes: ['maj11', 'min11', 'dom11', 'maj7sharp11', 'dom7sharp11', 'min7sharp11'], // Core 11th chords
    inversions: ['root'], // Root position only for 11th chords
    requireInversionLabeling: false,
    octaveRange: [3, 4], // C3 to C4 range
    autoAdvance: {
      correctDelay: 1500,   // 1.5 seconds for correct answers
      incorrectDelay: 3000  // 3 seconds for incorrect answers to read feedback
    }
  },
  level4: {
    name: 'Level 4: 13th Chords',
    description: 'Identify 13th chords and alterations in root position only',
    totalProblems: 40,
    passAccuracy: 70,
    passTime: 12,
    buttonColor: 'bg-pink-500',
    buttonHoverColor: 'bg-pink-600',
    progressColor: 'bg-pink-500',
    roots: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], // All chromatic notes
    chordTypes: ['maj13', 'min13', 'dom13', 'maj13sharp11', 'dom13sharp11', 'dom13b9', 'dom13sharp9', 'add13', 'madd13'], // Core 13th chords
    inversions: ['root'], // Root position only for 13th chords
    requireInversionLabeling: false,
    octaveRange: [3, 4], // C3 to C4 range
    autoAdvance: {
      correctDelay: 1500,   // 1.5 seconds for correct answers
      incorrectDelay: 3000  // 3 seconds for incorrect answers to read feedback
    }
  }
};

/**
 * Generate a 9th chord with specified configuration
 * @param {Object} config - Level configuration
 * @returns {Object} Generated chord object
 */
export const generateNinthChord = (config) => {
  const { roots, chordTypes, inversions, requireInversionLabeling, octaveRange } = config;
  
  // Select random root
  const rootNumber = roots[Math.floor(Math.random() * roots.length)];
  const noteNameArray = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const root = noteNameArray[rootNumber];
  
  // Select random chord type
  const chordType = chordTypes[Math.floor(Math.random() * chordTypes.length)];
  const chordData = ninthChordTypes[chordType];
  
  // Select random inversion
  const inversionKey = inversions[Math.floor(Math.random() * inversions.length)];
  const inversionData = ninthInversionTypes[inversionKey];
  
  // Get reordered intervals for the inversion
  const reorderedIntervals = inversionData.intervalOrder.map(index => chordData.intervals[index]);
  
  // Calculate optimal octave based on range
  const minOctave = octaveRange[0];
  const maxOctave = octaveRange[1];
  let baseOctave = minOctave;
  
  // For inversions, ensure ascending order by moving notes to next octave if needed
  const rootMidi = 12 + (baseOctave * 12) + rootNumber; // C1 = 12
  let currentNotes = [];
  let currentMidi = rootMidi;
  
  for (let i = 0; i < reorderedIntervals.length; i++) {
    let noteMidi = rootMidi + reorderedIntervals[i];
    
    // Ensure ascending order - if this note would be lower than the previous, move it up an octave
    if (i > 0 && noteMidi <= currentNotes[i - 1]) {
      noteMidi += 12;
    }
    
    currentNotes.push(noteMidi);
  }
  
  // Check if the highest note exceeds our range, if so shift down
  const maxAllowedNote = 12 + (maxOctave * 12) + 11; // Highest note in max octave
  const highestNote = Math.max(...currentNotes);
  
  if (highestNote > maxAllowedNote) {
    const shift = Math.ceil((highestNote - maxAllowedNote) / 12) * 12;
    currentNotes = currentNotes.map(note => note - shift);
  }
  
  // Create expected answer using slash chord notation for inversions
  let expectedAnswer = root + chordData.symbol;
  if (requireInversionLabeling && inversionKey !== 'root') {
    // Get the bass note (lowest note) for slash chord notation
    const bassNoteIndex = inversionData.intervalOrder[0]; // First note in the inversion
    const bassInterval = chordData.intervals[bassNoteIndex];
    const bassNoteMidi = rootNumber + bassInterval;
    const bassNote = noteNameArray[bassNoteMidi % 12];
    expectedAnswer = `${root}${chordData.symbol}/${bassNote}`;
  }
  
  return {
    notes: currentNotes,
    name: `${root} ${chordData.name}${inversionKey !== 'root' ? ` (${inversionData.name})` : ''}`,
    expectedAnswer,
    chordType: chordType,
    root: root,
    inversion: inversionKey
  };
};

/**
 * Normalize chord notation by removing common variations
 */
function normalizeChordNotation(notation) {
  return notation
    .toLowerCase()
    .replace(/\s+/g, '')           // Remove spaces
    .replace(/\(/g, '')            // Remove opening parentheses
    .replace(/\)/g, '')            // Remove closing parentheses
    .replace(/minor/g, 'min')      // Standardize "minor" to "min"
    .replace(/major/g, 'maj')      // Standardize "major" to "maj"
    .replace(/^min(?=add)/g, 'm')  // Convert "minadd" to "madd"
    .replace(/^maj(?=add)/g, '')   // Convert "majadd" to "add"
    .replace(/add2/g, 'add9');     // Standardize add2 to add9
}

/**
 * Validate 9th chord with inversion notation
 * @param {string} answer - User's normalized answer
 * @param {string} expected - Expected normalized answer
 * @returns {boolean} True if answer is correct
 */
function validateNinthChordWithInversion(answer, expected) {
  // Extract chord parts from expected answer (prioritize slash chord notation)
  const expectedMatch = expected.match(/^([a-g][#b]?)(.*?)(?:\/([a-g][#b]?)|\s+(first|second|third|fourth|1st|2nd|3rd|4th)\s*(inversion)?|\s+root(\s+position)?)?$/i);
  if (!expectedMatch) return false;
  
  const [, expectedRoot, expectedChordSymbol, expectedBassNote, expectedInversionWord] = expectedMatch;
  
  // Extract chord parts from user answer (accept multiple formats)
  const answerMatch = answer.match(/^([a-g][#b]?)(.*?)(?:\/(\d+|[a-g][#b]?)|\s+(first|second|third|fourth|1st|2nd|3rd|4th)\s*(inversion)?|\s+root(\s+position)?)?$/i);
  if (!answerMatch) return false;
  
  const [, answerRoot, answerChordSymbol, answerInversionNotation, answerInversionWord] = answerMatch;
  
  // Check if roots match (considering enharmonics)
  if (!areEnharmonicEquivalent(answerRoot, expectedRoot)) {
    return false;
  }
  
  // Check if chord symbols match (find chord type and validate accepted notations)
  let expectedChordType = null;
  for (const [key, chord] of Object.entries(ninthChordTypes)) {
    if (normalizeChordNotation(chord.symbol) === expectedChordSymbol) {
      expectedChordType = chord;
      break;
    }
  }
  
  if (!expectedChordType) return false;
  
  const chordSymbolMatches = expectedChordType.acceptedNotations.some(notation => 
    normalizeChordNotation(notation) === answerChordSymbol
  );
  
  if (!chordSymbolMatches) return false;
  
  // Handle inversion validation
  if (expectedBassNote) {
    // Expected answer uses slash chord notation (e.g., Cmaj9/E)
    if (answerInversionNotation) {
      // User provided some inversion notation
      if (/^[a-g][#b]?$/i.test(answerInversionNotation)) {
        // User provided bass note - check if it matches
        return areEnharmonicEquivalent(answerInversionNotation, expectedBassNote);
      } else if (/^\d+$/.test(answerInversionNotation)) {
        // User provided number - convert expected bass note to number and compare
        const expectedInversionNumber = convertBassNoteToInversionNumber(expectedRoot, expectedBassNote, expectedChordType);
        return answerInversionNotation === expectedInversionNumber;
      }
    } else if (answerInversionWord) {
      // User provided descriptive word - convert to number and compare
      const inversionMap = {
        'first': '1', '1st': '1',
        'second': '2', '2nd': '2', 
        'third': '3', '3rd': '3',
        'fourth': '4', '4th': '4'
      };
      const answerInversionNumber = inversionMap[answerInversionWord.toLowerCase()];
      const expectedInversionNumber = convertBassNoteToInversionNumber(expectedRoot, expectedBassNote, expectedChordType);
      return answerInversionNumber === expectedInversionNumber;
    }
    return false; // Expected has bass note but answer doesn't specify inversion
  } else {
    // Expected answer is root position
    return !answerInversionNotation && !answerInversionWord;
  }
}

/**
 * Convert bass note to inversion number for 9th chords
 */
function convertBassNoteToInversionNumber(root, bassNote, chordType) {
  // Map bass note to inversion number based on chord intervals
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const rootIndex = noteNames.findIndex(note => areEnharmonicEquivalent(note, root));
  const bassIndex = noteNames.findIndex(note => areEnharmonicEquivalent(note, bassNote));
  
  if (rootIndex === -1 || bassIndex === -1) return null;
  
  // Calculate interval from root to bass note
  const interval = (bassIndex - rootIndex + 12) % 12;
  
  // Map interval to chord degree for this chord type
  const intervals = chordType.intervals;
  const degreeIndex = intervals.indexOf(interval);
  
  if (degreeIndex === -1) return null;
  
  // Return inversion number (1st inversion = 3rd in bass, etc.)
  return degreeIndex === 0 ? '' : degreeIndex.toString();
}

/**
 * Validate a 9th chord answer
 * @param {string} answer - User's answer
 * @param {string} expectedAnswer - Expected correct answer
 * @param {Object} config - Level configuration
 * @returns {boolean} True if answer is correct
 */
export const validateNinthChordAnswer = (answer, expectedAnswer, config) => {
  if (!answer || !expectedAnswer) return false;
  
  // Normalize both answers
  const normalizedAnswer = normalizeChordNotation(answer.trim());
  const normalizedExpected = normalizeChordNotation(expectedAnswer.trim());
  
  // Direct match after normalization
  if (normalizedAnswer === normalizedExpected) {
    return true;
  }
  
  // If inversions are not required, accept answers without inversion notation
  if (!config.requireInversionLabeling) {
    const answerWithoutInversion = normalizedAnswer.replace(/\/\d+|\/[a-g][#b]?|\s+(first|second|third|fourth|1st|2nd|3rd|4th)\s+(inversion)?|\s+root(\s+position)?/gi, '');
    const expectedWithoutInversion = normalizedExpected.replace(/\/\d+|\/[a-g][#b]?|\s+(first|second|third|fourth|1st|2nd|3rd|4th)\s+(inversion)?|\s+root(\s+position)?/gi, '');
    
    if (answerWithoutInversion === expectedWithoutInversion) {
      return true;
    }
  }
  
  // Handle inversion validation for 9th chords
  if (config.requireInversionLabeling) {
    return validateNinthChordWithInversion(normalizedAnswer, normalizedExpected);
  }
  
  // Parse root and chord type from expected answer
  const rootMatch = normalizedExpected.match(/^([a-g][#b]?)/);
  if (!rootMatch) return false;
  
  const expectedRoot = rootMatch[1];
  const expectedChordSymbol = normalizedExpected.substring(expectedRoot.length);
  
  // Parse root from user answer
  const answerRootMatch = normalizedAnswer.match(/^([a-g][#b]?)/);
  if (!answerRootMatch) return false;
  
  const answerRoot = answerRootMatch[1];
  const answerChordSymbol = normalizedAnswer.substring(answerRoot.length);
  
  // Check if roots match (considering enharmonics)
  if (!areEnharmonicEquivalent(answerRoot.charAt(0).toUpperCase() + answerRoot.slice(1), 
                                expectedRoot.charAt(0).toUpperCase() + expectedRoot.slice(1))) {
    return false;
  }
  
  // Find the chord type based on expected answer
  let expectedChordType = null;
  for (const [key, chord] of Object.entries(ninthChordTypes)) {
    if (normalizeChordNotation(chord.symbol) === expectedChordSymbol) {
      expectedChordType = chord;
      break;
    }
  }
  
  if (!expectedChordType) return false;
  
  // Check if the answer matches any accepted notation for this chord type
  return expectedChordType.acceptedNotations.some(notation => 
    normalizeChordNotation(notation) === answerChordSymbol
  );
};

/**
 * Check if two notes are enharmonic equivalents
 */
function areEnharmonicEquivalent(note1, note2) {
  const enharmonics = {
    'C#': ['Db', 'C#'],
    'Db': ['C#', 'Db'],
    'D#': ['Eb', 'D#'],
    'Eb': ['D#', 'Eb'],
    'F#': ['Gb', 'F#'],
    'Gb': ['F#', 'Gb'],
    'G#': ['Ab', 'G#'],
    'Ab': ['G#', 'Ab'],
    'A#': ['Bb', 'A#'],
    'Bb': ['A#', 'Bb']
  };
  
  const n1 = note1.charAt(0).toUpperCase() + note1.slice(1).toLowerCase();
  const n2 = note2.charAt(0).toUpperCase() + note2.slice(1).toLowerCase();
  
  if (n1 === n2) return true;
  
  if (enharmonics[n1]) {
    return enharmonics[n1].includes(n2);
  }
  
  return false;
}

/**
 * Get the enharmonic equivalent of a note
 */
function getEnharmonicEquivalent(note) {
  const enharmonics = {
    'C#': 'Db',
    'Db': 'C#',
    'D#': 'Eb', 
    'Eb': 'D#',
    'F#': 'Gb',
    'Gb': 'F#',
    'G#': 'Ab',
    'Ab': 'G#',
    'A#': 'Bb',
    'Bb': 'A#'
  };
  
  return enharmonics[note] || note;
}

/**
 * Generate enharmonic equivalent chord name
 */
export const getEnharmonicChordEquivalent = (chordName) => {
  // Extract root note and chord symbol
  const match = chordName.match(/^([A-G][#b]?)(.*)$/);
  if (!match) return null;
  
  const [, root, symbol] = match;
  const enharmonicRoot = getEnharmonicEquivalent(root);
  
  // If the root has an enharmonic equivalent, return the alternate chord
  if (enharmonicRoot !== root) {
    return enharmonicRoot + symbol;
  }
  
  return null;
};

/**
 * Get both versions of a chord name for feedback
 */
export const getChordNameWithEnharmonic = (chordName) => {
  const enharmonic = getEnharmonicChordEquivalent(chordName);
  if (enharmonic) {
    return `${chordName} or ${enharmonic}`;
  }
  return chordName;
};

/**
 * Generate an 11th chord with specified configuration
 * @param {Object} config - Level configuration
 * @returns {Object} Generated chord object
 */
export const generateEleventhChord = (config) => {
  const { roots, chordTypes, inversions, requireInversionLabeling, octaveRange } = config;
  
  // Select random root
  const rootNumber = roots[Math.floor(Math.random() * roots.length)];
  const noteNameArray = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const root = noteNameArray[rootNumber];
  
  // Select random chord type
  const chordType = chordTypes[Math.floor(Math.random() * chordTypes.length)];
  const chordData = eleventhChordTypes[chordType];
  
  // Select random inversion (typically root for 11th chords)
  const inversionKey = inversions[Math.floor(Math.random() * inversions.length)];
  const inversionData = eleventhInversionTypes[inversionKey];
  
  // Get intervals for the chord and adjust inversion order based on chord length
  const intervals = chordData.intervals;
  const intervalOrder = inversionData.intervalOrder.slice(0, intervals.length);
  const reorderedIntervals = intervalOrder.map(index => intervals[index]);
  
  // Calculate optimal octave based on range
  const minOctave = octaveRange[0];
  const maxOctave = octaveRange[1];
  let baseOctave = minOctave;
  
  // For inversions, ensure ascending order by moving notes to next octave if needed
  const rootMidi = 12 + (baseOctave * 12) + rootNumber; // C1 = 12
  let currentNotes = [];
  
  for (let i = 0; i < reorderedIntervals.length; i++) {
    let noteMidi = rootMidi + reorderedIntervals[i];
    
    // Ensure ascending order - if this note would be lower than the previous, move it up an octave
    if (i > 0 && noteMidi <= currentNotes[i - 1]) {
      noteMidi += 12;
    }
    
    currentNotes.push(noteMidi);
  }
  
  // Check if the highest note exceeds our range, if so shift down
  const maxAllowedNote = 12 + (maxOctave * 12) + 11; // Highest note in max octave
  const highestNote = Math.max(...currentNotes);
  
  if (highestNote > maxAllowedNote) {
    const shift = Math.ceil((highestNote - maxAllowedNote) / 12) * 12;
    currentNotes = currentNotes.map(note => note - shift);
  }
  
  // Create expected answer using slash chord notation for inversions
  let expectedAnswer = root + chordData.symbol;
  if (requireInversionLabeling && inversionKey !== 'root') {
    // Get the bass note (lowest note) for slash chord notation
    const bassNoteIndex = intervalOrder[0]; // First note in the inversion
    const bassInterval = intervals[bassNoteIndex];
    const bassNoteMidi = rootNumber + bassInterval;
    const bassNote = noteNameArray[bassNoteMidi % 12];
    expectedAnswer = `${root}${chordData.symbol}/${bassNote}`;
  }
  
  return {
    notes: currentNotes,
    name: `${root} ${chordData.name}${inversionKey !== 'root' ? ` (${inversionData.name})` : ''}`,
    expectedAnswer,
    chordType: chordType,
    root: root,
    inversion: inversionKey
  };
};

/**
 * Validate an 11th chord answer
 * @param {string} answer - User's answer
 * @param {string} expectedAnswer - Expected correct answer
 * @param {Object} config - Level configuration
 * @returns {boolean} True if answer is correct
 */
export const validateEleventhChordAnswer = (answer, expectedAnswer, config) => {
  if (!answer || !expectedAnswer) return false;
  
  // Normalize both answers
  const normalizedAnswer = normalizeChordNotation(answer.trim());
  const normalizedExpected = normalizeChordNotation(expectedAnswer.trim());
  
  // Direct match after normalization
  if (normalizedAnswer === normalizedExpected) {
    return true;
  }
  
  // Parse root and chord type from expected answer
  const rootMatch = normalizedExpected.match(/^([a-g][#b]?)/);
  if (!rootMatch) return false;
  
  const expectedRoot = rootMatch[1];
  const expectedChordSymbol = normalizedExpected.substring(expectedRoot.length);
  
  // Parse root from user answer
  const answerRootMatch = normalizedAnswer.match(/^([a-g][#b]?)/);
  if (!answerRootMatch) return false;
  
  const answerRoot = answerRootMatch[1];
  const answerChordSymbol = normalizedAnswer.substring(answerRoot.length);
  
  // Check if roots match (considering enharmonics)
  if (!areEnharmonicEquivalent(answerRoot.charAt(0).toUpperCase() + answerRoot.slice(1), 
                                expectedRoot.charAt(0).toUpperCase() + expectedRoot.slice(1))) {
    return false;
  }
  
  // Find the chord type based on expected answer
  let expectedChordType = null;
  for (const [key, chord] of Object.entries(eleventhChordTypes)) {
    if (normalizeChordNotation(chord.symbol) === expectedChordSymbol) {
      expectedChordType = chord;
      break;
    }
  }
  
  if (!expectedChordType) return false;
  
  // Check if the answer matches any accepted notation for this chord type
  return expectedChordType.acceptedNotations.some(notation => 
    normalizeChordNotation(notation) === answerChordSymbol
  );
};

/**
 * Generate a 13th chord with specified configuration
 * @param {Object} config - Level configuration
 * @returns {Object} Generated chord object
 */
export const generateThirteenthChord = (config) => {
  const { roots, chordTypes, inversions, requireInversionLabeling, octaveRange } = config;
  
  // Select random root
  const rootNumber = roots[Math.floor(Math.random() * roots.length)];
  const noteNameArray = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const root = noteNameArray[rootNumber];
  
  // Select random chord type
  const chordType = chordTypes[Math.floor(Math.random() * chordTypes.length)];
  const chordData = thirteenthChordTypes[chordType];
  
  // Select random inversion (typically root for 13th chords)
  const inversionKey = inversions[Math.floor(Math.random() * inversions.length)];
  const inversionData = thirteenthInversionTypes[inversionKey];
  
  // Get intervals for the chord and adjust inversion order based on chord length
  const intervals = chordData.intervals;
  const intervalOrder = inversionData.intervalOrder.slice(0, intervals.length);
  const reorderedIntervals = intervalOrder.map(index => intervals[index]);
  
  // Calculate optimal octave based on range
  const minOctave = octaveRange[0];
  const maxOctave = octaveRange[1];
  let baseOctave = minOctave;
  
  // For inversions, ensure ascending order by moving notes to next octave if needed
  const rootMidi = 12 + (baseOctave * 12) + rootNumber; // C1 = 12
  let currentNotes = [];
  
  for (let i = 0; i < reorderedIntervals.length; i++) {
    let noteMidi = rootMidi + reorderedIntervals[i];
    
    // Ensure ascending order - if this note would be lower than the previous, move it up an octave
    if (i > 0 && noteMidi <= currentNotes[i - 1]) {
      noteMidi += 12;
    }
    
    currentNotes.push(noteMidi);
  }
  
  // Check if the highest note exceeds our range, if so shift down
  const maxAllowedNote = 12 + (maxOctave * 12) + 11; // Highest note in max octave
  const highestNote = Math.max(...currentNotes);
  
  if (highestNote > maxAllowedNote) {
    const shift = Math.ceil((highestNote - maxAllowedNote) / 12) * 12;
    currentNotes = currentNotes.map(note => note - shift);
  }
  
  // Create expected answer using slash chord notation for inversions
  let expectedAnswer = root + chordData.symbol;
  if (requireInversionLabeling && inversionKey !== 'root') {
    // Get the bass note (lowest note) for slash chord notation
    const bassNoteIndex = intervalOrder[0]; // First note in the inversion
    const bassInterval = intervals[bassNoteIndex];
    const bassNoteMidi = rootNumber + bassInterval;
    const bassNote = noteNameArray[bassNoteMidi % 12];
    expectedAnswer = `${root}${chordData.symbol}/${bassNote}`;
  }
  
  return {
    notes: currentNotes,
    name: `${root} ${chordData.name}${inversionKey !== 'root' ? ` (${inversionData.name})` : ''}`,
    expectedAnswer,
    chordType: chordType,
    root: root,
    inversion: inversionKey
  };
};

/**
 * Validate a 13th chord answer
 * @param {string} answer - User's answer
 * @param {string} expectedAnswer - Expected correct answer
 * @param {Object} config - Level configuration
 * @returns {boolean} True if answer is correct
 */
export const validateThirteenthChordAnswer = (answer, expectedAnswer, config) => {
  if (!answer || !expectedAnswer) return false;
  
  // Normalize both answers
  const normalizedAnswer = normalizeChordNotation(answer.trim());
  const normalizedExpected = normalizeChordNotation(expectedAnswer.trim());
  
  // Direct match after normalization
  if (normalizedAnswer === normalizedExpected) {
    return true;
  }
  
  // Parse root and chord type from expected answer
  const rootMatch = normalizedExpected.match(/^([a-g][#b]?)/);
  if (!rootMatch) return false;
  
  const expectedRoot = rootMatch[1];
  const expectedChordSymbol = normalizedExpected.substring(expectedRoot.length);
  
  // Parse root from user answer
  const answerRootMatch = normalizedAnswer.match(/^([a-g][#b]?)/);
  if (!answerRootMatch) return false;
  
  const answerRoot = answerRootMatch[1];
  const answerChordSymbol = normalizedAnswer.substring(answerRoot.length);
  
  // Check if roots match (considering enharmonics)
  if (!areEnharmonicEquivalent(answerRoot.charAt(0).toUpperCase() + answerRoot.slice(1), 
                                expectedRoot.charAt(0).toUpperCase() + expectedRoot.slice(1))) {
    return false;
  }
  
  // Find the chord type based on expected answer
  let expectedChordType = null;
  for (const [key, chord] of Object.entries(thirteenthChordTypes)) {
    if (normalizeChordNotation(chord.symbol) === expectedChordSymbol) {
      expectedChordType = chord;
      break;
    }
  }
  
  if (!expectedChordType) return false;
  
  // Check if the answer matches any accepted notation for this chord type
  return expectedChordType.acceptedNotations.some(notation => 
    normalizeChordNotation(notation) === answerChordSymbol
  );
};

/**
 * Get configuration for a specific level
 */
export const getLevelConfig = (levelId) => {
  return jazzLevelConfigs[levelId];
};