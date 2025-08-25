/**
 * Universal Chord Validation System
 * 
 * This module provides universal answer validation for all chord types and levels
 * based on configuration objects, supporting multiple answer formats and notations.
 */

import { 
  chordTypes, 
  seventhChordTypes, 
  extendedChordTypes,
  REQUIRE_INVERSION_LABELING 
} from './core/constants.js';

import { 
  normalizeNoteName, 
  getEnharmonicEquivalent 
} from './core/notes.js';

/**
 * Validate user answer against expected answer based on level configuration
 * @param {string} answer - User's answer
 * @param {string} expectedAnswer - Expected correct answer
 * @param {Object} config - Level configuration
 * @returns {boolean} True if answer is correct
 */
export const validateAnswer = (answer, expectedAnswer, config) => {
  const { validation } = config;
  
  // Normalize both answers
  const normalizedAnswer = normalizeAnswer(answer);
  const normalizedExpected = normalizeAnswer(expectedAnswer);
  
  // Direct match check first
  if (normalizedAnswer === normalizedExpected) {
    return true;
  }
  
  // Parse expected answer
  const expectedParts = parseChordString(expectedAnswer);
  if (!expectedParts) return false;
  
  const { root: expectedRoot, chordType: expectedChordType, inversion: expectedInversion } = expectedParts;
  
  // Generate all acceptable variations
  const acceptableAnswers = generateAcceptableAnswers(
    expectedRoot,
    expectedChordType, 
    expectedInversion,
    validation
  );
  
  return acceptableAnswers.has(normalizedAnswer);
};

/**
 * Normalize answer by converting to lowercase and removing whitespace
 * @param {string} str - Input string to normalize
 * @returns {string} Normalized string
 */
function normalizeAnswer(str) {
  return str.toLowerCase().replace(/\s+/g, '').trim();
}

/**
 * Parse chord string to extract components
 * @param {string} chordString - Chord string to parse (e.g., "Cmaj7", "Dm/F")
 * @returns {Object|null} Object with root, chordType, and inversion properties
 */
