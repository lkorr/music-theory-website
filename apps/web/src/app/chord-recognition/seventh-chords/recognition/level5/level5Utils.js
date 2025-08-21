/**
 * Level 5 Utilities: Open Voicing 7th Chords
 * 
 * Level-specific chord generation and validation logic for open voicings
 */

import { 
  generateSeventhChord, 
  validateSeventhChordAnswer, 
  generateChordWithDuplicatePrevention 
} from '../../shared/chordLogic.js';
import { getLevelConfig } from '../../shared/config/levelConfigs.js';

/**
 * Generate a Level 5 chord (7th chords in open voicings)
 * @param {Object} previousChord - Previous chord to avoid duplicates
 * @returns {Object} Generated chord object
 */
export const generateLevel5Chord = (previousChord = null) => {
  return generateChordWithDuplicatePrevention(
    () => generateSeventhChord(getLevelConfig('level5')),
    previousChord
  );
};

/**
 * Validate a Level 5 answer (open voicings don't use inversion notation)
 * @param {string} answer - User's answer
 * @param {string} expectedAnswer - Expected correct answer
 * @returns {boolean} True if answer is correct
 */
export const validateLevel5Answer = (answer, expectedAnswer) => {
  return validateSeventhChordAnswer(answer, expectedAnswer, getLevelConfig('level5'));
};