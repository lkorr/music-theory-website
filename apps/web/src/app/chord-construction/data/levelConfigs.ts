/**
 * Consolidated Level Configuration System for Chord Construction
 * 
 * This file centralizes all 9 chord construction levels from 3 categories:
 * - Basic Triads (3 levels)
 * - Seventh Chords (3 levels) 
 * - Extended Chords (3 levels)
 * 
 * Following the chord-recognition2/transcription architecture pattern for clean, maintainable code.
 * Replaces the scattered configuration approach with unified, data-driven level management.
 */

interface ChordGeneration {
  type: string;
  roots: string[];
  chordTypes: string[];
  allowInversions: boolean;
  requireSpecificInversion: string | null;
}

export interface LevelConfig {
  id: string;
  category: string;
  level: number;
  title: string;
  description: string;
  totalProblems: number;
  passAccuracy: number;
  passTime: number;
  theme: string;
  progressColor: string;
  buttonColor: string;
  buttonHoverColor: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  chordGeneration: ChordGeneration;
  nextLevelPath: string | null;
  backPath: string;
}

export interface CategoryConfig {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  color: string;
  levels: LevelConfig[];
}

export const LEVEL_CONFIGS: Record<string, LevelConfig> = {
  // ============================================================================
  // BASIC TRIADS LEVELS (3 levels)
  // ============================================================================
  
  'basic-triads-1': {
    id: 'basic-triads-1',
    category: 'basic-triads',
    level: 1,
    title: 'Basic Triads',
    description: 'Root position triads',
    
    // Scoring criteria
    totalProblems: 20,
    passAccuracy: 85,
    passTime: 10,
    
    // Visual theme
    theme: 'emerald',
    progressColor: 'bg-emerald-500',
    buttonColor: 'bg-emerald-500',
    buttonHoverColor: 'bg-emerald-600',
    difficulty: 'Beginner',
    
    // Chord generation settings
    chordGeneration: {
      type: 'basic-triads',
      roots: ['C', 'D', 'E', 'F', 'G', 'A', 'B'], // Natural notes only for level 1
      chordTypes: ['major', 'minor', 'diminished', 'augmented'],
      allowInversions: false,
      requireSpecificInversion: null
    },
    
    // Navigation
    nextLevelPath: '/chord-construction/basic-triads/2',
    backPath: '/chord-construction'
  },

  'basic-triads-2': {
    id: 'basic-triads-2',
    category: 'basic-triads', 
    level: 2,
    title: 'Triads with First Inversions',
    description: 'Triads with first inversion',
    
    totalProblems: 20,
    passAccuracy: 85,
    passTime: 10,
    
    theme: 'teal',
    progressColor: 'bg-teal-500',
    buttonColor: 'bg-teal-500',
    buttonHoverColor: 'bg-teal-600',
    difficulty: 'Beginner',
    
    chordGeneration: {
      type: 'triads-with-inversions',
      roots: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'],
      chordTypes: ['major', 'minor', 'diminished', 'augmented'],
      allowInversions: true,
      requireSpecificInversion: 'first' // Force first inversion
    },
    
    nextLevelPath: '/chord-construction/basic-triads/3',
    backPath: '/chord-construction'
  },

  'basic-triads-3': {
    id: 'basic-triads-3',
    category: 'basic-triads',
    level: 3,
    title: 'Triads with All Inversions',
    description: 'Root, first, and second inversions',
    
    totalProblems: 20,
    passAccuracy: 85,
    passTime: 10,
    
    theme: 'cyan',
    progressColor: 'bg-cyan-500',
    buttonColor: 'bg-cyan-500',
    buttonHoverColor: 'bg-cyan-600',
    difficulty: 'Beginner',
    
    chordGeneration: {
      type: 'triads-all-inversions',
      roots: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'],
      chordTypes: ['major', 'minor', 'diminished', 'augmented'],
      allowInversions: true,
      requireSpecificInversion: null // Allow any inversion
    },
    
    nextLevelPath: '/chord-construction/basic-triads/4',
    backPath: '/chord-construction'
  },

  'basic-triads-4': {
    id: 'basic-triads-4',
    category: 'basic-triads',
    level: 4,
    title: 'Open Voicing Triads',
    description: 'Basic triads in open voicings with octave spacing',
    
    totalProblems: 20,
    passAccuracy: 75, // Easier since open voicings are challenging
    passTime: 12, // More time needed
    
    theme: 'orange',
    progressColor: 'bg-orange-500',
    buttonColor: 'bg-orange-500',
    buttonHoverColor: 'bg-orange-600',
    difficulty: 'Intermediate',
    
    chordGeneration: {
      type: 'open-voicing-triads',
      roots: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'],
      chordTypes: ['major', 'minor', 'diminished', 'augmented'],
      allowInversions: false,
      requireSpecificInversion: null
    },
    
    nextLevelPath: '/chord-construction/seventh-chords/1',
    backPath: '/chord-construction'
  },

  // ============================================================================
  // SEVENTH CHORDS LEVELS (5 levels)  
  // ============================================================================

  'seventh-chords-1': {
    id: 'seventh-chords-1',
    category: 'seventh-chords',
    level: 1,
    title: 'Basic Seventh Chords',
    description: 'Root position 7th chords',
    
    totalProblems: 20,
    passAccuracy: 85,
    passTime: 12, // Slightly more time for 7th chords
    
    theme: 'emerald',
    progressColor: 'bg-emerald-500',
    buttonColor: 'bg-emerald-500',
    buttonHoverColor: 'bg-emerald-600',
    difficulty: 'Intermediate',
    
    chordGeneration: {
      type: 'seventh-chords',
      roots: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
      chordTypes: ['major7', 'minor7', 'dominant7'],
      allowInversions: false,
      requireSpecificInversion: null
    },
    
    nextLevelPath: '/chord-construction/seventh-chords/2',
    backPath: '/chord-construction'
  },

  'seventh-chords-2': {
    id: 'seventh-chords-2',
    category: 'seventh-chords',
    level: 2,
    title: '7th Chords with First Inversions',
    description: '7th chords with first inversion',
    
    totalProblems: 20,
    passAccuracy: 85,
    passTime: 12,
    
    theme: 'teal',
    progressColor: 'bg-teal-500',
    buttonColor: 'bg-teal-500',
    buttonHoverColor: 'bg-teal-600',
    difficulty: 'Intermediate',
    
    chordGeneration: {
      type: 'seventh-chords-inversions',
      roots: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'],
      chordTypes: ['major7', 'minor7', 'dominant7'],
      allowInversions: true,
      requireSpecificInversion: 'first'
    },
    
    nextLevelPath: '/chord-construction/seventh-chords/3',
    backPath: '/chord-construction'
  },

  'seventh-chords-3': {
    id: 'seventh-chords-3',
    category: 'seventh-chords',
    level: 3,
    title: '7th Chords with Second Inversions',
    description: 'All 7th chord inversions',
    
    totalProblems: 20,
    passAccuracy: 85,
    passTime: 12,
    
    theme: 'cyan',
    progressColor: 'bg-cyan-500',
    buttonColor: 'bg-cyan-500',
    buttonHoverColor: 'bg-cyan-600',
    difficulty: 'Intermediate',
    
    chordGeneration: {
      type: 'seventh-chords-all-inversions',
      roots: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'],
      chordTypes: ['major7', 'minor7', 'dominant7'],
      allowInversions: true,
      requireSpecificInversion: null
    },
    
    nextLevelPath: '/chord-construction/seventh-chords/4',
    backPath: '/chord-construction'
  },

  'seventh-chords-4': {
    id: 'seventh-chords-4',
    category: 'seventh-chords',
    level: 4,
    title: '7th Chords with Third Inversions',
    description: '7th chords with all inversions including third inversion',
    
    totalProblems: 20,
    passAccuracy: 85,
    passTime: 12,
    
    theme: 'orange',
    progressColor: 'bg-orange-500',
    buttonColor: 'bg-orange-500',
    buttonHoverColor: 'bg-orange-600',
    difficulty: 'Intermediate',
    
    chordGeneration: {
      type: 'seventh-chords-third-inversions',
      roots: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'],
      chordTypes: ['major7', 'minor7', 'dominant7'],
      allowInversions: true,
      requireSpecificInversion: 'third' // Force third inversion
    },
    
    nextLevelPath: '/chord-construction/seventh-chords/5',
    backPath: '/chord-construction'
  },

  'seventh-chords-5': {
    id: 'seventh-chords-5',
    category: 'seventh-chords',
    level: 5,
    title: 'Open Voicing 7th Chords',
    description: '7th chords in open voicings with octave spacing',
    
    totalProblems: 15, // Fewer problems for advanced level
    passAccuracy: 75, // Lower accuracy for advanced level
    passTime: 15, // More time for complex chords
    
    theme: 'red',
    progressColor: 'bg-red-500',
    buttonColor: 'bg-red-500',
    buttonHoverColor: 'bg-red-600',
    difficulty: 'Advanced',
    
    chordGeneration: {
      type: 'seventh-chords-open-voicings',
      roots: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'],
      chordTypes: ['major7', 'minor7', 'dominant7'],
      allowInversions: false,
      requireSpecificInversion: null
    },
    
    nextLevelPath: '/chord-construction/extended-chords/1',
    backPath: '/chord-construction'
  },

  // ============================================================================
  // EXTENDED CHORDS LEVELS (6 levels)
  // ============================================================================

  'extended-chords-1': {
    id: 'extended-chords-1',
    category: 'extended-chords',
    level: 1,
    title: '9th Chords',
    description: 'Major 9th, minor 9th, dominant 9th',
    
    totalProblems: 15, // Fewer problems for advanced level
    passAccuracy: 80, // Slightly lower for advanced chords
    passTime: 15, // More time for complex chords
    
    theme: 'purple',
    progressColor: 'bg-purple-500',
    buttonColor: 'bg-purple-500',
    buttonHoverColor: 'bg-purple-600',
    difficulty: 'Advanced',
    
    chordGeneration: {
      type: 'extended-chords',
      roots: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
      chordTypes: ['maj9', 'min9', 'dom9'],
      allowInversions: false,
      requireSpecificInversion: null
    },
    
    nextLevelPath: '/chord-construction/extended-chords/2',
    backPath: '/chord-construction'
  },

  'extended-chords-2': {
    id: 'extended-chords-2',
    category: 'extended-chords',
    level: 2,
    title: '11th Chords',
    description: 'Major 11th, minor 11th variations',
    
    totalProblems: 15,
    passAccuracy: 80,
    passTime: 18,
    
    theme: 'purple',
    progressColor: 'bg-purple-500',
    buttonColor: 'bg-purple-500',
    buttonHoverColor: 'bg-purple-600',
    difficulty: 'Advanced',
    
    chordGeneration: {
      type: 'extended-chords-11th',
      roots: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
      chordTypes: ['maj11', 'min11'],
      allowInversions: false,
      requireSpecificInversion: null
    },
    
    nextLevelPath: '/chord-construction/extended-chords/3',
    backPath: '/chord-construction'
  },

  'extended-chords-3': {
    id: 'extended-chords-3',
    category: 'extended-chords',
    level: 3,
    title: '13th Chords',
    description: 'Major 13th, minor 13th variations',
    
    totalProblems: 12, // Even fewer for most advanced
    passAccuracy: 80,
    passTime: 20,
    
    theme: 'purple',
    progressColor: 'bg-purple-500',
    buttonColor: 'bg-purple-500',
    buttonHoverColor: 'bg-purple-600',
    difficulty: 'Expert',
    
    chordGeneration: {
      type: 'extended-chords-13th',
      roots: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
      chordTypes: ['maj13', 'min13'],
      allowInversions: false,
      requireSpecificInversion: null
    },
    
    nextLevelPath: '/chord-construction/extended-chords/4',
    backPath: '/chord-construction'
  },

  'extended-chords-4': {
    id: 'extended-chords-4',
    category: 'extended-chords',
    level: 4,
    title: '9th Chord Inversions',
    description: 'All inversions of 9th chords (root, 1st, 2nd, 3rd, 4th)',
    
    totalProblems: 15,
    passAccuracy: 75, // Lower for advanced inversions
    passTime: 20,
    
    theme: 'purple',
    progressColor: 'bg-purple-600',
    buttonColor: 'bg-purple-600',
    buttonHoverColor: 'bg-purple-700',
    difficulty: 'Expert',
    
    chordGeneration: {
      type: 'ninth-chord-inversions',
      roots: ['C', 'D', 'E', 'F', 'G', 'A', 'B'], // Natural notes for complex inversions
      chordTypes: ['maj9', 'min9', 'dom9'],
      allowInversions: true,
      requireSpecificInversion: null // Allow any inversion
    },
    
    nextLevelPath: '/chord-construction/extended-chords/5',
    backPath: '/chord-construction'
  },

  'extended-chords-5': {
    id: 'extended-chords-5',
    category: 'extended-chords',
    level: 5,
    title: '11th Chord Inversions',
    description: '11th chords with inversions - advanced harmony',
    
    totalProblems: 12,
    passAccuracy: 70,
    passTime: 25,
    
    theme: 'indigo',
    progressColor: 'bg-indigo-600',
    buttonColor: 'bg-indigo-600',
    buttonHoverColor: 'bg-indigo-700',
    difficulty: 'Expert',
    
    chordGeneration: {
      type: 'eleventh-chord-inversions',
      roots: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
      chordTypes: ['maj11', 'min11', 'dom11'],
      allowInversions: true,
      requireSpecificInversion: null
    },
    
    nextLevelPath: '/chord-construction/extended-chords/6',
    backPath: '/chord-construction'
  },

  'extended-chords-6': {
    id: 'extended-chords-6',
    category: 'extended-chords',
    level: 6,
    title: '13th Chord Inversions',
    description: '13th chords with inversions - master level harmony',
    
    totalProblems: 10,
    passAccuracy: 70,
    passTime: 30,
    
    theme: 'pink',
    progressColor: 'bg-pink-600',
    buttonColor: 'bg-pink-600',
    buttonHoverColor: 'bg-pink-700',
    difficulty: 'Expert',
    
    chordGeneration: {
      type: 'thirteenth-chord-inversions',
      roots: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
      chordTypes: ['maj13', 'min13', 'dom13'],
      allowInversions: true,
      requireSpecificInversion: null
    },
    
    nextLevelPath: null, // Final level
    backPath: '/chord-construction'
  }
};

