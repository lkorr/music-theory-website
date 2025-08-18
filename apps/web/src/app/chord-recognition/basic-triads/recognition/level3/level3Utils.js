/**
 * Level 3 Specific Utilities
 * 
 * Contains chord generation and validation logic specific to Level 3
 * (Basic Triads with First and Second Inversions - natural notes only)
 */

import { noteNames, chordTypes, generateChord, validateAnswer, levelConfigs } from '../../shared/chordLogic.js';
import { generateChordWithDuplicatePrevention } from '../../shared/generationUtils.js';

/**
 * Generate a random chord with first and second inversions for Level 3
 * @param {Object} previousChord - Previous chord to avoid duplicates
 * @returns {Object} Chord object with notes, name, and expected answer
 */
/**
 * Generate a random chord with all inversions for Level 3 using shared functions
 * @param {Object} previousChord - Previous chord to avoid duplicates
 * @returns {Object} Chord object with notes, name, and expected answer
 */
export const generateLevel3Chord = (previousChord = null) => {
  return generateChordWithDuplicatePrevention(
    () => generateChord(levelConfigs.level3),
    previousChord
  );
};


/**
 * Validate answer for Level 3 (triads with first and second inversions)
 * @param {string} answer - User's answer
 * @param {string} expectedAnswer - Expected correct answer
 * @returns {boolean} True if answer is correct
 */
/**
 * Validate answer for Level 3 using shared validation functions
 * @param {string} answer - User's answer
 * @param {string} expectedAnswer - Expected correct answer
 * @returns {boolean} True if answer is correct
 */
export const validateLevel3Answer = (answer, expectedAnswer) => {
  return validateAnswer(answer, expectedAnswer, levelConfigs.level3);
};