function parseChordString(chordString) {
  // Match patterns: Root + ChordType + Optional Inversion
  const match = chordString.match(/^([A-G][#b]?)(.*)$/);
  if (!match) return null;
  
  const [, root, remainder] = match;
  
  // Check for slash chord notation (e.g., "C/E", "Dm/A")
  const slashMatch = remainder.match(/^(.*)\/([A-G][#b]?|\d+)$/);
  if (slashMatch) {
    const [, chordTypePart, inversionPart] = slashMatch;
    return {
      root: root,
      chordType: chordTypePart || '',
      inversion: inversionPart
    };
  }
  
  // Check for numbered inversion (e.g., "C/1", "Dm/2")
  const numberedMatch = remainder.match(/^(.*)\/(\d+)$/);
  if (numberedMatch) {
    const [, chordTypePart, inversionNum] = numberedMatch;
    return {
      root: root,
      chordType: chordTypePart || '',
      inversion: inversionNum
    };
  }
  
  // No inversion notation
  return {
    root: root,
    chordType: remainder || '',
    inversion: null
  };
}

/**
 * Generate all acceptable answer variations
 * @param {string} rootNote - Root note (e.g., "C", "F#")
 * @param {string} chordTypePart - Chord type part (e.g., "", "m", "maj7")
 * @param {string|null} inversionPart - Inversion part or null
 * @param {Object} validation - Validation configuration
 * @returns {Set<string>} Set of acceptable normalized answers
 */
function generateAcceptableAnswers(rootNote, chordTypePart, inversionPart, validation) {
  const acceptableAnswers = new Set();
  
  // Generate root note variations (handle enharmonics)
  const rootVariations = [rootNote];
  const enharmonic = getEnharmonicEquivalent(rootNote);
  if (enharmonic) {
    rootVariations.push(enharmonic);
  }
  
  // Generate chord type variations for each root
  for (const root of rootVariations) {
    const chordVariations = generateChordTypeVariations(root, chordTypePart);
    
    for (const baseChord of chordVariations) {
      // Add base chord (always acceptable)
      acceptableAnswers.add(baseChord);
      
      // Add inversion variations if supported
      if (validation.supportsInversions && inversionPart) {
        addInversionVariations(
          acceptableAnswers, 
          baseChord, 
          inversionPart, 
          root, 
          chordTypePart,
          validation.requireInversionLabeling || REQUIRE_INVERSION_LABELING
        );
      }
    }
  }
  
  return acceptableAnswers;
}

/**
 * Generate chord type variations for a given root and chord type
 * @param {string} rootNote - Root note
 * @param {string} chordTypePart - Chord type part
 * @returns {Set<string>} Set of chord variations
 */
function generateChordTypeVariations(rootNote, chordTypePart) {
  const variations = new Set();
  const normalized = normalizeAnswer(chordTypePart);
  
  // Find matching chord type from our constants
  const allTypes = { ...chordTypes, ...seventhChordTypes, ...extendedChordTypes };
  
  for (const [key, chordData] of Object.entries(allTypes)) {
    if (normalizeAnswer(chordData.symbol) === normalized) {
      // Add all abbreviations for this chord type
      for (const abbrev of chordData.abbreviations || [chordData.symbol]) {
        variations.add(normalizeAnswer(rootNote + abbrev));
      }
      break;
    }
  }
  
  // If no match found, add the original
  if (variations.size === 0) {
    variations.add(normalizeAnswer(rootNote + chordTypePart));
  }
  
  return variations;
}

/**
 * Add inversion variations to acceptable answers
 * @param {Set<string>} acceptableAnswers - Set to add variations to
 * @param {string} baseChord - Base chord string
 * @param {string} inversionPart - Inversion identifier
 * @param {string} rootNote - Root note
 * @param {string} chordTypePart - Chord type part
 * @param {boolean} requireInversionLabeling - Whether inversion labeling is required
 */
function addInversionVariations(acceptableAnswers, baseChord, inversionPart, rootNote, chordTypePart, requireInversionLabeling) {
  // If inversion labeling is not required, base chord is always acceptable
  if (!requireInversionLabeling) {
    return; // Base chord already added
  }
  
  // Handle different inversion notations
  if (inversionPart === '1' || inversionPart === 'first') {
    acceptableAnswers.add(normalizeAnswer(baseChord + '/1'));
    acceptableAnswers.add(normalizeAnswer(baseChord + '/first'));
    acceptableAnswers.add(normalizeAnswer(baseChord + ' first inversion'));
    acceptableAnswers.add(normalizeAnswer(baseChord + ' 1st inversion'));
    
    // Add slash chord notation
    const bassNote = getBassNoteForInversion(rootNote, chordTypePart, '1');
    if (bassNote) {
      acceptableAnswers.add(normalizeAnswer(baseChord + '/' + bassNote));
    }
  }
  
  else if (inversionPart === '2' || inversionPart === 'second') {
    acceptableAnswers.add(normalizeAnswer(baseChord + '/2'));
    acceptableAnswers.add(normalizeAnswer(baseChord + '/second'));
    acceptableAnswers.add(normalizeAnswer(baseChord + ' second inversion'));
    acceptableAnswers.add(normalizeAnswer(baseChord + ' 2nd inversion'));
    
    const bassNote = getBassNoteForInversion(rootNote, chordTypePart, '2');
    if (bassNote) {
      acceptableAnswers.add(normalizeAnswer(baseChord + '/' + bassNote));
    }
  }
  
  else if (inversionPart === '3' || inversionPart === 'third') {
    acceptableAnswers.add(normalizeAnswer(baseChord + '/3'));
    acceptableAnswers.add(normalizeAnswer(baseChord + '/third'));
    acceptableAnswers.add(normalizeAnswer(baseChord + ' third inversion'));
    acceptableAnswers.add(normalizeAnswer(baseChord + ' 3rd inversion'));
    
    const bassNote = getBassNoteForInversion(rootNote, chordTypePart, '3');
    if (bassNote) {
      acceptableAnswers.add(normalizeAnswer(baseChord + '/' + bassNote));
    }
  }
  
  else if (inversionPart === '4' || inversionPart === 'fourth') {
    acceptableAnswers.add(normalizeAnswer(baseChord + '/4'));
    acceptableAnswers.add(normalizeAnswer(baseChord + '/fourth'));
    acceptableAnswers.add(normalizeAnswer(baseChord + ' fourth inversion'));
    acceptableAnswers.add(normalizeAnswer(baseChord + ' 4th inversion'));
    
    const bassNote = getBassNoteForInversion(rootNote, chordTypePart, '4');
    if (bassNote) {
      acceptableAnswers.add(normalizeAnswer(baseChord + '/' + bassNote));
    }
  }
  
  else {
    // Root position variations
    acceptableAnswers.add(normalizeAnswer(baseChord + ' root'));
    acceptableAnswers.add(normalizeAnswer(baseChord + ' root position'));
  }
}

/**
 * Calculate bass note for chord inversion
 * @param {string} rootNote - Root note
 * @param {string} chordTypePart - Chord type
 * @param {string} inversionNum - Inversion number ("1", "2", "3", "4")
 * @returns {string|null} Bass note or null if cannot determine
 */
function getBassNoteForInversion(rootNote, chordTypePart, inversionNum) {
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  
  // Find chord type and get intervals
  const allTypes = { ...chordTypes, ...seventhChordTypes, ...extendedChordTypes };
  let intervals = [0, 4, 7]; // Default major triad
  
  const normalized = normalizeAnswer(chordTypePart);
  for (const [key, chordData] of Object.entries(allTypes)) {
    if (normalizeAnswer(chordData.symbol) === normalized) {
      intervals = chordData.intervals;
      break;
    }
  }
  
  const rootIndex = noteNames.indexOf(rootNote);
  if (rootIndex === -1) return null;
  
  const inversionIndex = parseInt(inversionNum, 10);
  if (inversionIndex <= 0 || inversionIndex >= intervals.length) return null;
  
  // Calculate bass note (the interval that's now in the bass)
  const bassInterval = intervals[inversionIndex];
  const bassNoteIndex = (rootIndex + bassInterval) % 12;
  
  return noteNames[bassNoteIndex];
}