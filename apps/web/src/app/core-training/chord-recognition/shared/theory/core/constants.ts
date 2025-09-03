/**
 * Global configuration constants for the chord recognition system
 * Single source of truth for all configuration values
 */

// Type definitions for chord system
export interface InversionType {
  name: string;
  intervalOrder: number[];
  notation: string;
  numberNotation: string;
}

export interface ChordType {
  name: string;
  intervals: number[];
  symbol: string;
  abbreviations: string[];
}

export interface DifficultySettings {
  roots: string[];
  chordTypes: string[];
  inversions: string[];
}

export interface LevelConfig {
  totalProblems: number;
  passAccuracy: number;
  passTime: number;
  autoAdvance: {
    correctDelay: number;
    incorrectDelay: number;
  };
}

// Global configuration for inversion requirements
// Set to false to disable inversion labeling requirements across all levels
export const REQUIRE_INVERSION_LABELING = false;

// Inversion types and their properties
export const inversionTypes: Record<string, InversionType> = {
  root: { 
    name: 'Root Position', 
    intervalOrder: [0, 1, 2, 3],
    notation: '',
    numberNotation: '0'
  },
  first: { 
    name: '1st Inversion', 
    intervalOrder: [1, 2, 3, 0],
    notation: '/1',
    numberNotation: '1'
  },
  second: { 
    name: '2nd Inversion', 
    intervalOrder: [2, 3, 0, 1],
    notation: '/2',
    numberNotation: '2'
  },
  third: { 
    name: '3rd Inversion', 
    intervalOrder: [3, 0, 1, 2],
    notation: '/3',
    numberNotation: '3'
  }
};

// Basic triad chord types (for basic-triads levels)
export const chordTypes: Record<string, ChordType> = {
  major: { 
    name: 'Major', 
    intervals: [0, 4, 7], 
    symbol: '',
    abbreviations: ['', 'maj', 'M']
  },
  minor: { 
    name: 'Minor', 
    intervals: [0, 3, 7], 
    symbol: 'm',
    abbreviations: ['m', 'min', '-']
  },
  diminished: { 
    name: 'Diminished', 
    intervals: [0, 3, 6], 
    symbol: 'dim',
    abbreviations: ['dim', '°', 'o']
  },
  augmented: { 
    name: 'Augmented', 
    intervals: [0, 4, 8], 
    symbol: 'aug',
    abbreviations: ['aug', '+', '#5']
  }
};

// Seventh chord types
export const seventhChordTypes: Record<string, ChordType> = {
  major7: { 
    name: 'Major 7th', 
    intervals: [0, 4, 7, 11], 
    symbol: 'maj7',
    abbreviations: ['maj7', 'M7', 'Δ7']
  },
  minor7: { 
    name: 'Minor 7th', 
    intervals: [0, 3, 7, 10], 
    symbol: 'm7',
    abbreviations: ['m7', 'min7', '-7']
  },
  dominant7: { 
    name: 'Dominant 7th', 
    intervals: [0, 4, 7, 10], 
    symbol: '7',
    abbreviations: ['7', 'dom7']
  },
  diminished7: { 
    name: 'Diminished 7th', 
    intervals: [0, 3, 6, 9], 
    symbol: 'dim7',
    abbreviations: ['dim7', '°7', 'o7']
  },
  halfDiminished7: { 
    name: 'Half Diminished 7th', 
    intervals: [0, 3, 6, 10], 
    symbol: 'm7b5',
    abbreviations: ['m7b5', 'ø7', 'min7b5']
  },
  minor7b5: { 
    name: 'Minor 7th b5', 
    intervals: [0, 3, 6, 10], 
    symbol: 'm7b5',
    abbreviations: ['m7b5', 'ø7', 'min7b5']
  } // Alias for halfDiminished7
};

