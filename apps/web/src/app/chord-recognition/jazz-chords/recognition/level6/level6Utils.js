/**
 * Level 6 Specific Utilities for Extended Chords
 * 
 * Contains chord generation and validation logic specific to Level 6
 * (13th Chord Inversions)
 */

import { generate13thChordWithInversions, validate13thChordAnswer, jazzLevelConfigs } from '../../shared/chordLogic.js';
import { generateChordWithDuplicatePrevention } from '../../../basic-triads/shared/generationUtils.js';

/**
 * Generate a random 13th chord with inversions for Level 6 using shared functions
 * @param {Object} previousChord - Previous chord to avoid duplicates
 * @returns {Object} Chord object with notes, name, and expected answer
 */
export const generateLevel6Chord = (previousChord = null) => {
  return generateChordWithDuplicatePrevention(
    () => generate13thChordWithInversions(jazzLevelConfigs.level6),
    previousChord
  );
};

/**
 * Validate answer for Level 6 using shared validation functions
 * @param {string} answer - User's answer
 * @param {string} expectedAnswer - Expected correct answer
 * @returns {boolean} True if answer is correct
 */
export const validateLevel6Answer = (answer, expectedAnswer) => {
  return validate13thChordAnswer(answer, expectedAnswer, jazzLevelConfigs.level6);
};