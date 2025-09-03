/**
 * Consolidated Level Configuration System
 * 
 * This file centralizes all 15 chord recognition levels from 3 categories:
 * - Basic Triads (4 levels)
 * - Seventh Chords (5 levels) 
 * - Extended Chords (6 levels)
 * 
 * Following the transcription architecture pattern for clean, maintainable code.
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface AutoAdvanceSettings {
  correctDelay: number;
  incorrectDelay: number;
}

interface VoicingSettings {
  minSpread: number;
  maxSpread: number;
  doubleRoot: boolean;
  allowWideSpacing: boolean;
}

interface ChordGenerationSettings {
  type: string;
  roots: string[] | number[];
  chordTypes: string[];
  inversions: string[];
  octaveRange: number[];
  inversionSupport?: boolean;
  maxInversion?: number;
  isOpenVoicing?: boolean;
  voicingSettings?: VoicingSettings;
}

interface ValidationSettings {
  supportsInversions: boolean;
  requireInversionLabeling: boolean;
  acceptableFormats: string[];
  maxInversion?: number;
}

interface DisplaySettings {
  title: string;
  showLabelToggle: boolean;
  midiRange: {
    lowest: number;
    highest: number;
  };
}

export interface LevelConfig {
  id: string;
  category: string;
  level: number;
  title: string;
  description: string;
  
  // Scoring criteria
  totalProblems: number;
  passAccuracy: number;
  passTime: number;
  
  // Visual theme
  progressColor: string;
  buttonColor: string;
  buttonHoverColor: string;
  
  // Configuration objects
  chordGeneration: ChordGenerationSettings;
  validation: ValidationSettings;
  autoAdvance: AutoAdvanceSettings;
  
  // Optional display settings
  display?: DisplaySettings;
}

export interface LevelConfigs {
  [levelId: string]: LevelConfig;
}

interface CategoryInfo {
  [categoryName: string]: {
    title: string;
    description: string;
    difficulty: string;
    color: string;
    levels: number;
  };
}

// ============================================================================
// CONFIGURATION DATA
// ============================================================================

export const LEVEL_CONFIGS: LevelConfigs = {
  // ============================================================================
  // BASIC TRIADS LEVELS (4 levels)
  // ============================================================================
  
  'basic-triads-1': {
    id: 'basic-triads-1',
    category: 'basic-triads',
    level: 1,
    title: 'Basic Triads',
    description: 'Identify basic triads (Major, Minor, Diminished, Augmented) in root position only',
    
    // Scoring criteria (reduced for testing)
    totalProblems: 5,
    passAccuracy: 90,
    passTime: 5,
    
    // Visual theme
    progressColor: 'bg-green-500',
    buttonColor: 'bg-green-500',
    buttonHoverColor: 'bg-green-600',
    
    // Chord generation settings
    chordGeneration: {
      type: 'basic-triads',
      roots: ['C', 'D', 'E', 'F', 'G', 'A', 'B'], // Natural notes only
      chordTypes: ['major', 'minor', 'diminished', 'augmented'],
      inversions: ['root'],
      octaveRange: [3, 4],
      inversionSupport: false,
      maxInversion: 0
    },
    
    // Validation settings
    validation: {
      supportsInversions: false,
      requireInversionLabeling: false,
      acceptableFormats: ['basic'] // e.g., 'C', 'Dm', 'Fdim', 'Gaug'
    },
    
    // Auto-advance timing
    autoAdvance: {
      correctDelay: 500,
      incorrectDelay: 4000
    }
  },

  'basic-triads-2': {
    id: 'basic-triads-2',
    category: 'basic-triads', 
    level: 2,
    title: 'Triads with First Inversions',
    description: 'Identify basic triads including first inversions',
    
    totalProblems: 30,
    passAccuracy: 90,
    passTime: 5,
    
    progressColor: 'bg-blue-500',
    buttonColor: 'bg-blue-500',
    buttonHoverColor: 'bg-blue-600',
    
    chordGeneration: {
      type: 'triads-with-inversions',
      roots: ['C', 'Cs', 'D', 'Ds', 'E', 'F', 'Fs', 'G', 'Gs', 'A', 'As', 'B'],
      chordTypes: ['major', 'minor', 'diminished'], // Excludes augmented inversions
      inversions: ['root', 'first'],
      octaveRange: [3, 4],
      inversionSupport: true,
      maxInversion: 1
    },
    
    validation: {
      supportsInversions: true,
      requireInversionLabeling: false,
      maxInversion: 1,
      acceptableFormats: ['basic', 'numbered', 'descriptive', 'slash']
    },
    
    autoAdvance: {
      correctDelay: 500,
      incorrectDelay: 4000
    }
  },

  'basic-triads-3': {
    id: 'basic-triads-3',
    category: 'basic-triads',
    level: 3,
    title: 'Triads with All Inversions',
    description: 'Identify basic triads including first and second inversions',
    
    totalProblems: 30,
    passAccuracy: 90,
    passTime: 5,
    
    progressColor: 'bg-purple-500',
    buttonColor: 'bg-purple-500',
    buttonHoverColor: 'bg-purple-600',
    
    chordGeneration: {
      type: 'triads-with-inversions',
      roots: ['C', 'Cs', 'D', 'Ds', 'E', 'F', 'Fs', 'G', 'Gs', 'A', 'As', 'B'],
      chordTypes: ['major', 'minor', 'diminished'],
      inversions: ['root', 'first', 'second'],
      octaveRange: [3, 4],
      inversionSupport: true,
      maxInversion: 2
    },
    
    validation: {
      supportsInversions: true,
      requireInversionLabeling: false,
      maxInversion: 2,
      acceptableFormats: ['basic', 'numbered', 'descriptive', 'slash']
    },
    
    autoAdvance: {
      correctDelay: 500,
      incorrectDelay: 4000
    }
  },

  'basic-triads-4': {
    id: 'basic-triads-4',
    category: 'basic-triads',
    level: 4,
    title: 'Open Voicing Triads',
    description: 'Identify basic triads in open voicings with octave spacing',
    
    totalProblems: 30,
    passAccuracy: 75, // Easier than other levels
    passTime: 12, // More time needed
    
    progressColor: 'bg-orange-500',
    buttonColor: 'bg-orange-500',
    buttonHoverColor: 'bg-orange-600',
    
    chordGeneration: {
      type: 'open-voicings',
      roots: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], // MIDI note numbers
      chordTypes: ['major', 'minor', 'diminished', 'augmented'],
      inversions: ['root'],
      octaveRange: [2, 3, 4, 5, 6],
      inversionSupport: false,
      isOpenVoicing: true,
      voicingSettings: {
        minSpread: 12,
        maxSpread: 36,
        doubleRoot: true,
        allowWideSpacing: true
      }
    },
    
    validation: {
      supportsInversions: false,
      requireInversionLabeling: false,
      acceptableFormats: ['basic']
    },
    
    autoAdvance: {
      correctDelay: 500,
      incorrectDelay: 4000
    },
    
    display: {
      title: 'Open Voicing Chord',
      showLabelToggle: false,
      midiRange: {
        lowest: 24,
        highest: 96
      }
    }
  },

  // ============================================================================
  // SEVENTH CHORDS LEVELS (5 levels)
  // ============================================================================

  'seventh-chords-1': {
    id: 'seventh-chords-1',
    category: 'seventh-chords',
    level: 1,
    title: 'Basic Seventh Chords',
    description: 'Identify 7th chords in root position only',
    
    totalProblems: 30,
    passAccuracy: 90,
    passTime: 5,
    
    progressColor: 'bg-green-500',
    buttonColor: 'bg-green-500',
    buttonHoverColor: 'bg-green-600',
    
    chordGeneration: {
      type: 'seventh-chords',
      roots: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
      chordTypes: ['major7', 'minor7', 'dominant7', 'diminished7', 'halfDiminished7'],
      inversions: ['root'],
      octaveRange: [3, 4]
    },
    
    validation: {
      supportsInversions: false,
      requireInversionLabeling: false,
      acceptableFormats: ['basic']
    },
    
    autoAdvance: {
      correctDelay: 500,
      incorrectDelay: 4000
    }
  },

  'seventh-chords-2': {
    id: 'seventh-chords-2',
    category: 'seventh-chords',
    level: 2,
    title: '7th Chords with First Inversions',
    description: 'Identify 7th chords including first inversions',
    
    totalProblems: 30,
    passAccuracy: 90,
    passTime: 5,
    
    progressColor: 'bg-blue-500',
    buttonColor: 'bg-blue-500',
    buttonHoverColor: 'bg-blue-600',
    
    chordGeneration: {
      type: 'seventh-chords',
      roots: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
      chordTypes: ['major7', 'minor7', 'dominant7', 'diminished7', 'halfDiminished7'],
      inversions: ['root', 'first'],
      octaveRange: [3, 4]
    },
    
    validation: {
      supportsInversions: true,
      requireInversionLabeling: false,
      maxInversion: 1,
      acceptableFormats: ['basic', 'numbered', 'descriptive', 'slash']
    },
    
    autoAdvance: {
      correctDelay: 500,
      incorrectDelay: 4000
    }
  },

  'seventh-chords-3': {
    id: 'seventh-chords-3',
    category: 'seventh-chords',
    level: 3,
    title: '7th Chords with Second Inversions',
    description: 'Identify 7th chords including first and second inversions',
    
    totalProblems: 30,
    passAccuracy: 90,
    passTime: 5,
    
    progressColor: 'bg-purple-500',
    buttonColor: 'bg-purple-500',
    buttonHoverColor: 'bg-purple-600',
    
    chordGeneration: {
      type: 'seventh-chords',
      roots: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
      chordTypes: ['major7', 'minor7', 'dominant7', 'diminished7', 'halfDiminished7'],
      inversions: ['root', 'first', 'second'],
      octaveRange: [3, 4]
    },
    
    validation: {
      supportsInversions: true,
      requireInversionLabeling: false,
      maxInversion: 2,
      acceptableFormats: ['basic', 'numbered', 'descriptive', 'slash']
    },
    
    autoAdvance: {
      correctDelay: 500,
      incorrectDelay: 4000
    }
  },

  'seventh-chords-4': {
    id: 'seventh-chords-4',
    category: 'seventh-chords',
    level: 4,
    title: '7th Chords with Third Inversions',
    description: 'Identify 7th chords including all inversions',
    
    totalProblems: 30,
    passAccuracy: 90,
    passTime: 5,
    
    progressColor: 'bg-orange-500',
    buttonColor: 'bg-orange-500',
    buttonHoverColor: 'bg-orange-600',
    
    chordGeneration: {
      type: 'seventh-chords',
      roots: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
      chordTypes: ['major7', 'minor7', 'dominant7', 'diminished7', 'halfDiminished7'],
      inversions: ['root', 'first', 'second', 'third'],
      octaveRange: [3, 4]
    },
    
    validation: {
      supportsInversions: true,
      requireInversionLabeling: false,
      maxInversion: 3,
      acceptableFormats: ['basic', 'numbered', 'descriptive', 'slash']
    },
    
    autoAdvance: {
      correctDelay: 500,
      incorrectDelay: 4000
    }
  },

  'seventh-chords-5': {
    id: 'seventh-chords-5',
    category: 'seventh-chords',
    level: 5,
    title: 'Open Voicing 7th Chords',
    description: 'Identify 7th chords in open voicings with octave spacing',
    
    totalProblems: 30,
    passAccuracy: 75,
    passTime: 12,
    
    progressColor: 'bg-red-500',
    buttonColor: 'bg-red-500',
    buttonHoverColor: 'bg-red-600',
    
    chordGeneration: {
      type: 'seventh-chords-open',
      roots: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
      chordTypes: ['major7', 'minor7', 'dominant7', 'diminished7', 'halfDiminished7'],
      inversions: ['root'],
      octaveRange: [2, 3, 4, 5, 6],
      isOpenVoicing: true,
      voicingSettings: {
        minSpread: 12,
        maxSpread: 36,
        doubleRoot: true,
        allowWideSpacing: true
      }
    },
    
    validation: {
      supportsInversions: false,
      requireInversionLabeling: false,
      acceptableFormats: ['basic']
    },
    
    autoAdvance: {
      correctDelay: 500,
      incorrectDelay: 4000
    }
  },

  // ============================================================================
  // EXTENDED CHORDS LEVELS (6 levels)
  // ============================================================================

  'extended-chords-1': {
    id: 'extended-chords-1',
    category: 'extended-chords',
    level: 1,
    title: '9th Chords',
    description: 'Identify 9th chords in root position only',
    
    totalProblems: 30,
    passAccuracy: 85,
    passTime: 8,
    
    progressColor: 'bg-purple-500',
    buttonColor: 'bg-purple-500',
    buttonHoverColor: 'bg-purple-600',
    
    chordGeneration: {
      type: 'ninth-chords',
      roots: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
      chordTypes: ['maj9', 'min9', 'dom9', 'dom7b9', 'dom7sharp9', 'min7b9', 'add9', 'madd9', 'dim7add9', 'dim7b9', 'halfDim9', 'halfDimb9'],
      inversions: ['root'],
      octaveRange: [3, 4]
    },
    
    validation: {
      supportsInversions: false,
      requireInversionLabeling: false,
      acceptableFormats: ['basic']
    },
    
    autoAdvance: {
      correctDelay: 1500,
      incorrectDelay: 3000
    }
  },

  'extended-chords-2': {
    id: 'extended-chords-2',
    category: 'extended-chords',
    level: 2,
    title: '11th Chords',
    description: 'Identify 11th chords in root position only',
    
    totalProblems: 35,
    passAccuracy: 75,
    passTime: 10,
    
    progressColor: 'bg-indigo-500',
    buttonColor: 'bg-indigo-500',
    buttonHoverColor: 'bg-indigo-600',
    
    chordGeneration: {
      type: 'eleventh-chords',
      roots: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
      chordTypes: ['maj11', 'min11', 'dom11', 'maj7sharp11', 'dom7sharp11', 'min7sharp11', 'add11', 'madd11', 'dom11b9', 'dom11sharp9', 'min11b9'],
      inversions: ['root'],
      octaveRange: [3, 4]
    },
    
    validation: {
      supportsInversions: false,
      requireInversionLabeling: false,
      acceptableFormats: ['basic']
    },
    
    autoAdvance: {
      correctDelay: 1500,
      incorrectDelay: 3000
    }
  },

  'extended-chords-3': {
    id: 'extended-chords-3',
    category: 'extended-chords',
    level: 3,
    title: '13th Chords',
    description: 'Identify 13th chords and alterations in root position only',
    
    totalProblems: 40,
    passAccuracy: 70,
    passTime: 12,
    
    progressColor: 'bg-pink-500',
    buttonColor: 'bg-pink-500',
    buttonHoverColor: 'bg-pink-600',
    
    chordGeneration: {
      type: 'thirteenth-chords',
      roots: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
      chordTypes: ['maj13', 'min13', 'dom13', 'maj13sharp11', 'dom13sharp11', 'dom13b9', 'dom13sharp9', 'add13', 'madd13', 'dom13sharp11b9', 'dom13sharp11sharp9', 'min13sharp11', 'min13b9'],
      inversions: ['root'],
      octaveRange: [3, 4]
    },
    
    validation: {
      supportsInversions: false,
      requireInversionLabeling: false,
      acceptableFormats: ['basic']
    },
    
    autoAdvance: {
      correctDelay: 1500,
      incorrectDelay: 3000
    }
  },

  'extended-chords-4': {
    id: 'extended-chords-4',
    category: 'extended-chords',
    level: 4,
    title: '9th Chord Inversions',
    description: 'Identify all inversions of 9th chords (root, 1st, 2nd, 3rd, 4th)',
    
    totalProblems: 40,
    passAccuracy: 80,
    passTime: 12,
    
    progressColor: 'bg-purple-600',
    buttonColor: 'bg-purple-600',
    buttonHoverColor: 'bg-purple-700',
    
    chordGeneration: {
      type: 'ninth-chords',
      roots: [0, 2, 4, 5, 7, 9, 11], // Natural notes for inversions
      chordTypes: ['maj9', 'min9', 'dom9'],
      inversions: ['root', 'first', 'second', 'third', 'fourth'],
      octaveRange: [3, 5]
    },
    
    validation: {
      supportsInversions: true,
      requireInversionLabeling: true,
      maxInversion: 4,
      acceptableFormats: ['basic', 'numbered', 'descriptive', 'slash']
    },
    
    autoAdvance: {
      correctDelay: 2000,
      incorrectDelay: 4000
    }
  },

  'extended-chords-5': {
    id: 'extended-chords-5',
    category: 'extended-chords',
    level: 5,
    title: '11th Chord Inversions',
    description: '11th chords with inversions - advanced harmony',
    
    totalProblems: 35,
    passAccuracy: 75,
    passTime: 15,
    
    progressColor: 'bg-indigo-600',
    buttonColor: 'bg-indigo-600',
    buttonHoverColor: 'bg-indigo-700',
    
    chordGeneration: {
      type: 'eleventh-chords',
      roots: [0, 2, 4, 5, 7, 9, 11],
      chordTypes: ['maj11', 'min11', 'dom11'],
      inversions: ['root', 'first', 'second'],
      octaveRange: [3, 5]
    },
    
    validation: {
      supportsInversions: true,
      requireInversionLabeling: true,
      maxInversion: 2,
      acceptableFormats: ['basic', 'numbered', 'descriptive', 'slash']
    },
    
    autoAdvance: {
      correctDelay: 2000,
      incorrectDelay: 4000
    }
  },

  'extended-chords-6': {
    id: 'extended-chords-6',
    category: 'extended-chords',
    level: 6,
    title: '13th Chord Inversions',
    description: '13th chords with inversions - master level harmony',
    
    totalProblems: 40,
    passAccuracy: 70,
    passTime: 18,
    
    progressColor: 'bg-pink-600',
    buttonColor: 'bg-pink-600',
    buttonHoverColor: 'bg-pink-700',
    
    chordGeneration: {
      type: 'thirteenth-chords',
      roots: [0, 2, 4, 5, 7, 9, 11],
      chordTypes: ['maj13', 'min13', 'dom13'],
      inversions: ['root', 'first'],
      octaveRange: [3, 5]
    },
    
    validation: {
      supportsInversions: true,
      requireInversionLabeling: true,
      maxInversion: 1,
      acceptableFormats: ['basic', 'numbered', 'descriptive', 'slash']
    },
    
    autoAdvance: {
      correctDelay: 2000,
      incorrectDelay: 4000
    }
  }
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get configuration for a specific level by ID
 * @param levelId - The level identifier (e.g., 'basic-triads-1')
 * @returns Level configuration object
 */
