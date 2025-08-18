/**
 * Level 3 Specific Utilities
 * 
 * Contains chord generation and validation logic specific to Level 3
 * (Basic Triads with First and Second Inversions - natural notes only)
 */

import { noteNames, chordTypes } from '../../shared/chordLogic.js';

/**
 * Generate a random chord with first and second inversions for Level 3
 * @param {Object} previousChord - Previous chord to avoid duplicates
 * @returns {Object} Chord object with notes, name, and expected answer
 */
export const generateLevel3Chord = (previousChord = null) => {
  const roots = ['C', 'D', 'E', 'F', 'G', 'A', 'B']; // Natural notes only
  
  let root, chordType, inversion, attempt = 0;
  
  // Prevent exact same chord appearing twice in a row
  do {
    root = roots[Math.floor(Math.random() * roots.length)];
    
    // For Level 3: root position, first inversion, and second inversion
    // Exclude augmented chords from inversions
    const inversionChoice = Math.random();
    if (inversionChoice < 0.33) {
      // 33% chance of root position (any chord type)
      const chordTypeKeys = ['major', 'minor', 'diminished', 'augmented'];
      chordType = chordTypeKeys[Math.floor(Math.random() * chordTypeKeys.length)];
      inversion = 'root';
    } else if (inversionChoice < 0.67) {
      // 33% chance of first inversion (exclude augmented)
      const nonAugmentedChords = ['major', 'minor', 'diminished'];
      chordType = nonAugmentedChords[Math.floor(Math.random() * nonAugmentedChords.length)];
      inversion = 'first';
    } else {
      // 33% chance of second inversion (exclude augmented)
      const nonAugmentedChords = ['major', 'minor', 'diminished'];
      chordType = nonAugmentedChords[Math.floor(Math.random() * nonAugmentedChords.length)];
      inversion = 'second';
    }
    
    attempt++;
    
    // If we've tried many times, just accept any different combination
    if (attempt > 20) break;
    
  } while (previousChord && 
           previousChord.root === root && 
           previousChord.chordType === chordType &&
           previousChord.inversion === inversion);
  
  // Choose a random octave from 2, 3, or 4 (C2=36, C3=48, C4=60)
  const possibleOctaves = [36, 48, 60]; // C2, C3, C4
  const baseOctave = possibleOctaves[Math.floor(Math.random() * possibleOctaves.length)];
  
  // Build the chord from the chosen root and octave
  const rootNoteNumber = noteNames.indexOf(root);
  const baseRoot = rootNoteNumber + baseOctave;
  const intervals = chordTypes[chordType].intervals;
  
  // Apply inversion - create proper triad inversion orders
  const triadInversions = {
    root: [0, 1, 2],    // Root position
    first: [1, 2, 0],   // First inversion
    second: [2, 0, 1]   // Second inversion
  };
  const triadInversionOrder = triadInversions[inversion];
  const reorderedIntervals = triadInversionOrder.map(index => intervals[index]);
  
  // Create notes with proper voicing for inversion
  let notes = [];
  
  // For inversions, we need to ensure proper octave spacing
  for (let i = 0; i < reorderedIntervals.length; i++) {
    if (i === 0) {
      // First note uses the reordered interval from base root
      notes.push(baseRoot + reorderedIntervals[i]);
    } else {
      // Subsequent notes: add interval and ensure ascending order
      let nextNote = baseRoot + reorderedIntervals[i];
      // If this note would be lower than the previous note, move it up an octave
      while (nextNote <= notes[notes.length - 1]) {
        nextNote += 12;
      }
      notes.push(nextNote);
    }
  }
  
  // Ensure all notes are within C1 (24) to C6 (84) range
  const minNote = 24; // C1
  const maxNote = 84; // C6
  
  // If any note is too high, transpose the entire chord down
  while (Math.max(...notes) > maxNote) {
    notes = notes.map(note => note - 12);
  }
  
  // If any note is too low, transpose the entire chord up
  while (Math.min(...notes) < minNote) {
    notes = notes.map(note => note + 12);
  }
  
  // Create expected answer based on chord and inversion (no augmented inversions)
  let expectedAnswer = root + chordTypes[chordType].symbol;
  if (inversion === 'first') {
    expectedAnswer += '/1';
  } else if (inversion === 'second') {
    expectedAnswer += '/2';
  }
  
  return {
    root,
    chordType,
    inversion,
    notes,
    expectedAnswer,
    name: expectedAnswer, // Alias for compatibility
    intervals: reorderedIntervals
  };
};

