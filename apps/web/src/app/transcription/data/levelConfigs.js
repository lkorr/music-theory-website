// Universal Transcription Game Level Configuration
// SINGLE SOURCE OF TRUTH for all transcription level behavior, themes, and requirements

export const LEVEL_CONFIGS = {
  // ===== BASIC TRIADS =====
  "basic-triads-1": {
    levelId: "basic-triads-1",
    title: "Level 1: Transcribe Basic Triads",
    description: "Listen and construct root position triads",
    chordTypes: ["major", "minor", "diminished", "augmented"],
    inversionRules: { 
      allowInversions: false,
      requireSpecificInversion: null 
    },
    passRequirements: { 
      accuracy: 85, 
      time: 15 // More time since listening is required
    },
    totalProblems: 20,
    theme: "emerald",
    difficulty: "Beginner",
    nextLevelPath: "/transcription/basic-triads/2",
    backPath: "/transcription",
    audio: {
      tempo: 120,
      noteDuration: 1000, // 1 second per chord
      instrument: "piano"
    }
  },

  "basic-triads-2": {
    levelId: "basic-triads-2", 
    title: "Level 2: Transcribe First Inversions",
    description: "Listen and construct triads with first inversion",
    chordTypes: ["major", "minor", "diminished", "augmented"],
    inversionRules: { 
      allowInversions: true,
      requireSpecificInversion: "first"
    },
    passRequirements: { 
      accuracy: 85, 
      time: 15 
    },
    totalProblems: 20,
    theme: "teal",
    difficulty: "Beginner",
    nextLevelPath: "/transcription/basic-triads/3",
    backPath: "/transcription",
    audio: {
      tempo: 120,
      noteDuration: 1000,
      instrument: "piano"
    }
  },

  "basic-triads-3": {
    levelId: "basic-triads-3",
    title: "Level 3: Transcribe All Inversions", 
    description: "Listen and construct root, first, and second inversions",
    chordTypes: ["major", "minor", "diminished", "augmented"],
    inversionRules: { 
      allowInversions: true,
      requireSpecificInversion: null
    },
    passRequirements: { 
      accuracy: 85, 
      time: 18 
    },
    totalProblems: 20,
    theme: "cyan",
    difficulty: "Beginner",
    nextLevelPath: "/transcription/basic-triads/4",
    backPath: "/transcription",
    audio: {
      tempo: 120,
      noteDuration: 1000,
      instrument: "piano"
    }
  },

  "basic-triads-4": {
    levelId: "basic-triads-4",
    title: "Level 4: Transcribe Triads + Sus Chords", 
    description: "Listen and construct all triads, sus chords, and quartal harmony with inversions",
    chordTypes: ["major", "minor", "diminished", "augmented", "sus2", "sus4", "quartal"],
    inversionRules: { 
      allowInversions: true,
      requireSpecificInversion: null
    },
    passRequirements: { 
      accuracy: 80, 
      time: 20 
    },
    totalProblems: 25,
    theme: "cyan",
    difficulty: "Beginner",
    nextLevelPath: "/transcription/seventh-chords/1",
    backPath: "/transcription",
    audio: {
      tempo: 110,
      noteDuration: 1100,
      instrument: "piano"
    }
  },

  // ===== SEVENTH CHORDS =====
  "seventh-chords-1": {
    levelId: "seventh-chords-1",
    title: "Level 1: Transcribe 7th Chords",
    description: "Listen and construct root position 7th chords", 
    chordTypes: ["major7", "minor7", "dominant7"],
    inversionRules: { 
      allowInversions: false,
      requireSpecificInversion: null 
    },
    passRequirements: { 
      accuracy: 80, // Slightly lower for 7th chords
      time: 20
    },
    totalProblems: 20,
    theme: "emerald",
    difficulty: "Intermediate",
    nextLevelPath: "/transcription/seventh-chords/2",
    backPath: "/transcription",
    audio: {
      tempo: 100, // Slower for complexity
      noteDuration: 1200,
      instrument: "piano"
    }
  },

  "seventh-chords-2": {
    levelId: "seventh-chords-2",
    title: "Level 2: Transcribe First Inversions",
    description: "Listen and construct 7th chords with first inversion",
    chordTypes: ["major7", "minor7", "dominant7"],
    inversionRules: { 
      allowInversions: true,
      requireSpecificInversion: "first" 
    },
    passRequirements: { 
      accuracy: 80, 
      time: 20 
    },
    totalProblems: 20,
    theme: "teal",
    difficulty: "Intermediate",
    nextLevelPath: "/transcription/seventh-chords/3",
    backPath: "/transcription",
    audio: {
      tempo: 100,
      noteDuration: 1200,
      instrument: "piano"
    }
  },

  "seventh-chords-3": {
    levelId: "seventh-chords-3",
    title: "Level 3: Transcribe First and Second Inversions",
    description: "Listen and construct 7th chords with first and second inversions",
    chordTypes: ["major7", "minor7", "dominant7"],
    inversionRules: { 
      allowInversions: true,
      requireSpecificInversion: [1, 2] // Only allow 1st and 2nd inversions
    },
    passRequirements: { 
      accuracy: 80, 
      time: 22 
    },
    totalProblems: 20,
    theme: "cyan",
    difficulty: "Intermediate",
    nextLevelPath: "/transcription/seventh-chords/4",
    backPath: "/transcription",
    audio: {
      tempo: 100,
      noteDuration: 1200,
      instrument: "piano"
    }
  },

  "seventh-chords-4": {
    levelId: "seventh-chords-4",
    title: "Level 4: Transcribe All Inversions",
    description: "Listen and construct all 7th chord inversions",
    chordTypes: ["major7", "minor7", "dominant7"],
    inversionRules: { 
      allowInversions: true,
      requireSpecificInversion: null 
    },
    passRequirements: { 
      accuracy: 80, 
      time: 24 
    },
    totalProblems: 22,
    theme: "cyan",
    difficulty: "Intermediate",
    nextLevelPath: "/transcription/seventh-chords/5",
    backPath: "/transcription",
    audio: {
      tempo: 95,
      noteDuration: 1300,
      instrument: "piano"
    }
  },

  "seventh-chords-5": {
    levelId: "seventh-chords-5",
    title: "Level 5: Transcribe Mixed Triads and 7th Chords",
    description: "Listen and construct both triads and 7th chords with all inversions",
    chordTypes: ["major", "minor", "diminished", "augmented", "sus2", "sus4", "quartal", "major7", "minor7", "dominant7"],
    inversionRules: { 
      allowInversions: true,
      requireSpecificInversion: null 
    },
    passRequirements: { 
      accuracy: 85, 
      time: 20 
    },
    totalProblems: 25,
    theme: "cyan",
    difficulty: "Intermediate",
    nextLevelPath: "/transcription/extended-chords/1",
    backPath: "/transcription",
    audio: {
      tempo: 90,
      noteDuration: 1400,
      instrument: "piano"
    }
  },

  // ===== EXTENDED/JAZZ CHORDS =====
  "extended-chords-1": {
    levelId: "extended-chords-1",
    title: "Level 1: Transcribe 9th Chords",
    description: "Listen and construct major 9th, minor 9th, dominant 9th",
    chordTypes: ["maj9", "min9", "dom9"],
    inversionRules: { 
      allowInversions: false,
      requireSpecificInversion: null 
    },
    passRequirements: { 
      accuracy: 75, // Lower for advanced chords
      time: 25
    },
    totalProblems: 15,
    theme: "purple",
    difficulty: "Advanced",
    nextLevelPath: "/transcription/extended-chords/2",
    backPath: "/transcription",
    audio: {
      tempo: 90,
      noteDuration: 1500,
      instrument: "piano"
    }
  },

  "extended-chords-2": {
    levelId: "extended-chords-2",
    title: "Level 2: Transcribe 11th Chords",
    description: "Listen and construct 11th chord extensions",
    chordTypes: ["maj11", "min11", "dom11"],
    inversionRules: { 
      allowInversions: false,
      requireSpecificInversion: null 
    },
    passRequirements: { 
      accuracy: 75, 
      time: 25 
    },
    totalProblems: 15,
    theme: "purple",
    difficulty: "Advanced",
    nextLevelPath: "/transcription/extended-chords/3",
    backPath: "/transcription",
    audio: {
      tempo: 90,
      noteDuration: 1500,
      instrument: "piano"
    }
  },

  "extended-chords-3": {
    levelId: "extended-chords-3",
    title: "Level 3: Transcribe 13th Chords",
    description: "Listen and construct 13th chord extensions",
    chordTypes: ["maj13", "min13", "dom13"],
    inversionRules: { 
      allowInversions: false,
      requireSpecificInversion: null 
    },
    passRequirements: { 
      accuracy: 75, 
      time: 30 
    },
    totalProblems: 15,
    theme: "purple",
    difficulty: "Advanced",
    nextLevelPath: "/transcription/extended-chords/4",
    backPath: "/transcription",
    audio: {
      tempo: 80,
      noteDuration: 1800,
      instrument: "piano"
    }
  },

  // ===== EXTENDED CHORD INVERSIONS =====
  "extended-chords-4": {
    levelId: "extended-chords-4", 
    title: "Level 4: Transcribe 9th Chord Inversions",
    description: "Listen and construct 9th chords with all inversions",
    chordTypes: ["maj9", "min9", "dom9"],
    inversionRules: { 
      allowInversions: true,
      requireSpecificInversion: null // Random inversions 
    },
    passRequirements: { 
      accuracy: 75,
      time: 30 
    },
    totalProblems: 18,
    theme: "purple",
    difficulty: "Advanced",
    nextLevelPath: "/transcription/extended-chords/5",
    backPath: "/transcription",
    audio: {
      tempo: 75,
      noteDuration: 2000,
      instrument: "piano"
    }
  },

  "extended-chords-5": {
    levelId: "extended-chords-5",
    title: "Level 5: Transcribe 11th Chord Inversions", 
    description: "Listen and construct 11th chords with all inversions",
    chordTypes: ["maj11", "min11", "dom11"],
    inversionRules: { 
      allowInversions: true,
      requireSpecificInversion: null // Random inversions
    },
    passRequirements: { 
      accuracy: 75,
      time: 32 
    },
    totalProblems: 18,
    theme: "purple",
    difficulty: "Advanced", 
    nextLevelPath: "/transcription/extended-chords/6",
    backPath: "/transcription",
    audio: {
      tempo: 75,
      noteDuration: 2000,
      instrument: "piano"
    }
  },

  "extended-chords-6": {
    levelId: "extended-chords-6",
    title: "Level 6: Transcribe 13th Chord Inversions",
    description: "Listen and construct 13th chords with all inversions", 
    chordTypes: ["maj13", "min13", "dom13"],
    inversionRules: { 
      allowInversions: true,
      requireSpecificInversion: null // Random inversions
    },
    passRequirements: { 
      accuracy: 70, // Most challenging level
      time: 35 
    },
    totalProblems: 15,
    theme: "purple", 
    difficulty: "Advanced",
    nextLevelPath: "/transcription/extended-chords/7",
    backPath: "/transcription",
    audio: {
      tempo: 70,
      noteDuration: 2200,
      instrument: "piano"
    }
  },

  "extended-chords-7": {
    levelId: "extended-chords-7",
    title: "Level 7: Transcribe All Chord Types",
    description: "Master level: All triads, sus chords, 7th chords, and extended chords with inversions", 
    chordTypes: [
      // Basic triads and sus chords
      "major", "minor", "diminished", "augmented", "sus2", "sus4", "quartal",
      // 7th chords  
      "major7", "minor7", "dominant7",
      // Extended chords
      "maj9", "min9", "dom9", "maj11", "min11", "dom11", "maj13", "min13", "dom13"
    ],
    inversionRules: { 
      allowInversions: true,
      requireSpecificInversion: null // All inversions allowed
    },
    passRequirements: { 
      accuracy: 65, // Most challenging comprehensive level
      time: 40 
    },
    totalProblems: 30,
    theme: "purple", 
    difficulty: "Expert",
    nextLevelPath: null, // Final level
    backPath: "/transcription",
    audio: {
      tempo: 65,
      noteDuration: 2500,
      instrument: "piano"
    }
  }
};

