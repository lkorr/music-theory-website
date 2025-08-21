/**
 * Level 4 Utilities: 7th Chords with All Inversions
 * 
 * Level-specific chord generation and validation logic
 */

import { 
  generateSeventhChord, 
  validateSeventhChordAnswer, 
  generateChordWithDuplicatePrevention 
} from '../../shared/chordLogic.js';
import { getLevelConfig } from '../../shared/config/levelConfigs.js';

/**
 * Generate a Level 4 chord (7th chords with all inversions)
 * @param {Object} previousChord - Previous chord to avoid duplicates
 * @returns {Object} Generated chord object
 */
export const generateLevel4Chord = (previousChord = null) => {
  return generateChordWithDuplicatePrevention(
    () => generateSeventhChord(getLevelConfig('level4')),
    previousChord
  );
};

/**
 * Validate a Level 4 answer
 * @param {string} answer - User's answer
 * @param {string} expectedAnswer - Expected correct answer
 * @returns {boolean} True if answer is correct
 */
export const validateLevel4Answer = (answer, expectedAnswer) => {
  return validateSeventhChordAnswer(answer, expectedAnswer, getLevelConfig('level4'));
};