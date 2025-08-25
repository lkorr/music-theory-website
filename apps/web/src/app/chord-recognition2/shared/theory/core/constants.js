/**
 * Global configuration constants for the chord recognition system
 * Single source of truth for all configuration values
 */

// Global configuration for inversion requirements
// Set to false to disable inversion labeling requirements across all levels
export const REQUIRE_INVERSION_LABELING = false;

// Inversion types and their properties
export const inversionTypes = {
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
export const chordTypes = {
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
export const seventhChordTypes = {
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
export const extendedChordTypes = {
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
export const allChordTypes = {
  ...chordTypes,
  ...seventhChordTypes,
  ...extendedChordTypes
};

// Level difficulty settings
export const difficultySettings = {
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
export const defaultLevelConfig = {
  totalProblems: 30,
  passAccuracy: 90, // percentage
  passTime: 5, // seconds average
  autoAdvance: {
    correctDelay: 500, // milliseconds
    incorrectDelay: 4000 // milliseconds
  }
};