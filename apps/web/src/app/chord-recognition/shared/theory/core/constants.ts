/**
 * Global configuration constants for the chord recognition system
 * Single source of truth for all configuration values
 */

// Global configuration for inversion requirements
// Set to false to disable inversion labeling requirements across all levels
export const REQUIRE_INVERSION_LABELING = false;

// Type definitions
export interface InversionType {
  name: string;
  intervalOrder: readonly number[];
  notation: string;
  numberNotation: string;
}

export interface ChordData {
  name: string;
  intervals: readonly number[];
  symbol: string;
  abbreviations: readonly string[];
}

export interface DifficultySettings {
  roots: readonly string[];
  chordTypes: readonly string[];
  inversions: readonly string[];
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

// Inversion types and their properties
export const inversionTypes: Record<string, InversionType> = {
  root: { 
    name: 'Root Position', 
    intervalOrder: [0, 1, 2, 3] as const,
    notation: '',
    numberNotation: '0'
  },
  first: { 
    name: '1st Inversion', 
    intervalOrder: [1, 2, 3, 0] as const,
    notation: '/1',
    numberNotation: '1'
  },
  second: { 
    name: '2nd Inversion', 
    intervalOrder: [2, 3, 0, 1] as const,
    notation: '/2',
    numberNotation: '2'
  },
  third: { 
    name: '3rd Inversion', 
    intervalOrder: [3, 0, 1, 2] as const,
    notation: '/3',
    numberNotation: '3'
  }
};

// Basic triad chord types (for basic-triads levels)
export const chordTypes: Record<string, ChordData> = {
  major: { 
    name: 'Major', 
    intervals: [0, 4, 7] as const, 
    symbol: '',
    abbreviations: ['', 'maj', 'M'] as const
  },
  minor: { 
    name: 'Minor', 
    intervals: [0, 3, 7] as const, 
    symbol: 'm',
    abbreviations: ['m', 'min', '-'] as const
  },
  diminished: { 
    name: 'Diminished', 
    intervals: [0, 3, 6] as const, 
    symbol: 'dim',
    abbreviations: ['dim', '°', 'o'] as const
  },
  augmented: { 
    name: 'Augmented', 
    intervals: [0, 4, 8] as const, 
    symbol: 'aug',
    abbreviations: ['aug', '+', '#5'] as const
  }
};

// Seventh chord types
export const seventhChordTypes: Record<string, ChordData> = {
  major7: { 
    name: 'Major 7th', 
    intervals: [0, 4, 7, 11] as const, 
    symbol: 'maj7',
    abbreviations: ['maj7', 'M7', 'Δ7'] as const
  },
  minor7: { 
    name: 'Minor 7th', 
    intervals: [0, 3, 7, 10] as const, 
    symbol: 'm7',
    abbreviations: ['m7', 'min7', '-7'] as const
  },
  dominant7: { 
    name: 'Dominant 7th', 
    intervals: [0, 4, 7, 10] as const, 
    symbol: '7',
    abbreviations: ['7', 'dom7'] as const
  },
  diminished7: { 
    name: 'Diminished 7th', 
    intervals: [0, 3, 6, 9] as const, 
    symbol: 'dim7',
    abbreviations: ['dim7', '°7', 'o7'] as const
  },
  halfDiminished7: { 
    name: 'Half Diminished 7th', 
    intervals: [0, 3, 6, 10] as const, 
    symbol: 'm7b5',
    abbreviations: ['m7b5', 'ø7', 'min7b5'] as const
  },
  minor7b5: { 
    name: 'Minor 7th b5', 
    intervals: [0, 3, 6, 10] as const, 
    symbol: 'm7b5',
    abbreviations: ['m7b5', 'ø7', 'min7b5'] as const
  } // Alias for halfDiminished7
};

// Extended chord types (9th, 11th, 13th)
export const extendedChordTypes: Record<string, ChordData> = {
  // 9th chords
  maj9: { 
    name: 'Major 9th', 
    intervals: [0, 4, 7, 11, 14] as const, 
    symbol: 'maj9',
    abbreviations: ['maj9', 'M9', 'Δ9'] as const
  },
  min9: { 
    name: 'Minor 9th', 
    intervals: [0, 3, 7, 10, 14] as const, 
    symbol: 'm9',
    abbreviations: ['m9', 'min9', '-9'] as const
  },
  dom9: { 
    name: 'Dominant 9th', 
    intervals: [0, 4, 7, 10, 14] as const, 
    symbol: '9',
    abbreviations: ['9', 'dom9'] as const
  },
  // 11th chords
  maj11: { 
    name: 'Major 11th', 
    intervals: [0, 4, 7, 11, 14, 17] as const, 
    symbol: 'maj11',
    abbreviations: ['maj11', 'M11', 'Δ11'] as const
  },
  min11: { 
    name: 'Minor 11th', 
    intervals: [0, 3, 7, 10, 14, 17] as const, 
    symbol: 'm11',
    abbreviations: ['m11', 'min11', '-11'] as const
  },
  dom11: { 
    name: 'Dominant 11th', 
    intervals: [0, 4, 7, 10, 14, 17] as const, 
    symbol: '11',
    abbreviations: ['11', 'dom11'] as const
  },
  // 13th chords
  maj13: { 
    name: 'Major 13th', 
    intervals: [0, 4, 7, 11, 14, 21] as const, 
    symbol: 'maj13',
    abbreviations: ['maj13', 'M13', 'Δ13'] as const
  },
  min13: { 
    name: 'Minor 13th', 
    intervals: [0, 3, 7, 10, 14, 21] as const, 
    symbol: 'm13',
    abbreviations: ['m13', 'min13', '-13'] as const
  },
  dom13: { 
    name: 'Dominant 13th', 
    intervals: [0, 4, 7, 10, 14, 21] as const, 
    symbol: '13',
    abbreviations: ['13', 'dom13'] as const
  },
  // Sus chords and quartal harmony
  sus2: { 
    name: 'Suspended 2nd', 
    intervals: [0, 2, 7] as const, 
    symbol: 'sus2',
    abbreviations: ['sus2', 'sus(add2)'] as const
  },
  sus4: { 
    name: 'Suspended 4th', 
    intervals: [0, 5, 7] as const, 
    symbol: 'sus4',
    abbreviations: ['sus4', 'sus'] as const
  },
  quartal: { 
    name: 'Quartal', 
    intervals: [0, 5, 10] as const, 
    symbol: 'quartal',
    abbreviations: ['quartal', '4ths'] as const
  }
};

// Combined chord types object for convenience
export const allChordTypes: Record<string, ChordData> = {
  ...chordTypes,
  ...seventhChordTypes,
  ...extendedChordTypes
};

// Level difficulty settings
export const difficultySettings: Record<string, DifficultySettings> = {
  easy: {
    roots: ['C', 'F', 'G'] as const, // Natural notes only
    chordTypes: ['major', 'minor'] as const,
    inversions: ['root'] as const
  },
  medium: {
    roots: ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const, // All natural notes
    chordTypes: ['major', 'minor', 'diminished'] as const,
    inversions: ['root', 'first'] as const
  },
  hard: {
    roots: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const, // All notes
    chordTypes: ['major', 'minor', 'diminished', 'augmented'] as const,
    inversions: ['root', 'first', 'second'] as const
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