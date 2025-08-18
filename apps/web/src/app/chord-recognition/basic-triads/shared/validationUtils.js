/**
 * Shared validation utilities for chord recognition
 * 
 * Contains common validation logic extracted from level-specific files
 * to eliminate code duplication across all levels.
 */

/**
 * Normalize answer by converting to lowercase and removing whitespace
 * @param {string} str - Input string to normalize
 * @returns {string} Normalized string
 */
export const normalizeAnswer = (str) => str.toLowerCase().replace(/\s+/g, '');

/**
 * Extract root note from chord string (e.g., "C#maj7" -> "C#")
 * @param {string} chordString - Chord string to parse
 * @returns {string} Root note (e.g., "C", "F#", "Bb")
 */
export const extractRootNote = (chordString) => {
  return chordString.match(/^[A-G][#b]?/)?.[0] || '';
};

/**
 * Generate all acceptable chord type variations for a given root and chord type
 * @param {string} rootNote - Root note (e.g., "C", "F#")
 * @param {string} chordTypePart - Chord type from answer (e.g., "", "m", "dim", "aug")
 * @returns {Set<string>} Set of all acceptable normalized variations
 */
export const generateChordTypeVariations = (rootNote, chordTypePart) => {
  const acceptableAnswers = new Set();
  
  // Major chord variations
  if (chordTypePart === '' || chordTypePart === 'maj' || chordTypePart === 'major') {
    acceptableAnswers.add(normalizeAnswer(rootNote)); // Just "C"
    acceptableAnswers.add(normalizeAnswer(rootNote + 'maj')); // "Cmaj"
    acceptableAnswers.add(normalizeAnswer(rootNote + 'major')); // "Cmajor"
    acceptableAnswers.add(normalizeAnswer(rootNote + 'M')); // "CM"
  }
  
  // Minor chord variations
  else if (chordTypePart === 'm' || chordTypePart === 'min' || chordTypePart === 'minor') {
    acceptableAnswers.add(normalizeAnswer(rootNote + 'm'));
    acceptableAnswers.add(normalizeAnswer(rootNote + 'min'));
    acceptableAnswers.add(normalizeAnswer(rootNote + 'minor'));
    acceptableAnswers.add(normalizeAnswer(rootNote + '-'));
  }
  
  // Diminished chord variations
  else if (chordTypePart === 'dim' || chordTypePart === 'diminished') {
    acceptableAnswers.add(normalizeAnswer(rootNote + 'dim'));
    acceptableAnswers.add(normalizeAnswer(rootNote + 'diminished'));
    acceptableAnswers.add(normalizeAnswer(rootNote + '°'));
    acceptableAnswers.add(normalizeAnswer(rootNote + 'º'));
  }
  
  // Augmented chord variations
  else if (chordTypePart === 'aug' || chordTypePart === 'augmented') {
    acceptableAnswers.add(normalizeAnswer(rootNote + 'aug'));
    acceptableAnswers.add(normalizeAnswer(rootNote + 'augmented'));
    acceptableAnswers.add(normalizeAnswer(rootNote + '+'));
  }
  
  return acceptableAnswers;
};

/**
 * Add inversion variations to a base chord
 * @param {Set<string>} acceptableAnswers - Set to add variations to
 * @param {string} baseChord - Base chord string (e.g., "C", "Dm")
 * @param {string} inversionPart - Inversion part ("1", "2", "3", or null for root)
 * @param {string} rootNote - Root note for slash chord notation
 * @param {string} chordTypePart - Chord type part for bass note calculation
 * @param {boolean} requireInversionLabeling - Whether to include inversion-specific notation
 */
export const addInversionVariations = (acceptableAnswers, baseChord, inversionPart, rootNote, chordTypePart, requireInversionLabeling = false) => {
  // Always add the base chord without inversion notation
  acceptableAnswers.add(normalizeAnswer(baseChord));
  
  // Only add inversion-specific variations if inversion labeling is required
  if (requireInversionLabeling) {
    if (inversionPart === '1') {
      acceptableAnswers.add(normalizeAnswer(baseChord + '/1'));
      acceptableAnswers.add(normalizeAnswer(baseChord + '/first'));
      acceptableAnswers.add(normalizeAnswer(baseChord + ' first inversion'));
      acceptableAnswers.add(normalizeAnswer(baseChord + ' 1st inversion'));
      
      // Add slash chord notation (e.g., C/E for C major first inversion)
      const bassNote = getBassNoteForInversion(rootNote, chordTypePart, inversionPart);
      acceptableAnswers.add(normalizeAnswer(baseChord + '/' + bassNote));
    } else if (inversionPart === '2') {
      acceptableAnswers.add(normalizeAnswer(baseChord + '/2'));
      acceptableAnswers.add(normalizeAnswer(baseChord + '/second'));
      acceptableAnswers.add(normalizeAnswer(baseChord + ' second inversion'));
      acceptableAnswers.add(normalizeAnswer(baseChord + ' 2nd inversion'));
      
      // Add slash chord notation (e.g., C/G for C major second inversion)
      const bassNote = getBassNoteForInversion(rootNote, chordTypePart, inversionPart);
      acceptableAnswers.add(normalizeAnswer(baseChord + '/' + bassNote));
    } else if (inversionPart === '3') {
      acceptableAnswers.add(normalizeAnswer(baseChord + '/3'));
      acceptableAnswers.add(normalizeAnswer(baseChord + '/third'));
      acceptableAnswers.add(normalizeAnswer(baseChord + ' third inversion'));
      acceptableAnswers.add(normalizeAnswer(baseChord + ' 3rd inversion'));
      
      // Add slash chord notation (e.g., Cmaj7/B for C major 7 third inversion)
      const bassNote = getBassNoteForInversion(rootNote, chordTypePart, inversionPart);
      acceptableAnswers.add(normalizeAnswer(baseChord + '/' + bassNote));
    } else {
      // Root position - add root position variations
      acceptableAnswers.add(normalizeAnswer(baseChord + ' root'));
      acceptableAnswers.add(normalizeAnswer(baseChord + ' root position'));
    }
  }
};

/**
 * Calculate the bass note for a given chord inversion
 * @param {string} rootNote - Root note of the chord
 * @param {string} chordTypePart - Chord type part
 * @param {string} inversionPart - Inversion ("1", "2", "3")
 * @returns {string} Bass note for the inversion
 */
export const getBassNoteForInversion = (rootNote, chordTypePart, inversionPart) => {
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  
  // Determine chord type from chord part
  let intervals = [0, 4, 7]; // Default major triad
  
  if (chordTypePart === 'm' || chordTypePart === 'min' || chordTypePart === 'minor') {
    intervals = [0, 3, 7]; // Minor triad
  } else if (chordTypePart === 'dim' || chordTypePart === 'diminished') {
    intervals = [0, 3, 6]; // Diminished triad
  } else if (chordTypePart === 'aug' || chordTypePart === 'augmented') {
    intervals = [0, 4, 8]; // Augmented triad
  } else if (chordTypePart === 'maj7' || chordTypePart === 'major7') {
    intervals = [0, 4, 7, 11]; // Major 7th
  } else if (chordTypePart === 'm7' || chordTypePart === 'minor7') {
    intervals = [0, 3, 7, 10]; // Minor 7th
  } else if (chordTypePart === '7' || chordTypePart === 'dom7') {
    intervals = [0, 4, 7, 10]; // Dominant 7th
  } else if (chordTypePart === 'dim7') {
    intervals = [0, 3, 6, 9]; // Diminished 7th
  } else if (chordTypePart === 'm7b5' || chordTypePart === 'halfdiminished7') {
    intervals = [0, 3, 6, 10]; // Half diminished 7th
  }
  
  const rootIndex = noteNames.indexOf(rootNote);
  
  if (inversionPart === '1') {
    // First inversion: third in bass
    const bassInterval = intervals[1];
    return noteNames[(rootIndex + bassInterval) % 12];
  } else if (inversionPart === '2') {
    // Second inversion: fifth in bass
    const bassInterval = intervals[2];
    return noteNames[(rootIndex + bassInterval) % 12];
  } else if (inversionPart === '3') {
    // Third inversion: seventh in bass
    const bassInterval = intervals[3];
    return noteNames[(rootIndex + bassInterval) % 12];
  }
  
  return rootNote; // Root position
};

/**
 * Handle enharmonic equivalents in user input
 * @param {string} normalized - Normalized user input
 * @param {Set<string>} acceptableAnswers - Set of acceptable answers
 * @returns {boolean} True if enharmonic equivalent matches
 */
export const checkEnharmonicEquivalents = (normalized, acceptableAnswers) => {
  const enharmonicMap = {
    'c#': 'db', 'db': 'c#',
    'd#': 'eb', 'eb': 'd#', 
    'f#': 'gb', 'gb': 'f#',
    'g#': 'ab', 'ab': 'g#',
    'a#': 'bb', 'bb': 'a#'
  };
  
  // Check if user input has enharmonic equivalent that matches expected
  for (const [enharm1, enharm2] of Object.entries(enharmonicMap)) {
    if (normalized.includes(enharm1)) {
      const enharmonicVersion = normalized.replace(enharm1, enharm2);
      if (acceptableAnswers.has(enharmonicVersion)) {
        return true;
      }
    }
  }
  
  return false;
};