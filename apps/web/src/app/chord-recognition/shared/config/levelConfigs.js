/**
 * Level Configuration System
 * 
 * Centralizes all level-specific parameters to eliminate hardcoded values
 * and provide consistent configuration across the chord recognition system.
 */

export const LEVEL_CONFIGS = {
  level1: {
    // Metadata
    id: 'level1',
    title: 'Basic Triads',
    description: 'Identify basic triads (Major, Minor, Diminished, Augmented)',
    
    // Scoring criteria
    totalProblems: 30,
    passAccuracy: 90, // 90%
    passTime: 5, // 5 seconds average
    
    // Visual theme
    progressColor: 'bg-green-500',
    buttonColor: 'bg-green-500',
    buttonHoverColor: 'bg-green-600',
    
    // Chord generation settings
    chordGeneration: {
      type: 'basic-triads',
      roots: ['C', 'D', 'E', 'F', 'G', 'A', 'B'], // Natural notes only
      chordTypes: ['major', 'minor', 'diminished', 'augmented'],
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
      correctDelay: 500,   // 0.5 seconds
      incorrectDelay: 4000 // 4 seconds
    }
  },

  level2: {
    // Metadata
    id: 'level2', 
    title: 'Triads with First Inversions',
    description: 'Identify basic triads including first inversions',
    
    // Scoring criteria
    totalProblems: 30,
    passAccuracy: 90, // 90%
    passTime: 5, // 5 seconds average
    
    // Visual theme
    progressColor: 'bg-blue-500',
    buttonColor: 'bg-blue-500', 
    buttonHoverColor: 'bg-blue-600',
    
    // Chord generation settings
    chordGeneration: {
      type: 'triads-with-inversions',
      roots: ['C', 'Cs', 'D', 'Ds', 'E', 'F', 'Fs', 'G', 'Gs', 'A', 'As', 'B'],
      chordTypes: ['major', 'minor', 'diminished'], // Excludes augmented inversions
      inversionSupport: true,
      maxInversion: 1 // First inversion only
    },
    
    // Validation settings
    validation: {
      supportsInversions: true,
      requireInversionLabeling: false, // From REQUIRE_INVERSION_LABELING constant
      maxInversion: 1,
      acceptableFormats: ['basic', 'numbered', 'descriptive', 'slash'] 
    },
    
    // Auto-advance timing
    autoAdvance: {
      correctDelay: 500,
      incorrectDelay: 4000
    }
  },

  level3: {
    // Metadata
    id: 'level3',
    title: 'Triads with All Inversions', 
    description: 'Identify basic triads including first and second inversions',
    
    // Scoring criteria
    totalProblems: 30,
    passAccuracy: 90, // 90%
    passTime: 5, // 5 seconds average
    
    // Visual theme
    progressColor: 'bg-purple-500',
    buttonColor: 'bg-purple-500',
    buttonHoverColor: 'bg-purple-600',
    
    // Chord generation settings
    chordGeneration: {
      type: 'triads-with-inversions',
      roots: ['C', 'Cs', 'D', 'Ds', 'E', 'F', 'Fs', 'G', 'Gs', 'A', 'As', 'B'],
      chordTypes: ['major', 'minor', 'diminished'], // Excludes augmented inversions
      inversionSupport: true,
      maxInversion: 2 // First and second inversions
    },
    
    // Validation settings
    validation: {
      supportsInversions: true,
      requireInversionLabeling: false,
      maxInversion: 2,
      acceptableFormats: ['basic', 'numbered', 'descriptive', 'slash']
    },
    
    // Auto-advance timing
    autoAdvance: {
      correctDelay: 500,
      incorrectDelay: 4000
    }
  },

  level4: {
    // Metadata
    id: 'level4',
    title: 'Open Voicing Chords',
    description: 'Identify basic triads in open voicings with octave spacing',
    
    // Scoring criteria  
    totalProblems: 30,
    passAccuracy: 75, // 75% (easier than other levels)
    passTime: 12, // 12 seconds average (more time needed)
    
    // Visual theme
    progressColor: 'bg-orange-500',
    buttonColor: 'bg-orange-500',
    buttonHoverColor: 'bg-orange-600',
    
    // Chord generation settings
    chordGeneration: {
      type: 'open-voicings',
      roots: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], // MIDI note numbers
      chordTypes: ['major', 'minor', 'diminished', 'augmented'],
      inversionSupport: false, // Open voicings don't use traditional inversions
      voicingSettings: {
        minSpread: 12, // Minimum octave spread
        maxSpread: 36, // Maximum spread
        doubleRoot: true, // Allow root doubling
        allowWideSpacing: true
      }
    },
    
    // Validation settings
    validation: {
      supportsInversions: false,
      requireInversionLabeling: false,
      acceptableFormats: ['basic'] // Only basic chord names for open voicings
    },
    
    // Auto-advance timing
    autoAdvance: {
      correctDelay: 500,
      incorrectDelay: 4000
    },
    
    // Special display settings for open voicings
    display: {
      title: 'Open Voicing Chord',
      showLabelToggle: false,
      midiRange: {
        lowest: 24,  // C1
        highest: 96  // C7
      }
    }
  }
};

/**
 * Get configuration for a specific level
 * @param {string} levelId - The level identifier (e.g., 'level1', 'level2')
 * @returns {Object} Level configuration object
 */
export const getLevelConfig = (levelId) => {
  const config = LEVEL_CONFIGS[levelId];
  if (!config) {
    throw new Error(`Level configuration not found for: ${levelId}`);
  }
  return config;
};

/**
 * Get all available level IDs
 * @returns {string[]} Array of level identifiers
 */
export const getAllLevelIds = () => {
  return Object.keys(LEVEL_CONFIGS);
};

/**
 * Validate level configuration object
 * @param {Object} config - Configuration to validate
 * @returns {boolean} True if valid
 */
export const validateLevelConfig = (config) => {
  const requiredFields = [
    'id', 'title', 'totalProblems', 'passAccuracy', 'passTime',
    'progressColor', 'buttonColor', 'chordGeneration', 'validation'
  ];
  
  return requiredFields.every(field => config.hasOwnProperty(field));
};