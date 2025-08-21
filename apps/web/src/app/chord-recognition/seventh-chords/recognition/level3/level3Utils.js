/**
 * Level 3 Utilities: 7th Chords with First and Second Inversions
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
 * Generate a Level 3 chord (7th chords with up to 2nd inversions)
 * @param {Object} previousChord - Previous chord to avoid duplicates
 * @returns {Object} Generated chord object
 */
export const generateLevel3Chord = (previousChord = null) => {
  return generateChordWithDuplicatePrevention(
    () => generateSeventhChord(getLevelConfig('level3')),
    previousChord
  );
};

/**
 * Validate a Level 3 answer
 * @param {string} answer - User's answer
 * @param {string} expectedAnswer - Expected correct answer
 * @returns {boolean} True if answer is correct
 */
export const validateLevel3Answer = (answer, expectedAnswer) => {
  return validateSeventhChordAnswer(answer, expectedAnswer, getLevelConfig('level3'));
};