/**
 * Level 1 Specific Utilities
 * 
 * Contains chord generation and validation logic specific to Level 1
 * (Basic Triads - no inversions, natural notes only)
 */

import { noteNames, chordTypes } from '../../shared/chordLogic.js';

/**
 * Generate a random basic triad chord for Level 1
 * @param {Object} previousChord - Previous chord to avoid duplicates
 * @returns {Object} Chord object with notes, name, and expected answer
 */
export const generateLevel1Chord = (previousChord = null) => {
  const roots = ['C', 'D', 'E', 'F', 'G', 'A', 'B']; // Natural notes only
  const chordTypeKeys = ['major', 'minor', 'diminished', 'augmented'];
  
  let root, chordType, attempt = 0;
  
  // Prevent exact same chord appearing twice in a row
  do {
    root = roots[Math.floor(Math.random() * roots.length)];
    chordType = chordTypeKeys[Math.floor(Math.random() * chordTypeKeys.length)];
    attempt++;
    
    // If we've tried many times, just accept any different combination
    if (attempt > 20) break;
    
  } while (previousChord && 
           previousChord.root === root && 
           previousChord.chordType === chordType);
  
  const chord = chordTypes[chordType];
  const rootMidi = noteNames.indexOf(root) + 60; // C4 = 60
  
  const notes = chord.intervals.map(interval => rootMidi + interval);
  
  let expectedAnswer;
  switch (chordType) {
    case 'major':
      expectedAnswer = root;
      break;
    case 'minor':
      expectedAnswer = root + 'm';
      break;
    case 'diminished':
      expectedAnswer = root + 'dim';
      break;
    case 'augmented':
      expectedAnswer = root + 'aug';
      break;
    default:
      expectedAnswer = root;
  }
  
  return {
    root,
    chordType,
    notes,
    expectedAnswer,
    name: expectedAnswer // Alias for compatibility
  };
};

/**
 * Validate answer for Level 1 (basic triads only, no inversions)
 * @param {string} answer - User's answer
 * @param {string} expectedAnswer - Expected correct answer
 * @returns {boolean} True if answer is correct
 */
export const validateLevel1Answer = (answer, expectedAnswer) => {
  const normalizeAnswer = (str) => str.toLowerCase().replace(/\s+/g, '');
  
  const normalized = normalizeAnswer(answer);
  const expectedNormalized = normalizeAnswer(expectedAnswer);
  
  // Extract root note and chord type from expected answer
  const rootNote = expectedAnswer.match(/^[A-G][#b]?/)?.[0] || '';
  const chordTypePart = expectedAnswer.replace(rootNote, '').toLowerCase();
  
  // Create set of acceptable answer variations
  const acceptableAnswers = new Set([expectedNormalized]);
  
  // Add variations based on chord type
  if (chordTypePart === 'm') {
    // Minor variations
    acceptableAnswers.add(normalizeAnswer(rootNote + 'minor'));
    acceptableAnswers.add(normalizeAnswer(rootNote + 'min'));
    acceptableAnswers.add(normalizeAnswer(rootNote + '-'));
  } else if (chordTypePart === 'dim') {
    // Diminished variations
    acceptableAnswers.add(normalizeAnswer(rootNote + 'diminished'));
    acceptableAnswers.add(normalizeAnswer(rootNote + 'º'));
    acceptableAnswers.add(normalizeAnswer(rootNote + '°'));
  } else if (chordTypePart === 'aug') {
    // Augmented variations
    acceptableAnswers.add(normalizeAnswer(rootNote + 'augmented'));
    acceptableAnswers.add(normalizeAnswer(rootNote + '+'));
  } else {
    // Major variations (when expected is just the root note)
    acceptableAnswers.add(normalizeAnswer(rootNote + 'major'));
    acceptableAnswers.add(normalizeAnswer(rootNote + 'maj'));
    acceptableAnswers.add(normalizeAnswer(rootNote + 'M'));
  }
  
  return acceptableAnswers.has(normalized);
};