/**
 * Level 1 Specific Utilities
 * 
 * Contains chord generation and validation logic specific to Level 1
 * (Basic Triads - no inversions, natural notes only)
 */

import { noteNames, chordTypes, generateChord, validateAnswer, levelConfigs } from '../../shared/chordLogic.js';
import { normalizeAnswer, extractRootNote, generateChordTypeVariations, checkEnharmonicEquivalents } from '../../shared/validationUtils.js';
import { clampNotesToRange, generateChordWithDuplicatePrevention, getIntervalsForChordType, getSymbolForChordType } from '../../shared/generationUtils.js';

/**
 * Generate a random basic triad chord for Level 1 using shared functions
 * @param {Object} previousChord - Previous chord to avoid duplicates
 * @returns {Object} Chord object with notes, name, and expected answer
 */
export const generateLevel1Chord = (previousChord = null) => {
  return generateChordWithDuplicatePrevention(
    () => generateChord(levelConfigs.level1),
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
  return validateAnswer(answer, expectedAnswer, levelConfigs.level1);
};

