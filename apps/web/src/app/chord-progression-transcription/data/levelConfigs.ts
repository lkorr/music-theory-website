/**
 * Level Configurations for Chord Progression Transcription
 * 
 * Defines progression patterns, keys, and settings for each level
 */

// Type definitions
interface AudioConfig {
  tempo: number;
  chordDuration: number;
  pauseBetweenChords: number;
  instrument: string;
  baseOctave: number;
  volume: number;
}

interface ScoringConfig {
  perfectScore: number;
  timePenalty: number;
  wrongNotePenalty: number;
  hintPenalty: number;
}

interface AvailableKeys {
  major: string[];
  minor?: string[];
}

interface LevelConfig {
  title: string;
  description: string;
  audio: AudioConfig;
  progressions: string[][];
  availableKeys: AvailableKeys;
  maxAttempts: number;
  showHints: boolean;
  scoring: ScoringConfig;
  theme: string;
  showProgressBar: boolean;
}

interface LevelConfigs {
  [key: string]: LevelConfig;
}

interface ProgressionPatterns {
  [key: string]: string[][];
}

interface KeysConfig {
  major: string[];
  minor: string[];
}

// Common 4-chord progressions in Roman numeral notation
const PROGRESSION_PATTERNS: ProgressionPatterns = {
  // Level 1: Basic progressions
  level1: [
    ['I', 'V', 'vi', 'IV'],    // Pop progression (C-G-Am-F)
    ['I', 'vi', 'IV', 'V'],    // 50s progression (C-Am-F-G)  
    ['vi', 'IV', 'I', 'V'],    // vi-IV-I-V (Am-F-C-G)
    ['I', 'IV', 'vi', 'V'],    // I-IV-vi-V (C-F-Am-G)
    ['vi', 'V', 'IV', 'I'],    // Minor start (Am-G-F-C)
  ],

  // Level 2: With inversions  
  level2: [
    ['I', 'V/3', 'vi', 'IV'],     // V in first inversion
    ['I', 'vi/3', 'IV', 'V'],     // vi in first inversion  
    ['I/3', 'V', 'vi', 'IV/3'],   // I and IV in first inversion
    ['vi', 'IV/3', 'I/5', 'V'],   // Multiple inversions
  ],

  // Level 3: Non-diatonic
  level3: [
    ['I', 'bVII', 'IV', 'I'],     // Borrowed bVII
    ['I', 'V/vi', 'vi', 'IV'],    // Secondary dominant
    ['vi', 'bVI', 'IV', 'I'],     // Borrowed bVI
    ['I', 'bIII', 'bVI', 'bVII'], // Multiple borrowed chords
  ],

  // Level 4: Complex progressions (4-chord patterns only)
  level4: [
    ['I', 'V/vi', 'vi', 'bVI'],     // Secondary dominant with borrowed chord
    ['I', 'iii7', 'vi', 'ii7'],     // With 7th chords
    ['vi', 'IV/3', 'I/5', 'V7'],    // Complex voice leading with 7th
    ['I7', 'V/V', 'V7', 'I'],       // 7th chords with secondary dominant
  ]
};

// Major and minor keys to use
const KEYS: KeysConfig = {
  major: ['C', 'G', 'F', 'D', 'Bb', 'A', 'E', 'Ab'],
  minor: ['Am', 'Em', 'Bm', 'Dm', 'Gm', 'Fm', 'Cm', 'F#m']
};

