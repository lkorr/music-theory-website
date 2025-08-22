/**
 * Level 4 Specific Utilities for Jazz/Extended Chords
 * 
 * Contains chord generation and validation logic specific to Level 4
 * (13th Chords and Alterations - root position only)
 */

import { generateThirteenthChord, validateThirteenthChordAnswer, jazzLevelConfigs } from '../../shared/chordLogic.js';
import { generateChordWithDuplicatePrevention } from '../../../basic-triads/shared/generationUtils.js';

/**
 * Generate a random 13th chord for Level 4 using shared functions
 * @param {Object} previousChord - Previous chord to avoid duplicates
 * @returns {Object} Chord object with notes, name, and expected answer
 */
export const generateLevel4Chord = (previousChord = null) => {
  return generateChordWithDuplicatePrevention(
    () => generateThirteenthChord(jazzLevelConfigs.level4),
    previousChord
  );
};

/**
 * Validate answer for Level 4 using shared validation functions
 * @param {string} answer - User's answer
 * @param {string} expectedAnswer - Expected correct answer
 * @returns {boolean} True if answer is correct
 */
export const validateLevel4Answer = (answer, expectedAnswer) => {
  return validateThirteenthChordAnswer(answer, expectedAnswer, jazzLevelConfigs.level4);
};