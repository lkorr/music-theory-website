/**
 * Level 1 Specific Utilities for Extended Chords
 * 
 * Contains chord generation and validation logic specific to Level 1
 * (7th Chords with Inversions - natural notes only)
 */

import { generateSeventhChord, validateSeventhChordAnswer, extendedLevelConfigs } from '../../shared/chordLogic.js';
import { generateChordWithDuplicatePrevention } from '../../../basic-triads/shared/generationUtils.js';

/**
 * Generate a random 7th chord for Level 1 using shared functions
 * @param {Object} previousChord - Previous chord to avoid duplicates
 * @returns {Object} Chord object with notes, name, and expected answer
 */
export const generateLevel1Chord = (previousChord = null) => {
  return generateChordWithDuplicatePrevention(
    () => generateSeventhChord(extendedLevelConfigs.level1),
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
  return validateSeventhChordAnswer(answer, expectedAnswer, extendedLevelConfigs.level1);
};