/**
 * Validate answer for Level 3 (triads with first and second inversions)
 * @param {string} answer - User's answer
 * @param {string} expectedAnswer - Expected correct answer
 * @returns {boolean} True if answer is correct
 */
export const validateLevel3Answer = (answer, expectedAnswer) => {
  const normalizeAnswer = (str) => str.toLowerCase().replace(/\s+/g, '');
  
  const normalized = normalizeAnswer(answer);
  const expectedNormalized = normalizeAnswer(expectedAnswer);
  
  // Extract root note, chord type, and inversion from expected answer
  const parts = expectedAnswer.split('/');
  const chordPart = parts[0]; // e.g., "C", "Cm", "Cdim"
  const inversionPart = parts[1] || null; // e.g., "1", "2", or null for root
  
  const rootNote = chordPart.match(/^[A-G][#b]?/)?.[0] || '';
  const chordTypePart = chordPart.replace(rootNote, '').toLowerCase();
  
  // Generate all acceptable formats for this chord and inversion
  const acceptableAnswers = new Set();
  
  // Add the exact expected answer
  acceptableAnswers.add(expectedNormalized);
  
  // Helper function to add inversion variations
  const addInversionVariations = (baseChord) => {
    if (inversionPart === '1') {
      acceptableAnswers.add(normalizeAnswer(baseChord + '/1'));
      acceptableAnswers.add(normalizeAnswer(baseChord + '/first'));
      acceptableAnswers.add(normalizeAnswer(baseChord + ' first inversion'));
      acceptableAnswers.add(normalizeAnswer(baseChord + ' 1st inversion'));
    } else if (inversionPart === '2') {
      acceptableAnswers.add(normalizeAnswer(baseChord + '/2'));
      acceptableAnswers.add(normalizeAnswer(baseChord + '/second'));
      acceptableAnswers.add(normalizeAnswer(baseChord + ' second inversion'));
      acceptableAnswers.add(normalizeAnswer(baseChord + ' 2nd inversion'));
    } else {
      // Root position - add root position variations
      acceptableAnswers.add(normalizeAnswer(baseChord));
      acceptableAnswers.add(normalizeAnswer(baseChord + ' root'));
      acceptableAnswers.add(normalizeAnswer(baseChord + ' root position'));
    }
  };
  
  // Major chord variations
  if (chordTypePart === '' || chordTypePart === 'maj' || chordTypePart === 'major') {
    addInversionVariations(rootNote); // Just "C"
    addInversionVariations(rootNote + 'maj'); // "Cmaj"
    addInversionVariations(rootNote + 'major'); // "Cmajor"
    addInversionVariations(rootNote + 'M'); // "CM"
  }
  
  // Minor chord variations  
  else if (chordTypePart === 'm' || chordTypePart === 'min' || chordTypePart === 'minor') {
    addInversionVariations(rootNote + 'm'); // "Cm"
    addInversionVariations(rootNote + 'min'); // "Cmin"
    addInversionVariations(rootNote + 'minor'); // "Cminor"
    addInversionVariations(rootNote + '-'); // "C-"
  }
  
  // Diminished chord variations
  else if (chordTypePart === 'dim' || chordTypePart === 'diminished') {
    addInversionVariations(rootNote + 'dim'); // "Cdim"
    addInversionVariations(rootNote + 'diminished'); // "Cdiminished"
    addInversionVariations(rootNote + '°'); // "C°"
    addInversionVariations(rootNote + 'º'); // "Cº"
  }
  
  // Augmented chord variations (no inversions)
  else if (chordTypePart === 'aug' || chordTypePart === 'augmented') {
    acceptableAnswers.add(normalizeAnswer(rootNote + 'aug'));
    acceptableAnswers.add(normalizeAnswer(rootNote + 'augmented'));
    acceptableAnswers.add(normalizeAnswer(rootNote + '+'));
  }
  
  return acceptableAnswers.has(normalized);
};