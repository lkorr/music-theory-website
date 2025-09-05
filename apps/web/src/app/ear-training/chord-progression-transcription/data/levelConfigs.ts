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

// Comprehensive chord progressions from various musical styles
const PROGRESSION_PATTERNS: ProgressionPatterns = {
  // Level 1: Basic diatonic progressions
  level1: [
    ['I', 'V', 'vi', 'IV'],    // Pop progression (C-G-Am-F)
    ['I', 'vi', 'IV', 'V'],    // 50s progression (C-Am-F-G)  
    ['vi', 'IV', 'I', 'V'],    // vi-IV-I-V (Am-F-C-G)
    ['I', 'IV', 'vi', 'V'],    // I-IV-vi-V (C-F-Am-G)
    ['vi', 'V', 'IV', 'I'],    // Minor start (Am-G-F-C)
    ['I', 'IV', 'V', 'I'],     // Plagal cadence progression
    ['vi', 'ii', 'V', 'I'],    // Circle of fifths excerpt 
    ['I', 'vi', 'ii', 'V'],    // Classic sequence
    ['IV', 'V', 'vi', 'V'],    // Subdominant emphasis
    ['I', 'iii', 'vi', 'IV'],  // iii chord introduction
    ['vi', 'IV', 'V', 'V'],    // Extended dominant
    ['I', 'V', 'IV', 'V'],     // Alternating IV-V
    
    // Additional basic diatonic patterns
    ['I', 'ii', 'IV', 'V'],    // ii as predominant
    ['vi', 'iii', 'IV', 'V'],  // Minor to major third
    ['I', 'iii', 'IV', 'V'],   // Ascending thirds
    ['IV', 'I', 'V', 'vi'],    // Plagal start
    ['I', 'vi', 'iii', 'IV'],  // Descending fifths
    ['vi', 'ii', 'IV', 'V'],   // ii in middle position
  ],

  // Level 2: ii chord and 7th chords (intermediate harmony)
  level2: [
    ['ii', 'V', 'I', 'vi'],       // ii-V-I-vi (jazz influenced)
    ['I', 'ii', 'V', 'I'],        // I-ii-V-I (strong resolution)
    ['vi', 'ii', 'V', 'I'],       // vi-ii-V-I (circle of fifths)
    ['I', 'IV', 'ii', 'V'],       // I-IV-ii-V progression
    ['ii', 'V', 'vi', 'IV'],      // ii as predominant
    ['I7', 'IV7', 'V7', 'I'],     // 7th chord progression
    ['vi', 'ii7', 'V7', 'I'],     // Jazz-style ii7-V7
    ['I', 'vi7', 'ii7', 'V7'],    // Extended 7th progression
    ['iii', 'vi', 'ii', 'V'],     // Circle progression
    ['I', 'iii', 'ii', 'V'],      // Ascending bass line
    ['ii', 'IV', 'V', 'I'],       // ii as substitute
    ['I', 'V/3', 'vi', 'IV'],     // Some inversions for variety
    
    // Additional supertonic and 7th chord progressions
    ['ii7', 'V7', 'I7', 'vi7'],   // All 7th chords
    ['I', 'II7dom', 'V', 'I'],    // II7 as dominant (V of V prep)
    ['vi', 'ii', 'iii', 'IV'],    // Circle of fifths excerpt
    ['I7dom', 'IV7dom', 'V7', 'I'], // Blues-style 7ths
    ['ii', 'iii', 'vi', 'V'],     // Ascending by step
    ['Isus4', 'I', 'ii', 'V'],    // Suspension resolution
    ['I', 'ii7', 'iii7', 'vi'],   // Diatonic 7th sequence
    ['vi7', 'ii7', 'V7sus4', 'V7'], // Jazz suspension
  ],

  // Level 3: Non-diatonic (each progression MUST contain at least one non-diatonic chord)
  level3: [
    ['I', 'bVII', 'IV', 'I'],     // Borrowed bVII (B♭ in C major)
    ['I', 'V/vi', 'vi', 'IV'],    // Secondary dominant V/vi (D major → Am)
    ['vi', 'bVI', 'IV', 'I'],     // Borrowed bVI (A♭ major in C major)
    ['I', 'bIII', 'bVI', 'bVII'], // Multiple borrowed chords (E♭, A♭, B♭ in C major)
    ['bVI', 'bVII', 'I', 'V'],    // Borrowed chord start (A♭-B♭-C-G)
    ['I', 'bII', 'V', 'I'],       // Borrowed bII (Neapolitan sixth area)
    ['vi', 'V/V', 'V', 'I'],      // Secondary dominant V/V (A major → G major)
    ['I', 'bVI', 'bVII', 'I'],    // Classic borrowed progression
    
    // Expanded non-diatonic progressions
    ['I', '#iv°', 'V', 'I'],      // Diminished passing chord
    ['vi', 'biii', 'IV', 'I'],    // Borrowed biii (minor mediant)
    ['I+', 'vi', 'IV', 'V'],      // Augmented tonic
    ['I', 'V/ii', 'ii', 'V'],     // Secondary dominant to ii
    ['bVII', 'bVI', 'bVII', 'I'], // Modal interchange (mixolydian)
    ['I', 'vii°', 'vi', 'V'],     // Leading tone diminished
    ['V/vi', 'vi', 'V/V', 'V'],   // Chain of secondary dominants
    ['I', 'bII', 'bVI', 'V'],     // Neapolitan with bVI
  ],

  // Level 4: Complex progressions with multiple techniques
  level4: [
    ['I', 'V/vi', 'vi', 'bVI'],     // Secondary dominant with borrowed chord
    ['I', 'iii7', 'vi', 'ii7'],     // 7th chord progression
    ['vi', 'IV/3', 'I/5', 'V7'],    // Complex voice leading with 7th
    ['I7', 'V/V', 'V7', 'I'],       // Secondary dominant chain
    ['ii7', 'V7sus4', 'V7', 'I'],   // Jazz suspension resolution
    ['I', 'bII', 'V7', 'I'],        // Neapolitan sixth approach
    ['vi', '#iv°', 'V7', 'I'],      // Diminished passing chord
    ['I', 'I+', 'vi', 'bVI'],       // Augmented chord progression
    ['ii7', 'bII7', 'I', 'V'],      // Tritone substitution
    ['I', 'VI7dom', 'ii7', 'V7'],   // Dominant 7th sequence
    ['bVII', 'IV', 'I', 'V+'],      // Borrowed chord with augmented
    ['I7', 'IV7', 'vii°', 'I'],     // Circle with diminished
  ]

  // Future level ideas:
  // - Jazz ii-V-I with extensions
  // - Blues progressions with dominant 7ths
  // - Modal progressions (dorian, mixolydian)
  // - Neo-Riemannian transformations
  // - Chromatic voice leading
};

// Major and minor keys to use
const KEYS: KeysConfig = {
  major: ['C', 'G', 'F', 'D', 'Bb', 'A', 'E', 'Ab', 'Eb', 'B', 'F#', 'Db'],
  minor: ['Am', 'Em', 'Bm', 'Dm', 'Gm', 'Fm', 'Cm', 'F#m', 'C#m', 'G#m', 'D#m', 'A#m']
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
      // No minor keys in default - add them in specific levels that support minor key Roman numerals
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