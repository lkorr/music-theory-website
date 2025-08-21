/**
 * Level 1 Specific Utilities for Jazz/Extended Chords
 * 
 * Contains chord generation and validation logic specific to Level 1
 * (9th Chords - root position only)
 */

import { generateNinthChord, validateNinthChordAnswer, jazzLevelConfigs } from '../../shared/chordLogic.js';
import { generateChordWithDuplicatePrevention } from '../../../basic-triads/shared/generationUtils.js';

/**
 * Generate a random 9th chord for Level 1 using shared functions
 * @param {Object} previousChord - Previous chord to avoid duplicates
 * @returns {Object} Chord object with notes, name, and expected answer
 */
export const generateLevel1Chord = (previousChord = null) => {
  return generateChordWithDuplicatePrevention(
    () => generateNinthChord(jazzLevelConfigs.level1),
    previousChord
  );
};

/**
 * Validate answer for Level 1 using shared validation functions
 * @param {string} answer - User's answer
 * @param {string} expectedAnswer - Expected correct answer
 * @returns {boolean} True if answer is correct
 */
export const validateLevel1Answer = (answer, expectedAnswer) => {
  return validateNinthChordAnswer(answer, expectedAnswer, jazzLevelConfigs.level1);
};