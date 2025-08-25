/**
 * Level 1 Utilities for Chord Progressions
 * Handles level-specific logic while using shared progression utilities
 */

import { 
  keySignatures, 
  commonProgressions, 
  generateProgression as generateProgressionBase,
  validateProgressionAnswer 
} from '../shared/progressionLogic';

// Type definitions
export interface ChordProgression {
  key: string;
  chords: number[][];
  progression: any[];
  answer: string;
  expectedAnswer: string;
  romanNumerals: string[];
  name: string;
}

export interface LevelConfig {
  title: string;
  description: string;
  keys: string[];
  totalProblems: number;
  passAccuracy: number;
  passTime: number;
  autoAdvance: {
    correctDelay: number;
    incorrectDelay: number;
  };
  buttonColor: string;
  buttonHoverColor: string;
}

// Level 1 uses only C major and A minor
const LEVEL_1_KEYS: string[] = ['C', 'Am'];

/**
 * Generate a chord progression for level 1
 * @returns Chord progression data
 */
export const generateLevel1Progression = (): ChordProgression => {
  // Select a random key from level 1 keys
  const key = LEVEL_1_KEYS[Math.floor(Math.random() * LEVEL_1_KEYS.length)];
  
  // Generate the progression
  const progressionData = generateProgressionBase(key);
  
  // Format for compatibility with existing code
  return {
    key,
    chords: progressionData.chords,
    progression: progressionData.progression,
    answer: progressionData.answer,
    expectedAnswer: progressionData.answer,
    romanNumerals: progressionData.romanNumerals,
    name: progressionData.answer // Alias for compatibility
  };
};

/**
 * Validate a level 1 answer
 * @param userAnswer - User's answer
 * @param expectedAnswer - Expected answer
 * @returns True if correct
 */
export const validateLevel1Answer = (userAnswer: string, expectedAnswer: string): boolean => {
  return validateProgressionAnswer(userAnswer, expectedAnswer);
};

// Export level 1 configuration
export const level1Config: LevelConfig = {
  title: 'Level 1: Basic Progressions',
  description: 'Identify Roman numeral progressions in C major and A minor',
  keys: LEVEL_1_KEYS,
  totalProblems: 20,
  passAccuracy: 85,
  passTime: 10,
  autoAdvance: {
    correctDelay: 1000,
    incorrectDelay: 4000
  },
  buttonColor: 'bg-green-600',
  buttonHoverColor: 'bg-green-700'
};