/**
 * Get configuration for a specific level
 * @param {string} levelId - The level identifier (e.g., 'basic-triads-1')
 * @returns {Object} Level configuration object
 */
export const getLevelConfig = (levelId) => {
  const config = LEVEL_CONFIGS[levelId];
  if (!config) {
    throw new Error(`Transcription level configuration not found for: ${levelId}`);
  }
  return config;
};

/**
 * Get level config by category and level number
 * @param {string} category - Category (e.g., 'basic-triads')
 * @param {string|number} level - Level number (e.g., '1' or 1)
 * @returns {Object} Level configuration object
 */
export const getLevelConfigByParams = (category, level) => {
  const levelId = `${category}-${level}`;
  return getLevelConfig(levelId);
};

/**
 * Get all available level IDs
 * @returns {string[]} Array of level identifiers
 */
export const getAllLevelIds = () => {
  return Object.keys(LEVEL_CONFIGS);
};

/**
 * Get all levels grouped by category
 * @returns {Object} Levels grouped by category
 */
export const getLevelsByCategory = () => {
  const categories = {};
  
  Object.entries(LEVEL_CONFIGS).forEach(([levelId, config]) => {
    const [category] = levelId.split('-');
    if (!categories[category]) {
      categories[category] = [];
    }
    categories[category].push({
      levelId,
      ...config
    });
  });
  
  return categories;
};

/**
 * Get category display information
 * @returns {Object} Category metadata
 */
export const getCategoryInfo = () => {
  return {
    "basic-triads": {
      title: "Basic Triads",
      description: "Major, minor, diminished, augmented, sus, and quartal chords",
      icon: "🎵",
      levels: 4,
      difficulty: "Beginner"
    },
    "seventh-chords": {
      title: "7th Chords", 
      description: "Major 7th, minor 7th, and dominant 7th chords with inversions",
      icon: "🎶",
      levels: 5,
      difficulty: "Intermediate"
    },
    "extended-chords": {
      title: "Extended Chords",
      description: "9th, 11th, and 13th chord extensions with comprehensive mastery level",
      icon: "🎼",
      levels: 7,
      difficulty: "Advanced"
    }
  };
};