/**
 * Helper function to get level configuration by URL parameters
 * @param category - The category from URL (basic-triads, seventh-chords, extended-chords)
 * @param level - The level number from URL (1, 2, 3)
 * @returns Level configuration object or null if not found
 */
export function getLevelConfigByParams(category: string, level: string | number): LevelConfig | null {
  const configKey = `${category}-${level}`;
  return LEVEL_CONFIGS[configKey] || null;
}

/**
 * Get all levels for a specific category
 * @param category - The category name
 * @returns Array of level configurations
 */
export function getLevelsByCategory(category: string): LevelConfig[] {
  return Object.values(LEVEL_CONFIGS)
    .filter(config => config.category === category)
    .sort((a, b) => a.level - b.level);
}

/**
 * Get next level configuration
 * @param currentCategory - Current category
 * @param currentLevel - Current level number
 * @returns Next level configuration or null if no next level
 */
export function getNextLevel(currentCategory: string, currentLevel: number): LevelConfig | null {
  // First try next level in same category
  const nextInCategory = getLevelConfigByParams(currentCategory, currentLevel + 1);
  if (nextInCategory) return nextInCategory;

  // If no next level in category, try first level of next category
  const categoryOrder = ['basic-triads', 'seventh-chords', 'extended-chords'];
  const currentCategoryIndex = categoryOrder.indexOf(currentCategory);
  
  if (currentCategoryIndex < categoryOrder.length - 1) {
    const nextCategory = categoryOrder[currentCategoryIndex + 1];
    return getLevelConfigByParams(nextCategory, 1);
  }
  
  return null; // No next level
}

/**
 * Get all available categories with their level counts
 * @returns Array of category information
 */
export function getCategories(): CategoryConfig[] {
  return [
    {
      id: 'basic-triads',
      title: 'Basic Triads',
      description: 'Learn to build major, minor, diminished, and augmented triads',
      difficulty: 'Beginner',
      color: 'bg-green-500',
      levels: getLevelsByCategory('basic-triads')
    },
    {
      id: 'seventh-chords',
      title: 'Seventh Chords',
      description: 'Build 7th chords including major 7th, minor 7th, dominant 7th',
      difficulty: 'Intermediate', 
      color: 'bg-blue-500',
      levels: getLevelsByCategory('seventh-chords')
    },
    {
      id: 'extended-chords',
      title: 'Extended Chords',
      description: '9th, 11th, and 13th chords with advanced extensions',
      difficulty: 'Advanced',
      color: 'bg-purple-500', 
      levels: getLevelsByCategory('extended-chords')
    }
  ];
}