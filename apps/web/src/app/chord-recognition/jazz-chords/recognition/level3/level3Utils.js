/**
 * Level 3 Specific Utilities for Jazz/Extended Chords
 * 
 * Contains chord generation and validation logic specific to Level 3
 * (11th Chords and Suspended Chords - root position only)
 */

import { generateEleventhChord, validateEleventhChordAnswer, jazzLevelConfigs } from '../../shared/chordLogic.js';
import { generateChordWithDuplicatePrevention } from '../../../basic-triads/shared/generationUtils.js';

/**
 * Generate a random 11th chord for Level 3 using shared functions
 * @param {Object} previousChord - Previous chord to avoid duplicates
 * @returns {Object} Chord object with notes, name, and expected answer
 */
export const generateLevel3Chord = (previousChord = null) => {
  return generateChordWithDuplicatePrevention(
    () => generateEleventhChord(jazzLevelConfigs.level3),
    previousChord
  );
};

/**
 * Validate answer for Level 3 using shared validation functions
 * @param {string} answer - User's answer
 * @param {string} expectedAnswer - Expected correct answer
 * @returns {boolean} True if answer is correct
 */
export const validateLevel3Answer = (answer, expectedAnswer) => {
  return validateEleventhChordAnswer(answer, expectedAnswer, jazzLevelConfigs.level3);
};