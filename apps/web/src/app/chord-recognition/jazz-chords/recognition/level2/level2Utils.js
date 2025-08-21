/**
 * Level 2 Specific Utilities for Jazz/Extended Chords
 * 
 * Contains chord generation and validation logic specific to Level 2
 * (9th Chord Inversions - all 5 inversions)
 */

import { generateNinthChord, validateNinthChordAnswer, jazzLevelConfigs } from '../../shared/chordLogic.js';
import { generateChordWithDuplicatePrevention } from '../../../basic-triads/shared/generationUtils.js';

/**
 * Generate a random 9th chord with inversion for Level 2 using shared functions
 * @param {Object} previousChord - Previous chord to avoid duplicates
 * @returns {Object} Chord object with notes, name, and expected answer
 */
export const generateLevel2Chord = (previousChord = null) => {
  return generateChordWithDuplicatePrevention(
    () => generateNinthChord(jazzLevelConfigs.level2),
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
  return validateNinthChordAnswer(answer, expectedAnswer, jazzLevelConfigs.level2);
};