// Base level configuration
const createLevelConfig = (levelId: string, options: Partial<LevelConfig> = {}): LevelConfig => {
  const defaults: LevelConfig = {
    title: `Level ${levelId}`,
    description: 'Progression transcription training',
    
    // Audio settings
    audio: {
      tempo: 80,                    // BPM for progression playback
      chordDuration: 1200,          // Duration each chord plays (ms)
      pauseBetweenChords: 100,      // Pause between chords (ms)
      instrument: 'piano',
      baseOctave: 60,               // C4 as base
      volume: 0.3
    },
    
    // Progression settings
    progressions: PROGRESSION_PATTERNS[levelId] || PROGRESSION_PATTERNS.level1,
    availableKeys: {
      major: KEYS.major.slice(0, 4),  // Start with easier keys
      minor: KEYS.minor.slice(0, 2)   // Start with Am and Em
    },
    
    // Game settings
    maxAttempts: 3,
    showHints: true,
    
    // Scoring
    scoring: {
      perfectScore: 100,
      timePenalty: 1,               // Points lost per second
      wrongNotePenalty: 10,         // Points lost per wrong note
      hintPenalty: 15,              // Points lost for using hints
    },
    
    // UI settings
    theme: 'teal',
    showProgressBar: true,
  };
  
  // Deep merge options with defaults
  const merged: LevelConfig = {
    ...defaults,
    ...options,
    audio: {
      ...defaults.audio,
      ...options.audio
    },
    availableKeys: {
      ...defaults.availableKeys,
      ...options.availableKeys
    },
    scoring: {
      ...defaults.scoring,
      ...options.scoring
    }
  };
  
  return merged;
};

// Level-specific configurations
export const levelConfigs: LevelConfigs = {
  level1: createLevelConfig('level1', {
    title: 'Basic 4-Chord Progressions',
    description: 'Learn to transcribe common progressions like I-V-vi-IV',
    audio: {
      tempo: 70,                    // Slower tempo for beginners
      chordDuration: 1500,          // Longer chord duration
      baseOctave: 60,
      pauseBetweenChords: 100,
      instrument: 'piano',
      volume: 0.3
    },
    availableKeys: {
      major: ['C', 'G', 'F']        // Start with easiest keys
      // Note: Only major keys for now since progressions use major key Roman numerals
    },
    theme: 'emerald'
  }),

  level2: createLevelConfig('level2', {
    title: 'Progressions with Inversions',
    description: 'Transcribe progressions including first and second inversions',
    audio: {
      tempo: 75,
      chordDuration: 1400,
      baseOctave: 60,
      pauseBetweenChords: 100,
      instrument: 'piano',
      volume: 0.3
    },
    availableKeys: {
      major: ['C', 'G', 'F', 'D']
      // Note: Only major keys for now since progressions use major key Roman numerals  
    },
    theme: 'teal'
  }),

  level3: createLevelConfig('level3', {
    title: 'Non-Diatonic Progressions',
    description: 'Advanced progressions with borrowed chords',
    audio: {
      tempo: 80,
      chordDuration: 1300,
      baseOctave: 60,
      pauseBetweenChords: 100,
      instrument: 'piano',
      volume: 0.3
    },
    availableKeys: {
      major: KEYS.major.slice(0, 6)
      // Note: Only major keys for now since progressions use major key Roman numerals
    },
    theme: 'cyan',
    showHints: true,                // More hints for complex progressions
  }),

  level4: createLevelConfig('level4', {
    title: 'Complex Harmonic Progressions',
    description: 'Master advanced progressions with multiple techniques',
    audio: {
      tempo: 85,
      chordDuration: 1200,
      baseOctave: 60,
      pauseBetweenChords: 100,
      instrument: 'piano',
      volume: 0.3
    },
    availableKeys: {
      major: KEYS.major
      // Note: Only major keys for now since progressions use major key Roman numerals
    },
    theme: 'purple',
    maxAttempts: 5,                 // More attempts for complex material
    scoring: {
      perfectScore: 150,            // Higher possible score
      timePenalty: 2,
      wrongNotePenalty: 15,
      hintPenalty: 20,
    }
  })
};

/**
 * Get level configuration by level ID
 */
export function getLevelConfig(levelId: string): LevelConfig {
  const config = levelConfigs[levelId];
  if (!config) {
    throw new Error(`Unknown level: ${levelId}`);
  }
  return config;
}

/**
 * Get level configuration by route parameters
 */
export function getLevelConfigByParams(level: string): LevelConfig {
  // Handle both 'level1' and '1' format
  const levelKey = level.startsWith('level') ? level : `level${level}`;
  return getLevelConfig(levelKey);
}