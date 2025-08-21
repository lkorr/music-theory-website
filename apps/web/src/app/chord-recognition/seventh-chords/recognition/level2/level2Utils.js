/**
 * Level 2 Specific Utilities for Extended Chords
 * 
 * Contains chord generation and validation logic specific to Level 2
 * (Advanced 7th Chords with chromatic roots)
 */

import { generateSeventhChord, validateSeventhChordAnswer, extendedLevelConfigs } from '../../shared/chordLogic.js';
import { generateChordWithDuplicatePrevention } from '../../../basic-triads/shared/generationUtils.js';

/**
 * Generate a random 7th chord for Level 2 using shared functions
 * @param {Object} previousChord - Previous chord to avoid duplicates
 * @returns {Object} Chord object with notes, name, and expected answer
 */
export const generateLevel2Chord = (previousChord = null) => {
  return generateChordWithDuplicatePrevention(
    () => generateSeventhChord(extendedLevelConfigs.level2),
    previousChord
  );
};

/**
 * Validate answer for Level 2 using shared validation functions
 * @param {string} answer - User's answer
 * @param {string} expectedAnswer - Expected correct answer
 * @returns {boolean} True if answer is correct
 */
export const validateLevel2Answer = (answer, expectedAnswer) => {
  return validateSeventhChordAnswer(answer, expectedAnswer, extendedLevelConfigs.level2);
};