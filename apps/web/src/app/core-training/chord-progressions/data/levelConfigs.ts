/**
 * Consolidated Level Configuration System for Chord Progressions 2
 * 
 * This file centralizes all 4 chord progression levels with clean architecture:
 * - Level 1: Basic Progressions (C major, A minor)
 * - Level 2: Progressions with Inversions
 * - Level 3: Non-Diatonic Chords
 * - Level 4: Non-Diatonic with Inversions
 * 
 * Following the chord-construction pattern for maintainable, configuration-driven level management.
 */

export interface ProgressionGeneration {
  keys: string[];
  progressionPatterns: string[][];
  allowInversions: boolean;
  allowNonDiatonic: boolean;
  requireInversionLabeling: boolean;
}

export interface LevelConfig {
  id: string;
  level: number;
  title: string;
  description: string;
  longDescription: string;
  category: string;
  
  // Scoring criteria
  totalProblems: number;
  passAccuracy: number;
  passTime: number;
  
  // Visual theme
  theme: string;
  progressColor: string;
  buttonColor: string;
  buttonHoverColor: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  categoryColor: string;
  
  // Progression generation settings
  progressionGeneration: ProgressionGeneration;
  
  // Audio settings
  audioConfig: {
    tempo: number;
    chordDuration: number;
    baseOctave: number;
  };
  
  // Auto-advance timing
  autoAdvance: {
    correctDelay: number;
    incorrectDelay: number;
  };
  
  // Navigation
  nextLevelPath: string | null;
  backPath: string;
}