// Extended chord types (9th, 11th, 13th)
export const extendedChordTypes: Record<string, ChordType> = {
  // 9th chords
  maj9: { 
    name: 'Major 9th', 
    intervals: [0, 4, 7, 11, 14], 
    symbol: 'maj9',
    abbreviations: ['maj9', 'M9', 'Δ9']
  },
  min9: { 
    name: 'Minor 9th', 
    intervals: [0, 3, 7, 10, 14], 
    symbol: 'm9',
    abbreviations: ['m9', 'min9', '-9']
  },
  dom9: { 
    name: 'Dominant 9th', 
    intervals: [0, 4, 7, 10, 14], 
    symbol: '9',
    abbreviations: ['9', 'dom9']
  },
  dom7b9: { 
    name: 'Dominant 7♭9', 
    intervals: [0, 4, 7, 10, 13], 
    symbol: '7♭9',
    abbreviations: ['7b9', '7♭9', 'dom7b9']
  },
  dom7sharp9: { 
    name: 'Dominant 7♯9', 
    intervals: [0, 4, 7, 10, 15], 
    symbol: '7♯9',
    abbreviations: ['7#9', '7♯9', 'dom7#9', '7sharp9']
  },
  min7b9: { 
    name: 'Minor 7♭9', 
    intervals: [0, 3, 7, 10, 13], 
    symbol: 'm7♭9',
    abbreviations: ['m7b9', 'm7♭9', 'min7b9']
  },
  add9: { 
    name: 'Add 9', 
    intervals: [0, 4, 7, 14], 
    symbol: 'add9',
    abbreviations: ['add9', '(add9)']
  },
  madd9: { 
    name: 'Minor Add 9', 
    intervals: [0, 3, 7, 14], 
    symbol: 'madd9',
    abbreviations: ['madd9', 'm(add9)']
  },
  dim7add9: { 
    name: 'Diminished 7 Add 9', 
    intervals: [0, 3, 6, 9, 14], 
    symbol: 'dim7add9',
    abbreviations: ['dim7add9', '°7add9']
  },
  dim7b9: { 
    name: 'Diminished 7♭9', 
    intervals: [0, 3, 6, 9, 13], 
    symbol: 'dim7♭9',
    abbreviations: ['dim7b9', '°7♭9', '°7b9', 'dimb9']
  },
  halfDim9: { 
    name: 'Half Diminished 9', 
    intervals: [0, 3, 6, 10, 14], 
    symbol: 'ø9',
    abbreviations: ['ø9', 'm7♭5add9', 'm7b5add9', 'halfDim9', 'm7-5add9', 'min7b5add9']
  },
  halfDimb9: { 
    name: 'Half Diminished ♭9', 
    intervals: [0, 3, 6, 10, 13], 
    symbol: 'ø7♭9',
    abbreviations: ['ø7b9', 'ø7♭9', 'halfDimb9', 'm7b5b9', 'm7♭5♭9', 'm7-5-9']
  },
  // 11th chords
  maj11: { 
    name: 'Major 11th', 
    intervals: [0, 4, 7, 11, 14, 17], 
    symbol: 'maj11',
    abbreviations: ['maj11', 'M11', 'Δ11']
  },
  min11: { 
    name: 'Minor 11th', 
    intervals: [0, 3, 7, 10, 14, 17], 
    symbol: 'm11',
    abbreviations: ['m11', 'min11', '-11']
  },
  dom11: { 
    name: 'Dominant 11th', 
    intervals: [0, 4, 7, 10, 14, 17], 
    symbol: '11',
    abbreviations: ['11', 'dom11']
  },
  maj7sharp11: { 
    name: 'Major 7♯11', 
    intervals: [0, 4, 7, 11, 18], 
    symbol: 'maj7♯11',
    abbreviations: ['maj7#11', 'maj7♯11', 'M7#11', 'maj7sharp11']
  },
  dom7sharp11: { 
    name: 'Dominant 7♯11', 
    intervals: [0, 4, 7, 10, 18], 
    symbol: '7♯11',
    abbreviations: ['7#11', '7♯11', 'dom7#11', '7sharp11']
  },
  min7sharp11: { 
    name: 'Minor 7♯11', 
    intervals: [0, 3, 7, 10, 18], 
    symbol: 'm7♯11',
    abbreviations: ['m7#11', 'm7♯11', 'min7#11', 'm7sharp11']
  },
  add11: { 
    name: 'Add 11', 
    intervals: [0, 4, 7, 17], 
    symbol: 'add11',
    abbreviations: ['add11', '(add11)']
  },
  madd11: { 
    name: 'Minor Add 11', 
    intervals: [0, 3, 7, 17], 
    symbol: 'madd11',
    abbreviations: ['madd11', 'm(add11)']
  },
  sus11: { 
    name: 'Suspended 11', 
    intervals: [0, 7, 17], 
    symbol: 'sus11',
    abbreviations: ['sus11', 'sus(11)']
  },
  dom11b9: { 
    name: 'Dominant 11♭9', 
    intervals: [0, 4, 7, 10, 13, 17], 
    symbol: '11♭9',
    abbreviations: ['11b9', '11♭9', 'dom11b9']
  },
  dom11sharp9: { 
    name: 'Dominant 11♯9', 
    intervals: [0, 4, 7, 10, 15, 17], 
    symbol: '11♯9',
    abbreviations: ['11#9', '11♯9', 'dom11#9', '11sharp9']
  },
  min11b9: { 
    name: 'Minor 11♭9', 
    intervals: [0, 3, 7, 10, 13, 17], 
    symbol: 'm11♭9',
    abbreviations: ['m11b9', 'm11♭9', 'min11b9']
  },
  // 13th chords
  maj13: { 
    name: 'Major 13th', 
    intervals: [0, 4, 7, 11, 14, 21], 
    symbol: 'maj13',
    abbreviations: ['maj13', 'M13', 'Δ13']
  },
  min13: { 
    name: 'Minor 13th', 
    intervals: [0, 3, 7, 10, 14, 21], 
    symbol: 'm13',
    abbreviations: ['m13', 'min13', '-13']
  },
  dom13: { 
    name: 'Dominant 13th', 
    intervals: [0, 4, 7, 10, 14, 21], 
    symbol: '13',
    abbreviations: ['13', 'dom13']
  },
  maj13sharp11: { 
    name: 'Major 13♯11', 
    intervals: [0, 4, 7, 11, 18, 21], 
    symbol: 'maj13♯11',
    abbreviations: ['maj13#11', 'maj13♯11', 'M13#11', 'maj13sharp11']
  },
  dom13sharp11: { 
    name: 'Dominant 13♯11', 
    intervals: [0, 4, 7, 10, 18, 21], 
    symbol: '13♯11',
    abbreviations: ['13#11', '13♯11', 'dom13#11', '13sharp11']
  },
  dom13b9: { 
    name: 'Dominant 13♭9', 
    intervals: [0, 4, 7, 10, 13, 21], 
    symbol: '13♭9',
    abbreviations: ['13b9', '13♭9', 'dom13b9', '13flatb9']
  },
  dom13sharp9: { 
    name: 'Dominant 13♯9', 
    intervals: [0, 4, 7, 10, 15, 21], 
    symbol: '13♯9',
    abbreviations: ['13#9', '13♯9', 'dom13#9', '13sharp9']
  },
  add13: { 
    name: 'Add 13', 
    intervals: [0, 4, 7, 21], 
    symbol: 'add13',
    abbreviations: ['add13', '(add13)']
  },
  madd13: { 
    name: 'Minor Add 13', 
    intervals: [0, 3, 7, 21], 
    symbol: 'madd13',
    abbreviations: ['madd13', 'm(add13)']
  },
  dom13sharp11b9: { 
    name: 'Dominant 13♯11♭9', 
    intervals: [0, 4, 7, 10, 13, 18, 21], 
    symbol: '13♯11♭9',
    abbreviations: ['13#11b9', '13♯11♭9', '13sharp11b9']
  },
  dom13sharp11sharp9: { 
    name: 'Dominant 13♯11♯9', 
    intervals: [0, 4, 7, 10, 15, 18, 21], 
    symbol: '13♯11♯9',
    abbreviations: ['13#11#9', '13♯11♯9', '13sharp11sharp9']
  },
  min13sharp11: { 
    name: 'Minor 13♯11', 
    intervals: [0, 3, 7, 10, 14, 18, 21], 
    symbol: 'm13♯11',
    abbreviations: ['m13#11', 'm13♯11', 'min13#11']
  },
  min13b9: { 
    name: 'Minor 13♭9', 
    intervals: [0, 3, 7, 10, 13, 21], 
    symbol: 'm13♭9',
    abbreviations: ['m13b9', 'm13♭9', 'min13b9']
  },
  // Sus chords and quartal harmony
  sus2: { 
    name: 'Suspended 2nd', 
    intervals: [0, 2, 7], 
    symbol: 'sus2',
    abbreviations: ['sus2', 'sus(add2)']
  },
  sus4: { 
    name: 'Suspended 4th', 
    intervals: [0, 5, 7], 
    symbol: 'sus4',
    abbreviations: ['sus4', 'sus']
  },
  quartal: { 
    name: 'Quartal', 
    intervals: [0, 5, 10], 
    symbol: 'quartal',
    abbreviations: ['quartal', '4ths']
  }
};

// Combined chord types object for convenience
export const allChordTypes: Record<string, ChordType> = {
  ...chordTypes,
  ...seventhChordTypes,
  ...extendedChordTypes
};

// Level difficulty settings
export const difficultySettings: Record<string, DifficultySettings> = {
  easy: {
    roots: ['C', 'F', 'G'], // Natural notes only
    chordTypes: ['major', 'minor'],
    inversions: ['root']
  },
  medium: {
    roots: ['C', 'D', 'E', 'F', 'G', 'A', 'B'], // All natural notes
    chordTypes: ['major', 'minor', 'diminished'],
    inversions: ['root', 'first']
  },
  hard: {
    roots: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'], // All notes
    chordTypes: ['major', 'minor', 'diminished', 'augmented'],
    inversions: ['root', 'first', 'second']
  }
};

// Default level configuration
export const defaultLevelConfig: LevelConfig = {
  totalProblems: 30,
  passAccuracy: 90, // percentage
  passTime: 5, // seconds average
  autoAdvance: {
    correctDelay: 500, // milliseconds
    incorrectDelay: 4000 // milliseconds
  }
};