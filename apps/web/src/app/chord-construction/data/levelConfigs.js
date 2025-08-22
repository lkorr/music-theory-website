// Universal Level Configuration System
// SINGLE SOURCE OF TRUTH for all level behavior, themes, and requirements

export const LEVEL_CONFIGS = {
  // ===== BASIC TRIADS =====
  "basic-triads-level5": {
    levelId: "basic-triads-level5",
    title: "Level 1: Build Basic Triads",
    description: "root position triads",
    chordTypes: ["major", "minor", "diminished", "augmented"],
    inversionRules: { 
      allowInversions: false,
      requireSpecificInversion: null 
    },
    passRequirements: { 
      accuracy: 85, 
      time: 10 
    },
    totalProblems: 20,
    theme: "emerald", // Theme controls ALL visual aspects
    difficulty: "Beginner",
    nextLevelPath: "/chord-construction/basic-triads/level6",
    backPath: "/chord-construction"
  },

  "basic-triads-level6": {
    levelId: "basic-triads-level6", 
    title: "Level 2: Build First Inversions",
    description: "triads with first inversion",
    chordTypes: ["major", "minor", "diminished", "augmented"],
    inversionRules: { 
      allowInversions: true,
      requireSpecificInversion: "first"
    },
    passRequirements: { 
      accuracy: 85, 
      time: 10 
    },
    totalProblems: 20,
    theme: "teal", // Different theme for visual distinction
    difficulty: "Beginner",
    nextLevelPath: "/chord-construction/seventh-chords/level1",
    backPath: "/chord-construction"
  },

  "basic-triads-level7": {
    levelId: "basic-triads-level7",
    title: "Level 3: Build All Inversions", 
    description: "root, first, and second inversions",
    chordTypes: ["major", "minor", "diminished", "augmented"],
    inversionRules: { 
      allowInversions: true,
      requireSpecificInversion: null // Allow any inversion
    },
    passRequirements: { 
      accuracy: 85, 
      time: 10 
    },
    totalProblems: 20,
    theme: "cyan", // Third theme variation
    difficulty: "Beginner",
    nextLevelPath: "/chord-construction/seventh-chords/level1",
    backPath: "/chord-construction"
  },

  // ===== SEVENTH CHORDS =====
  "seventh-chords-level1": {
    levelId: "seventh-chords-level1",
    title: "Level 1: Build 7th Chords",
    description: "root position 7th chords", 
    chordTypes: ["major7", "minor7", "dominant7"],
    inversionRules: { 
      allowInversions: false,
      requireSpecificInversion: null 
    },
    passRequirements: { 
      accuracy: 85, 
      time: 12 // Slightly more time for 7th chords
    },
    totalProblems: 20,
    theme: "emerald", // Reuse emerald for 7th chords
    difficulty: "Intermediate",
    nextLevelPath: "/chord-construction/seventh-chords/level2",
    backPath: "/chord-construction"
  },

  "seventh-chords-level2": {
    levelId: "seventh-chords-level2",
    title: "Level 2: Build First Inversions",
    description: "7th chords with first inversion",
    chordTypes: ["major7", "minor7", "dominant7"],
    inversionRules: { 
      allowInversions: true,
      requireSpecificInversion: "first" 
    },
    passRequirements: { 
      accuracy: 85, 
      time: 12 
    },
    totalProblems: 20,
    theme: "teal", // Consistent with basic triads progression
    difficulty: "Intermediate",
    nextLevelPath: "/chord-construction/seventh-chords/level3",
    backPath: "/chord-construction"
  },

  "seventh-chords-level3": {
    levelId: "seventh-chords-level3",
    title: "Level 3: Build All Inversions",
    description: "all 7th chord inversions",
    chordTypes: ["major7", "minor7", "dominant7"],
    inversionRules: { 
      allowInversions: true,
      requireSpecificInversion: null 
    },
    passRequirements: { 
      accuracy: 85, 
      time: 12 
    },
    totalProblems: 20,
    theme: "cyan", // Consistent progression theme
    difficulty: "Intermediate",
    nextLevelPath: "/chord-construction/extended-chords/level1",
    backPath: "/chord-construction"
  },

  // ===== EXTENDED/JAZZ CHORDS =====
  "extended-chords-level1": {
    levelId: "extended-chords-level1",
    title: "Level 1: Build 9th Chords",
    description: "major 9th, minor 9th, dominant 9th",
    chordTypes: ["maj9", "min9", "dom9"],
    inversionRules: { 
      allowInversions: false,
      requireSpecificInversion: null 
    },
    passRequirements: { 
      accuracy: 80, // Slightly lower for advanced chords
      time: 15 // More time for complex chords
    },
    totalProblems: 15, // Fewer problems for advanced level
    theme: "purple", // Purple for advanced/jazz chords
    difficulty: "Advanced",
    nextLevelPath: "/chord-construction/extended-chords/level2",
    backPath: "/chord-construction"
  },

  "extended-chords-level2": {
    levelId: "extended-chords-level2",
    title: "Level 2: Build 11th Chords",
    description: "major 11th, minor 11th variations",
    chordTypes: ["maj11", "min11"],
    inversionRules: { 
      allowInversions: false,
      requireSpecificInversion: null 
    },
    passRequirements: { 
      accuracy: 80, 
      time: 18 
    },
    totalProblems: 15,
    theme: "purple",
    difficulty: "Advanced",
    nextLevelPath: "/chord-construction/extended-chords/level3",
    backPath: "/chord-construction"
  },

  "extended-chords-level3": {
    levelId: "extended-chords-level3",
    title: "Level 3: Build 13th Chords",
    description: "major 13th, minor 13th variations",
    chordTypes: ["maj13", "min13"],
    inversionRules: { 
      allowInversions: false,
      requireSpecificInversion: null 
    },
    passRequirements: { 
      accuracy: 80, 
      time: 20 
    },
    totalProblems: 12,
    theme: "purple",
    difficulty: "Expert",
    nextLevelPath: null, // Final level for now
    backPath: "/chord-construction"
  },

  // Future levels can be added here...
};

// Helper function to get config by path
export function getLevelConfigByPath(path) {
  const configKey = pathToConfigKey(path);
  return LEVEL_CONFIGS[configKey] || null;
}

// Convert URL path to config key
function pathToConfigKey(path) {
  // Examples:
  // "/chord-construction/basic-triads/level5" -> "basic-triads-level5"
  // "/chord-construction/seventh-chords/level8" -> "seventh-chords-level8"
  
  const pathParts = path.split('/').filter(part => part.length > 0);
  if (pathParts.length < 3) return null;
  
  const category = pathParts[1]; // basic-triads, seventh-chords, jazz-chords
  const level = pathParts[2];    // level5, level6, etc.
  
  return `${category}-${level}`;
}

// Get all available levels
export function getAvailableLevels() {
  return Object.values(LEVEL_CONFIGS).filter(config => config.available !== false);
}

// Get levels by category
export function getLevelsByCategory(category) {
  return Object.values(LEVEL_CONFIGS).filter(config => 
    config.levelId.startsWith(category) && config.available !== false
  );
}