export const LEVEL_CONFIGS: Record<string, LevelConfig> = {
  // ============================================================================
  // LEVEL 1: BASIC PROGRESSIONS
  // ============================================================================
  
  'level1': {
    id: 'level1',
    level: 1,
    title: 'Level 1: Basic Progressions',
    description: 'Identify common 4-chord progressions in major and minor keys using roman numerals',
    longDescription: 'Master the fundamental chord progressions that form the backbone of Western music. Learn to identify I-V-vi-IV, vi-IV-I-V, and other common patterns in both major and minor keys.',
    category: 'basic-progressions',
    
    // Scoring criteria
    totalProblems: 20,
    passAccuracy: 85,
    passTime: 10,
    
    // Visual theme
    theme: 'emerald',
    progressColor: 'bg-green-500',
    buttonColor: 'bg-green-600',
    buttonHoverColor: 'bg-green-700',
    difficulty: 'Beginner',
    categoryColor: 'bg-green-500',
    
    // Progression generation settings
    progressionGeneration: {
      keys: ['C', 'Am'], // Start with just C major and A minor
      progressionPatterns: [
        ['I', 'V', 'vi', 'IV'],    // Most common progression
        ['vi', 'IV', 'I', 'V'],    // vi-IV-I-V
        ['I', 'IV', 'V', 'I'],     // Classic cadential
        ['I', 'ii', 'V', 'I'],     // ii-V-I variation
        ['I', 'vi', 'IV', 'V'],    // I-vi-IV-V
        ['vi', 'ii', 'V', 'I'],    // vi-ii-V-I
      ],
      allowInversions: false,
      allowNonDiatonic: false,
      requireInversionLabeling: false
    },
    
    // Audio settings
    audioConfig: {
      tempo: 80,
      chordDuration: 800, // 0.8 seconds per chord
      baseOctave: 4
    },
    
    // Auto-advance timing
    autoAdvance: {
      correctDelay: 1000,   // 1 second for correct answers
      incorrectDelay: 4000  // 4 seconds for incorrect answers
    },
    
    // Navigation
    nextLevelPath: '/chord-progressions/2',
    backPath: '/core-training/chord-progressions'
  },

  // ============================================================================
  // LEVEL 2: PROGRESSIONS WITH INVERSIONS
  // ============================================================================
  
  'level2': {
    id: 'level2',
    level: 2,
    title: 'Level 2: Progressions with Inversions',
    description: 'Identify chord progressions with first and second inversions, including slash chord notation',
    longDescription: 'Build upon basic progressions by adding inversions. Learn to recognize and label inverted chords using both Roman numeral notation and slash chord symbols.',
    category: 'progressions-with-inversions',
    
    totalProblems: 25,
    passAccuracy: 80,
    passTime: 12,
    
    theme: 'teal',
    progressColor: 'bg-yellow-500',
    buttonColor: 'bg-yellow-600',
    buttonHoverColor: 'bg-yellow-700',
    difficulty: 'Intermediate',
    categoryColor: 'bg-yellow-500',
    
    progressionGeneration: {
      keys: ['C', 'Am', 'G', 'Em', 'F', 'Dm'], // Add more keys
      progressionPatterns: [
        ['I', 'V6', 'vi', 'IV'],     // V in first inversion
        ['I', 'V', 'vi', 'IV6'],     // IV in first inversion
        ['I6', 'V', 'vi', 'IV'],     // I in first inversion
        ['vi', 'IV', 'I6', 'V'],     // I in first inversion
        ['I', 'IV', 'V6', 'I'],      // V in first inversion
        ['I', 'ii6', 'V', 'I'],      // ii in first inversion
      ],
      allowInversions: true,
      allowNonDiatonic: false,
      requireInversionLabeling: true
    },
    
    audioConfig: {
      tempo: 85,
      chordDuration: 900,
      baseOctave: 4
    },
    
    autoAdvance: {
      correctDelay: 1200,
      incorrectDelay: 4500
    },
    
    nextLevelPath: '/chord-progressions/3',
    backPath: '/core-training/chord-progressions'
  },

  // ============================================================================
  // LEVEL 3: NON-DIATONIC CHORDS
  // ============================================================================
  
  'level3': {
    id: 'level3',
    level: 3,
    title: 'Level 3: Non-Diatonic Chords',
    description: 'Identify progressions with borrowed chords, Neapolitan, and augmented chords',
    longDescription: 'Explore more complex harmony with borrowed chords from parallel modes, Neapolitan sixth chords, and chromatic progressions that add color and sophistication to music.',
    category: 'non-diatonic-progressions',
    
    totalProblems: 30,
    passAccuracy: 75,
    passTime: 15,
    
    theme: 'purple',
    progressColor: 'bg-purple-500',
    buttonColor: 'bg-purple-600',
    buttonHoverColor: 'bg-purple-700',
    difficulty: 'Advanced',
    categoryColor: 'bg-purple-500',
    
    progressionGeneration: {
      keys: ['C', 'Am', 'G', 'Em', 'F', 'Dm', 'D', 'Bm'],
      progressionPatterns: [
        ['I', 'bVII', 'IV', 'I'],     // Borrowed bVII from minor
        ['I', 'bVI', 'bVII', 'I'],    // Borrowed bVI and bVII
        ['I', 'IV', 'bVII', 'IV'],    // Common rock progression
        ['vi', 'bVI', 'I', 'V'],      // bVI (Neapolitan-like)
        ['I', 'V', 'bVI', 'bVII'],    // Descending chromatic bass
        ['I', 'III', 'vi', 'IV'],     // Major III instead of iii
        ['i', 'VI', 'VII', 'i'],      // Natural VII in minor
        ['i', 'bII', 'V', 'i'],       // Neapolitan sixth
      ],
      allowInversions: false,
      allowNonDiatonic: true,
      requireInversionLabeling: false
    },
    
    audioConfig: {
      tempo: 75,
      chordDuration: 1000,
      baseOctave: 4
    },
    
    autoAdvance: {
      correctDelay: 1500,
      incorrectDelay: 5000
    },
    
    nextLevelPath: '/chord-progressions/4',
    backPath: '/core-training/chord-progressions'
  },

  // ============================================================================
  // LEVEL 4: NON-DIATONIC WITH INVERSIONS
  // ============================================================================
  
  'level4': {
    id: 'level4',
    level: 4,
    title: 'Level 4: Non-Diatonic Chords with Inversions',
    description: 'Master progressions with borrowed chords and precise inversion identification',
    longDescription: 'The ultimate challenge: combine non-diatonic harmony with inversion analysis. Master the most sophisticated chord progressions found in classical and contemporary music.',
    category: 'non-diatonic-inversions',
    
    totalProblems: 35,
    passAccuracy: 70,
    passTime: 18,
    
    theme: 'indigo',
    progressColor: 'bg-indigo-500',
    buttonColor: 'bg-indigo-600',
    buttonHoverColor: 'bg-indigo-700',
    difficulty: 'Expert',
    categoryColor: 'bg-indigo-500',
    
    progressionGeneration: {
      keys: ['C', 'Am', 'G', 'Em', 'F', 'Dm', 'D', 'Bm', 'Bb', 'Gm'],
      progressionPatterns: [
        ['I', 'bVII6', 'IV', 'I'],     // bVII in first inversion
        ['I', 'bVI', 'IV6', 'V'],      // Mixed inversions
        ['vi', 'bVI6', 'I', 'V6'],     // Multiple inversions
        ['I6', 'V', 'bVI', 'bVII'],    // Complex chromatic progression
        ['I', 'III6', 'vi', 'IV6'],    // Major III with inversions
        ['i', 'bII6', 'V6', 'i'],      // Neapolitan with inversions
        ['I', 'V6', 'bVI', 'IV6'],     // Advanced chromatic movement
        ['vi6', 'bVI', 'I6', 'V'],     // Starting with inverted vi
      ],
      allowInversions: true,
      allowNonDiatonic: true,
      requireInversionLabeling: true
    },
    
    audioConfig: {
      tempo: 70,
      chordDuration: 1100,
      baseOctave: 4
    },
    
    autoAdvance: {
      correctDelay: 2000,
      incorrectDelay: 6000
    },
    
    nextLevelPath: null, // No next level yet
    backPath: '/core-training/chord-progressions'
  }
};

/**
 * Get level configuration by level number
 */
export const getLevelConfig = (level: string): LevelConfig | null => {
  return LEVEL_CONFIGS[level] || null;
};

/**
 * Get all available levels for the hub page
 */
export const getAllLevels = (): LevelConfig[] => {
  return Object.values(LEVEL_CONFIGS).sort((a, b) => a.level - b.level);
};

/**
 * Validate that a level exists
 */
export const isValidLevel = (level: string): boolean => {
  return level in LEVEL_CONFIGS;
};