export const getLevelConfig = (levelId: string): LevelConfig => {
  const config = LEVEL_CONFIGS[levelId];
  if (!config) {
    throw new Error(`Level configuration not found for: ${levelId}`);
  }
  return config;
};

/**
 * Get configuration for a level by category and level number
 * @param category - Category name (basic-triads, seventh-chords, extended-chords)
 * @param level - Level number (1-6)
 * @returns Level configuration object
 */
export const getLevelConfigByParams = (category: string, level: string | number): LevelConfig => {
  const levelId = `${category}-${level}`;
  return getLevelConfig(levelId);
};

/**
 * Get all levels for a specific category
 * @param category - Category name
 * @returns Array of level configurations
 */
export const getLevelsForCategory = (category: string): LevelConfig[] => {
  return Object.values(LEVEL_CONFIGS).filter(config => config.category === category);
};

/**
 * Get all available level IDs
 * @returns Array of level identifiers
 */
export const getAllLevelIds = (): string[] => {
  return Object.keys(LEVEL_CONFIGS);
};

/**
 * Get category information for the main hub page
 * @returns Category information
 */
export const getCategoryInfo = (): CategoryInfo => ({
  "basic-triads": {
    title: "Basic Triads",
    description: "Major, Minor, Diminished, and Augmented triads",
    difficulty: "Beginner",
    color: "bg-green-500",
    levels: 4
  },
  "seventh-chords": {
    title: "Seventh Chords", 
    description: "7th chords including major 7th, minor 7th, dominant 7th",
    difficulty: "Intermediate",
    color: "bg-blue-500",
    levels: 5
  },
  "extended-chords": {
    title: "Extended Chords",
    description: "9th, 11th, and 13th chords with advanced extensions", 
    difficulty: "Advanced",
    color: "bg-purple-500",
    levels: 6
  }
});

/**
 * Validate level configuration object
 * @param config - Configuration to validate
 * @returns True if valid
 */
export const validateLevelConfig = (config: LevelConfig): boolean => {
  const requiredFields: (keyof LevelConfig)[] = [
    'id', 'category', 'level', 'title', 'totalProblems', 'passAccuracy', 'passTime',
    'progressColor', 'buttonColor', 'chordGeneration', 'validation'
  ];
  
  return requiredFields.every(field => config.hasOwnProperty(field));
};